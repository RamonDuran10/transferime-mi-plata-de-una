// ============================================================
// AppPage.js — Page Object de la calculadora principal (index.html).
// Agrupa los selectores y acciones para que los specs se lean como
// pasos de negocio ("agregar persona", "poner el total") en vez de
// manipulación directa del DOM.
// ============================================================
class AppPage {
  constructor(page) {
    this.page = page;

    this.totalInput = page.locator('#totalBill');
    this.currencySelect = page.locator('#currencySelect');
    this.shareButton = page.locator('.btn-share');
    this.resetButton = page.locator('.btn-reset');
    this.addPersonaButton = page.locator('.btn-add-persona');
    this.addSharedButton = page.locator('.btn-add-shared');
    this.personaCards = page.locator('.persona-card');
    this.sharedRows = page.locator('#sharedList .item-row');
    this.sharedBadge = page.locator('#sharedBadge');

    this.lockBanner = page.locator('#lockBanner');
    this.unlockButton = page.locator('.btn-unlock');

    this.summaryRows = page.locator('#summaryRows .summary-row');
    this.summaryEmpty = page.locator('#summaryRows');
    this.totalRow = page.locator('.summary-total-row');
    this.summaryBadge = page.locator('.summary-total-row .badge');

    this.toast = page.locator('#toast');

    // Modal "Compartir"
    this.modalOverlay = page.locator('#modalOverlay');
    this.modalText = page.locator('#modalText');
    this.btnCopy = page.locator('#btnCopy');
    this.modalRelayRow = page.locator('#modalRelayRow');
    this.modalRelayLink = page.locator('#modalRelayLink');
    this.modalRelayWarning = page.locator('#modalRelayWarning');
    this.modalRelayDone = page.locator('#modalRelayDone');
    this.modalClose = page.locator('.modal-close');
  }

  // Abre la app con estado limpio (sin datos de una corrida anterior) y
  // sin depender del contador de uso externo (mockeado, Estrategia Opción 1).
  async goto() {
    await this.page.route('**/abacus.jasoncameron.dev/**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ value: 1 }) })
    );
    await this.page.goto('/index.html');
    await this.page.evaluate(() => localStorage.clear());
    await this.page.reload();
  }

  // Escribe el total de la cuenta y dispara el reformateo (blur), igual
  // que haría una persona real al salir del campo.
  async setTotal(value) {
    await this.totalInput.fill(String(value));
    await this.totalInput.blur();
  }

  async setTipPct(pct) {
    await this.page.locator(`#tipChips button[data-val="${pct}"]`).click();
  }

  async setCurrency(code) {
    await this.currencySelect.selectOption(code);
  }

  async addPersona() {
    await this.addPersonaButton.click();
    return this.personaCards.last();
  }

  async removePersona(card) {
    await card.locator('.btn-remove-persona').click();
  }

  async setPersonaName(card, name) {
    await card.locator('.persona-header input').fill(name);
  }

  async changePersonaEmoji(card) {
    await card.locator('.btn-persona-emoji').click();
  }

  async addItemToPersona(card) {
    await card.locator('.btn-add-item').click();
  }

  itemRows(card) {
    return card.locator('.items-list .item-row');
  }

  async setItem(row, name, price) {
    const inputs = row.locator('input');
    await inputs.nth(0).fill(name);
    await inputs.nth(1).fill(String(price));
    await inputs.nth(1).blur();
  }

  async duplicateItem(row) {
    await row.locator('.btn-dup-item').click();
  }

  async removeItem(row) {
    await row.locator('.btn-remove-item').click();
  }

  async personaTotalText(card) {
    return card.locator('.persona-total').innerText();
  }

  async addSharedItem() {
    await this.addSharedButton.click();
    return this.sharedRows.last();
  }

  async openShareModal() {
    await this.shareButton.click();
    await this.modalOverlay.waitFor({ state: 'visible' });
  }

  async closeShareModal() {
    await this.modalClose.click();
  }
}

module.exports = { AppPage };
