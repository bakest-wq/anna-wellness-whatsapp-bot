const { SERVICES } = require("./knowledge");

const ALIASES = [
  { id: "five", patterns: [/5\s*континент|пять\s*континент|континент(?!.*бамбук)/i] },
  { id: "five_fire", patterns: [/огн|отпен|fire/i] },
  { id: "five_bamboo", patterns: [/бамбук|банк/i] },
  { id: "mukaino", patterns: [/mukaino|m-test|мукайно/i] },
  { id: "breath", patterns: [/дыхат|тыныс/i] },
  { id: "earthflow", patterns: [/earth\s*flow|эртфлоу/i] },
  { id: "bars", patterns: [/access\s*bars|барс/i] }
];

function matchService(text) {
  const t = String(text || "");
  for (const alias of ALIASES) {
    if (alias.patterns.some((p) => p.test(t))) {
      const svc = SERVICES.find((s) => s.id === alias.id);
      if (svc) return svc.name;
    }
  }
  return null;
}

module.exports = { matchService };
