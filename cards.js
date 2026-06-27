const CARD_TYPES = {
  protocol: { symbol: "⟫", idPrefix: "PROTOCOL", costResource: "◈", tuckEdge: "right" },
  circuit: { symbol: "⟟", idPrefix: "CIRCUIT", costResource: "◈", tuckEdge: "top" },
  stabilizer: { symbol: "⟨⟩", idPrefix: "STABILIZER", costResource: "⬢", tuckEdge: "bottom" },
  state: { symbol: "⦿", idPrefix: "STATE", costResource: "◈", tuckEdge: "left" }
};

const pad = (value) => String(value).padStart(2, "0");

function protocol(id, name, minPotential, endGameValue, immediateEffect, requantize, decohere, quickEffect, cost, meta = {}) {
  return {
    id: `PROTOCOL-${pad(id)}`,
    type: "protocol",
    name,
    playCondition: { minPotential },
    endGameValue,
    immediateEffect,
    requantize,
    decohere,
    quickEffect,
    cost,
    ...meta
  };
}

function circuit(id, collection, name, upgradeEffect, cost, apexCost) {
  return {
    id: `CIRCUIT-${pad(id)}`,
    type: "circuit",
    collection,
    name,
    upgradeEffect,
    requantize: { amount: "1", symbol: "◈" },
    cost,
    apexCost
  };
}

function stabilizer(id, name, permanentEffect, endGameCollection, apexAmount, apexSymbol, requantizeAmount, lockEffect, cost) {
  return {
    id: `STABILIZER-${pad(id)}`,
    type: "stabilizer",
    name,
    permanentEffect,
    endGameCollection,
    apexEndGame: { amount: apexAmount, symbol: apexSymbol },
    requantize: { amount: requantizeAmount, symbol: "⧖" },
    lockEffect,
    cost
  };
}

function stateEndGameProtocol(id) {
  if (id >= 1 && id <= 4) return "≥1⬡ → +2⬢";
  if (id >= 5 && id <= 16) return "≥3⬡ → +5⬢";
  if (id >= 17 && id <= 24) return "≥4⬡ → +7⬢";
  if (id >= 25 && id <= 28) return "≥5⬡ → +8⬢";
  if (id >= 29 && id <= 35) return "≥6⬡ → +10⬢";
  if (id >= 36 && id <= 38) return "≥7⬡ → +13⬢";
  if (id >= 39 && id <= 40) return "≥8⬡ → +15⬢";
  return null;
}

function state(id, name, condition, apexCondition, requantize, decohere, endGameProtocol, decoherenceFlag, cost) {
  return {
    id: `STATE-${pad(id)}`,
    type: "state",
    name,
    condition,
    apexCondition,
    requantize,
    decohere,
    endGameProtocol: stateEndGameProtocol(id) || endGameProtocol,
    decoherenceFlag,
    cost
  };
}

