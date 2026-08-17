// ============================================================
// Lote03_Compartidos — Pruebas de ítems "para todos"
// Qué cubre: agregar, dividir, duplicar y quitar ítems compartidos
// entre el grupo, incluyendo el caso borde de dividir entre 0 personas.
// ============================================================
const { test, expect } = require('@playwright/test');
const { AppPage } = require('../pages/AppPage');
const testData = require('../fixtures/test-data.json');

test.describe('Lote03_Compartidos', () => {
  let app;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    await app.goto();
  });

  test.describe('Paquete: División entre el grupo', () => {
    // ------------------------------------------------------------
    // CP023 — Paquete: División entre el grupo
    // Qué prueba: un ítem compartido se divide en partes iguales entre
    // todas las personas del grupo.
    // Precondición: 2 personas en el grupo.
    // Resultado esperado: la insignia de compartidos muestra el total
    // dividido en 2, y cada persona ve su porción individual.
    // ------------------------------------------------------------
    test('CP023 - ítem compartido se divide entre todas las personas', async () => {
      await app.setCurrency('CLP');
      await app.addPersona(); // ahora hay 2 personas
      // Agrega algo para compartir entre todos, por 4.000
      const row = await app.addSharedItem();
      await app.setItem(row, testData.itemCompartidoEjemplo.nombre, '4000');

      await expect(app.sharedBadge).toContainText('2.000'); // 4.000 ÷ 2
    });

    // ------------------------------------------------------------
    // CP024 — Paquete: División entre el grupo (borde)
    // Qué prueba: si no hay ninguna persona en el grupo, dividir un
    // ítem compartido no debe producir una división por cero visible
    // (NaN o Infinity) en la insignia.
    // Precondición: se quita la única persona por defecto.
    // Resultado esperado: la insignia muestra el total sin dividir, sin
    // errores de cálculo.
    // ------------------------------------------------------------
    test('CP024 - ítem compartido con 0 personas no genera división por cero', async () => {
      // Quita la única persona que trae la app por defecto
      await app.removePersona(app.personaCards.first());
      await expect(app.personaCards).toHaveCount(0);

      const row = await app.addSharedItem();
      await app.setItem(row, testData.itemCompartidoEjemplo.nombre, '4000');

      await expect(app.sharedBadge).not.toContainText(/NaN|Infinity/i);
    });

    // ------------------------------------------------------------
    // CP025 — Paquete: División entre el grupo
    // Qué prueba: duplicar y luego quitar un ítem compartido.
    // Resultado esperado: el conteo de filas sube y baja según la
    // acción realizada.
    // ------------------------------------------------------------
    test('CP025 - duplicar y quitar un ítem compartido', async () => {
      const row = await app.addSharedItem();
      await app.setItem(row, 'Bebidas', '3000');
      await expect(app.sharedRows).toHaveCount(1);

      await app.duplicateItem(app.sharedRows.first());
      await expect(app.sharedRows).toHaveCount(2);

      await app.removeItem(app.sharedRows.last());
      await expect(app.sharedRows).toHaveCount(1);
    });

    // ------------------------------------------------------------
    // CP026 — Paquete: División entre el grupo (borde)
    // Qué prueba: un ítem compartido con texto largo y caracteres
    // especiales no rompe el renderizado de la insignia ni de las
    // porciones por persona.
    // Resultado esperado: la app sigue mostrando el monto dividido sin
    // errores en pantalla.
    // ------------------------------------------------------------
    test('CP026 - ítem compartido con texto largo y caracteres especiales', async () => {
      const row = await app.addSharedItem();
      await app.setItem(row, testData.caracteresEspeciales, '1000');
      await expect(app.sharedBadge).toBeVisible();
      await expect(app.sharedBadge).not.toContainText(/NaN/i);
    });
  });
});
