const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = __dirname;
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, "cards.js"), "utf8"), context);
const cardData = context.window.QuantumFluxCards;

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const resource = (effect) => {
  if (!effect || (!effect.amount && !effect.symbol)) return "—";
  const amount = String(effect.amount || "");
  const sign = amount && !/^[+\-/]/.test(amount) ? "+" : "";
  return `${sign}${amount}${effect.symbol || ""}`;
};

const flags = (colors = []) => colors.map((color) => `<span class="flag ${color}">${color[0].toUpperCase()}</span>`).join("");

function protocolCard(card) {
  const quick = card.quickEffect
    ? `${resource({ amount: card.quickEffect.amount, symbol: card.quickEffect.symbol })}${card.quickEffect.apexAmount && card.quickEffect.apexAmount !== "/" ? `; Apex ${resource({ amount: card.quickEffect.apexAmount, symbol: card.quickEffect.apexSymbol })}` : ""}`
    : "—";
  return `<article class="card-ref protocol-ref"><header><strong>${esc(card.id)}</strong><span>${"⬡".repeat(Number(card.endGameValue) || 0)}</span></header><h4>${esc(card.name)}</h4><dl>
    <dt>Play</dt><dd>At least ${esc(card.playCondition?.minPotential)}⬢; cost ${esc(card.cost)}◈</dd>
    <dt>Immediate</dt><dd>${esc(card.immediateEffect)}</dd>
    <dt>Quick</dt><dd>${esc(quick)}</dd>
    <dt>Utility</dt><dd>⟲ ${esc(resource(card.requantize))}${card.decohere?.negative !== false ? ` · ≋ ${esc(resource(card.decohere))}` : ""}</dd>
  </dl></article>`;
}

function circuitCard(card) {
  return `<article class="card-ref circuit-ref"><header><strong>${esc(card.id)}</strong><span>${esc(card.collection)}</span></header><h4>${esc(card.name)}</h4><dl>
    <dt>Upgrade</dt><dd>${esc(card.upgradeEffect)}</dd>
    <dt>Cost</dt><dd>${esc(card.cost)}◈ · Apex ${esc(card.apexCost)}◈</dd>
    <dt>Utility</dt><dd>⟲ ${esc(resource(card.requantize))}</dd>
  </dl></article>`;
}

function stabilizerCard(card) {
  return `<article class="card-ref stabilizer-ref"><header><strong>${esc(card.id)}</strong><span>⟨⟩</span></header><h4>${esc(card.name)}</h4><dl>
    <dt>Permanent</dt><dd>${esc(card.permanentEffect)}</dd>
    <dt>End game</dt><dd>⧗ ${esc(card.endGameCollection)} · Apex ${esc(resource(card.apexEndGame))}</dd>
    <dt>Lock</dt><dd>🔒 ${esc(card.lockEffect)}</dd>
    <dt>Cost</dt><dd>${esc(card.cost)}⬢ · ⟲ ${esc(resource(card.requantize))}</dd>
  </dl></article>`;
}

function stateCard(card) {
  return `<article class="card-ref state-ref"><header><strong>${esc(card.id)}</strong><span>${flags(card.decoherenceFlag)}</span></header><h4>${esc(card.name)}</h4><dl>
    <dt>Condition</dt><dd>${esc(card.condition)}</dd>
    <dt>Apex</dt><dd>${esc(card.apexCondition)}</dd>
    <dt>Coherence</dt><dd>⧗ ${esc(card.endGameProtocol)}</dd>
    <dt>Cost</dt><dd>${esc(card.cost)}◈ · ⟲ ${esc(resource(card.requantize))}${card.decohere?.negative !== false ? ` · ≋ ${esc(resource(card.decohere))}` : ""}</dd>
  </dl></article>`;
}

const actionRows = [
  ["⊗", "Entangle", "Relation", "2 Ψ", "Choose 2N₁ or 2N₂"],
  ["⇄", "Resonate", "Relation", "2 Ψ", "Choose N₁ + N₂ or |N₁ − N₂|"],
  ["↯", "Tunneling", "Relation", "1 Ψ + 1 outcome", "Green max(N₁,N₂) and red min(N₁,N₂)"],
  ["⧓", "Bind", "Relation", "1 Ψ + 1 outcome", "Green becomes outcome; red becomes 0"],
  ["≡", "Synchronize", "Relation", "2 outcomes", "Red min(N₁,N₂)"],
  ["⇌", "Interfere", "Relation", "2 outcomes", "Red |N₁ − N₂|"],
  ["Φ", "Shift", "Modifier", "1 Ψ", "Choose N−1, N, or N+1"],
  ["Ψ*", "Conjugate", "Modifier", "1 Ψ", "Choose N or 5−N"],
  ["≈", "Rephase", "Modifier", "1 outcome", "Choose red N or 5−N"],
  ["⊘", "Nullify", "Modifier", "1 outcome", "Result 0"]
];