const protocolCards = [
  protocol(1, "Micro-Phase Kick", "3", 1, "Apply Φ twice to one Ψ die.", { amount: "1", symbol: "◈" }, { amount: "W", symbol: "S", negative: false }, { amount: "2", symbol: "⬢", apexAmount: "+2", apexSymbol: "◈" }, "1"),
  protocol(2, "Proto-Entangle Burst", "3", 1, "Entangle ⊗ any Ψ dice into one group.", { amount: "1", symbol: "⬢" }, { amount: "W", symbol: "S", negative: false }, { amount: "2", symbol: "◈", apexAmount: "+2", apexSymbol: "⬢" }, "1"),
  protocol(3, "Zero-Flux Tap", "3", 1, "Gain +5◈.", { amount: "1", symbol: "◈" }, { amount: "W", symbol: "S", negative: false }, { amount: "2", symbol: "⬢", apexAmount: "+2", apexSymbol: "◈" }, "1"),
  protocol(4, "Pre-Collapse Decrease", "3", 1, "Decrease every outcome dice before collapse.", { amount: "1", symbol: "⬢" }, { amount: "W", symbol: "S", negative: false }, { amount: "2", symbol: "◈", apexAmount: "+2", apexSymbol: "⬢" }, "1"),
  protocol(5, "Soft Reroll Window", "3", 1, "Reroll all Outcome dice. This does not increase Instability.", { amount: "1", symbol: "◈" }, { amount: "W", symbol: "S", negative: false }, { amount: "2", symbol: "⬢", apexAmount: "+2", apexSymbol: "◈" }, "2"),
  protocol(6, "Boundary Stabilizer", "3", 1, "Choose one: remove 2 Instability OR reduce Decoherence by 1.", { amount: "1", symbol: "⬢" }, { amount: "W", symbol: "S", negative: false }, { amount: "2", symbol: "◈", apexAmount: "+2", apexSymbol: "⬢" }, "2"),
  protocol(7, "Ψ Image Pulse", "7", 1, "Copy the value of one Ψ die onto another Ψ die.", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "Δ", negative: true }, { amount: "2", symbol: "⬢", apexAmount: "-1", apexSymbol: "⧖" }, "2"),
  protocol(8, "Mini-Gate Override", "7", 1, "Reroll one Ψ and one outcome face.", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "Δ", negative: true }, { amount: "2", symbol: "⬢", apexAmount: "-1", apexSymbol: "⧖" }, "2"),
  protocol(9, "Collapse Redirect", "7", 1, "Choose one Ψ group. Treat it as part of a different group this collapse.", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "Δ", negative: true }, { amount: "2", symbol: "⬢", apexAmount: "-1", apexSymbol: "⧖" }, "2"),
  protocol(10, "Proto-Apex Surge", "7", 1, "If your Collapse Value is 4 or less, gain +10⬟ instead of normal rewards.", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "Δ", negative: true }, { amount: "2", symbol: "⬢", apexAmount: "-1", apexSymbol: "⧖" }, "2"),
  protocol(11, "Harmonic Shift", "7", 1, "Apply shift Φ once to each of two different dice.", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "Δ", negative: true }, { amount: "2", symbol: "⬢", apexAmount: "-1", apexSymbol: "⧖" }, "2"),
  protocol(12, "Tunneling Rewrite", "7", 1, "Apply one zero-occurrence to any Outcome die.", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "Δ", negative: true }, { amount: "2", symbol: "⬢", apexAmount: "-1", apexSymbol: "⧖" }, "2"),
  protocol(13, "Qubit Draw", "12", 1, "Gain +10◈.", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "Δ", negative: true }, { amount: "3", symbol: "⬢", apexAmount: "+3", apexSymbol: "◈" }, "2"),
  protocol(14, "Collapse Lens", "12", 1, "Before grouping, set the value of one Ψ die to 0, 1, 2, or 3.", { amount: "1", symbol: "⬢" }, { amount: "-1", symbol: "Δ", negative: true }, { amount: "3", symbol: "◈", apexAmount: "+3", apexSymbol: "⬢" }, "2"),
  protocol(15, "Dual-Entangle Spike", "12", 1, "Entangle ⊗ two separate pairs of Ψ dice.", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "Δ", negative: true }, { amount: "3", symbol: "⬢", apexAmount: "+3", apexSymbol: "◈" }, "3"),
  protocol(16, "Orange Field Surge", "12", 1, "Place one orange tile adjacent to a non-orange tile and conquer it.", { amount: "1", symbol: "⬢" }, { amount: "-1", symbol: "Δ", negative: true }, { amount: "3", symbol: "◈", apexAmount: "+3", apexSymbol: "⬢" }, "3"),
  protocol(17, "Forced Decoherence Drain", "12", 1, "Reduce Decoherence Δ by 2.", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "Δ", negative: true }, { amount: "3", symbol: "⬢", apexAmount: "+3", apexSymbol: "◈" }, "3"),
  protocol(18, "Gate Cascade", "12", 1, "Apply Synchronize ≡ to two Outcome dice.", { amount: "1", symbol: "⬢" }, { amount: "-1", symbol: "Δ", negative: true }, { amount: "3", symbol: "◈", apexAmount: "+3", apexSymbol: "⬢" }, "3"),
  protocol(19, "Collapse Harmonizer", "18", 2, "Double the value of your smallest Ψ group this collapse.", { amount: "1", symbol: "⬢" }, { amount: "-1", symbol: "⧖", negative: true }, { amount: "3", symbol: "◈", apexAmount: "-1", apexSymbol: "Δ" }, "4"),
  protocol(20, "Vector Resonance", "18", 2, "Move your Vector to any tile. If it is controlled by another player, conquer it.", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "⧖", negative: true }, { amount: "3", symbol: "⬢", apexAmount: "-1", apexSymbol: "Δ" }, "4"),
  protocol(21, "Ψ Echo Boost", "18", 2, "After all Shift effects, increase all Ψ outcomes by +1.", { amount: "1", symbol: "⬢" }, { amount: "-1", symbol: "⧖", negative: true }, { amount: "3", symbol: "◈", apexAmount: "-1", apexSymbol: "Δ" }, "4"),
  protocol(22, "Collapse Rewrite", "18", 2, "Set the value of any one die to match the value of another die.", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "⧖", negative: true }, { amount: "3", symbol: "⬢", apexAmount: "-1", apexSymbol: "Δ" }, "4"),
  protocol(23, "Quantum Fork", "18", 2, "Create a temporary Ψ/5 die. Discard it after this collapse.", { amount: "1", symbol: "⬢" }, { amount: "-1", symbol: "⧖", negative: true }, { amount: "3", symbol: "◈", apexAmount: "-1", apexSymbol: "Δ" }, "4"),
  protocol(24, "Ψ Null Barrier", "18", 2, "During this collapse, ignore all annihilations caused by equal group or outcome values.", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "⧖", negative: true }, { amount: "3", symbol: "⬢", apexAmount: "-1", apexSymbol: "Δ" }, "6"),
  protocol(25, "Phase Pulse", "25", 2, "After placing a tile, place one extra 1-green tile adjacent to it.", { amount: "1", symbol: "⬢" }, { amount: "-1", symbol: "⧖", negative: true }, { amount: "4", symbol: "◈", apexAmount: "+1", apexSymbol: "⧉" }, "6"),
  protocol(26, "Orange Flux Override", "25", 2, "This round, each orange tile you control produces +2⬟.", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "⧖", negative: true }, { amount: "4", symbol: "⬢", apexAmount: "+1", apexSymbol: "⧉" }, "6"),
  protocol(27, "Entropic Draw", "25", 2, "Choose one: reduce Decoherence by 3 OR remove 3 Instability.", { amount: "1", symbol: "⬢" }, { amount: "-1", symbol: "⧖", negative: true }, { amount: "4", symbol: "◈", apexAmount: "+1", apexSymbol: "⧉" }, "6"),
  protocol(28, "Collapse Supercharger", "25", 2, "Multiply the value of one Ψ group by ×2 this collapse.", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "⧖", negative: true }, { amount: "4", symbol: "⬢", apexAmount: "+1", apexSymbol: "⧉" }, "8"),
  protocol(29, "Field Shift", "25", 2, "Swap the positions of any two tiles you control, apply influence from both.", { amount: "1", symbol: "⬢" }, { amount: "-1", symbol: "⧖", negative: true }, { amount: "4", symbol: "◈", apexAmount: "+1", apexSymbol: "⧉" }, "8"),
  protocol(30, "Apex Burst", "25", 2, "If you hold the Apex marker, gain +10⬟ immediately.", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "⧖", negative: true }, { amount: "4", symbol: "⬢", apexAmount: "/", apexSymbol: "" }, "8"),
  protocol(31, "Quantum Rewrite", "32", 2, "Set all Ψ dice to any values of 3 or less after collapse.", { amount: "1", symbol: "⧉" }, { amount: "", symbol: "", negative: false }, { amount: "4", symbol: "⬢", apexAmount: "-2", apexSymbol: "⧖" }, "8"),
  protocol(32, "Collapse Singularity", "32", 2, "Choose one: triple your smallest Ψ group OR double your largest Ψ group.", { amount: "1", symbol: "⧉" }, { amount: "", symbol: "", negative: false }, { amount: "4", symbol: "⬢", apexAmount: "-2", apexSymbol: "⧖" }, "8"),
  protocol(33, "Gate Singularity", "32", 2, "All outcomes are zero. For every outcome add +1 to the total quantum value.", { amount: "1", symbol: "⧉" }, { amount: "", symbol: "", negative: false }, { amount: "4", symbol: "⬢", apexAmount: "-2", apexSymbol: "⧖" }, "8"),
  protocol(34, "Field Reorder", "32", 2, "Rearrange all tiles you control into any configuration.", { amount: "1", symbol: "⧉" }, { amount: "", symbol: "", negative: false }, { amount: "4", symbol: "⬢", apexAmount: "-2", apexSymbol: "⧖" }, "8"),
  protocol(35, "Ψ Overdrive Wave", "41", 3, "Before grouping, increase all Ψ results by +2.", { amount: "-1", symbol: "⧖" }, { amount: "+1", symbol: "⧉", negative: true }, { amount: "5", symbol: "⬢", apexAmount: "+2", apexSymbol: "⧉" }, "9"),
  protocol(36, "Red Field Overclock", "41", 3, "This round, each red tile you control produces +5⬟.", { amount: "-1", symbol: "⧖" }, { amount: "+1", symbol: "⧉", negative: true }, { amount: "5", symbol: "⬢", apexAmount: "+2", apexSymbol: "⧉" }, "9"),
  protocol(37, "Zero-Point Expansion", "41", 3, "Instead placing a green tile, place a Zero-Point Field.", { amount: "-1", symbol: "⧖" }, { amount: "+1", symbol: "⧉", negative: true }, { amount: "5", symbol: "⬢", apexAmount: "+2", apexSymbol: "⧉" }, "9"),
  protocol(38, "Apex Rewrite", "50", 3, "Take the Apex marker from any player.", { amount: "+1", symbol: "⧉" }, { amount: "+1", symbol: "⧉", negative: true }, { amount: "5", symbol: "⬢", apexAmount: "/", apexSymbol: "" }, "9"),
  protocol(39, "Ω Collapse Engine", "50", 3, "Multiply your Collapse Value by ×2.", { amount: "+1", symbol: "⧉" }, { amount: "+1", symbol: "⧉", negative: true }, { amount: "5", symbol: "⬢", apexAmount: "-3", apexSymbol: "⧖" }, "10"),
  protocol(40, "Final Quantum Command", "50", 3, "This round, tiles you control produce: violet +1⬟, green +2⬟, orange +3⬟, red +5⬟.", { amount: "+1", symbol: "⧉" }, { amount: "+1", symbol: "⧉", negative: true }, { amount: "5", symbol: "⬢", apexAmount: "-3", apexSymbol: "⧖" }, "10")
];

