// ============================================================
// SharePage.js — Page Object de la página de difusión (Share.html),
// el "vólante" para invitar a otras personas a usar la app.
// ============================================================
class SharePage {
  constructor(page) {
    this.page = page;
    this.urlText = page.locator('#urlText');
    this.copyLinkButton = page.locator('#btnCopyLink');
    this.backLink = page.locator('#backLink');
  }

  async goto() {
    await this.page.goto('/Share.html');
  }
}

module.exports = { SharePage };
