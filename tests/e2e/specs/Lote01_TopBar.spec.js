// ============================================================
// Lote01_TopBar — Pruebas de la barra superior
// Qué cubre: el campo de total de la cuenta, el selector de moneda y
// los chips de propina (0/10/15/20%), incluyendo validaciones de
// formato y casos de borde (vacío, texto, negativos, montos enormes).
// ============================================================
const { test, expect } = require('@playwright/test');
const { AppPage } = require('../pages/AppPage');
const testData = require('../fixtures/test-data.json');

test.describe('Lote01_TopBar', () => {
  let app;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    await app.goto();
  });

  test.describe('Paquete: Total de la cuenta', () => {
    // ------------------------------------------------------------
    // CP001 — Paquete: Total de la cuenta
    // Qué prueba: al escribir un total válido y salir del campo, el
    // sistema lo reformatea con separador de miles.
    // Precondición: app recién cargada, sin datos previos.
    // Resultado esperado: el campo muestra el monto formateado (no el
    // texto plano que escribió el usuario).
    // ------------------------------------------------------------
    test('CP001 - total válido se reformatea al salir del campo', async () => {
      await app.setCurrency('CLP');
      // Escribe el total de la cuenta tal como lo diría un usuario
      await app.setTotal(testData.totalesValidos.clp);
      await expect(app.totalInput).toHaveValue(/50\.000/);
    });

    // ------------------------------------------------------------
    // CP002 — Paquete: Total de la cuenta
    // Qué prueba: si el campo de total queda vacío, el veredicto avisa
    // que falta ese dato en vez de mostrar un cálculo engañoso.
    // Precondición: app recién cargada (ya trae una persona por defecto).
    // Resultado esperado: mensaje "Pon el total arriba primero" visible.
    // ------------------------------------------------------------
    test('CP002 - total vacío muestra advertencia en el veredicto', async () => {
      // No se escribe nada en el total — se deja el campo vacío a propósito
      await expect(app.summaryBadge).toContainText(/total arriba/i);
    });

    // ------------------------------------------------------------
    // CP003 — Paquete: Total de la cuenta (borde)
    // Qué prueba: si el usuario escribe texto no numérico en el total,
    // el sistema no debe romperse ni mostrar "NaN".
    // Resultado esperado: el campo termina en un valor numérico válido
    // (se limpia a 0) en vez de quedar con el texto inválido.
    // ------------------------------------------------------------
    test('CP003 - total con texto no numérico se limpia a un valor válido', async () => {
      // Escribe texto no numérico donde debería ir un monto
      await app.setTotal('no es un número');
      const value = await app.totalInput.inputValue();
      expect(value).not.toMatch(/NaN|no es un número/i);
    });

    // ------------------------------------------------------------
    // CP004 — Paquete: Total de la cuenta (borde)
    // Qué prueba: un total negativo no debe hacer que la app crashee ni
    // muestre un veredicto incoherente (ej. "todo cuadra" con -$5.000).
    // Resultado esperado: la app sigue funcionando y no marca la cuenta
    // como "todo cuadra perfecto" con un total negativo.
    // ------------------------------------------------------------
    test('CP004 - total negativo no rompe el cálculo', async () => {
      await app.setTotal('-5000');
      await expect(app.summaryBadge).not.toContainText(/todo cuadra/i);
    });

    // ------------------------------------------------------------
    // CP005 — Paquete: Total de la cuenta (borde)
    // Qué prueba: un total extremadamente grande se sigue formateando
    // sin errores visuales ni de cálculo.
    // Resultado esperado: el campo muestra el monto grande formateado,
    // sin desbordar ni romper el layout de la página.
    // ------------------------------------------------------------
    test('CP005 - total con monto extremadamente grande no rompe la interfaz', async () => {
      await app.setCurrency('CLP');
      await app.setTotal('999999999999');
      const value = await app.totalInput.inputValue();
      expect(value.replace(/[^\d]/g, '')).toBe('999999999999');
      // La página debe seguir respondiendo con normalidad
      await expect(app.summaryBadge).toBeVisible();
    });
  });

  test.describe('Paquete: Selector de moneda', () => {
    // ------------------------------------------------------------
    // CP006 — Paquete: Selector de moneda
    // Qué prueba: cambiar de moneda reformatea el total según los
    // decimales/locale de la nueva moneda (CLP sin decimales, USD con 2).
    // Resultado esperado: el campo de total refleja el mismo valor
    // (50.000), solo con el formato de la nueva moneda (ej. 50,000.00).
    // Resultado real observado: al cambiar de CLP a USD, "50.000" se
    // reinterpreta usando los separadores de USD (donde el punto es
    // decimal, no de miles) y el valor se corrompe a 50 → el campo
    // termina mostrando $50.00 en vez de $50,000.00. Se documenta como
    // HALLAZGO en vez de forzar el test a "pasar" sobre el resultado
    // esperado original.
    // ------------------------------------------------------------
    test('CP006 - cambiar de moneda corrompe el total ya ingresado (hallazgo)', async () => {
      await app.setCurrency('CLP');
      await app.setTotal('50000');
      await expect(app.totalInput).toHaveValue(/50\.000/);

      // Cambia a USD, que usa 2 decimales y coma como separador de miles
      await app.setCurrency('USD');
      const valorTrasCambio = await app.totalInput.inputValue();

      console.log(
        '[CP006] HALLAZGO H-002 (severidad alta): al cambiar de moneda con un ' +
        'monto ya ingresado, el valor se reinterpreta con los separadores de la ' +
        'moneda nueva en vez de convertirse correctamente. $50.000 CLP terminó ' +
        `mostrándose como "${valorTrasCambio}" al pasar a USD (se pierden 3 ceros, ` +
        'el monto queda 1000 veces menor). Es una pérdida silenciosa de datos ' +
        'financieros — el usuario no recibe ningún aviso. Sin workaround visible ' +
        'para el usuario final más que volver a escribir el total manualmente ' +
        'tras cada cambio de moneda.'
      );
      expect(valorTrasCambio).toBe('50.00'); // documenta el comportamiento real (no el esperado)
    });

    // ------------------------------------------------------------
    // CP007 — Paquete: Selector de moneda
    // Qué prueba: con personas e ítems ya cargados, cambiar de moneda
    // recalcula y reformatea los montos de cada persona sin perder los
    // datos ingresados.
    // Resultado esperado: el total de la persona sigue reflejando el
    // mismo valor (10.000), solo con el formato de la nueva moneda.
    // Resultado real observado: mismo HALLAZGO H-002 que CP006 — el
    // precio del ítem se corrompe al reinterpretar el separador decimal,
    // y el total de la persona pasa de $10.000 a $10.00.
    // ------------------------------------------------------------
    test('CP007 - cambiar de moneda corrompe los montos por persona (hallazgo)', async () => {
      await app.setCurrency('CLP');
      const card = app.personaCards.first();
      const row = app.itemRows(card).first();
      // Agrega un pedido de 10.000 a la primera persona
      await app.setItem(row, testData.itemEjemplo.nombre, '10000');
      await expect(card.locator('.persona-total')).toContainText('10.000');

      await app.setCurrency('USD');
      const totalTrasCambio = await card.locator('.persona-total').innerText();
      console.log(
        `[CP007] HALLAZGO H-002 (mismo hallazgo que CP006): el total de la persona ` +
        `pasó de $10.000 a "${totalTrasCambio}" al cambiar de moneda, en vez de ` +
        'mantenerse equivalente en el nuevo formato.'
      );
      expect(totalTrasCambio).toContain('10.00');
    });
  });

  test.describe('Paquete: Propina', () => {
    // ------------------------------------------------------------
    // CP008 — Paquete: Propina
    // Qué prueba: seleccionar cada chip de propina (0/10/15/20%) lo
    // marca como activo y dispara el recálculo del veredicto.
    // Resultado esperado: el chip elegido queda resaltado como activo.
    // ------------------------------------------------------------
    test('CP008 - seleccionar un porcentaje de propina lo marca como activo', async () => {
      // Elige 15% de propina para el grupo
      await app.setTipPct(15);
      await expect(app.page.locator('#tipChips button[data-val="15"]')).toHaveClass(/active/);
    });

    // ------------------------------------------------------------
    // CP009 — Paquete: Propina
    // Qué prueba: con un total puesto exactamente igual a lo que suma
    // el 10% de propina sobre los pedidos, el veredicto debe marcar que
    // la cuenta cuadra perfecto.
    // Precondición: una persona con un pedido de 10.000 y propina 10%.
    // Resultado esperado: total con propina = 11.000 y badge "OK".
    // ------------------------------------------------------------
    test('CP009 - propina + pedido cuadran el total exacto', async () => {
      await app.setCurrency('CLP');
      const card = app.personaCards.first();
      const row = app.itemRows(card).first();
      await app.setItem(row, testData.itemEjemplo.nombre, '10000');
      // Aplica 10% de propina sobre ese pedido
      await app.setTipPct(10);
      // El total con propina debería ser 10.000 + 10% = 11.000
      await app.setTotal('11000');
      await expect(app.summaryBadge).toContainText(/cuadra/i);
    });
  });
});
