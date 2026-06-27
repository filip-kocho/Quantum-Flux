function renderCard(card) {
  const renderers = {
    protocol: renderProtocolCard,
    circuit: renderCircuitCard,
    stabilizer: renderStabilizerCard,
    state: renderStateCard
  };
  return renderers[card.type](card);
}

function renderProtocolCard(card) {
  return `
    <article class="qf-card protocol-card card-${card.id.toLowerCase()}">
      <div class="card-text protocol-condition">≥${card.playCondition.minPotential}⬢</div>
      <div class="card-text protocol-end-value">${verticalSymbols("⬡", card.endGameValue)}</div>
      <div class="card-text card-title">${card.name}</div>
      <div class="card-text card-effect">
        <div class="protocol-immediate-line">⇶ ${card.immediateEffect}</div>
        <div class="protocol-quick-line"><span class="quick-part">↯:${card.quickEffect.amount}${card.quickEffect.symbol}</span> <span class="apex-part">✦:${card.quickEffect.apexAmount}${card.quickEffect.apexSymbol}</span></div>
      </div>
      <div class="card-text card-requantize">${formatRequantize(card)}</div>
      <div class="card-text card-decohere">${formatDecohere(card)}</div>
      <div class="card-text card-cost">${card.cost}</div>
      <div class="card-text card-id">${card.id}</div>
    </article>
  `;
}

function renderCircuitCard(card) {
  return `
    <article class="qf-card circuit-card">
      <div class="card-text circuit-collection">${card.collection}</div>
      <div class="card-text card-title">${card.name}</div>
      <div class="card-text card-effect">⇑ ${card.upgradeEffect}</div>
      <div class="card-text card-requantize">${formatRequantize(card)}</div>
      <div class="card-text card-cost">${card.cost}</div>
      <div class="card-text circuit-apex-cost">${card.apexCost}</div>
      <div class="card-text card-id">${card.id}</div>
    </article>
  `;
}

function renderStabilizerCard(card) {
  return `
    <article class="qf-card stabilizer-card">
      <div class="card-text stabilizer-top-id">${card.id}</div>
      <div class="card-text card-title">${card.name}</div>
      <div class="card-text card-effect">⟂ ${card.permanentEffect}<br><span class="collection-part">⧗:${card.endGameCollection}</span> <span class="apex-part">+ (✦:${card.apexEndGame.amount}${card.apexEndGame.symbol})</span></div>
      <div class="card-text card-requantize">${formatRequantize(card)}</div>
      <div class="card-text card-cost">${card.cost}</div>
      <div class="card-text stabilizer-lock"><span class="lock-mask">🔒</span>↯: ${card.lockEffect}</div>
    </article>
  `;
}

function renderStateCard(card) {
  return `
    <article class="qf-card state-card">
      <div class="card-text state-egs">⧗:${card.endGameProtocol}</div>
      ${renderDecoFlag(card.decoherenceFlag)}
      <div class="card-text card-title">${card.name}</div>
      <div class="card-text card-effect"><div>∴ ${card.condition}</div><div class="state-apex-line">(✦: ${card.apexCondition})</div></div>
      <div class="card-text card-requantize">${formatRequantize(card)}</div>
      <div class="card-text card-decohere">${formatDecohere(card)}</div>
      <div class="card-text card-cost">${card.cost}</div>
      <div class="card-text card-id">${card.id}</div>
    </article>
  `;
}

function formatRequantize(card) {
  return card.requantize ? `⟲: ${formatSignedAmount(card.requantize.amount)}${card.requantize.symbol}` : "";
}

function formatDecohere(card) {
  if (card.decohere?.negative === false) return "";
  return card.decohere ? `≋: ${formatSignedAmount(card.decohere.amount)}${card.decohere.symbol}` : "";
}

function formatSignedAmount(amount) {
  if (amount === undefined || amount === null || amount === "") return "";
  const value = String(amount);
  return /^[+-]/.test(value) ? value : `+${value}`;
}

function renderDecoFlag(colors) {
  return `<div class="deco-flag">${colors.map((color) => `<span class="${color}"></span>`).join("")}<strong>Δ</strong></div>`;
}

function verticalSymbols(symbol, count) {
  return Array.from({ length: count }, () => symbol).join("<br>");
}

window.QuantumFluxCardRenderer = {
  renderCard
};
