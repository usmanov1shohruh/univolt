/**
 * Merge Tokbor JSON feed into stations.seed.json used by the backend and frontend.
 *
 * Input:
 *   - backend/data/tokbor-stations.json  (array of raw Tokbor points)
 *   - backend/src/stations/stations.seed.json (existing unified stations list)
 *
 * Output (overwrites):
 *   - backend/src/stations/stations.seed.json  (pretty JSON for backend)
 *   - public/stations.json                     (compact JSON for frontend)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TOKBOR_INPUT = path.join(ROOT, 'data', 'tokbor-stations.json');
const SEED_INPUT = path.join(ROOT, 'src', 'stations', 'stations.seed.json');
const OUTPUT_SEED = SEED_INPUT;
const OUTPUT_PUBLIC = path.join(ROOT, '..', 'public', 'stations.json');

function roundCoord(n) {
  return Math.round(Number(n) * 1e6) / 1e6;
}

/**
 * Map Tokbor status → internal StationStatus.
 */
function mapTokborStatus(status) {
  switch (status) {
    case 'AVAILABLE':
      return 'available';
    case 'MAINTENANCE':
      return 'maintenance';
    case 'UNAVAILABLE':
    case 'EMERGENCY_STOP':
      return 'offline';
    default:
      return 'unknown';
  }
}

/**
 * Map Tokbor type → connectorTypes.
 */
function mapTokborConnectorTypes(type) {
  switch (type) {
    case 'AC':
      return ['Type2'];
    case 'DC':
      return ['CCS2'];
    case 'HYBRID':
      return ['CCS2', 'Type2'];
    case 'ULTRA':
      return ['CCS2'];
    default:
      return [];
  }
}

/**
 * Map single Tokbor point → Station shape used in stations.seed.json.
 */
function mapTokborPoint(raw) {
  const lat = roundCoord(raw.lat);
  const lon = roundCoord(raw.lng);

  return {
    id: `tokbor-${raw.id}`,
    source: 'tokbor',
    sourceStationId: String(raw.id),
    name: `Tokbor ${raw.id}`,
    address: 'Tokbor charging location',
    latitude: lat,
    longitude: lon,
    network: 'Tok Bor',
    connectorTypes: mapTokborConnectorTypes(raw.type),
    maxPowerKw: null,
    portsCount: null,
    status: mapTokborStatus(raw.status),
    openingHours: null,
    isDiscounted: Boolean(raw.discounted),
    hasTaxiDiscount: Boolean(raw.hasTaxiDiscount),
    iconLeft: Boolean(raw.icon && raw.icon.left),
    iconRight: Boolean(raw.icon && raw.icon.right),
    iconBottom:
      raw.icon && typeof raw.icon.bottom === 'boolean'
        ? raw.icon.bottom
        : null,
  };
}

function main() {
  if (!fs.existsSync(TOKBOR_INPUT)) {
    throw new Error(
      `Tokbor input file not found: ${path.relative(ROOT, TOKBOR_INPUT)}`,
    );
  }
  if (!fs.existsSync(SEED_INPUT)) {
    throw new Error(
      `Seed input file not found: ${path.relative(ROOT, SEED_INPUT)}`,
    );
  }

  const rawTokbor = fs.readFileSync(TOKBOR_INPUT, 'utf8');
  const tokborPoints = JSON.parse(rawTokbor);
  if (!Array.isArray(tokborPoints)) {
    throw new Error('Tokbor JSON must be an array');
  }

  const rawSeed = fs.readFileSync(SEED_INPUT, 'utf8');
  const seedStations = JSON.parse(rawSeed);
  if (!Array.isArray(seedStations)) {
    throw new Error('stations.seed.json must be an array');
  }

  // Build a coordinate-based index from existing stations to avoid duplicates.
  const seen = new Set();
  for (const s of seedStations) {
    const lat = roundCoord(s.latitude);
    const lon = roundCoord(s.longitude);
    seen.add(`${lat}|${lon}`);
  }

  const merged = [...seedStations];
  let added = 0;

  for (const raw of tokborPoints) {
    if (raw == null) continue;
    if (typeof raw.lat !== 'number' || typeof raw.lng !== 'number') continue;

    const lat = roundCoord(raw.lat);
    const lon = roundCoord(raw.lng);
    const key = `${lat}|${lon}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    merged.push(mapTokborPoint(raw));
    added += 1;
  }

  // Sort for determinism: by network, then name, then id.
  merged.sort(
    (a, b) =>
      String(a.network).localeCompare(String(b.network)) ||
      String(a.name).localeCompare(String(b.name)) ||
      String(a.id).localeCompare(String(b.id)),
  );

  const pretty = JSON.stringify(merged, null, 2) + '\n';
  const compact = JSON.stringify(merged) + '\n';

  fs.writeFileSync(OUTPUT_SEED, pretty, 'utf8');
  fs.mkdirSync(path.dirname(OUTPUT_PUBLIC), { recursive: true });
  fs.writeFileSync(OUTPUT_PUBLIC, compact, 'utf8');

  console.error(
    `Merged ${added} Tokbor stations into ${path.relative(
      ROOT,
      OUTPUT_SEED,
    )} and updated ${path.relative(ROOT, OUTPUT_PUBLIC)} (total: ${
      merged.length
    } stations).`,
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  mapTokborStatus,
  mapTokborConnectorTypes,
  mapTokborPoint,
  roundCoord,
};

