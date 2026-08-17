// ============================================================
// Lote05_CompartirYEstadoURL — Pruebas del modal "Compartir" y del
// link "en posta" (estado de la cuenta comprimido en la URL).
// Qué cubre: el texto exportado, el link para que otros sigan
// agregando lo suyo, la advertencia de link largo con 20 personas, la
// reconstrucción del estado al abrir ese link, links corruptos, y la
// persistencia en localStorage.
// ============================================================
const { test, expect } = require('@playwright/test');
const { AppPage } = require('../pages/AppPage');
const testData = require('../fixtures/test-data.json');

test.describe('Lote05_CompartirYEstadoURL', () => {
  let app;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    await app.goto();
    await app.setCurrency('CLP');
  });

  test.describe('Paquete: Modal compartir', () => {
    // ------------------------------------------------------------
    // CP034 — Paquete: Modal compartir
    // Qué prueba: exportar el detalle genera un texto con el subtotal,
    // la propina y el monto por persona.
    // Resultado esperado: el texto del modal incluye el nombre de la
    // persona y su monto.
    // ------------------------------------------------------------
    test('CP034 - exportar detalle genera el texto correcto', async () => {
      const card = app.personaCards.first();
      await app.setPersonaName(card, 'Ana');
      await app.setItem(app.itemRows(card).first(), 'Pedido', '10000');
      await app.setTotal('10000');

      await app.openShareModal();
      const texto = await app.modalText.inputValue();
      expect(texto).toContain('Ana');
      expect(texto).toContain('10.000');
    });

    // ------------------------------------------------------------
    // CP035 — Paquete: Modal compartir
    // Qué prueba: copiar el detalle al portapapeles cambia el botón a
    // estado "copiado".
    // Resultado esperado: el botón muestra el texto de confirmación.
    // ------------------------------------------------------------
    test('CP035 - copiar el detalle muestra confirmación', async ({ context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      const card = app.personaCards.first();
      await app.setItem(app.itemRows(card).first(), 'Pedido', '5000');
      await app.openShareModal();

      await app.btnCopy.click();
      await expect(app.btnCopy).toContainText(/copiado/i);
    });

    // ------------------------------------------------------------
    // CP036 — Paquete: Modal compartir
    // Qué prueba: si la cuenta ya cuadra, no tiene sentido invitar a
    // nadie más a sumar lo suyo — el link "en posta" no se ofrece.
    // Resultado esperado: se muestra el mensaje de que la cuenta ya
    // cuadra, y el campo de link queda oculto.
    // ------------------------------------------------------------
    test('CP036 - cuenta cuadrada no ofrece el link en posta', async () => {
      const card = app.personaCards.first();
      await app.setItem(app.itemRows(card).first(), 'Pedido', '10000');
      await app.setTotal('10000');

      await app.openShareModal();
      await expect(app.modalRelayDone).toBeVisible();
      await expect(app.modalRelayRow).toBeHidden();
    });
  });

  test.describe('Paquete: Parámetros de la URL (#s=)', () => {
    // ------------------------------------------------------------
    // CP017 — Paquete: Parámetros de la URL (20 personas)
    // Qué prueba: con 20 personas y datos largos, el link generado
    // puede superar los ~1500 caracteres — la app debe avisarlo en vez
    // de entregar un link roto silenciosamente.
    // Resultado esperado: aparece la advertencia de "link se está
    // poniendo largo" cuando corresponde según el propio criterio de
    // la app (>1500 caracteres).
    // ------------------------------------------------------------
    test('CP017 - con 20 personas y datos largos, se avisa si el link es muy largo', async () => {
      test.setTimeout(60000);
      const nombres = testData.nombresPersonas20;
      await app.setPersonaName(app.personaCards.first(), nombres[0] + testData.textoMuyLargo);
      await app.setItem(app.itemRows(app.personaCards.first()).first(), testData.textoMuyLargo, '1000');
      for (let i = 1; i < nombres.length; i++) {
        const card = await app.addPersona();
        await app.setPersonaName(card, nombres[i] + testData.textoMuyLargo);
        await app.setItem(app.itemRows(card).first(), testData.textoMuyLargo, '1000');
      }
      // Deja el total sin poner para que la cuenta no cuadre y se ofrezca el link
      await app.openShareModal();
      await expect(app.modalRelayLink).not.toHaveValue('', { timeout: 15000 });

      const url = await app.modalRelayLink.inputValue();
      const deberiaAvisar = url.length > 1500;
      if (deberiaAvisar) {
        await expect(app.modalRelayWarning).toBeVisible();
      } else {
        await expect(app.modalRelayWarning).toBeHidden();
      }
    });

    // ------------------------------------------------------------
    // CP018 — Paquete: Parámetros de la URL (20 personas)
    // Qué prueba: el link generado con 20 personas se puede abrir en
    // otra sesión y reconstruye el grupo completo (nombres y montos).
    // Resultado esperado: la nueva sesión muestra las 20 tarjetas con
    // los mismos nombres que se ingresaron originalmente.
    // ------------------------------------------------------------
    test('CP018 - el link con 20 personas reconstruye el estado completo', async ({ browser }) => {
      test.setTimeout(90000);
      const nombres = testData.nombresPersonas20;
      await app.setPersonaName(app.personaCards.first(), nombres[0]);
      await app.setItem(app.itemRows(app.personaCards.first()).first(), 'Pedido', '1000');
      for (let i = 1; i < nombres.length; i++) {
        const card = await app.addPersona();
        await app.setPersonaName(card, nombres[i]);
        await app.setItem(app.itemRows(card).first(), 'Pedido', '1000');
      }

      await app.openShareModal();
      await expect(app.modalRelayLink).not.toHaveValue('', { timeout: 15000 });
      const url = await app.modalRelayLink.inputValue();

      // Abre el link en una sesión nueva, sin ningún dato previo
      const contextNuevo = await browser.newContext();
      const paginaNueva = await contextNuevo.newPage();
      await paginaNueva.route('**/abacus.jasoncameron.dev/**', route =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ value: 1 }) })
      );
      await paginaNueva.goto(url);

      const appNueva = new AppPage(paginaNueva);
      await expect(appNueva.personaCards).toHaveCount(20, { timeout: 15000 });
      const nombresCargados = await appNueva.personaCards
        .locator('.persona-header input')
        .evaluateAll(inputs => inputs.map(i => i.value));
      expect(nombresCargados).toEqual(nombres);

      await contextNuevo.close();
    });

    // ------------------------------------------------------------
    // CP037 — Paquete: Parámetros de la URL
    // Qué prueba: si ya hay datos guardados en este navegador (de una
    // sesión anterior) y se abre el link compartido en una pestaña
    // nueva, la app debe pedir confirmación antes de sobrescribir lo
    // que ya se llevaba avanzado.
    // Nota técnica: esto se simula abriendo una PESTAÑA NUEVA dentro
    // del mismo contexto (mismo localStorage), no reutilizando la
    // pestaña ya abierta — navegar a la misma página cambiando solo el
    // hash es, por especificación del navegador, una navegación "en el
    // mismo documento" que no recarga el script, así que no representa
    // el flujo real de "abrir el link".
    // Resultado esperado: aparece un diálogo de confirmación antes de
    // reemplazar los datos actuales.
    // ------------------------------------------------------------
    test('CP037 - abrir un link con datos existentes pide confirmar sobrescritura', async ({ context }) => {
      // Genera un link válido a partir del estado actual
      const card = app.personaCards.first();
      await app.setPersonaName(card, 'YaTengoAlgoEscrito');
      await app.setItem(app.itemRows(card).first(), 'Pedido', '1000');
      await app.openShareModal();
      await expect(app.modalRelayLink).not.toHaveValue('', { timeout: 15000 });
      const url = await app.modalRelayLink.inputValue();
      await app.closeShareModal();

      // Abre el link en una pestaña nueva del mismo navegador — ahí es
      // donde vive el dato guardado en localStorage que podría perderse
      const paginaNueva = await context.newPage();
      let dialogoVisto = false;
      paginaNueva.once('dialog', async dialog => {
        dialogoVisto = true;
        await dialog.accept();
      });
      await paginaNueva.goto(url);

      expect(dialogoVisto).toBe(true);
      await paginaNueva.close();
    });

    // ------------------------------------------------------------
    // CP038 — Paquete: Parámetros de la URL (borde)
    // Qué prueba: un link con el estado corrupto/inválido no debe
    // dejar la app en blanco — debe avisar con un toast y recuperar
    // los datos guardados en localStorage como respaldo.
    // Nota técnica: se abre en una pestaña nueva (misma razón que
    // CP037) para garantizar que sea una navegación real de página
    // completa, y no un simple cambio de fragmento en el documento ya
    // cargado.
    // Resultado esperado: aparece el toast de "no se pudo leer el
    // link" y la app sigue siendo usable.
    // ------------------------------------------------------------
    test('CP038 - link con estado corrupto muestra error y no rompe la app', async ({ context }) => {
      const paginaNueva = await context.newPage();
      await paginaNueva.route('**/abacus.jasoncameron.dev/**', route =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ value: 1 }) })
      );
      await paginaNueva.goto('/index.html#s=dEstoNoEsUnEstadoValido!!!');
      const appNueva = new AppPage(paginaNueva);
      await expect(appNueva.toast).toContainText(/no se pudo/i);
      await expect(appNueva.personaCards).toHaveCount(1); // sigue usable, con el estado por defecto
      await paginaNueva.close();
    });
  });

  test.describe('Paquete: Persistencia', () => {
    // ------------------------------------------------------------
    // CP039 — Paquete: Persistencia
    // Qué prueba: los datos ingresados sobreviven a recargar la
    // página, ya que se guardan en localStorage en cada cambio.
    // Resultado esperado: tras recargar, el total y el pedido siguen
    // presentes.
    // ------------------------------------------------------------
    test('CP039 - los datos persisten al recargar la página', async ({ page }) => {
      const card = app.personaCards.first();
      await app.setPersonaName(card, 'Persistente');
      await app.setItem(app.itemRows(card).first(), 'Pedido', '7000');
      await app.setTotal('7000');

      await page.reload();

      await expect(app.personaCards.first().locator('.persona-header input')).toHaveValue('Persistente');
      await expect(app.totalInput).toHaveValue(/7\.000/);
    });
  });
});
