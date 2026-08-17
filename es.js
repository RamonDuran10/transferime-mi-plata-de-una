// ─────────────────────────────────────────────────────
//  es.js — todos los textos de la interfaz, en un solo lugar.
//  Para agregar otro idioma: copia este archivo (ej. en.js) manteniendo
//  la misma forma (mismas claves), traduce los valores, y cambia el
//  <script src="es.js"> de index.html por el nuevo archivo.
// ─────────────────────────────────────────────────────
const T = {
  pageTitle: '¿Paga la wea?',

  header: {
    emoji: '🍻',
    title: '¿Paga la wea po´?'
  },

  usageCounter: {
    emoji: '🤝',
    suffix: n => `${n.toLocaleString('es-CL')} atados evitados por plata`
  },

  topbar: {
    totalPlaceholder: '¿Cuánto salió en total?',
    totalTitle: 'Anota la suma antes de que empiece el debate',
    currencyTitle: 'Moneda',
    currencyOptions: { CLP: '🇨🇱 CLP', USD: '🇺🇸 USD', ARS: '🇦🇷 ARS', EUR: '🇪🇺 EUR' },
    tipLabel: 'Propina',
    tipNone: 'nada',
    tipOptionTitle: pct => pct === 0 ? 'Sin propina' : `${pct}% de propina para los chiquillos`,
    share: '📤 ¡Mandar la cuenta!',
    shareTitle: 'Manda el resumen al grupo para ponerse al día',
    resetTitle: 'Borrar todo',
    shareFriends: '🔗 Compartir la app',
    shareFriendsTitle: 'Saca el QR o el link para los demás',
    confirmReset: '¿Empezar de cero? Se borra todo lo que llevamos 🗑️'
  },

  lock: {
    banner: '🔒 Todo listo y calado — solo lectura',
    edit: '✏️ Editar',
    editTitle: 'Desbloquear para cambiar algo'
  },

  receipt: {
    title: '🧾 La boleta',
    view: '👁️ Ver la boleta',
    closeTitle: 'Cerrar boleta'
  },

  shared: {
    title: '🍻 Para picar entre todos',
    badgeAll: '÷ todos',
    perUnit: 'c/u',
    columnWhat: '¿Qué se pidió para compartir?',
    columnPrice: 'Precio',
    namePlaceholder: 'ej. Las papas fritas',
    add: '+ Agregar para compartir',
    addTitle: 'Anotar algo para dividir entre todos',
    dupTitle: 'Duplicar',
    removeTitle: 'Quitar'
  },

  persona: {
    animalEmojis: ['🐵','🦊','🐼','🐸','🦁','🐮','🐧','🦄','🐝','🦋','🐨','🐢','🐙','🐰','🐯','🐷'],
    nicknamePlaceholders: ['¿Cómo le ponemos?', 'Apodo', '¿Quién es?', 'El de al lado', 'El hambriento 😅'],
    defaultNames: ['El misterio', 'El callado', 'El invitado', 'El socio', 'El caserito'],
    emojiTitle: 'Cambiar carita',
    removeTitle: 'Sacar',
    columnWhat: '¿Qué pidió?',
    columnPrice: 'Precio',
    itemPlaceholder: 'lo que se pidió',
    dupTitle: 'Duplicar',
    removeItemTitle: 'Quitar',
    addItem: '+ Otro pedido',
    addItemTitle: 'Agregar otro gasto a esta persona',
    addPersona: '+ Sumar a alguien',
    addPersonaTitle: 'Agregar a otra persona a la junta',
    sharedPortion: name => name ? `🍻 ${name}` : '🍻 Lo compartido'
  },

  summary: {
    title: '⚖️ El veredicto',
    empty: 'Suma a alguien a la mesa 👆',
    sharedLine: n => `🍻 Para compartir (${n} personas)`,
    perUnit: 'c/u',
    subtotalNoTip: 'Subtotal sin propina',
    tipLine: pct => `Propina (${pct}%)`,
    totalWithTip: 'Total con propina',
    totalNoTip: 'Total',
    noTotal: '⚠️ Pon el total arriba primero',
    ok: '✅ ¡Todo cuadra perfecto!',
    over: '↑ Se pasaron con la plata',
    under: '↓ Falta plata en la mesa',
    exceededBy: amt => `Se pasaron por ${amt} 😬`,
    missingBy: amt => `Faltan ${amt} — ¿alguien se olvidó de poner lo suyo?`
  },

  modal: {
    title: '📋 Detalle para compartir',
    closeTitle: 'Cerrar',
    copy: '📋 Copiar',
    copied: '✓ ¡Copiado!',
    relayLabel: '🔗 Link para que sigan agregando lo suyo',
    relayLabelTitle: 'Cualquiera que abra este link va a ver la cuenta hasta ahora y podrá sumar lo suyo',
    copyRelay: 'Copiar link',
    copiedRelay: '✓ ¡Copiado!',
    relayWarning: 'El link se está poniendo largo — igual funciona, pero conviene cerrar la cuenta pronto 😅',
    relayDone: '✅ La cuenta ya cuadra — no hace falta invitar a nadie más'
  },

  toast: {
    loaded: '📂 Cuenta cargada — ¡agrega lo tuyo y mándala de nuevo!',
    loadFailed: '⚠️ No se pudo leer el link — se restauró tu cuenta guardada',
    confirmOverwrite: '¿Cargar la cuenta de ese link? Se reemplaza lo que tienes ahora'
  },

  export: {
    header: '🍕 *Detalle de la cuenta*',
    subtotal: amt => `💰 Subtotal: ${amt}`,
    tip: (pct, amt) => `📊 Propina (${pct}%): +${amt}`,
    total: amt => `💵 Total final: ${amt}`,
    totalNoTip: amt => `💰 Total: ${amt}`,
    sharedHeader: n => `🍻 *Para compartir* (${n} personas):`,
    sharedItemDefault: 'Compartido',
    sharedItemLine: (label, tot, perPerson) => `  • ${label}: ${tot} en total → ${perPerson} c/u`,
    perPersonHeader: '👥 *Lo que le toca a cada uno:*',
    personLine: (name, rico, amt) => `👤 *${name}*${rico ? ' 😂' : ''}: ${amt}`,
    itemDefault: 'ítem',
    itemLine: (label, amt) => `  • ${label}: ${amt}`,
    sharedPersonLine: amt => `  • Su parte de lo compartido: ${amt}`,
    tipPersonLine: (pct, amt) => `  📊 Propina (${pct}%): +${amt}`,
    matches: '✅ ¡Cuadra perfecto, nadie se enoja 🎉',
    sum: amt => `Suma: ${amt}`
  },

  share: {
    pageTitle: 'Compartir — ¿Quién le debe a quién?',
    ribbon: 'CERO DRAMAS 🚀',
    title: '🍕 ¿Quién le debe a quién?',
    subtitle: 'Escanea, anota lo tuyo y paga lo justo sin enredos.',
    qrAlt: 'Código QR para abrir la app',
    url: 'transferime-mi-plata-de-una.vercel.app',
    copy: 'copiar',
    copied: '¡copiado!',
    copyTitle: 'Copiar el link de la app al portapapeles',
    pillFree: 'gratis',
    pillNoAccount: 'sin registro',
    pillFast: '3 segundos',
    back: '← Volver a la calculadora',
    backTitle: 'Volver a la calculadora principal',
    tagline: 'Pégalo en el chat del grupo o mándalo por interno. Funciona igual. 📎'
  }
};