const advancedRows = [
  ["Ψ|N", "Quantum Drift", "Swap the semantic values of one free Ψ and one free outcome."],
  ["⛉", "Collapse Shield", "The next Continue costs no Instability."],
  ["↻", "ReQuantize", "Change one free outcome into a proper Ψ."],
  ["⇗", "Vector Jump", "Move Vector to an adjacent owned or black tile."],
  ["⧖", "Instability Dampener", "Reduce Instability by 1."],
  ["ΨΨ", "Quantum Echo", "Attach to Ψ; result is twice its value."],
  ["∞", "Resonance Link", "Group all free Ψ; choose twice one value."],
  ["Ø", "Entropic Reset", "Flip a Collapse Pool die to another face."],
  ["★", "Quantum Wild", "Flexible Ψ or outcome modifier."],
  ["~", "Collapse Delay", "Score or delay a Ψ; delayed Ψ stays uncollapsed."],
  ["Ψ −1/−2/−3/0⊟", "Suppressors", "Ψ that stores a reduced or zero outcome after collapse."],
  ["Extra actions", "Circuit upgrades 21–30", "Stronger versions of the ten basic actions."],
  ["2◈–5◈", "Qubit Manifolds", "Automatic upgraded qubit income."],
  ["Manifold X", "Operator Manifold", "Convert an action to qubits or raise a qubit tier by paying QP."]
];

