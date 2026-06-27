let players = [
  { id: "p1", name: "Cyan", color: "#12c7d9", potential: 0, trackPotential: 0, qubits: 0, instability: 0, apex: -1 },
  { id: "p2", name: "Gold", color: "#f0cf3a", potential: 1, trackPotential: 1, qubits: 0, instability: 0, apex: -2 },
  { id: "p3", name: "Pink", color: "#ff63c8", potential: 2, trackPotential: 2, qubits: 0, instability: 0, apex: -3 },
  { id: "p4", name: "Brown", color: "#a56a43", potential: 3, trackPotential: 3, qubits: 0, instability: 0, apex: -4 }
];
let botTurnTimer = null;
const QP_TRACK_SIZE = 100;
const QP_TRACK_NEGATIVE_SPOTS = 20;
const QP_TRACK_MAX = QP_TRACK_SIZE - 1;
const QP_TRACK_MIN = -QP_TRACK_NEGATIVE_SPOTS;
const DECOHERENCE_MAX = 29;

const playerDefaults = [
  { id: "p1", name: "Cyan", color: "#12c7d9", apex: -1 },
  { id: "p2", name: "Gold", color: "#f0cf3a", apex: -2 },
  { id: "p3", name: "Pink", color: "#ff63c8", apex: -3 },
  { id: "p4", name: "Brown", color: "#a56a43", apex: -4 }
];

const guidedTutorialSteps = [
  { title: "1. Player Order", target: "#player-summary", text: "This tutorial uses two scripted players: YOU! and The Other Player. Player order is checked after each full round using the Apex Track: highest Apex marker acts first next round." },
  { title: "2. Player Board", target: ".reactor-board", text: "Your board contains Dice Pool, Collapse Pool, qubit track, instability track, card hand, and tuck slots for Protocols, Circuits, States, and Stabilizers." },
  { title: "3. Main Board", target: ".main-board", text: "The main board has the hex map, preprinted placement bonuses, the Apex Track, Decoherence Track, and Quantum Potential track." },
  { title: "4. Custom Dice", target: "#dice-icons", text: "Each icon is a custom die. Hover to inspect all faces. Ψ and outcomes collapse, ◈ gives qubits, Δ advances Decoherence, and action faces manipulate the Collapse Pool." },
  { title: "5. Cards In Hand", target: "#hand-area", text: "Cards come in four types. Playable cards glow. Click a card to zoom it; Protocols create tactical effects, Circuits upgrade dice, States score coherence, and Stabilizers live on your board." },
  { title: "6. Facedown Stabilizers", target: "#stabilizer-slots", text: "Each player begins with five facedown Stabilizers. Instability thresholds reveal them later." },
  { title: "7. Turn Structure", target: "#collapse-actions", text: "Each turn follows: Roll -> Use Actions -> Collapse -> Place Tile -> End Turn." },
  { title: "8. Roll", target: "#roll-continue-button", requireClick: "#roll-continue-button", completeWhen: "rolled", text: "Click Roll. The tutorial uses a fixed roll so the lesson is always the same." },
  { title: "9. Pools After Roll", target: ".reactor-board", text: "Ψ and outcome 3 moved automatically into the Collapse Pool. Rephase, Bind, ◈, and Δ stayed in the Dice Pool." },
  { title: "10. Qubits", target: "#qubit-track", text: "The ◈ die resolves automatically and raises your qubits on the qubit track. Qubits are used to play Protocol, State, and Circuit cards." },
  { title: "11. Decoherence", target: "#decoherence-track", text: "The Δ die advances global Decoherence. Decoherence triggers global events, helps define State card timing, and eventually ends the game." },
  { title: "12. Continue", target: "#roll-continue-button", requireClick: "#roll-continue-button", completeWhen: "continued", text: "Click Continue. Continuing rerolls dice in the Dice Pool and increases your Instability." },
  { title: "13. Instability", target: "#instability-track", text: "Instability increased by 1. A new outcome 0 joined the Collapse Pool; the Dice Pool now shows two qubits and Decoherence." },
  { title: "14. Continue Again", target: "#roll-continue-button", requireClick: "#roll-continue-button", completeWhen: "continued", text: "Click Continue again. Outcome 3 and another Ψ will join the Collapse Pool, and Resonate will remain in the Dice Pool." },
  { title: "15. Use Resonate", target: "#dice-pool .rolled-face.actionable", requireClick: "#dice-pool .rolled-face.actionable", completeWhen: "actionSelected", text: "Click the glowing Resonate action. Blue glow means the action is legal now." },
  { title: "15b. First Ψ Target", target: "#collapse-pool .rolled-face.targetable", requireClick: "#collapse-pool .rolled-face.targetable", completeWhen: "oneActionTarget", text: "Click the first highlighted Ψ. Relation dice use two side pips; black pips mean superposition targets, white pips mean outcome targets." },
  { title: "15c. Second Ψ Target", target: "#collapse-pool .rolled-face.targetable:not(.selected)", requireClick: "#collapse-pool .rolled-face.targetable:not(.selected)", completeWhen: "hasGroup", text: "Click the second highlighted Ψ to form the Resonate group." },
  { title: "16. Collapse", target: ".collapse-phase-button", requireClick: ".collapse-phase-button", completeWhen: "collapseStarted", text: "Click Collapse. The scripted Ψ values are 5 and 0, and the Resonate group offers 5 and 5." },
  { title: "17. Choose Group Value", target: "#collapse-pool .collapse-choice", requireClick: "#collapse-pool .collapse-choice", completeWhen: "collapseFinalized", text: "Click the left 5. CV means Collapse Value. If all six dice are used and the collapse does not fail, Full Collapse gives +2⬢. The color legend shows which tile color CV creates." },
  { title: "18. Apply And Place", target: ".collapse-phase-button", requireClick: ".collapse-phase-button", completeWhen: "tilePlacement", text: "Click the Collapse/CV button to enter tile placement. First placement must be around the center." },
  { title: "18b. Southeast Hex", target: "#hex-field [data-hex-key='0,1'].placement-available", requireClick: "#hex-field [data-hex-key='0,1'].placement-available", completeWhen: "postPlacement", text: "Click the southeast highlighted hex. You gain 6⬢ from a green tile scoring 1⬢ plus the +5⬢ placement bonus. After collapse, Ψ faces become their rolled numbers and outcomes become Ψ." },
  { title: "19. Tile And Markers", target: "#hex-field", text: "Your tile now shows ownership, Vector, and CV value. Ownership is the hex ring; the Vector is the circular marker." },
  { title: "19b. Open State Card", target: "#hand-area [data-card-id='STATE-09']", requireClick: "#hand-area [data-card-id='STATE-09']", completeWhen: "cardDialogOpen", text: "Click the highlighted State card in your hand to zoom it." },
  { title: "19c. Play State Card", target: "[data-card-play]", requireClick: "[data-card-play]", completeWhen: "stateTucked", text: "Click Play. The State tucks into your State slot." },
  { title: "20. State Tuck Area", target: "#state-slot [data-tucked-inspect='state']", requireClick: "#state-slot [data-tucked-inspect='state']", completeWhen: "tuckedDialogOpen", text: "Click the State tuck area. It summarizes end-game coherence scoring and can be inspected." },
  { title: "20b. Close Tucked States", target: "#tucked-cards-close", requireClick: "#tucked-cards-close", completeWhen: "tuckedDialogClosed", text: "Close the tucked-card popup to continue." },
  { title: "21. End Turn", target: "#end-turn-button", requireClick: "#end-turn-button", completeWhen: "nextTurn", text: "Click END TURN." },
  { title: "22. Other Player Turn", target: "#hex-field", autoRun: "otherTurnOne", text: "The Other Player now performs a scripted turn: Shift, Continue, Nullify, Collapse, places beside your tile, influences it, plays CIRCUIT-12, and ends turn." },
  { title: "23. Your Next Roll", target: "#roll-continue-button", requireClick: "#roll-continue-button", completeWhen: "rolled", text: "Click Roll. Ψ and 5 appear in the Collapse Pool; three qubits and Rephase remain in the Dice Pool." },
  { title: "24. Rephase", target: "#dice-pool .rolled-face.actionable", requireClick: "#dice-pool .rolled-face.actionable", completeWhen: "actionSelected", text: "Click Rephase, then click outcome 5." },
  { title: "24b. Rephase Target", target: "#collapse-pool .rolled-face.targetable", requireClick: "#collapse-pool .rolled-face.targetable", completeWhen: "hasGroup", text: "Click the highlighted 5 outcome to form the Rephase group." },
  { title: "25. Continue", target: "#roll-continue-button", requireClick: "#roll-continue-button", completeWhen: "continued", text: "Click Continue. Two more Ψ dice are added to the Collapse Pool." },
  { title: "26. Collapse", target: ".collapse-phase-button", requireClick: ".collapse-phase-button", completeWhen: "collapseStarted", text: "Click Collapse. The scripted Ψ values are 4, 0, and 5; the Rephase group offers 5 and 0." },
  { title: "27. Choose 0", target: "#collapse-pool .collapse-choice", requireClick: "#collapse-pool .collapse-choice", completeWhen: "collapseFinalized", text: "Click 0 on the Rephase group." },
  { title: "27b. Apply", target: ".collapse-phase-button", requireClick: ".collapse-phase-button", completeWhen: "tilePlacement", text: "Click the Collapse/CV button to place the tile." },
  { title: "27c. Place Below", target: "#hex-field [data-hex-key='0,2'].placement-available", requireClick: "#hex-field [data-hex-key='0,2'].placement-available", completeWhen: "postPlacement", text: "Place the tile below your existing tile. After the first turn, legal spaces come from your Vector neighborhood. This placement also awards +5◈ from the preprinted qubit bonus." },
  { title: "28. Apex Track", target: "#apex-track", autoRun: "grantCircuit39", text: "The Apex Track records positive CV and gives cards when you pass card icons. In this tutorial, you receive CIRCUIT-39 from the Apex lesson." },
  { title: "28b. Play CIRCUIT-39", target: "#hand-area [data-card-id='CIRCUIT-39']", requireClick: "#hand-area [data-card-id='CIRCUIT-39']", completeWhen: "cardDialogOpen", text: "Click CIRCUIT-39 in your hand." },
  { title: "28c. Requantize CIRCUIT-39", target: "[data-card-action='requantize']", requireClick: "[data-card-action='requantize']", completeWhen: "cardDialogClosed", text: "For the tutorial, click Requantize to close the card flow cleanly. In a full game, CIRCUIT-39 can upgrade action/qubit faces." },
  { title: "28d. End Turn", target: "#end-turn-button", requireClick: "#end-turn-button", completeWhen: "nextTurn", text: "Click END TURN." },
  { title: "29. Other Player Conquers", target: "#hex-field", autoRun: "otherTurnTwo", text: "The Other Player performs a second scripted turn, creates an Entangle result of 10, draws cards from the Apex Track, then conquers your blinking hex. Conquering uses CV comparison and field scoring." },
  { title: "30. Continue Freely", target: "#card-library-button", releaseControls: true, text: "Use the Dice Library and Card Library for references. From now on, continue the game as usual: tile colors come from CV, scoring comes from field position, and tiles influence neighboring CV values." }
];

const tutorialRollScripts = [
  ["superposition", "outcome:3", "rephase", "qubit", "decoherence", "bind"],
  ["outcome:0", "qubit", "qubit", "decoherence"],
  ["outcome:3", "superposition", "resonate"],
  ["superposition", "outcome:5", "qubit", "qubit", "qubit", "rephase"],
  ["superposition", "superposition", "qubit", "qubit"]
];

const tutorialCollapseValueScripts = [
  [5, 0],
  [4, 0, 5]
];

const gameState = {
  activePlayerId: "p1",
  decoherence: 0,
  apexHolderId: null,
  gameEndTriggered: false,
  gameOver: false,
  finalScoringAccepted: false,
  round: 1,
  turnIndex: 0,
  roundOrderIds: players.map((player) => player.id),
  phase: "roll",
  diceByPlayer: {},
  groupsByPlayer: {},
  collapseByPlayer: {},
  tiles: {
    "0,0": { color: "white", cv: null, ownerId: null }
  },
  vectorsByPlayer: {},
  pendingPlacement: null,
  pendingAction: null,
  selectedQubits: [],
  selectedHandCardIndex: null,
  deltaSwapQueue: [],
  tempPotentialByPlayer: {},
  gameMode: "normal",
  deck: [],
  personalDecksByPlayer: {},
  discardPile: [],
  triggeredFluxDecoherenceThresholds: [],
  pendingBotCardReveal: null,
  testDeckTypes: {
    protocol: true,
    circuit: true,
    stabilizer: true,
    state: true
  },
  testStartPotential: 0,
  testStartQubits: 0,
  handsByPlayer: {},
  facedownStabilizersByPlayer: {},
  playedCardsByPlayer: {},
  pendingStabilizerPlay: null,
  pendingStabilizerSelection: null,
  stabilizerTurnDataByPlayer: {},
  pendingCircuitUpgrade: null,
  pendingVectorJump: null,
  pendingEntropicReset: null,
  pendingProtocolSelection: null,
  pendingProtocolBoardSelection: null,
  pendingProtocolGroupSelection: null,
  pendingProtocolScoringSelection: null,
  pendingProtocolChoice: null,
  pendingProtocolValueChoice: null,
  protocolEffectsByPlayer: {},
  tutorialMode: false,
  tutorialStep: 0,
  tutorialRollIndex: 0,
  tutorialCollapseIndex: 0,
  tutorialPlacementIndex: 0,
  tutorialTurnStartId: null,
  turnStatsByPlayer: {},
  log: [
    "Prototype board shell created.",
    "Blue is the active operator.",
    "Tracks, pools, card slots, and fields are ready for rules."
  ]
};

const audioState = {
  ctx: null,
  master: null,
  musicGain: null,
  sfxGain: null,
  musicElement: null,
  musicEnabled: false,
  sfxEnabled: true,
  musicTimer: null,
  musicNodes: []
};

const tutorialSteps = [
  {
    title: "Welcome To Quantum Flux",
    target: "#current-player-label",
    text: "This tutorial starts a real two-player learning game. You can follow the steps, click the highlighted controls, and keep playing normally at any time."
  },
  {
    title: "Active Player",
    target: "#player-summary",
    text: "The top banner shows all players. The highlighted tab is the active operator. Player order can change between rounds according to the Apex Track."
  },
  {
    title: "Main Quantum Field",
    target: "#hex-field",
    text: "This is the shared hex field. Your first Vector placement is around the center white tile; later placements must be around your Vector."
  },
  {
    title: "Cards In Hand",
    target: "#hand-area",
    text: "Cards that glow are playable. Click a card to zoom it. Protocols create immediate tactical effects, Circuits upgrade dice, States score at end game, and Stabilizers live on your board."
  },
  {
    title: "Player Board",
    target: ".reactor-board",
    text: "Your board holds card slots, qubit track, instability track, Dice Pool, and Collapse Pool. Most of the turn happens here."
  },
  {
    title: "Roll Dice",
    target: "#roll-continue-button",
    text: "Press Roll. Qubits are gained automatically, Decoherence faces advance the global track, and Ψ/outcome dice move into the Collapse Pool."
  },
  {
    title: "Dice Pool",
    target: "#dice-pool",
    text: "Action dice stay in the Dice Pool. Only legal action dice glow. Click one, then choose highlighted target dice in the Collapse Pool."
  },
  {
    title: "Collapse Pool",
    target: "#collapse-pool",
    text: "Superpositions and outcomes collect here. Groups show as framed dice. During Collapse, Ψ gets random green values and outcomes become red values."
  },
  {
    title: "Continue Or Collapse",
    target: "#collapse-actions",
    text: "If you want more dice, press the arrow again to Continue, usually gaining Instability. If ready, press Collapse and resolve group choices."
  },
  {
    title: "Collapse Value",
    target: "#collapse-actions",
    text: "Green values add to CV and red values subtract. Matching green values or matching red values cause a failed collapse, producing a black tile."
  },
  {
    title: "Tile Placement",
    target: "#hex-field",
    text: "After applying CV, legal hexes are shown. Click one to place or move the tile. QP comes from field scoring: tile value plus scoring neighbors."
  },
  {
    title: "Apex Track",
    target: "#apex-track",
    text: "Positive CV moves your Apex marker. The player with the highest Apex position holds Apex and may gain bonuses from cards."
  },
  {
    title: "Decoherence Track",
    target: "#decoherence-track",
    text: "Decoherence is the game timer. Event spaces can force dice-face swaps, card draws, QP loss, or Instability gain for all players."
  },
  {
    title: "Instability And Stabilizers",
    target: "#instability-track",
    text: "Instability is your personal risk. It can unlock face-down Stabilizers, lock played Stabilizers, and create end-game penalties or bonuses."
  },
  {
    title: "Libraries",
    target: "#card-library-button",
    text: "Use the Card Library and Dice Library whenever you need details. They show all cards, dice faces, formulas, targets, and effects."
  },
  {
    title: "End Turn",
    target: "#end-turn-button",
    text: "After tile placement, END TURN appears. Press it when your after-placement cards and effects are done."
  },
  {
    title: "You Are Ready",
    target: "#rulebook-button",
    text: "The guided tutorial is complete. You can keep playing this tutorial game, open the Rulebook, or exit tutorial mode with the × on this panel."
  }
];

function ensureAudioContext() {
  if (!window.AudioContext && !window.webkitAudioContext) return null;
  if (audioState.ctx) {
    if (audioState.ctx.state === "suspended") audioState.ctx.resume();
    return audioState.ctx;
  }

  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtor();
  const master = ctx.createGain();
  const musicGain = ctx.createGain();
  const sfxGain = ctx.createGain();
  master.gain.value = 0.72;
  musicGain.gain.value = 0.18;
  sfxGain.gain.value = 0.34;
  musicGain.connect(master);
  sfxGain.connect(master);
  master.connect(ctx.destination);
  Object.assign(audioState, { ctx, master, musicGain, sfxGain });
  return ctx;
}

function updateAudioButtons() {
  document.querySelectorAll("#intro-music-button").forEach((button) => {
    button.textContent = audioState.musicEnabled ? "Music On" : "Music Off";
    button.classList.toggle("active", audioState.musicEnabled);
  });
  document.querySelectorAll("#intro-sfx-button").forEach((button) => {
    button.textContent = audioState.sfxEnabled ? "SFX On" : "SFX Off";
    button.classList.toggle("active", audioState.sfxEnabled);
  });
  document.querySelectorAll("#music-button").forEach((button) => {
    button.classList.toggle("active", audioState.musicEnabled);
    button.title = audioState.musicEnabled ? "Music on" : "Music off";
  });
  document.querySelectorAll("#sfx-button").forEach((button) => {
    button.classList.toggle("active", audioState.sfxEnabled);
    button.title = audioState.sfxEnabled ? "Sound effects on" : "Sound effects off";
  });
}

function toggleMusic() {
  if (audioState.musicEnabled) {
    stopMusic();
  } else {
    startMusic();
  }
  updateAudioButtons();
}

function toggleSfx() {
  audioState.sfxEnabled = !audioState.sfxEnabled;
  if (audioState.sfxEnabled) playSound("button");
  updateAudioButtons();
}

function startMusic() {
  if (audioState.musicEnabled) return;
  if (!audioState.musicElement) {
    const audio = new Audio("assets/quantum-flux-music.mp3");
    audio.loop = true;
    audio.volume = 0.22;
    audio.preload = "auto";
    audioState.musicElement = audio;
  }
  audioState.musicEnabled = true;
  audioState.musicElement.volume = 0.22;
  audioState.musicElement.play().catch(() => {
    audioState.musicEnabled = false;
    updateAudioButtons();
  });
}

function stopMusic() {
  audioState.musicEnabled = false;
  if (!audioState.musicElement) return;
  audioState.musicElement.pause();
}

function playSound(name) {
  if (!audioState.sfxEnabled) return;
  const ctx = ensureAudioContext();
  if (!ctx) return;

  if (name === "button") return playTone(520, 0.055, "triangle", 0.055);
  if (name === "dice") {
    playNoise(0.16, 0.12, 900);
    playTone(180, 0.08, "square", 0.035);
    return;
  }
  if (name === "qubit") return playArp([880, 1174.66, 1760], 0.05, 0.05);
  if (name === "decoherence") {
    playTone(90, 0.3, "sawtooth", 0.08);
    playNoise(0.22, 0.08, 260);
    return;
  }
  if (name === "collapse") return playArp([220, 277.18, 329.63, 440], 0.09, 0.075);
  if (name === "fail") {
    playTone(140, 0.45, "sawtooth", 0.12);
    playTone(92, 0.5, "square", 0.06);
    return;
  }
  if (name === "success") return playArp([440, 659.25, 880], 0.09, 0.08);
  if (name === "card") return playArp([392, 523.25, 783.99], 0.06, 0.06);
  if (name === "tile") {
    playTone(330, 0.08, "triangle", 0.08);
    playTone(660, 0.13, "sine", 0.04, null, 0.01, 0.12);
    return;
  }
  if (name === "track") return playTone(740, 0.06, "sine", 0.04);
}

function playArp(notes, duration, spacing) {
  notes.forEach((frequency, index) => {
    playTone(frequency, duration, "triangle", 0.06, null, index * spacing);
  });
}

function playTone(frequency, duration, type = "sine", gainValue = 0.05, destination = null, delay = 0, release = 0.08) {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + delay;
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, gainValue), start + 0.012);
  gain.gain.setTargetAtTime(0.0001, start + duration, release);
  osc.connect(gain);
  gain.connect(destination || audioState.sfxGain);
  osc.start(start);
  osc.stop(start + duration + release + 0.08);
}

function playNoise(duration, gainValue, filterFrequency) {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
  const noise = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  filter.type = "bandpass";
  filter.frequency.value = filterFrequency;
  filter.Q.value = 1.8;
  gain.gain.value = gainValue;
  noise.buffer = buffer;
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioState.sfxGain);
  noise.start();
}

const specialHexes = new Map([
  ["0,-3", { type: "potential", label: "3⬢" }],
  ["0,3", { type: "potential", label: "3⬢" }],
  ["-3,0", { type: "potential", label: "3⬢" }],
  ["3,-3", { type: "potential", label: "3⬢" }],
  ["-3,3", { type: "potential", label: "3⬢" }],
  ["3,0", { type: "potential", label: "3⬢" }],
  ["0,-2", { type: "qubit", label: "5◈" }],
  ["-2,1", { type: "qubit", label: "5◈" }],
  ["2,-1", { type: "qubit", label: "5◈" }],
  ["0,2", { type: "qubit", label: "5◈" }],
  ["-2,-1", { type: "card-mine", label: "1⧉" }],
  ["2,-3", { type: "card-mine", label: "1⧉" }],
  ["-2,3", { type: "card-mine", label: "1⧉" }],
  ["2,1", { type: "card-mine", label: "1⧉" }]
]);

function hexDistanceFromCenter(key) {
  const [q, r] = key.split(",").map(Number);
  const s = -q - r;
  return Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
}

function fieldPlacementBonusForKey(key) {
  const distance = hexDistanceFromCenter(key);
  if (distance === 1) return 5;
  if (distance === 2) return 3;
  if (distance === 3) return 1;
  if (distance === 4) return -1;
  return 0;
}

function fieldPlacementBonusType(key) {
  const bonus = fieldPlacementBonusForKey(key);
  if (bonus === 5) return "field-bonus-inner";
  if (bonus === 3) return "field-bonus-middle";
  if (bonus === 1) return "field-bonus-outer";
  if (bonus === -1) return "field-bonus-negative";
  return "";
}

const faceCatalog = {
  shift: { name: "Shift", symbol: "Φ", subSymbol: "◈", tone: "action-light", left: "black" },
  conjugate: { name: "Conjugate", symbol: "Ψ*", subSymbol: "◈", tone: "action-light", left: "black" },
  rephase: { name: "Rephase", symbol: "≈", subSymbol: "◈", tone: "action-light", left: "white" },
  nullify: { name: "Nullify", symbol: "⊘", subSymbol: "◈", tone: "action-light", left: "white" },
  entangle: { name: "Entangle", symbol: "⊗", subSymbol: "◈", tone: "action", left: "black", right: "black" },
  resonate: { name: "Resonate", symbol: "⇄", subSymbol: "◈", tone: "action", left: "black", right: "black" },
  synchronize: { name: "Synchronize", symbol: "≡", subSymbol: "◈", tone: "action", left: "white", right: "white" },
  interfere: { name: "Interfere", symbol: "⇌", subSymbol: "◈", tone: "action", left: "white", right: "white" },
  tunneling: { name: "Tunneling", symbol: "↯", subSymbol: "◈", tone: "action", left: "white", right: "black" },
  bind: { name: "Bind", symbol: "⧓", subSymbol: "◈", tone: "action", left: "black", right: "white" },
  qubit: { name: "Qubit", symbol: "◈", subSymbol: "⬢", tone: "qubit" },
  decoherence: { name: "Decoherence", symbol: "Δ", tone: "decoherence" },
  superposition: { name: "Superposition", symbol: "Ψ", tone: "superposition" }
};

const startingDice = [
  ["shift", "entangle", "qubit", "qubit", "superposition", "superposition"],
  ["conjugate", "resonate", "qubit", "qubit", "superposition", "superposition"],
  ["rephase", "synchronize", "qubit", "qubit", "superposition", "superposition"],
  ["nullify", "interfere", "qubit", "qubit", "superposition", "superposition"],
  ["decoherence", "tunneling", "qubit", "qubit", "superposition", "superposition"],
  ["decoherence", "bind", "qubit", "qubit", "superposition", "superposition"]
];

const dieIcons = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

const actionRules = {
  entangle: { type: "relation", target: "superposition", count: 2 },
  resonate: { type: "relation", target: "superposition", count: 2 },
  tunneling: { type: "relation", target: "mixed", count: 2 },
  bind: { type: "relation", target: "mixed", count: 2 },
  synchronize: { type: "relation", target: "outcome", count: 2 },
  interfere: { type: "relation", target: "outcome", count: 2 },
  shift: { type: "modifier", target: "superposition", count: 1 },
  conjugate: { type: "modifier", target: "superposition", count: 1 },
  rephase: { type: "modifier", target: "outcome", count: 1 },
  nullify: { type: "modifier", target: "outcome", count: 1 },
  quantumDrift: { type: "relation", target: "mixed", count: 2 },
  quantumEcho: { type: "modifier", target: "superposition", count: 1 },
  resonanceLink: { type: "relation", target: "superposition", count: 1, variable: true },
  quantumWild: { type: "modifier", target: "psiOrOutcome", count: 1 },
  collapseDelay: { type: "modifier", target: "superposition", count: 1 },
  extraEntangle: { type: "relation", target: "superposition", count: 2 },
  extraResonate: { type: "relation", target: "superposition", count: 2 },
  extraShift: { type: "modifier", target: "superposition", count: 1 },
  extraConjugate: { type: "modifier", target: "superposition", count: 1 },
  extraTunneling: { type: "relation", target: "mixed", count: 2 },
  extraRephase: { type: "modifier", target: "outcome", count: 1 },
  extraBind: { type: "relation", target: "mixed", count: 2 },
  extraNullify: { type: "modifier", target: "outcome", count: 1 },
  extraSynchronize: { type: "relation", target: "outcome", count: 2 },
  extraInterfere: { type: "relation", target: "outcome", count: 2 },
  reQuantizeFace: { type: "modifier", target: "outcome", count: 1 }
};

const decoherenceThresholds = {
  deltaSwap: [7, 14, 21],
  drawCard: [4, 11, 18, 25],
  potentialLoss: new Map([]),
  instabilityGain: []
};

const instabilityLockThresholds = [4, 8, 13, 19, 26];
const stabilizerLockRanges = [
  [1, 3],
  [4, 7],
  [8, 12],
  [13, 18],
  [19, 25]
];

const stabilizerLockEffectRules = {
  "STABILIZER-01": { resource: "qubit", slots: [0] },
  "STABILIZER-02": { resource: "qubit", slots: [0] },
  "STABILIZER-03": { resource: "qubit", slots: [0] },
  "STABILIZER-04": { resource: "qubit", slots: [1] },
  "STABILIZER-05": { resource: "qubit", slots: [1] },
  "STABILIZER-06": { resource: "qubit", slots: [1] },
  "STABILIZER-07": { resource: "qubit", slots: [2] },
  "STABILIZER-08": { resource: "qubit", slots: [2] },
  "STABILIZER-09": { resource: "qubit", slots: [2] },
  "STABILIZER-10": { resource: "qubit", slots: [3] },
  "STABILIZER-11": { resource: "qubit", slots: [3] },
  "STABILIZER-12": { resource: "qubit", slots: [3] },
  "STABILIZER-13": { resource: "qubit", slots: [0, 1] },
  "STABILIZER-14": { resource: "qubit", slots: [2, 3] },
  "STABILIZER-15": { resource: "potential", slots: [0] },
  "STABILIZER-16": { resource: "potential", slots: [0] },
  "STABILIZER-17": { resource: "potential", slots: [1] },
  "STABILIZER-18": { resource: "potential", slots: [1] },
  "STABILIZER-19": { resource: "potential", slots: [2] },
  "STABILIZER-20": { resource: "potential", slots: [2] },
  "STABILIZER-21": { resource: "potential", slots: [3] },
  "STABILIZER-22": { resource: "potential", slots: [3] },
  "STABILIZER-23": { resource: "potential", slots: [0, 2] },
  "STABILIZER-24": { resource: "potential", slots: [1, 3] },
  "STABILIZER-25": { resource: "instability", slots: [0] },
  "STABILIZER-26": { resource: "instability", slots: [0] },
  "STABILIZER-27": { resource: "instability", slots: [1] },
  "STABILIZER-28": { resource: "instability", slots: [1] },
  "STABILIZER-29": { resource: "instability", slots: [2] },
  "STABILIZER-30": { resource: "instability", slots: [2] },
  "STABILIZER-31": { resource: "instability", slots: [3] },
  "STABILIZER-32": { resource: "instability", slots: [3] },
  "STABILIZER-33": { resource: "instability", slots: [0, 1, 2, 3], pairCount: true },
  "STABILIZER-34": { resource: "decoherence", slots: [0] },
  "STABILIZER-35": { resource: "decoherence", slots: [1] },
  "STABILIZER-36": { resource: "decoherence", slots: [2] },
  "STABILIZER-37": { resource: "decoherence", slots: [3] },
  "STABILIZER-38": { resource: "decoherence", slots: [2, 1] },
  "STABILIZER-39": { resource: "decoherence", slots: [0, 3] },
  "STABILIZER-40": { resource: "decoherence", slots: [0, 1, 2, 3], pairCount: true }
};

const actionTooltips = {
  entangle: "Entangle: Ψ1<2N1> OR Ψ2<2N2>",
  resonate: "Resonate: Ψ1<N1> + Ψ2<N2> OR |Ψ1<N1> - Ψ2<N2>|",
  tunneling: "Tunneling: Ψ1<max(N1, N2)> AND [min(N1, N2)]",
  bind: "Bind: Ψ1<N1=N2> AND [N2=0]",
  synchronize: "Synchronize: [min(N1, N2)]",
  interfere: "Interfere: [|N1 - N2|]",
  shift: "Shift: Ψ<N-1> OR Ψ<N> OR Ψ<N+1>",
  conjugate: "Conjugate: Ψ<N> OR Ψ<5-N>",
  rephase: "Rephase: [N] OR [5-N]",
  nullify: "Nullify: [N=0]"
};

Object.assign(faceCatalog, {
  quantumDrift: { name: "Quantum Drift", symbol: "Ψ|N", tone: "advanced-action", left: "black", right: "white" },
  collapseShield: { name: "Collapse Shield", symbol: "⛉", tone: "advanced-action" },
  reQuantizeFace: { name: "ReQuantize", symbol: "↻", tone: "advanced-action" },
  vectorJump: { name: "Vector Jump", symbol: "⇗", tone: "advanced-action" },
  instabilityDampener: { name: "Instability Dampener", symbol: "⧖", tone: "advanced-action dampener" },
  quantumEcho: { name: "Quantum Echo", symbol: "ΨΨ", tone: "advanced-action-deep", left: "black" },
  resonanceLink: { name: "Resonance Link", symbol: "∞", tone: "advanced-action-deep", quarters: "black" },
  entropicReset: { name: "Entropic Reset", symbol: "Ø", tone: "advanced-action-deep blue-symbol" },
  quantumWild: { name: "Quantum Wild", symbol: "★", tone: "advanced-action-deep", comboLeft: true },
  collapseDelay: { name: "Collapse Delay", symbol: "~", tone: "advanced-action-deep", left: "black" },
  suppressorMinus1: { name: "Collapse Suppressor -1", symbol: "Ψ", subSymbol: "-1⊟", tone: "suppressor" },
  suppressorMinus2: { name: "Collapse Suppressor -2", symbol: "Ψ", subSymbol: "-2⊟", tone: "suppressor" },
  suppressorMinus3: { name: "Collapse Suppressor -3", symbol: "Ψ", subSymbol: "-3⊟", tone: "suppressor" },
  suppressorZero: { name: "Collapse Suppressor 0", symbol: "Ψ", subSymbol: "0⊟", tone: "suppressor" },
  extraEntangle: { name: "Extra Entangle", symbol: "⊗", tone: "advanced-action", left: "black", right: "black" },
  extraResonate: { name: "Extra Resonate", symbol: "⇄", tone: "advanced-action", left: "black", right: "black" },
  extraShift: { name: "Extra Shift", symbol: "Φ", tone: "advanced-action", left: "black" },
  extraConjugate: { name: "Extra Conjugate", symbol: "Ψ*", tone: "advanced-action", left: "black" },
  extraTunneling: { name: "Extra Tunneling", symbol: "↯", tone: "advanced-action", left: "white", right: "black" },
  extraRephase: { name: "Extra Rephase", symbol: "≈", tone: "advanced-action", left: "white" },
  extraBind: { name: "Extra Bind", symbol: "⧓", tone: "advanced-action", left: "black", right: "white" },
  extraNullify: { name: "Extra Nullify", symbol: "⊘", tone: "advanced-action", left: "white" },
  extraSynchronize: { name: "Extra Synchronize", symbol: "≡", tone: "advanced-action", left: "white", right: "white" },
  extraInterfere: { name: "Extra Interfere", symbol: "⇌", tone: "advanced-action", left: "white", right: "white" },
  qubit2: { name: "2 Qubits", symbol: "2◈", tone: "qubit-advanced" },
  qubit3: { name: "3 Qubits", symbol: "3◈", tone: "qubit-advanced" },
  qubit4: { name: "4 Qubits", symbol: "4◈", tone: "qubit-advanced" },
  qubit5: { name: "5 Qubits", symbol: "5◈", tone: "qubit-advanced" }
});

Object.assign(actionTooltips, {
  quantumDrift: "Quantum Drift: Ψ<N1=N2> AND [N2=N1]",
  collapseShield: "Collapse Shield: ▶ ⊘⧖",
  reQuantizeFace: "ReQuantize: N⇄Ψ",
  vectorJump: "Vector Jump: ⇢▲↔⬡",
  instabilityDampener: "Instability Dampener: -⧖",
  quantumEcho: "Quantum Echo: Ψ<2N>",
  resonanceLink: "Resonance Link: Ψ<2N1> OR Ψ<2N2> OR ... OR Ψ<2Nk>",
  entropicReset: "Entropic Reset: ⚅⇄⚅",
  quantumWild: "Quantum Wild: Ψ:(N-1|N|N+1|5-N) OR N:(N|5-N|0)",
  collapseDelay: "Collapse Delay: Ψ⊘▣",
  suppressorMinus1: "Suppressor (-1⊟)",
  suppressorMinus2: "Suppressor (-2⊟)",
  suppressorMinus3: "Suppressor (-3⊟)",
  suppressorZero: "Suppressor (0⊟)",
  extraEntangle: "Extra Entangle: Ψ<3N1> OR Ψ<3N2>",
  extraResonate: "Extra Resonate: Ψ<2N1>+Ψ<2N2> OR |Ψ<2N1>-Ψ<2N2>|",
  extraShift: "Extra Shift: Ψ<N-2> OR Ψ<N-1> OR Ψ<N> OR Ψ<N+1> OR Ψ<N+2>",
  extraConjugate: "Extra Conjugate: Ψ<5+N> OR Ψ<N> OR Ψ<5-N>",
  extraTunneling: "Extra Tunneling: Ψ<max(2N1,2N2)> AND [min(2N1,2N2)]",
  extraRephase: "Extra Rephase: [5+N] OR [N] OR [5-N]",
  extraBind: "Extra Bind: Ψ<N1=2N2> AND [N2=0]",
  extraNullify: "Extra Nullify: [N=0] AND gain N⬢",
  extraSynchronize: "Extra Synchronize: [min(2,N1,N2)]",
  extraInterfere: "Extra Interfere: [min(2,|N1-N2|)]",
  qubit2: "2 Qubits",
  qubit3: "3 Qubits",
  qubit4: "4 Qubits",
  qubit5: "5 Qubits"
});

const diceLibraryRules = {
  qubit: "Resource: gain +1 qubit.",
  qubit2: "Resource: gain +2 qubits.",
  qubit3: "Resource: gain +3 qubits.",
  qubit4: "Resource: gain +4 qubits.",
  qubit5: "Resource: gain +5 qubits.",
  decoherence: "Global event: advance Decoherence by 1.",
  superposition: "Collapse die: rolls a random green value from 0 to 5 during collapse.",
  outcome: "Collapse die: uses its printed red value during collapse.",
  entangle: "Choose two free superpositions. On collapse, choose either 2x the first value or 2x the second value.",
  resonate: "Choose two free superpositions. On collapse, choose their sum or their absolute difference.",
  tunneling: "Choose one free superposition and one free outcome. On collapse, keep green max(value, outcome) and red min(value, outcome).",
  bind: "Choose one free superposition and one free outcome. On collapse, green becomes the outcome value and red becomes 0.",
  synchronize: "Choose two free outcomes. On collapse, the group red value is the smaller outcome.",
  interfere: "Choose two free outcomes. On collapse, the group red value is the absolute difference between them.",
  shift: "Choose one free superposition. On collapse, choose value -1, value, or value +1.",
  conjugate: "Choose one free superposition. On collapse, choose value or 5 - value.",
  rephase: "Choose one free outcome. On collapse, choose red outcome value or red 5 - outcome.",
  nullify: "Choose one free outcome. On collapse, the group value becomes 0.",
  quantumDrift: "Choose one free superposition and one free outcome. On collapse, green becomes the outcome value and red becomes the superposition value.",
  collapseShield: "Immediate face: click it to make the next Continue cost no instability.",
  reQuantizeFace: "Choose one free outcome. It immediately becomes a proper superposition and will roll a random green value on collapse.",
  vectorJump: "Immediate face: click it to move your vector to an adjacent owned tile or black tile.",
  instabilityDampener: "Immediate face: click it to reduce your instability by 1.",
  quantumEcho: "Choose one free superposition. On collapse, the group value is twice that superposition value.",
  resonanceLink: "Click it to group with all free superpositions. On collapse, choose 2x one of those values.",
  entropicReset: "Choose any die in the Collapse Pool, then flip it to one of its other faces. Action/qubit faces return to Dice Pool; superposition/outcome faces stay in Collapse Pool.",
  quantumWild: "Choose one free superposition or outcome. Superposition can become value -1, value, value +1, or 5 - value. Outcome can become outcome, 5 - outcome, or 0.",
  collapseDelay: "Choose one free superposition. On collapse, choose check to score it or X to delay it; delayed dice do not count in CV and stay superposition.",
  suppressorMinus1: "Acts as a superposition. When it flips into an outcome after collapse, the stored outcome is reduced by 1, minimum 0.",
  suppressorMinus2: "Acts as a superposition. When it flips into an outcome after collapse, the stored outcome is reduced by 2, minimum 0.",
  suppressorMinus3: "Acts as a superposition. When it flips into an outcome after collapse, the stored outcome is reduced by 3, minimum 0.",
  suppressorZero: "Acts as a superposition. When it flips into an outcome after collapse, the stored outcome becomes 0.",
  extraEntangle: "Choose two free superpositions. On collapse, choose either 3x the first value or 3x the second value.",
  extraResonate: "Choose two free superpositions. On collapse, choose 2x both values added together or the absolute difference between those doubled values.",
  extraShift: "Choose one free superposition. On collapse, choose value -2, -1, value, +1, or +2.",
  extraConjugate: "Choose one free superposition. On collapse, choose 5 + value, value, or 5 - value.",
  extraTunneling: "Choose one free superposition and one free outcome. On collapse, keep green max(2x both values) and red min(2x both values).",
  extraRephase: "Choose one free outcome. On collapse, choose red 5 + outcome, outcome, or 5 - outcome.",
  extraBind: "Choose one free superposition and one free outcome. On collapse, green becomes 2x the outcome value and red becomes 0.",
  extraNullify: "Choose one free outcome. On collapse, group value is 0; when resolved, immediately gain QP equal to that outcome value.",
  extraSynchronize: "Choose two free outcomes. On collapse, the group red value is min(2, first outcome, second outcome).",
  extraInterfere: "Choose two free outcomes. On collapse, the group red value is min(2, absolute difference)."
};

const diceLibraryUsage = {
  qubit: "This resolves automatically after rolling, then the die is disabled for the turn.",
  qubit2: "This resolves automatically after rolling, then the die is disabled for the turn.",
  qubit3: "This resolves automatically after rolling, then the die is disabled for the turn.",
  qubit4: "This resolves automatically after rolling, then the die is disabled for the turn.",
  qubit5: "This resolves automatically after rolling, then the die is disabled for the turn.",
  decoherence: "This resolves automatically. It cannot be clicked or selected for actions.",
  superposition: "This automatically moves to the Collapse Pool when rolled.",
  outcome: "This automatically moves to the Collapse Pool when rolled.",
  collapseShield: "Click it from the Dice Pool. It stays spent/disabled after use.",
  vectorJump: "Click it from the Dice Pool when a legal adjacent vector move exists.",
  instabilityDampener: "Click it from the Dice Pool. It stays spent/disabled after use.",
  entropicReset: "Click it from the Dice Pool when at least one die is in the Collapse Pool.",
  reQuantizeFace: "Click it from the Dice Pool, then select the outcome die to change.",
  resonanceLink: "Click it from the Dice Pool; all current free superpositions are gathered automatically."
};

const circuitUpgradeMap = {
  "CIRCUIT-01": { faceId: "quantumDrift", allowed: "actionOrQubit" },
  "CIRCUIT-02": { faceId: "collapseShield", allowed: "actionOrQubit" },
  "CIRCUIT-03": { faceId: "reQuantizeFace", allowed: "actionOrQubit" },
  "CIRCUIT-04": { faceId: "vectorJump", allowed: "actionOrQubit" },
  "CIRCUIT-05": { faceId: "instabilityDampener", allowed: "actionOrQubit" },
  "CIRCUIT-06": { faceId: "quantumEcho", allowed: "actionOrQubit" },
  "CIRCUIT-07": { faceId: "resonanceLink", allowed: "actionOrQubit" },
  "CIRCUIT-08": { faceId: "entropicReset", allowed: "actionOrQubit" },
  "CIRCUIT-09": { faceId: "quantumWild", allowed: "actionOrQubit" },
  "CIRCUIT-10": { faceId: "collapseDelay", allowed: "actionOrQubit" },
  "CIRCUIT-11": { faceId: "suppressorMinus1", allowed: "superposition" },
  "CIRCUIT-12": { faceId: "suppressorMinus1", allowed: "superposition" },
  "CIRCUIT-13": { faceId: "suppressorMinus1", allowed: "superposition" },
  "CIRCUIT-14": { faceId: "suppressorMinus2", allowed: "superposition" },
  "CIRCUIT-15": { faceId: "suppressorMinus2", allowed: "superposition" },
  "CIRCUIT-16": { faceId: "suppressorMinus2", allowed: "superposition" },
  "CIRCUIT-17": { faceId: "suppressorMinus3", allowed: "superposition" },
  "CIRCUIT-18": { faceId: "suppressorMinus3", allowed: "superposition" },
  "CIRCUIT-19": { faceId: "suppressorMinus3", allowed: "superposition" },
  "CIRCUIT-20": { faceId: "suppressorZero", allowed: "superposition" },
  "CIRCUIT-21": { faceId: "extraEntangle", allowedFace: "entangle" },
  "CIRCUIT-22": { faceId: "extraResonate", allowedFace: "resonate" },
  "CIRCUIT-23": { faceId: "extraShift", allowedFace: "shift" },
  "CIRCUIT-24": { faceId: "extraConjugate", allowedFace: "conjugate" },
  "CIRCUIT-25": { faceId: "extraTunneling", allowedFace: "tunneling" },
  "CIRCUIT-26": { faceId: "extraRephase", allowedFace: "rephase" },
  "CIRCUIT-27": { faceId: "extraBind", allowedFace: "bind" },
  "CIRCUIT-28": { faceId: "extraNullify", allowedFace: "nullify" },
  "CIRCUIT-29": { faceId: "extraSynchronize", allowedFace: "synchronize" },
  "CIRCUIT-30": { faceId: "extraInterfere", allowedFace: "interfere" },
  "CIRCUIT-31": { faceId: "qubit2", allowed: "qubitTier", maxTier: 1 },
  "CIRCUIT-32": { faceId: "qubit2", allowed: "qubitTier", maxTier: 1 },
  "CIRCUIT-33": { faceId: "qubit3", allowed: "qubitTier", maxTier: 2 },
  "CIRCUIT-34": { faceId: "qubit3", allowed: "qubitTier", maxTier: 2 },
  "CIRCUIT-35": { faceId: "qubit4", allowed: "qubitTier", maxTier: 3 },
  "CIRCUIT-36": { faceId: "qubit4", allowed: "qubitTier", maxTier: 3 },
  "CIRCUIT-37": { faceId: "qubit5", allowed: "qubitTier", maxTier: 4 },
  "CIRCUIT-38": { faceId: "qubit5", allowed: "qubitTier", maxTier: 4 },
  "CIRCUIT-39": { allowed: "manifold" },
  "CIRCUIT-40": { allowed: "manifold" }
};

function createTurnStats() {
  return {
    actionFacesAppeared: 0,
    actionsUsed: [],
    relationActionsUsed: 0,
    modifierActionsUsed: 0,
    deltaResolved: 0,
    collapseValue: null,
    heldApexDuringCollapse: false,
    collapsedPsiCount: 0,
    collapsedOutcomeCount: 0,
    collapsePsiOutcomeCount: 0,
    collapseDiceCount: 0,
    collapsePoolOnlyPsiOutcome: false,
    collapsePsiValues: [],
    uniquePsiWithoutModifiers: false,
    uniquePsiValues: false,
    placedTileColor: null,
    placedOnEdge: false,
    placedAdjacentWhite: false,
    placedAdjacentNonWhite: false,
    placedAdjacentNonBlack: false,
    vectorMovedIntoClusterSize: 0,
    lastPlacedKey: null
  };
}

function createProtocolEffects() {
  return {
    preCollapse: [],
    collapse: [],
    postPlacement: [],
    ignoreDuplicateOnce: false,
    apexMultiplier: 1
  };
}

const stateConditionRules = {
  "STATE-01": { condition: (ctx) => ctx.cv <= 3, apexCondition: (ctx) => ctx.cv <= 6 },
  "STATE-02": { condition: (ctx) => ctx.stats.collapsePsiOutcomeCount >= 2, apexCondition: (ctx) => ctx.stats.collapsePsiOutcomeCount >= 1 },
  "STATE-03": { condition: (ctx) => ctx.usedPsiModifier, apexCondition: (ctx) => ctx.stats.modifierActionsUsed >= 1 },
  "STATE-04": { condition: (ctx) => ctx.psiRelationGroupOfTwo, apexCondition: (ctx) => ctx.hasPsiRelationGroup },
  "STATE-05": { condition: (ctx) => ctx.stats.deltaResolved === 0, apexCondition: (ctx) => ctx.stats.deltaResolved >= 1 },
  "STATE-06": { condition: (ctx) => ctx.stats.placedTileColor === "green", apexCondition: (ctx) => ctx.stats.placedTileColor && ctx.stats.placedTileColor !== "black" },
  "STATE-07": { condition: (ctx) => ctx.stats.collapsedPsiCount === 1, apexCondition: (ctx) => ctx.stats.collapsedPsiCount >= 1 },
  "STATE-08": { condition: (ctx) => ctx.stats.actionsUsed.length === 0, apexCondition: (ctx) => ctx.stats.actionsUsed.length > 0 },
  "STATE-09": { condition: (ctx) => ctx.player.instability <= 3, apexCondition: (ctx) => ctx.player.instability <= 6 },
  "STATE-10": { condition: () => false, apexCondition: (ctx) => ctx.hasApex },
  "STATE-11": { condition: (ctx) => ctx.stats.collapsedPsiCount >= 3, apexCondition: (ctx) => ctx.stats.collapsedPsiCount >= 1 },
  "STATE-12": { condition: (ctx) => ctx.cv <= 6, apexCondition: (ctx) => ctx.cv <= 12 },
  "STATE-13": { condition: (ctx) => ctx.hasMixedRelationGroup, apexCondition: (ctx) => ctx.stats.relationActionsUsed >= 1 },
  "STATE-14": { condition: (ctx) => ctx.stats.uniquePsiValues, apexCondition: (ctx) => ctx.uniquePsiValueCount >= 2 },
  "STATE-15": { condition: (ctx) => ctx.stats.placedOnEdge, apexCondition: (ctx) => Boolean(ctx.stats.placedTileColor) },
  "STATE-16": { condition: (ctx) => ctx.stats.collapsedPsiCount === 2, apexCondition: (ctx) => ctx.stats.collapsedPsiCount >= 1 },
  "STATE-17": { condition: (ctx) => ctx.maxPsiRelationGroupSize >= 3, apexCondition: (ctx) => ctx.hasPsiRelationGroup },
  "STATE-18": { condition: (ctx) => ctx.stats.placedTileColor === "orange", apexCondition: (ctx) => isScoringTileColor(ctx.stats.placedTileColor) && ctx.stats.placedTileColor !== "orange" },
  "STATE-19": { condition: (ctx) => ctx.stats.deltaResolved >= 2, apexCondition: (ctx) => ctx.stats.deltaResolved >= 1 },
  "STATE-20": { condition: (ctx) => ctx.stats.placedAdjacentWhite, apexCondition: (ctx) => ctx.stats.placedAdjacentNonBlack },
  "STATE-21": { condition: (ctx) => between(ctx.cv, 7, 10), apexCondition: (ctx) => between(ctx.cv, 3, 15) },
  "STATE-22": { condition: (ctx) => ctx.stats.modifierActionsUsed >= 1, apexCondition: (ctx) => ctx.stats.actionsUsed.length >= 1 },
  "STATE-23": { condition: (ctx) => ctx.stats.collapsedPsiCount >= 4, apexCondition: (ctx) => ctx.stats.collapsedPsiCount >= 2 },
  "STATE-24": { condition: (ctx) => ctx.stats.relationActionsUsed >= 1 && ctx.stats.modifierActionsUsed >= 1, apexCondition: (ctx) => ctx.stats.actionsUsed.length >= 2 },
  "STATE-25": { condition: (ctx) => ctx.countControlled("orange") >= 3, apexCondition: (ctx) => ctx.countControlled("orange") >= 1 },
  "STATE-26": { condition: (ctx) => ctx.stats.vectorMovedIntoClusterSize >= 3, apexCondition: (ctx) => ctx.stats.vectorMovedIntoClusterSize >= 2 },
  "STATE-27": { condition: (ctx) => ctx.psiRelationGroupCount >= 2, apexCondition: (ctx) => ctx.psiRelationGroupCount >= 1 },
  "STATE-28": { condition: (ctx) => ctx.stats.actionsUsed.length === 2, apexCondition: (ctx) => ctx.stats.relationActionsUsed >= 1 },
  "STATE-29": { condition: (ctx) => ctx.cv >= 12, apexCondition: (ctx) => ctx.cv >= 6 },
  "STATE-30": { condition: (ctx) => ctx.stats.heldApexDuringCollapse && ctx.stats.collapsedPsiCount >= 3, apexCondition: (ctx) => ctx.stats.collapsedPsiCount >= 1 },
  "STATE-31": { condition: (ctx) => ctx.stats.collapseDiceCount > 0 && ctx.stats.collapsePoolOnlyPsiOutcome && ctx.stats.modifierActionsUsed === 0, apexCondition: () => true },
  "STATE-32": { condition: (ctx) => between(ctx.cv, 10, 15), apexCondition: (ctx) => between(ctx.cv, 5, 20) },
  "STATE-33": { condition: (ctx) => ctx.allSixPsiOutcomeCollapseDice, apexCondition: () => true },
  "STATE-34": { condition: (ctx) => ctx.stats.relationActionsUsed >= 1 && ctx.stats.modifierActionsUsed >= 1, apexCondition: (ctx) => ctx.stats.relationActionsUsed >= 1 || ctx.stats.modifierActionsUsed >= 1 },
  "STATE-35": { condition: (ctx) => ctx.stats.placedTileColor === "red", apexCondition: (ctx) => isScoringTileColor(ctx.stats.placedTileColor) && ctx.stats.placedTileColor !== "red" },
  "STATE-36": { condition: (ctx) => ctx.controlsLargestCluster, apexCondition: () => true },
  "STATE-37": { condition: (ctx) => ctx.controlsMostWhite, apexCondition: () => true },
  "STATE-38": { condition: (ctx) => ctx.cv >= 15, apexCondition: (ctx) => ctx.cv >= 7 },
  "STATE-39": { condition: () => gameState.decoherence >= 24, apexCondition: () => gameState.decoherence >= 12 },
  "STATE-40": { condition: (ctx) => ctx.stats.heldApexDuringCollapse && ctx.stats.placedTileColor === "red" && ctx.stats.collapsedPsiCount >= 3, apexCondition: () => true }
};

function between(value, min, max) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function clampOutcomeFaceValue(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.min(5, Math.round(numericValue)));
}

function isScoringTileColor(color) {
  return ["violet", "green", "orange", "red"].includes(color);
}

function createStartingDice() {
  const outcomeValues = shuffleCards([0, 1, 2, 3, 4, 5]);
  return startingDice.map((faces, index) => ({
    id: `d${index + 1}`,
    name: `Die ${index + 1}`,
    faces: materializeDieFaces(faces, outcomeValues[index]),
    rolledFaceId: null,
    rolledFaceIndex: null,
    outcomeValue: null,
    location: "dice",
    disabled: false,
    groupId: null
  }));
}

function materializeDieFaces(faces, outcomeValue) {
  let convertedOutcome = false;
  return faces.map((faceId) => {
    if (faceId === "superposition" && !convertedOutcome) {
      convertedOutcome = true;
      return { id: "outcome", outcomeValue };
    }
    return { id: faceId };
  });
}

function initializePlayerDice() {
  players.forEach((player) => {
    gameState.diceByPlayer[player.id] = createStartingDice();
    gameState.groupsByPlayer[player.id] = [];
    gameState.tempPotentialByPlayer[player.id] = 0;
    gameState.turnStatsByPlayer[player.id] = createTurnStats();
    gameState.protocolEffectsByPlayer[player.id] = createProtocolEffects();
  });
}

function configureTutorialDice() {
  if (!gameState.tutorialMode) return;
  const tutorialOutcomes = [1, 3, 0, 2, 5, 4];
  players.forEach((player) => {
    (gameState.diceByPlayer[player.id] || []).forEach((die, index) => {
      die.faces.forEach((face) => {
        if (face.id === "outcome") face.outcomeValue = tutorialOutcomes[index] ?? 0;
      });
    });
  });
}

function cardById(cardId) {
  return window.QuantumFluxCards.cards.find((card) => card.id === cardId);
}

function configureTutorialCards() {
  if (!gameState.tutorialMode) return;
  const cardsFor = (ids) => ids.map(cardById).filter(Boolean);
  const you = playerById("p1");
  const other = playerById("p2");
  gameState.handsByPlayer.p1 = cardsFor(["PROTOCOL-26", "PROTOCOL-22", "STATE-09"]);
  gameState.handsByPlayer.p2 = cardsFor(["STATE-36", "CIRCUIT-12", "CIRCUIT-30"]);
  players.forEach((player) => {
    gameState.facedownStabilizersByPlayer[player.id] = cardsFor(["STABILIZER-01", "STABILIZER-02", "STABILIZER-03", "STABILIZER-04", "STABILIZER-05"]);
    gameState.playedCardsByPlayer[player.id] = {
      circuits: [],
      states: [],
      protocols: [],
      stabilizers: Array.from({ length: 5 }, () => null)
    };
  });
  if (you) {
    you.qubits = 0;
    you.potential = 0;
    you.trackPotential = 0;
  }
  if (other) {
    other.qubits = 0;
    other.potential = 1;
    other.trackPotential = 1;
  }
}

function initializeDeckAndHands() {
  if (gameState.gameMode === "flux") {
    initializeFluxDecksAndHands();
    return;
  }
  const enabledTypes = new Set(Object.entries(gameState.testDeckTypes)
    .filter(([, enabled]) => enabled)
    .map(([type]) => type));
  gameState.deck = shuffleCards(window.QuantumFluxCards.cards.filter((card) => enabledTypes.has(card.type)));
  players.forEach((player) => {
    gameState.handsByPlayer[player.id] = gameState.deck.splice(0, 3);
    gameState.facedownStabilizersByPlayer[player.id] = gameState.deck.splice(0, 5);
    gameState.playedCardsByPlayer[player.id] = {
      circuits: [],
      states: [],
      protocols: [],
      stabilizers: Array.from({ length: 5 }, () => null)
    };
  });
}

function initializeFluxDecksAndHands() {
  const byType = {
    protocol: shuffleCards(window.QuantumFluxCards.cards.filter((card) => card.type === "protocol")),
    circuit: shuffleCards(window.QuantumFluxCards.cards.filter((card) => card.type === "circuit")),
    stabilizer: shuffleCards(window.QuantumFluxCards.cards.filter((card) => card.type === "stabilizer")),
    state: shuffleCards(window.QuantumFluxCards.cards.filter((card) => card.type === "state"))
  };
  const playerDeckCards = new Set();
  const facedownCards = new Set();

  players.forEach((player) => {
    const personalDeck = [
      ...byType.protocol.splice(0, 5),
      ...byType.circuit.splice(0, 5),
      ...byType.state.splice(0, 5)
    ];
    const facedown = byType.stabilizer.splice(0, 5);
    personalDeck.forEach((card) => playerDeckCards.add(card.id));
    facedown.forEach((card) => facedownCards.add(card.id));
    gameState.personalDecksByPlayer[player.id] = shuffleCards(personalDeck);
    gameState.handsByPlayer[player.id] = gameState.personalDecksByPlayer[player.id].splice(0, 3);
    gameState.facedownStabilizersByPlayer[player.id] = facedown;
    gameState.playedCardsByPlayer[player.id] = {
      circuits: [],
      states: [],
      protocols: [],
      stabilizers: Array.from({ length: 5 }, () => null)
    };
  });

  gameState.deck = shuffleCards(window.QuantumFluxCards.cards.filter((card) => (
    !playerDeckCards.has(card.id) && !facedownCards.has(card.id)
  )));
}

function resetGameState() {
  Object.assign(gameState, {
    activePlayerId: players[0].id,
    decoherence: 0,
    apexHolderId: null,
    gameEndTriggered: false,
    gameOver: false,
    finalScoringAccepted: false,
    round: 1,
    turnIndex: 0,
    roundOrderIds: players.map((player) => player.id),
    phase: "roll",
    diceByPlayer: {},
    groupsByPlayer: {},
    collapseByPlayer: {},
    tiles: {
      "0,0": { color: "white", cv: null, ownerId: null }
    },
    vectorsByPlayer: {},
    pendingPlacement: null,
    pendingAction: null,
    selectedQubits: [],
    selectedHandCardIndex: null,
    deltaSwapQueue: [],
    tempPotentialByPlayer: {},
    gameMode: gameState.gameMode,
    deck: [],
    personalDecksByPlayer: {},
    discardPile: [],
    triggeredFluxDecoherenceThresholds: [],
    pendingBotCardReveal: null,
    testDeckTypes: { ...gameState.testDeckTypes },
    testStartPotential: gameState.testStartPotential,
    testStartQubits: gameState.testStartQubits,
    handsByPlayer: {},
    facedownStabilizersByPlayer: {},
    playedCardsByPlayer: {},
    pendingStabilizerPlay: null,
    pendingStabilizerSelection: null,
    stabilizerTurnDataByPlayer: {},
    pendingCircuitUpgrade: null,
    pendingVectorJump: null,
    pendingEntropicReset: null,
    pendingProtocolSelection: null,
    pendingProtocolBoardSelection: null,
    pendingProtocolGroupSelection: null,
    pendingProtocolScoringSelection: null,
    pendingProtocolChoice: null,
    pendingProtocolValueChoice: null,
    protocolEffectsByPlayer: {},
    tutorialMode: false,
    tutorialStep: 0,
    tutorialRollIndex: 0,
    tutorialCollapseIndex: 0,
    tutorialPlacementIndex: 0,
    tutorialTurnStartId: null,
    log: [],
    turnStatsByPlayer: {}
  });
}

function shuffleCards(cardsToShuffle) {
  for (let index = cardsToShuffle.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cardsToShuffle[index], cardsToShuffle[swapIndex]] = [cardsToShuffle[swapIndex], cardsToShuffle[index]];
  }
  return cardsToShuffle;
}

function activePlayer() {
  return players.find((player) => player.id === gameState.activePlayerId);
}

function activeTurnStats() {
  if (!gameState.turnStatsByPlayer[gameState.activePlayerId]) {
    gameState.turnStatsByPlayer[gameState.activePlayerId] = createTurnStats();
  }
  return gameState.turnStatsByPlayer[gameState.activePlayerId];
}

function activeProtocolEffects() {
  if (!gameState.protocolEffectsByPlayer[gameState.activePlayerId]) {
    gameState.protocolEffectsByPlayer[gameState.activePlayerId] = createProtocolEffects();
  }
  return gameState.protocolEffectsByPlayer[gameState.activePlayerId];
}

function playerById(id) {
  return players.find((player) => player.id === id);
}

function playerNameMarkup(player) {
  if (!player) return "None";
  return `<span class="player-name-colored" style="--player-color:${player.color}">${player.name}</span>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function logAction(message, options = {}) {
  const entry = {
    message,
    playerId: options.playerId || null,
    type: options.type || "normal",
    round: gameState.round,
    turn: gameState.turnIndex + 1,
    time: Date.now()
  };
  gameState.log.unshift(entry);
  if (gameState.log.length > 160) gameState.log.length = 160;
}

function logPlayerAction(player, message, type = "normal") {
  logAction(message, { playerId: player?.id, type });
}

function renderActionLog() {
  const container = document.querySelector("#action-log");
  if (!container) return;
  const entries = (gameState.log || []).slice(0, 80);
  container.innerHTML = entries.map((entry) => {
    if (typeof entry === "string") {
      return `<div class="log-entry global"><span class="log-turn">R${gameState.round}</span><span class="log-message">${escapeHtml(entry)}</span></div>`;
    }
    const player = entry.playerId ? playerById(entry.playerId) : null;
    const playerLabel = player
      ? `<span class="log-player-name" style="--player-color:${player.color}">${escapeHtml(player.name)}</span> `
      : "";
    return `
      <div class="log-entry ${escapeAttribute(entry.type || "normal")}">
        <span class="log-turn">R${entry.round}.${entry.turn}</span>
        <span class="log-message">${playerLabel}${escapeHtml(entry.message)}</span>
      </div>
    `;
  }).join("");
}

function renderPlayerSummary() {
  const summary = document.querySelector("#player-summary");
  const activeId = gameState.activePlayerId;
  summary.innerHTML = orderedPlayers()
    .map((player) => {
      const hasApex = gameState.apexHolderId === player.id;
      const activeClass = activeId === player.id ? "active" : "";
      return `
        <article class="player-card ${activeClass}" style="--player-color: ${player.color}">
          <div class="player-name-line">
            <strong>${player.name}</strong>
            ${player.bot ? '<span class="bot-badge">BOT</span>' : ""}
            ${hasApex ? '<span class="apex-badge">Apex</span>' : ""}
          </div>
          <div class="player-stats">
            <span>${player.potential} ⬢</span>
            <span>${player.qubits} ◈</span>
            <span>${player.instability} ⧖</span>
            ${player.pendingDeltaSwaps ? `<span>Δ swap ${player.pendingDeltaSwaps}</span>` : ""}
          </div>
        </article>
      `;
    })
    .join("");
}

function orderedPlayers() {
  return gameState.roundOrderIds.map((id) => playerById(id)).filter(Boolean);
}

function orderPlayersByApexTrack() {
  return [...players].sort((left, right) => {
    const apexDelta = (right.apex ?? -99) - (left.apex ?? -99);
    if (apexDelta !== 0) return apexDelta;
    return players.findIndex((player) => player.id === left.id) - players.findIndex((player) => player.id === right.id);
  });
}

function polarPoint(radius, angleDegrees, center = 50) {
  const angle = (angleDegrees - 90) * (Math.PI / 180);
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle)
  };
}

function renderScoreTrack() {
  const track = document.querySelector("#score-track");
  const cells = [];
  for (let value = 0; value < QP_TRACK_SIZE; value += 1) {
    const angle = scoreTrackAngle(value);
    const point = polarPoint(46.2, angle);
    const label = value === 0 ? "⬢" : value % 5 === 0 ? value : "";
    cells.push(
      `<div class="score-cell ${value >= QP_TRACK_SIZE - QP_TRACK_NEGATIVE_SPOTS ? "negative-zone" : ""}" style="left:${point.x}%;top:${point.y}%;--angle:${angle + 90}deg">${label}</div>`
    );
  }
  players.forEach((player) => {
    const scoreValue = potentialToScoreTrackValue(player.trackPotential ?? player.potential);
    const angle = scoreTrackAngle(scoreValue);
    const point = polarPoint(46.2, angle);
    cells.push(
      `<span class="score-marker" style="left:${point.x}%;top:${point.y}%;--marker-color:${player.color}">⬢</span>`
    );
  });
  track.innerHTML = cells.join("");
}

function potentialToScoreTrackValue(potential) {
  if (potential < 0) return Math.max(QP_TRACK_SIZE - QP_TRACK_NEGATIVE_SPOTS, QP_TRACK_SIZE + potential);
  return Math.min(QP_TRACK_MAX, potential);
}

function scoreTrackAngle(value) {
  return value * (360 / QP_TRACK_SIZE);
}

function movePlayerPotential(player, amount) {
  const steps = Math.abs(Number(amount));
  const direction = Math.sign(Number(amount));
  if (!Number.isFinite(steps) || !direction) return;

  const before = player.trackPotential ?? player.potential;
  for (let step = 0; step < steps; step += 1) {
    player.trackPotential = nextOpenPotentialValue(player, direction);
  }
  player.potential = player.trackPotential;
  logPlayerAction(player, `${amount > 0 ? "gains" : "loses"} ${Math.abs(amount)}⬢ (${before} → ${player.trackPotential}).`, "resource");
  playSound(amount > 0 ? "success" : "fail");
}

function nextOpenPotentialValue(player, direction) {
  let candidate = (player.trackPotential ?? player.potential) + direction;
  const lowerBound = QP_TRACK_MIN;
  const upperBound = QP_TRACK_MAX;

  for (let attempts = 0; attempts < QP_TRACK_SIZE; attempts += 1) {
    candidate = Math.max(lowerBound, Math.min(upperBound, candidate));
    if (!isPotentialTrackSpotTaken(candidate, player.id)) return candidate;
    candidate += direction;
  }

  return Math.max(lowerBound, Math.min(upperBound, candidate));
}

function isPotentialTrackSpotTaken(potential, movingPlayerId) {
  const scoreValue = potentialToScoreTrackValue(potential);
  return players.some((player) => player.id !== movingPlayerId && potentialToScoreTrackValue(player.trackPotential ?? player.potential) === scoreValue);
}

function renderCurvedTrack(selector, options) {
  const root = document.querySelector(selector);
  const cells = [];
  let firstPoint = null;
  let firstAngle = null;
  for (let index = 0; index < options.values.length; index += 1) {
    const value = options.values[index];
    const progress = options.values.length === 1 ? 0 : index / (options.values.length - 1);
    const angle = options.startAngle + progress * (options.endAngle - options.startAngle);
    const point = polarPoint(options.radius, angle, 50);
    point.x += options.offsetX || 0;
    point.y += options.offsetY || 0;
    if (index === 0) {
      firstPoint = point;
      firstAngle = angle;
    }
    const marker = options.markerFor?.(value);
    const hiddenLabel = options.hiddenLabels?.includes(value);
    const label = marker || (!hiddenLabel && Number.isInteger(value) && value % 5 === 0 ? value : "");
    const classes = options.classFor?.(value) || "";
    const token = options.tokenFor?.(value) || "";
    cells.push(
      `<div class="track-cell ${options.cellClass} ${classes}" style="left:${point.x}%;top:${point.y}%;transform:rotate(${angle}deg)">${label}${token}</div>`
    );
  }
  if (options.beforeToken && firstPoint) {
    const beforePoint = polarPoint(options.radius, firstAngle + 9, 50);
    beforePoint.x += options.offsetX || 0;
    beforePoint.y += options.offsetY || 0;
    cells.push(
      `<span class="track-before-marker" style="left:${beforePoint.x}%;top:${beforePoint.y}%">${options.beforeToken}</span>`
    );
  }
  root.innerHTML = cells.join("");
}

function renderApexTrack() {
  const values = [-4, -3, -2, -1, ...Array.from({ length: 31 }, (_, index) => index)];
  const playerMarkers = new Map(players.map((player) => [player.apex, player]));
  renderCurvedTrack("#apex-track", {
    values,
    radius: 42.7,
    startAngle: -70,
    endAngle: 96,
    offsetY: 0,
    cellClass: "apex-cell",
    classFor: (value) => (value < 0 ? "negative" : value === 0 ? "zero" : ""),
    markerFor: (value) => (value < 0 ? "✦" : value === 0 ? '<span class="apex-draw-icon">⧉</span>' : [6, 11, 16, 21, 26].includes(value) ? "⧉" : ""),
    tokenFor: (value) => {
      const player = playerMarkers.get(value);
      return player ? `<span class="apex-player-marker" style="--marker-color:${player.color}">✦</span>` : "";
    }
  });
}

function renderDecoherenceTrack() {
  const deltaSpots = decoherenceThresholds.deltaSwap;
  const cardSpots = decoherenceThresholds.drawCard;
  const potentialSpots = decoherenceThresholds.potentialLoss;
  const instabilitySpots = decoherenceThresholds.instabilityGain;
  const triggeredFluxThresholds = new Set(gameState.triggeredFluxDecoherenceThresholds || []);
  const thresholdMarker = (value, symbol) => {
    if (gameState.gameMode !== "flux" || (symbol !== "Δ" && symbol !== "⧉")) return symbol;
    return `<span class="flux-threshold-marker ${triggeredFluxThresholds.has(value) ? "spent" : "active"}">${symbol}</span>`;
  };

  renderCurvedTrack("#decoherence-track", {
    values: Array.from({ length: DECOHERENCE_MAX + 1 }, (_, index) => index),
    radius: 42.7,
    startAngle: 255,
    endAngle: 128,
    offsetY: 0,
    hiddenLabels: Array.from({ length: DECOHERENCE_MAX + 1 }, (_, index) => index),
    cellClass: "deco-cell",
    classFor: (value) => {
      if (value === 0) return "start";
      if (value === DECOHERENCE_MAX) return "final";
      if (value <= 7) return "green";
      if (value <= 14) return "yellow";
      if (value <= 21) return "orange";
      return "red";
    },
    markerFor: (value) => {
      if (deltaSpots.includes(value)) return thresholdMarker(value, "Δ");
      if (cardSpots.includes(value)) return thresholdMarker(value, "⧉");
      if (potentialSpots.has(value)) return potentialSpots.get(value);
      if (instabilitySpots.includes(value)) return "+⧖";
      return "";
    },
    tokenFor: (value) => (value === gameState.decoherence ? '<span class="decoherence-track-marker">Δ</span>' : "")
  });
}

function axialToPixel(q, r) {
  const size = 34;
  return {
    x: 310 + size * 1.5 * q,
    y: 280 + size * Math.sqrt(3) * (r + q / 2)
  };
}

const axialDirections = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1]
];

function buildHexes() {
  const hexes = [];
  const radius = 4;
  for (let q = -radius; q <= radius; q += 1) {
    for (let r = -radius; r <= radius; r += 1) {
      const s = -q - r;
      if (Math.abs(s) <= radius) {
        hexes.push({ q, r, key: `${q},${r}` });
      }
    }
  }
  return hexes;
}

function renderHexField() {
  const field = document.querySelector("#hex-field");
  const placements = availablePlacements();
  const vectorJumpTargets = availableVectorJumpTargets();
  const protocolBoardTargets = availableProtocolBoardTargets();
  const placement = gameState.pendingPlacement;
  field.innerHTML = buildHexes()
    .map((hex) => {
      const base = specialHexes.get(hex.key) || { type: "empty", label: "" };
      const tile = gameState.tiles[hex.key];
      const fieldBonus = fieldPlacementBonusForKey(hex.key);
      const fieldBonusType = fieldPlacementBonusType(hex.key);
      const placementKind = placements.get(hex.key);
      const vectorJumpKind = vectorJumpTargets.has(hex.key) ? "vector-jump" : "";
      const protocolBoardKind = protocolBoardTargets.has(hex.key) ? "protocol" : "";
      const placementScore = placementKind ? projectedPlacementPotential(hex.key, placementKind) : null;
      const rewardPreview = placementKind && !tile && base.label ? `<span class="placement-reward-preview">${base.label}</span>` : "";
      const point = axialToPixel(hex.q, hex.r);
      const centerClass = hex.key === "0,0" ? "center" : "";
      const tileClass = tile ? `placed tile-${tile.color}` : `${base.type} ${!base.label ? fieldBonusType : ""}`;
      const availableClass = placementKind ? ` placement-available placement-${placementKind}` : vectorJumpKind ? " placement-available placement-vector-jump" : protocolBoardKind ? " placement-available placement-vector-jump" : "";
      const owner = tile?.ownerId ? playerById(tile.ownerId) : null;
      const vectorOwner = players.find((player) => gameState.vectorsByPlayer[player.id] === hex.key);
      const valueMarkup = tile && Number.isFinite(tile.cv) ? `<span class="tile-cv ${tile.cv < 0 ? "negative" : tile.cv === 0 ? "zero" : "positive"}">${tile.cv}</span>` : "";
      const projectionMarkup = placementScore !== null ? `<span class="placement-qp-preview ${placementScore < 0 ? "negative" : placementScore === 0 ? "zero" : "positive"}">${formatSigned(placementScore)}⬢</span>` : "";
      const ownerMarkup = owner
        ? `<svg class="owner-frame" viewBox="0 0 100 86" aria-hidden="true"><polygon points="25,3 75,3 98,43 75,83 25,83 2,43" fill="none" stroke="${owner.color}" stroke-width="9" stroke-linejoin="round" /></svg>`
        : "";
      const vectorMarkup = vectorOwner ? `<span class="vector-frame" style="--owner-color:${vectorOwner.color}"></span>` : "";
      const zeroPointChoiceMarkup =
        gameState.pendingProtocolBoardSelection?.id === "zeroPointExpansion" &&
        gameState.pendingProtocolBoardSelection.playerId === gameState.activePlayerId &&
        gameState.pendingProtocolBoardSelection.targetKey === hex.key
          ? `
            <span class="zero-point-choice-row">
              <span class="zero-point-choice keep" data-zero-point-choice="green">⬢</span>
              <span class="zero-point-choice convert" data-zero-point-choice="white">⬢</span>
            </span>
          `
          : "";
      const fieldBonusMarkup = !tile && !base.label && fieldBonus ? `<span class="field-bonus-label">${fieldBonus}⬢</span>` : "";
      const label = tile ? "" : base.label;
      return `
        <button
          type="button"
          class="hex ${tileClass} ${centerClass}${availableClass}"
          style="left:${point.x}px;top:${point.y}px;"
          data-hex-key="${hex.key}"
          title="Field ${hex.key}"
        >
          <span>${label}</span>
          ${fieldBonusMarkup}
          ${valueMarkup}
          ${projectionMarkup}
          ${rewardPreview}
          ${ownerMarkup}
          ${vectorMarkup}
          ${zeroPointChoiceMarkup}
        </button>
      `;
    })
    .join("");
}

function renderDecoherenceMeter() {
  const meter = document.querySelector("#decoherence-meter");
  const cells = Array.from({ length: DECOHERENCE_MAX + 1 }, (_, value) => {
    const color =
      value === 0 ? "start" :
      value === DECOHERENCE_MAX ? "black" :
      value <= 7 ? "green" :
      value <= 14 ? "yellow" :
      value <= 21 ? "orange" :
      "red";
    return `<span class="meter-cell ${color}"></span>`;
  }).join("");
  const stageCenters = {
    start: 100 * 0.5 / (DECOHERENCE_MAX + 1),
    green: 100 * 4.5 / (DECOHERENCE_MAX + 1),
    yellow: 100 * 11.5 / (DECOHERENCE_MAX + 1),
    orange: 100 * 18.5 / (DECOHERENCE_MAX + 1),
    red: 100 * 25.5 / (DECOHERENCE_MAX + 1),
    black: 100 * 29.5 / (DECOHERENCE_MAX + 1)
  };
  const stage =
    gameState.decoherence === 0 ? "start" :
    gameState.decoherence >= DECOHERENCE_MAX ? "black" :
    gameState.decoherence <= 7 ? "green" : gameState.decoherence <= 14 ? "yellow" : gameState.decoherence <= 21 ? "orange" : "red";
  meter.innerHTML = `${cells}<span class="meter-marker" style="left:${stageCenters[stage]}%">Δ</span>`;
}

function renderHand() {
  const hand = gameState.handsByPlayer[gameState.activePlayerId] || [];
  const player = activePlayer();
  if (player?.bot) {
    document.querySelector("#hand-area").innerHTML = hand
      .map(() => '<div class="hand-card-shell bot-hand-card" title="Bot card hidden"><span class="hand-card-back"></span></div>')
      .join("");
    return;
  }
  document.querySelector("#hand-area").innerHTML = hand
    .map((card, index) => {
      const playableClass = canAffordCard(player, card) ? " playable-card" : "";
      return `<button type="button" class="hand-card-shell${playableClass}" data-hand-index="${index}" data-card-id="${card.id}">${window.QuantumFluxCardRenderer.renderCard(card)}</button>`;
    })
    .join("");
}

function canAffordCard(player, card) {
  const cost = playableCardCost(player, card);
  if (!Number.isFinite(cost)) return false;
  if (!canPlayCardNow(card)) return false;
  const played = gameState.playedCardsByPlayer[player.id];
  if (card.type === "stabilizer") return player.potential >= cost && hasOpenStabilizerSlot(player);
  if (player.qubits < cost) return false;
  if (card.type === "protocol" || card.type === "state") return cardConditionMet(player, card);
  return true;
}

function canPlayCardNow(card) {
  if (
    gameState.gameOver ||
    hasPendingDeltaSwap() ||
    gameState.pendingCircuitUpgrade ||
    gameState.pendingEntropicReset ||
    gameState.pendingProtocolSelection ||
    gameState.pendingProtocolBoardSelection ||
    gameState.pendingProtocolGroupSelection ||
    gameState.pendingProtocolScoringSelection ||
    gameState.pendingProtocolChoice ||
    gameState.pendingProtocolValueChoice
  ) return false;
  if (card.type === "circuit") return ["roll", "post-placement"].includes(gameState.phase);
  if (card.type === "state") return gameState.phase === "post-placement";
  if (card.type === "protocol") return canPlayProtocolNow(card);
  return true;
}

function canPlayProtocolNow(card) {
  const timings = card.timing || ["any"];
  if (timings.includes("any")) return ["roll", "action-select", "collapsed", "tile-placement", "post-placement"].includes(gameState.phase);
  return timings.some((timing) => {
    if (timing === "action") return gameState.phase === "action-select";
    if (timing === "before-collapse") return gameState.phase === "action-select";
    if (timing === "collapse-resolving") return gameState.phase === "collapse-resolving";
    if (timing === "collapsed") return gameState.phase === "collapsed";
    if (timing === "tile-placement") return gameState.phase === "tile-placement";
    if (timing === "post-placement") return gameState.phase === "post-placement";
    if (timing === "roll") return gameState.phase === "roll";
    return false;
  });
}

function hasOpenStabilizerSlot(player) {
  return [0, 1, 2, 3, 4].some((index) => isOpenStabilizerSlot(player, index));
}

function isOpenStabilizerSlot(player, index) {
  const facedownCards = gameState.facedownStabilizersByPlayer[player.id] || [];
  const played = gameState.playedCardsByPlayer[player.id]?.stabilizers || [];
  return !facedownCards[index] && !played[index];
}

function cardConditionMet(player, card) {
  if (card.type === "protocol") {
    const minPotential = Number(card.playCondition?.minPotential ?? 0);
    return player.potential >= minPotential;
  }
  if (card.type === "state") return (card.decoherenceFlag?.includes(currentDecoherenceColor()) ?? false) && stateConditionMet(player, card);
  return true;
}

function stateConditionMet(player, card) {
  const rule = stateConditionRules[card.id];
  if (!rule) return false;
  const ctx = buildStateConditionContext(player);
  return Boolean(rule.condition?.(ctx) || (ctx.hasApex && rule.apexCondition?.(ctx)));
}

function playableCardCost(player, card) {
  if (card.type === "circuit" && gameState.apexHolderId === player.id) {
    const apexCost = Number(card.apexCost);
    if (Number.isFinite(apexCost)) return apexCost;
  }
  return Number(card.cost);
}

function currentDecoherenceColor() {
  if (gameState.decoherence <= 7) return "green";
  if (gameState.decoherence <= 14) return "yellow";
  if (gameState.decoherence <= 21) return "orange";
  return "red";
}

function buildStateConditionContext(player) {
  const stats = gameState.turnStatsByPlayer[player.id] || createTurnStats();
  const dice = gameState.diceByPlayer[player.id] || [];
  const groups = gameState.groupsByPlayer[player.id] || [];
  const actionsUsed = stats.actionsUsed || [];
  const ctx = {
    player,
    stats,
    dice,
    groups,
    hasApex: gameState.apexHolderId === player.id,
    cv: Number.isFinite(stats.collapseValue) ? stats.collapseValue : -Infinity,
    currentPsiCount: dice.filter((die) => isSuperpositionFaceId(die.rolledFaceId)).length,
    allSixCollapseDice: dice.filter((die) => die.location === "collapse").length === 6,
    allSixPsiOutcomeCollapseDice: stats.collapsePsiOutcomeCount === 6 && stats.collapsePoolOnlyPsiOutcome,
    maxPsiRelationGroupSize: maxPsiRelationGroupSize(groups),
    maxResonanceLinkGroupSize: maxResonanceLinkGroupSize(groups),
    psiRelationGroupCount: psiRelationGroupCount(groups),
    hasPsiRelationGroup: psiRelationGroupCount(groups) > 0,
    psiRelationGroupOfTwo: hasPsiRelationGroupOfSize(groups, 2),
    hasMixedRelationGroup: hasMixedRelationGroup(groups),
    usedPsiModifier: hasPsiModifierGroup(groups),
    uniquePsiValueCount: new Set(stats.collapsePsiValues).size,
    entangledDiceCount: entangledDiceCount(groups),
    countControlled: (color) => countControlledTiles(player.id, color),
    countUsed: (ids) => actionsUsed.filter((id) => ids.includes(id)).length,
    used: (id) => actionsUsed.includes(id),
    usedAny: (ids) => ids.some((id) => actionsUsed.includes(id)),
    usedActionOtherThan: (ids) => actionsUsed.some((id) => !ids.includes(id)),
    controlsLargestCluster: controlsLargestCluster(player.id),
    controlsMostWhite: controlsMostColor(player.id, "white")
  };
  return ctx;
}

function maxPsiRelationGroupSize(groups) {
  return groups.reduce((max, group) => {
    const action = dieById(group.actionDieId)?.rolledFaceId;
    if (actionRules[action]?.type !== "relation") return max;
    const psiCount = group.targetIds.filter((id) => isSuperpositionFaceId(dieById(id)?.rolledFaceId)).length;
    return Math.max(max, psiCount);
  }, 0);
}

function psiRelationGroupCount(groups) {
  return groups.filter((group) => {
    const action = dieById(group.actionDieId)?.rolledFaceId;
    return actionRules[action]?.type === "relation" && group.targetIds.some((id) => isSuperpositionFaceId(dieById(id)?.rolledFaceId));
  }).length;
}

function hasPsiRelationGroupOfSize(groups, size) {
  return groups.some((group) => {
    const action = dieById(group.actionDieId)?.rolledFaceId;
    if (actionRules[action]?.type !== "relation") return false;
    return group.targetIds.filter((id) => isSuperpositionFaceId(dieById(id)?.rolledFaceId)).length === size;
  });
}

function hasMixedRelationGroup(groups) {
  return groups.some((group) => {
    const action = dieById(group.actionDieId)?.rolledFaceId;
    if (actionRules[action]?.type !== "relation") return false;
    const hasPsi = group.targetIds.some((id) => isSuperpositionFaceId(dieById(id)?.rolledFaceId));
    const hasOutcome = group.targetIds.some((id) => dieById(id)?.rolledFaceId === "outcome");
    return hasPsi && hasOutcome;
  });
}

function hasPsiModifierGroup(groups) {
  return groups.some((group) => {
    const action = dieById(group.actionDieId)?.rolledFaceId;
    return actionRules[action]?.type === "modifier" && group.targetIds.some((id) => isSuperpositionFaceId(dieById(id)?.rolledFaceId));
  });
}

function maxResonanceLinkGroupSize(groups) {
  return groups.reduce((max, group) => {
    if (dieById(group.actionDieId)?.rolledFaceId !== "resonanceLink") return max;
    const psiCount = group.targetIds.filter((id) => isSuperpositionFaceId(dieById(id)?.rolledFaceId)).length;
    return Math.max(max, psiCount);
  }, 0);
}

function entangledDiceCount(groups) {
  return groups
    .filter((group) => ["entangle", "extraEntangle"].includes(dieById(group.actionDieId)?.rolledFaceId))
    .reduce((sum, group) => sum + group.targetIds.length, 0);
}

function countControlledTiles(playerId, color) {
  return Object.values(gameState.tiles).filter((tile) => tile.ownerId === playerId && tile.color === color).length;
}

function controlsMostColor(playerId, color) {
  const count = countControlledTiles(playerId, color);
  if (count <= 0) return false;
  return players.every((player) => player.id === playerId || count > countControlledTiles(player.id, color));
}

function controlsLargestCluster(playerId) {
  const ownKeys = Object.entries(gameState.tiles)
    .filter(([, tile]) => tile.ownerId === playerId)
    .map(([key]) => key);
  const ownLargest = largestClusterSize(new Set(ownKeys));
  if (ownLargest <= 0) return false;
  return players.every((player) => {
    if (player.id === playerId) return true;
    const keys = Object.entries(gameState.tiles).filter(([, tile]) => tile.ownerId === player.id).map(([key]) => key);
    return ownLargest > largestClusterSize(new Set(keys));
  });
}

function largestClusterSize(keys) {
  const remaining = new Set(keys);
  let largest = 0;
  while (remaining.size) {
    const start = remaining.values().next().value;
    const stack = [start];
    let size = 0;
    remaining.delete(start);
    while (stack.length) {
      const key = stack.pop();
      size += 1;
      neighborKeys(key).forEach((neighbor) => {
        if (remaining.has(neighbor)) {
          remaining.delete(neighbor);
          stack.push(neighbor);
        }
      });
    }
    largest = Math.max(largest, size);
  }
  return largest;
}

function clusterSizeFromKey(start, keys) {
  if (!keys.has(start)) return 0;
  const seen = new Set([start]);
  const stack = [start];
  while (stack.length) {
    const key = stack.pop();
    neighborKeys(key).forEach((neighbor) => {
      if (keys.has(neighbor) && !seen.has(neighbor)) {
        seen.add(neighbor);
        stack.push(neighbor);
      }
    });
  }
  return seen.size;
}

function renderQubitTrack(player) {
  const track = document.querySelector("#qubit-track");
  track.innerHTML = Array.from({ length: 36 }, (_, value) => {
    const label = value === 0 ? "◈" : value % 5 === 0 ? value : "";
    return `<span class="small-cell ${value === player.qubits ? "active" : ""}">${label}</span>`;
  }).join("");
}

function renderPools() {
  const dice = gameState.diceByPlayer[gameState.activePlayerId] || [];
  const pendingTargets = eligibleTargetIds();
  eligibleProtocolTargetIds().forEach((id) => pendingTargets.add(id));
  eligibleProtocolScoringDieIds().forEach((id) => pendingTargets.add(id));
  eligibleStabilizerTargetIds().forEach((id) => pendingTargets.add(id));
  const entropicTargets = eligibleEntropicResetTargetIds();
  entropicTargets.forEach((id) => pendingTargets.add(id));
  const collapseState = activeCollapseState();
  document.querySelector("#dice-icons").innerHTML = dice
    .filter((die) => !die.temporary)
    .map((die) => renderDieIcon(die))
    .join("");
  const collapseDice = dice.filter((die) => die.rolledFaceId && die.location === "collapse");
  const dicePoolDice = dice.filter((die) => die.rolledFaceId && die.location === "dice");
  const isCollapsing = gameState.phase === "collapse-resolving" || gameState.phase === "collapsed";
  const isPlacingTile = gameState.phase === "tile-placement";
  const isPostPlacement = gameState.phase === "post-placement";
  const isDeltaSwap = hasPendingDeltaSwap();
  const canContinue = dicePoolDice.length > 0 && !isCollapsing && !isPlacingTile && !isPostPlacement;
  const collapseButtonClass = collapseState?.finalized
    ? ` collapse-result ${collapseState.failed ? "fail" : collapseState.total > 0 ? "positive" : collapseState.total < 0 ? "negative" : "zero"}`
    : "";
  const finalizedValueText = renderCollapseResultLabel(collapseState);
  const annihilationText = collapseState?.annihilationBonus ? `<span class="collapse-annihilation-label">A=+${collapseState.annihilationBonus}⬢</span>` : "";
  const fullCollapseBonusText = collapseState?.fullCollapseBonus ? `<span class="collapse-fc-label">FC(+${collapseState.fullCollapseBonus}⬢)</span>` : "";
  const collapseButtonText = collapseState?.applied
    ? ["<span>Applied</span>", finalizedValueText, annihilationText, fullCollapseBonusText].filter(Boolean).join(" ")
    : collapseState?.finalized
      ? [finalizedValueText, annihilationText, fullCollapseBonusText].filter(Boolean).join(" ")
      : "Collapse";
  const tileHintColor = collapseState?.finalized ? tileColorForCollapse(collapseState) : null;
  const tileHint = tileHintColor ? `<span class="collapse-tile-hint tile-${tileHintColor}">⬢</span>` : "";
  const collapseButtonDisabled = isDeltaSwap || isPostPlacement || !collapseDice.length || (isCollapsing && (!collapseState?.finalized || collapseState.applied)) ? "disabled" : "";
  const pendingProtocolApply =
    gameState.pendingProtocolSelection?.allowPartial &&
    gameState.pendingProtocolSelection.playerId === gameState.activePlayerId &&
    gameState.pendingProtocolSelection.targetIds.length >= (gameState.pendingProtocolSelection.minNeeded || 1) &&
    (!gameState.pendingProtocolSelection.requireEvenTargets || gameState.pendingProtocolSelection.targetIds.length % 2 === 0)
      ? '<button type="button" class="phase-button protocol-apply-button">Apply</button>'
      : "";
  const pendingProtocolBoardDone =
    gameState.pendingProtocolBoardSelection?.id === "fieldReorder" &&
    gameState.pendingProtocolBoardSelection.playerId === gameState.activePlayerId &&
    (gameState.pendingProtocolBoardSelection.movedCount || 0) > 0 &&
    gameState.pendingProtocolBoardSelection.mode === "fieldReorderSource"
      ? '<button type="button" class="phase-button protocol-board-done-button">Done</button>'
      : "";
  const stabilizerActionButtons = renderStabilizerActionButtons();
  document.querySelector("#collapse-actions").innerHTML = `
    ${collapseDice.length ? `<button type="button" class="phase-button collapse-phase-button${collapseButtonClass}" ${collapseButtonDisabled}>${collapseButtonText}</button>${tileHint}` : ""}
    ${pendingProtocolApply}
    ${pendingProtocolBoardDone}
    ${stabilizerActionButtons}
  `;
  const rollContinueButton = document.querySelector("#roll-continue-button");
  rollContinueButton.querySelector("span").textContent = gameState.phase === "roll" ? "Roll" : "+⧖";
  rollContinueButton.disabled = isDeltaSwap || isCollapsing || isPlacingTile || isPostPlacement || (gameState.phase !== "roll" && !canContinue);
  const stabilizeCost = hasActiveStabilizer(activePlayer(), "STABILIZER-28") && !isStabilizerUsedThisTurn(activePlayer(), "STABILIZER-28") ? 3 : 5;
  const stabilizeButton = document.querySelector("#stabilize-button");
  stabilizeButton.innerHTML = `<span>${stabilizeCost}◈:-⧖</span>`;
  stabilizeButton.disabled = isDeltaSwap || activePlayer().qubits < stabilizeCost;
  document.querySelector("#dice-pool").innerHTML = dice
    .filter((die) => die.rolledFaceId && die.location === "dice")
    .map((die) => renderRolledFace(die, { pool: "dice", targetable: pendingTargets.has(die.id) }))
    .join("");
  document.querySelector("#collapse-pool").innerHTML = renderCollapsePool(dice, pendingTargets);
  scheduleBotTurn();
}

function renderCollapseResultLabel(collapseState) {
  if (!collapseState?.finalized) return "";
  if (collapseState.failed) return '<span class="collapse-fail-label">FAIL!</span>';
  const total = collapseState.total ?? 0;
  const tone = total > 0 ? "positive" : total < 0 ? "negative" : "zero";
  return `<span class="collapse-cv-label ${tone}">CV(${formatSigned(total)})</span>`;
}

function renderStabilizerActionButtons() {
  const pending = gameState.pendingStabilizerSelection;
  const buttons = [];
  if (pending?.playerId === gameState.activePlayerId && ["STABILIZER-05", "STABILIZER-15", "STABILIZER-32"].includes(pending.id)) {
    if (pending.id === "STABILIZER-15" && pending.targetIds.length > 0) {
      buttons.push('<button type="button" class="phase-button stabilizer-apply-button">Apply</button>');
    }
    buttons.push('<button type="button" class="phase-button stabilizer-skip-button">Skip</button>');
  }
  if (canUseStabilizerRerollAllNonPsi()) {
    buttons.push('<button type="button" class="phase-button stabilizer-reroll-non-psi-button">Reroll</button>');
  }
  if (canUseStabilizerRerollAllDelta()) {
    buttons.push('<button type="button" class="phase-button stabilizer-reroll-delta-button">Reroll Δ</button>');
  }
  return buttons.join("");
}

function renderCollapsePool(dice, pendingTargets) {
  const groups = gameState.groupsByPlayer[gameState.activePlayerId] || [];
  const groupedIds = new Set(groups.flatMap((group) => [...group.targetIds, group.actionDieId]));
  const grid = Array.from({ length: 21 }, () => "");
  const occupied = Array.from({ length: 21 }, () => false);
  const overflow = [];

  const slots = {
    psi: {
      free: [0, 1, 2, 7, 8, 9, 14, 15, 16],
      group2: [0, 7, 14],
      group3: [0, 7, 14],
    },
    outcome: {
      free: [4, 5, 6, 11, 12, 13, 18, 19, 20],
      group2: [4, 11, 18],
      group3: [4, 11, 18],
    },
    mixed: {
      group3: [2, 9, 16],
    },
  };

  const placeItems = (items, kind) => {
    items.forEach((item) => {
      const startSlots = item.span === 1 ? slots[kind].free : slots[kind][`group${item.span}`];
      const startIndex = startSlots.find((slot) => {
        const rowStart = Math.floor(slot / 7) * 7;
        const indexes = Array.from({ length: item.span }, (_, index) => slot + index);
        return indexes.every((index) => index < rowStart + 7 && !occupied[index]);
      });
      if (startIndex === undefined) {
        overflow.push(`<div class="collapse-overflow-item">${item.markup}</div>`);
        return;
      }
      Array.from({ length: item.span }, (_, index) => startIndex + index).forEach((index) => {
        occupied[index] = true;
      });
      grid[startIndex] = `<div class="collapse-grid-item" style="grid-column:${(startIndex % 7) + 1} / span ${item.span}; grid-row:${Math.floor(startIndex / 7) + 1};">${item.markup}</div>`;
    });
  };

  const items = {
    psi: [],
    outcome: [],
    mixed: [],
  };

  groups.forEach((group) => {
    const targets = group.targetIds.map((id) => dice.find((die) => die.id === id)).filter(Boolean);
    const actionDie = dice.find((die) => die.id === group.actionDieId);
    const orderedDice = group.kind === "relation"
      ? actionDie?.rolledFaceId === "resonanceLink"
        ? [...targets, actionDie]
        : targets.length === 2
          ? [targets[0], actionDie, targets[1]]
          : [targets[0], actionDie]
      : [targets[0], actionDie];
    const hasPsi = targets.some((die) => isSuperpositionFaceId(die.rolledFaceId));
    const hasOutcome = targets.some((die) => die.rolledFaceId === "outcome");
    const markup = renderCollapseGroup(group, orderedDice, eligibleProtocolGroupIds().has(group.id) || eligibleProtocolScoringGroupIds().has(group.id));
    if (hasPsi && hasOutcome) {
      items.mixed.push({ span: 3, markup });
    } else if (hasPsi) {
      items.psi.push({ span: Math.min(3, orderedDice.length), markup });
    } else {
      items.outcome.push({ span: Math.min(3, orderedDice.length), markup });
    }
  });

  const freePsi = dice.filter((die) => isSuperpositionFaceId(die.rolledFaceId) && die.location === "collapse" && !groupedIds.has(die.id));
  const freeOutcomes = dice.filter((die) => die.rolledFaceId === "outcome" && die.location === "collapse" && !groupedIds.has(die.id));
  freePsi.forEach((die) => {
    items.psi.push({ span: 1, markup: renderRolledFace(die, { pool: "collapse", targetable: pendingTargets.has(die.id) }) });
  });
  freeOutcomes.forEach((die) => {
    items.outcome.push({ span: 1, markup: renderRolledFace(die, { pool: "collapse", targetable: pendingTargets.has(die.id) }) });
  });

  placeItems(items.psi.filter((item) => item.span > 1), "psi");
  placeItems(items.mixed, "mixed");
  placeItems(items.outcome.filter((item) => item.span > 1), "outcome");
  placeItems(items.psi.filter((item) => item.span === 1), "psi");
  placeItems(items.outcome.filter((item) => item.span === 1), "outcome");

  return `
    <div class="collapse-slot-grid">
      ${Array.from({ length: 21 }, (_, index) => `<div class="collapse-slot" style="grid-column:${(index % 7) + 1}; grid-row:${Math.floor(index / 7) + 1};"></div>`).join("")}
      ${grid.join("")}
    </div>
    ${overflow.length ? `<div class="collapse-overflow">${overflow.join("")}</div>` : ""}
  `;
}

function renderCollapseGroup(group, orderedDice, targetable = false) {
  const collapseState = activeCollapseState();
  const groupState = collapseState?.groups?.[group.id];
  const groupClass = `${orderedDice.length > 3 ? " compact" : ""}${targetable ? " protocol-targetable" : ""}`;
  const choiceMarkup = groupState && !groupState.resolved
    ? `<div class="collapse-choice-row">${groupState.options.map((option, index) => renderCollapseChoice(group.id, index, option)).join("")}</div>`
    : "";
  const resultMarkup = groupState?.resolved
    ? `<div class="group-result-row">${groupState.result.map(renderValueMarker).join("")}${groupState.bonus ? renderValueMarker(groupState.bonus, "bonus") : ""}</div>`
    : "";

  return `
    <div class="collapse-group${groupClass}" data-group-id="${group.id}">
      ${choiceMarkup}
      ${orderedDice.map((die) => renderRolledFace(die, { pool: "collapse", groupResolved: Boolean(groupState?.resolved) })).join("")}
      ${resultMarkup}
    </div>
  `;
}

function renderCollapseChoice(groupId, optionIndex, option) {
  if (option.label) {
    const symbol = option.label === "check" ? "&#10003;" : "&#10005;";
    return `<button type="button" class="collapse-choice" data-group-id="${groupId}" data-choice-index="${optionIndex}"><span class="collapse-choice-token ${option.label}">${symbol}</span></button>`;
  }
  const bonus = option.bonus ? renderValueMarker(option.bonus, "choice bonus") : "";
  const markers = option.markers.length ? option.markers.map((marker) => renderValueMarker(marker, "choice")).join("") : '<span class="collapse-empty-choice">✕</span>';
  if (bonus) return `<button type="button" class="collapse-choice" data-group-id="${groupId}" data-choice-index="${optionIndex}">${markers}${bonus}</button>`;
  return `<button type="button" class="collapse-choice" data-group-id="${groupId}" data-choice-index="${optionIndex}">${markers}</button>`;
}

function renderDieIcon(die) {
  return `
    <span class="die-icon" aria-label="${die.name}">
      <span class="die-icon-symbol">${dieIcons[Number(die.id.slice(1)) - 1]}</span>
      <span class="die-preview">
        ${die.faces.map((face) => renderDieFaceById(face.id, face.outcomeValue)).join("")}
      </span>
    </span>
  `;
}

function renderRolledFace(die, options = {}) {
  const disabled = die.disabled || die.rolledFaceId === "decoherence";
  const actionHighlight = gameState.phase === "action-select" && options.pool === "dice" && isActivatableDie(die) ? " actionable" : "";
  const targetHighlight = options.targetable ? " targetable" : "";
  const selectedClass = gameState.selectedQubits.includes(die.id) ||
    gameState.pendingAction?.targetIds?.includes(die.id) ||
    gameState.pendingProtocolSelection?.targetIds?.includes(die.id) ||
    gameState.pendingStabilizerSelection?.targetIds?.includes(die.id)
      ? " selected"
      : "";
  const temporaryClass = die.temporary ? " temporary" : "";
  const markedClass = die.protocolMarked ? " protocol-marked" : "";
  const disabledClass = disabled ? " disabled" : "";
  const tooltip = actionTooltips[die.rolledFaceId] || faceCatalog[die.rolledFaceId]?.name || die.name;
  const tooltipPrefix = die.temporary ? "Temporary" : `[${die.id.toUpperCase()}]`;
  const tooltipAttr = escapeAttribute(`${tooltipPrefix} ${tooltip}`);
  const valueMarker = !options.groupResolved ? renderDieCollapseMarker(die) : "";
  if (die.rolledFaceId === "outcome") {
    const displayValue = Number.isFinite(die.protocolOutcomeValue) ? die.protocolOutcomeValue : die.outcomeValue;
    const protocolToneClass = die.protocolOutcomeTone ? ` protocol-outcome-${die.protocolOutcomeTone}` : "";
    const outcomeTooltip = escapeAttribute(`${tooltipPrefix} Outcome ${displayValue}`);
    return `<button type="button" class="rolled-face${actionHighlight}${targetHighlight}${selectedClass}${temporaryClass}${markedClass}${disabledClass}" data-die-id="${die.id}" data-pool="${options.pool || ""}" data-tooltip="${outcomeTooltip}"><span class="die-face outcome${protocolToneClass}"><span class="face-main">${displayValue}</span></span>${valueMarker}</button>`;
  }
  return `<button type="button" class="rolled-face${actionHighlight}${targetHighlight}${selectedClass}${temporaryClass}${markedClass}${disabledClass}" data-die-id="${die.id}" data-pool="${options.pool || ""}" data-tooltip="${tooltipAttr}">${renderFace(faceCatalog[die.rolledFaceId])}${valueMarker}</button>`;
}

function renderDieCollapseMarker(die) {
  const marker = activeCollapseState()?.dice?.[die.id];
  const valueChoices = renderProtocolValueChoices(die);
  return `${marker ? renderValueMarker(marker) : ""}${valueChoices}`;
}

function renderProtocolValueChoices(die) {
  const pending = gameState.pendingProtocolValueChoice;
  if (!pending || pending.playerId !== gameState.activePlayerId || pending.dieIds[pending.currentIndex] !== die.id) return "";
  return `<span class="protocol-value-choice-row">${pending.values.map((value) => `<span class="protocol-value-choice" role="button" tabindex="0" data-value="${value}">${value}</span>`).join("")}</span>`;
}

function renderValueMarker(marker, extraClass = "") {
  const tone = markerTone(marker);
  return `<span class="collapse-value-marker ${tone} ${extraClass}">${marker.value}</span>`;
}

function markerTone(marker) {
  if (marker.value === 0 || marker.tone === "zero") return "zero";
  if (marker.tone) return marker.tone;
  return marker.value > 0 ? "positive" : "negative";
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderDieFaceById(faceId, outcomeValue = null) {
  if (faceId === "outcome") {
    return `<span class="die-face outcome"><span class="face-main">${outcomeValue}</span></span>`;
  }
  return renderFace(faceCatalog[faceId]);
}

function renderFace(face) {
  const leftPip = face.left ? `<span class="half-pip left ${face.left}"></span>` : "";
  const rightPip = face.right ? `<span class="half-pip right ${face.right}"></span>` : "";
  const quarterPips = face.quarters ? ["tl", "tr", "bl", "br"].map((corner) => `<span class="quarter-pip ${corner} ${face.quarters}"></span>`).join("") : "";
  const comboLeft = face.comboLeft ? '<span class="combo-pip left"><span class="combo-half black"></span><span class="combo-half white"></span></span>' : "";
  const subSymbol = face.subSymbol ? `<span class="face-sub">${face.subSymbol}</span>` : "";
  return `
    <span class="die-face ${face.tone}">
      ${leftPip}
      ${quarterPips}
      ${comboLeft}
      <span class="face-main">${face.symbol}</span>
      ${subSymbol}
      ${rightPip}
    </span>
  `;
}

function rollActivePlayerDice() {
  playSound("dice");
  const dice = gameState.diceByPlayer[gameState.activePlayerId];
  logPlayerAction(activePlayer(), "rolls available dice.");
  rollDiceWithTutorialScript(dice.filter((die) => die.location !== "collapse"));
  resolveAutomaticQubits(dice);
  resolveRolledDecoherenceFaces(dice);
  gameState.groupsByPlayer[gameState.activePlayerId] = activeGroups().filter((group) => group.stabilizerRetained);
  delete gameState.collapseByPlayer[gameState.activePlayerId];
  gameState.pendingAction = null;
  gameState.selectedQubits = [];
  gameState.phase = "action-select";
  renderApp();
}

function rollDiceWithTutorialScript(dice) {
  if (!dice.length) return;
  const script = gameState.tutorialMode ? tutorialRollScripts[gameState.tutorialRollIndex] : null;
  dice.forEach((die, index) => rollDieIntoPool(die, script?.[index]));
  if (script) gameState.tutorialRollIndex += 1;
}

function rollDieIntoPool(die, forcedFaceId = null) {
  const parsed = parseTutorialForcedFace(forcedFaceId);
  const forcedIndex = parsed?.id ? die.faces.findIndex((face) => face.id === parsed.id) : -1;
  const rollIndex = forcedIndex >= 0 ? forcedIndex : Math.floor(Math.random() * die.faces.length);
  if (parsed && forcedIndex < 0) {
    die.faces[rollIndex] = parsed.id === "outcome"
      ? { id: "outcome", outcomeValue: parsed.outcomeValue ?? 0 }
      : { id: parsed.id };
  }
  if (parsed?.id === "outcome" && forcedIndex >= 0) {
    die.faces[forcedIndex].outcomeValue = parsed.outcomeValue ?? die.faces[forcedIndex].outcomeValue ?? 0;
  }
  applyRolledFace(die, rollIndex);
}

function parseTutorialForcedFace(faceSpec) {
  if (!faceSpec) return null;
  if (typeof faceSpec === "object") return faceSpec;
  const [id, value] = String(faceSpec).split(":");
  if (id === "outcome") return { id, outcomeValue: clampOutcomeFaceValue(value ?? 0) };
  return { id };
}

function applyRolledFace(die, rollIndex) {
  const rolledFace = die.faces[rollIndex];
  die.rolledFaceIndex = rollIndex;
  die.rolledFaceId = rolledFace.id;
  if (rolledFace.id === "outcome") {
    rolledFace.outcomeValue = clampOutcomeFaceValue(rolledFace.outcomeValue);
    die.outcomeValue = rolledFace.outcomeValue;
  } else {
    die.outcomeValue = null;
  }
  die.protocolOutcomeValue = null;
  die.protocolOutcomeTone = null;
  die.decoherenceApplied = false;
  die.location = isCollapseFaceId(die.rolledFaceId) ? "collapse" : "dice";
  die.disabled = die.rolledFaceId === "decoherence";
  die.groupId = null;
  if (isActionFaceId(die.rolledFaceId)) activeTurnStats().actionFacesAppeared += 1;
}

function resolveAutomaticQubits(dice) {
  const qubitDice = dice.filter((die) => isQubitFaceId(die.rolledFaceId) && die.location === "dice" && !die.disabled);
  if (!qubitDice.length) return;
  const gained = qubitDice.reduce((sum, die) => sum + qubitValueForFace(die.rolledFaceId), 0);
  gainQubits(activePlayer(), gained);
  qubitDice.forEach((die) => {
    die.disabled = true;
  });
}

function payContinueCost() {
  const player = activePlayer();
  if (player.continueShield > 0) {
    player.continueShield -= 1;
    return;
  }
  if (triggerStabilizer(player, "STABILIZER-02")) return;
  if (hasActiveStabilizer(player, "STABILIZER-11") && !isStabilizerUsedThisTurn(player, "STABILIZER-11") && player.qubits >= 1) {
    player.qubits -= 1;
    exhaustStabilizer(player, "STABILIZER-11");
    return;
  }
  increaseInstability(player, 1);
}

function resolveRolledDecoherenceFaces(dice) {
  const player = activePlayer();
  const deltaDice = dice.filter((die) => die.rolledFaceId === "decoherence");
  deltaDice.forEach((die) => {
    die.decoherenceApplied = false;
  });
  let decoherenceCount = deltaDice.length;
  if (!decoherenceCount) return;
  const unresolvedDeltaDice = [...deltaDice];

  activeTurnStats().deltaResolved += decoherenceCount;

  if (triggerStabilizer(player, "STABILIZER-04")) {
    decoherenceCount -= 1;
    unresolvedDeltaDice.shift();
  }

  if (decoherenceCount > 0 && hasActiveStabilizer(player, "STABILIZER-18") && !isStabilizerUsedThisTurn(player, "STABILIZER-18")) {
    gainQubits(player, 1);
    decoherenceCount -= 1;
    unresolvedDeltaDice.shift();
    exhaustStabilizer(player, "STABILIZER-18");
  }

  if (decoherenceCount > 0 && hasActiveStabilizer(player, "STABILIZER-27")) {
    const data = stabilizerTurnData(player);
    const ignored = Math.min(decoherenceCount, Math.max(0, 2 - data.ignoredDelta));
    if (ignored > 0) {
      data.ignoredDelta += ignored;
      decoherenceCount -= ignored;
      unresolvedDeltaDice.splice(0, ignored);
      exhaustStabilizer(player, "STABILIZER-27");
    }
  }

  if (decoherenceCount > 0) {
    const advanced = advanceDecoherence(decoherenceCount);
    unresolvedDeltaDice.slice(0, advanced).forEach((die) => {
      die.decoherenceApplied = true;
    });
  }
}

function continueTurn() {
  const dice = activeDice();
  const dicePoolDice = dice.filter((die) => die.rolledFaceId && die.location === "dice");
  if (!dicePoolDice.length) return;

  playSound("dice");
  logPlayerAction(activePlayer(), `continues and rerolls ${dicePoolDice.length} dice.`);
  payContinueCost();
  gameState.pendingAction = null;
  gameState.selectedQubits = [];
  delete gameState.collapseByPlayer[gameState.activePlayerId];

  rollDiceWithTutorialScript(dicePoolDice);
  resolveAutomaticQubits(dicePoolDice);
  resolveRolledDecoherenceFaces(dicePoolDice);

  gameState.phase = "action-select";
  renderApp();
}

function startCollapseResolution() {
  const dice = activeDice();
  const collapseDice = dice.filter((die) => die.rolledFaceId && die.location === "collapse");
  if (!collapseDice.length) return;
  playSound("collapse");
  logPlayerAction(activePlayer(), `starts collapse with ${collapseDice.length} dice in the Collapse Pool.`);
  const stats = activeTurnStats();
  const collapsePsiOutcomeDice = collapseDice.filter((die) => isPsiOrOutcome(die));
  stats.heldApexDuringCollapse = gameState.apexHolderId === gameState.activePlayerId;
  stats.collapseDiceCount = collapseDice.length;
  stats.collapsePsiOutcomeCount = collapsePsiOutcomeDice.length;
  stats.collapsePoolOnlyPsiOutcome = collapseDice.every((die) => isPsiOrOutcome(die));
  stats.collapsedPsiCount = collapseDice.filter((die) => isSuperpositionFaceId(die.rolledFaceId)).length;
  stats.collapsedOutcomeCount = collapseDice.filter((die) => die.rolledFaceId === "outcome").length;

  const collapseState = {
    dice: {},
    groups: {},
    finalized: false,
    failed: false,
    total: null
  };

  const tutorialCollapseValues = gameState.tutorialMode ? tutorialCollapseValueScripts[gameState.tutorialCollapseIndex] : null;
  let tutorialPsiIndex = 0;
  collapseDice.forEach((die) => {
    if (isSuperpositionFaceId(die.rolledFaceId)) {
      const scriptedValue = tutorialCollapseValues?.[tutorialPsiIndex];
      tutorialPsiIndex += 1;
      collapseState.dice[die.id] = { value: Number.isInteger(scriptedValue) ? scriptedValue : randomOutcomeValue(), tone: "positive" };
    }
    if (die.rolledFaceId === "outcome") {
      collapseState.dice[die.id] = { value: die.outcomeValue, tone: die.outcomeValue === 0 ? "zero" : "negative" };
    }
  });
  if (tutorialCollapseValues) gameState.tutorialCollapseIndex += 1;
  applyProtocolPreCollapseEffects(collapseState);
  stats.collapsePsiValues = collapseDice
    .filter((die) => isSuperpositionFaceId(die.rolledFaceId))
    .map((die) => collapseState.dice[die.id]?.value)
    .filter(Number.isInteger);
  stats.uniquePsiValues = stats.collapsePsiValues.length > 0 && new Set(stats.collapsePsiValues).size === stats.collapsePsiValues.length;
  stats.uniquePsiWithoutModifiers = stats.uniquePsiValues && !activeGroups().some((group) => actionRules[dieById(group.actionDieId)?.rolledFaceId]?.type === "modifier");

  activeGroups().forEach((group) => {
    const options = buildGroupOptions(group, collapseState);
    collapseState.groups[group.id] = {
      options,
      resolved: options.length === 0,
      result: []
    };
  });

  gameState.collapseByPlayer[gameState.activePlayerId] = collapseState;
  gameState.pendingAction = null;
  gameState.selectedQubits = [];
  gameState.phase = "collapse-resolving";
  beginPreChoiceStabilizerSelection(collapseDice);
  finalizeCollapseIfReady();
  renderApp();
}

function handleCollapseButton() {
  if (hasPendingDeltaSwap()) return;
  const collapseState = activeCollapseState();
  if (collapseState?.finalized) {
    applyCollapseValue();
    return;
  }
  startCollapseResolution();
}

function beginPreChoiceStabilizerSelection(collapseDice) {
  const player = activePlayer();
  const psiDice = collapseDice.filter((die) => isSuperpositionFaceId(die.rolledFaceId));
  if (!psiDice.length) return;
  const skipped = new Set(activeCollapseState()?.skippedStabilizerIds || []);
  const candidateId = ["STABILIZER-15", "STABILIZER-05", "STABILIZER-32"]
    .find((cardId) => !skipped.has(cardId) && hasActiveStabilizer(player, cardId) && !isStabilizerUsedThisTurn(player, cardId));
  if (!candidateId) return;
  gameState.pendingStabilizerSelection = {
    playerId: player.id,
    id: candidateId,
    targetIds: []
  };
}

function queueNextPreChoiceStabilizerSelection() {
  if (gameState.phase !== "collapse-resolving" && gameState.phase !== "collapsed") return;
  beginPreChoiceStabilizerSelection(activeDice().filter((die) => die.location === "collapse"));
  if (!gameState.pendingStabilizerSelection) finalizeCollapseIfReady();
}

function applyCollapseValue() {
  const collapseState = activeCollapseState();
  if (!collapseState?.finalized || collapseState.applied) return;
  const player = activePlayer();
  logPlayerAction(player, collapseState.failed ? `applies failed collapse, CV ${collapseState.total}.` : `applies collapse value CV ${collapseState.total}.`);
  if (collapseState.failed) {
    playSound("fail");
    increaseInstability(player, 1);
  } else {
    playSound("success");
    applyInstabilityTrackCollapseRule(player, collapseState);
    if (collapseState.fullCollapseBonus) movePlayerPotential(player, collapseState.fullCollapseBonus);
  }
  if (collapseState.annihilationBonus) {
    movePlayerPotential(player, collapseState.annihilationBonus);
    logPlayerAction(player, `scores Annihilation bonus +${collapseState.annihilationBonus}⬢ from ${collapseState.annihilationPairs} pair${collapseState.annihilationPairs === 1 ? "" : "s"}.`, "resource");
  }
  updateApexAfterCollapse(collapseState);
  gameState.pendingPlacement = {
    playerId: gameState.activePlayerId,
    failed: collapseState.failed,
    cv: collapseState.total,
    tileColor: tileColorForCollapse(collapseState)
  };
  gameState.phase = "tile-placement";
  collapseState.applied = true;
  if (availablePlacements().size === 0) {
    evolveCollapsedDiceFaces();
    gameState.pendingPlacement = null;
    gameState.phase = "post-placement";
  }
  renderApp();
  settleTutorialStepAfterGameChange(["tilePlacement", "postPlacement"]);
}

function applyInstabilityTrackCollapseRule(player, collapseState) {
  const currentInstability = player.instability;
  const collapseValue = collapseState.total * (activeProtocolEffects().apexMultiplier || 1);
  if (currentInstability >= 1 && currentInstability <= 7 && collapseValue < 0) {
    increaseInstability(player, 1);
  } else if (currentInstability >= 8 && currentInstability <= 15 && collapseValue > 0) {
    player.instability = Math.max(0, player.instability - 1);
    updateStabilizerLockStates(player);
  } else if (currentInstability >= 16 && currentInstability <= 25 && collapseValue > 0) {
    player.instability = Math.max(0, player.instability - 2);
    updateStabilizerLockStates(player);
  }
}

function updateApexAfterCollapse(collapseState) {
  const player = activePlayer();
  const previousApex = player.apex;
  const previousHolder = gameState.apexHolderId;

  player.apex = null;
  compactRedApexMarkers();

  if (collapseState.failed) {
    player.apexValue = null;
    placePlayerOnRedApexSpot(player);
    assignApexHolderFromTrack();
    return;
  }

  const collapseValue = collapseState.total * (activeProtocolEffects().apexMultiplier || 1);
  player.apexValue = collapseValue;
  if (collapseValue < 0) {
    placePlayerOnRedApexSpot(player);
    assignApexHolderFromTrack();
    return;
  }

  player.apex = resolveUniqueApexSpot(Math.max(0, Math.min(30, collapseValue)));
  drawApexCardsForMovement(previousApex, collapseValue, player.id);
  assignApexHolderFromTrack();
  if (gameState.apexHolderId !== previousHolder && gameState.apexHolderId) {
    logPlayerAction(playerById(gameState.apexHolderId), "takes the Apex.", "global");
  }
}

function assignApexHolderFromTrack() {
  const apexLeader = players
    .filter((player) => Number.isFinite(player.apex) && player.apex > 0)
    .sort((left, right) => right.apex - left.apex)[0];
  gameState.apexHolderId = apexLeader?.id ?? null;
}

function resolveUniqueApexSpot(target) {
  const occupied = new Set(players.map((player) => player.apex).filter((value) => value !== null && value !== undefined));
  let candidate = target;
  while (candidate >= -4) {
    if (!occupied.has(candidate)) return candidate;
    candidate -= 1;
  }
  return -4;
}

function placePlayerOnRedApexSpot(player) {
  compactRedApexMarkers();
  player.apex = nearestAvailableRedApexSpot();
}

function nearestAvailableRedApexSpot() {
  const occupied = new Set(players.map((player) => player.apex).filter((value) => value < 0));
  for (let value = -1; value >= -4; value -= 1) {
    if (!occupied.has(value)) return value;
  }
  shiftRedApexMarkersTowardZero();
  return -4;
}

function compactRedApexMarkers() {
  const redPlayers = players
    .filter((player) => player.apex < 0)
    .sort((left, right) => left.apex - right.apex);
  const firstSpot = -redPlayers.length;
  redPlayers.forEach((player, index) => {
    player.apex = firstSpot + index;
  });
}

function shiftRedApexMarkersTowardZero() {
  players
    .filter((player) => player.apex < -1)
    .sort((left, right) => right.apex - left.apex)
    .forEach((player) => {
      player.apex += 1;
    });
}

function drawApexCardsForMovement(previousApex, collapseValue, playerId) {
  let cardsToDraw = collapseValue === 0 ? 1 : 0;
  const start = Number.isFinite(previousApex) ? previousApex : -4;
  [6, 11, 16, 21, 26].forEach((spot) => {
    if (start < spot && collapseValue >= spot) cardsToDraw += 1;
  });
  drawCards(playerId, cardsToDraw);
}

function drawCards(playerId, count) {
  if (!count) return;
  const hand = gameState.handsByPlayer[playerId];
  let drawn = 0;
  for (let index = 0; index < count; index += 1) {
    if (!gameState.deck.length) reshuffleDiscardIntoDeck();
    if (!gameState.deck.length) return;
    hand.push(gameState.deck.shift());
    drawn += 1;
  }
  if (drawn > 0) logPlayerAction(playerById(playerId), `draws ${drawn} card${drawn === 1 ? "" : "s"}.`, "resource");
}

function drawPersonalCards(playerId, count) {
  if (!count) return;
  const hand = gameState.handsByPlayer[playerId];
  const deck = gameState.personalDecksByPlayer[playerId] || [];
  let drawn = 0;
  for (let index = 0; index < count; index += 1) {
    if (!deck.length) break;
    hand.push(deck.shift());
    drawn += 1;
  }
  if (drawn > 0) logPlayerAction(playerById(playerId), `draws ${drawn} card${drawn === 1 ? "" : "s"} from their Flux deck.`, "resource");
}

function reshuffleDiscardIntoDeck() {
  if (!gameState.discardPile.length) return;
  gameState.deck = shuffleCards(gameState.discardPile.splice(0));
}

function tileColorForCollapse(collapseState) {
  if (collapseState.failed) return "black";
  const cv = collapseState.total;
  if (cv < 0) return "violet";
  if (cv === 0) return "white";
  if (cv <= 5) return "green";
  if (cv <= 10) return "orange";
  return "red";
}

function availablePlacementKeys() {
  return new Set(availablePlacements().keys());
}

function availableVectorJumpTargets() {
  const pending = gameState.pendingVectorJump;
  if (!pending || pending.playerId !== gameState.activePlayerId) return new Set();
  return availableVectorJumpTargetsForPlayer(pending.playerId);
}

function availableVectorJumpTargetsForPlayer(playerId) {
  const vectorKey = gameState.vectorsByPlayer[playerId];
  if (!vectorKey) return new Set();
  return new Set(neighborKeys(vectorKey).filter((key) => {
    const tile = gameState.tiles[key];
    return tile && (tile.color === "black" || tile.ownerId === playerId);
  }));
}

function availablePlacements() {
  const placement = gameState.pendingPlacement;
  if (!placement || placement.playerId !== gameState.activePlayerId) return new Map();
  const placements = new Map();
  const vectorKey = gameState.vectorsByPlayer[placement.playerId];

  if (!vectorKey) {
    neighborKeys("0,0").forEach((key) => {
      if (isFreeHex(key)) placements.set(key, "free");
    });
  }

  if (vectorKey) {
    const neighboringFree = [];
    const neighboringOwnForBlack = [];
    neighborKeys(vectorKey).forEach((key) => {
      if (isFreeHex(key)) {
        neighboringFree.push(key);
        return;
      }
      const tile = gameState.tiles[key];
      if (!tile || hasVectorOnHex(key)) return;
      if (placement.tileColor === "black") {
        if (tile.ownerId === placement.playerId) neighboringOwnForBlack.push(key);
        return;
      }
      if (tile.color === "black") return;
      if (!Number.isFinite(tile.cv) || !Number.isFinite(placement.cv)) return;
      if (tile.ownerId === placement.playerId && tile.cv > placement.cv) placements.set(key, "own");
      if (tile.ownerId && tile.ownerId !== placement.playerId && tile.cv < placement.cv && canConquerTile(tile, placement.playerId)) placements.set(key, "enemy");
    });

    if (placement.tileColor === "black") {
      neighboringFree.forEach((key) => placements.set(key, "free"));
      if (placements.size === 0) neighboringOwnForBlack.forEach((key) => placements.set(key, "black-own"));
      if (placements.size === 0 && vectorKey) placements.set(vectorKey, "black-self");
      return placements;
    }

    neighboringFree.forEach((key) => placements.set(key, "free"));
    if (placements.size === 0) {
      const vectorTile = gameState.tiles[vectorKey];
      if (vectorTile?.ownerId === placement.playerId && Number.isFinite(vectorTile.cv) && Number.isFinite(placement.cv) && vectorTile.cv > placement.cv) {
        placements.set(vectorKey, "self");
      }
    }
  }

  return placements;
}

function canConquerTile(tile, conqueringPlayerId) {
  const owner = playerById(tile?.ownerId);
  if (!owner || owner.id === conqueringPlayerId) return true;
  if (tile.color === "red" && hasActiveStabilizer(owner, "STABILIZER-20")) return false;
  if (gameState.apexHolderId === owner.id && hasActiveStabilizer(owner, "STABILIZER-33")) return false;
  return true;
}

function projectedPlacementPotential(key, placementKind) {
  const firstPlacementBonus = gameState.tiles[key] ? 0 : fieldPlacementBonusForKey(key);
  return placementFieldPotentialChange(key, placementKind) + firstPlacementBonus;
}

function placementFieldPotentialChange(key, placementKind) {
  const placement = gameState.pendingPlacement;
  if (!placement) return 0;
  const existing = gameState.tiles[key];
  const newValue = fieldPotentialValueForColor(key, placement.tileColor);

  if (placementKind === "free") return newValue;
  if (placementKind === "black") return fieldPotentialValueForColor(key, "black");
  if (placementKind === "black-own") return fieldPotentialValueForColor(key, "black");
  if (placementKind === "black-self") return trappedBlackTilePotential(key);
  if (placementKind === "own") {
    const oldValue = fieldPotentialValueForColor(key, existing?.color);
    return newValue - oldValue;
  }
  if (placementKind === "self") {
    const oldValue = fieldPotentialValueForColor(key, existing?.color);
    return newValue - oldValue;
  }
  if (placementKind === "enemy") {
    const oldValue = fieldPotentialValueForColor(key, existing?.color);
    return newValue - oldValue;
  }
  return 0;
}

function fieldPotentialValueForColor(key, color) {
  const influence = influenceForTile(color);
  if (!influence) return 0;
  const validNeighborCount = neighborKeys(key).filter((neighborKey) => {
    const neighbor = gameState.tiles[neighborKey];
    return neighbor && neighbor.color !== "white" && neighbor.color !== "black";
  }).length;
  return influence * (1 + validNeighborCount);
}

function trappedBlackTilePotential(key) {
  return -2 * (1 + neighborKeys(key).length);
}

function neighborKeys(key) {
  const [q, r] = key.split(",").map(Number);
  const boardKeys = new Set(buildHexes().map((hex) => hex.key));
  return axialDirections
    .map(([dq, dr]) => `${q + dq},${r + dr}`)
    .filter((neighborKey) => boardKeys.has(neighborKey));
}

function isFreeHex(key) {
  return !gameState.tiles[key];
}

function hasVectorOnHex(key) {
  return Object.values(gameState.vectorsByPlayer).includes(key);
}

function placeTileOnHex(key) {
  const placement = gameState.pendingPlacement;
  const placements = availablePlacements();
  const placementKind = placements.get(key);
  if (!placement || placement.playerId !== gameState.activePlayerId || !placementKind) return;
  playSound("tile");

  const player = activePlayer();
  const existing = gameState.tiles[key];
  const conqueredOwnerId = existing?.ownerId && existing.ownerId !== player.id ? existing.ownerId : null;
  const nextColor = placement.tileColor;
  const previousVector = gameState.vectorsByPlayer[player.id];
  const oldFieldValue = existing ? fieldPotentialValueForColor(key, existing.color) : 0;
  const newFieldValue = placementKind === "black-self"
    ? trappedBlackTilePotential(key)
    : placementKind === "black" || placementKind === "black-own"
      ? fieldPotentialValueForColor(key, "black")
    : fieldPotentialValueForColor(key, nextColor);
  const placementBonus = existing ? 0 : fieldPlacementBonusForKey(key);
  const fieldPotentialChange = placementFieldPotentialChange(key, placementKind);
  const playerPotentialChange = fieldPotentialChange + placementBonus;

  if (!existing) {
    movePlayerPotential(player, playerPotentialChange);
    gameState.tiles[key] = createPlacedTile(nextColor, placement.cv, nextColor === "black" ? null : player.id);
  } else if (existing.color === "black") {
    movePlayerPotential(player, playerPotentialChange);
    gameState.tiles[key] = existing;
  } else if (placementKind === "black-own" || placementKind === "black-self") {
    movePlayerPotential(player, playerPotentialChange);
    gameState.tiles[key] = createPlacedTile("black", placement.cv, null);
  } else if (nextColor === "black" && existing.ownerId === player.id) {
    movePlayerPotential(player, playerPotentialChange);
    gameState.tiles[key] = createPlacedTile(nextColor, placement.cv, null);
  } else if (existing.ownerId === player.id || placementKind === "self") {
    movePlayerPotential(player, playerPotentialChange);
    gameState.tiles[key] = createPlacedTile(nextColor, placement.cv, nextColor === "black" ? null : player.id);
  } else if (existing.ownerId && existing.ownerId !== player.id) {
    movePlayerPotential(player, playerPotentialChange);
    movePlayerPotential(playerById(existing.ownerId), -oldFieldValue);
    gameState.tiles[key] = createPlacedTile(nextColor, placement.cv, nextColor === "black" ? null : player.id);
  }

  const placementText = existing
    ? conqueredOwnerId
      ? `conquers ${playerById(conqueredOwnerId)?.name || "enemy"} tile at ${key}`
      : `replaces tile at ${key}`
    : `places tile at ${key}`;
  logPlayerAction(player, `${placementText}: ${nextColor} tile, CV ${placement.cv}, placement QP ${formatSigned(fieldPotentialChange)}⬢${placementBonus ? ` + ${placementBonus}⬢ bonus` : ""} = ${formatSigned(playerPotentialChange)}⬢.`);

  gameState.vectorsByPlayer[player.id] = key;
  const stats = activeTurnStats();
  stats.placedTileColor = nextColor;
  stats.lastPlacedKey = key;
  stats.placedOnEdge = neighborKeys(key).length < 6;
  stats.placedAdjacentWhite = neighborKeys(key).some((neighborKey) => gameState.tiles[neighborKey]?.color === "white");
  stats.placedAdjacentNonWhite = neighborKeys(key).some((neighborKey) => {
    const tile = gameState.tiles[neighborKey];
    return tile && tile.color !== "white";
  });
  stats.placedAdjacentNonBlack = neighborKeys(key).some((neighborKey) => {
    const tile = gameState.tiles[neighborKey];
    return tile && tile.color !== "black";
  });
  if (previousVector !== key) {
    stats.vectorMovedIntoClusterSize = clusterSizeFromKey(key, new Set(Object.keys(gameState.tiles).filter((tileKey) => gameState.tiles[tileKey]?.ownerId === player.id)));
  }
  if (!existing) applySpecialHexBonus(key, player.id);
  if (gameState.tutorialMode && player.id === "p1") {
    gameState.tutorialPlacementIndex += 1;
    if (gameState.tutorialPlacementIndex === 2) {
      const previousQubits = player.qubits;
      player.qubits = Math.min(35, player.qubits + 5);
      if (player.qubits !== previousQubits) logPlayerAction(player, "receives the tutorial +5◈ placement bonus.", "resource");
    }
  }
  applyTileInfluence(key);
  applyStabilizerPlacementEffects(player, key, nextColor, conqueredOwnerId);
  evolveCollapsedDiceFaces();
  gameState.pendingPlacement = null;
  gameState.phase = "post-placement";
  renderApp();
  settleTutorialStepAfterGameChange(["postPlacement"]);
}

function evolveCollapsedDiceFaces() {
  const collapseState = activeCollapseState();
  if (!collapseState) return;

  activeDice().forEach((die) => {
    die.protocolMarked = false;
    if (die.location !== "collapse" || die.rolledFaceIndex === null || die.rolledFaceIndex === undefined) return;
    if (isDelayedCollapseDie(die, collapseState)) return;
    if (die.stabilizerNoFlip) {
      die.stabilizerNoFlip = false;
      return;
    }

    if (isSuperpositionFaceId(die.rolledFaceId)) {
      const assignedValue = collapseState.dice[die.id]?.value;
      if (Number.isInteger(assignedValue)) {
        const nextFace = { id: "outcome", outcomeValue: suppressedOutcomeValue(die.rolledFaceId, assignedValue) };
        if (isSuppressorFaceId(die.rolledFaceId)) nextFace.returnFaceId = die.rolledFaceId;
        die.faces[die.rolledFaceIndex] = nextFace;
      }
    } else if (die.rolledFaceId === "outcome") {
      die.faces[die.rolledFaceIndex] = { id: die.faces[die.rolledFaceIndex]?.returnFaceId || "superposition" };
    }
  });
}

function isDelayedCollapseDie(die, collapseState) {
  const group = activeGroups().find((candidate) => candidate.targetIds.includes(die.id));
  if (!group) return false;
  const actionDie = dieById(group.actionDieId);
  const groupState = collapseState.groups[group.id];
  return actionDie?.rolledFaceId === "collapseDelay" && groupState?.resolved && !groupState.result.length;
}

function applySpecialHexBonus(key, playerId) {
  const bonus = specialHexes.get(key);
  const player = playerById(playerId);
  if (!bonus || !player) return;

  if (bonus.type === "qubit") {
    player.qubits = Math.min(35, player.qubits + 5);
  }

  if (bonus.type === "potential") {
    movePlayerPotential(player, 3);
  }

  if (bonus.type === "card-mine") {
    drawCards(playerId, 1);
  }
}

function applyStabilizerPlacementEffects(player, key, color, conqueredOwnerId) {
  if (conqueredOwnerId) {
    triggerStabilizer(player, "STABILIZER-10", () => movePlayerPotential(player, 5));
    const conqueredPlayer = playerById(conqueredOwnerId);
    if (conqueredPlayer && hasActiveStabilizer(conqueredPlayer, "STABILIZER-39")) movePlayerPotential(conqueredPlayer, 5);
  }
  if (color === "green") triggerStabilizer(player, "STABILIZER-12", () => reduceInstability(player, 1));
  if (color === "red") triggerStabilizer(player, "STABILIZER-13", () => decreaseDecoherence(1));
  if (color === "black") triggerStabilizer(player, "STABILIZER-21", () => movePlayerPotential(player, 3));
  if (color === "orange") triggerStabilizer(player, "STABILIZER-24", () => movePlayerPotential(player, 2));
  if (color === "white") triggerStabilizer(player, "STABILIZER-29", () => movePlayerPotential(player, 3));
  if (color !== "black") triggerStabilizer(player, "STABILIZER-30", () => movePlayerPotential(player, 1));
  triggerStabilizer(player, "STABILIZER-36", () => gainQubits(player, 2));
  beginVectorSafetyLatchSelection(player);
}

function beginVectorSafetyLatchSelection(player) {
  if (!hasActiveStabilizer(player, "STABILIZER-06") || isStabilizerUsedThisTurn(player, "STABILIZER-06")) return;
  const targets = Object.keys(gameState.tiles).filter((key) => {
    const tile = gameState.tiles[key];
    return tile?.ownerId === player.id && tile.color === "green";
  });
  if (!targets.length) return;
  gameState.pendingProtocolBoardSelection = {
    id: "stabilizerVectorLatch",
    playerId: player.id,
    targets: new Set(targets),
    selectedKeys: []
  };
}

function createPlacedTile(color, cv, ownerId) {
  return {
    color,
    cv: color === "black" || color === "white" ? null : cv,
    ownerId
  };
}

function isSuperpositionFaceId(faceId) {
  return faceId === "superposition" || isSuppressorFaceId(faceId);
}

function isActionFaceId(faceId) {
  return Boolean(actionRules[faceId] || ["collapseShield", "instabilityDampener", "vectorJump", "entropicReset"].includes(faceId));
}

function isSuppressorFaceId(faceId) {
  return ["suppressorMinus1", "suppressorMinus2", "suppressorMinus3", "suppressorZero"].includes(faceId);
}

function isCollapseFaceId(faceId) {
  return isSuperpositionFaceId(faceId) || faceId === "outcome";
}

function isQubitFaceId(faceId) {
  return ["qubit", "qubit2", "qubit3", "qubit4", "qubit5"].includes(faceId);
}

function qubitValueForFace(faceId) {
  return { qubit: 1, qubit2: 2, qubit3: 3, qubit4: 4, qubit5: 5 }[faceId] || 0;
}

function suppressedOutcomeValue(faceId, value) {
  if (faceId === "suppressorMinus1") return clampOutcomeFaceValue(value - 1);
  if (faceId === "suppressorMinus2") return clampOutcomeFaceValue(value - 2);
  if (faceId === "suppressorMinus3") return clampOutcomeFaceValue(value - 3);
  if (faceId === "suppressorZero") return 0;
  return clampOutcomeFaceValue(value);
}

function applyTileInfluence(sourceKey) {
  const source = gameState.tiles[sourceKey];
  const influence = influenceForTile(source?.color);
  if (!influence) return;
  neighborKeys(sourceKey).forEach((key) => {
    const tile = gameState.tiles[key];
    if (!tile || !Number.isFinite(tile.cv) || tile.color === "black" || tile.color === "white") return;
    const nextCv = tile.cv + influence;
    if ((tile.cv < 0 && nextCv >= 0) || (tile.cv > 0 && nextCv <= 0)) {
      tile.color = "white";
      tile.cv = null;
      return;
    }
    tile.cv = nextCv;
    tile.color = tileColorForCv(tile.cv);
  });
}

function influenceForTile(color) {
  return {
    black: -2,
    violet: -1,
    green: 1,
    orange: 2,
    red: 3
  }[color] || 0;
}

function tileColorForCv(cv) {
  if (cv < 0) return "violet";
  if (cv === 0) return "white";
  if (cv <= 5) return "green";
  if (cv <= 10) return "orange";
  return "red";
}

function resetActiveDiceForNextRoll() {
  gameState.diceByPlayer[gameState.activePlayerId] = activeDice().filter((die) => !die.temporary);
  activeDice().forEach((die) => {
    if (die.stabilizerRetained === "fresh") {
      die.stabilizerRetained = "carried";
      die.disabled = false;
      die.protocolMarked = false;
      die.protocolOutcomeValue = null;
      die.protocolOutcomeTone = null;
      return;
    }
    die.protocolMarked = false;
    die.rolledFaceId = null;
    die.rolledFaceIndex = null;
    die.outcomeValue = null;
    die.protocolOutcomeValue = null;
    die.protocolOutcomeTone = null;
    die.decoherenceApplied = false;
    die.stabilizerNoFlip = false;
    die.location = "dice";
    die.disabled = false;
    die.groupId = null;
    die.stabilizerRetained = null;
  });
  gameState.groupsByPlayer[gameState.activePlayerId] = activeGroups()
    .filter((group) => group.stabilizerRetained === "fresh")
    .map((group) => ({ ...group, stabilizerRetained: "carried" }));
  delete gameState.collapseByPlayer[gameState.activePlayerId];
  gameState.pendingAction = null;
  gameState.pendingStabilizerSelection = null;
  gameState.pendingProtocolSelection = null;
  gameState.pendingProtocolBoardSelection = null;
  gameState.pendingProtocolGroupSelection = null;
  gameState.pendingProtocolScoringSelection = null;
  gameState.pendingProtocolValueChoice = null;
  gameState.selectedQubits = [];
  gameState.phase = "roll";
}

function advanceToNextPlayer() {
  const order = orderedPlayers();
  const currentIndex = Math.max(0, order.findIndex((player) => player.id === gameState.activePlayerId));
  const nextIndex = currentIndex + 1;
  if (nextIndex >= order.length) {
    if (gameState.gameEndTriggered) {
      gameState.gameOver = true;
      gameState.phase = "game-over";
      logAction("Final round completed. Game over scoring begins.", { type: "global" });
      renderApp();
      return;
    }
    gameState.round += 1;
    gameState.roundOrderIds = orderPlayersByApexTrack().map((player) => player.id);
    gameState.turnIndex = 0;
    gameState.activePlayerId = orderedPlayers()[0].id;
    gameState.turnStatsByPlayer[gameState.activePlayerId] = createTurnStats();
    gameState.protocolEffectsByPlayer[gameState.activePlayerId] = createProtocolEffects();
  } else {
    gameState.turnIndex = nextIndex;
    gameState.activePlayerId = order[nextIndex].id;
    gameState.turnStatsByPlayer[gameState.activePlayerId] = createTurnStats();
    gameState.protocolEffectsByPlayer[gameState.activePlayerId] = createProtocolEffects();
  }
  gameState.phase = "roll";
  gameState.pendingAction = null;
  gameState.pendingStabilizerSelection = null;
  gameState.pendingProtocolSelection = null;
  gameState.pendingProtocolBoardSelection = null;
  gameState.pendingProtocolGroupSelection = null;
  gameState.pendingProtocolScoringSelection = null;
  gameState.pendingProtocolValueChoice = null;
  gameState.selectedQubits = [];
  gameState.selectedHandCardIndex = null;
  logPlayerAction(activePlayer(), `begins turn in round ${gameState.round}.`, "global");
  renderApp();
}

function endActiveTurn() {
  if (gameState.phase !== "post-placement" || gameState.gameOver) return;
  playSound("button");
  logPlayerAction(activePlayer(), "ends turn.");
  applyEndOfTurnStabilizerEffects(activePlayer());
  resetActiveDiceForNextRoll();
  advanceToNextPlayer();
  settleTutorialStepAfterGameChange(["nextTurn"]);
}

function scheduleBotTurn() {
  if (botTurnTimer) clearTimeout(botTurnTimer);
  botTurnTimer = null;
  if (gameState.gameOver || gameState.finalScoringAccepted) return;
  if (gameState.pendingBotCardReveal) return;
  const deltaPlayer = currentDeltaSwapPlayer();
  if (deltaPlayer?.bot) {
    botTurnTimer = setTimeout(runBotStep, 450);
    return;
  }
  if (!activePlayer()?.bot) return;
  botTurnTimer = setTimeout(runBotStep, 650);
}

function runBotStep() {
  botTurnTimer = null;
  if (gameState.gameOver || gameState.finalScoringAccepted) return;
  if (gameState.pendingBotCardReveal) return;
  const deltaPlayer = currentDeltaSwapPlayer();
  if (deltaPlayer?.bot) {
    chooseBotDeltaSwap(deltaPlayer);
    return;
  }
  const player = activePlayer();
  if (!player?.bot) return;

  if (gameState.pendingStabilizerSelection?.playerId === player.id) {
    skipPendingStabilizerSelection();
    return;
  }
  if (gameState.pendingVectorJump?.playerId === player.id) {
    const target = bestBotKey([...availableVectorJumpTargets()], () => 0);
    if (target) resolveVectorJump(target);
    else gameState.pendingVectorJump = null;
    renderApp();
    return;
  }
  if (gameState.pendingEntropicReset?.playerId === player.id) {
    const actionDie = dieById(gameState.pendingEntropicReset.actionDieId);
    if (actionDie) actionDie.disabled = true;
    gameState.pendingEntropicReset = null;
    renderApp();
    return;
  }
  if (gameState.pendingProtocolSelection || gameState.pendingProtocolBoardSelection || gameState.pendingProtocolGroupSelection || gameState.pendingProtocolScoringSelection || gameState.pendingProtocolValueChoice) {
    if (resolveBotPendingProtocol()) return;
    clearBotPendingProtocolState();
    renderApp();
    return;
  }
  if (gameState.pendingProtocolChoice) {
    resolveBotProtocolChoice(player);
    return;
  }
  if (botTryPlayOneCard(player)) return;

  if (gameState.phase === "roll") {
    rollActivePlayerDice();
    return;
  }
  if (gameState.phase === "action-select") {
    if (botUseOneAction()) {
      scheduleBotTurn();
      return;
    }
    const collapseDiceCount = activeDice().filter((die) => die.location === "collapse").length;
    const dicePoolCount = activeDice().filter((die) => die.location === "dice").length;
    if ((!collapseDiceCount || (collapseDiceCount < 4 && dicePoolCount && player.instability < 16)) && dicePoolCount) {
      continueTurn();
      return;
    }
    if (collapseDiceCount) {
      startCollapseResolution();
      return;
    }
  }
  if (gameState.phase === "collapse-resolving") {
    const unresolvedGroup = activeGroups().find((group) => {
      const groupState = activeCollapseState()?.groups?.[group.id];
      return groupState && !groupState.resolved;
    });
    if (unresolvedGroup) {
      const groupState = activeCollapseState().groups[unresolvedGroup.id];
      const bestIndex = bestBotChoiceIndex(groupState.options);
      resolveGroupChoice(unresolvedGroup.id, bestIndex);
      return;
    }
    finalizeCollapseIfReady();
    return;
  }
  if (gameState.phase === "collapsed") {
    applyCollapseValue();
    return;
  }
  if (gameState.phase === "tile-placement") {
    const placements = availablePlacements();
    const key = bestBotKey([...placements.keys()], (candidate) => projectedPlacementPotential(candidate, placements.get(candidate)) ?? -999);
    if (key) placeTileOnHex(key);
    else {
      gameState.pendingPlacement = null;
      gameState.phase = "post-placement";
      renderApp();
    }
    return;
  }
  if (gameState.phase === "post-placement") {
    endActiveTurn();
  }
}

function botUseOneAction() {
  const actionDice = activeDice()
    .filter((die) => die.location === "dice" && !die.disabled && isActivatableDie(die))
    .sort((left, right) => botActionPriority(right.rolledFaceId) - botActionPriority(left.rolledFaceId));
  const actionDie = actionDice[0];
  if (!actionDie) return false;
  if (resolveImmediateAdvancedFace(actionDie)) return true;
  const rule = actionRules[actionDie.rolledFaceId];
  if (!rule) return false;
  const targets = eligibleTargetsForRule(rule);
  if (targets.length < rule.count) return false;
  if (actionDie.rolledFaceId === "resonanceLink") {
    createResonanceLinkGroup(actionDie, targets);
    return true;
  }
  gameState.pendingAction = { actionDieId: actionDie.id, rule, targetIds: [] };
  const selected = chooseBotActionTargets(rule, targets);
  selected.slice(0, rule.count).forEach((die) => {
    if (gameState.pendingAction) selectActionTarget(die);
  });
  if (gameState.pendingAction) {
    gameState.pendingAction = null;
    renderPools();
  }
  return true;
}

function chooseBotActionTargets(rule, targets) {
  const scored = targets.map((die) => ({ die, score: botTargetScore(die, rule) })).sort((left, right) => right.score - left.score);
  if (rule.target === "mixed") {
    const psi = scored.find((entry) => isSuperpositionFaceId(entry.die.rolledFaceId))?.die;
    const outcome = scored.find((entry) => entry.die.rolledFaceId === "outcome")?.die;
    return [psi, outcome].filter(Boolean);
  }
  return scored.map((entry) => entry.die);
}

function botTargetScore(die, rule) {
  if (die.rolledFaceId === "outcome") return 10 - (die.outcomeValue || 0);
  if (isSuperpositionFaceId(die.rolledFaceId)) return rule.type === "relation" ? 7 : 5;
  return 0;
}

function botActionPriority(faceId) {
  if (["nullify", "extraNullify", "rephase", "extraRephase", "synchronize", "extraSynchronize", "interfere", "extraInterfere"].includes(faceId)) return 9;
  if (["entangle", "extraEntangle", "resonate", "extraResonate", "tunneling", "extraTunneling", "bind", "extraBind", "quantumDrift"].includes(faceId)) return 8;
  if (["shift", "extraShift", "conjugate", "extraConjugate", "quantumEcho", "quantumWild", "collapseDelay", "reQuantizeFace"].includes(faceId)) return 7;
  if (["collapseShield", "instabilityDampener"].includes(faceId)) return 6;
  return 1;
}

function bestBotChoiceIndex(options) {
  return Math.max(0, options.reduce((best, option, index) => {
    const value = option.markers.reduce((sum, marker) => sum + markerContribution(marker), 0) + (option.bonus?.value || 0);
    return value > best.value ? { index, value } : best;
  }, { index: 0, value: -Infinity }).index);
}

function bestBotKey(keys, scoreFn) {
  return keys.reduce((best, key) => {
    const score = scoreFn(key);
    return score > best.score ? { key, score } : best;
  }, { key: null, score: -Infinity }).key;
}

function chooseBotDeltaSwap(player) {
  for (const die of gameState.diceByPlayer[player.id] || []) {
    if (!isDieAvailableForFaceSwap(player.id, die)) continue;
    const index = die.faces.findIndex((face) => isDeltaSwappableFace(face));
    if (index >= 0) {
      replaceDieFaceWithDelta(player.id, die.id, index);
      return;
    }
  }
  skipUnavailableDeltaSwaps();
  renderApp();
}

function botTryPlayOneCard(player) {
  if (!player?.bot || hasPendingDeltaSwap()) return false;
  const hand = gameState.handsByPlayer[player.id] || [];

  const expiredStateIndex = hand.findIndex((card) => card.type === "state" && botStateFlagExpired(card) && hasDecohere(card));
  if (expiredStateIndex >= 0) {
    queueBotCardReveal(player, expiredStateIndex, { action: "utility", utility: "decohere" });
    return true;
  }

  const playIndex = hand.findIndex((card) => canAffordCard(player, card));
  if (playIndex < 0) return false;
  const card = hand[playIndex];

  if (card.type === "stabilizer") {
    const slotIndex = firstOpenStabilizerSlot(player);
    if (slotIndex < 0) return false;
    queueBotCardReveal(player, playIndex, { action: "play", slotIndex });
    return true;
  }

  if (card.type === "circuit") {
    if (!hasCircuitUpgradeTargets(player, card)) {
      queueBotCardReveal(player, playIndex, { action: "utility", utility: "requantize" });
      return true;
    }
    queueBotCardReveal(player, playIndex, { action: "play" });
    return true;
  }

  queueBotCardReveal(player, playIndex, { action: "play" });
  return true;
}

function queueBotCardReveal(player, handIndex, config) {
  const card = gameState.handsByPlayer[player.id]?.[handIndex];
  if (!card) return false;
  gameState.pendingBotCardReveal = {
    playerId: player.id,
    cardId: card.id,
    action: config.action,
    utility: config.utility || null,
    slotIndex: Number.isInteger(config.slotIndex) ? config.slotIndex : null
  };
  renderApp();
  botTurnTimer = setTimeout(executePendingBotCardReveal, 950);
  return true;
}

function executePendingBotCardReveal() {
  const pending = gameState.pendingBotCardReveal;
  gameState.pendingBotCardReveal = null;
  if (!pending) return;
  const player = playerById(pending.playerId);
  const hand = gameState.handsByPlayer[player?.id] || [];
  const handIndex = hand.findIndex((card) => card.id === pending.cardId);
  const card = hand[handIndex];
  if (!player || handIndex < 0 || !card) {
    renderApp();
    return;
  }
  if (pending.action === "utility") {
    botResolveCardUtility(player, handIndex, pending.utility);
    return;
  }
  if (card.type === "stabilizer") {
    const slotIndex = Number.isInteger(pending.slotIndex) ? pending.slotIndex : firstOpenStabilizerSlot(player);
    botPlayStabilizer(player, handIndex, slotIndex);
    return;
  }
  if (card.type === "circuit") {
    botPlayCircuit(player, handIndex, card);
    return;
  }
  botPlayNonBoardCard(player, handIndex, card);
}

function firstOpenStabilizerSlot(player) {
  for (let index = 0; index < 5; index += 1) {
    if (isOpenStabilizerSlot(player, index)) return index;
  }
  return -1;
}

function botPlayStabilizer(player, handIndex, slotIndex) {
  const hand = gameState.handsByPlayer[player.id] || [];
  const card = hand[handIndex];
  if (!card || card.type !== "stabilizer") return;
  payCardCost(player, card);
  const [playedCard] = hand.splice(handIndex, 1);
  gameState.playedCardsByPlayer[player.id].stabilizers[slotIndex] = playedCard;
  logPlayerAction(player, `bot plays ${playedCard.name} into Stabilizer slot ${slotIndex + 1}.`);
  updateStabilizerLockStates(player);
  renderApp();
}

function botPlayCircuit(player, handIndex, card) {
  const target = chooseBotCircuitUpgradeTarget(player, card);
  if (!target) {
    botResolveCardUtility(player, handIndex, "requantize");
    return;
  }
  const hand = gameState.handsByPlayer[player.id] || [];
  const die = gameState.diceByPlayer[player.id]?.find((candidate) => candidate.id === target.dieId);
  const face = die?.faces[target.faceIndex];
  const replacement = replacementFaceForCircuit(card, face);
  if (!die || !replacement) return;
  const extraCost = circuitExtraPotentialCost(card, face, replacement);
  if (extraCost > 0 && player.potential < extraCost) {
    botResolveCardUtility(player, handIndex, "requantize");
    return;
  }
  payCardCost(player, card);
  if (extraCost > 0) movePlayerPotential(player, -extraCost);
  const oldFace = die.faces[target.faceIndex]?.id || "face";
  die.faces[target.faceIndex] = replacement;
  const [playedCard] = hand.splice(handIndex, 1);
  tuckPlayedCard(player.id, playedCard);
  logPlayerAction(player, `bot upgrades ${die.label || die.id}: ${oldFace} → ${replacement.id} with ${playedCard.name}.`);
  renderApp();
}

function chooseBotCircuitUpgradeTarget(player, card) {
  const candidates = [];
  (gameState.diceByPlayer[player.id] || []).forEach((die, dieIndex) => {
    die.faces.forEach((face, faceIndex) => {
      if (!isCircuitUpgradeableFace(card, face, player)) return;
      candidates.push({ dieId: die.id, dieIndex, faceIndex, face, score: botCircuitFaceScore(card, face, dieIndex) });
    });
  });
  candidates.sort((left, right) => right.score - left.score || left.dieIndex - right.dieIndex || left.faceIndex - right.faceIndex);
  return candidates[0] || null;
}

function botCircuitFaceScore(card, face, dieIndex) {
  const upgrade = circuitUpgradeMap[card.id];
  let score = 0;
  if (upgrade?.allowed === "actionOrQubit") score = isQubitFaceId(face.id) ? 100 : 50;
  else if (upgrade?.allowed === "superposition") score = 100;
  else if (upgrade?.allowedFace) score = 100;
  else if (upgrade?.allowed === "qubitTier") score = 100 + qubitValueForFace(face.id);
  else if (upgrade?.allowed === "manifold") score = actionRules[face.id] ? 80 : 100 + qubitValueForFace(face.id);
  return score - dieIndex * 0.01;
}

function botPlayNonBoardCard(player, handIndex, card) {
  const hand = gameState.handsByPlayer[player.id] || [];
  if (!card || !canAffordCard(player, card)) return;
  payCardCost(player, card);
  const [playedCard] = hand.splice(handIndex, 1);
  if (playedCard.type === "protocol") applyProtocolQuickEffect(player, playedCard);
  tuckPlayedCard(player.id, playedCard);
  logPlayerAction(player, `bot plays ${playedCard.name} (${playedCard.id}).`);
  applyPlayedCardImmediateEffect(player, playedCard);
  renderApp();
}

function botResolveCardUtility(player, handIndex, action) {
  const hand = gameState.handsByPlayer[player.id] || [];
  const card = hand[handIndex];
  const effect = action === "decohere" ? card?.decohere : card?.requantize;
  if (!card || !effect) return;
  const [discardedCard] = hand.splice(handIndex, 1);
  if (discardedCard) gameState.discardPile.push(discardedCard);
  logPlayerAction(player, `bot ${action === "decohere" ? "decoheres" : "requantizes"} ${discardedCard.name}.`);
  applyResourceEffect(player, effect);
  renderApp();
}

function botStateFlagExpired(card) {
  const current = decoherenceColorRank(currentDecoherenceColor());
  const maxAllowed = Math.max(...(card.decoherenceFlag || []).map(decoherenceColorRank));
  return Number.isFinite(maxAllowed) && current > maxAllowed;
}

function decoherenceColorRank(color) {
  return { green: 0, yellow: 1, orange: 2, red: 3 }[color] ?? -1;
}

function resolveBotPendingProtocol() {
  if (gameState.pendingProtocolSelection?.playerId === gameState.activePlayerId) {
    return resolveBotProtocolSelection();
  }
  if (gameState.pendingProtocolBoardSelection?.playerId === gameState.activePlayerId) {
    const targets = [...availableProtocolBoardTargets()];
    const key = bestBotKey(targets, (candidate) => {
      const tile = gameState.tiles[candidate];
      if (!tile) return fieldPlacementBonusForKey(candidate);
      return tile.ownerId === gameState.activePlayerId ? 3 : 5;
    });
    if (key) {
      resolveProtocolBoardSelection(key);
      return true;
    }
    finishProtocolBoardSelection();
    return true;
  }
  if (gameState.pendingProtocolScoringSelection?.playerId === gameState.activePlayerId) {
    const dieId = bestBotKey([...eligibleProtocolScoringDieIds()], (id) => {
      const marker = activeCollapseState()?.dice?.[id];
      return marker ? markerContribution(marker) : -999;
    });
    if (dieId) {
      resolveProtocolScoringDieSelection(dieId);
      return true;
    }
    const groupId = bestBotKey([...eligibleProtocolScoringGroupIds()], (id) => {
      const result = activeCollapseState()?.groups?.[id]?.result || [];
      return result.reduce((sum, marker) => sum + markerContribution(marker), 0);
    });
    if (groupId) {
      resolveProtocolScoringGroupSelection(groupId);
      return true;
    }
  }
  if (gameState.pendingProtocolValueChoice?.playerId === gameState.activePlayerId) {
    resolveProtocolValueChoice(Math.max(...gameState.pendingProtocolValueChoice.values));
    return true;
  }
  if (gameState.pendingProtocolGroupSelection?.playerId === gameState.activePlayerId) {
    const groupId = bestBotKey([...eligibleProtocolGroupIds()], (id) => {
      const result = activeCollapseState()?.groups?.[id]?.result || [];
      return result.reduce((sum, marker) => sum + markerContribution(marker), 0);
    });
    if (groupId) {
      resolveProtocolGroupSelection(groupId);
      return true;
    }
  }
  return false;
}

function resolveBotProtocolSelection() {
  const pending = gameState.pendingProtocolSelection;
  const targetIds = [...eligibleProtocolTargetIds()];
  if (!pending || !targetIds.length) return false;
  const needed = pending.allowPartial ? Math.max(pending.minNeeded || 1, Math.min(pending.needed, targetIds.length)) : pending.needed;
  const sorted = targetIds
    .map((id) => dieById(id))
    .filter(Boolean)
    .sort((left, right) => botProtocolTargetScore(right, pending) - botProtocolTargetScore(left, pending));
  sorted.slice(0, needed).forEach((die) => {
    if (gameState.pendingProtocolSelection) selectProtocolTarget(die, die.location);
  });
  if (gameState.pendingProtocolSelection?.allowPartial) resolveProtocolSelection();
  return true;
}

function botProtocolTargetScore(die, pending) {
  if (pending.target?.toLowerCase?.().includes("outcome")) return 10 - (die.outcomeValue || 0);
  if (die.rolledFaceId === "outcome") return 5 - (die.outcomeValue || 0);
  if (isSuperpositionFaceId(die.rolledFaceId)) return 8;
  return 1;
}

function resolveBotProtocolChoice(player) {
  const choice = gameState.pendingProtocolChoice;
  if (!choice) return;
  const chooseLeft = player.instability >= 8 || gameState.decoherence <= 5;
  resolveProtocolChoice(chooseLeft ? "left" : "right");
}

function clearBotPendingProtocolState() {
  gameState.pendingProtocolSelection = null;
  gameState.pendingProtocolBoardSelection = null;
  gameState.pendingProtocolGroupSelection = null;
  gameState.pendingProtocolScoringSelection = null;
  gameState.pendingProtocolValueChoice = null;
}

function applyEndOfTurnStabilizerEffects(player) {
  const advanced = stabilizerTurnData(player).decoherenceAdvanced || 0;
  if (advanced >= 2) {
    triggerStabilizer(player, "STABILIZER-22", () => decreaseDecoherence(1));
    triggerStabilizer(player, "STABILIZER-26", () => decreaseDecoherence(2));
  }
}

function randomOutcomeValue() {
  return Math.floor(Math.random() * 6);
}

function buildGroupOptions(group, collapseState) {
  const targets = group.targetIds.map((id) => dieById(id)).filter(Boolean);
  const actionDie = dieById(group.actionDieId);
  const values = targets.map((die) => collapseState.dice[die.id]?.value ?? 0);
  const green = (value) => ({ value, tone: value === 0 ? "zero" : "positive" });
  const red = (value) => ({ value, tone: value === 0 ? "zero" : "negative" });
  const black = (value) => ({ value, tone: "zero" });

  switch (actionDie?.rolledFaceId) {
    case "entangle":
      return [values[0] * 2, values[1] * 2].map((value) => ({ markers: [green(value)] }));
    case "resonate":
      return [
        { markers: [green(values[0] + values[1])] },
        { markers: [green(Math.abs(values[0] - values[1]))] },
      ];
    case "tunneling":
      return [{ markers: [green(Math.max(values[0], values[1])), red(Math.min(values[0], values[1]))] }];
    case "bind":
      return [{ markers: [green(values[1]), black(0)] }];
    case "synchronize":
      return [{ markers: [red(Math.min(values[0], values[1]))] }];
    case "interfere":
      return [{ markers: [red(Math.abs(values[0] - values[1]))] }];
    case "shift":
      return [values[0] - 1, values[0], values[0] + 1].map((value) => ({ markers: [green(value)] }));
    case "conjugate":
      return [values[0], 5 - values[0]].map((value) => ({ markers: [green(value)] }));
    case "rephase":
      return [values[0], 5 - values[0]].map((value) => ({ markers: [red(value)] }));
    case "nullify":
      return [{ markers: [black(0)] }];
    case "quantumDrift":
      return [{ markers: [green(values[1]), red(values[0])] }];
    case "quantumEcho":
      return [{ markers: [green(values[0] * 2)] }];
    case "resonanceLink":
      return values.map((value) => ({ markers: [green(value * 2)] }));
    case "quantumWild":
      if (isSuperpositionFaceId(targets[0]?.rolledFaceId)) {
        return [values[0] - 1, values[0], values[0] + 1, 5 - values[0]].map((value) => ({ markers: [green(value)] }));
      }
      return [values[0], 5 - values[0], 0].map((value) => ({ markers: [value === 0 ? black(0) : red(value)] }));
    case "collapseDelay":
      return [
        { label: "check", markers: [green(values[0])] },
        { label: "cross", markers: [] }
      ];
    case "extraEntangle":
      return [values[0] * 3, values[1] * 3].map((value) => ({ markers: [green(value)] }));
    case "extraResonate":
      return [
        { markers: [green((values[0] * 2) + (values[1] * 2))] },
        { markers: [green(Math.abs((values[0] * 2) - (values[1] * 2)))] },
      ];
    case "extraShift":
      return [values[0] - 2, values[0] - 1, values[0], values[0] + 1, values[0] + 2].map((value) => ({ markers: [green(value)] }));
    case "extraConjugate":
      return [5 + values[0], values[0], 5 - values[0]].map((value) => ({ markers: [green(value)] }));
    case "extraTunneling":
      return [{ markers: [green(Math.max(values[0] * 2, values[1] * 2)), red(Math.min(values[0] * 2, values[1] * 2))] }];
    case "extraRephase":
      return [5 + values[0], values[0], 5 - values[0]].map((value) => ({ markers: [red(value)] }));
    case "extraBind":
      return [{ markers: [green(values[1] * 2), black(0)] }];
    case "extraNullify":
      return [{ markers: [black(0)], immediatePotential: values[0] }];
    case "extraSynchronize":
      return [{ markers: [red(Math.min(2, values[0], values[1]))] }];
    case "extraInterfere":
      return [{ markers: [red(Math.min(2, Math.abs(values[0] - values[1])))] }];
    default:
      return [];
  }
}

function resolveGroupChoice(groupId, choiceIndex) {
  const collapseState = activeCollapseState();
  const groupState = collapseState?.groups?.[groupId];
  if (!groupState || groupState.resolved) return;
  const choice = groupState.options[choiceIndex];
  if (!choice) return;
  playSound("button");
  groupState.resolved = true;
  groupState.result = choice.markers;
  groupState.bonus = choice.bonus || null;
  const values = choice.markers.map((marker) => `${marker.tone === "negative" ? "-" : "+"}${marker.value}`).join(", ") || "no value";
  logPlayerAction(activePlayer(), `resolves a collapse group: ${values}.`);
  if (Number.isFinite(choice.immediatePotential) && choice.immediatePotential !== 0) {
    movePlayerPotential(activePlayer(), choice.immediatePotential);
  }
  finalizeCollapseIfReady();
  renderApp();
  settleTutorialStepAfterGameChange(["collapseFinalized"]);
}

function finalizeCollapseIfReady() {
  const collapseState = activeCollapseState();
  if (!collapseState || collapseState.finalized) return;
  const allResolved = Object.values(collapseState.groups).every((group) => group.resolved);
  if (!allResolved) return;
  if (gameState.pendingStabilizerSelection?.playerId === gameState.activePlayerId) return;

  recalculateFinalizedCollapseTotal(collapseState);
  applyTutorialCollapseOverride(collapseState);
  collapseState.fullCollapseBonus = !collapseState.failed && activeDice().filter((die) => die.location === "collapse").length === 6 ? 2 : 0;
  collapseState.finalized = true;
  activeTurnStats().collapseValue = collapseState.total;
  applyStabilizerCollapseEffects(collapseState);
  gameState.phase = "collapsed";
  logPlayerAction(activePlayer(), collapseState.failed ? `collapse fails at CV ${collapseState.total}.` : `collapse resolves at CV ${collapseState.total}.`);
  playSound(collapseState.failed ? "fail" : "success");
}

function recalculateFinalizedCollapseTotal(collapseState) {
  const groupedTargetIds = new Set(activeGroups().flatMap((group) => group.targetIds));
  const ignoredDieIds = new Set(collapseState.ignoredDieIds || []);
  const freeMarkers = activeDice()
    .filter((die) => die.location === "collapse" && isPsiOrOutcome(die) && !groupedTargetIds.has(die.id) && !ignoredDieIds.has(die.id))
    .map((die) => collapseState.dice[die.id])
    .filter(Boolean);
  const groupStates = Object.values(collapseState.groups).filter((group) => !group.ignored);
  const groupMarkers = groupStates.flatMap((group) => group.result);
  const postResolveBonus = groupStates.reduce((sum, group) => sum + (group.bonus?.value || 0), 0);
  const scoringMarkers = [...freeMarkers, ...groupMarkers];
  applyProtocolCollapseEffects(collapseState, scoringMarkers);

  collapseState.total = scoringMarkers.reduce((sum, marker) => sum + markerContribution(marker), 0) + postResolveBonus;
  collapseState.failed = hasProtocolAdjustedDuplicateFailure(scoringMarkers);
  collapseState.annihilationPairs = countAnnihilationPairs(scoringMarkers);
  collapseState.annihilationBonus = collapseState.annihilationPairs * 5;
  activeTurnStats().collapseValue = collapseState.total;
}

function applyTutorialCollapseOverride(collapseState) {
  if (!gameState.tutorialMode) return;
  const tutorialCollapseNumber = Math.max(0, (gameState.tutorialCollapseIndex || 1) - 1);
  if (gameState.activePlayerId === "p1" && tutorialCollapseNumber === 0) {
    collapseState.total = 2;
    collapseState.failed = false;
    collapseState.annihilationPairs = 0;
    collapseState.annihilationBonus = 0;
    activeTurnStats().collapseValue = 2;
  }
}

function countAnnihilationPairs(markers) {
  const positiveCounts = new Map();
  const negativeCounts = new Map();
  markers.forEach((marker) => {
    const value = Math.abs(Number(marker?.value));
    if (!value) return;
    if (marker.tone === "positive") positiveCounts.set(value, (positiveCounts.get(value) || 0) + 1);
    if (marker.tone === "negative") negativeCounts.set(value, (negativeCounts.get(value) || 0) + 1);
  });
  return [...positiveCounts.entries()].reduce((pairs, [value, positiveCount]) => {
    return pairs + Math.min(positiveCount, negativeCounts.get(value) || 0);
  }, 0);
}

function applyStabilizerCollapseEffects(collapseState) {
  const player = activePlayer();
  const psiCount = activeDice().filter((die) => die.location === "collapse" && isSuperpositionFaceId(die.rolledFaceId)).length;
  triggerStabilizer(player, "STABILIZER-01", () => {
    if (collapseState.total > 6) reduceInstability(player, 1);
  });
  if (!(collapseState.total > 6)) removeUnusedExhaust(player, "STABILIZER-01");

  triggerStabilizer(player, "STABILIZER-03", () => {
    if (psiCount === 1) reduceInstability(player, 1);
  });
  if (psiCount !== 1) removeUnusedExhaust(player, "STABILIZER-03");

  triggerStabilizer(player, "STABILIZER-08", () => {
    if (collapseState.total < 3) reduceInstability(player, 1);
  });
  if (!(collapseState.total < 3)) removeUnusedExhaust(player, "STABILIZER-08");

  triggerStabilizer(player, "STABILIZER-16", () => {
    if (collapseState.total === 0) reduceInstability(player, 2);
  });
  if (collapseState.total !== 0) removeUnusedExhaust(player, "STABILIZER-16");

  triggerStabilizer(player, "STABILIZER-23", () => {
    const count = activeGroups().filter((group) => {
      const action = dieById(group.actionDieId)?.rolledFaceId;
      return action === "entangle" || action === "extraEntangle" || action === "resonanceLink";
    }).length;
    if (count > 0) reduceInstability(player, count);
  });
  if (!activeGroups().some((group) => ["entangle", "extraEntangle", "resonanceLink"].includes(dieById(group.actionDieId)?.rolledFaceId))) removeUnusedExhaust(player, "STABILIZER-23");

  triggerStabilizer(player, "STABILIZER-38", () => {
    const group = activeGroups().find((candidate) => {
      const action = dieById(candidate.actionDieId)?.rolledFaceId;
      return ["entangle", "extraEntangle", "resonanceLink"].includes(action) && !candidate.stabilizerRetained;
    });
    if (!group) return;
    group.stabilizerRetained = "fresh";
    [group.actionDieId, ...group.targetIds].forEach((dieId) => {
      const die = dieById(dieId);
      if (die) {
        die.stabilizerRetained = "fresh";
        if (group.targetIds.includes(dieId)) die.stabilizerNoFlip = true;
      }
    });
  });
  if (!activeGroups().some((group) => ["entangle", "extraEntangle", "resonanceLink"].includes(dieById(group.actionDieId)?.rolledFaceId) && !group.stabilizerRetained)) removeUnusedExhaust(player, "STABILIZER-38");

  triggerStabilizer(player, "STABILIZER-25", () => {
    if (collapseState.total >= 10) reduceInstability(player, 2);
  });
  if (!(collapseState.total >= 10)) removeUnusedExhaust(player, "STABILIZER-25");

  triggerStabilizer(player, "STABILIZER-34", () => {
    if (psiCount >= 2 && player.instability > 20) reduceInstability(player, player.instability - 20);
  });
  if (!(psiCount >= 2 && player.instability > 20)) removeUnusedExhaust(player, "STABILIZER-34");

  triggerStabilizer(player, "STABILIZER-35", () => {
    if (collapseState.total > 0 && player.instability > collapseState.total) reduceInstability(player, player.instability - collapseState.total);
  });
  if (!(collapseState.total > 0 && player.instability > collapseState.total)) removeUnusedExhaust(player, "STABILIZER-35");
}

function removeUnusedExhaust(player, cardId) {
  const data = stabilizerTurnData(player);
  data.used = data.used.filter((id) => id !== cardId);
}

function hasDuplicateCollapseToneValue(markers, tone) {
  const seen = new Set();
  return markers.some((marker) => {
    if (markerTone(marker) !== tone) return false;
    if (seen.has(marker.value)) return true;
    seen.add(marker.value);
    return false;
  });
}

function duplicateScoringDieIds(collapseState) {
  return duplicateScoringTargets(collapseState).dieIds;
}

function duplicateScoringGroupIds(collapseState) {
  return duplicateScoringTargets(collapseState).groupIds;
}

function duplicateScoringTargets(collapseState) {
  if (!collapseState) return { dieIds: new Set(), groupIds: new Set() };
  const targets = { dieIds: new Set(), groupIds: new Set() };
  const seen = { positive: new Map(), negative: new Map() };
  const groupedTargetIds = new Set(activeGroups().flatMap((group) => group.targetIds));
  activeDice()
    .filter((die) => die.location === "collapse" && isPsiOrOutcome(die) && !groupedTargetIds.has(die.id))
    .forEach((die) => {
      const marker = collapseState.dice[die.id];
      const tone = markerTone(marker);
      if (tone !== "positive" && tone !== "negative") return;
      const map = seen[tone];
      if (map.has(marker.value)) {
        targets.dieIds.add(die.id);
        addDuplicateSourceTarget(targets, map.get(marker.value));
      } else {
        map.set(marker.value, { kind: "die", id: die.id });
      }
    });
  activeGroups().forEach((group) => {
    const groupState = collapseState.groups[group.id];
    for (const marker of groupState?.result || []) {
      const tone = markerTone(marker);
      if (tone !== "positive" && tone !== "negative") continue;
      const map = seen[tone];
      if (map.has(marker.value)) {
        targets.groupIds.add(group.id);
        addDuplicateSourceTarget(targets, map.get(marker.value));
      } else {
        map.set(marker.value, { kind: "group", id: group.id });
      }
    }
  });
  return targets;
}

function addDuplicateSourceTarget(targets, source) {
  if (!source) return;
  if (source.kind === "die") targets.dieIds.add(source.id);
  if (source.kind === "group") targets.groupIds.add(source.id);
}

function hasProtocolAdjustedDuplicateFailure(markers) {
  const positiveFail = hasDuplicateCollapseToneValue(markers, "positive");
  const negativeFail = hasDuplicateCollapseToneValue(markers, "negative");
  if (!(positiveFail || negativeFail)) return false;
  const effects = activeProtocolEffects();
  if (!effects.ignoreDuplicateOnce) return true;
  effects.ignoreDuplicateOnce = false;
  return positiveFail && negativeFail;
}

function applyProtocolCollapseEffects(collapseState, scoringMarkers) {
  const effects = activeProtocolEffects();
  effects.collapse.splice(0).forEach((effect) => {
    const greenMarkers = scoringMarkers.filter((marker) => markerTone(marker) === "positive");
    if (!greenMarkers.length) return;
    if (effect.id === "doubleGreenGroup") {
      greenMarkers[0].value *= 2;
    }
    if (effect.id === "doubleGreenAny") {
      greenMarkers[0].value = Math.min(effect.max || 10, greenMarkers[0].value * 2);
    }
    if (effect.id === "singularityGroup") {
      greenMarkers[0].value = greenMarkers[0].value <= 3 ? greenMarkers[0].value * 3 : greenMarkers[0].value * 2;
    }
  });
}

function markerContribution(marker) {
  if (!marker || marker.value === 0) return 0;
  return markerTone(marker) === "negative" ? -Math.abs(marker.value) : marker.value;
}

function activeCollapseState() {
  return gameState.collapseByPlayer[gameState.activePlayerId] || null;
}

function activeGroups() {
  return gameState.groupsByPlayer[gameState.activePlayerId] || [];
}

function formatSigned(value) {
  if (value > 0) return `+${value}`;
  return String(value);
}

function stabilizeInstability() {
  if (hasPendingDeltaSwap()) return;
  const player = activePlayer();
  const discounted = hasActiveStabilizer(player, "STABILIZER-28") && !isStabilizerUsedThisTurn(player, "STABILIZER-28");
  const cost = discounted ? 3 : 5;
  if (player.qubits < cost) return;
  player.qubits -= cost;
  reduceInstability(player, 1);
  if (discounted) exhaustStabilizer(player, "STABILIZER-28");
  updateStabilizerLockStates(player);
  renderApp();
}

function advanceDecoherence(amount) {
  const start = gameState.decoherence;
  let end = start;
  for (let step = 0; step < amount; step += 1) {
    const next = end + 1;
    if (next > DECOHERENCE_MAX) break;
    if (hasActiveStabilizer(activePlayer(), "STABILIZER-37") && isDecoherenceThresholdSpace(next)) {
      exhaustStabilizer(activePlayer(), "STABILIZER-37");
      break;
    }
    end = next;
  }
  for (let value = start + 1; value <= end; value += 1) {
    resolveDecoherenceThreshold(value);
  }
  gameState.decoherence = end;
  const advanced = Math.max(0, end - start);
  if (advanced > 0) logAction(`Decoherence advances ${advanced} step${advanced === 1 ? "" : "s"} (${start} → ${end}).`, { type: "global" });
  if (advanced > 0) playSound("decoherence");
  if (advanced > 0) stabilizerTurnData(activePlayer()).decoherenceAdvanced += advanced;
  if (gameState.decoherence >= DECOHERENCE_MAX) gameState.gameEndTriggered = true;
  return advanced;
}

function isDecoherenceThresholdSpace(value) {
  return decoherenceThresholds.deltaSwap.includes(value) ||
    decoherenceThresholds.drawCard.includes(value) ||
    decoherenceThresholds.potentialLoss.has(value) ||
    decoherenceThresholds.instabilityGain.includes(value);
}

function resolveDecoherenceThreshold(value) {
  if (gameState.gameMode === "flux" && isFluxOneShotDecoherenceThreshold(value)) {
    if ((gameState.triggeredFluxDecoherenceThresholds || []).includes(value)) return;
    gameState.triggeredFluxDecoherenceThresholds.push(value);
  }
  const active = activePlayer();
  const activeIgnoresEvents = hasActiveStabilizer(active, "STABILIZER-31");
  if (decoherenceThresholds.deltaSwap.includes(value)) {
    logAction(`Decoherence event at ${value}: players must swap a legal die face to Δ.`, { type: "global" });
    players.forEach((player) => {
      if (player.id === active.id && activeIgnoresEvents) return;
      player.pendingDeltaSwaps = (player.pendingDeltaSwaps || 0) + 1;
      gameState.deltaSwapQueue.push(player.id);
    });
  }

  if (decoherenceThresholds.drawCard.includes(value)) {
    const drawCount = gameState.gameMode === "flux" ? 3 : 1;
    logAction(`Decoherence event at ${value}: each player draws ${drawCount} card${drawCount === 1 ? "" : "s"}.`, { type: "global" });
    players.forEach((player) => {
      if (player.id === active.id && activeIgnoresEvents) return;
      if (gameState.gameMode === "flux") drawPersonalCards(player.id, drawCount);
      else drawCards(player.id, drawCount);
    });
  }

  if (decoherenceThresholds.potentialLoss.has(value)) {
    const loss = decoherenceThresholds.potentialLoss.get(value);
    logAction(`Decoherence event at ${value}: each player loses ${loss}⬢.`, { type: "global" });
    players.forEach((player) => {
      if (player.id === active.id && activeIgnoresEvents) return;
      movePlayerPotential(player, -loss);
    });
  }

  if (decoherenceThresholds.instabilityGain.includes(value)) {
    logAction(`Decoherence event at ${value}: each player gains +1⧖.`, { type: "global" });
    players.forEach((player) => {
      if (player.id === active.id && activeIgnoresEvents) return;
      increaseInstability(player, 1);
    });
  }
  if (activeIgnoresEvents) exhaustStabilizer(active, "STABILIZER-31");
}

function isFluxOneShotDecoherenceThreshold(value) {
  return decoherenceThresholds.deltaSwap.includes(value) || decoherenceThresholds.drawCard.includes(value);
}

function increaseInstability(player, amount) {
  playSound("track");
  const previous = player.instability;
  const target = player.instability + amount;
  const overflow = Math.max(0, target - 26);
  player.instability = Math.min(26, target);
  const gained = Math.max(0, player.instability - previous);
  if (player.id === gameState.activePlayerId && gained > 0) {
    const data = stabilizerTurnData(player);
    data.instabilityIncreased += gained;
    if (data.instabilityIncreased >= 2) {
      triggerStabilizer(player, "STABILIZER-07", () => reduceInstability(player, 1));
    }
  }
  if (overflow > 0) movePlayerPotential(player, -overflow);
  unlockFacedownStabilizersForInstability(player, previous, player.instability);
  updateStabilizerLockStates(player);
  if (player.instability !== previous) logPlayerAction(player, `instability increases by ${player.instability - previous}⧖ (${previous} → ${player.instability}).`, "warning");
}

function updateStabilizerLockStates(player) {
  const stabilizers = gameState.playedCardsByPlayer[player.id]?.stabilizers || [];
  stabilizers.forEach((card, slotIndex) => {
    if (!card) return;
    const lockedNow = isStabilizerLocked(player, slotIndex);
    const wasLocked = card.__locked === true;
    if (lockedNow && !wasLocked) {
      card.__locked = true;
      applyStabilizerLockEffect(player, card);
    } else if (!lockedNow && wasLocked) {
      card.__locked = false;
    } else if (card.__locked === undefined) {
      card.__locked = lockedNow;
    }
  });
}

function applyStabilizerLockEffect(player, card) {
  const rule = stabilizerLockEffectRules[card.id];
  if (!rule) return;

  const amount = stabilizerLockEffectAmount(player, rule);
  if (amount <= 0) return;

  if (rule.resource === "qubit") {
    player.qubits = Math.max(0, Math.min(35, player.qubits + amount));
  } else if (rule.resource === "potential") {
    movePlayerPotential(player, amount);
  } else if (rule.resource === "instability") {
    player.instability = Math.max(0, player.instability - amount);
    updateStabilizerLockStates(player);
  } else if (rule.resource === "decoherence") {
    decreaseDecoherence(amount);
  }
  logPlayerAction(player, `locks ${card.name} and resolves lock effect (${card.lockEffect}).`, "resource");
}

function stabilizerLockEffectAmount(player, rule) {
  const counts = circuitCollectionCounts(player.id);
  const total = rule.slots.reduce((sum, slotIndex) => sum + (counts[slotIndex] || 0), 0);
  return rule.pairCount ? Math.floor(total / 2) : total;
}

function circuitCollectionCounts(playerId) {
  const circuits = gameState.playedCardsByPlayer[playerId]?.circuits || [];
  return [0, 1, 2, 3].map((slotIndex) => (circuits[slotIndex] || []).length);
}

function turnKey(player = activePlayer()) {
  return `${gameState.round}:${gameState.turnIndex}:${player.id}`;
}

function activeStabilizerEntries(player = activePlayer()) {
  const stabilizers = gameState.playedCardsByPlayer[player.id]?.stabilizers || [];
  return stabilizers
    .map((card, slotIndex) => ({ card, slotIndex }))
    .filter(({ card, slotIndex }) => card && !isStabilizerLocked(player, slotIndex));
}

function activeStabilizerEntry(player, cardId) {
  return activeStabilizerEntries(player).find(({ card }) => card.id === cardId) || null;
}

function hasActiveStabilizer(player, cardId) {
  return Boolean(activeStabilizerEntry(player, cardId));
}

function usedStabilizerIds(player = activePlayer()) {
  const data = gameState.stabilizerTurnDataByPlayer[player.id] || {};
  return data.usedTurnKey === turnKey(player) ? new Set(data.used || []) : new Set();
}

function stabilizerTurnData(player = activePlayer()) {
  const key = turnKey(player);
  const existing = gameState.stabilizerTurnDataByPlayer[player.id];
  if (existing?.usedTurnKey === key) return existing;
  const data = { usedTurnKey: key, used: [], ignoredDelta: 0, decoherenceAdvanced: 0, instabilityIncreased: 0, rerolledDice: 0 };
  gameState.stabilizerTurnDataByPlayer[player.id] = data;
  return data;
}

function isStabilizerUsedThisTurn(player, cardId) {
  return usedStabilizerIds(player).has(cardId);
}

function exhaustStabilizer(player, cardId) {
  if (!hasActiveStabilizer(player, cardId)) return false;
  const data = stabilizerTurnData(player);
  if (!data.used.includes(cardId)) data.used.push(cardId);
  return true;
}

function triggerStabilizer(player, cardId, callback) {
  if (!hasActiveStabilizer(player, cardId) || isStabilizerUsedThisTurn(player, cardId)) return false;
  exhaustStabilizer(player, cardId);
  if (callback) callback();
  return true;
}

function reduceInstability(player, amount) {
  const previous = player.instability;
  player.instability = Math.max(0, player.instability - amount);
  if (player.instability !== previous) playSound("track");
  if (player.instability !== previous) updateStabilizerLockStates(player);
  if (player.instability !== previous) logPlayerAction(player, `instability decreases by ${previous - player.instability}⧖ (${previous} → ${player.instability}).`, "resource");
}

function gainQubits(player, amount) {
  const previous = player.qubits;
  player.qubits = Math.max(0, Math.min(35, player.qubits + amount));
  if (amount > 0) playSound("qubit");
  if (player.qubits !== previous) logPlayerAction(player, `gains ${player.qubits - previous}◈ (${previous} → ${player.qubits}).`, "resource");
}

function unlockFacedownStabilizersForInstability(player, previousInstability, nextInstability) {
  const facedownCards = gameState.facedownStabilizersByPlayer[player.id] || [];
  instabilityLockThresholds.forEach((threshold, index) => {
    if (previousInstability < threshold && nextInstability >= threshold && facedownCards[index]) {
      gameState.handsByPlayer[player.id].push(facedownCards[index]);
      facedownCards[index] = null;
    }
  });
}

function isActivatableDie(die) {
  if (hasPendingDeltaSwap()) return false;
  if (die.location !== "dice" || die.disabled) return false;
  if (["collapseShield", "instabilityDampener"].includes(die.rolledFaceId)) return true;
  if (die.rolledFaceId === "vectorJump") return availableVectorJumpTargetsForPlayer(activePlayer().id).size > 0;
  if (die.rolledFaceId === "entropicReset") return activeDice().some((candidate) => candidate.location === "collapse");
  const rule = actionRules[die.rolledFaceId];
  if (!rule) return false;
  return eligibleTargetsForRule(rule).length >= rule.count;
}

function hasPendingDeltaSwap() {
  return gameState.deltaSwapQueue.length > 0;
}

function currentDeltaSwapPlayer() {
  skipUnavailableDeltaSwaps();
  return hasPendingDeltaSwap() ? playerById(gameState.deltaSwapQueue[0]) : null;
}

function skipUnavailableDeltaSwaps() {
  while (gameState.deltaSwapQueue.length) {
    const player = playerById(gameState.deltaSwapQueue[0]);
    if (!player || !hasAvailableDeltaSwapChoice(player.id)) {
      if (player) {
        player.pendingDeltaSwaps = Math.max(0, (player.pendingDeltaSwaps || 0) - 1);
        if (player.pendingDeltaSwaps === 0) delete player.pendingDeltaSwaps;
      }
      gameState.deltaSwapQueue.shift();
      continue;
    }
    break;
  }
}

function hasAvailableDeltaSwapChoice(playerId) {
  return (gameState.diceByPlayer[playerId] || []).some((die) => {
    if (!isDieAvailableForFaceSwap(playerId, die)) return false;
    return die.faces.some((face) => isDeltaSwappableFace(face));
  });
}

function replaceDieFaceWithDelta(playerId, dieId, faceIndex) {
  if (!hasPendingDeltaSwap() || gameState.deltaSwapQueue[0] !== playerId) return;
  const player = playerById(playerId);
  const die = gameState.diceByPlayer[playerId]?.find((candidate) => candidate.id === dieId);
  if (!player || !die || !isDieAvailableForFaceSwap(playerId, die) || !isDeltaSwappableFace(die.faces[faceIndex])) return;

  const oldFace = die.faces[faceIndex]?.id || "face";
  die.faces[faceIndex] = { id: "decoherence" };
  logPlayerAction(player, `swaps ${oldFace} on ${die.label || die.id} to Δ.`, "warning");
  player.pendingDeltaSwaps = Math.max(0, (player.pendingDeltaSwaps || 0) - 1);
  if (player.pendingDeltaSwaps === 0) delete player.pendingDeltaSwaps;
  gameState.deltaSwapQueue.shift();
  renderApp();
}

function isDeltaSwappableFace(face) {
  return Boolean(face && (face.id === "qubit" || actionRules[face.id]));
}

function isDieAvailableForFaceSwap(playerId, die) {
  if (playerId !== gameState.activePlayerId) return true;
  return die.location === "dice";
}

function deltaFaceTooltip(die, face) {
  if (face.id === "outcome") return `[${die.id.toUpperCase()}] Outcome ${face.outcomeValue}`;
  const tooltip = actionTooltips[face.id] || faceCatalog[face.id]?.name || face.id;
  return `[${die.id.toUpperCase()}] ${tooltip}`;
}

function activeDice() {
  return gameState.diceByPlayer[gameState.activePlayerId] || [];
}

function dieById(id) {
  return activeDice().find((die) => die.id === id);
}

function eligibleStabilizerTargetIds() {
  const ids = new Set();
  const player = activePlayer();
  const pending = gameState.pendingStabilizerSelection;
  if (pending?.playerId === player.id) {
    if (["STABILIZER-05", "STABILIZER-15", "STABILIZER-32"].includes(pending.id)) {
      activeDice()
        .filter((die) => die.location === "collapse" && isSuperpositionFaceId(die.rolledFaceId))
        .forEach((die) => ids.add(die.id));
    }
  }
  if (canUseStabilizerRerollDelta()) {
    activeDice()
      .filter((die) => die.location === "dice" && die.rolledFaceId === "decoherence")
      .forEach((die) => ids.add(die.id));
  }
  if (canUseStabilizerRerollOutcome()) {
    activeDice()
      .filter((die) => die.location === "collapse" && die.rolledFaceId === "outcome")
      .forEach((die) => ids.add(die.id));
  }
  if (canUseStabilizerRerollAllNonPsi()) {
    activeDice()
      .filter((die) => die.location === "collapse" && !isSuperpositionFaceId(die.rolledFaceId))
      .forEach((die) => ids.add(die.id));
  }
  if (canUseStabilizerRerollAllDelta()) {
    activeDice()
      .filter((die) => die.location === "dice" && die.rolledFaceId === "decoherence")
      .forEach((die) => ids.add(die.id));
  }
  return ids;
}

function handleStabilizerDieClick(die, pool) {
  const player = activePlayer();
  const pending = gameState.pendingStabilizerSelection;
  if (pending?.playerId === player.id && pool === "collapse" && eligibleStabilizerTargetIds().has(die.id)) {
    if (pending.id === "STABILIZER-15") {
      if (pending.targetIds.includes(die.id)) {
        pending.targetIds = pending.targetIds.filter((id) => id !== die.id);
      } else if (pending.targetIds.length < 2) {
        pending.targetIds.push(die.id);
      }
      renderApp();
      return true;
    }
    ignoreCollapseDieForStabilizer(die.id, pending.id, false);
    gameState.pendingStabilizerSelection = null;
    queueNextPreChoiceStabilizerSelection();
    renderApp();
    return true;
  }
  if (pool === "dice" && die.rolledFaceId === "decoherence" && canUseStabilizerRerollDelta()) {
    rerollDeltaDieWithUndo(die);
    exhaustStabilizer(player, "STABILIZER-09");
    renderApp();
    return true;
  }
  if (pool === "collapse" && die.rolledFaceId === "outcome" && canUseStabilizerRerollOutcome()) {
    rerollCollapseTargetDie(die);
    exhaustStabilizer(player, "STABILIZER-14");
    renderApp();
    return true;
  }
  return false;
}

function handleRolledDieClick(dieId, pool) {
  if (hasPendingDeltaSwap()) return;
  const die = dieById(dieId);
  if (!die) return;

  if (handleStabilizerDieClick(die, pool)) return;

  if (die.disabled) return;

  if (gameState.pendingEntropicReset && pool === "collapse") {
    selectEntropicResetTarget(die);
    return;
  }

  if (gameState.pendingProtocolSelection && gameState.pendingProtocolSelection.playerId === gameState.activePlayerId) {
    selectProtocolTarget(die, pool);
    return;
  }

  if (gameState.pendingProtocolScoringSelection && gameState.pendingProtocolScoringSelection.playerId === gameState.activePlayerId && pool === "collapse") {
    resolveProtocolScoringDieSelection(die.id);
    return;
  }

  if (gameState.pendingAction && pool === "collapse") {
    selectActionTarget(die);
    return;
  }

  if (gameState.phase !== "action-select" || pool !== "dice" || !isActivatableDie(die)) return;

  if (resolveImmediateAdvancedFace(die)) return;
  startActionSelection(die);
}

function canUseStabilizerRerollDelta() {
  return gameState.phase === "action-select" &&
    hasActiveStabilizer(activePlayer(), "STABILIZER-09") &&
    !isStabilizerUsedThisTurn(activePlayer(), "STABILIZER-09") &&
    activeDice().some((die) => die.location === "dice" && die.rolledFaceId === "decoherence");
}

function canUseStabilizerRerollOutcome() {
  return gameState.phase === "action-select" &&
    hasActiveStabilizer(activePlayer(), "STABILIZER-14") &&
    !isStabilizerUsedThisTurn(activePlayer(), "STABILIZER-14") &&
    activeDice().some((die) => die.location === "collapse" && die.rolledFaceId === "outcome");
}

function canUseStabilizerRerollAllNonPsi() {
  return gameState.phase === "action-select" &&
    hasActiveStabilizer(activePlayer(), "STABILIZER-19") &&
    !isStabilizerUsedThisTurn(activePlayer(), "STABILIZER-19") &&
    activeDice().some((die) => die.location === "collapse" && !isSuperpositionFaceId(die.rolledFaceId));
}

function canUseStabilizerRerollAllDelta() {
  return gameState.phase === "action-select" &&
    hasActiveStabilizer(activePlayer(), "STABILIZER-40") &&
    activeDice().some((die) => die.location === "dice" && die.rolledFaceId === "decoherence");
}

function rerollDeltaDieWithUndo(die) {
  if (die.decoherenceApplied) decreaseDecoherence(1);
  die.decoherenceApplied = false;
  rollDieIntoPool(die);
  resolveAutomaticQubits([die]);
  resolveRolledDecoherenceFaces([die]);
  recordStabilizerRerollCount(1);
}

function useStabilizerRerollAllNonPsi() {
  if (!canUseStabilizerRerollAllNonPsi()) return;
  const targets = activeDice().filter((die) => die.location === "collapse" && !isSuperpositionFaceId(die.rolledFaceId));
  targets.forEach((die) => rerollCollapseTargetDie(die));
  exhaustStabilizer(activePlayer(), "STABILIZER-19");
  renderApp();
}

function useStabilizerRerollAllDelta() {
  if (!canUseStabilizerRerollAllDelta()) return;
  activeDice()
    .filter((die) => die.location === "dice" && die.rolledFaceId === "decoherence")
    .forEach((die) => rerollDeltaDieWithUndo(die));
  exhaustStabilizer(activePlayer(), "STABILIZER-40");
  renderApp();
}

function ignoreCollapseDieForStabilizer(dieId, stabilizerId, shouldFinalize = true) {
  const collapseState = activeCollapseState();
  if (!collapseState) return;
  const die = dieById(dieId);
  const group = activeGroups().find((candidate) => candidate.targetIds.includes(dieId));
  if (group && collapseState.groups[group.id]) {
    collapseState.groups[group.id].ignored = true;
    collapseState.groups[group.id].resolved = true;
    collapseState.groups[group.id].result = [];
  } else if (die) {
    collapseState.ignoredDieIds = collapseState.ignoredDieIds || [];
    if (!collapseState.ignoredDieIds.includes(die.id)) collapseState.ignoredDieIds.push(die.id);
  }
  if (die) die.stabilizerNoFlip = true;
  exhaustStabilizer(activePlayer(), stabilizerId);
  if (shouldFinalize) finalizeCollapseIfReady();
}

function applyPendingStabilizerSelection() {
  const pending = gameState.pendingStabilizerSelection;
  if (!pending || pending.playerId !== gameState.activePlayerId || pending.id !== "STABILIZER-15") return;
  pending.targetIds.forEach((dieId) => ignoreCollapseDieForStabilizer(dieId, "STABILIZER-15", false));
  gameState.pendingStabilizerSelection = null;
  queueNextPreChoiceStabilizerSelection();
  renderApp();
}

function skipPendingStabilizerSelection() {
  if (!gameState.pendingStabilizerSelection || gameState.pendingStabilizerSelection.playerId !== gameState.activePlayerId) return;
  const collapseState = activeCollapseState();
  if (collapseState) {
    collapseState.skippedStabilizerIds = collapseState.skippedStabilizerIds || [];
    collapseState.skippedStabilizerIds.push(gameState.pendingStabilizerSelection.id);
  }
  gameState.pendingStabilizerSelection = null;
  queueNextPreChoiceStabilizerSelection();
  renderApp();
}

function resolveImmediateAdvancedFace(die) {
  if (die.rolledFaceId === "collapseShield") {
    recordActionUse(die.rolledFaceId);
    activePlayer().continueShield = (activePlayer().continueShield || 0) + 1;
    die.disabled = true;
    renderApp();
    return true;
  }
  if (die.rolledFaceId === "instabilityDampener") {
    recordActionUse(die.rolledFaceId);
    activePlayer().instability = Math.max(0, activePlayer().instability - 1);
    updateStabilizerLockStates(activePlayer());
    die.disabled = true;
    renderApp();
    return true;
  }
  if (die.rolledFaceId === "vectorJump") {
    const targets = availableVectorJumpTargetsForPlayer(activePlayer().id);
    if (!targets.size) return false;
    recordActionUse(die.rolledFaceId);
    gameState.pendingVectorJump = { playerId: activePlayer().id, actionDieId: die.id };
    gameState.pendingAction = null;
    renderApp();
    return true;
  }
  if (die.rolledFaceId === "entropicReset") {
    const targets = activeDice().filter((candidate) => candidate.location === "collapse");
    if (!targets.length) return false;
    recordActionUse(die.rolledFaceId);
    gameState.pendingEntropicReset = { playerId: activePlayer().id, actionDieId: die.id, targetDieId: null };
    gameState.pendingAction = null;
    renderPools();
    return true;
  }
  return false;
}

function toggleQubitSelection(die) {
  if (die.rolledFaceId !== "qubit") return;
  activePlayer().qubits = Math.min(35, activePlayer().qubits + 1);
  die.disabled = true;
  gameState.pendingAction = null;
  gameState.selectedQubits = [];
  renderApp();
}

function startActionSelection(actionDie) {
  const rule = actionRules[actionDie.rolledFaceId];
  const targets = eligibleTargetsForRule(rule);
  if (targets.length < rule.count) return;
  if (actionDie.rolledFaceId === "resonanceLink") {
    createResonanceLinkGroup(actionDie, targets);
    return;
  }
  gameState.selectedQubits = [];
  gameState.pendingAction = {
    actionDieId: actionDie.id,
    rule,
    targetIds: []
  };
  renderPools();
  settleTutorialStepAfterGameChange(["actionSelected"]);
}

function selectActionTarget(targetDie) {
  const pending = gameState.pendingAction;
  if (!pending || !eligibleTargetIds().has(targetDie.id)) return;
  if (dieById(pending.actionDieId)?.rolledFaceId === "reQuantizeFace") {
    applyReQuantizeFace(targetDie);
    return;
  }
  if (pending.targetIds.includes(targetDie.id)) {
    pending.targetIds = pending.targetIds.filter((id) => id !== targetDie.id);
  } else {
    pending.targetIds.push(targetDie.id);
  }

  if (pending.targetIds.length >= pending.rule.count) {
    createActionGroup();
    return;
  }
  renderPools();
  settleTutorialStepAfterGameChange(["oneActionTarget"]);
}

function createActionGroup() {
  const pending = gameState.pendingAction;
  const actionDie = dieById(pending.actionDieId);
  recordActionUse(actionDie.rolledFaceId);
  const groupId = `g${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const targetIds =
    pending.rule.target === "mixed"
      ? [...pending.targetIds].sort((leftId, rightId) => {
          const leftDie = dieById(leftId);
          const rightDie = dieById(rightId);
          if (leftDie?.rolledFaceId === rightDie?.rolledFaceId) return 0;
          return isSuperpositionFaceId(leftDie?.rolledFaceId) ? -1 : 1;
        })
      : [...pending.targetIds];
  actionDie.location = "collapse";
  actionDie.groupId = groupId;
  targetIds.forEach((id) => {
    const die = dieById(id);
    die.groupId = groupId;
  });
  gameState.groupsByPlayer[gameState.activePlayerId].push({
    id: groupId,
    kind: pending.rule.type,
    actionDieId: actionDie.id,
    targetIds
  });
  delete gameState.collapseByPlayer[gameState.activePlayerId];
  gameState.pendingAction = null;
  renderPools();
  settleTutorialStepAfterGameChange(["hasGroup"]);
}

function createResonanceLinkGroup(actionDie, targets) {
  recordActionUse(actionDie.rolledFaceId);
  const groupId = `g${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const targetIds = targets.map((die) => die.id);
  actionDie.location = "collapse";
  actionDie.groupId = groupId;
  targetIds.forEach((id) => {
    const die = dieById(id);
    if (die) die.groupId = groupId;
  });
  gameState.groupsByPlayer[gameState.activePlayerId].push({
    id: groupId,
    kind: actionRules.resonanceLink.type,
    actionDieId: actionDie.id,
    targetIds
  });
  delete gameState.collapseByPlayer[gameState.activePlayerId];
  gameState.pendingAction = null;
  gameState.selectedQubits = [];
  renderPools();
}

function recordActionUse(faceId) {
  if (!faceId) return;
  const stats = activeTurnStats();
  stats.actionsUsed.push(faceId);
  const rule = actionRules[faceId];
  if (rule?.type === "relation") stats.relationActionsUsed += 1;
  if (rule?.type === "modifier") stats.modifierActionsUsed += 1;
}

function applyReQuantizeFace(targetDie) {
  const pending = gameState.pendingAction;
  const actionDie = dieById(pending.actionDieId);
  if (!targetDie || targetDie.rolledFaceId !== "outcome") return;
  recordActionUse(actionDie?.rolledFaceId);

  targetDie.faces[targetDie.rolledFaceIndex] = { id: "superposition" };
  targetDie.rolledFaceId = "superposition";
  targetDie.outcomeValue = null;
  targetDie.location = "collapse";
  targetDie.groupId = null;
  if (actionDie) actionDie.disabled = true;
  delete gameState.collapseByPlayer[gameState.activePlayerId];
  gameState.pendingAction = null;
  gameState.selectedQubits = [];
  renderPools();
}

function eligibleTargetIds() {
  if (!gameState.pendingAction) return new Set();
  let targets = eligibleTargetsForRule(gameState.pendingAction.rule);
  if (gameState.pendingAction.rule.target === "mixed" && gameState.pendingAction.targetIds.length === 1) {
    const selected = dieById(gameState.pendingAction.targetIds[0]);
    targets = targets.filter((die) => isSuperpositionFaceId(die.rolledFaceId) !== isSuperpositionFaceId(selected.rolledFaceId));
  }
  return new Set(targets.map((die) => die.id));
}

function eligibleEntropicResetTargetIds() {
  const pending = gameState.pendingEntropicReset;
  if (!pending || pending.playerId !== gameState.activePlayerId || pending.targetDieId) return new Set();
  return new Set(activeDice().filter((die) => die.location === "collapse").map((die) => die.id));
}

function selectEntropicResetTarget(die) {
  const pending = gameState.pendingEntropicReset;
  if (!pending || pending.playerId !== gameState.activePlayerId || !eligibleEntropicResetTargetIds().has(die.id)) return;
  pending.targetDieId = die.id;
  renderEntropicResetDialog();
}

function resolveVectorJump(key) {
  const pending = gameState.pendingVectorJump;
  if (!pending || pending.playerId !== gameState.activePlayerId || !availableVectorJumpTargets().has(key)) return;
  const actionDie = dieById(pending.actionDieId);
  if (actionDie) actionDie.disabled = true;
  gameState.vectorsByPlayer[pending.playerId] = key;
  gameState.pendingVectorJump = null;
  renderApp();
}

function applyEntropicResetFace(faceIndex) {
  const pending = gameState.pendingEntropicReset;
  if (!pending || pending.playerId !== gameState.activePlayerId || !pending.targetDieId) return;
  const targetDie = dieById(pending.targetDieId);
  const actionDie = dieById(pending.actionDieId);
  const face = targetDie?.faces[faceIndex];
  if (!targetDie || !face || faceIndex === targetDie.rolledFaceIndex) return;

  dissolveGroupsContainingDie(targetDie.id);
  targetDie.rolledFaceIndex = faceIndex;
  targetDie.rolledFaceId = face.id;
  targetDie.outcomeValue = face.outcomeValue ?? null;
  targetDie.groupId = null;
  targetDie.location = isCollapseFaceId(face.id) ? "collapse" : "dice";
  targetDie.disabled = face.id === "decoherence";
  if (actionDie) actionDie.disabled = true;
  if (isQubitFaceId(face.id)) resolveAutomaticQubits([targetDie]);
  if (face.id === "decoherence") advanceDecoherence(1);

  gameState.pendingEntropicReset = null;
  delete gameState.collapseByPlayer[gameState.activePlayerId];
  document.querySelector("#entropic-reset-dialog").close();
  renderApp();
}

function dissolveGroupsContainingDie(dieId) {
  const groups = activeGroups();
  const removedGroups = groups.filter((group) => group.actionDieId === dieId || group.targetIds.includes(dieId));
  if (!removedGroups.length) return;

  const releasedIds = new Set(removedGroups.flatMap((group) => [group.actionDieId, ...group.targetIds]));
  activeDice().forEach((die) => {
    if (releasedIds.has(die.id)) die.groupId = null;
  });
  gameState.groupsByPlayer[gameState.activePlayerId] = groups.filter((group) => !removedGroups.includes(group));
}

function eligibleTargetsForRule(rule) {
  const freeDice = activeDice().filter((die) => die.location === "collapse" && !die.groupId && isPsiOrOutcome(die));
  if (rule.target === "superposition") return freeDice.filter((die) => isSuperpositionFaceId(die.rolledFaceId));
  if (rule.target === "outcome") return freeDice.filter((die) => die.rolledFaceId === "outcome");
  if (rule.target === "psiOrOutcome") return freeDice;
  if (rule.target === "mixed") {
    const hasPsi = freeDice.some((die) => isSuperpositionFaceId(die.rolledFaceId));
    const hasOutcome = freeDice.some((die) => die.rolledFaceId === "outcome");
    return hasPsi && hasOutcome ? freeDice : [];
  }
  return [];
}

function isPsiOrOutcome(die) {
  return isSuperpositionFaceId(die.rolledFaceId) || die.rolledFaceId === "outcome";
}

function guardTutorialClick(event) {
  if (!gameState.tutorialMode || event.target.closest("#tutorial-coach")) return;
  const step = activeTutorialSteps()[gameState.tutorialStep];
  if (step?.releaseControls) return;
  const allowedSelector = step?.requireClick;
  if (allowedSelector && event.target.closest(allowedSelector)) return;
  event.preventDefault();
  event.stopPropagation();
}

function bindControls() {
  document.body.addEventListener("click", guardTutorialClick, true);
  document.body.addEventListener("click", (event) => {
    completeTutorialRequiredClick(event);
    if (event.target.closest("button") && !event.target.closest("#music-button, #intro-music-button, #sfx-button, #intro-sfx-button")) {
      playSound("button");
    }
  });
  document.querySelector("#player-count").addEventListener("change", renderIntroPlayerFields);
  document.querySelector("#intro-form").addEventListener("submit", (event) => {
    event.preventDefault();
    startGameFromIntro();
  });
  document.querySelector("#tutorial-start-button").addEventListener("click", startTutorialFromIntro);
  document.querySelector("#roll-continue-button").addEventListener("click", () => {
    if (hasPendingDeltaSwap()) return;
    if (gameState.phase === "roll") {
      rollActivePlayerDice();
      return;
    }
    continueTurn();
  });
  document.querySelector("#stabilize-button").addEventListener("click", stabilizeInstability);
  document.querySelector("#end-turn-button").addEventListener("click", endActiveTurn);
  document.querySelector("#collapse-actions").addEventListener("click", (event) => {
    if (event.target.closest(".protocol-apply-button")) {
      resolveProtocolSelection();
      return;
    }
    if (event.target.closest(".protocol-board-done-button")) {
      finishProtocolBoardSelection();
      return;
    }
    if (event.target.closest(".stabilizer-apply-button")) {
      applyPendingStabilizerSelection();
      return;
    }
    if (event.target.closest(".stabilizer-skip-button")) {
      skipPendingStabilizerSelection();
      return;
    }
    if (event.target.closest(".stabilizer-reroll-non-psi-button")) {
      useStabilizerRerollAllNonPsi();
      return;
    }
    if (event.target.closest(".stabilizer-reroll-delta-button")) {
      useStabilizerRerollAllDelta();
      return;
    }
    if (event.target.closest(".collapse-phase-button")) handleCollapseButton();
  });
  document.querySelector("#dice-pool").addEventListener("click", (event) => {
    const dieButton = event.target.closest(".rolled-face");
    if (dieButton) handleRolledDieClick(dieButton.dataset.dieId, "dice");
  });
  document.querySelector("#collapse-pool").addEventListener("click", (event) => {
    const protocolValueButton = event.target.closest(".protocol-value-choice");
    if (protocolValueButton) {
      resolveProtocolValueChoice(Number(protocolValueButton.dataset.value));
      return;
    }
    const choiceButton = event.target.closest(".collapse-choice");
    if (choiceButton) {
      resolveGroupChoice(choiceButton.dataset.groupId, Number(choiceButton.dataset.choiceIndex));
      return;
    }
    const groupButton = event.target.closest(".collapse-group.protocol-targetable");
    if (groupButton) {
      if (gameState.pendingProtocolScoringSelection) {
        resolveProtocolScoringGroupSelection(groupButton.dataset.groupId);
        return;
      }
      resolveProtocolGroupSelection(groupButton.dataset.groupId);
      return;
    }
    const dieButton = event.target.closest(".rolled-face");
    if (dieButton) handleRolledDieClick(dieButton.dataset.dieId, "collapse");
  });
  document.querySelector("#hand-area").addEventListener("click", (event) => {
    if (activePlayer()?.bot) return;
    const cardButton = event.target.closest(".hand-card-shell");
    if (!cardButton) return;
    gameState.selectedHandCardIndex = Number(cardButton.dataset.handIndex);
    renderHandCardDialog();
  });
  document.querySelector("#hand-card-close").addEventListener("click", closeHandCardDialog);
  document.querySelector("#hand-card-dialog").addEventListener("cancel", closeHandCardDialog);
  document.querySelector("#hand-card-actions").addEventListener("click", (event) => {
    const playButton = event.target.closest("[data-card-play]");
    if (playButton) {
      playSelectedHandCard();
      return;
    }
    const utilityButton = event.target.closest("[data-card-action]");
    if (utilityButton) resolveCardUtilityAction(utilityButton.dataset.cardAction);
  });
  document.querySelector("#protocol-choice-actions").addEventListener("click", (event) => {
    const button = event.target.closest("[data-protocol-choice]");
    if (button) resolveProtocolChoice(button.dataset.protocolChoice);
  });
  document.querySelector("#stabilizer-slots").addEventListener("click", (event) => {
    const slotButton = event.target.closest("[data-stabilizer-slot]");
    if (slotButton) playPendingStabilizerToSlot(Number(slotButton.dataset.stabilizerSlot));
  });
  document.querySelector(".reactor-board").addEventListener("click", (event) => {
    const inspectButton = event.target.closest("[data-tucked-inspect]");
    if (inspectButton) {
      openTuckedCardsDialog(inspectButton.dataset.tuckedInspect, inspectButton.dataset.tuckedSlot);
    }
  });
  document.querySelector("#tucked-cards-close").addEventListener("click", () => {
    document.querySelector("#tucked-cards-dialog").close();
  });
  document.querySelector("#hex-field").addEventListener("click", (event) => {
    if (hasPendingDeltaSwap()) return;
    const zeroPointChoice = event.target.closest("[data-zero-point-choice]");
    if (zeroPointChoice) {
      resolveZeroPointExpansionChoice(zeroPointChoice.dataset.zeroPointChoice);
      return;
    }
    const hexButton = event.target.closest(".hex");
    if (hexButton && gameState.pendingProtocolBoardSelection) {
      const key = hexButton.dataset.hexKey;
      if (availableProtocolBoardTargets().has(key)) {
        resolveProtocolBoardSelection(key);
        return;
      }
      if (gameState.phase !== "tile-placement") return;
    }
    if (hexButton && gameState.pendingVectorJump) {
      resolveVectorJump(hexButton.dataset.hexKey);
      return;
    }
    if (hexButton) placeTileOnHex(hexButton.dataset.hexKey);
  });
  document.querySelector("#delta-swap-dialog").addEventListener("cancel", (event) => {
    event.preventDefault();
  });
  document.querySelector("#delta-swap-grid").addEventListener("click", (event) => {
    const faceButton = event.target.closest(".delta-face-option");
    if (!faceButton) return;
    replaceDieFaceWithDelta(faceButton.dataset.playerId, faceButton.dataset.dieId, Number(faceButton.dataset.faceIndex));
  });
  document.querySelector("#circuit-upgrade-dialog").addEventListener("cancel", (event) => {
    event.preventDefault();
    cancelCircuitUpgrade();
  });
  document.querySelector("#circuit-upgrade-close").addEventListener("click", cancelCircuitUpgrade);
  document.querySelector("#circuit-upgrade-grid").addEventListener("click", (event) => {
    const faceButton = event.target.closest(".delta-face-option");
    if (!faceButton) return;
    applyCircuitUpgrade(faceButton.dataset.dieId, Number(faceButton.dataset.faceIndex));
  });
  document.querySelector("#entropic-reset-dialog").addEventListener("cancel", (event) => {
    event.preventDefault();
  });
  document.querySelector("#entropic-reset-grid").addEventListener("click", (event) => {
    const faceButton = event.target.closest(".delta-face-option");
    if (!faceButton) return;
    applyEntropicResetFace(Number(faceButton.dataset.faceIndex));
  });
  document.querySelector("#scoring-ok-button").addEventListener("click", acceptFinalScoring);
  document.querySelector("#intro-exit-button").addEventListener("click", exitApplication);
  document.querySelector("#app-exit-button").addEventListener("click", handleAppExitButton);
  document.querySelector("#intro-music-button").addEventListener("click", toggleMusic);
  document.querySelector("#music-button").addEventListener("click", toggleMusic);
  document.querySelector("#intro-sfx-button").addEventListener("click", toggleSfx);
  document.querySelector("#sfx-button").addEventListener("click", toggleSfx);
  document.querySelector("#intro-rulebook-button").addEventListener("click", openRulebook);
  document.querySelector("#rulebook-button").addEventListener("click", openRulebook);
  document.querySelector("#rulebook-close").addEventListener("click", () => {
    document.querySelector("#rulebook-dialog").close();
  });
  document.querySelector("#card-library-button").addEventListener("click", openCardLibrary);
  document.querySelector("#card-library-close").addEventListener("click", () => {
    document.querySelector("#card-library-dialog").close();
  });
  document.querySelector("#deck-test-button").addEventListener("click", openDeckTestDialog);
  document.querySelector("#deck-test-close").addEventListener("click", () => {
    document.querySelector("#deck-test-dialog").close();
  });
  document.querySelector("#deck-test-apply").addEventListener("click", applyDeckTestSelection);
  document.querySelector("#dice-library-button").addEventListener("click", openDiceLibrary);
  document.querySelector("#dice-library-close").addEventListener("click", () => {
    document.querySelector("#dice-library-dialog").close();
  });
  document.querySelector("#tutorial-next-button").addEventListener("click", nextTutorialStep);
  document.querySelector("#tutorial-prev-button").addEventListener("click", previousTutorialStep);
  document.querySelector("#tutorial-close-button").addEventListener("click", stopTutorialMode);
  document.querySelectorAll(".card-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      setCardLibraryTab(tab.dataset.cardType);
    });
  });
}

function renderIntroPlayerFields() {
  const count = Number(document.querySelector("#player-count").value);
  const fields = document.querySelector("#player-name-fields");
  fields.innerHTML = playerDefaults
    .slice(0, count)
    .map((player, index) => `
      <label class="intro-field player-name-field" style="--player-color:${player.color}">
        <span>Player ${index + 1}</span>
        <span class="player-name-control">
          <input type="text" value="${player.name}" maxlength="16" data-player-index="${index}" />
          <span class="bot-choice"><input type="checkbox" data-bot-index="${index}" /> Bot</span>
        </span>
      </label>
    `)
    .join("");
}

function startGameFromIntro(options = {}) {
  const count = options.tutorial ? 2 : Number(document.querySelector("#player-count").value);
  const selectedGameMode = options.tutorial ? "normal" : document.querySelector("#game-mode")?.value || "normal";
  const inputs = Array.from(document.querySelectorAll("#player-name-fields input[type='text']"));
  const rawStartPotential = Number(gameState.testStartPotential) || 0;
  const startPotential = Math.max(QP_TRACK_MIN, Math.min(QP_TRACK_MAX - (count - 1), rawStartPotential));
  const startQubits = Math.max(0, Math.min(35, Number(gameState.testStartQubits) || 0));
  const tutorialNames = ["YOU!", "The Other Player"];
  players = playerDefaults.slice(0, count).map((player, index) => ({
    id: player.id,
    name: options.tutorial ? tutorialNames[index] : inputs[index]?.value.trim() || player.name,
    color: player.color,
    potential: startPotential + index,
    trackPotential: startPotential + index,
    qubits: startQubits,
    instability: 0,
    apex: player.apex,
    bot: options.tutorial ? false : Boolean(document.querySelector(`[data-bot-index="${index}"]`)?.checked)
  }));
  resetGameState();
  gameState.gameMode = selectedGameMode;
  gameState.tutorialMode = Boolean(options.tutorial);
  gameState.tutorialStep = 0;
  gameState.tutorialRollIndex = 0;
  gameState.tutorialCollapseIndex = 0;
  gameState.tutorialPlacementIndex = 0;
  gameState.tutorialTurnStartId = players[0]?.id || null;
  logAction(options.tutorial ? "Tutorial game started." : `${selectedGameMode === "flux" ? "Flux" : "Normal"} game started.`, { type: "global" });
  initializePlayerDice();
  configureTutorialDice();
  initializeDeckAndHands();
  configureTutorialCards();
  document.querySelector("#intro-screen").classList.add("hidden");
  document.querySelector("#app-shell").classList.remove("hidden", "final-locked");
  renderApp();
}

function startTutorialFromIntro() {
  startGameFromIntro({ tutorial: true });
}

function exitToIntro() {
  closeAllDialogs();
  resetTestSettings();
  resetGameState();
  document.querySelector("#app-shell").classList.add("hidden");
  document.querySelector("#app-shell").classList.remove("final-locked");
  document.querySelector("#intro-screen").classList.remove("hidden");
  clearTutorialHighlight();
}

function handleAppExitButton() {
  if (gameState.finalScoringAccepted) {
    exitToIntro();
    return;
  }
  exitApplication();
}

function exitApplication() {
  if (window.QuantumFluxDesktop?.exitApp) {
    window.QuantumFluxDesktop.exitApp();
    return;
  }
  if (!document.querySelector("#app-shell").classList.contains("hidden")) {
    exitToIntro();
    return;
  }
  window.close();
}

function resetTestSettings() {
  gameState.testDeckTypes = {
    protocol: true,
    circuit: true,
    stabilizer: true,
    state: true
  };
  gameState.testStartPotential = 0;
  gameState.testStartQubits = 0;
  const startInput = document.querySelector("#deck-test-start");
  if (startInput) startInput.value = "0";
  const qubitsInput = document.querySelector("#deck-test-qubits");
  if (qubitsInput) qubitsInput.value = "0";
  document.querySelectorAll("#deck-test-dialog [data-deck-type]").forEach((checkbox) => {
    checkbox.checked = true;
  });
}

function closeAllDialogs() {
  document.querySelectorAll("dialog").forEach((dialog) => {
    if (dialog.open) dialog.close();
  });
}

function closeHandCardDialog() {
  gameState.selectedHandCardIndex = null;
  document.querySelector("#hand-card-dialog").close();
}

function openRulebook() {
  renderRulebookVisuals();
  const dialog = document.querySelector("#rulebook-dialog");
  if (!dialog.open) dialog.showModal();
}

function nextTutorialStep() {
  if (!gameState.tutorialMode) return;
  const steps = activeTutorialSteps();
  const step = steps[gameState.tutorialStep];
  if (step?.requireClick) return;
  if (gameState.tutorialStep >= steps.length - 1) {
    stopTutorialMode();
    return;
  }
  gameState.tutorialStep = Math.min(steps.length - 1, gameState.tutorialStep + 1);
  renderTutorialCoach();
}

function previousTutorialStep() {
  if (!gameState.tutorialMode) return;
  gameState.tutorialStep = Math.max(0, gameState.tutorialStep - 1);
  renderTutorialCoach();
}

function stopTutorialMode() {
  gameState.tutorialMode = false;
  gameState.tutorialStep = 0;
  renderTutorialCoach();
}

function activeTutorialSteps() {
  return guidedTutorialSteps;
}

function completeTutorialRequiredClick(event) {
  if (!gameState.tutorialMode || event.target.closest("#tutorial-coach")) return;
  const steps = activeTutorialSteps();
  const step = steps[gameState.tutorialStep];
  if (!step?.requireClick || !event.target.closest(step.requireClick)) return;
  const context = {
    beforePlayerId: step.startPlayerId || gameState.activePlayerId
  };
  setTimeout(() => {
    if (!gameState.tutorialMode || activeTutorialSteps()[gameState.tutorialStep] !== step) return;
    if (!isTutorialStepSatisfied(step, context)) {
      renderTutorialCoach();
      return;
    }
    gameState.tutorialStep = Math.min(activeTutorialSteps().length - 1, gameState.tutorialStep + 1);
    renderTutorialCoach();
  }, 180);
}

function isTutorialStepSatisfied(step, context = {}) {
  switch (step.completeWhen) {
    case "rolled":
    case "continued":
      return gameState.phase === "action-select";
    case "actionSelected":
      return Boolean(gameState.pendingAction);
    case "oneActionTarget":
      return Boolean(gameState.pendingAction?.targetIds?.length);
    case "hasGroup":
      return activeGroups().length > 0;
    case "collapseStarted":
      return ["collapse-resolving", "collapsed"].includes(gameState.phase);
    case "collapseFinalized":
      return Boolean(activeCollapseState()?.finalized);
    case "tilePlacement":
      return gameState.phase === "tile-placement";
    case "postPlacement":
      return gameState.phase === "post-placement";
    case "nextTurn":
      return gameState.activePlayerId !== context.beforePlayerId;
    case "cardDialogOpen":
      return Boolean(document.querySelector("#hand-card-dialog")?.open);
    case "cardDialogClosed":
      return !document.querySelector("#hand-card-dialog")?.open;
    case "stateTucked":
      return (gameState.playedCardsByPlayer[gameState.activePlayerId]?.states || []).length > 0;
    case "tuckedDialogOpen":
      return Boolean(document.querySelector("#tucked-cards-dialog")?.open);
    case "tuckedDialogClosed":
      return !document.querySelector("#tucked-cards-dialog")?.open;
    default:
      return true;
  }
}

function settleTutorialStepAfterGameChange(allowedCompletions = []) {
  if (!gameState.tutorialMode) return;
  const step = activeTutorialSteps()[gameState.tutorialStep];
  if (!step?.requireClick || !allowedCompletions.includes(step.completeWhen)) return;
  if (!isTutorialStepSatisfied(step, { beforePlayerId: step.startPlayerId || gameState.activePlayerId })) return;
  gameState.tutorialStep = Math.min(activeTutorialSteps().length - 1, gameState.tutorialStep + 1);
  renderTutorialCoach();
}

function runTutorialStepEnterEffect(step, stepIndex) {
  if (!gameState.tutorialMode || !step?.autoRun || step._autoRunDone) return;
  step._autoRunDone = true;
  if (step.autoRun === "grantCircuit39") {
    const card = cardById("CIRCUIT-39");
    if (card && !(gameState.handsByPlayer.p1 || []).some((candidate) => candidate.id === card.id)) {
      gameState.handsByPlayer.p1.push(card);
      logPlayerAction(playerById("p1"), "receives CIRCUIT-39 from the Apex tutorial.", "resource");
      renderApp();
    }
    return;
  }
  if (step.autoRun === "otherTurnOne") {
    setTimeout(() => {
      simulateTutorialOtherTurnOne();
      gameState.tutorialStep = Math.min(activeTutorialSteps().length - 1, stepIndex + 1);
      renderApp();
    }, 900);
    return;
  }
  if (step.autoRun === "otherTurnTwo") {
    setTimeout(() => {
      simulateTutorialOtherTurnTwo();
      gameState.tutorialStep = Math.min(activeTutorialSteps().length - 1, stepIndex + 1);
      renderApp();
    }, 900);
  }
}

function simulateTutorialOtherTurnOne() {
  const other = playerById("p2");
  const you = playerById("p1");
  if (!other || !you) return;
  gameState.activePlayerId = "p2";
  logPlayerAction(other, "performs scripted tutorial turn: Roll, Shift, Continue, Nullify, Collapse, and place beside YOU!.", "global");
  other.qubits = Math.min(35, other.qubits + 4);
  other.instability = Math.max(other.instability, 1);
  const playerTileKey = gameState.vectorsByPlayer.p1 || Object.keys(gameState.tiles).find((key) => gameState.tiles[key]?.ownerId === "p1");
  const targetKey = neighborKeys(playerTileKey || "0,0").find((key) => isFreeHex(key)) || "1,0";
  gameState.tiles[targetKey] = createPlacedTile("green", 4, "p2");
  gameState.vectorsByPlayer.p2 = targetKey;
  if (playerTileKey && gameState.tiles[playerTileKey]?.cv !== null) {
    gameState.tiles[playerTileKey].cv = Math.max(0, gameState.tiles[playerTileKey].cv - 2);
    if (gameState.tiles[playerTileKey].cv === 0) gameState.tiles[playerTileKey].color = "white";
  }
  const circuit = cardById("CIRCUIT-12");
  if (circuit) {
    gameState.handsByPlayer.p2 = (gameState.handsByPlayer.p2 || []).filter((card) => card.id !== "CIRCUIT-12");
    tuckPlayedCard("p2", circuit);
    const die = gameState.diceByPlayer.p2?.[0];
    const faceIndex = die?.faces.findIndex((face) => face.id === "superposition");
    if (die && faceIndex >= 0) die.faces[faceIndex] = { id: "suppressorMinus1" };
    logPlayerAction(other, "plays CIRCUIT-12 and upgrades Die 1 superposition into a -1 suppressor.", "card");
  }
  endTutorialOtherTurn();
}

function simulateTutorialOtherTurnTwo() {
  const other = playerById("p2");
  const you = playerById("p1");
  if (!other || !you) return;
  gameState.activePlayerId = "p2";
  logPlayerAction(other, "performs scripted Entangle turn, reaches CV 10, draws 3 cards, and conquers YOUR hex.", "global");
  drawCards("p2", 3);
  const targetKey = gameState.vectorsByPlayer.p1 || Object.keys(gameState.tiles).find((key) => gameState.tiles[key]?.ownerId === "p1");
  if (targetKey && gameState.tiles[targetKey]) {
    gameState.tiles[targetKey] = createPlacedTile("orange", 10, "p2");
    gameState.vectorsByPlayer.p2 = targetKey;
    movePlayerPotential(other, 7);
    movePlayerPotential(you, -1);
    logPlayerAction(other, `conquers YOUR tile at ${targetKey} in the tutorial.`, "tile");
  }
  other.apex = 10;
  gameState.apexHolderId = "p2";
  endTutorialOtherTurn();
}

function endTutorialOtherTurn() {
  resetActiveDiceForNextRoll();
  gameState.activePlayerId = "p1";
  gameState.phase = "roll";
  gameState.pendingPlacement = null;
  gameState.pendingAction = null;
}

function renderTutorialCoach() {
  const coach = document.querySelector("#tutorial-coach");
  if (!coach) return;
  clearTutorialHighlight();

  if (!gameState.tutorialMode) {
    coach.classList.add("hidden");
    return;
  }

  const steps = activeTutorialSteps();
  const stepIndex = Math.max(0, Math.min(steps.length - 1, gameState.tutorialStep));
  const step = steps[stepIndex];
  runTutorialStepEnterEffect(step, stepIndex);
  if (step.completeWhen === "nextTurn" && step._armedStepIndex !== stepIndex) {
    step._armedStepIndex = stepIndex;
    step.startPlayerId = gameState.activePlayerId;
  }
  coach.classList.remove("hidden");
  document.querySelector("#tutorial-progress").textContent = `Tutorial ${stepIndex + 1}/${steps.length}`;
  document.querySelector("#tutorial-title").textContent = step.title;
  document.querySelector("#tutorial-text").textContent = step.text;
  document.querySelector("#tutorial-prev-button").disabled = stepIndex === 0;
  const blockingAutoRun = ["otherTurnOne", "otherTurnTwo"].includes(step.autoRun);
  document.querySelector("#tutorial-next-button").disabled = Boolean(step.requireClick || blockingAutoRun);
  document.querySelector("#tutorial-next-button").textContent = blockingAutoRun ? "Running Script" : step.requireClick ? "Click Highlighted Step" : stepIndex === steps.length - 1 ? "Finish" : "Next";

  const highlightTarget = step.target || step.requireClick;
  if (highlightTarget) {
    requestAnimationFrame(() => {
      clearTutorialHighlight();
      const target = document.querySelector(highlightTarget);
      if (target) target.classList.add("tutorial-highlight");
    });
  }
}

function clearTutorialHighlight() {
  document.querySelectorAll(".tutorial-highlight").forEach((element) => {
    element.classList.remove("tutorial-highlight");
  });
}

function renderRulebookVisuals() {
  const diceStrip = document.querySelector("#rulebook-dice-strip");
  if (diceStrip && !diceStrip.dataset.rendered) {
    const diceFaces = [
      ["superposition", "Superposition"],
      ["outcome", "Outcome"],
      ["qubit", "Qubit"],
      ["decoherence", "Decoherence"],
      ["entangle", "Relation"],
      ["shift", "Modifier"]
    ];
    diceStrip.innerHTML = diceFaces.map(([faceId, label]) => {
      const face = faceId === "outcome"
        ? '<span class="die-face outcome"><span class="face-main">3</span></span>'
        : renderFace(faceCatalog[faceId]);
      return `<div class="rulebook-dice-item">${face}<span>${label}</span></div>`;
    }).join("");
    diceStrip.dataset.rendered = "true";
  }

  const cardStrip = document.querySelector("#rulebook-card-strip");
  if (cardStrip && !cardStrip.dataset.rendered && window.QuantumFluxCards && window.QuantumFluxCardRenderer) {
    const samples = ["protocol", "circuit", "stabilizer", "state"]
      .map((type) => window.QuantumFluxCards.cards.find((card) => card.type === type))
      .filter(Boolean);
    cardStrip.innerHTML = samples.map((card) => `
      <div class="rulebook-card-sample">
        ${window.QuantumFluxCardRenderer.renderCard(card)}
        <span>${card.type.toUpperCase()}</span>
      </div>
    `).join("");
    cardStrip.dataset.rendered = "true";
  }
}

function openCardLibrary() {
  setCardLibraryTab("protocol");
  document.querySelector("#card-library-dialog").showModal();
}

function openDeckTestDialog() {
  document.querySelector("#deck-test-start").value = String(gameState.testStartPotential || 0);
  document.querySelector("#deck-test-qubits").value = String(gameState.testStartQubits || 0);
  document.querySelectorAll("#deck-test-dialog [data-deck-type]").forEach((checkbox) => {
    checkbox.checked = Boolean(gameState.testDeckTypes[checkbox.dataset.deckType]);
  });
  const dialog = document.querySelector("#deck-test-dialog");
  if (!dialog.open) {
    try {
      dialog.showModal();
    } catch {
      dialog.show();
    }
  }
}

function applyDeckTestSelection() {
  document.querySelectorAll("#deck-test-dialog [data-deck-type]").forEach((checkbox) => {
    gameState.testDeckTypes[checkbox.dataset.deckType] = checkbox.checked;
  });
  const startValue = Number(document.querySelector("#deck-test-start").value);
  gameState.testStartPotential = Number.isFinite(startValue) ? Math.max(QP_TRACK_MIN, Math.min(QP_TRACK_MAX, Math.trunc(startValue))) : 0;
  document.querySelector("#deck-test-start").value = String(gameState.testStartPotential);
  const qubitsValue = Number(document.querySelector("#deck-test-qubits").value);
  gameState.testStartQubits = Number.isFinite(qubitsValue) ? Math.max(0, Math.min(35, Math.trunc(qubitsValue))) : 0;
  document.querySelector("#deck-test-qubits").value = String(gameState.testStartQubits);
  document.querySelector("#deck-test-dialog").close();
}

function openDiceLibrary() {
  renderDiceLibrary();
  document.querySelector("#dice-library-dialog").showModal();
}

function setCardLibraryTab(type) {
  document.querySelectorAll(".card-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.cardType === type);
  });
  document.querySelector("#card-library-grid").innerHTML = window.QuantumFluxCards.cards
    .filter((card) => card.type === type)
    .map((card) => window.QuantumFluxCardRenderer.renderCard(card))
    .join("");
}

function renderDiceLibrary() {
  const entries = [
    ...Object.keys(faceCatalog).filter((faceId) => faceId !== "outcome"),
    "qubit",
    "decoherence",
    "superposition",
    "outcome"
  ].filter((faceId, index, list) => list.indexOf(faceId) === index);
  document.querySelector("#dice-library-grid").innerHTML = entries.map(renderDiceLibraryEntry).join("");
}

function renderDiceLibraryEntry(faceId) {
  const face = faceId === "outcome"
    ? { name: "Outcome", symbol: "3", tone: "outcome" }
    : faceCatalog[faceId];
  const rule = actionRules[faceId];
  const tooltip = diceLibraryRules[faceId] || actionTooltips[faceId] || diceFaceDescription(faceId);
  const hoverInfo = actionTooltips[faceId] || diceFaceDescription(faceId);
  const activation = diceFaceActivation(faceId);
  const target = rule ? targetDescription(rule) : diceFaceTarget(faceId);
  const faceMarkup = faceId === "outcome"
    ? '<span class="die-face outcome"><span class="face-main">3</span></span>'
    : renderFace(face);

  return `
    <article class="dice-library-item">
      <div>${faceMarkup}</div>
      <div>
        <h3>${face.name}</h3>
        <div class="dice-library-meta">
          <span class="dice-library-tag">${rule?.type || diceFaceType(faceId)}</span>
          <span class="dice-library-tag">${target}</span>
        </div>
        <p class="dice-library-hover">${hoverInfo}</p>
        <p class="dice-library-rule">${tooltip}</p>
        <p>${activation}</p>
      </div>
    </article>
  `;
}

function diceFaceType(faceId) {
  if (isQubitFaceId(faceId)) return "resource";
  if (faceId === "decoherence") return "global";
  if (faceId === "superposition" || faceId === "outcome" || isSuppressorFaceId(faceId)) return "collapse";
  return "face";
}

function targetDescription(rule) {
  if (rule.target === "psiOrOutcome") return "Psi or outcome";
  if (rule.variable && rule.target === "superposition") return "all free Psi";
  if (rule.target === "mixed") return "Ψ + outcome";
  if (rule.target === "superposition") return `${rule.count} Ψ`;
  if (rule.target === "outcome") return `${rule.count} outcomes`;
  return "target";
}

function diceFaceTarget(faceId) {
  if (isQubitFaceId(faceId)) return `+${qubitValueForFace(faceId)} qubits`;
  if (isSuppressorFaceId(faceId)) return "auto collapse";
  if (faceId === "qubit") return "+1◈";
  if (faceId === "decoherence") return "+1Δ";
  if (faceId === "superposition") return "auto collapse";
  if (faceId === "outcome") return "auto collapse";
  return "";
}

function diceFaceDescription(faceId) {
  if (diceLibraryRules[faceId]) return diceLibraryRules[faceId];
  if (faceId === "qubit") return "Qubit";
  if (faceId === "decoherence") return "Decoherence";
  if (faceId === "superposition") return "Superposition Ψ";
  if (faceId === "outcome") return "Outcome N";
  return faceCatalog[faceId]?.name || faceId;
}

function diceFaceActivation(faceId) {
  if (diceLibraryUsage[faceId]) return diceLibraryUsage[faceId];
  if (faceId === "reQuantizeFace") return "Clicked from the Dice Pool when at least one free Outcome exists. Choose one Outcome in the Collapse Pool; it becomes a proper Psi and will collapse randomly.";
  if (faceId === "resonanceLink") return "Clicked from the Dice Pool when at least one free Psi exists. It immediately groups together with all free Psi dice in the Collapse Pool.";
  if (faceId === "entropicReset") return "Clicked from the Dice Pool when at least one die exists in the Collapse Pool. Choose a collapse die, then choose one of its other five faces. Action and qubit faces return to Dice Pool; Psi and Outcome stay in Collapse Pool.";
  if (actionRules[faceId]) return "Clicked from the Dice Pool when enough legal free targets exist in the Collapse Pool. The action die moves into the Collapse Pool and forms a group with selected target dice.";
  if (faceId === "qubit") return "Automatically resolves after rolling: gain +1◈, then the die is disabled for the turn.";
  if (faceId === "decoherence") return "Automatically resolves after rolling or continuing: advance Decoherence by 1. This face cannot be clicked or selected for actions.";
  if (faceId === "superposition") return "Automatically transfers to the Collapse Pool. On collapse, it receives a random 0-5 green value before actions/groups resolve.";
  if (faceId === "outcome") return "Automatically transfers to the Collapse Pool. Its printed number becomes a red collapse value unless modified or grouped.";
  return "";
}

function renderDeltaSwapDialog() {
  skipUnavailableDeltaSwaps();
  const dialog = document.querySelector("#delta-swap-dialog");
  const grid = document.querySelector("#delta-swap-grid");
  const player = currentDeltaSwapPlayer();

  if (!player) {
    grid.innerHTML = "";
    if (dialog.open) dialog.close();
    return;
  }

  document.querySelector("#delta-swap-title").innerHTML = `${playerNameMarkup(player)}: choose a face`;
  document.querySelector("#delta-swap-count").textContent = `${player.pendingDeltaSwaps || 1} pending`;
  grid.innerHTML = gameState.diceByPlayer[player.id]
    .map((die) => {
      const dieAvailable = isDieAvailableForFaceSwap(player.id, die);
      return `
      <section class="delta-die-card ${dieAvailable ? "" : "unavailable"}">
        <h3>${die.name}</h3>
        <div class="delta-face-row">
          ${die.faces
            .map((face, index) => {
              const disabled = dieAvailable && isDeltaSwappableFace(face) ? "" : "disabled";
              const tooltip = escapeAttribute(deltaFaceTooltip(die, face));
              return `
                <button
                  type="button"
                  class="delta-face-option"
                  data-player-id="${player.id}"
                  data-die-id="${die.id}"
                  data-face-index="${index}"
                  data-tooltip="${tooltip}"
                  ${disabled}
                >
                  ${renderDieFaceById(face.id, face.outcomeValue)}
                </button>
              `;
            })
            .join("")}
        </div>
      </section>
    `;
    })
    .join("");

  if (!dialog.open) dialog.showModal();
}

function renderCircuitUpgradeDialog() {
  const dialog = document.querySelector("#circuit-upgrade-dialog");
  const grid = document.querySelector("#circuit-upgrade-grid");
  const pending = gameState.pendingCircuitUpgrade;
  if (!pending) {
    grid.innerHTML = "";
    if (dialog.open) dialog.close();
    return;
  }
  const player = playerById(pending.playerId);
  const card = gameState.handsByPlayer[player.id]?.[pending.handIndex];
  if (!player || !card) return;

  const upgrade = circuitUpgradeMap[card.id];
  const replacementFace = upgrade?.faceId ? faceCatalog[upgrade.faceId] : null;
  document.querySelector("#circuit-upgrade-title").textContent = `${card.name}: choose a face`;
  document.querySelector("#circuit-upgrade-copy").textContent = replacementFace
    ? `Replace a legal face with ${replacementFace.name}.`
    : "Choose an action to convert to ◈, or a qubit face to upgrade by one step.";
  const diceToShow = (gameState.diceByPlayer[player.id] || []).filter((die) => {
    if (!upgrade?.allowedFace && upgrade?.allowed !== "manifold") return true;
    return die.faces.some((face) => isCircuitUpgradeableFace(card, face, player));
  });
  grid.innerHTML = diceToShow.map((die) => `
    <section class="delta-die-card">
      <h3>${die.name}</h3>
      <div class="delta-face-row">
        ${die.faces.map((face, index) => {
          const legal = isCircuitUpgradeableFace(card, face, player);
          const replacement = legal ? replacementFaceForCircuit(card, face) : null;
          const tooltip = escapeAttribute(legal ? `${faceCatalog[face.id]?.name || face.id} → ${faceCatalog[replacement.id]?.name || replacement.id}` : "Not eligible for this circuit");
          return `
            <button
              type="button"
              class="delta-face-option"
              data-die-id="${die.id}"
              data-face-index="${index}"
              data-tooltip="${tooltip}"
              ${legal ? "" : "disabled"}
            >
              ${renderDieFaceById(face.id, face.outcomeValue)}
            </button>
          `;
        }).join("")}
      </div>
    </section>
  `).join("");

  if (!dialog.open) dialog.showModal();
}

function renderEntropicResetDialog() {
  const dialog = document.querySelector("#entropic-reset-dialog");
  const grid = document.querySelector("#entropic-reset-grid");
  const pending = gameState.pendingEntropicReset;
  if (!pending?.targetDieId) {
    grid.innerHTML = "";
    if (dialog.open) dialog.close();
    return;
  }
  const die = dieById(pending.targetDieId);
  if (!die) return;
  document.querySelector("#entropic-reset-title").textContent = `${die.name}: choose a new face`;
  grid.innerHTML = `
    <section class="delta-die-card">
      <h3>${die.name}</h3>
      <div class="delta-face-row">
        ${die.faces.map((face, index) => {
          if (index === die.rolledFaceIndex) return "";
          const tooltip = escapeAttribute(face.id === "outcome" ? `Outcome ${face.outcomeValue}` : (faceCatalog[face.id]?.name || face.id));
          return `
            <button
              type="button"
              class="delta-face-option"
              data-face-index="${index}"
              data-tooltip="${tooltip}"
            >
              ${renderDieFaceById(face.id, face.outcomeValue)}
            </button>
          `;
        }).join("")}
      </div>
    </section>
  `;
  if (!dialog.open) dialog.showModal();
}

function renderHandCardDialog() {
  const dialog = document.querySelector("#hand-card-dialog");
  const zoom = document.querySelector("#hand-card-zoom");
  const actions = document.querySelector("#hand-card-actions");
  const botReveal = gameState.pendingBotCardReveal;
  if (botReveal) {
    const player = playerById(botReveal.playerId);
    const card = (gameState.handsByPlayer[botReveal.playerId] || []).find((candidate) => candidate.id === botReveal.cardId);
    if (!card) {
      zoom.innerHTML = "";
      actions.innerHTML = "";
      if (dialog.open) dialog.close();
      return;
    }
    zoom.innerHTML = window.QuantumFluxCardRenderer.renderCard(card);
    actions.innerHTML = `<div class="bot-card-reveal-label"><span style="color:${player?.color || "#fff"}">${escapeHtml(player?.name || "Bot")}</span> plays this card</div>`;
    if (!dialog.open) dialog.showModal();
    return;
  }
  if (activePlayer()?.bot) {
    zoom.innerHTML = "";
    actions.innerHTML = "";
    if (dialog.open) dialog.close();
    return;
  }
  const hand = gameState.handsByPlayer[gameState.activePlayerId] || [];
  const card = hand[gameState.selectedHandCardIndex];

  if (!card) {
    zoom.innerHTML = "";
    actions.innerHTML = "";
    if (dialog.open) dialog.close();
    return;
  }

  const player = activePlayer();
  zoom.innerHTML = window.QuantumFluxCardRenderer.renderCard(card);
  actions.innerHTML = `
    ${canAffordCard(player, card) ? '<button type="button" class="zoom-action-button play" data-card-play="true" title="Play">▷</button>' : ""}
    ${renderCardUtilityButton(player, card)}
  `;
  if (!dialog.open) dialog.showModal();
}

function renderCardUtilityButton(player, card) {
  if (!card.requantize && !card.decohere) return "";
  const action = utilityActionType(player, card);
  const symbol = action === "decohere" ? "≋" : "⟲";
  return `<button type="button" class="zoom-action-button utility" data-card-action="${action}" title="${action === "decohere" ? "Decohere" : "Requantize"}">${symbol}</button>`;
}

function utilityActionSymbol(player, card) {
  return utilityActionType(player, card) === "decohere" ? "≋" : "⟲";
}

function utilityActionType(player, card) {
  if (card.type === "protocol" || card.type === "state") {
    return !cardConditionMet(player, card) && hasDecohere(card) ? "decohere" : "requantize";
  }
  return "requantize";
}

function hasDecohere(card) {
  return Boolean(card.decohere && card.decohere.negative !== false && (card.decohere.amount || card.decohere.symbol));
}

function playSelectedHandCard() {
  const player = activePlayer();
  const hand = gameState.handsByPlayer[player.id] || [];
  const card = hand[gameState.selectedHandCardIndex];
  if (!card || !canAffordCard(player, card)) return;
  playSound("card");
  logPlayerAction(player, `plays ${card.name} (${card.id}).`);

  if (card.type === "stabilizer") {
    gameState.pendingStabilizerPlay = {
      playerId: player.id,
      handIndex: gameState.selectedHandCardIndex
    };
    gameState.selectedHandCardIndex = null;
    document.querySelector("#hand-card-dialog").close();
    renderApp();
    return;
  }

  if (card.type === "circuit") {
    beginCircuitUpgrade(player, gameState.selectedHandCardIndex, card);
    return;
  }

  payCardCost(player, card);
  const [playedCard] = hand.splice(gameState.selectedHandCardIndex, 1);
  if (playedCard.type === "protocol") applyProtocolQuickEffect(player, playedCard);
  tuckPlayedCard(player.id, playedCard);
  gameState.selectedHandCardIndex = null;
  const handDialog = document.querySelector("#hand-card-dialog");
  if (handDialog.open) handDialog.close();
  applyPlayedCardImmediateEffect(player, playedCard);
  renderApp();
  settleTutorialStepAfterGameChange(["stateTucked", "cardDialogClosed"]);
}

function applyPlayedCardImmediateEffect(player, card) {
  if (card.type === "protocol") {
    applyProtocolImmediateEffect(player, card);
    return;
  }
  const apexStateRewards = {
    "STATE-10": 5,
    "STATE-31": 10,
    "STATE-33": 15,
    "STATE-36": 10,
    "STATE-37": 10,
    "STATE-40": 20
  };
  const reward = apexStateRewards[card.id] || 0;
  if (reward && gameState.apexHolderId === player.id) movePlayerPotential(player, reward);
}

function queueManualProtocolEffect(player, card) {
  gameState.pendingProtocolSelection = null;
  gameState.pendingProtocolBoardSelection = null;
  gameState.pendingProtocolGroupSelection = null;
  logPlayerAction(player, `${card.name} immediate effect is pending manual implementation.`, "warning");
}

function applyProtocolQuickEffect(player, card) {
  if (!card.quickEffect) return;
  applyResourceEffect(player, { amount: card.quickEffect.amount, symbol: card.quickEffect.symbol });
  if (gameState.apexHolderId === player.id && card.quickEffect.apexAmount && card.quickEffect.apexAmount !== "/") {
    applyResourceEffect(player, { amount: card.quickEffect.apexAmount, symbol: card.quickEffect.apexSymbol });
  }
}

function applyProtocolImmediateEffect(player, card) {
  const effects = activeProtocolEffects();
  const effectId = card.effectId;
  switch (effectId) {
    case "gain5Qubits":
      player.qubits = Math.min(35, player.qubits + 5);
      break;
    case "gain10Qubits":
      player.qubits = Math.min(35, player.qubits + 10);
      break;
    case "decoherenceDrain2":
      decreaseDecoherence(2);
      break;
    case "boundaryStabilizer":
      chooseProtocolOptionButtons("Choose one:", "-2⧖", "-1Δ", () => {
        player.instability = Math.max(0, player.instability - 2);
        updateStabilizerLockStates(player);
      }, () => decreaseDecoherence(1));
      break;
    case "entropicDraw":
      chooseProtocolOptionButtons("Choose one:", "-3⧖", "-3Δ", () => {
        player.instability = Math.max(0, player.instability - 3);
        updateStabilizerLockStates(player);
      }, () => decreaseDecoherence(3));
      break;
    case "microPhaseKick":
      beginProtocolSelection({ id: effectId, target: "freePsi", needed: 1, groupFaceId: "extraShift" });
      break;
    case "preCollapseDecrease":
      applyProtocolOutcomeAdjustment(-1);
      addProtocolPreCollapseEffect({ id: "positiveOutcomesAdjust", amount: -1 });
      break;
    case "softRerollWindow":
      rerollDicePoolDice();
      break;
    case "protoEntangleBurst":
      beginProtocolSelection({ id: effectId, target: "freePsi", needed: 2, groupFaceId: "entangle" });
      break;
    case "harmonicShift":
      beginProtocolSelection({ id: effectId, target: "freePsi", needed: Math.min(2, firstFreeDice("superposition", 99).length), minNeeded: 1, allowPartial: true, groupFaceId: "shift", pairGroups: true });
      break;
    case "tunnelingRewrite":
      beginProtocolSelection({ id: effectId, target: "freeOutcome", needed: 1, effect: { id: "positiveOutcomeSet", value: 0 } });
      break;
    case "dualEntangleSpike":
      beginProtocolSelection({ id: effectId, target: "freePsi", needed: Math.min(4, firstFreeDice("superposition", 99).length), minNeeded: 2, allowPartial: true, requireEvenTargets: true, groupFaceId: "entangle", pairGroups: true });
      break;
    case "gateCascade":
      beginProtocolSelection({ id: effectId, target: "freeOutcome", needed: 2, groupFaceId: "synchronize" });
      break;
    case "miniGateOverride":
      beginProtocolSelection({ id: effectId, target: "dicePoolAny", needed: 1, immediate: "rerollDicePoolThenCollapse" });
      break;
    case "collapseRedirect":
      beginProtocolSelection({ id: effectId, target: "allPsi", needed: 2, effect: { id: "swapPsiValues" } });
      break;
    case "psiImagePulse":
      beginProtocolSelection({ id: effectId, target: "allPsi", needed: 2, effect: { id: "copyPsiValue" } });
      break;
    case "collapseLens":
      beginProtocolSelection({ id: effectId, target: "freePsi", needed: 1, immediate: "choosePsiValue" });
      break;
    case "psiEchoBoost":
      markDice(collapsePsiDice());
      addProtocolPreCollapseEffect({ id: "adjustPsi", amount: 1 });
      break;
    case "collapseRewrite":
      beginProtocolSelection({ id: effectId, target: "sameTypePair", needed: 2, effect: { id: "copySameTypeValue" } });
      break;
    case "quantumRewrite":
      beginProtocolSelection({ id: effectId, target: "allPsi", needed: Math.min(3, collapsePsiDice().length), minNeeded: 1, allowPartial: true, immediate: "choosePsiValues" });
      break;
    case "gateSingularity":
      addProtocolPreCollapseEffect({ id: "zeroOutcomesScore" });
      break;
    case "psiOverdriveWave":
      markDice(collapsePsiDice());
      addProtocolPreCollapseEffect({ id: "adjustPsi", amount: 2 });
      increaseInstability(player, 1);
      break;
    case "quantumFork":
      addTemporaryPsiDie();
      break;
    case "psiNullBarrier":
      beginProtocolFailureIgnore();
      break;
    case "collapseHarmonizer":
      beginProtocolScoringSelection({ id: effectId, effect: { id: "doubleAny" } });
      break;
    case "collapseSupercharger":
      beginProtocolScoringSelection({ id: effectId, effect: { id: "doubleAny", max: 10 }, psiOnly: true });
      break;
    case "collapseSingularity":
      beginProtocolScoringSelection({ id: effectId, effect: { id: "singularityProtocol32" }, psiOnly: true });
      break;
    case "protoApexSurge":
      applyProtoApexSurge(player);
      break;
    case "apexBurst":
      movePlayerPotential(player, gameState.apexHolderId === player.id ? 10 : 3);
      break;
    case "apexRewrite":
      applyApexRewrite(player);
      break;
    case "omegaCollapseEngine":
      effects.apexMultiplier = Math.max(effects.apexMultiplier, 2);
      break;
    case "orangeFieldSurge":
      convertLastPlacedToOrangeSix(player);
      break;
    case "phasePulse":
      beginProtocolBoardSelection({ id: effectId, needed: 1 });
      break;
    case "orangeFluxOverride":
      scoreControlledTiles(player, "orange", 2);
      break;
    case "redFieldOverclock":
      scoreControlledTiles(player, "red", 5);
      break;
    case "zeroPointExpansion":
      convertLastPlacedGreenToWhite(player);
      break;
    case "finalQuantumCommand":
      scoreAllCommandTiles(player);
      break;
    case "vectorResonance":
      beginProtocolBoardSelection({ id: effectId, needed: 1 });
      break;
    case "fieldShift":
      beginProtocolBoardSelection({ id: effectId, needed: 2 });
      break;
    case "fieldReorder":
      beginProtocolBoardSelection({ id: effectId, needed: 1, mode: "fieldReorderSource" });
      break;
    default:
      break;
  }
}

function chooseProtocolOptionButtons(message, leftLabel, rightLabel, leftHandler, rightHandler) {
  gameState.pendingProtocolChoice = { message, leftLabel, rightLabel, leftHandler, rightHandler };
  renderProtocolChoiceDialog();
}

function renderProtocolChoiceDialog() {
  const dialog = document.querySelector("#protocol-choice-dialog");
  const pending = gameState.pendingProtocolChoice;
  if (!dialog || !pending) return;
  const handDialog = document.querySelector("#hand-card-dialog");
  if (handDialog?.open) handDialog.close();
  document.querySelector("#protocol-choice-title").textContent = pending.message;
  document.querySelector("#protocol-choice-actions").innerHTML = `
    <button type="button" class="protocol-choice-button" data-protocol-choice="left">${pending.leftLabel}</button>
    <button type="button" class="protocol-choice-button" data-protocol-choice="right">${pending.rightLabel}</button>
  `;
  if (!dialog.open) {
    try {
      dialog.showModal();
    } catch {
      dialog.show();
    }
  }
}

function resolveProtocolChoice(side) {
  const pending = gameState.pendingProtocolChoice;
  if (!pending) return;
  if (side === "left") pending.leftHandler();
  else pending.rightHandler();
  gameState.pendingProtocolChoice = null;
  const dialog = document.querySelector("#protocol-choice-dialog");
  if (dialog.open) dialog.close();
  renderApp();
}

function addProtocolPreCollapseEffect(effect) {
  activeProtocolEffects().preCollapse.push(effect);
}

function addProtocolCollapseEffect(effect) {
  activeProtocolEffects().collapse.push(effect);
}

function beginProtocolGroupSelection(config) {
  const groupIds = eligibleProtocolGroupIdsForConfig(config);
  if (!groupIds.size && config.allowPsiFallback) {
    beginProtocolSelection({ id: config.id, target: "allPsi", needed: 1, effect: { id: "doublePsiValue", max: config.effect.max } });
    return true;
  }
  if (!groupIds.size) return false;
  gameState.pendingProtocolGroupSelection = {
    playerId: gameState.activePlayerId,
    ...config
  };
  renderPools();
  return true;
}

function beginProtocolScoringSelection(config) {
  const collapseState = activeCollapseState();
  if (!collapseState?.finalized) return false;
  const dieIds = eligibleProtocolScoringDieIdsForConfig(config);
  const groupIds = eligibleProtocolScoringGroupIdsForConfig(config);
  if (!dieIds.size && !groupIds.size) return false;
  gameState.pendingProtocolScoringSelection = {
    playerId: gameState.activePlayerId,
    ...config
  };
  renderPools();
  return true;
}

function eligibleProtocolScoringDieIds() {
  const pending = gameState.pendingProtocolScoringSelection;
  if (!pending || pending.playerId !== gameState.activePlayerId) return new Set();
  return eligibleProtocolScoringDieIdsForConfig(pending);
}

function eligibleProtocolScoringGroupIds() {
  const pending = gameState.pendingProtocolScoringSelection;
  if (!pending || pending.playerId !== gameState.activePlayerId) return new Set();
  return eligibleProtocolScoringGroupIdsForConfig(pending);
}

function eligibleProtocolScoringDieIdsForConfig(config) {
  const collapseState = activeCollapseState();
  if (!collapseState?.finalized) return new Set();
  if (config.duplicateOnly) return duplicateScoringTargets(collapseState).dieIds;
  const dice = activeDice().filter((die) => {
    if (die.location !== "collapse" || die.groupId || !collapseState.dice[die.id]) return false;
    if (config.psiOnly) return isSuperpositionFaceId(die.rolledFaceId);
    return isPsiOrOutcome(die);
  });
  return new Set(dice.map((die) => die.id));
}

function eligibleProtocolScoringGroupIdsForConfig(config) {
  const collapseState = activeCollapseState();
  if (!collapseState?.finalized) return new Set();
  if (config.duplicateOnly) return duplicateScoringTargets(collapseState).groupIds;
  return new Set(activeGroups()
    .filter((group) => {
      const groupState = collapseState.groups[group.id];
      if (!groupState?.resolved || !groupState.result.some((marker) => markerTone(marker) === "positive")) return false;
      if (!config.psiOnly) return true;
      return group.targetIds.some((id) => isSuperpositionFaceId(dieById(id)?.rolledFaceId));
    })
    .map((group) => group.id));
}

function resolveProtocolScoringDieSelection(dieId) {
  const pending = gameState.pendingProtocolScoringSelection;
  const collapseState = activeCollapseState();
  if (!pending || !eligibleProtocolScoringDieIds().has(dieId) || !collapseState?.finalized) return;
  const marker = collapseState.dice[dieId];
  if (pending.effect?.id === "ignoreDuplicate") {
    collapseState.ignoredDieIds = collapseState.ignoredDieIds || [];
    collapseState.ignoredDieIds.push(dieId);
  } else {
    applyProtocolScoringMarkerEffect(marker, pending.effect);
  }
  recalculateFinalizedCollapseTotal(collapseState);
  gameState.pendingProtocolScoringSelection = null;
  renderApp();
}

function resolveProtocolScoringGroupSelection(groupId) {
  const pending = gameState.pendingProtocolScoringSelection;
  const collapseState = activeCollapseState();
  if (!pending || !eligibleProtocolScoringGroupIds().has(groupId) || !collapseState?.finalized) return;
  const groupState = collapseState.groups[groupId];
  const marker = groupState?.result.find((candidate) => markerTone(candidate) === "positive");
  if (pending.effect?.id === "ignoreDuplicate") {
    groupState.ignored = true;
    groupState.result = [];
  } else {
    if (!marker) return;
    applyProtocolScoringMarkerEffect(marker, pending.effect);
  }
  recalculateFinalizedCollapseTotal(collapseState);
  gameState.pendingProtocolScoringSelection = null;
  renderApp();
}

function applyProtocolScoringMarkerEffect(marker, effect) {
  if (!marker || !effect) return;
  if (effect.id === "doubleAny") {
    marker.value = effect.max ? Math.min(effect.max, marker.value * 2) : marker.value * 2;
  }
  if (effect.id === "singularityProtocol32") {
    marker.value = marker.value <= 3 ? marker.value * 2 : marker.value * 3;
  }
}

function beginProtocolFailureIgnore() {
  const collapseState = activeCollapseState();
  if (!collapseState?.finalized || !collapseState.failed) return false;
  const duplicateTargets = duplicateScoringTargets(collapseState);
  if (!duplicateTargets.dieIds.size && !duplicateTargets.groupIds.size) return false;
  gameState.pendingProtocolScoringSelection = {
    playerId: gameState.activePlayerId,
    id: "psiNullBarrier",
    duplicateOnly: true,
    effect: { id: "ignoreDuplicate" }
  };
  renderPools();
  return true;
}

function eligibleProtocolGroupIds() {
  const pending = gameState.pendingProtocolGroupSelection;
  if (!pending || pending.playerId !== gameState.activePlayerId) return new Set();
  return eligibleProtocolGroupIdsForConfig(pending);
}

function eligibleProtocolGroupIdsForConfig(config) {
  const collapseState = activeCollapseState();
  if (!collapseState?.finalized) return new Set();
  if (config.onlyGroupId) return new Set([config.onlyGroupId]);
  return new Set(activeGroups()
    .filter((group) => {
      const groupState = collapseState.groups[group.id];
      return groupState?.resolved && groupState.result.some((marker) => markerTone(marker) === "positive");
    })
    .map((group) => group.id));
}

function resolveProtocolGroupSelection(groupId) {
  const pending = gameState.pendingProtocolGroupSelection;
  const collapseState = activeCollapseState();
  if (!pending || pending.playerId !== gameState.activePlayerId || !eligibleProtocolGroupIds().has(groupId) || !collapseState?.finalized) return;
  const groupState = collapseState.groups[groupId];
  const marker = groupState.result.find((candidate) => markerTone(candidate) === "positive");
  if (!marker) return;
  if (pending.effect.id === "doubleGreenGroup") marker.value *= 2;
  if (pending.effect.id === "doubleGreenAny") marker.value = Math.min(pending.effect.max || 10, marker.value * 2);
  if (pending.effect.id === "singularityGroup") marker.value = marker.value <= 3 ? marker.value * 3 : marker.value * 2;
  if (pending.effect.id === "doubleAny") marker.value = pending.effect.max ? Math.min(pending.effect.max, marker.value * 2) : marker.value * 2;
  if (pending.effect.id === "singularityProtocol32") marker.value = marker.value <= 3 ? marker.value * 2 : marker.value * 3;
  if (pending.effect.id === "ignoreScoringGroup") {
    groupState.ignored = true;
    groupState.result = [];
  }
  recalculateFinalizedCollapseTotal(collapseState);
  gameState.pendingProtocolGroupSelection = null;
  renderApp();
}

function beginProtocolSelection(config) {
  if (config.effect?.value === null) return false;
  const ids = eligibleProtocolTargetIdsForConfig(config);
  const needed = Math.min(config.needed || config.maxNeeded || 1, ids.size);
  if (needed <= 0) return false;
  gameState.pendingProtocolSelection = {
    playerId: gameState.activePlayerId,
    ...config,
    minNeeded: config.minNeeded || needed,
    needed,
    targetIds: []
  };
  renderPools();
  return true;
}

function eligibleProtocolTargetIds() {
  const pending = gameState.pendingProtocolSelection;
  if (!pending || pending.playerId !== gameState.activePlayerId) return new Set();
  const selected = new Set(pending.targetIds);
  const ids = eligibleProtocolTargetIdsForConfig(pending);
  selected.forEach((id) => ids.delete(id));
  return ids;
}

function eligibleProtocolTargetIdsForConfig(config) {
  if (config.target === "dicePoolAny") return new Set(activeDice().filter((die) => die.location === "dice" && !die.disabled).map((die) => die.id));
  const freeDice = activeDice().filter((die) => die.location === "collapse" && !die.groupId && isPsiOrOutcome(die));
  const collapseDice = activeDice().filter((die) => die.location === "collapse" && isPsiOrOutcome(die));
  if (config.target === "freePsi") return new Set(freeDice.filter((die) => isSuperpositionFaceId(die.rolledFaceId)).map((die) => die.id));
  if (config.target === "freeOutcome") return new Set(freeDice.filter((die) => die.rolledFaceId === "outcome").map((die) => die.id));
  if (config.target === "freePsiOrOutcome") return new Set(freeDice.map((die) => die.id));
  if (config.target === "allPsi") return new Set(collapseDice.filter((die) => isSuperpositionFaceId(die.rolledFaceId)).map((die) => die.id));
  if (config.target === "allOutcome") return new Set(collapseDice.filter((die) => die.rolledFaceId === "outcome").map((die) => die.id));
  if (config.target === "allScoringDice") return new Set(collapseDice.map((die) => die.id));
  if (config.target === "duplicateScoringDice") return duplicateScoringDieIds(activeCollapseState());
  if (config.target === "sameTypePair") {
    const selected = config.targetIds?.[0] ? dieById(config.targetIds[0]) : null;
    if (!selected) return new Set(collapseDice.map((die) => die.id));
    return new Set(collapseDice
      .filter((die) => die.id !== selected.id && isSuperpositionFaceId(die.rolledFaceId) === isSuperpositionFaceId(selected.rolledFaceId))
      .map((die) => die.id));
  }
  return new Set();
}

function selectProtocolTarget(die, pool) {
  const pending = gameState.pendingProtocolSelection;
  if (!pending || pending.playerId !== gameState.activePlayerId) return;
  const expectedPool = pending.target === "dicePoolAny" ? "dice" : "collapse";
  if (pool !== expectedPool) return;
  if (!eligibleProtocolTargetIds().has(die.id)) return;
  pending.targetIds.push(die.id);
  if (pending.allowPartial && pending.targetIds.length >= pending.needed) {
    resolveProtocolSelection();
    return;
  }
  if (pending.targetIds.length < pending.needed) {
    renderPools();
    return;
  }
  resolveProtocolSelection();
}

function resolveProtocolSelection() {
  const pending = gameState.pendingProtocolSelection;
  if (!pending || pending.playerId !== gameState.activePlayerId) return;
  const targets = pending.targetIds.map((id) => dieById(id)).filter(Boolean);
  if (["doublePsiValue", "doubleScoringDie", "singularityDie", "ignoreScoringDie"].includes(pending.effect?.id) && activeCollapseState()?.finalized) {
    const collapseState = activeCollapseState();
    targets.forEach((target) => {
      const marker = collapseState.dice[target.id];
      if (!marker) return;
      if (pending.effect.id === "ignoreScoringDie") {
        collapseState.ignoredDieIds = collapseState.ignoredDieIds || [];
        collapseState.ignoredDieIds.push(target.id);
      } else if (pending.effect.id === "singularityDie") {
        marker.value = marker.value <= 3 ? marker.value * 2 : marker.value * 3;
      } else {
        marker.value = pending.effect.max ? Math.min(pending.effect.max, marker.value * 2) : marker.value * 2;
      }
    });
    recalculateFinalizedCollapseTotal(collapseState);
    gameState.pendingProtocolSelection = null;
    renderApp();
    return;
  }
  if (pending.immediate === "rerollDicePoolThenCollapse") {
    targets.forEach((target) => {
      if (target.location === "dice") rollDieIntoPool(target);
    });
    resolveAutomaticQubits(activeDice());
    gameState.pendingProtocolSelection = {
      ...pending,
      target: "freePsiOrOutcome",
      needed: 1,
      targetIds: [],
      immediate: "rerollCollapseDie"
    };
    renderApp();
    return;
  }
  if (pending.immediate === "rerollCollapseDie") {
    targets.forEach((target) => rerollCollapseTargetDie(target));
    gameState.pendingProtocolSelection = null;
    renderApp();
    return;
  }
  if (pending.immediate === "choosePsiValue" || pending.immediate === "choosePsiValues") {
    gameState.pendingProtocolValueChoice = {
      playerId: gameState.activePlayerId,
      dieIds: pending.targetIds,
      currentIndex: 0,
      values: [0, 1, 2, 3],
      effectId: pending.immediate === "choosePsiValue" ? "setPsiValue" : "setPsiValues",
      chosenValues: []
    };
    gameState.pendingProtocolSelection = null;
    renderApp();
    return;
  }
  if (pending.effect) {
    const effect = { ...pending.effect, targetIds: pending.targetIds };
    applyImmediateVisibleProtocolEffect(effect, targets);
    addProtocolPreCollapseEffect(effect);
    if (["copyPsiValue", "swapPsiValues", "copySameTypeValue"].includes(effect.id)) markDice(targets);
  }
  if (pending.immediate === "zeroOutcome") {
    targets.forEach((target) => setOutcomeDieToZero(target));
  }
  if (pending.groupFaceId) {
    if (pending.pairGroups) {
      const groupSize = actionRules[pending.groupFaceId]?.type === "modifier" ? 1 : 2;
      for (let index = 0; index + groupSize - 1 < targets.length; index += groupSize) {
        createProtocolGroup(pending.groupFaceId, targets.slice(index, index + groupSize));
      }
    } else {
      createProtocolGroup(pending.groupFaceId, targets);
    }
  }
  gameState.pendingProtocolSelection = null;
  renderApp();
}

function applyImmediateVisibleProtocolEffect(effect, targets) {
  if (effect.id === "positiveOutcomeSet") {
    targets.forEach((target) => setProtocolOutcomeOverride(target, effect.value, effect.value === 0 ? "zero" : "positive"));
  }
}

function applyProtocolOutcomeAdjustment(amount) {
  activeDice()
    .filter((die) => die.location === "collapse" && die.rolledFaceId === "outcome")
    .forEach((die) => {
      const currentValue = Number.isFinite(die.protocolOutcomeValue) ? die.protocolOutcomeValue : die.outcomeValue;
      const nextValue = Math.max(0, currentValue + amount);
      setProtocolOutcomeOverride(die, nextValue, nextValue === 0 ? "zero" : "positive");
    });
}

function resolveProtocolValueChoice(value) {
  const pending = gameState.pendingProtocolValueChoice;
  if (!pending || pending.playerId !== gameState.activePlayerId) return;
  pending.chosenValues.push(value);
  pending.currentIndex += 1;
  if (pending.currentIndex < pending.dieIds.length) {
    renderApp();
    return;
  }
  if (pending.effectId === "setPsiValue") {
    addProtocolPreCollapseEffect({ id: "setPsiValue", targetIds: [pending.dieIds[0]], value: pending.chosenValues[0] });
  } else {
    addProtocolPreCollapseEffect({ id: "setPsiValues", targetIds: pending.dieIds, values: pending.chosenValues });
  }
  gameState.pendingProtocolValueChoice = null;
  renderApp();
}

function collapsePsiDice() {
  return activeDice().filter((die) => die.location === "collapse" && isSuperpositionFaceId(die.rolledFaceId));
}

function markDice(dice) {
  dice.forEach((die) => {
    die.protocolMarked = true;
  });
}

function applyProtocolPreCollapseEffects(collapseState) {
  const effects = activeProtocolEffects();
  effects.preCollapse.splice(0).forEach((effect) => {
    const psiDice = activeDice().filter((die) => isSuperpositionFaceId(die.rolledFaceId) && collapseState.dice[die.id]);
    const outcomeDice = activeDice().filter((die) => die.rolledFaceId === "outcome" && collapseState.dice[die.id]);
    const targetFilter = effect.targetIds?.length ? (die) => effect.targetIds.includes(die.id) : () => true;
    if (effect.id === "adjustPsi") {
      psiDice.filter(targetFilter).slice(0, effect.maxTargets || psiDice.length).forEach((die) => {
        collapseState.dice[die.id].value = Math.max(0, Math.min(5, collapseState.dice[die.id].value + effect.amount));
      });
    }
    if (effect.id === "adjustOutcomes") {
      outcomeDice.forEach((die) => {
        const nextValue = Math.max(0, collapseState.dice[die.id].value + effect.amount);
        collapseState.dice[die.id].value = nextValue;
        collapseState.dice[die.id].tone = nextValue === 0 ? "zero" : "negative";
      });
    }
    if (effect.id === "positiveOutcomesAdjust") {
      outcomeDice.forEach((die) => {
        const nextValue = Number.isFinite(die.protocolOutcomeValue)
          ? die.protocolOutcomeValue
          : Math.max(0, collapseState.dice[die.id].value + effect.amount);
        collapseState.dice[die.id].value = nextValue;
        collapseState.dice[die.id].tone = die.protocolOutcomeTone || (nextValue === 0 ? "zero" : "positive");
      });
    }
    if (effect.id === "positiveOutcomeSet") {
      outcomeDice.filter(targetFilter).forEach((die) => {
        const value = Number.isFinite(die.protocolOutcomeValue) ? die.protocolOutcomeValue : effect.value;
        collapseState.dice[die.id].value = value;
        collapseState.dice[die.id].tone = die.protocolOutcomeTone || (value === 0 ? "zero" : "positive");
      });
    }
    if (effect.id === "copyPsiValue") {
      const selectedPsi = psiDice.filter((die) => effect.targetIds?.includes(die.id));
      if (selectedPsi.length >= 2) collapseState.dice[selectedPsi[1].id].value = collapseState.dice[selectedPsi[0].id].value;
    }
    if (effect.id === "swapPsiValues") {
      const selectedPsi = psiDice.filter((die) => effect.targetIds?.includes(die.id));
      if (selectedPsi.length >= 2) {
        const left = collapseState.dice[selectedPsi[0].id].value;
        collapseState.dice[selectedPsi[0].id].value = collapseState.dice[selectedPsi[1].id].value;
        collapseState.dice[selectedPsi[1].id].value = left;
      }
    }
    if (effect.id === "setPsiValue") {
      const die = psiDice.find((candidate) => effect.targetIds?.includes(candidate.id));
      if (die) collapseState.dice[die.id].value = effect.value;
    }
    if (effect.id === "setPsiValues") {
      psiDice.filter((die) => effect.targetIds?.includes(die.id)).forEach((die, index) => {
        if (Number.isInteger(effect.values[index])) collapseState.dice[die.id].value = effect.values[index];
      });
    }
    if (effect.id === "clampOnePsi") {
      const die = psiDice[0];
      if (die) collapseState.dice[die.id].value = Math.min(effect.max, collapseState.dice[die.id].value);
    }
    if (effect.id === "clampPsi") {
      psiDice.slice(0, effect.maxTargets || psiDice.length).forEach((die) => {
        collapseState.dice[die.id].value = Math.min(effect.max, collapseState.dice[die.id].value);
      });
    }
    if (effect.id === "copySameTypeValue") {
      const selectedPsi = psiDice.filter((die) => effect.targetIds?.includes(die.id));
      const selectedOutcomes = outcomeDice.filter((die) => effect.targetIds?.includes(die.id));
      if (selectedPsi.length >= 2) collapseState.dice[selectedPsi[1].id].value = collapseState.dice[selectedPsi[0].id].value;
      else if (selectedOutcomes.length >= 2) {
        collapseState.dice[selectedOutcomes[1].id].value = collapseState.dice[selectedOutcomes[0].id].value;
        collapseState.dice[selectedOutcomes[1].id].tone = collapseState.dice[selectedOutcomes[0].id].tone;
      }
    }
    if (effect.id === "zeroOutcomesScore") {
      const changedDice = outcomeDice.filter((die) => collapseState.dice[die.id].value !== 0);
      changedDice.forEach((die) => {
        setProtocolOutcomeOverride(die, 0, "zero");
        collapseState.dice[die.id].value = 0;
        collapseState.dice[die.id].tone = "zero";
      });
      if (changedDice.length) movePlayerPotential(activePlayer(), changedDice.length);
    }
    if (effect.id === "doublePsiValue") {
      const die = psiDice.find((candidate) => effect.targetIds?.includes(candidate.id));
      if (die) collapseState.dice[die.id].value = Math.min(effect.max || 10, collapseState.dice[die.id].value * 2);
    }
  });
}

function firstFreeDice(target, count) {
  return eligibleTargetsForRule({ target, count }).slice(0, count);
}

function createProtocolGroup(faceId, targets) {
  if (!targets || targets.length < (actionRules[faceId]?.count || 1)) return false;
  const actionDie = addTemporaryActionDie(faceId);
  if (!actionDie) return false;
  const targetIds = actionRules[faceId]?.target === "mixed"
    ? targets.map((die) => die.id).sort((leftId, rightId) => {
        const leftDie = dieById(leftId);
        const rightDie = dieById(rightId);
        if (leftDie?.rolledFaceId === rightDie?.rolledFaceId) return 0;
        return isSuperpositionFaceId(leftDie?.rolledFaceId) ? -1 : 1;
      })
    : targets.map((die) => die.id);
  const groupId = `pg${Date.now()}-${Math.random().toString(16).slice(2)}`;
  actionDie.location = "collapse";
  actionDie.groupId = groupId;
  targetIds.forEach((id) => {
    const die = dieById(id);
    if (die) die.groupId = groupId;
  });
  gameState.groupsByPlayer[gameState.activePlayerId].push({
    id: groupId,
    kind: actionRules[faceId]?.type || "relation",
    actionDieId: actionDie.id,
    targetIds
  });
  recordActionUse(faceId);
  delete gameState.collapseByPlayer[gameState.activePlayerId];
  return true;
}

function addTemporaryActionDie(faceId) {
  const dice = activeDice();
  const tempDie = {
    id: `protocol-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    faces: [{ id: faceId }],
    rolledFaceId: faceId,
    rolledFaceIndex: 0,
    outcomeValue: null,
    location: "collapse",
    disabled: false,
    groupId: null,
    temporary: true
  };
  dice.push(tempDie);
  return tempDie;
}

function addTemporaryPsiDie() {
  const die = addTemporaryActionDie("superposition");
  die.faces = [{ id: "superposition" }];
  die.rolledFaceId = "superposition";
  die.location = "collapse";
}

function setFirstFreeOutcomeToZero() {
  const target = firstFreeDice("outcome", 1)[0];
  if (!target) return;
  setOutcomeDieToZero(target);
}

function setOutcomeDieToZero(target) {
  if (!target || target.rolledFaceId !== "outcome") return;
  target.outcomeValue = 0;
  target.protocolOutcomeValue = null;
  target.protocolOutcomeTone = null;
  const face = target.faces[target.rolledFaceIndex];
  if (face) face.outcomeValue = 0;
  delete gameState.collapseByPlayer[gameState.activePlayerId];
}

function setProtocolOutcomeOverride(target, value, tone = "positive") {
  if (!target || target.rolledFaceId !== "outcome") return;
  target.protocolOutcomeValue = value;
  target.protocolOutcomeTone = tone;
  delete gameState.collapseByPlayer[gameState.activePlayerId];
}

function rerollDicePoolDice() {
  const dice = activeDice().filter((die) => die.location === "dice" && !die.disabled);
  dice.forEach((die) => rollDieIntoPool(die));
  resolveAutomaticQubits(activeDice());
  resolveRolledDecoherenceFaces(dice);
  recordStabilizerRerollCount(dice.length);
}

function rerollOneDicePoolDie() {
  const die = activeDice().find((candidate) => candidate.location === "dice" && !candidate.disabled);
  if (die) {
    rollDieIntoPool(die);
    resolveAutomaticQubits(activeDice());
    resolveRolledDecoherenceFaces([die]);
    recordStabilizerRerollCount(1);
  }
}

function rerollOneFreeCollapseDie() {
  const die = activeDice().find((candidate) => candidate.location === "collapse" && !candidate.groupId && isPsiOrOutcome(candidate));
  if (!die) return;
  const faceIndex = Math.floor(Math.random() * die.faces.length);
  applyRolledFace(die, faceIndex);
  resolveAutomaticQubits(activeDice());
  resolveRolledDecoherenceFaces([die]);
  recordStabilizerRerollCount(1);
  delete gameState.collapseByPlayer[gameState.activePlayerId];
}

function rerollCollapseTargetDie(die) {
  if (!die || die.location !== "collapse") return;
  dissolveGroupsContainingDie(die.id);
  const faceIndex = Math.floor(Math.random() * die.faces.length);
  applyRolledFace(die, faceIndex);
  resolveAutomaticQubits(activeDice());
  resolveRolledDecoherenceFaces([die]);
  recordStabilizerRerollCount(1);
  delete gameState.collapseByPlayer[gameState.activePlayerId];
}

function recordStabilizerRerollCount(count) {
  if (count <= 0) return;
  const player = activePlayer();
  const data = stabilizerTurnData(player);
  data.rerolledDice += count;
  if (data.rerolledDice >= 3) {
    triggerStabilizer(player, "STABILIZER-17", () => reduceInstability(player, 1));
  }
}

function redirectFirstFreePsiIntoGroup() {
  const freePsi = firstFreeDice("superposition", 1)[0];
  const group = activeGroups().find((candidate) => {
    const action = dieById(candidate.actionDieId)?.rolledFaceId;
    return actionRules[action]?.target === "superposition";
  });
  if (freePsi && group) {
    freePsi.groupId = group.id;
    group.targetIds.push(freePsi.id);
    return;
  }
  const groupWithPsi = activeGroups().find((candidate) => candidate.targetIds.some((id) => isSuperpositionFaceId(dieById(id)?.rolledFaceId)));
  if (!groupWithPsi) return;
  const releasedId = groupWithPsi.targetIds.find((id) => isSuperpositionFaceId(dieById(id)?.rolledFaceId));
  groupWithPsi.targetIds = groupWithPsi.targetIds.filter((id) => id !== releasedId);
  const releasedDie = dieById(releasedId);
  if (releasedDie) releasedDie.groupId = null;
}

function applyProtoApexSurge(player) {
  const collapseState = activeCollapseState();
  if (!collapseState?.finalized || collapseState.failed || collapseState.total > 4) return;
  movePlayerPotential(player, 5);
}

function applyApexRewrite(player) {
  const collapseState = activeCollapseState();
  if (!collapseState?.finalized || collapseState.total <= 0) return;
  gameState.apexHolderId = player.id;
  player.apexValue = collapseState.total;
}

function reactivateLastPlacedAsColor(player, color) {
  const key = activeTurnStats().lastPlacedKey || gameState.vectorsByPlayer[player.id];
  const tile = gameState.tiles[key];
  if (!tile || tile.color === "black" || tile.color === "white" || tile.color === color) return;
  tile.color = color;
  movePlayerPotential(player, fieldPotentialValueForColor(key, color));
}

function convertLastPlacedToOrangeSix(player) {
  const key = activeTurnStats().lastPlacedKey;
  const tile = gameState.tiles[key];
  if (!tile || tile.ownerId !== player.id || tile.color === "orange" || tile.color === "black") return;
  tile.color = "orange";
  tile.cv = 6;
}

function placeBonusAdjacentTile(player, color, cv) {
  const key = activeTurnStats().lastPlacedKey || gameState.vectorsByPlayer[player.id];
  const targetKey = neighborKeys(key).find((neighborKey) => isFreeHex(neighborKey));
  if (!targetKey) return;
  gameState.tiles[targetKey] = createPlacedTile(color, cv, player.id);
  movePlayerPotential(player, fieldPotentialValueForColor(targetKey, color));
}

function scoreAdjacentControlledTiles(player, color, value) {
  const vectorKey = gameState.vectorsByPlayer[player.id];
  if (!vectorKey) return;
  const count = neighborKeys(vectorKey).filter((key) => {
    const tile = gameState.tiles[key];
    return tile?.ownerId === player.id && tile.color === color;
  }).length;
  if (count) movePlayerPotential(player, count * value);
}

function scoreControlledTiles(player, color, value) {
  const count = Object.values(gameState.tiles).filter((tile) => tile.ownerId === player.id && tile.color === color).length;
  if (count) movePlayerPotential(player, count * value);
}

function scoreAdjacentCommandTiles(player) {
  const vectorKey = gameState.vectorsByPlayer[player.id];
  if (!vectorKey) return;
  const values = { violet: 1, green: 2, orange: 3, red: 5 };
  const score = neighborKeys(vectorKey).reduce((sum, key) => {
    const tile = gameState.tiles[key];
    return sum + (tile?.ownerId === player.id ? values[tile.color] || 0 : 0);
  }, 0);
  if (score) movePlayerPotential(player, score);
}

function scoreAllCommandTiles(player) {
  const values = { violet: 1, green: 2, orange: 3, red: 5 };
  const score = Object.values(gameState.tiles).reduce((sum, tile) => {
    return sum + (tile.ownerId === player.id ? values[tile.color] || 0 : 0);
  }, 0);
  if (score) movePlayerPotential(player, score);
}

function convertLastPlacedGreenToWhite(player) {
  const key = activeTurnStats().lastPlacedKey;
  const tile = gameState.tiles[key];
  if (!tile || tile.ownerId !== player.id || tile.color !== "green") return;
  gameState.pendingProtocolBoardSelection = {
    playerId: player.id,
    id: "zeroPointExpansion",
    needed: 1,
    targetKey: key,
    selectedKeys: []
  };
  renderApp();
}

function resolveZeroPointExpansionChoice(choice) {
  const pending = gameState.pendingProtocolBoardSelection;
  if (!pending || pending.id !== "zeroPointExpansion" || pending.playerId !== gameState.activePlayerId) return;
  const tile = gameState.tiles[pending.targetKey];
  if (choice === "white" && tile) {
    tile.color = "white";
    tile.cv = null;
  }
  gameState.pendingProtocolBoardSelection = null;
  renderApp();
}

function convertTileToWhite(key) {
  const tile = gameState.tiles[key];
  if (!tile) return;
  tile.color = "white";
  tile.cv = null;
}

function moveVectorToBestOwnedOrBlack(player) {
  const target = Object.entries(gameState.tiles).find(([, tile]) => tile.ownerId === player.id || tile.color === "black");
  if (target) gameState.vectorsByPlayer[player.id] = target[0];
}

function beginProtocolBoardSelection(config) {
  const targets = protocolBoardTargetKeys(config.id);
  const needed = Math.min(config.needed || 1, targets.size);
  if (needed <= 0) return false;
  gameState.pendingProtocolBoardSelection = {
    playerId: gameState.activePlayerId,
    ...config,
    needed,
    selectedKeys: []
  };
  renderApp();
  return true;
}

function availableProtocolBoardTargets() {
  const pending = gameState.pendingProtocolBoardSelection;
  if (!pending || pending.playerId !== gameState.activePlayerId) return new Set();
  const targets = protocolBoardTargetKeys(pending.id);
  (pending.selectedKeys || []).forEach((key) => targets.delete(key));
  return targets;
}

function protocolBoardTargetKeys(effectId) {
  const player = activePlayer();
  const vectorKey = gameState.vectorsByPlayer[player.id];
  const pending = gameState.pendingProtocolBoardSelection;
  if (effectId === "vectorResonance") {
    const targets = new Set();
    if (vectorKey) {
      neighborKeys(vectorKey).forEach((key) => {
        const tile = gameState.tiles[key];
        if (tile && tile.color !== "black" && !hasVectorOnHex(key)) targets.add(key);
      });
    }
    return targets;
  }
  if (effectId === "phasePulse") {
    return new Set(vectorKey ? neighborKeys(vectorKey).filter((key) => isFreeHex(key)) : []);
  }
  if (effectId === "fieldShift") {
    return new Set(Object.keys(gameState.tiles).filter((key) => gameState.tiles[key]?.ownerId === player.id));
  }
  if (effectId === "fieldReorder") {
    if (pending?.mode === "fieldReorderTarget") return new Set(vectorKey ? neighborKeys(vectorKey).filter((key) => isFreeHex(key)) : []);
    return new Set(Object.keys(gameState.tiles).filter((key) => gameState.tiles[key]?.ownerId === player.id));
  }
  if (effectId === "zeroPointExpansion") {
    return new Set(pending?.targetKey ? [pending.targetKey] : []);
  }
  if (effectId === "stabilizerVectorLatch") {
    return new Set(pending?.targets ? Array.from(pending.targets) : []);
  }
  return new Set();
}

function resolveProtocolBoardSelection(key) {
  const pending = gameState.pendingProtocolBoardSelection;
  if (!pending || pending.playerId !== gameState.activePlayerId || !availableProtocolBoardTargets().has(key)) return;
  pending.selectedKeys.push(key);
  if (pending.selectedKeys.length < pending.needed) {
    renderApp();
    return;
  }
  const player = activePlayer();
  if (pending.id === "stabilizerVectorLatch") {
    gameState.vectorsByPlayer[player.id] = pending.selectedKeys[0];
    exhaustStabilizer(player, "STABILIZER-06");
  }
  if (pending.id === "vectorResonance") {
    const targetTile = gameState.tiles[pending.selectedKeys[0]];
    if (targetTile?.ownerId && targetTile.ownerId !== player.id) targetTile.ownerId = player.id;
    gameState.vectorsByPlayer[player.id] = pending.selectedKeys[0];
  }
  if (pending.id === "phasePulse") {
    const targetKey = pending.selectedKeys[0];
    gameState.tiles[targetKey] = createPlacedTile("green", 1, player.id);
    gameState.vectorsByPlayer[player.id] = targetKey;
  }
  if (pending.id === "fieldShift") {
    const [firstKey, secondKey] = pending.selectedKeys;
    const firstTile = gameState.tiles[firstKey];
    gameState.tiles[firstKey] = gameState.tiles[secondKey];
    gameState.tiles[secondKey] = firstTile;
    Object.entries(gameState.vectorsByPlayer).forEach(([playerId, vectorKey]) => {
      if (vectorKey === firstKey) gameState.vectorsByPlayer[playerId] = secondKey;
      else if (vectorKey === secondKey) gameState.vectorsByPlayer[playerId] = firstKey;
    });
  }
  if (pending.id === "fieldReorder") {
    if (pending.mode === "fieldReorderSource") {
      gameState.pendingProtocolBoardSelection = {
        ...pending,
        mode: "fieldReorderTarget",
        sourceKey: pending.selectedKeys[0],
        selectedKeys: []
      };
      renderApp();
      return;
    }
    const sourceKey = pending.sourceKey;
    const targetKey = pending.selectedKeys[0];
    if (sourceKey && targetKey && gameState.tiles[sourceKey] && isFreeHex(targetKey)) {
      gameState.tiles[targetKey] = gameState.tiles[sourceKey];
      delete gameState.tiles[sourceKey];
      Object.entries(gameState.vectorsByPlayer).forEach(([playerId, vectorKey]) => {
        if (vectorKey === sourceKey) gameState.vectorsByPlayer[playerId] = targetKey;
      });
    }
    const movedCount = (pending.movedCount || 0) + 1;
    if (movedCount < 3 && protocolBoardTargetKeys("fieldReorder").size) {
      gameState.pendingProtocolBoardSelection = {
        playerId: player.id,
        id: "fieldReorder",
        needed: 1,
        mode: "fieldReorderSource",
        movedCount,
        selectedKeys: []
      };
      renderApp();
      return;
    }
  }
  gameState.pendingProtocolBoardSelection = null;
  renderApp();
}

function finishProtocolBoardSelection() {
  const pending = gameState.pendingProtocolBoardSelection;
  if (!pending || pending.playerId !== gameState.activePlayerId) return;
  gameState.pendingProtocolBoardSelection = null;
  renderApp();
}

function swapFirstTwoControlledTiles(player) {
  const keys = Object.keys(gameState.tiles).filter((key) => gameState.tiles[key]?.ownerId === player.id).slice(0, 2);
  if (keys.length < 2) return;
  const first = gameState.tiles[keys[0]];
  gameState.tiles[keys[0]] = gameState.tiles[keys[1]];
  gameState.tiles[keys[1]] = first;
}

function moveUpToThreeOwnedTilesNearVector(player) {
  const vectorKey = gameState.vectorsByPlayer[player.id];
  if (!vectorKey) return;
  const freeTargets = neighborKeys(vectorKey).filter((key) => isFreeHex(key));
  const owned = Object.keys(gameState.tiles).filter((key) => gameState.tiles[key]?.ownerId === player.id && key !== vectorKey);
  freeTargets.slice(0, 3).forEach((targetKey, index) => {
    const sourceKey = owned[index];
    if (!sourceKey) return;
    gameState.tiles[targetKey] = gameState.tiles[sourceKey];
    delete gameState.tiles[sourceKey];
    if (gameState.vectorsByPlayer[player.id] === sourceKey) gameState.vectorsByPlayer[player.id] = targetKey;
  });
}

function playPendingStabilizerToSlot(slotIndex) {
  const pending = gameState.pendingStabilizerPlay;
  if (!pending || pending.playerId !== gameState.activePlayerId) return;
  const player = playerById(pending.playerId);
  const hand = gameState.handsByPlayer[player.id] || [];
  const card = hand[pending.handIndex];
  if (!player || !card || card.type !== "stabilizer" || !isOpenStabilizerSlot(player, slotIndex) || !canAffordCard(player, card)) return;

  payCardCost(player, card);
  const [playedCard] = hand.splice(pending.handIndex, 1);
  gameState.playedCardsByPlayer[player.id].stabilizers[slotIndex] = playedCard;
  logPlayerAction(player, `plays ${playedCard.name} into Stabilizer slot ${slotIndex + 1}.`);
  gameState.pendingStabilizerPlay = null;
  updateStabilizerLockStates(player);
  renderApp();
}

function beginCircuitUpgrade(player, handIndex, card) {
  const upgrade = circuitUpgradeMap[card.id];
  if (!upgrade) return;
  if (!hasCircuitUpgradeTargets(player, card)) {
    gameState.selectedHandCardIndex = null;
    document.querySelector("#hand-card-dialog").close();
    renderApp();
    return;
  }
  gameState.pendingCircuitUpgrade = {
    playerId: player.id,
    handIndex,
    cardId: card.id
  };
  gameState.selectedHandCardIndex = null;
  document.querySelector("#hand-card-dialog").close();
  renderCircuitUpgradeDialog();
}

function cancelCircuitUpgrade() {
  gameState.pendingCircuitUpgrade = null;
  const dialog = document.querySelector("#circuit-upgrade-dialog");
  if (dialog.open) dialog.close();
  renderApp();
}

function hasCircuitUpgradeTargets(player, card) {
  return (gameState.diceByPlayer[player.id] || []).some((die) =>
    die.faces.some((face) => isCircuitUpgradeableFace(card, face, player))
  );
}

function applyCircuitUpgrade(dieId, faceIndex) {
  const pending = gameState.pendingCircuitUpgrade;
  if (!pending || pending.playerId !== gameState.activePlayerId) return;
  const player = activePlayer();
  const hand = gameState.handsByPlayer[player.id] || [];
  const card = hand[pending.handIndex];
  const die = gameState.diceByPlayer[player.id]?.find((candidate) => candidate.id === dieId);
  if (!card || !die || !isCircuitUpgradeableFace(card, die.faces[faceIndex], player)) return;

  const replacement = replacementFaceForCircuit(card, die.faces[faceIndex]);
  if (!replacement) return;
  const extraCost = circuitExtraPotentialCost(card, die.faces[faceIndex], replacement);
  if (extraCost > 0 && player.potential < extraCost) return;

  payCardCost(player, card);
  if (extraCost > 0) movePlayerPotential(player, -extraCost);
  const oldFace = die.faces[faceIndex]?.id || "face";
  die.faces[faceIndex] = replacement;
  const [playedCard] = hand.splice(pending.handIndex, 1);
  tuckPlayedCard(player.id, playedCard);
  logPlayerAction(player, `upgrades ${die.label || die.id}: ${oldFace} → ${replacement.id} with ${playedCard.name}.`);
  gameState.pendingCircuitUpgrade = null;
  document.querySelector("#circuit-upgrade-dialog").close();
  renderApp();
}

function replacementFaceForCircuit(card, face) {
  const upgrade = circuitUpgradeMap[card.id];
  if (!upgrade) return null;
  if (upgrade.allowed === "manifold") {
    if (actionRules[face.id]) return { id: "qubit" };
    const nextTier = Math.min(5, qubitValueForFace(face.id) + 1);
    return { id: nextTier === 1 ? "qubit" : `qubit${nextTier}` };
  }
  return { id: upgrade.faceId };
}

function circuitExtraPotentialCost(card, face, replacement) {
  const upgrade = circuitUpgradeMap[card.id];
  if (upgrade?.allowed !== "manifold") return 0;
  if (actionRules[face.id]) return 1;
  return qubitValueForFace(replacement.id);
}

function isCircuitUpgradeableFace(card, face, player = activePlayer()) {
  const upgrade = circuitUpgradeMap[card.id];
  if (!upgrade || !face) return false;
  if (upgrade.allowed === "actionOrQubit") return actionRules[face.id] || isQubitFaceId(face.id);
  if (upgrade.allowed === "superposition") return face.id === "superposition";
  if (upgrade.allowedFace) return face.id === upgrade.allowedFace;
  if (upgrade.allowed === "qubitTier") {
    const tier = qubitValueForFace(face.id);
    return tier >= 1 && tier <= upgrade.maxTier;
  }
  if (upgrade.allowed === "manifold") {
    if (actionRules[face.id]) return player.potential >= 1 && face.id !== "qubit";
    const tier = qubitValueForFace(face.id);
    return tier >= 1 && tier <= 4 && player.potential >= tier + 1;
  }
  return false;
}

function payCardCost(player, card) {
  const cost = playableCardCost(player, card);
  if (card.type === "stabilizer") {
    movePlayerPotential(player, -cost);
    logPlayerAction(player, `pays ${cost}⬢ for ${card.name}.`, "resource");
    return;
  }
  const previous = player.qubits;
  player.qubits = Math.max(0, player.qubits - cost);
  logPlayerAction(player, `pays ${cost}◈ for ${card.name} (${previous} → ${player.qubits}).`, "resource");
}

function tuckPlayedCard(playerId, card) {
  const played = gameState.playedCardsByPlayer[playerId];
  if (!played) return;
  if (card.type === "circuit") {
    const slotIndex = ["✸", "⊞", "⟁", "⧝"].indexOf(card.collection);
    if (slotIndex >= 0) {
      if (!Array.isArray(played.circuits[slotIndex])) played.circuits[slotIndex] = [];
      played.circuits[slotIndex].push(card);
    }
  }
  if (card.type === "state") {
    if (!Array.isArray(played.states)) played.states = [];
    played.states.push(card);
  }
  if (card.type === "protocol") {
    if (!Array.isArray(played.protocols)) played.protocols = [];
    played.protocols.push(card);
  }
}

function resolveCardUtilityAction(action) {
  const hand = gameState.handsByPlayer[gameState.activePlayerId] || [];
  const card = hand[gameState.selectedHandCardIndex];
  if (!card) return;

  const effect = action === "decohere" ? card.decohere : card.requantize;
  if (!effect) return;
  playSound("card");

  const [discardedCard] = hand.splice(gameState.selectedHandCardIndex, 1);
  if (discardedCard) gameState.discardPile.push(discardedCard);
  if (discardedCard) logPlayerAction(activePlayer(), `${action === "decohere" ? "decoheres" : "requantizes"} ${discardedCard.name}.`);
  applyResourceEffect(activePlayer(), effect);
  gameState.selectedHandCardIndex = null;
  document.querySelector("#hand-card-dialog").close();
  renderApp();
  settleTutorialStepAfterGameChange(["cardDialogClosed"]);
}

function applyResourceEffect(player, effect) {
  const amount = Number(effect.amount);
  if (!Number.isFinite(amount)) return;

  if (effect.symbol === "◈") {
    const previous = player.qubits;
    player.qubits = Math.max(0, Math.min(35, player.qubits + amount));
    if (player.qubits !== previous) logPlayerAction(player, `${amount > 0 ? "gains" : "loses"} ${Math.abs(player.qubits - previous)}◈ (${previous} → ${player.qubits}).`, "resource");
  } else if (effect.symbol === "⬢") {
    movePlayerPotential(player, amount);
  } else if (effect.symbol === "⧖") {
    if (amount > 0) {
      increaseInstability(player, amount);
    } else {
      const previous = player.instability;
      player.instability = Math.max(0, player.instability + amount);
      updateStabilizerLockStates(player);
      if (player.instability !== previous) logPlayerAction(player, `instability decreases by ${previous - player.instability}⧖ (${previous} → ${player.instability}).`, "resource");
    }
  } else if (effect.symbol === "Δ") {
    if (amount > 0) {
      advanceDecoherence(amount);
    } else {
      decreaseDecoherence(Math.abs(amount));
    }
  } else if (effect.symbol === "⧉") {
    if (amount > 0) drawCards(player.id, amount);
  }
}

function decreaseDecoherence(amount) {
  const start = gameState.decoherence;
  const end = Math.max(0, start - amount);
  for (let value = start - 1; value >= end; value -= 1) {
    if (value > 0) resolveDecoherenceThreshold(value);
  }
  gameState.decoherence = end;
  if (end !== start) logAction(`Decoherence decreases ${start - end} step${start - end === 1 ? "" : "s"} (${start} → ${end}).`, { type: "global" });
  if (end !== start) playSound("track");
}

function finalScoringRows() {
  return players
    .map((player) => {
      const played = gameState.playedCardsByPlayer[player.id] || {};
      const presence = presenceScoreForPlayer(player.id);
      const coherence = coherenceScoreForPlayer(player.id);
      const resonance = resonanceScoreForPlayer(player);
      const finalInstability = Math.max(0, player.instability - resonance.instabilityReduction);
      const instability = instabilityEndGameScore(finalInstability);
      const qubits = qubitEndGameScore(player.qubits);
      return {
        player,
        base: player.potential,
        presence,
        coherence: coherence.score,
        resonance: resonance.score,
        instabilityAdjustment: resonance.instabilityReduction,
        finalInstability,
        instability,
        qubits,
        protocolSymbols: sumProtocolEndGameValue(played.protocols || []),
        resonanceCounts: circuitCollectionCounts(player.id),
        total: player.potential + presence + coherence.score + resonance.score + instability + qubits
      };
    })
    .sort((left, right) => right.total - left.total);
}

function coherenceScoreForPlayer(playerId) {
  const played = gameState.playedCardsByPlayer[playerId] || {};
  const protocolSymbols = sumProtocolEndGameValue(played.protocols || []);
  const thresholds = stateCoherenceThresholds(played.states || []);
  const score = thresholds.reduce((sum, threshold) => (
    protocolSymbols >= threshold.required ? sum + threshold.reward : sum
  ), 0);
  return {
    score,
    protocolSymbols,
    thresholds
  };
}

function stateCoherenceThresholds(states) {
  return states
    .map((card) => parseStateEndGameProtocol(card.endGameProtocol))
    .filter((parsed) => Number.isFinite(parsed.required) && Number.isFinite(parsed.reward));
}

function resonanceScoreForPlayer(player) {
  const played = gameState.playedCardsByPlayer[player.id] || {};
  const counts = circuitCollectionCounts(player.id);
  const hasApex = gameState.apexHolderId === player.id;
  return (played.stabilizers || []).reduce((totals, card, slotIndex) => {
    if (!card || isStabilizerLocked(player, slotIndex)) return totals;
    const result = stabilizerEndGameScore(card.id, counts, hasApex);
    totals.score += result.score;
    totals.instabilityReduction += result.instabilityReduction;
    return totals;
  }, { score: 0, instabilityReduction: 0 });
}

function stabilizerEndGameScore(cardId, counts, hasApex) {
  const [stars, squares, triangles, manifolds] = counts;
  const all = stars + squares + triangles + manifolds;
  const point = (base, apex = 0) => ({ score: base + (hasApex ? apex : 0), instabilityReduction: 0 });
  const instability = (base, apex = 0) => ({ score: 0, instabilityReduction: base + (hasApex ? apex : 0) });

  if (["STABILIZER-01", "STABILIZER-02", "STABILIZER-03", "STABILIZER-16", "STABILIZER-34"].includes(cardId)) return instability(stars, 2);
  if (["STABILIZER-04", "STABILIZER-05", "STABILIZER-06", "STABILIZER-27", "STABILIZER-28", "STABILIZER-18"].includes(cardId)) return point(squares, 5);
  if (["STABILIZER-07", "STABILIZER-08", "STABILIZER-09", "STABILIZER-20"].includes(cardId)) return instability(triangles, 2);
  if (["STABILIZER-10", "STABILIZER-11", "STABILIZER-12", "STABILIZER-31", "STABILIZER-32", "STABILIZER-37", "STABILIZER-22"].includes(cardId)) return point(manifolds, 5);
  if (cardId === "STABILIZER-13") return point(stars + squares, 3);
  if (cardId === "STABILIZER-14") return point(triangles + manifolds, 3);
  if (["STABILIZER-15", "STABILIZER-25", "STABILIZER-26"].includes(cardId)) return point(stars, 5);
  if (cardId === "STABILIZER-17") return instability(squares, 2);
  if (["STABILIZER-19", "STABILIZER-29", "STABILIZER-30", "STABILIZER-36"].includes(cardId)) return point(triangles, 5);
  if (cardId === "STABILIZER-21") return instability(manifolds, 2);
  if (cardId === "STABILIZER-23") return point(stars + triangles, 3);
  if (cardId === "STABILIZER-24") return point(squares + manifolds, 3);
  if (cardId === "STABILIZER-33") return point(Math.floor(all / 2), 3);
  if (cardId === "STABILIZER-35") return instability(squares, 2);
  if (cardId === "STABILIZER-38") return point(triangles + squares, 5);
  if (cardId === "STABILIZER-39") return point(stars + manifolds, 5);
  if (cardId === "STABILIZER-40") return point(all, 5);
  return point(0);
}

function qubitEndGameScore(qubits) {
  if (qubits >= 25) return 5;
  if (qubits >= 15) return 3;
  if (qubits >= 5) return 1;
  return 0;
}

function instabilityEndGameScore(instability) {
  if (instability <= 3) return 5;
  if (instability <= 7) return 3;
  if (instability <= 12) return 1;
  if (instability <= 18) return 0;
  if (instability <= 25) return -1;
  return -3;
}

function presenceScoreForPlayer(playerId) {
  return Object.values(gameState.tiles).reduce((score, tile) => {
    if (tile.ownerId !== playerId) return score;
    return score + ({
      green: 1,
      orange: 2,
      red: 3,
      violet: -1,
      white: 5
    }[tile.color] || 0);
  }, 0);
}

function renderScoringDialog() {
  const dialog = document.querySelector("#scoring-dialog");
  const results = document.querySelector("#scoring-results");

  if (!gameState.gameOver || gameState.finalScoringAccepted) {
    if (dialog.open) dialog.close();
    return;
  }

  const rows = finalScoringRows();
  results.innerHTML = `
    <div class="scoring-row scoring-head">
      <span>Player</span>
      <span>Current</span>
      <span>Presence</span>
      <span>Coherence</span>
      <span>Resonance</span>
      <span>Instability</span>
      <span>Qubits</span>
      <span>Total</span>
    </div>
    ${rows.map(({ player, base, presence, coherence, resonance, instabilityAdjustment, finalInstability, instability, qubits, total }, index) => `
      <div class="scoring-row ${index === 0 ? "winner" : ""}" style="--player-color:${player.color}">
        <strong class="player-name-colored" style="--player-color:${player.color}">${player.name}</strong>
        <span>${base}⬢</span>
        <span>${formatSigned(presence)}⬢</span>
        <span>${formatSigned(coherence)}⬢</span>
        <span>${formatSigned(resonance)}⬢${instabilityAdjustment ? ` / -${instabilityAdjustment}⧖` : ""}</span>
        <span>${formatSigned(instability)}⬢ (${finalInstability}⧖)</span>
        <span>${formatSigned(qubits)}⬢</span>
        <strong>${total}⬢</strong>
      </div>
    `).join("")}
  `;
  if (!dialog.open) dialog.showModal();
}

function acceptFinalScoring() {
  if (!gameState.gameOver || gameState.finalScoringAccepted) return;
  const rows = finalScoringRows();
  rows.forEach(({ player, total, finalInstability }) => {
    player.potential = total;
    player.trackPotential = total;
    player.instability = finalInstability;
  });
  gameState.finalScoringAccepted = true;
  const dialog = document.querySelector("#scoring-dialog");
  if (dialog.open) dialog.close();
  document.querySelector("#app-shell").classList.add("final-locked");
  renderApp();
}

function renderInstability(player) {
  document.querySelector("#active-instability-marker").classList.toggle("hidden", player.instability > 0);
  document.querySelector("#instability-bonuses").innerHTML = `
    <span class="bonus-group bonus-range-1">CV&lt;0:+1⧖</span>
    <span class="bonus-group bonus-range-2">CV&gt;0:-1⧖</span>
    <span class="bonus-group bonus-range-3">CV&gt;0:-2⧖</span>
  `;

  document.querySelector("#instability-scores").innerHTML = ["5⬢", "3⬢", "1⬢", "0⬢", "-1⬢", "-3⬢"]
    .map((label) => `<span class="score-group">${label}</span>`)
    .join("");

  const groupSizes = [3, 4, 5, 6, 7, 1];
  const lockSpots = new Set(instabilityLockThresholds);
  let spot = 1;

  document.querySelector("#instability-track").innerHTML = groupSizes
    .map((count) => {
      const cells = Array.from({ length: count }, () => {
        const value = spot;
        spot += 1;
        const activeClass = value === player.instability ? "active" : "";
        const lockedClass = lockSpots.has(value) ? "locked" : "";
        const lockIcon = lockSpots.has(value) ? "⛨" : "";
        const marker = value === player.instability ? '<span class="instability-position-marker">⧖</span>' : "";
        const overflowPenalty = value === 26 ? '<span class="instability-overflow-penalty">-1⬢</span>' : "";
        return `<span class="instability-cell ${activeClass} ${lockedClass}">${lockIcon}${marker}${overflowPenalty}</span>`;
      }).join("");
      return `<div class="instability-group" data-count="${count}">${cells}</div>`;
    })
    .join("");

}

function renderSlots() {
  const player = activePlayer();
  const played = gameState.playedCardsByPlayer[player.id] || {};
  const circuits = played.circuits || [];
  document.querySelector("#circuit-slots").innerHTML = ["✸", "⊞", "⟁", "⧝"].map((symbol, index) => {
    const cards = circuits[index] || [];
    if (!cards.length) return `<div class="slot circuit-slot">⟟/${symbol}</div>`;
    return `<button type="button" class="slot circuit-slot" data-tucked-inspect="circuit" data-tucked-slot="${index}">${renderTuckedCounter(`${cards.length}${symbol}`, "circuit", "top", { inspectType: "circuit", slotIndex: index })}</button>`;
  }).join("");
  document.querySelector("#state-slot").innerHTML = played.states?.length ? renderTuckedCounter(stateProtocolCounterText(player.id, played.states), "state", "left", { inspectType: "state" }) : "<span>⦿</span>";
  document.querySelector("#protocol-slot").innerHTML = played.protocols?.length ? renderTuckedCounter(`${sumProtocolEndGameValue(played.protocols)}⬡`, "protocol", "right", { inspectType: "protocol" }) : "<span>⟫</span>";

  const facedownCards = gameState.facedownStabilizersByPlayer[gameState.activePlayerId] || [];
  const stabilizers = played.stabilizers || [];
  const pending = gameState.pendingStabilizerPlay?.playerId === player.id;
  document.querySelector("#stabilizer-slots").innerHTML = `${
    Array.from({ length: 5 }, (_, index) => {
      const card = stabilizers[index];
      const open = isOpenStabilizerSlot(player, index);
      const chooseClass = pending && open ? " choose-stabilizer-slot" : "";
      if (facedownCards[index]) return `<div class="slot stabilizer-face-down" title="Facedown stabilizer card"></div>`;
      if (card) return `<button type="button" class="slot stabilizer-played-slot" data-stabilizer-slot="${index}">${renderStabilizerTuck(card, isStabilizerLocked(player, index), isStabilizerUsedThisTurn(player, card.id))}</button>`;
      return `<button type="button" class="slot${chooseClass}" data-stabilizer-slot="${index}">⟨⟩</button>`;
    }).join("")
  }<div class="slot outside-slot"></div>`;
}

function isStabilizerLocked(player, slotIndex) {
  const [start, end] = stabilizerLockRanges[slotIndex] || [];
  if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
  return player.instability >= start && player.instability <= end;
}

function renderTuckedStack(cards, edge) {
  const lastIndex = Math.max(0, cards.length - 1);
  return `<span class="tucked-stack">${cards.map((card, index) => renderTuckedCard(card, edge, { edgeOnly: true, stackIndex: index, zIndex: lastIndex - index })).join("")}</span>`;
}

function renderTuckedCounter(text, type, edge, options = {}) {
  const inspectAttrs = options.inspectType
    ? ` data-tucked-inspect="${options.inspectType}"${Number.isFinite(options.slotIndex) ? ` data-tucked-slot="${options.slotIndex}"` : ""}`
    : "";
  return `
    <button type="button" class="tucked-card tucked-${type} tucked-${edge} tucked-counter" title="${escapeAttribute(text)}"${inspectAttrs}>
      <span class="tucked-symbol">${text}</span>
    </button>
  `;
}

function openTuckedCardsDialog(type, slotIndex = null) {
  const played = gameState.playedCardsByPlayer[gameState.activePlayerId] || {};
  let cards = [];
  let title = "Tucked Cards";
  if (type === "protocol") {
    cards = played.protocols || [];
    title = "Tucked Protocols";
  }
  if (type === "state") {
    cards = played.states || [];
    title = "Tucked States";
  }
  if (type === "circuit") {
    const index = Number(slotIndex);
    cards = Number.isInteger(index) ? (played.circuits?.[index] || []) : (played.circuits || []).flat();
    const symbol = ["✸", "⊞", "⟁", "⧝"][index];
    title = symbol ? `Tucked Circuits ${symbol}` : "Tucked Circuits";
  }
  if (!cards.length) return;
  document.querySelector("#tucked-cards-title").textContent = title;
  document.querySelector("#tucked-cards-grid").innerHTML = cards
    .map((card) => window.QuantumFluxCardRenderer.renderCard(card))
    .join("");
  document.querySelector("#tucked-cards-dialog").showModal();
}

function renderStabilizerTuck(card, locked, used = false) {
  const apex = card.apexEndGame ? `<span class="stabilizer-tuck-apex"> + ✦:${card.apexEndGame.amount}${card.apexEndGame.symbol}</span>` : "";
  const usedClass = used ? " used" : "";
  return `
    <span class="stabilizer-tuck-panel ${locked ? "locked" : ""}${usedClass}" title="${escapeAttribute(`${card.name} (${card.id})`)}">
      <span class="stabilizer-tuck-lock-icon">🔒</span>
      <span class="stabilizer-tuck-effect">${card.permanentEffect}</span>
      <span class="stabilizer-tuck-end"><span class="stabilizer-tuck-egc">⧗:${card.endGameCollection}</span>${apex}</span>
      <span class="stabilizer-tuck-lock"><span class="lock-mask">🔒</span>↯:${card.lockEffect}</span>
    </span>
  `;
}

function sumProtocolEndGameValue(cards) {
  return cards.reduce((sum, card) => sum + (Number(card.endGameValue) || 0), 0);
}

function stateProtocolCounterText(playerId, cards) {
  const thresholds = stateCoherenceThresholds(cards);
  if (!thresholds.length) return "⧗:0⬢";
  const protocolSymbols = sumProtocolEndGameValue(gameState.playedCardsByPlayer[playerId]?.protocols || []);
  const highestRequired = Math.max(...thresholds.map((threshold) => threshold.required));
  const maxReward = thresholds.reduce((sum, threshold) => sum + threshold.reward, 0);
  const currentReward = thresholds.reduce((sum, threshold) => (
    protocolSymbols >= threshold.required ? sum + threshold.reward : sum
  ), 0);
  return `⧗:≥${highestRequired}⬡→+${maxReward}⬢(+${currentReward}⬢)`;
}

function parseStateEndGameProtocol(value) {
  const text = String(value || "");
  const thresholdMatch = text.match(/≥\s*(\d+)\s*⬡/);
  const rewardMatch = text.match(/\+\s*(\d+)\s*⬢/);
  if (thresholdMatch && rewardMatch) {
    return {
      required: Number(thresholdMatch[1]),
      reward: Number(rewardMatch[1])
    };
  }
  const amountMatch = text.match(/(\d+)?\s*⬢/);
  const protocolMatch = text.match(/\/\s*(\d+)?\s*⬡/);
  return {
    required: Number(protocolMatch?.[1] || 1),
    reward: Number(amountMatch?.[1] || 1)
  };
}

function renderTuckedCard(card, edge, options = {}) {
  const title = escapeAttribute(card.name);
  const id = escapeAttribute(card.id);
  const visibleInfo = tuckedVisibleInfo(card);
  const edgeClass = options.edgeOnly ? " tucked-edge-only" : "";
  const styleParts = [];
  if (Number.isFinite(options.stackIndex)) styleParts.push(`--stack-index:${options.stackIndex}`);
  if (Number.isFinite(options.zIndex)) styleParts.push(`z-index:${options.zIndex}`);
  const stackStyle = styleParts.length ? ` style="${styleParts.join(";")}"` : "";
  return `
    <span class="tucked-card tucked-${card.type} tucked-${edge}${edgeClass}" title="${title} (${id})"${stackStyle}>
      ${visibleInfo}
    </span>
  `;
}

function tuckedVisibleInfo(card) {
  if (card.type === "protocol") {
    const quick = card.quickEffect ? `↯:${card.quickEffect.amount}${card.quickEffect.symbol}${card.quickEffect.apexAmount && card.quickEffect.apexAmount !== "/" ? ` ✦:${card.quickEffect.apexAmount}${card.quickEffect.apexSymbol}` : ""}` : "⟫";
    const endValue = "⬡".repeat(card.endGameValue || 0);
    return `<span class="tucked-symbol">${quick}</span><span class="tucked-secondary">${endValue}</span>`;
  }
  if (card.type === "circuit") return `<span class="tucked-symbol">${card.collection}</span>`;
  if (card.type === "state") return `<span class="tucked-symbol">${card.endGameProtocol}</span>`;
  if (card.type === "stabilizer") {
    const apex = card.apexEndGame ? ` ✦:${card.apexEndGame.amount}${card.apexEndGame.symbol}` : "";
    return `
      <span class="tucked-stabilizer-main">${card.permanentEffect}</span>
      <span class="tucked-stabilizer-end">${card.endGameCollection}${apex}</span>
      <span class="tucked-stabilizer-lock">🔒↯:${card.lockEffect}</span>
    `;
  }
  return `<span class="tucked-symbol">${card.name}</span>`;
}

function renderActivePlayer() {
  const player = activePlayer();
  document.querySelector("#current-player-label").innerHTML = playerNameMarkup(player);
  document.querySelector("#active-player-name").textContent = player.name;
  document.querySelector("#active-player-name").style.color = player.color;
  document.querySelector(".reactor-board").style.setProperty("--active-player-color", player.color);
  document.querySelector("#active-apex-mark").textContent = gameState.apexHolderId === player.id ? "✦" : "";
  document.querySelector("#active-potential").textContent = `${player.potential}⬢`;
  document.querySelector("#active-qubits").textContent = `${player.qubits}◈`;
  document.querySelector("#top-decoherence").textContent = gameState.decoherence;
  document.querySelector("#top-apex").innerHTML = gameState.apexHolderId ? playerNameMarkup(playerById(gameState.apexHolderId)) : "None";
  document.querySelector("#end-turn-button").classList.toggle("hidden", gameState.phase !== "post-placement");
  renderQubitTrack(player);
  renderInstability(player);
}

function renderApp() {
  renderPlayerSummary();
  renderScoreTrack();
  renderApexTrack();
  renderDecoherenceTrack();
  renderHexField();
  renderDecoherenceMeter();
  renderHand();
  renderPools();
  renderSlots();
  renderActivePlayer();
  renderDeltaSwapDialog();
  renderCircuitUpgradeDialog();
  renderEntropicResetDialog();
  renderHandCardDialog();
  renderScoringDialog();
  renderTutorialCoach();
  renderActionLog();
  scheduleBotTurn();
}

renderIntroPlayerFields();
bindControls();
updateAudioButtons();
if (window.QuantumFluxDesktop) document.body.classList.add("desktop-app");