const protocolRevisions = {
  "PROTOCOL-01": { immediateEffect: "Action Phase: apply Φ twice to one free Ψ die before collapse.", timing: ["action"], effectId: "microPhaseKick" },
  "PROTOCOL-02": { immediateEffect: "Action Phase: entangle two free Ψ dice into one group.", timing: ["action"], effectId: "protoEntangleBurst" },
  "PROTOCOL-03": { immediateEffect: "Gain +5◈.", timing: ["any"], effectId: "gain5Qubits" },
  "PROTOCOL-04": { immediateEffect: "Before Collapse: decrease each outcome die in Collapse Pool by 1, minimum 0.", timing: ["action", "before-collapse"], effectId: "preCollapseDecrease" },
  "PROTOCOL-05": { immediateEffect: "After Roll: reroll all dice currently in Dice Pool. This does not increase Instability.", timing: ["action"], effectId: "softRerollWindow" },
  "PROTOCOL-06": { immediateEffect: "Choose one: remove 2 Instability or reduce Decoherence by 1.", timing: ["any"], effectId: "boundaryStabilizer" },
  "PROTOCOL-07": { immediateEffect: "Before Collapse: copy one assigned Ψ random value onto another Ψ die.", timing: ["before-collapse"], effectId: "psiImagePulse" },
  "PROTOCOL-08": { immediateEffect: "Action Phase: reroll one die in Dice Pool and one free Ψ/N die in Collapse Pool.", timing: ["action"], effectId: "miniGateOverride" },
  "PROTOCOL-09": { immediateEffect: "After Collapse: swap places of two Ψ free or grouped.", timing: ["collapsed"], effectId: "collapseRedirect" },
  "PROTOCOL-10": { immediateEffect: "After Collapse: if CV is 4 or less and not failed, gain +5⬢.", timing: ["collapsed", "post-placement"], effectId: "protoApexSurge" },
  "PROTOCOL-11": { immediateEffect: "Action Phase: apply Φ once to up to two different free Ψ dice.", timing: ["action"], effectId: "harmonicShift" },
  "PROTOCOL-12": { immediateEffect: "Action Phase: set one free outcome die to 0.", timing: ["action"], effectId: "tunnelingRewrite" },
  "PROTOCOL-13": { immediateEffect: "Gain +10◈.", timing: ["any"], effectId: "gain10Qubits" },
  "PROTOCOL-14": { immediateEffect: "Before Collapse: set one Ψ assigned value to 0, 1, 2, or 3.", timing: ["before-collapse"], effectId: "collapseLens" },
  "PROTOCOL-15": { immediateEffect: "Action Phase: create up to two separate Entangle groups using free Ψ dice.", timing: ["action"], effectId: "dualEntangleSpike" },
  "PROTOCOL-16": { immediateEffect: "After Tile Placement: if you placed non-orange scoring tile change it to 6 value orange tile.", timing: ["post-placement"], effectId: "orangeFieldSurge" },
  "PROTOCOL-17": { immediateEffect: "Reduce Decoherence by 2.", timing: ["any"], effectId: "decoherenceDrain2" },
  "PROTOCOL-18": { immediateEffect: "Action Phase: apply ≡ to two free outcome dice.", timing: ["action"], effectId: "gateCascade" },
  "PROTOCOL-19": { immediateEffect: "After Group Resolution: double one final green group value.", timing: ["collapsed"], effectId: "collapseHarmonizer" },
  "PROTOCOL-20": { immediateEffect: "After Collapse: move your Vector to any non-black surrounding tile, if it is enemy tile, conquer it.", timing: ["tile-placement", "post-placement"], effectId: "vectorResonance" },
  "PROTOCOL-21": { immediateEffect: "Before Collapse: increase all assigned Ψ values by +1, max 5.", timing: ["before-collapse"], effectId: "psiEchoBoost" },
  "PROTOCOL-22": { immediateEffect: "Before Collapse: set one die value equal to another die value of the same type.", timing: ["before-collapse"], effectId: "collapseRewrite" },
  "PROTOCOL-23": { immediateEffect: "Action Phase: add one temporary Ψ die to Collapse Pool. It is removed after End Turn.", timing: ["action"], effectId: "quantumFork" },
  "PROTOCOL-24": { immediateEffect: "During Collapse: ignore one duplicate green value or one duplicate red value for failure detection.", timing: ["action", "collapse-resolving", "collapsed"], effectId: "psiNullBarrier" },
  "PROTOCOL-25": { immediateEffect: "After Tile Placement: place one bonus green tile adjacent to your placed tile. It does not trigger influence.", timing: ["post-placement"], effectId: "phasePulse" },
  "PROTOCOL-26": { immediateEffect: "After Tile Placement: each orange tile you control gives +2⬢.", timing: ["post-placement"], effectId: "orangeFluxOverride" },
  "PROTOCOL-27": { immediateEffect: "Choose one: reduce Decoherence by 3 or remove 3 Instability.", timing: ["any"], effectId: "entropicDraw" },
  "PROTOCOL-28": { immediateEffect: "After Group Resolution: double one assigned Ψ value or one green group value, max 10.", timing: ["collapsed"], effectId: "collapseSupercharger" },
  "PROTOCOL-29": { immediateEffect: "After Tile Placement: swap two tiles you control. Do not re-trigger influence.", timing: ["post-placement"], effectId: "fieldShift" },
  "PROTOCOL-30": { immediateEffect: "After Collapse: if you hold Apex, gain +10⬢; otherwise gain +3⬢.", timing: ["collapsed", "post-placement"], effectId: "apexBurst" },
  "PROTOCOL-31": { immediateEffect: "Before Collapse: set up to three Ψ assigned values to any values from 0-3.", timing: ["before-collapse"], effectId: "quantumRewrite" },
  "PROTOCOL-32": { immediateEffect: "After Group Resolution: triple one green group value if it is 3 or less, or double it if it is 4 or more.", timing: ["collapsed"], effectId: "collapseSingularity" },
  "PROTOCOL-33": { immediateEffect: "Before Collapse: set all outcome dice to 0. For each outcome set this way, gain +1⬢.", timing: ["before-collapse"], effectId: "gateSingularity" },
  "PROTOCOL-34": { immediateEffect: "After Tile Placement: move up to three owned tiles to legal free hexes adjacent to your Vector. No influence trigger.", timing: ["post-placement"], effectId: "fieldReorder" },
  "PROTOCOL-35": { immediateEffect: "Before Collapse: increase all Ψ assigned values by +2, max 5. Then gain +1⧖.", timing: ["before-collapse"], effectId: "psiOverdriveWave" },
  "PROTOCOL-36": { immediateEffect: "After Tile Placement: each red tile you control gives +5⬢.", timing: ["post-placement"], effectId: "redFieldOverclock" },
  "PROTOCOL-37": { immediateEffect: "After Tile Placement: if you placed a green tile, you may change it to white. Gain no placement QP from that tile.", timing: ["post-placement"], effectId: "zeroPointExpansion" },
  "PROTOCOL-38": { immediateEffect: "After Collapse: if your CV is positive, take Apex.", timing: ["collapsed", "post-placement"], effectId: "apexRewrite" },
  "PROTOCOL-39": { immediateEffect: "After Group Resolution: double final CV for Apex-track purposes only. Tile color still uses original CV.", timing: ["collapsed"], effectId: "omegaCollapseEngine" },
  "PROTOCOL-40": { immediateEffect: "After Tile Placement: score controlled tiles: violet +1⬢, green +2⬢, orange +3⬢, red +5⬢.", timing: ["post-placement"], effectId: "finalQuantumCommand" }
};

