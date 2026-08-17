// ============================================================
// Lote06_Boleta — Pruebas de la función "subir boleta"
// Qué cubre: se intenta verificar la carga y visualización de una
// foto de la boleta de compra. Ver CP040 — el CP quedó BLOQUEADO
// porque el elemento necesario para montarlo no existe en la interfaz.
// ============================================================
const { test, expect } = require('@playwright/test');
const { AppPage } = require('../pages/AppPage');

test.describe('Lote06_Boleta', () => {
  let app;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    await app.goto();
  });

  // ------------------------------------------------------------
  // CP040 — Paquete: Subir boleta
  // Qué prueba: subir una imagen de la boleta y poder visualizarla
  // luego con el botón "👁️ Ver la boleta".
  // Precondición: el CP asume que existe un botón para abrir el
  // selector de archivo (equivalente a "Subir boleta") en la barra
  // superior, ya que el CSS (.btn-receipt) y las funciones JS
  // (showReceipt, verBoleta, closeReceipt, #receiptInput) existen en
  // el código de la app.
  // Resultado esperado: la boleta subida se puede visualizar.
  // Resultado real: no existe ningún botón ni <input type="file"
  // id="receiptInput"> en el HTML de index.html — la función
  // showReceipt() nunca se puede invocar desde la interfaz. El CP tal
  // como se aprobó no se puede montar.
  // Estado: BLOQUEADO (no HALLAZGO, porque no se pudo ni siquiera
  // ejecutar el flujo — no hay elemento que reproduzca el caso).
  // ------------------------------------------------------------
  test.skip('CP040 - subir y visualizar la boleta [BLOQUEADO]', async () => {
    // BLOQUEADO: no existe #receiptInput ni un botón visible que dispare
    // showReceipt() en index.html, aunque el CSS (.btn-receipt) y las
    // funciones JS (showReceipt/verBoleta/closeReceipt) sí están
    // presentes en es.js/index.html. Es una funcionalidad "huérfana":
    // el código existe pero no hay forma de alcanzarlo desde la UI.
    // Se documenta como BLOQUEADO para que el equipo decida si agrega
    // el botón que falta o retira el código muerto.
  });

  test('CP040-verificación - confirma que el elemento de subir boleta no existe en la interfaz', async () => {
    // Este test no es el CP040 en sí — solo respalda con evidencia el
    // motivo del bloqueo, verificando que efectivamente no hay ningún
    // control visible para subir la boleta.
    await expect(app.page.locator('.btn-receipt')).toHaveCount(0);
    await expect(app.page.locator('#receiptInput')).toHaveCount(0);
  });
});