const tableRows = (rows) => rows.map((row) => `<tr>${row.map((cell, index) => `<${index === 0 ? "th" : "td"}>${cell}</${index === 0 ? "th" : "td"}>`).join("")}</tr>`).join("");
const cardSection = (title, symbol, cards, renderer, className) => `<section class="chapter appendix ${className}"><div class="chapter-heading"><span>${symbol}</span><div><p>Complete Card Reference</p><h2>${title}</h2></div></div><div class="card-grid">${cards.map(renderer).join("")}</div></section>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Quantum Flux — Complete Rulebook</title><style>
@page { size: A4; margin: 14mm 15mm 16mm; }
@page:first { margin: 0; }
* { box-sizing: border-box; }
html { color-scheme: light; }
body { margin:0; color:#172232; background:#fff; font-family:"Segoe UI",Arial,sans-serif; font-size:9.3pt; line-height:1.45; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
h1,h2,h3,h4,p { margin-top:0; } h2 { font-size:21pt; color:#17233a; } h3 { margin-bottom:5px; font-size:13pt; color:#17233a; } h4 { margin-bottom:3px; font-size:10pt; }
p { margin-bottom:7px; } ul,ol { margin:5px 0 9px; padding-left:20px; } li { margin-bottom:3px; }
.cover { height:297mm; position:relative; overflow:hidden; page-break-after:always; background:#030712 url('assets/QuantumFlux.png') center/cover no-repeat; color:#fff; }
.cover:after { content:""; position:absolute; inset:0; background:linear-gradient(180deg,rgba(1,5,15,.05) 44%,rgba(1,4,12,.92) 100%); }
.cover-copy { position:absolute; z-index:2; left:18mm; right:18mm; bottom:19mm; }
.cover-kicker { color:#8bd8ff; text-transform:uppercase; letter-spacing:3px; font-weight:800; }
.cover h1 { margin:6px 0 2px; font-size:40pt; letter-spacing:4px; line-height:1; }
.cover h2 { margin:0 0 12px; color:#d9b1ff; font-size:18pt; font-weight:500; }
.cover-meta { display:flex; justify-content:space-between; padding-top:12px; border-top:1px solid rgba(255,255,255,.35); color:#d9e8f7; }
.chapter { page-break-before:always; }
.front { page-break-before:auto; }
.chapter-heading { display:flex; align-items:center; gap:12px; margin:0 0 13px; padding:9px 12px; border-left:5px solid #8a47d1; background:linear-gradient(90deg,#edf4fb,#fff); }
.chapter-heading>span { display:grid; place-items:center; width:38px; height:38px; border-radius:6px; background:#111a28; color:#b9efff; font-size:21px; }
.chapter-heading p { margin:0; color:#62748b; text-transform:uppercase; letter-spacing:1.4px; font-size:7.5pt; font-weight:800; }
.chapter-heading h2 { margin:0; }
.lead { font-size:11pt; color:#3a4b62; }
.columns { columns:2; column-gap:18px; } .keep { break-inside:avoid; }
.toc { display:grid; grid-template-columns:1fr 1fr; gap:8px 22px; padding:0; list-style:none; counter-reset:toc; }
.toc li { display:flex; gap:7px; padding-bottom:5px; border-bottom:1px dotted #b8c3cf; } .toc li:before { counter-increment:toc; content:counter(toc,decimal-leading-zero); color:#8a47d1; font-weight:900; }
.callout { break-inside:avoid; margin:9px 0; padding:9px 11px; border:1px solid #b5cddd; border-left:4px solid #1fa2c5; border-radius:5px; background:#f0f8fb; }
.warning { border-color:#dfb2b3; border-left-color:#bd3038; background:#fff4f3; }
.formula { padding:8px 10px; border-radius:5px; background:#111b2a; color:#fff; font-family:Consolas,monospace; font-size:9pt; }
.flow { display:grid; grid-template-columns:repeat(5,1fr); gap:5px; margin:12px 0; }
.flow div { position:relative; padding:9px 5px; text-align:center; color:#fff; background:#18314c; font-weight:800; }
.flow div:not(:last-child):after { content:"›"; position:absolute; right:-7px; z-index:2; color:#72e7ff; font-size:17px; top:4px; }
.resource-grid,.tile-grid,.mode-grid,.score-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; }
.resource,.tile,.mode-card,.score-card { break-inside:avoid; padding:9px; border:1px solid #cbd4dd; border-radius:6px; background:#fbfcfd; }
.resource strong,.tile strong { color:#19273a; }
.gem { display:inline-grid; place-items:center; width:20px; height:20px; border-radius:50%; color:#fff; font-weight:900; background:#111; }
.violet{background:#7434a8}.white{background:#fff;color:#111;border:1px solid #788}.green{background:#24783b}.orange{background:#d47117}.red{background:#a92932}.black{background:#101010}.blue{background:#246bb1}.yellow{background:#d0a714}
table { width:100%; border-collapse:collapse; margin:7px 0 12px; font-size:8.5pt; } th,td { padding:5px 6px; border:1px solid #c9d2db; text-align:left; vertical-align:top; } thead th { background:#18283a; color:#fff; } tbody th { width:12%; background:#edf2f6; color:#17273b; }
.anatomy { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin:10px 0; }.anatomy figure { margin:0; break-inside:avoid; }.anatomy img { width:100%; aspect-ratio:2/3; object-fit:contain; background:#05070b; border-radius:7px; }.anatomy figcaption { margin-top:4px; font-size:8pt; text-align:center; font-weight:700; }
.quick-ref { page-break-before:always; padding:10mm; border:2px solid #17273b; }
.appendix { font-size:8.2pt; }.card-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }.card-ref { break-inside:avoid; padding:7px 8px; border:1px solid #bdc8d3; border-radius:5px; background:#fff; box-shadow:0 1px 0 rgba(0,0,0,.04); }.card-ref header { display:flex; justify-content:space-between; align-items:center; padding-bottom:3px; border-bottom:1px solid #d7dee5; color:#65758a; font-size:7pt; }.card-ref h4 { margin:4px 0; }.card-ref dl { display:grid; grid-template-columns:49px 1fr; gap:2px 5px; margin:0; }.card-ref dt { color:#64768a; font-size:7pt; font-weight:800; text-transform:uppercase; }.card-ref dd { margin:0; }.protocol-ref{border-left:4px solid #e17d24}.circuit-ref{border-left:4px solid #3ea83b}.stabilizer-ref{border-left:4px solid #777}.state-ref{border-left:4px solid #35a9d0}
.flag { display:inline-grid; place-items:center; width:14px; height:14px; margin-left:2px; border-radius:2px; color:#111; font-size:6pt; font-weight:900; }.flag.green{background:#75ef7e}.flag.yellow{background:#ffe45c}.flag.orange{background:#ff9f35}.flag.red{background:#ff5e68}
.footer-note { margin-top:15px; color:#63748a; font-size:8pt; }
.copyright { page-break-before:always; display:grid; place-items:center; min-height:240mm; text-align:center; }.copyright img { width:70mm; border-radius:18px; }.copyright p { max-width:120mm; }
</style></head><body>

<section class="cover"><div class="cover-copy"><div class="cover-kicker">Complete Digital Prototype Rulebook</div><h1>QUANTUM FLUX</h1><h2>Control Uncertainty. Shape the Collapse.</h2><div class="cover-meta"><span>2–4 Players · Strategic Dice & Field Control</span><span>Prototype Edition · June 2026</span></div></div></section>

<section class="chapter front"><div class="chapter-heading"><span>Ψ</span><div><p>Orientation</p><h2>Welcome to Quantum Flux</h2></div></div>
<p class="lead">Humanity has learned not only to observe quantum reality, but to shape it. Each player operates an unstable reactor, engineering superpositions, outcomes, relations, and collapse events to reshape the shared Quantum Field.</p>
<p>Your objective is to finish with the highest total <strong>Quantum Potential (⬢)</strong>. QP is gained primarily from the field you create, supported by card engines and end-game scoring. The game ends when global Decoherence reaches its final space; finish the current round, then score.</p>
<div class="callout"><strong>Golden rule.</strong> Card text and prompted digital effects override the general rules. If an effect cannot complete, resolve as much as legally possible.</div>
<h3>Contents</h3><ol class="toc"><li>Game Concepts</li><li>Components</li><li>Setup & Modes</li><li>Screen and Board Anatomy</li><li>Turn Structure</li><li>Dice & Actions</li><li>Collapse Resolution</li><li>Apex & Player Order</li><li>Tile Placement</li><li>Field Scoring & Influence</li><li>Decoherence</li><li>Instability & Stabilizers</li><li>Cards</li><li>End Game & Scoring</li><li>Quick Reference</li><li>Complete Card Appendix</li></ol>
<h3>Core Symbols</h3><div class="resource-grid"><div class="resource"><strong>⬢ Quantum Potential</strong><br>Victory points; also spent to play Stabilizers.</div><div class="resource"><strong>◈ Qubits</strong><br>Resource used for Protocols, Circuits, and States.</div><div class="resource"><strong>⧖ Instability</strong><br>Your personal reactor risk and Stabilizer lock position.</div><div class="resource"><strong>Δ Decoherence</strong><br>Shared event clock and end-game trigger.</div><div class="resource"><strong>✦ Apex</strong><br>Title held by the highest positive Apex record.</div><div class="resource"><strong>⧉ Draw</strong><br>Draw one card unless a mode/effect specifies otherwise.</div></div></section>

<section class="chapter"><div class="chapter-heading"><span>◈</span><div><p>Inventory</p><h2>Components</h2></div></div><div class="columns">
<div class="keep"><h3>Shared Board</h3><ul><li>Quantum Field of hex spaces around a central white Zero-Point Field.</li><li>Quantum Potential track, supporting positive and negative positions.</li><li>Apex Track with four red negative/back positions and values 0–30.</li><li>Decoherence Track from 0 to the final black space at 29.</li><li>Placement bonus rings and special printed resource spaces.</li></ul></div>
<div class="keep"><h3>Per Player</h3><ul><li>Six custom, face-upgradeable quantum dice.</li><li>Ownership marker and Vector marker.</li><li>QP, Apex, and Instability markers.</li><li>Player reactor board with Dice Pool, Collapse Pool, qubit track, instability track, and card slots.</li></ul></div>
<div class="keep"><h3>Cards — 160 Total</h3><ul><li>40 Protocols (orange): tactical immediate and quick effects; coherence symbols.</li><li>40 Circuits (green): permanent die-face upgrades; resonance collections.</li><li>40 Stabilizers (gray): unlocked permanent effects, lock rewards, resonance converters.</li><li>40 States (blue): conditional end-game coherence converters.</li></ul></div>
<div class="keep"><h3>Tile States</h3><p>Digital tiles use six colors: black, violet, white, green, orange, and red. Colored non-white/non-black tiles retain a CV number, ownership ring, and possibly a Vector.</p></div>
</div></section>

<section class="chapter"><div class="chapter-heading"><span>⚙</span><div><p>Prepare the Reactor</p><h2>Setup & Game Modes</h2></div></div>
<h3>Shared Setup</h3><ol><li>Choose 2–4 players and enter player names.</li><li>Choose <strong>Normal</strong> or <strong>Flux</strong> card mode.</li><li>Each player starts with 0◈. QP markers begin on separate positions in player order: 0, 1, 2, and 3.</li><li>Place Apex markers on the four red spaces before Apex 0, in reverse player order.</li><li>Place Decoherence at 0, outside/before the first active space.</li><li>Create each player’s six starting dice; each die has one printed outcome from 0–5, all different across the six dice.</li><li>Prepare hands, decks, and facedown Stabilizers according to the chosen card mode.</li></ol>
<div class="mode-grid"><div class="mode-card"><h3>Normal</h3><p>All enabled cards form one shuffled general deck. Each player receives 3 cards in hand and 5 random facedown starting cards in Stabilizer slots. All draws use the general deck.</p></div><div class="mode-card"><h3>Flux</h3><p>Deal each player 5 random facedown Stabilizers. Deal 5 Protocols, 5 Circuits, and 5 States to form that player’s personal 15-card deck; shuffle it and draw 3. Shuffle all remaining cards into the general deck. Blue Decoherence thresholds are one-shot: ⧉ thresholds draw 3 from each personal deck; other draws use the general deck.</p></div><div class="mode-card"><h3>Shared Screen</h3><p>All players use one computer. The active operator’s board and hand are displayed. Pass control when END TURN is pressed.</p></div><div class="mode-card"><h3>Shared Network</h3><p>One player hosts on the local Wi-Fi and shares the displayed address and 4-digit room code. Up to three players join. The host starts after at least one peer connects. Only the active player can operate the game; other hands are card backs. Windows may request firewall permission.</p></div></div>
<div class="callout"><strong>Deck exhaustion.</strong> If the general deck is empty, shuffle the discard pile to form a new deck. If both are empty, no card is drawn.</div></section>

<section class="chapter"><div class="chapter-heading"><span>⬡</span><div><p>Interface</p><h2>Board & Player Anatomy</h2></div></div>
<h3>Main Board</h3><ul><li><strong>Hex Field:</strong> shared placement, ownership, CV, influence, and Vector movement.</li><li><strong>QP Track:</strong> actual score positions. No space, including 0, holds more than one marker; movement skips occupied spaces.</li><li><strong>Apex Track:</strong> each player’s latest qualifying CV record and next-round order.</li><li><strong>Decoherence Track:</strong> global events and game timer.</li><li><strong>Legends:</strong> CV-to-color ranges and tile influence values.</li></ul>
<h3>Player Board</h3><ul><li><strong>Dice Pool:</strong> action, qubit, and Decoherence faces. The Roll/Continue arrow sits between pools.</li><li><strong>Collapse Pool:</strong> Ψ, outcomes, and action groups; Collapse and resolution controls appear here.</li><li><strong>Qubit Track:</strong> 0–35 with end-game bands.</li><li><strong>Instability Track:</strong> 26 positions, five Stabilizer lock regions, collapse adjustments, and end-game scoring.</li><li><strong>Card Slots:</strong> four Circuit collections at top; State left; Protocol right; five Stabilizers below.</li></ul>
<h3>Card Anatomy</h3><div class="anatomy"><figure><img src="assets/cards/protocol.png"><figcaption>Protocol — condition, quick edge, coherence, immediate effect</figcaption></figure><figure><img src="assets/cards/circuit.png"><figcaption>Circuit — collection, die upgrade, normal/Apex cost</figcaption></figure><figure><img src="assets/cards/stabilizers.png"><figcaption>Stabilizer — permanent, converter, lock effect</figcaption></figure><figure><img src="assets/cards/state.png"><figcaption>State — Decoherence flag, conditions, coherence threshold</figcaption></figure></div></section>

<section class="chapter"><div class="chapter-heading"><span>↻</span><div><p>Round Structure</p><h2>Playing a Turn</h2></div></div><div class="flow"><div>1 Roll</div><div>2 Use Actions</div><div>3 Continue / Collapse</div><div>4 Place Tile</div><div>5 End Turn</div></div>
<h3>1. Before Roll</h3><p>Inspect resources, hand, Instability, Apex, and tucked cards. Circuits may be played before Roll when affordable. In Flux, personal and general decks remain separate.</p>
<h3>2. Roll</h3><p>Roll all available dice. Ψ and outcome faces move automatically into the Collapse Pool. Qubit faces resolve immediately, add their value, and disable. Δ faces resolve automatically and advance Decoherence. Action faces remain in the Dice Pool.</p>
<h3>3. Use Actions</h3><p>Only actions with enough legal free targets glow. Click the action, then its highlighted target(s). The action moves into the Collapse Pool and a blue group forms. A <strong>free die</strong> is a Ψ or outcome not already modified or related.</p>
<h3>4. Continue or Collapse</h3><p>If dice remain in the Dice Pool, Continue rerolls them and normally adds +1⧖. Continue may repeat. Pay 5◈ at any time the stabilize arrow is enabled to reduce Instability by 1 (some cards change this cost).</p>
<h3>5. Resolve and Place</h3><p>Press Collapse, assign Ψ values, resolve every group choice, and calculate the result. Apply it, place the indicated tile, resolve bonuses/influence, then use any after-placement effects.</p>
<h3>6. End Turn</h3><p>Press END TURN after all optional after-placement play. When all players have taken one turn, the round ends and the next round’s order is sorted by Apex position, highest first.</p></section>

<section class="chapter"><div class="chapter-heading"><span>⚄</span><div><p>Core Engine</p><h2>Dice & Basic Actions</h2></div></div>
<p>Black side pips indicate Ψ targets; white pips indicate outcomes. One side pip normally marks a modifier; two indicate a relation. Each starting die contains its listed action pair, two qubit faces, one remaining Ψ, and one unique printed outcome (one of the original Ψ faces becomes that outcome).</p>
<table><thead><tr><th>Symbol</th><th>Action</th><th>Type</th><th>Targets</th><th>Collapse result</th></tr></thead><tbody>${tableRows(actionRows)}</tbody></table>
<h3>Starting Dice</h3><table><thead><tr><th>Die</th><th>Action faces</th><th>Other faces</th></tr></thead><tbody><tr><th>⚀</th><td>Φ Shift, ⊗ Entangle</td><td>2◈, Ψ, unique outcome</td></tr><tr><th>⚁</th><td>Ψ* Conjugate, ⇄ Resonate</td><td>2◈, Ψ, unique outcome</td></tr><tr><th>⚂</th><td>≈ Rephase, ≡ Synchronize</td><td>2◈, Ψ, unique outcome</td></tr><tr><th>⚃</th><td>⊘ Nullify, ⇌ Interfere</td><td>2◈, Ψ, unique outcome</td></tr><tr><th>⚄</th><td>Δ Decoherence, ↯ Tunneling</td><td>2◈, Ψ, unique outcome</td></tr><tr><th>⚅</th><td>Δ Decoherence, ⧓ Bind</td><td>2◈, Ψ, unique outcome</td></tr></tbody></table>
<h3>Advanced Circuit Faces</h3><table><thead><tr><th>Symbol</th><th>Name</th><th>Use</th></tr></thead><tbody>${tableRows(advancedRows)}</tbody></table></section>

<section class="chapter"><div class="chapter-heading"><span>Ψ</span><div><p>Resolution</p><h2>Collapse</h2></div></div>
<ol><li>Press Collapse if at least one die is in the Collapse Pool.</li><li>Each Ψ receives a random green value 0–5. Each outcome displays its printed value as red; zero is neutral/black.</li><li>Resolve each modifier/relation by choosing its displayed option. A group contributes its final group marker(s), not each target separately.</li><li>Add all green values and subtract all red values to calculate <strong>CV</strong>.</li><li>Check Fail, Annihilation, and Full Collapse.</li><li>Apply the result, update Apex, determine tile color, then place.</li></ol>
<div class="formula">CV = sum of green values − sum of red values + explicit post-resolution bonuses</div>
<h3>Failure</h3><p>If two or more green scoring values are equal, or two or more red scoring values are equal, the collapse fails. The CV is still calculated for effects, but the tile is black. Gain +1⧖ and place the Apex marker on the nearest available red Apex space.</p>
<h3>Annihilation</h3><p>After all choices, pair each green value with a red value of the same magnitude. Every such pair is an Annihilation and immediately scores +5⬢. Multiple copies can form multiple pairs.</p>
<h3>Full Collapse</h3><p>If all six dice are in the Collapse Pool and the collapse does not fail, gain +2⬢.</p>
<h3>Face Evolution</h3><p>After tile placement, each Ψ face used in the collapse becomes the original random value assigned before modifiers/relations. Each outcome face used becomes Ψ. Suppressor upgrades return when their stored outcome later flips back to Ψ. Temporary Protocol dice are removed at turn end.</p>
<div class="callout"><strong>Zero.</strong> Zero contributes neither positive nor negative CV and cannot create a duplicate-tone failure.</div></section>

<section class="chapter"><div class="chapter-heading"><span>✦</span><div><p>Prestige & Initiative</p><h2>Apex</h2></div></div>
<p>The first player with a positive non-failed CV takes Apex. Thereafter, the highest positive Apex record holds the title. A new positive CV moves that player’s marker to the corresponding 0–30 position. Failed or negative collapses move the marker to the red spaces before 0.</p>
<ul><li>No two markers share an Apex position. Resolve occupied destinations toward the back of the track.</li><li>CV 0 places the marker at 0 and draws one card.</li><li>Passing card icons at 6, 11, 16, 21, and 26 draws one card per icon passed.</li><li>If the Apex holder fails or falls behind, Apex passes to the player currently highest on the track.</li><li>At the end of each round, reorder players from highest Apex position to lowest. The order remains fixed for that whole round.</li></ul>
<p>Cards may grant reduced Apex costs, extra quick rewards, easier conditions, or end-game bonuses while you hold Apex.</p></section>

<section class="chapter"><div class="chapter-heading"><span>⬢</span><div><p>Shared Field</p><h2>Tile Placement, Scoring & Influence</h2></div></div>
<h3>Tile Color from CV</h3><div class="tile-grid"><div class="tile"><span class="gem black">⬢</span> <strong>Black</strong> — failed collapse; influence/scoring rate −2.</div><div class="tile"><span class="gem violet">⬢</span> <strong>Violet</strong> — CV &lt; 0; rate −1.</div><div class="tile"><span class="gem white">⬢</span> <strong>White</strong> — CV = 0; no CV number or influence.</div><div class="tile"><span class="gem green">⬢</span> <strong>Green</strong> — 1–5; rate +1.</div><div class="tile"><span class="gem orange">⬢</span> <strong>Orange</strong> — 6–10; rate +2.</div><div class="tile"><span class="gem red">⬢</span> <strong>Red</strong> — 11+; rate +3.</div></div>
<h3>Legal Placement</h3><ul><li><strong>First Vector placement:</strong> any free hex adjacent to the central white hex.</li><li><strong>Later:</strong> free hexes adjacent to your Vector.</li><li><strong>Own tile:</strong> adjacent, no Vector, and old CV is higher than current CV.</li><li><strong>Enemy tile:</strong> adjacent, no Vector, and old CV is lower than current CV, unless protected.</li><li><strong>Black:</strong> use free spaces first; if none, replace an adjacent own tile; if none, replace the current Vector tile. You may move onto an existing black tile only when no legal free/own/enemy placement exists.</li><li><strong>No legal non-black placement:</strong> replace the current Vector tile only if its CV is higher than the new CV; otherwise placement has no effect.</li></ul>
<h3>Field QP Formula</h3><div class="formula">Tile field value = color rate × (1 + number of adjacent violet/green/orange/red tiles)</div><p>White and black neighbors do not count as scoring neighbors. A black tile itself uses rate −2 but surrounding black/white tiles still do not count.</p>
<h3>Free, Own, and Enemy Resolution</h3><ul><li><strong>Free:</strong> score the new tile’s field value plus its first-placement bonus.</li><li><strong>Own replacement:</strong> score new field value − old field value. This is commonly a loss because own replacement requires lower CV.</li><li><strong>Enemy conquest:</strong> conquering player scores new field value − old field value. The old owner loses the old field value; if it was negative, that owner gains instead.</li></ul>
<h3>First-Placement Bonuses</h3><table><thead><tr><th>Region/print</th><th>One-time reward when first populated</th></tr></thead><tbody><tr><th>Inner ring</th><td>+5⬢</td></tr><tr><th>Middle ring</th><td>+3⬢</td></tr><tr><th>Outer ring</th><td>+1⬢</td></tr><tr><th>Outermost ring</th><td>−1⬢</td></tr><tr><th>Blue special</th><td>+5◈</td></tr><tr><th>Red special</th><td>+3⬢</td></tr><tr><th>Orange special</th><td>Draw 1 card</td></tr></tbody></table>
<h3>Influence</h3><p>After placement, only the newly placed tile adjusts all adjacent colored CV tiles: black −2, violet −1, green +1, orange +2, red +3. White and black targets are unaffected. Influence never crosses zero: a negative tile pushed upward stops at 0 and becomes white; a positive tile pushed downward does the same. A tile that becomes white is not influenced later.</p></section>

<section class="chapter"><div class="chapter-heading"><span>Δ</span><div><p>Global Clock</p><h2>Decoherence</h2></div></div>
<p>Every resolved Δ advances the shared track by 1 unless an effect ignores or rerolls it. The marker starts at 0; reaching black space 29 triggers the end of the game after the current round.</p>
<table><thead><tr><th>Spaces</th><th>Event</th></tr></thead><tbody><tr><th>4, 11, 18, 25</th><td>⧉ — Normal: every player draws 1 from the general deck. Flux: every player draws 3 from their personal deck.</td></tr><tr><th>7, 14, 21</th><td>Δ swap — each player must replace one action or qubit face with Δ. Ψ, outcomes, and existing Δ faces cannot be selected. The triggering player may choose only a die still available in the Dice Pool; if none exists, that player skips.</td></tr><tr><th>29</th><td>Game-end trigger; finish the round.</td></tr></tbody></table>
<p>In Flux mode, blue ⧉ and Δ thresholds trigger only the first time they are crossed, then turn gray. In Normal mode, lowering and re-crossing a threshold can activate it again. Card/Apex draws always use the general deck.</p></section>

<section class="chapter"><div class="chapter-heading"><span>⧖</span><div><p>Personal Risk</p><h2>Instability & Stabilizers</h2></div></div>
<h3>Track Effects</h3><table><thead><tr><th>Position</th><th>Collapse adjustment</th><th>End-game QP</th></tr></thead><tbody><tr><th>1–3</th><td>At positions 1–7, negative CV adds +1⧖.</td><td>+5⬢</td></tr><tr><th>4–7</th><td>At positions 1–7, negative CV adds +1⧖.</td><td>+3⬢</td></tr><tr><th>8–12</th><td>At positions 8–15, positive CV removes 1⧖.</td><td>+1⬢</td></tr><tr><th>13–15</th><td>Positive CV removes 1⧖.</td><td>0⬢</td></tr><tr><th>16–18</th><td>At positions 16–25, positive CV removes 2⧖.</td><td>0⬢</td></tr><tr><th>19–25</th><td>Positive CV removes 2⧖.</td><td>−1⬢</td></tr><tr><th>26</th><td>No collapse-band adjustment.</td><td>−3⬢</td></tr></tbody></table>
<p>If Instability must move beyond 26, it stays at 26 and the player loses 1⬢ per excess push.</p>
<h3>Facedown Unlock Thresholds</h3><p>When Instability first reaches 4, 8, 13, 19, and 26, reveal/take the corresponding first through fifth facedown starting card.</p>
<h3>Played Stabilizer Lock Regions</h3><table><thead><tr><th>Slot</th><th>Locked while Instability is…</th></tr></thead><tbody><tr><th>1</th><td>1–3</td></tr><tr><th>2</th><td>4–7</td></tr><tr><th>3</th><td>8–12</td></tr><tr><th>4</th><td>13–18</td></tr><tr><th>5</th><td>19–25</td></tr></tbody></table>
<p>An unlocked Stabilizer shows and grants its permanent effect and may contribute its end-game converter. When the marker enters its region, it locks: hide the permanent/end-game text, show the lock, and immediately resolve the lock effect. Moving away unlocks it. Lock rewards count tucked Circuit collection symbols as described on the card.</p></section>

<section class="chapter"><div class="chapter-heading"><span>⟫</span><div><p>Engine Building</p><h2>Cards</h2></div></div>
<h3>Playing and Utility</h3><p>A glowing hand card is currently playable. Click to zoom. Pay its cost, resolve its effect, then tuck it in the matching area. Instead of playing, a card may be discarded using <strong>Requantize (⟲)</strong> when available. Protocols/States may use <strong>Decohere (≋)</strong> when their condition is no longer valid. Apply the printed resource change, close the popup, and place the card in the discard pile.</p>
<div class="mode-grid"><div class="mode-card"><h3>Protocols ⟫</h3><p>Require the printed minimum QP and qubit cost. Resolve the timing-specific immediate effect if possible, then gain the quick effect and Apex addition. Tuck right; only quick/Apex and total coherence symbols remain summarized.</p></div><div class="mode-card"><h3>Circuits ⟟</h3><p>Playable before Roll or after Collapse. Choose a legal face on your own die and replace it. Apex may reduce cost. Tuck by collection: ✸, ⊞, ⟁, or ⧝.</p></div><div class="mode-card"><h3>States ⦿</h3><p>Playable after Collapse/tile placement when the Decoherence flag and normal condition are met, or the Apex condition is met while holding Apex. Tuck left as a coherence threshold reward.</p></div><div class="mode-card"><h3>Stabilizers ⟨⟩</h3><p>Cost QP and require an open Stabilizer slot. Enter half-tucked and active if unlocked. Permanent text exhausts/turns gray after its once-per-turn use. Lock status follows Instability.</p></div></div>
<h3>Card Timing Windows</h3><ul><li><strong>Before Roll:</strong> Circuits and effects explicitly allowed before rolling.</li><li><strong>Action Phase:</strong> after Roll/Continue and before Collapse.</li><li><strong>Before/During Collapse:</strong> assign, alter, ignore, or group values before final CV.</li><li><strong>After Collapse:</strong> after resolution and before tile placement.</li><li><strong>After Tile Placement:</strong> after field scoring/influence and before END TURN.</li></ul></section>

<section class="chapter"><div class="chapter-heading"><span>🏆</span><div><p>Final Resolution</p><h2>End Game & Scoring</h2></div></div>
<p>When Decoherence reaches 29, finish the current round so every player receives the same number of turns. Then score in this order.</p>
<div class="score-grid"><div class="score-card"><h3>1. Current QP</h3><p>Your marker’s actual track position. Skipped occupied spaces are real score positions.</p></div><div class="score-card"><h3>2. Field Presence</h3><p>Owned violet −1 each; green +1; orange +2; red +3; white +5. Black is unowned and scores 0.</p></div><div class="score-card"><h3>3. Coherence</h3><p>Total ⬡ from tucked Protocols. Each tucked State scores its printed threshold once if you have at least the required ⬡.</p></div><div class="score-card"><h3>4. Resonance</h3><p>Each unlocked Stabilizer converts tucked Circuit symbols as printed. Apply Apex additions if that player finishes with Apex. Some converters reduce Instability instead of scoring QP.</p></div><div class="score-card"><h3>5. Instability</h3><p>After resonance reductions: 1–3 +5; 4–7 +3; 8–12 +1; 13–18 0; 19–25 −1; 26 −3.</p></div><div class="score-card"><h3>6. Qubits</h3><p>0–4 = 0; 5–14 = +1; 15–24 = +3; 25–35 = +5⬢.</p></div></div>
<div class="formula">Final QP = current QP + presence + coherence + resonance + instability score + qubit score</div><p>The highest total becomes the <strong>Master of the Quantum Flux</strong>. There is currently no separate end-game score from the global Decoherence position.</p></section>

<section class="quick-ref"><div class="chapter-heading"><span>?</span><div><p>One-Page Aid</p><h2>Quick Reference</h2></div></div><div class="columns"><div class="keep"><h3>Turn</h3><ol><li>Play legal before-Roll Circuits.</li><li>Roll.</li><li>Resolve ◈ and Δ automatically.</li><li>Use glowing actions.</li><li>Continue (+1⧖) or Collapse.</li><li>Choose group values; calculate CV.</li><li>Check Fail, Annihilation, Full Collapse.</li><li>Apply; update Apex; place tile.</li><li>Score, bonus, influence, Vector.</li><li>After-placement effects; END TURN.</li></ol></div><div class="keep"><h3>Tile Rates</h3><p>Black −2 · Violet −1 · White 0 · Green +1 · Orange +2 · Red +3</p><p><strong>Field value:</strong> rate × (1 + adjacent scoring tiles).</p></div><div class="keep"><h3>CV Color</h3><p>Fail black · &lt;0 violet · 0 white · 1–5 green · 6–10 orange · 11+ red.</p></div><div class="keep"><h3>Collapse Extras</h3><p>Duplicate green or duplicate red → Fail.<br>Matching green/red pair → +5⬢ Annihilation.<br>All 6 dice, no Fail → +2⬢.</p></div><div class="keep"><h3>Decoherence</h3><p>Draw: 4, 11, 18, 25.<br>Δ face swap: 7, 14, 21.<br>End trigger: 29.</p></div><div class="keep"><h3>Apex Cards</h3><p>CV 0 draws 1. Passing 6, 11, 16, 21, 26 draws 1 each.</p></div></div></section>

${cardSection("Protocols", "⟫", cardData.protocolCards, protocolCard, "protocols")}
${cardSection("Circuits", "⟟", cardData.circuitCards, circuitCard, "circuits")}
${cardSection("Stabilizers", "⟨⟩", cardData.stabilizerCards, stabilizerCard, "stabilizers")}
${cardSection("States", "⦿", cardData.stateCards, stateCard, "states")}

<section class="copyright"><img src="assets/app-icon.png"><h2>Quantum Flux</h2><p>Game design by Filip Kochoski. This rulebook documents the active digital playtest prototype. Card text and in-app prompts supersede this document when a later build changes implementation.</p><p>© 2026 Filip Kochoski. All rights reserved.</p></section>
</body></html>`;

fs.writeFileSync(path.join(root, "Quantum Flux Rulebook.html"), html, "utf8");
console.log(`Generated rulebook HTML with ${cardData.cards.length} cards.`);