protocolCards.forEach((card) => Object.assign(card, protocolRevisions[card.id] || {}));

const circuitCards = [
  circuit(1, "✸", "Quantum Drift", "Upgrade any action or qubit to Quantum Drift", "4", "2"),
  circuit(2, "✸", "Collapse Shield", "Upgrade any action or qubit to Collapse Shield", "4", "2"),
  circuit(3, "✸", "ReQuantize", "Upgrade any action or qubit to ReQuantize", "4", "2"),
  circuit(4, "✸", "Vector Jump", "Upgrade any action or qubit to Vector Jump", "5", "3"),
  circuit(5, "✸", "Instability Dampener", "Upgrade any action or qubit to Instability Dampener", "5", "3"),
  circuit(6, "✸", "Quantum Echo", "Upgrade any action or qubit to Quantum Echo", "5", "3"),
  circuit(7, "✸", "Resonance Link", "Upgrade any action or qubit to Resonance Link", "7", "5"),
  circuit(8, "✸", "Entropic Reset", "Upgrade any action or qubit to Entropic Reset", "7", "5"),
  circuit(9, "✸", "Quantum Wild", "Upgrade any action or qubit to Quantum Wild", "7", "5"),
  circuit(10, "✸", "Collapse Delay", "Upgrade any action or qubit to Collapse Delay", "9", "7"),
  circuit(11, "⊞", "Collapse -1 Suppressor", "Upgrade superposition to change outcome to -1 (down to max 0)", "4", "2"),
  circuit(12, "⊞", "Collapse -1 Suppressor", "Upgrade superposition to change outcome to -1 (down to max 0)", "4", "2"),
  circuit(13, "⊞", "Collapse -1 Suppressor", "Upgrade superposition to change outcome to -1 (down to max 0)", "4", "2"),
  circuit(14, "⊞", "Collapse -2 Suppressor", "Upgrade superposition to change outcome to -2 (down to max 0)", "5", "3"),
  circuit(15, "⊞", "Collapse -2 Suppressor", "Upgrade superposition to change outcome to -2 (down to max 0)", "5", "3"),
  circuit(16, "⊞", "Collapse -2 Suppressor", "Upgrade superposition to change outcome to -2 (down to max 0)", "5", "3"),
  circuit(17, "⊞", "Collapse -3 Suppressor", "Upgrade superposition to change outcome to -3 (down to max 0)", "7", "5"),
  circuit(18, "⊞", "Collapse -3 Suppressor", "Upgrade superposition to change outcome to -3 (down to max 0)", "7", "5"),
  circuit(19, "⊞", "Collapse -3 Suppressor", "Upgrade superposition to change outcome to -3 (down to max 0)", "7", "5"),
  circuit(20, "⊞", "Collapse Zero Suppressor", "Upgrade superposition to change outcome value to 0", "9", "7"),
  circuit(21, "⟁", "Collapse Operator Entanglement", "Upgrade ⊗ Entanglement", "5", "3"),
  circuit(22, "⟁", "Collapse Operator Resonate", "Upgrade ⇄ Resonate", "5", "3"),
  circuit(23, "⟁", "Collapse Operator Shift", "Upgrade Φ Shift", "4", "2"),
  circuit(24, "⟁", "Collapse Operator Conjugate", "Upgrade Ψ* Conjugate", "4", "2"),
  circuit(25, "⟁", "Collapse Operator Tunneling", "Upgrade ↯ Tunneling", "5", "3"),
  circuit(26, "⟁", "Collapse Operator Rephase", "Upgrade ≈ Rephase", "4", "2"),
  circuit(27, "⟁", "Collapse Operator Bind", "Upgrade ⧓ Bind", "5", "3"),
  circuit(28, "⟁", "Collapse Operator Nullify", "Upgrade ⊘ Nullify", "4", "2"),
  circuit(29, "⟁", "Collapse Operator Synchronize", "Upgrade ≡ Synchronize", "5", "3"),
  circuit(30, "⟁", "Collapse Operator Interfere", "Upgrade ⇌ Interfere", "5", "3"),
  circuit(31, "⧝", "Qubit Manifold 2", "Upgrade ◈ to 2◈", "4", "2"),
  circuit(32, "⧝", "Qubit Manifold 2", "Upgrade ◈ to 2◈", "4", "2"),
  circuit(33, "⧝", "Qubit Manifold 3", "Upgrade ◈ (or 2◈) to 3◈", "5", "3"),
  circuit(34, "⧝", "Qubit Manifold 3", "Upgrade ◈ (or 2◈) to 3◈", "5", "3"),
  circuit(35, "⧝", "Qubit Manifold 4", "Upgrade ◈ (or 2◈ / 3◈) to 4◈", "7", "5"),
  circuit(36, "⧝", "Qubit Manifold 4", "Upgrade ◈ (or 2◈ / 3◈) to 4◈", "7", "5"),
  circuit(37, "⧝", "Qubit Manifold 5", "Upgrade ◈ (or 2◈ / 3◈/ 4◈)) to 5◈", "9", "7"),
  circuit(38, "⧝", "Qubit Manifold 5", "Upgrade ◈ (or 2◈ / 3◈/ 4◈)) to 5◈", "9", "7"),
  circuit(39, "⧝", "Operator Manifold X", "Add ◈ for 1⬟ OR Upgrade 2◈/3◈/4◈/5◈ for 2⬟/3⬟/4⬟/5⬟", "4", "2"),
  circuit(40, "⧝", "Operator Manifold X", "Add ◈ for 1⬟ OR Upgrade 2◈/3◈/4◈/5◈ for 2⬟/3⬟/4⬟/5⬟", "4", "2")
];

