// ─────────────────────────────────────────────────────
//  es.js — todos los textos de la interfaz, en un solo lugar.
//  Para agregar otro idioma: copia este archivo (ej. en.js) manteniendo
//  la misma forma (mismas claves), traduce los valores, y cambia el
//  <script src="es.js"> de index.html por el nuevo archivo.
// ─────────────────────────────────────────────────────
const T = {
  pageTitle: '¿Paga tu wea?',
  pageLoader: 'Cargando la wea...',

  header: {
    emoji: '🍻',
    title: '¿Paga tu wea po´?'
  },

  usageCounter: {
    emoji: '🤝',
    suffix: n => `${n.toLocaleString('es-CL')} reuniones sin problemas`
  },

  topbar: {
    totalPlaceholder: '¿Cuánto salió en total?',
    totalTitle: 'Anota la suma antes de que empiece el debate',
    currencyTitle: 'Moneda',
    currencyOptions: { CLP: '🇨🇱 CLP', USD: '🇺🇸 USD', ARS: '🇦🇷 ARS', EUR: '🇪🇺 EUR' },
    tipLabel: 'Propina',
    tipNone: 'nada',
    tipOptionTitle: pct => pct === 0 ? 'Sin propina' : `${pct}% de propina para los chiquillos`,
    share: '📤 ¡Publicar/compartir detalle!',
    shareTitle: 'Manda el resumen al grupo para ponerse al día',
    resetTitle: 'Borrar todo',
    shareFriends: '🔗 Compartir la app',
    shareFriendsTitle: 'Saca el QR o el link para los demás',
    createAccount: '✨ Crear cuenta',
    createAccountTitle: 'Arranca aquí: activa el formulario para sumar gente y anotar gastos',
    confirmReset: '¿Empezar de cero? Se borra todo lo que llevamos 🗑️',
    confirmCurrencyChange: 'Cambiar de moneda borra los montos que ya escribiste (no se convierten automáticamente, para no calcular mal). ¿Continuar?'
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
    nicknamePlaceholders: ['¿Cómo le ponemos?', 'Apodo', '¿Quién es?', 'El gordito', 'El hambriento','el mojojo'],
    defaultNames: ['El misterio', 'El callado', 'El invitado', 'El socio', 'El caserito'],
    emojiTitle: 'Cambiar carita',
    removeTitle: 'Sacar',
    confirmRemove: name => `¿Sacar a ${name} del grupo? Se borran sus pedidos`,
    removeConfirmFallbackName: 'esta persona',
    needNameBeforeAdding: 'Ponle nombre.. ¿como le vas a cobrar despues? 🙏',
    readonlyTitle: 'Solo lectura — cada quien controla lo suyo',
    markPaidTitle: '👑 Marcar como quien pagó la cuenta',
    unmarkPaidTitle: 'Quitar la corona',
    paidBadge: '👑 Pagó',
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
    detailSummary: '📋 Ver detalle del reparto',
    doneTitle: '🎉 ¡Listo, quedó la cuenta lista!',
    doneSubtitle: 'Hicimos lo que pudimos — si aun así no te pagan, ya no es cosa nuestra 😂🤷'
  },

  info: {
    buttonTitle: '¿Cómo funciona?',
    title: '🤔 ¿Cómo se juega esto?',
    steps: [
      '✨ Toca "Crear cuenta" (arriba) para activar el formulario.',
      '💰 Anota el total de la boleta, elige la moneda y métele propina si cae.',
      '🐵 Suma a la gente con "+ Sumar al grupo" y anota lo que pidió cada uno (o algo pa\' compartir entre todos, arriba).',
      '🔴 Toca "Poner esta cuenta en vivo" y publícala — así el resto escanea el QR y agrega lo que consumió sin que tú tengas que anotarlo.',
      '✅ Cuando el veredicto cuadre, copia el detalle y mándalo al grupo — pa\' que te paguen al tiro jaja.'
    ]
  },

  dialog: {
    confirmTitle: '⚠️ Confirma esto',
    infoTitle: '👀 Ojito',
    ok: 'Ya, dale',
    cancel: 'Mejor no'
  },

  install: {
    androidMessage: '📲 Instálala en tu celular pa\' tenerla siempre a mano',
    androidButton: 'Instalar',
    iosMessage: '📲 Tenla siempre a mano: toca el ícono ⬆️ de Compartir de Safari (no el de esta app) y busca "Agregar a inicio"'
  },

  live: {
    goLiveButton: '🔴 Poner esta cuenta en vivo',
    goLiveLoading: 'Publicando...',
    goLiveHint: 'Vamos a compartir esta cuenta en el momento — cualquiera con el link o el QR puede sumar lo suyo altiro',
    goLiveFailed: 'No se pudo poner la cuenta en vivo — inténtalo de nuevo',
    qrAlt: 'Código QR para unirse a esta cuenta en vivo',
    linkLabel: '🔗 Link para unirse en vivo',
    copyLink: 'Copiar link',
    copiedLink: '✓ ¡Copiado!',
    participants: n => `${n} persona${n === 1 ? '' : 's'} conectada${n === 1 ? '' : 's'}`,
    closeSessionButton: '🔒 Cerrar sesión',
    confirmCloseSession: '¿Seguro que quieres cerrar esta sesión en vivo? Nadie más va a poder sumar cosas',
    hostBanner: '🔴 Cuenta publicada — comparte el QR para que sumen lo suyo',
    bannerLive: name => `🔴 Cuenta publicada — cuenta de ${name || 'quien la creó'}`,
    joinButton: '➕ Sumarme',
    joining: 'Uniéndote...',
    joinFailed: 'No se pudo sumar a la sesión — inténtalo de nuevo',
    sessionExpired: '⌛ Esta sesión ya no existe (o expiró) — se abrió tu cuenta normal',
    sessionClosed: '🔒 El que creó la cuenta la cerró — ya no se puede seguir sumando',
    leaveSession: 'Salir',
    confirmLeaveSession: '¿Salir de esta sesión en vivo? Puedes volver a entrar con el mismo link',
    offlineBanner: '⚠️ Sin conexión — reintentando...',
    balancedNote: '🎉 ¡Ya cuadró! Cierra la sesión cuando quieran'
  },

  export: {
    header: '🍕 *Detalle de la cuenta*',
    subtotal: amt => `💰 Subtotal: ${amt}`,
    tip: (pct, amt) => `📊 Propina (${pct}%): +${amt}`,
    total: amt => `💵 Total final: ${amt}`,
    paidBy: name => `👑 Pagó la cuenta: ${name}`,
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