// Run: node libs/draw.check.mjs
import assert from "node:assert/strict";
import { draw, drawTiered, kidTiers } from "./draw.js";

const kids = kidTiers([
  { name: "A", oneAgo: "B", twoAgo: null, siblings: ["C"] },
  { name: "B", oneAgo: "C", twoAgo: null, siblings: [] },
  { name: "C", oneAgo: "D", twoAgo: null, siblings: ["A"] },
  { name: "D", oneAgo: "A", twoAgo: null, siblings: [] },
]);
const strict = kids[0].people;

for (let s = 1; s < 200; s++) {
  const r = draw(strict, s);
  assert.ok(r, `no draw for seed ${s}`);
  strict.forEach((p, i) => {
    assert.notEqual(r.recipients[i], p.name);
    assert.ok(!p.exclude.includes(r.recipients[i]));
  });
  assert.deepEqual(draw(strict, r.seed), r, "same seed must give same draw");
}

// Impossible: two people who each exclude the other.
assert.equal(draw([{ name: "X", exclude: ["Y"] }, { name: "Y", exclude: [] }], 1), null);

// Fallback: strict tier impossible, relaxed tier possible.
const tiers = [
  { rule: "strict", people: [{ name: "X", exclude: ["Y"] }, { name: "Y", exclude: [] }] },
  { rule: "relaxed", people: [{ name: "X", exclude: [] }, { name: "Y", exclude: [] }] },
];
assert.equal(drawTiered(tiers, 1).rule, "relaxed");
assert.equal(drawTiered([tiers[0]], 1), null);
console.log("draw checks pass");
