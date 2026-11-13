import seedrandom from "seedrandom";

// Max seeds to try before we report that no valid draw exists.
const MAX_ATTEMPTS = 20000;

// Seeded Fisher-Yates shuffle. Same seed + same names = same order.
function shuffle(names, seed) {
  const rng = seedrandom(String(seed));
  const out = [...names];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// people: [{ name, exclude: [names this person must not buy for] }]
// Tries seed, seed+1, ... and returns the first valid draw.
// Returns { seed, recipients } or null when nothing valid turns up.
// ponytail: brute-force retry, fine for ~10 people; use a matching solver if the list grows past ~25.
export function draw(people, startSeed) {
  const names = people.map((p) => p.name);
  const base = Number(startSeed) || 0;
  for (let n = 0; n < MAX_ATTEMPTS; n++) {
    const seed = base + n;
    const recipients = shuffle(names, seed);
    const valid = people.every(
      (p, i) => recipients[i] !== p.name && !p.exclude.includes(recipients[i])
    );
    if (valid) return { seed, recipients };
  }
  return null;
}

// A tier is one rule set: { rule: shown to the family, people }.
// drawTiered tries each tier in order and uses the first that has a valid draw.
export function drawTiered(tiers, startSeed) {
  for (const tier of tiers) {
    const r = draw(tier.people, startSeed);
    if (r) return { ...r, rule: tier.rule };
  }
  return null;
}

const withExclude = (rows, pick) =>
  rows.map((r) => ({ name: r.name, exclude: pick(r).filter(Boolean) }));

export function adultTiers(rows) {
  return [
    {
      rule: "Nobody draws themselves, their partner, or anyone they bought for in the last 3 years.",
      people: withExclude(rows, (r) => [r.oneAgo, r.twoAgo, r.threeAgo, r.partner]),
    },
  ];
}

// Kids prefer the 2-year rule and fall back to 1 year when no draw fits.
export function kidTiers(rows) {
  const siblings = (r) => r.siblings || [];
  return [
    {
      rule: "Nobody draws themselves, a sibling, or anyone they bought for in the last 2 years.",
      people: withExclude(rows, (r) => [r.oneAgo, r.twoAgo, ...siblings(r)]),
    },
    {
      rule: "Nobody draws themselves, a sibling, or the person they bought for last year. No draw fit the 2-year rule this time.",
      people: withExclude(rows, (r) => [r.oneAgo, ...siblings(r)]),
    },
  ];
}
