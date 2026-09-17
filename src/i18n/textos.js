/**
 * Jib M3ak — todo lo que la app dice, en español y en darija.
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * La darija se escribe en árabe CON TASHKIL (las vocales cortas encima y debajo
 * de las letras), que es lo que se pidió: la darija no se escribe en los
 * colegios, así que sin vocales cuesta leerla; con ellas se lee en alto tal cual.
 * Los números se dejan en cifras occidentales, que son las que se usan en
 * Marruecos.
 *
 * Las dos tablas tienen exactamente las mismas claves y tests/textos.test.js lo
 * comprueba, junto con que ninguna frase en darija se quede sin tashkil.
 */

export const IDIOMAS = ['es', 'dar'];

export const DIRECCION = { es: 'ltr', dar: 'rtl' };

/** Cómo se llama cada idioma en su propia lengua (lo que enseña el botón). */
export const NOMBRE_IDIOMA = { es: 'Español', dar: 'الدَّارِجَة' };

export const TEXTOS = {
  es: {
    app: 'Jib M3ak',
    lema: 'La compra de la familia',

    pestanaArticulos: 'Artículos',
    pestanaCompra: 'Compra',

    anadirArticulo: 'Añadir artículo',
    buscar: 'Buscar artículo',
    sinResultados: 'No hay ningún artículo con ese nombre.',
    articulosVacios: 'Todavía no hay artículos.',
    articulosVaciosPista: 'Pulsa «Añadir artículo», haz la foto y ponle nombre.',
    anadirACompra: 'Añadir a la compra',
    yaEnCompra: 'Ya está en la compra',
    anadido: 'Añadido a la compra',
    eliminar: 'Eliminar artículo',

    compraVacia: 'La lista de la compra está vacía.',
    compraVaciaPista: 'Ve a «Artículos» y usa la flecha para añadir lo que falte.',
    porComprar: (n) => (n === 1 ? '1 artículo por comprar' : `${n} artículos por comprar`),
    todoComprado: 'Todo comprado',
    quitar: 'Quitar de la compra',

    vaciarTitulo: '¿Vaciar la lista de la compra?',
    vaciarTexto: 'Se borra para toda la familia. Los artículos siguen guardados.',
    vaciarSi: 'Sí, vaciar',
    borrarTitulo: (nombre) => `¿Eliminar «${nombre}»?`,
    borrarTexto: 'Desaparece de Artículos y de la compra, para toda la familia.',
    borrarSi: 'Sí, eliminar',
    cancelar: 'Cancelar',

    camaraTitulo: 'Haz una foto del artículo',
    hacerFoto: 'Hacer foto',
    cerrar: 'Cerrar',
    camaraNoVa: 'No se ha podido abrir la cámara aquí.',
    camaraPermiso: 'Da permiso a la cámara en los ajustes del navegador y vuelve a intentarlo.',
    camaraDelMovil: 'Usar la cámara del móvil',
    fotoError: 'No se ha podido preparar la foto. Inténtalo otra vez.',

    ponerNombre: 'Asigna un nombre a este artículo',
    nombreEjemplo: 'Ej.: Leche',
    nombreVacio: 'Escribe un nombre.',
    aceptar: 'OK',
    repetirFoto: 'Repetir foto',

    sinConexion: 'Sin conexión: se guarda aquí y se envía al volver.',
    enviando: 'Enviando cambios…',
    cargando: 'Cargando la lista…',
    errorConfig: 'Falta configurar Supabase (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY).',

    cambiarIdioma: 'Cambiar a darija',
    instalarTitulo: 'Ten la lista siempre a mano',
    instalarIphone: 'iPhone: Compartir → Añadir a pantalla de inicio.',
    instalarAndroid: 'Android: menú ⋮ → Instalar aplicación.',
    instalar: 'Instalar',
    ahoraNo: 'Ahora no',
  },

  dar: {
    app: 'جِيبْ مْعَاكْ',
    lema: 'التَّقْضِيَة دْيَالْ الْعَايْلَة',

    pestanaArticulos: 'الْحْوَايَجْ',
    pestanaCompra: 'التَّقْضِيَة',

    anadirArticulo: 'زِيدْ حَاجَة',
    buscar: 'قَلَّبْ عْلَى شِي حَاجَة',
    sinResultados: 'مَا لْقِيتْ حْتَّى حَاجَة بْهَادْ السْمِيَّة.',
    articulosVacios: 'مَازَالْ مَا كَايْنَة حْتَّى حَاجَة.',
    articulosVaciosPista: 'ضْغَطْ عْلَى «زِيدْ حَاجَة»، صَوَّرْهَا وْ عْطِيهَا سْمِيَّة.',
    anadirACompra: 'زِيدْهَا لِلتَّقْضِيَة',
    yaEnCompra: 'رَاهَا دَابَا فْ التَّقْضِيَة',
    anadido: 'تْزَادَتْ لِلتَّقْضِيَة',
    eliminar: 'مْسَحْ الْحَاجَة',

    compraVacia: 'لِيسْتَة دْ التَّقْضِيَة خَاوْيَة.',
    compraVaciaPista: 'سِيرْ لْ «الْحْوَايَجْ» وْ ضْغَطْ عْلَى السَّهْمْ بَاشْ تْزِيدْ اللِّي خَاصَّكْ.',
    porComprar: (n) => (n === 1 ? 'بَاقِي حَاجَة وَحْدَة' : `بَاقِينْ ${n} دْ الْحْوَايَجْ`),
    todoComprado: 'كُلْشِي تْشْرَى',
    quitar: 'حَيَّدْهَا مْنْ التَّقْضِيَة',

    vaciarTitulo: 'نْخَوِّيوْ لِيسْتَة دْ التَّقْضِيَة؟',
    vaciarTexto: 'غَادِي تْتْمْسَحْ عَنْدْ الْعَايْلَة كَامْلَة. الْحْوَايَجْ غَادِي يْبْقَاوْ مْحْفُوظِينْ.',
    vaciarSi: 'إِيَّهْ، خَوِّيهَا',
    borrarTitulo: (nombre) => `نْمْسْحُو «${nombre}»؟`,
    borrarTexto: 'غَادِي تْمْشِي مْنْ الْحْوَايَجْ وْ مْنْ التَّقْضِيَة، عَنْدْ الْعَايْلَة كَامْلَة.',
    borrarSi: 'إِيَّهْ، مْسَحْهَا',
    cancelar: 'بْلَاشْ',

    camaraTitulo: 'صَوَّرْ الْحَاجَة',
    hacerFoto: 'صَوَّرْ',
    cerrar: 'سَدّْ',
    camaraNoVa: 'مَا قْدَرْتْشْ نْحَلّْ الْكَامِيرَا هْنَا.',
    camaraPermiso: 'عْطِي الْإِذْنْ لِلْكَامِيرَا فْ الْإِعْدَادَاتْ دْ الْمُتَصَفِّحْ وْ عَاوْدْ جَرَّبْ.',
    camaraDelMovil: 'خْدَمْ بْكَامِيرَا التِّيلِيفُونْ',
    fotoError: 'مَا قْدَرْتْشْ نْوَجَّدْ التَّصْوِيرَة. عَاوْدْ جَرَّبْ.',

    ponerNombre: 'عْطِي سْمِيَّة لْهَادْ الْحَاجَة',
    nombreEjemplo: 'مَثَلًا: حْلِيبْ',
    nombreVacio: 'كْتْبْ شِي سْمِيَّة.',
    aceptar: 'وَاخَّا',
    repetirFoto: 'عَاوْدْ صَوَّرْ',

    sinConexion: 'مَا كَايْنْشْ الْأَنْتِرْنِيتْ: مْحْفُوظْ هْنَا وْ غَادِي يْتْصِيفَطْ مْنِينْ يْرْجَعْ.',
    enviando: 'كَانْصِيفْطُو التَّبْدِيلَاتْ…',
    cargando: 'كَانْجْبْدُو اللِّيسْتَة…',
    errorConfig: 'خَاصّْ تْكَمَّلْ الْإِعْدَادَاتْ دْ Supabase.',

    cambiarIdioma: 'بَدَّلْ لِلْإِسْبَانْيُولِيَة',
    instalarTitulo: 'خْلِّي اللِّيسْتَة دِيمَا فْ يَدَّكْ',
    // El iPhone enseña estos botones en el idioma del teléfono: van en árabe
    // y con el francés al lado, que es lo que suele estar puesto en Marruecos.
    instalarIphone: 'آيْفُونْ: «مُشَارَكَة» (Partager) ← «إِضَافَة إِلَى الشَّاشَة الرَّئِيسِيَّة».',
    instalarAndroid: 'أَنْدْرُويْدْ: مِينُو ⋮ ← «تْثْبِيتْ التَّطْبِيقْ» (Installer).',
    instalar: 'ثَبَّتْ',
    ahoraNo: 'مَاشِي دَابَا',
  },
};

/** Los textos del idioma pedido, con el español de reserva si falta alguno. */
export function textos(idioma) {
  return TEXTOS[idioma] ?? TEXTOS.es;
}
