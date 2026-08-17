// ============================================================
// Lote04_ResumenYCalculo — Pruebas del veredicto final y el bloqueo
// Qué cubre: los tres estados del veredicto (cuadra / falta / sobra),
// el autobloqueo de edición cuando la cuenta cuadra, y el botón de
// reiniciar todo (que sí exige confirmación).
// ============================================================
const { test, expect } = require('@playwright/test');
const { AppPage } = require('../pages/AppPage');

test.describe('Lote04_ResumenYCalculo', () => {
  let app;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    await app.goto();
    await app.setCurrency('CLP');
  });

  test.describe('Paquete: Cuadre de la cuenta', () => {
    // ------------------------------------------------------------
    // CP027 — Paquete: Cuadre de la cuenta
    // Qué prueba: cuando la suma de lo que le toca a cada persona es
    // exactamente igual al total ingresado, el veredicto marca "todo
    // cuadra perfecto" y la app pasa a modo solo lectura automáticamente.
    // Resultado esperado: badge OK + banner de bloqueo visible.
    // ------------------------------------------------------------
    test('CP027 - suma exacta muestra badge OK y bloquea la edición', async () => {
      const card = app.personaCards.first();
      await app.setItem(app.itemRows(card).first(), 'Pedido', '10000');
      await app.setTotal('10000');
      await expect(app.summaryBadge).toContainText(/cuadra/i);
      await expect(app.lockBanner).toBeVisible();
    });

    // ------------------------------------------------------------
    // CP028 — Paquete: Cuadre de la cuenta
    // Qué prueba: si la suma de lo que le toca a cada persona es menor
    // al total, el veredicto avisa que falta plata en la mesa.
    // Resultado esperado: badge de "falta plata" y sin bloqueo.
    // ------------------------------------------------------------
    test('CP028 - suma menor al total muestra "falta plata"', async () => {
      const card = app.personaCards.first();
      await app.setItem(app.itemRows(card).first(), 'Pedido', '5000');
      await app.setTotal('10000');
      await expect(app.summaryBadge).toContainText(/falta/i);
      await expect(app.lockBanner).toBeHidden();
    });

    // ------------------------------------------------------------
    // CP029 — Paquete: Cuadre de la cuenta
    // Qué prueba: si la suma de lo que le toca a cada persona supera el
    // total, el veredicto avisa que se pasaron con la plata.
    // Resultado esperado: badge de "se pasaron" y sin bloqueo.
    // ------------------------------------------------------------
    test('CP029 - suma mayor al total muestra "se pasaron"', async () => {
      const card = app.personaCards.first();
      await app.setItem(app.itemRows(card).first(), 'Pedido', '15000');
      await app.setTotal('10000');
      await expect(app.summaryBadge).toContainText(/pasaron/i);
      await expect(app.lockBanner).toBeHidden();
    });

    // ------------------------------------------------------------
    // CP030 — Paquete: Cuadre de la cuenta
    // Qué prueba: cuando la cuenta se bloquea automáticamente, el botón
    // "Editar" del banner permite desbloquearla manualmente para seguir
    // corrigiendo datos.
    // Resultado esperado: al hacer clic en "Editar", el banner de
    // bloqueo desaparece y los campos vuelven a ser editables.
    // ------------------------------------------------------------
    test('CP030 - el botón Editar desbloquea la cuenta ya cuadrada', async () => {
      const card = app.personaCards.first();
      await app.setItem(app.itemRows(card).first(), 'Pedido', '10000');
      await app.setTotal('10000');
      await expect(app.lockBanner).toBeVisible();

      await app.unlockButton.click();
      await expect(app.lockBanner).toBeHidden();
      await expect(app.page.locator('.main-card')).not.toHaveClass(/locked/);
    });

    // ------------------------------------------------------------
    // CP031 — Paquete: Cuadre de la cuenta
    // Qué prueba: si tras desbloquear manualmente se modifica un valor
    // y la cuenta deja de cuadrar, el desbloqueo manual se resetea (el
    // sistema vuelve a controlar el bloqueo automáticamente).
    // Resultado esperado: al volver a cuadrar la cuenta, se re-bloquea
    // sola sin depender del desbloqueo manual anterior.
    // ------------------------------------------------------------
    test('CP031 - modificar un valor tras desbloquear resetea el desbloqueo manual', async () => {
      const card = app.personaCards.first();
      const row = app.itemRows(card).first();
      await app.setItem(row, 'Pedido', '10000');
      await app.setTotal('10000');
      await app.unlockButton.click();
      await expect(app.lockBanner).toBeHidden();

      // Cambia el precio del pedido — la cuenta deja de cuadrar
      await app.setItem(row, 'Pedido', '12000');
      await expect(app.lockBanner).toBeHidden(); // ya no cuadra, no hay nada que bloquear

      // Vuelve a cuadrar la cuenta manualmente
      await app.setItem(row, 'Pedido', '10000');
      await expect(app.lockBanner).toBeVisible(); // se re-bloquea sola, no quedó "desbloqueada para siempre"
    });
  });

  test.describe('Paquete: Reiniciar cuenta', () => {
    // ------------------------------------------------------------
    // CP032 — Paquete: Reiniciar cuenta
    // Qué prueba: el botón de reiniciar (🗑️) sí pide confirmación antes
    // de borrar todo, a diferencia de quitar una persona (ver CP011).
    // Resultado esperado: aparece un diálogo de confirmación antes de
    // borrar los datos.
    // Nota: a diferencia de la primera carga de la app (que siempre
    // agrega una persona por defecto), reiniciar deja el grupo en 0
    // personas — se documenta como observación de baja severidad, no
    // bloquea el CP porque la confirmación sí funciona como se espera.
    // ------------------------------------------------------------
    test('CP032 - reiniciar la cuenta pide confirmación', async () => {
      const card = app.personaCards.first();
      await app.setItem(app.itemRows(card).first(), 'Pedido', '10000');

      let dialogoVisto = false;
      app.page.once('dialog', async dialog => {
        dialogoVisto = true;
        expect(dialog.type()).toBe('confirm');
        await dialog.accept();
      });
      await app.resetButton.click();

      expect(dialogoVisto).toBe(true);
      await expect(app.totalInput).toHaveValue('');
      // Tras reiniciar, el grupo queda vacío (0 personas) — distinto de
      // la carga inicial de la app, que siempre agrega 1 persona por
      // defecto (ver addPersona() en el IIFE de arranque de index.html).
      console.log(
        '[CP032] HALLAZGO H-003 (severidad baja): reiniciar deja el grupo en 0 ' +
        'personas y obliga a hacer clic en "+ Sumar a alguien" antes de poder ' +
        'seguir, mientras que la primera carga de la app arranca con 1 persona ' +
        'lista para usar. Es una inconsistencia menor de UX entre "estado ' +
        'inicial" y "reset al estado inicial", sin impacto funcional ni pérdida ' +
        'de datos.'
      );
      await expect(app.personaCards).toHaveCount(0);
    });

    // ------------------------------------------------------------
    // CP033 — Paquete: Reiniciar cuenta
    // Qué prueba: cancelar el diálogo de confirmación NO debe borrar
    // los datos ya ingresados.
    // Resultado esperado: los pedidos y el total siguen intactos.
    // ------------------------------------------------------------
    test('CP033 - cancelar el reinicio conserva los datos', async () => {
      const card = app.personaCards.first();
      await app.setItem(app.itemRows(card).first(), 'Pedido', '10000');
      await app.setTotal('10000');

      app.page.once('dialog', async dialog => { await dialog.dismiss(); });
      await app.resetButton.click();

      await expect(app.totalInput).toHaveValue(/10\.000/);
      await expect(app.itemRows(card).first().locator('input').nth(0)).toHaveValue('Pedido');
    });
  });
});