const stabilizerCards = [
  stabilizer(1, "Minor Instability Buffer", "When your Collapse Value is greater than 6, remove 1 Instability.", "-1⧖/✸", "-2", "⧖", "-1", "+1◈/✸", "3"),
  stabilizer(2, "Harmonic Cushion", "Your first Continue each turn does not increase Instability.", "-1⧖/✸", "-2", "⧖", "-1", "+1◈/✸", "3"),
  stabilizer(3, "Ψ Slack Dampener", "If you collapse using exactly 1 Ψ die, remove 1 Instability.", "-1⧖/✸", "-2", "⧖", "-1", "+1◈/✸", "3"),
  stabilizer(4, "Entropy Guard", "Each turn, ignore the first Δ face you roll.", "+1⬢/⊞", "+5", "⬢", "-1", "+1◈/⊞", "3"),
  stabilizer(5, "Soft Collapse Net", "During collapse, choose 1 Ψ die. It does not flip after this collapse.", "+1⬢/⊞", "+5", "⬢", "-1", "+1◈/⊞", "3"),
  stabilizer(6, "Vector Safety Latch", "Once per turn, after placing a tile, you may move your Vector to any green tile you control.", "+1⬢/⊞", "+5", "⬢", "-1", "+1◈/⊞", "3"),
  stabilizer(7, "Oscillation Buffer", "If your Instability would increase by 2 or more during a turn, reduce that increase by 1.", "-1⧖/⟁", "-2", "⧖", "-1", "+1◈/⟁", "3"),
  stabilizer(8, "Collapse Softener", "When your Collapse Value is less than 3, remove 1 Instability.", "-1⧖/⟁", "-2", "⧖", "-1", "+1◈/⟁", "3"),
  stabilizer(9, "Δ-Negation Field", "Once per turn, you may reroll 1 Δ face.", "-1⧖/⟁", "-2", "⧖", "-1", "+1◈/⟁", "3"),
  stabilizer(10, "Field Strut", "When you conquer a tile, gain +5⬢.", "+1⬢/⧝", "+5", "⬢", "-1", "+1◈/⧝", "3"),
  stabilizer(11, "Proto-Stasis Shell", "Your first Continue each turn costs 1◈ instead of +1⧖.", "+1⬢/⧝", "+5", "⬢", "-1", "+1◈/⧝", "3"),
  stabilizer(12, "Greenfield Stabilizer", "When you place a green tile, remove 1 Instability.", "+1⬢/⧝", "+5", "⬢", "-1", "+1◈/⧝", "3"),
  stabilizer(13, "Flux Shield", "When you place a red tile, reduce Decoherence by 1.", "+1⬢/✸|⊞", "+3", "⬢", "-1", "+1◈/✸|⊞", "3"),
  stabilizer(14, "Stateful Resonator", "Once per turn, you may reroll 1 Outcome die.", "+1⬢/⟁|⧝", "+3", "⬢", "-1", "+1◈/⟁|⧝", "3"),
  stabilizer(15, "Ψ Preservation", "During collapse, choose up to 2 Ψ dice. They do not flip after this collapse.", "+1⬢/✸", "+5", "⬢", "-1", "+1⬢/✸", "4"),
  stabilizer(16, "Harmonic Nullifier", "When your Collapse Value is exactly 0, remove 2 Instability.", "-1⧖/✸", "-2", "⧖", "-1", "+1⬢/✸", "4"),
  stabilizer(17, "Momentum Damping Ring", "If you reroll 3 or more free dice during a turn, remove 1 Instability.", "-1⧖/⊞", "-2", "⧖", "-1", "+1⬢/⊞", "4"),
  stabilizer(18, "Anti-Δ Reflector", "Once per turn, you may resolve 1 Δ face as 1◈ instead of increasing Decoherence.", "+1⬢/⊞", "+5", "⬢", "-1", "+1⬢/⊞", "4"),
  stabilizer(19, "Ψ Lock Chamber", "Once per turn, you may reroll all non-Ψ dice.", "+1⬢/⟁", "+5", "⬢", "-1", "+1⬢/⟁", "4"),
  stabilizer(20, "Redfield Stabilizer", "Red tiles you control cannot be conquered.", "-1⧖/⟁", "-2", "⧖", "-1", "+1⬢/⟁", "4"),
  stabilizer(21, "Quantum Containment Bubble", "When you place a black tile, gain +3⬢.", "-1⧖/⧝", "-2", "⧖", "-1", "+1⬢/⧝", "4"),
  stabilizer(22, "Flux Vacuum Module", "If Decoherence would increase by 2 or more during your turn, reduce that increase by 1.", "+1⬢/⧝", "+5", "⬢", "-1", "+1⬢/⧝", "4"),
  stabilizer(23, "Entangle Stabilizer", "For each ⊗ or Resonance Link group in your collapse, remove 1 Instability.", "+1⬢/✸|⟁", "+3", "⬢", "-1", "+1⬢/✸|⟁", "4"),
  stabilizer(24, "Orange Lattice Shell", "When you place an orange tile, gain +2⬢.", "+1⬢/⊞|⧝", "+3", "⬢", "-1", "+1⬢/⊞|⧝", "4"),
  stabilizer(25, "Instability Purge", "When you collapse with CV 10 or higher, remove 2 Instability.", "+1⬢/✸", "+5", "⬢", "-1", "-1⧖/✸", "5"),
  stabilizer(26, "Negative Feedback Loop", "At the end of your turn, if your Instability increased by 2 or more this turn, remove 2 Instability.", "+1⬢/✸", "+5", "⬢", "-1", "-1⧖/✸", "5"),
  stabilizer(27, "Δ Dispersal Net", "Each turn, ignore up to 2 Δ faces you roll.", "+1⬢/⊞", "+5", "⬢", "-1", "-1⧖/⊞", "5"),
  stabilizer(28, "Instability Core", "You may spend 3◈ to remove 1 Instability.", "+1⬢/⊞", "+5", "⬢", "-1", "-1⧖/⊞", "5"),
  stabilizer(29, "Field Preservation Bubble", "When you place a Zero-Point Field, gain +3⬢.", "+1⬢/⟁", "+5", "⬢", "-1", "-1⧖/⟁", "5"),
  stabilizer(30, "Dimensional Anchor", "When you place a non-black tile, gain +1⬢.", "+1⬢/⟁", "+5", "⬢", "-1", "-1⧖/⟁", "5"),
  stabilizer(31, "Entropic Firewall", "Ignore all global Decoherence events.", "+1⬢/⧝", "+5", "⬢", "-1", "-1⧖/⧝", "5"),
  stabilizer(32, "Ψ Memory Loop", "After collapse, return 1 flipped Ψ die to its Ψ face.", "+1⬢/⧝", "+5", "⬢", "-1", "-1⧖/⧝", "5"),
  stabilizer(33, "Apex Barrier", "While you hold the Apex, your tiles cannot be conquered.", "+1⬢/2✸|⊞|⟁|⧝", "+3", "⬢", "-1", "-1⧖/2✸|⊞|⟁|⧝", "5"),
  stabilizer(34, "Perfect Equilibrium Core", "While you collapse with at least 2 Ψ dice, your Instability cannot exceed 20.", "-1⧖/✸", "-2", "⧖", "-2", "-1Δ/✸", "6"),
  stabilizer(35, "Absolute Nullifier", "If your current Collapse Value is positive, your Instability cannot exceed it.", "-1⧖/⊞", "-2", "⧖", "-2", "-1Δ/⊞", "6"),
  stabilizer(36, "Geometric Stasis Engine", "When you place any tile, gain +2◈.", "+1⬢/⟁", "+5", "⬢", "-2", "-1Δ/⟁", "6"),
  stabilizer(37, "Decoherence Flux Seal", "While you are the active player, Decoherence cannot advance onto a threshold event space.", "+1⬢/⧝", "+5", "⬢", "-2", "-1Δ/⧝", "6"),
  stabilizer(38, "Entanglement Chamber", "Entangled Ψ dice may remain entangled until your next turn.", "+1⬢/⟁|⊞", "+5", "⬢", "-2", "-1Δ/⟁|⊞", "6"),
  stabilizer(39, "Quantum Wall", "When an opponent conquers one of your tiles, gain +5⬢.", "+1⬢/✸|⧝", "+5", "⬢", "-2", "-1Δ/✸|⧝", "6"),
  stabilizer(40, "Δ Blackwall", "Reroll all Δ faces you roll.", "+1⬢/✸|⊞|⟁|⧝", "+5", "⬢", "-2", "-1Δ/2✸|⊞|⟁|⧝", "9")
];

