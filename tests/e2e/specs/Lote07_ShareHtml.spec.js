// ============================================================
// Lote07_ShareHtml — Pruebas de la página de difusión (Share.html)
// Qué cubre: carga correcta, copiar el link de la app, y volver a la
// calculadora principal.
// ============================================================
const { test, expect } = require('@playwright/test');
const { SharePage } = require('../pages/SharePage');

test.describe('Lote07_ShareHtml', () => {
  let share;

  test.beforeEach(async ({ page }) => {
    share = new SharePage(page);
    await share.goto();
  });

  // ------------------------------------------------------------
  // CP041 — Paquete: Página de difusión
  // Qué prueba: la página Share.html carga con el link de la app
  // visible, permite copiarlo, y el botón de volver lleva de regreso
  // a la calculadora principal.
  // Resultado esperado: el link se copia y el botón "volver" navega a
  // index.html.
  // ------------------------------------------------------------
  test('CP041 - copiar el link de la app y volver a la calculadora', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Verifica que el link de la app esté visible en pantalla
    await expect(share.urlText).toBeVisible();
    const linkMostrado = await share.urlText.innerText();
    expect(linkMostrado.length).toBeGreaterThan(0);

    // Copia el link al portapapeles
    await share.copyLinkButton.click();
    await expect(share.copyLinkButton).toContainText(/copiado/i);

    // Vuelve a la calculadora principal
    await share.backLink.click();
    await expect(page).toHaveURL(/index\.html/);
  });
});
