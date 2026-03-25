/**
 * ETL: backend/data/parsed-stations.tsv → backend/src/stations/stations.seed.json + public/stations.json
 * Dedupe by rounded lat/lon; normalize operator (network); map hours column → openingHours;
 * API availability status is always unknown (source data column is operational hours, not occupancy).
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const INPUT = path.join(ROOT, 'data', 'parsed-stations.tsv');
const OUTPUT = path.join(ROOT, 'src', 'stations', 'stations.seed.json');
const OUTPUT_PUBLIC = path.join(ROOT, '..', 'public', 'stations.json');

function stableId(lat, lon, network) {
  const h = crypto
    .createHash('sha256')
    .update(`${network}|${lat}|${lon}`, 'utf8')
    .digest('hex')
    .slice(0, 16);
  return `uz-parsed-${h}`;
}

function roundCoord(n) {
  return Math.round(Number(n) * 1e6) / 1e6;
}

function mapOpeningHours(rawStatus) {
  if (rawStatus == null) return null;
  const s = String(rawStatus).trim();
  if (!s) return null;
  const lower = s.toLowerCase();
  if (/kun-u\s*tun|kun u tun/i.test(s)) return '24/7';
  if (/ish\s*soatlari/i.test(lower) || /ko‘rsatilmagan|ko\u2018rsatilmagan|ko'rsatilmagan/i.test(lower))
    return null;
  if (/boshqa\s*joyga\s*ko['']?chdi/i.test(lower)) return null;
  return s;
}

function shouldSkipRow(hoursRaw) {
  if (hoursRaw == null) return false;
  const s = String(hoursRaw).trim();
  const lower = s.toLowerCase();
  return /tashkilot\s+boshqa\s+joyga\s+ko['']?chdi/i.test(lower);
}

function canonicalNetwork(name) {
  const s = name.trim();
  const l = s.toLowerCase();

  if (/megawatt\s+motors/i.test(s) || /megavat\s+motors/i.test(s)) return 'Megawatt Motors';
  if (/megawatt|megavat/i.test(l)) return 'Megawatt Energy';
  if (/zaryadlash\s+stantsiyasi\s+tok/i.test(l)) return 'Tok Bor';
  if (/tok\s*[-]?\s*bor|tokbor|\btokbor\b/i.test(l)) return 'Tok Bor';
  if (/spectre/i.test(l)) return 'Spectre Energy';
  if (/k\s*[-]?\s*watt|^kwatt$|k-watt|^k -watt$/i.test(s)) return 'K Watt';
  if (/\bbebb\b|\bebb\b|\bebb\s+charg/i.test(l)) return 'Ebb';
  if (/volt\s*auto|voltauto/i.test(l)) return 'Voltauto';
  if (/greente|tezroq/i.test(l)) return 'GreenTE / Tezroq';
  if (/u\.?\s*energy|uenergy/i.test(l)) return 'UEnergy';
  if (/\bnd\b|\bnd\s+(group|charger)/i.test(s)) return 'ND';
  if (/telecom/i.test(l)) return 'Telecom Charge';
  if (/quwatt/i.test(l)) return 'Quwatt';
  if (/mustang/i.test(l)) return 'Mustang Energy';
  if (/trianon/i.test(l)) return 'Trianon Energy';
  if (/energo/i.test(l)) return 'EnerGo';
  if (/urban/i.test(l)) return 'Urban Power';
  if (/\bbeon\b/i.test(l)) return 'Beon';
  if (/protok|pro-tok/i.test(l)) return 'Protok';
  if (/\bzty\b/i.test(l)) return 'ZTY';
  if (/gigawatt/i.test(l)) return 'Gigawatt';
  if (/my\s*tok/i.test(l)) return 'My Tok';
  if (/bbt\s*q|q-watt/i.test(l)) return 'Q-watt';
  if (/^nd\s*charger|^nd\s*group/i.test(l)) return 'ND';
  if (/\bquvvatlash\s+stansiyasi\b/i.test(s) && !/greente/i.test(l)) return 'Unknown';
  if (/zaryadlash|quvvatlash|elektr|elektromobil|зарядн|elektromobillar/i.test(l)) return 'Unknown';

  const first = s.split(/[/(/]/)[0].trim();
  return first || 'Unknown';
}

function inferConnectorTypes(textA, textB) {
  const text = `${textA ?? ''} ${textB ?? ''}`.toLowerCase();
  const out = new Set();

  if (/\bccs2\b/.test(text)) out.add('CCS2');
  if (/\bchademo\b/.test(text) || /\bcha\-?de\-?mo\b/.test(text)) out.add('CHAdeMO');
  if (/\btype2\b/.test(text) || /\btype\s*2\b/.test(text)) out.add('Type2');
  if (/\bgb\/?t\b/.test(text) || /\bgbt\b/.test(text)) out.add('GB/T');

  // Backend doesn't have J1772, so map it to "Other" (still contract-valid).
  if (/\bj1772\b/.test(text)) out.add('Other');

  return Array.from(out);
}

function inferMaxPowerKw(textA, textB) {
  const text = `${textA ?? ''} ${textB ?? ''}`.toLowerCase();
  const m = text.match(/(\d+(?:\.\d+)?)\s*(kw|квт)\b/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  // Keep integers for simpler downstream UX.
  return Math.round(n);
}

function inferPortsCount(textA, textB) {
  const text = `${textA ?? ''} ${textB ?? ''}`.toLowerCase();
  const m = text.match(/(\d+)\s*(ports?|порт(?:а|ов)?)\b/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.round(n));
}

function parseTsv(content) {
  const lines = content.split(/\r?\n/).filter((ln) => ln.trim().length);
  if (!lines.length) return [];
  const header = lines[0].split('\t');
  if (header[0] !== 'name')
    throw new Error(`Unexpected header: ${lines[0].slice(0, 80)}`);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    if (parts.length < 5) continue;
    const lat = parseFloat(parts[parts.length - 2]);
    const lon = parseFloat(parts[parts.length - 1]);
    const statusCol = parts[parts.length - 3];
    const address = parts[parts.length - 4];
    const name = parts.slice(0, parts.length - 4).join('\t') || parts[0];
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    rows.push({ name: name.trim(), address: (address || '').trim(), hoursRaw: statusCol, lat, lon });
  }
  return rows;
}

function main() {
  const raw = fs.readFileSync(INPUT, 'utf8');
  const parsed = parseTsv(raw);
  const seen = new Set();
  const out = [];

  for (const row of parsed) {
    if (shouldSkipRow(row.hoursRaw)) continue;

    const lat = roundCoord(row.lat);
    const lon = roundCoord(row.lon);
    const network = canonicalNetwork(row.name);
    const key = `${lat}|${lon}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const openingHours = mapOpeningHours(row.hoursRaw);
    const connectorTypes = inferConnectorTypes(row.name, row.address);
    const maxPowerKw = inferMaxPowerKw(row.name, row.address);
    const portsCount = inferPortsCount(row.name, row.address);

    out.push({
      id: stableId(lat, lon, network),
      name: row.name,
      address: row.address,
      latitude: lat,
      longitude: lon,
      network,
      connectorTypes,
      maxPowerKw,
      portsCount,
      status: 'unknown',
      openingHours,
    });
  }

  out.sort((a, b) => a.network.localeCompare(b.network) || a.name.localeCompare(b.name));

  const pretty = JSON.stringify(out, null, 2) + '\n';
  const compact = JSON.stringify(out) + '\n';
  fs.writeFileSync(OUTPUT, pretty, 'utf8');
  fs.mkdirSync(path.dirname(OUTPUT_PUBLIC), { recursive: true });
  fs.writeFileSync(OUTPUT_PUBLIC, compact, 'utf8');
  console.error(
    `Wrote ${out.length} stations to ${path.relative(ROOT, OUTPUT)} + ${path.relative(ROOT, OUTPUT_PUBLIC)} (from ${parsed.length} parsed rows)`,
  );
}

main();