const stateCards = [
  state(1, "Low-Energy Collapse", "Collapse Value is 3 or less", "Collapse Value is 6 or less", { amount: "1", symbol: "⬢" }, { amount: "1", symbol: "⧉", negative: true }, "⬢/⬡", ["green"], "2"),
  state(2, "Early Phase Harmony", "End collapse with at least 2 Ψ or Outcome dice in the Collapse Pool", "At least 1 Ψ or Outcome die in Collapse Pool", { amount: "1", symbol: "⬢" }, { amount: "1", symbol: "⧉", negative: true }, "⬢/⬡", ["green"], "2"),
  state(3, "Symmetric Drift", "Used any modifier action on a Ψ die this turn", "Used any modifier action this turn", { amount: "1", symbol: "⬢" }, { amount: "1", symbol: "⧉", negative: true }, "⬢/⬡", ["green"], "2"),
  state(4, "Gentle Entanglement", "Created a relation group with exactly 2 Ψ dice", "Created any relation group involving Ψ", { amount: "1", symbol: "⬢" }, { amount: "1", symbol: "⧉", negative: true }, "⬢/⬡", ["green"], "2"),
  state(5, "Minimal Decoherence", "No Δ faces were resolved this turn", "At least one Δ face was resolved this turn", { amount: "1", symbol: "⬢" }, { amount: "1", symbol: "⧉", negative: true }, "5⬢/3⬡", ["green"], "3"),
  state(6, "Proto-Cluster Spark", "Placed a green tile this turn", "Placed any non-black tile this turn", { amount: "1", symbol: "⬢" }, { amount: "1", symbol: "⧉", negative: true }, "5⬢/3⬡", ["green"], "3"),
  state(7, "Ψ Retention Protocol", "Collapsed using exactly 1 Ψ die", "Collapsed using at least 1 Ψ die", { amount: "1", symbol: "⬢" }, { amount: "1", symbol: "⧉", negative: true }, "5⬢/3⬡", ["green"], "3"),
  state(8, "Zero-Noise Window", "No action faces were used this turn", "At least one action face was used this turn", { amount: "1", symbol: "⬢" }, { amount: "1", symbol: "⧉", negative: true }, "5⬢/3⬡", ["green"], "3"),
  state(9, "Vacuum Stability", "End your turn with Instability 3 or less", "End your turn with Instability 6 or less", { amount: "1", symbol: "⬢" }, { amount: "1", symbol: "⧉", negative: true }, "5⬢/3⬡", ["green"], "3"),
  state(10, "Early Apex Resonance", "Held the Apex marker during your collapse", "Gain +5⬢ Immediately", { amount: "1", symbol: "⬢" }, { amount: "1", symbol: "⧉", negative: true }, "5⬢/3⬡", ["green"], "3"),
  state(11, "Superposition Drift", "End collapse with 3 or more Ψ dice involved", "At least 1 Ψ die involved", { amount: "1", symbol: "⬢" }, { amount: "1", symbol: "⧉", negative: true }, "5⬢/3⬡", ["green", "yellow"], "3"),
  state(12, "Fractal Collapse", "Collapse Value is 6 or less", "Collapse Value is 12 or less", { amount: "1", symbol: "⬢" }, { amount: "1", symbol: "⧉", negative: true }, "5⬢/3⬡", ["green", "yellow"], "3"),
  state(13, "Controlled Tunneling", "Created a mixed Ψ + Outcome group this turn", "Created any relation group this turn", { amount: "1", symbol: "⬢" }, { amount: "1", symbol: "⧉", negative: true }, "5⬢/3⬡", ["green", "yellow"], "3"),
  state(14, "Phase Lock", "All random Ψ collapse values were unique", "At least 2 random Ψ values were unique", { amount: "1", symbol: "⬢" }, { amount: "1", symbol: "⧉", negative: true }, "5⬢/3⬡", ["green", "yellow"], "3"),
  state(15, "Quantum Boundary", "Placed a tile on the edge of the Quantum Field", "Placed a tile anywhere on the map", { amount: "1", symbol: "⬢" }, { amount: "1", symbol: "⧉", negative: true }, "5⬢/3⬡", ["green", "yellow"], "3"),
  state(16, "Dual Collapse", "Collapsed using exactly 2 Ψ dice", "Collapsed using at least 1 Ψ die", { amount: "1", symbol: "⬢" }, { amount: "1", symbol: "⧉", negative: true }, "5⬢/3⬡", ["yellow"], "4"),
  state(17, "Stable Ψ Mesh", "Created a Ψ group of 3 or more dice", "Created any Ψ group", { amount: "1", symbol: "⬢" }, { amount: "1", symbol: "⧉", negative: true }, "7⬢/3⬡", ["yellow"], "4"),
  state(18, "Early Orange Surge", "Placed an orange tile this turn", "Placed a non-orange scoring tile this turn", { amount: "1", symbol: "⬢" }, { amount: "1", symbol: "⧉", negative: true }, "7⬢/3⬡", ["yellow"], "4"),
  state(19, "Entropy Tap", "Resolved 2 or more Δ faces this turn", "Resolved at least 1 Δ face this turn", { amount: "1", symbol: "⬢" }, { amount: "1", symbol: "⧉", negative: true }, "7⬢/3⬡", ["yellow"], "4"),
  state(20, "Field Echo", "Placed a tile adjacent to a Zero-Point Field", "Placed a tile adjacent to any non-black tile", { amount: "1", symbol: "⬢" }, { amount: "1", symbol: "⧉", negative: true }, "7⬢/3⬡", ["yellow"], "4"),
  state(21, "Ψ Convergence", "Collapse Value is between 7 and 10 (inclusive)", "Collapse Value is between 3 and 15 (inclusive)", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "⧖", negative: true }, "7⬢/3⬡", ["green", "yellow", "orange"], "4"),
  state(22, "Phase Cascade", "Used at least one modifier action this turn", "Used any action this turn", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "⧖", negative: true }, "7⬢/3⬡", ["green", "yellow", "orange"], "4"),
  state(23, "Resonant Collapse", "Collapsed using 4 or more Ψ dice", "Collapsed using 2 or more Ψ dice", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "⧖", negative: true }, "7⬢/3⬡", ["green", "yellow", "orange"], "4"),
  state(24, "Entropy Balance", "Used at least one relation action and one modifier action this turn", "Used at least two actions this turn", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "⧖", negative: true }, "7⬢/3⬡", ["yellow", "orange"], "4"),
  state(25, "Orange Field Network", "Control 3 or more orange tiles", "Control at least 1 orange tile", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "⧖", negative: true }, "3⬢/⬡", ["yellow", "orange"], "6"),
  state(26, "Geometric Continuum", "Vector moved into a cluster of 3 or more tiles", "Vector moved into a cluster of 2 or more tiles", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "⧖", negative: true }, "3⬢/⬡", ["yellow", "orange"], "6"),
  state(27, "Ψ Lattice", "Created two Ψ groups this turn", "Created one Ψ group this turn", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "⧖", negative: true }, "3⬢/⬡", ["orange"], "6"),
  state(28, "High-Energy State", "Used exactly two actions this turn", "Used at least one relation action", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "⧖", negative: true }, "3⬢/⬡", ["orange"], "6"),
  state(29, "Entropic Breakpoint", "Collapse Value is 12 or higher", "Collapse Value is 6 or higher", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "⧖", negative: true }, "4⬢/⬡", ["orange"], "6"),
  state(30, "Apex Fracture", "Held the Apex marker while collapsing with 3 or more Ψ dice", "Collapsed using at least 1 Ψ die", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "⧖", negative: true }, "4⬢/⬡", ["orange"], "8"),
  state(31, "Ψ Singularity", "All dice in the Collapse Pool were Ψ and/or Outcome dice, and no modifiers were used", "Gain +10⬢ immediately", { amount: "1", symbol: "◈" }, { amount: "", symbol: "", negative: false }, "4⬢/⬡", ["green", "yellow", "orange", "red"], "8"),
  state(32, "Final Harmonization", "Collapse Value is between 10 and 15 (inclusive)", "Collapse Value is between 5 and 20 (inclusive)", { amount: "1", symbol: "◈" }, { amount: "", symbol: "", negative: false }, "4⬢/⬡", ["green", "yellow", "orange", "red"], "8"),
  state(33, "Perfect Mesh", "All six dice are either collapsed Ψ or Outcome dice", "Gain +15⬢ immediately", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "Δ", negative: true }, "4⬢/⬡", ["yellow", "orange", "red"], "8"),
  state(34, "Phase Megadrive", "Used one relation and one modifier action", "Used one relation or one modifier action", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "Δ", negative: true }, "4⬢/⬡", ["yellow", "orange", "red"], "8"),
  state(35, "Red Line Breach", "Placed a red tile this turn", "Placed a non-red scoring tile this turn", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "Δ", negative: true }, "4⬢/⬡", ["orange", "red"], "8"),
  state(36, "Ultimate Resonance", "Control the strictly largest tile cluster on the board", "Gain +10⬢ immediately", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "Δ", negative: true }, "5⬢/⬡", ["orange", "red"], "9"),
  state(37, "Zero-Point Alignment", "Control strictly the most Zero-Point Field tiles", "Gain +10⬢ immediately", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "Δ", negative: true }, "5⬢/⬡", ["red"], "9"),
  state(38, "Collapse Apex", "Collapse Value is 15 or higher", "Collapse Value is 7 or higher", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "Δ", negative: true }, "5⬢/⬡", ["red"], "9"),
  state(39, "Entropic Horizon", "Decoherence is at 24 or higher", "Decoherence is at 12 or higher", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "Δ", negative: true }, "6⬢/⬡", ["red"], "10"),
  state(40, "Ω-State Realization", "Collapsed while holding the Apex marker, placed a red tile, and used at least 3 Ψ dice", "Gain +20⬢ immediately", { amount: "1", symbol: "◈" }, { amount: "-1", symbol: "Δ", negative: true }, "6⬢/⬡", ["red"], "10")
];

const cards = [...protocolCards, ...circuitCards, ...stabilizerCards, ...stateCards];

window.QuantumFluxCards = {
  CARD_TYPES,
  protocolCards,
  circuitCards,
  stabilizerCards,
  stateCards,
  cards
};
