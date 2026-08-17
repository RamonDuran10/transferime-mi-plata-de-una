// ============================================================
// global-setup.js — Estrategia de datos: Opción 1 (mockeado)
// Esta app no tiene backend propio, así que este archivo NO llama a
// ninguna API real. Solo valida que exista el dataset fijo de prueba
// (tests/e2e/fixtures/test-data.json) antes de correr los specs.
// ============================================================
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  const dataPath = path.join(__dirname, 'fixtures', 'test-data.json');
  if (!fs.existsSync(dataPath)) {
    throw new Error(
      'Falta tests/e2e/fixtures/test-data.json — el dataset de prueba es obligatorio (Estrategia: Opción 1 - mockeado).'
    );
  }
};
