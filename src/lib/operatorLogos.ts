type LogoMatch = {
  logoFile: string | null;
  aliases: string[];
};

function normalizeOperator(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[/()\\-_.]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Mapping is derived from `ev_network_logos_index.csv` inside `ev_network_logos_bundle.zip`.
// Only `logo_ready` entries have an icon file; `logo_missing` entries resolve to `null`.
const operatorLogos: LogoMatch[] = [
  {
    logoFile: 'tokbor.png',
    aliases: [
      'TOK BOR',
      'Tok Bor',
      'Tok Bor - Gibrid',
      'Tok bor',
      'Tok-Bor',
      'Tokbor',
      'Zaryadlash stantsiyasi Tok bor',
      'Tok-Bor',
    ],
  },
  {
    logoFile: 'megawatt_energy.png',
    aliases: ['Megavat Motors', 'Megawatt Energy', 'Megawatt Kinder Garten', 'Megawatt Motors', 'Megawatt energy'],
  },
  {
    logoFile: 'k_watt_q_watt.png',
    aliases: ['Bbt Q-watt', 'K -Watt', 'K Watt', 'K-watt', 'Kwatt', 'Quwatt', 'Q-watt', 'Quwatt'],
  },
  {
    logoFile: 'urban_power.png',
    aliases: ['Urban Power', 'Urban cars'],
  },
  {
    logoFile: 'spectre_energy.png',
    aliases: ['Spectre', 'Spectre Energy', 'Spectre energy'],
  },
  {
    logoFile: 'nd_charger.png',
    aliases: ['ND Charger', 'ND Group', 'Nd Charger', 'ND Charger'],
  },
  {
    logoFile: 'voltauto.png',
    aliases: ['Lakokraska Voltauto', 'Volt Auto', 'VoltAuto', 'VoltAuto, офис', 'Voltauto', 'VoltAuto, офис'],
  },
  {
    logoFile: 'protok.png',
    aliases: ['Pro-tok', 'Protok', 'Protok'],
  },
  {
    logoFile: 'trianon_energy.png',
    aliases: ['Trianon Energy'],
  },
  {
    logoFile: 'mustang_energy.png',
    aliases: ['Mustang', 'Mustang Energy'],
  },
  {
    logoFile: 'u_energy.png',
    aliases: ['U. Energy', 'UEnergy', 'UEnergy'],
  },
  {
    logoFile: 'energo.png',
    aliases: ['EnerGo', 'Energo'],
  },
  {
    logoFile: 'greente_tezroq.png',
    aliases: ['GreenTE', 'GreenTE quvvatlash stansiyasi', 'GreenTE/Tezroq', 'Tezroq', 'GreenTE / Tezroq', 'GreenTE Tezroq'],
  },
];

const normalizedToLogo = new Map<string, string>();
for (const item of operatorLogos) {
  if (!item.logoFile) continue;
  for (const alias of item.aliases) {
    normalizedToLogo.set(normalizeOperator(alias), item.logoFile);
  }
}

function tryFuzzyMatch(normalizedOperator: string): string | null {
  if (!normalizedOperator) return null;
  // Direct substring matching handles short canonical names like `ND`.
  for (const item of operatorLogos) {
    if (!item.logoFile) continue;
    for (const alias of item.aliases) {
      const nAlias = normalizeOperator(alias);
      if (!nAlias || nAlias.length < 3 || normalizedOperator.length < 2) continue;
      if (nAlias.includes(normalizedOperator)) return item.logoFile;
      if (normalizedOperator.includes(nAlias) && normalizedOperator.length >= nAlias.length) return item.logoFile;
    }
  }
  return null;
}

export function getOperatorLogoUrl(operator: string): string | null {
  const normalized = normalizeOperator(operator);
  if (!normalized) return null;

  const hit = normalizedToLogo.get(normalized);
  if (hit) return `/operator-logos/icons_128/${hit}`;

  const fuzzy = tryFuzzyMatch(normalized);
  if (fuzzy) return `/operator-logos/icons_128/${fuzzy}`;

  return null;
}

export function getOperatorLogoLetter(operator: string): string {
  const s = operator?.trim();
  if (!s) return '?';
  // Prefer first ASCII letter/number; fallback to first character.
  const m = s.match(/[a-z0-9]/i);
  return (m ? m[0] : s[0]).toUpperCase();
}

