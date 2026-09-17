/**
 * Jib M3ak — el traductor de nombres de artículos (español ⇄ darija).
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * Los nombres los escribe la familia, así que no hay servicio de traducción que
 * valga: aquí dentro va una compra marroquí-española entera, y se traduce en
 * los dos sentidos sin conexión, sin cuentas y sin pagar nada.
 *
 * Dos piezas:
 *   1. Un diccionario de la compra (sustantivos y modificadores) escrito con
 *      TASHKIL, contrastado con las fuentes abiertas que existen para la darija
 *      (Darija Open Dataset y las etiquetas `ary` de Wikidata; ver README).
 *   2. Un pequeño compositor de frases: «zumo de naranja», «leche sin lactosa»
 *      o «carne picada» no caben en ninguna lista, pero sí se arman palabra a
 *      palabra, que es justo como funciona la darija («3sir d limoun»).
 *
 * Lo que no se entiende entero NO se traduce a medias: se enseña tal y como se
 * escribió. Una marca («Colacao») se lee igual en los dos idiomas, y para lo
 * demás está la foto.
 */

import { transcribir } from './transliteracion.js';

// ───────────────────────── Sustantivos ─────────────────────────
// [español (singular), darija con tashkil, género español/darija, ...otras formas]
// El género hace falta para concordar los adjetivos en los dos idiomas:
// «manzana verde» → «تُفَّاحْ خْضَرْ», «matecha hamra» → «tomate rojo».

const SUSTANTIVOS = [
  // Fruta
  ['Manzana', 'تُفَّاحْ', 'f/m'],
  ['Plátano', 'بَنَانْ', 'm/m', 'banana'],
  ['Naranja', 'لِيمُونْ', 'f/m'],
  ['Limón', 'حَامَضْ', 'm/m'],
  ['Mandarina', 'مَنْدَرِينْ', 'f/m'],
  ['Uva', 'عْنَبْ', 'f/m'],
  ['Fresa', 'فْرِيزْ', 'f/m', 'توت'],
  ['Sandía', 'دَلَّاحْ', 'f/m'],
  ['Melón', 'بَطِّيخْ', 'm/m'],
  ['Pera', 'بُوعْوِيدْ', 'f/m', 'لنجاص'],
  ['Melocotón', 'خُوخْ', 'm/m'],
  ['Albaricoque', 'مْشْمَاشْ', 'm/m'],
  ['Ciruela', 'بَرْقُوقْ', 'f/m'],
  ['Cereza', 'حَبّْ الْمْلُوكْ', 'f/m'],
  ['Higo', 'كَرْمُوسْ', 'm/m'],
  ['Granada', 'رَمَّانْ', 'f/m'],
  ['Dátil', 'تْمَرْ', 'm/m'],
  ['Aguacate', 'أَفُوكَا', 'm/f'],
  ['Kiwi', 'كِيوِي', 'm/m'],
  ['Piña', 'أَنَانَاسْ', 'f/m'],
  ['Mango', 'مَانْݣُو', 'm/m'],
  ['Fruta', 'فَاكِهَة', 'f/f'],

  // Verdura
  ['Tomate', 'مَاطِيشَة', 'm/f'],
  ['Cebolla', 'بْصْلَة', 'f/f'],
  ['Patata', 'بَطَاطَا', 'f/f', 'papa'],
  ['Zanahoria', 'خِيزُّو', 'f/m', 'زرودية'],
  ['Pimiento', 'فَلْفْلَة', 'm/f'],
  ['Ajo', 'تُومَة', 'm/f', 'ثومة'],
  ['Lechuga', 'خَسّْ', 'f/m'],
  ['Ensalada', 'شْلَاضَة', 'f/f'],
  ['Pepino', 'خْيَارْ', 'm/m'],
  ['Berenjena', 'بْدَنْجَالْ', 'f/m'],
  ['Calabacín', 'كُورْجِيطْ', 'm/m'],
  ['Calabaza', 'قَرْعَة حَمْرَا', 'f/f'],
  ['Judía verde', 'لُوبْيَا خَضْرَا', 'f/f', 'judias verdes'],
  ['Guisante', 'جَلْبَانَة', 'm/f'],
  ['Cilantro', 'قَزْبُورْ', 'm/m'],
  ['Perejil', 'مَعْدْنُوسْ', 'm/m'],
  ['Hierbabuena', 'نَعْنَاعْ', 'f/m', 'menta'],
  ['Champiñón', 'شَامْبِينْيُونْ', 'm/m'],
  ['Acelga', 'سَلْقْ', 'f/m'],
  ['Espinaca', 'سْبَانَخْ', 'f/m'],
  ['Coliflor', 'شِيفْلُورْ', 'f/m'],
  ['Repollo', 'مْكَوَّرْ', 'm/m', 'col'],
  ['Brócoli', 'بْرُوكُولِي', 'm/m'],
  ['Nabo', 'لَفْتْ', 'm/m'],
  ['Rábano', 'فْجَلْ', 'm/m'],
  ['Remolacha', 'بَارْبَا', 'f/f'],
  ['Apio', 'كْرَافَصْ', 'm/m'],
  ['Hinojo', 'بْسْبَاسْ', 'm/m'],
  ['Alcachofa', 'قُوقْ', 'f/m'],
  ['Maíz', 'كْبَالْ', 'm/m'],
  ['Aceituna', 'زِيتُونْ', 'f/m', 'oliva'],
  ['Verdura', 'خْضْرَة', 'f/f', 'verduras'],

  // Carne y pescado
  ['Pollo', 'دْجَاجْ', 'm/m'],
  ['Carne', 'لْحَمْ', 'f/m'],
  ['Carne picada', 'كَفْتَة', 'f/f', 'kefta'],
  ['Cordero', 'لْحَمْ الْغْنَمْ', 'm/m'],
  ['Ternera', 'لْحَمْ الْبَقْرِي', 'f/m'],
  ['Hígado', 'كَبْدَة', 'm/f'],
  ['Pavo', 'بِيبِي', 'm/m'],
  ['Conejo', 'قْنِيَّة', 'm/f'],
  ['Salchicha', 'صُوصِيصْ', 'f/m'],
  ['Merguez', 'مِرْݣِيزْ', 'f/m'],
  ['Pescado', 'حُوتْ', 'm/m'],
  ['Sardina', 'سَرْدِينْ', 'f/m'],
  ['Atún', 'طُونْ', 'm/m'],
  ['Gamba', 'كْرِيفِيتْ', 'f/m'],
  ['Calamar', 'كَالَامَارْ', 'm/m'],
  ['Huevo', 'بِيضْ', 'm/m'],

  // Lácteos
  ['Leche', 'حْلِيبْ', 'f/m'],
  ['Yogur', 'دَانُونْ', 'm/m', 'yogurt', 'ياغورت'],
  ['Queso', 'فْرُومَاجْ', 'm/m', 'فرماج'],
  ['Mantequilla', 'زُبْدَة', 'f/f'],
  ['Nata', 'لَاكْرِيمْ', 'f/f'],
  ['Leche fermentada', 'لْبَنْ', 'f/m', 'lben', 'raib'],

  // Pan y cereales
  ['Pan', 'خُبْزْ', 'm/m'],
  ['Baguette', 'كُومِيرَة', 'f/f', 'barra de pan'],
  ['Harina', 'فَارِينَة', 'f/f', 'طحين', 'دقيق'],
  ['Sémola', 'سْمِيدَة', 'f/f'],
  ['Levadura', 'خْمِيرَة', 'f/f'],
  ['Masa', 'عْجِينَة', 'f/f'],
  ['Msemen', 'مْسَمَّنْ', 'm/m'],
  ['Pan rallado', 'شَابِيلْ', 'm/m'],
  ['Galleta', 'بِيشْكِيطُو', 'f/m'],
  ['Bizcocho', 'كِيكَة', 'm/f', 'tarta', 'pastel'],
  ['Trigo', 'قْمَحْ', 'm/m'],
  ['Cebada', 'شْعِيرْ', 'f/m'],
  ['Arroz', 'رُوزْ', 'm/m'],
  ['Pasta', 'مَقَارُونِي', 'f/m', 'macarrones'],
  ['Fideo', 'شْعِيرِيَّة', 'm/f'],
  ['Cuscús', 'كْسْكْسُو', 'm/m', 'cuscus', 'سكسو'],

  // Legumbres y frutos secos
  ['Lenteja', 'عْدَسْ', 'f/m'],
  ['Garbanzo', 'حَمَّصْ', 'm/m'],
  ['Alubia', 'لُوبْيَا', 'f/f', 'judia', 'frijol'],
  ['Haba', 'فُولْ', 'f/m'],
  ['Almendra', 'لُوزْ', 'f/m'],
  ['Nuez', 'ݣَرْݣَاعْ', 'f/m'],
  ['Cacahuete', 'كَاوْكَاوْ', 'm/m'],
  ['Pasa', 'زْبِيبْ', 'f/m'],
  ['Frutos secos', 'فَاكْيَة', 'm/f'],
  ['Sésamo', 'جَنْجْلَانْ', 'm/m', 'sesamo'],

  // Despensa
  ['Aceite', 'زِيتْ', 'm/m'],
  ['Aceite de oliva', 'زِيتْ الْعُودْ', 'm/m'],
  ['Aceite de argán', 'زِيتْ أَرْݣَانْ', 'm/m', 'argan'],
  ['Vinagre', 'الْخَلّْ', 'm/m'],
  ['Sal', 'مَلْحَة', 'f/f'],
  ['Azúcar', 'سُكَّرْ', 'm/m'],
  ['Miel', 'عْسَلْ', 'f/m'],
  ['Mermelada', 'كُونْفِيتُورْ', 'f/f', 'confitura'],
  ['Chocolate', 'شُوكُولَا', 'm/f'],
  ['Caramelo', 'سَقَّاطَة', 'm/f', 'chuche', 'golosina'],
  ['Chicle', 'مْسْكَة', 'm/f'],
  ['Mayonesa', 'مَايُونِيزْ', 'f/f'],
  ['Kétchup', 'كِيتْشَابْ', 'm/m', 'ketchup'],
  ['Mostaza', 'مُوطَارْدْ', 'f/f'],
  ['Pastilla de caldo', 'كْنُورْ', 'f/m', 'caldo', 'avecrem'],
  ['Sopa', 'حْرِيرَة', 'f/f', 'harira'],
  ['Tajín', 'طَاجِينْ', 'm/m', 'tajine'],
  ['Pastela', 'بَسْطِيلَة', 'f/f', 'bastila'],
  ['Patatas fritas', 'بَطَاطَا فْرِيتْ', 'f/f', 'patata frita'],
  ['Pizza', 'بِيتْزَا', 'f/f'],
  ['Hielo', 'تَلْجْ', 'm/m'],

  // Especias
  ['Especias', 'عْطْرِيَة', 'f/f'],
  ['Comino', 'كَمُّونْ', 'm/m'],
  ['Pimentón', 'تَحْمِيرَة', 'm/f'],
  ['Pimienta', 'بْزَارْ', 'f/m'],
  ['Canela', 'قَرْفَة', 'f/f'],
  ['Jengibre', 'سْكِينْجْبِيرْ', 'm/m'],
  ['Cúrcuma', 'خَرْقُومْ', 'f/m', 'curcuma'],
  ['Azafrán', 'زَعْفْرَانْ', 'm/m', 'azafran'],
  ['Clavo', 'قْرُنْفَلْ', 'm/m'],
  ['Tomillo', 'زَعْتَرْ', 'm/m'],
  ['Ras el hanout', 'رَاسْ الْحَانُوتْ', 'm/m'],
  ['Laurel', 'وَرْقَة سِيدْنَا مُوسَى', 'm/f'],
  ['Agua de azahar', 'مَا الزَّهْرْ', 'f/m'],

  // Bebidas
  ['Agua', 'الْمَا', 'f/m'],
  ['Zumo', 'عْصِيرْ', 'm/m', 'jugo'],
  ['Refresco', 'مُونَادَا', 'm/f'],
  ['Té', 'أَتَايْ', 'm/m'],
  ['Café', 'قَهْوَة', 'm/f'],
  ['Bebida', 'شْرَابْ', 'f/m'],

  // Limpieza y casa
  ['Jabón', 'صَابُونْ', 'm/m', 'jabon'],
  ['Detergente', 'صَابُونْ التَّصْبِينْ', 'm/m'],
  ['Lavavajillas', 'صَابُونْ الْمْوَاعَنْ', 'm/m'],
  ['Lejía', 'جَافِيلْ', 'f/m', 'lejia'],
  ['Papel higiénico', 'كَاغِيطْ الطُّوَالِيتْ', 'm/m', 'papel higienico'],
  ['Papel de cocina', 'كَاغِيطْ الْكُوزِينَة', 'm/m'],
  ['Papel de aluminio', 'كَاغِيطْ الْأَلِيمِينْيُومْ', 'm/m', 'aluminio', 'papel de plata'],
  ['Servilleta', 'سَرْبِيطَة', 'f/f'],
  ['Pañuelos', 'كْلِينِيكْسْ', 'm/m', 'panuelos', 'kleenex'],
  ['Bolsa de basura', 'مِيكَا دْ الزْبَلْ', 'f/f', 'bolsas de basura'],
  ['Basura', 'الزْبَلْ', 'f/m'],
  ['Bolsa', 'سَاشِي', 'f/m'],
  ['Esponja', 'سْبُونْجْ', 'f/m'],
  ['Escoba', 'شَطَّابَة', 'f/f'],
  ['Cerillas', 'زَالَامِيطْ', 'f/f', 'cerilla'],
  ['Mechero', 'بْرِيكِي', 'm/m'],
  ['Vela', 'شْمْعَة', 'f/f'],
  ['Bombilla', 'بُولَامْبَة', 'f/f'],

  // Higiene y bebé
  ['Champú', 'شَامْبْوَانْ', 'm/m', 'champu'],
  ['Gel de ducha', 'جِيلْ دُوشْ', 'm/m'],
  ['Pasta de dientes', 'مَعْجُونْ السْنَانْ', 'f/m', 'dentifrico'],
  ['Cepillo de dientes', 'بْرُوسَة دْ السْنَانْ', 'm/f'],
  ['Desodorante', 'دِيُودُورَانْ', 'm/m'],
  ['Colonia', 'رِيحَة', 'f/f', 'perfume'],
  ['Crema', 'كْرِيمَة', 'f/f'],
  ['Maquinilla', 'جِيلِيتْ', 'f/f', 'cuchillas'],
  ['Compresas', 'سَرْفْيِيتْ', 'f/f', 'compresa'],
  ['Pañales', 'كُوشَاتْ', 'm/m', 'panales', 'pañal'],

  // Carnicería con detalle
  ['Pechuga', 'صْدَرْ', 'f/m'],
  ['Muslo', 'فْخَادْ', 'm/m'],
  ['Filete', 'سْتِيكْ', 'm/m'],
  ['Albóndigas', 'كْوِيرَاتْ', 'f/f', 'albondiga'],
  ['Caracoles', 'بَبُّوشْ', 'm/m', 'caracol'],

  // Más despensa
  ['Cereales', 'سِيرِيَالْ', 'm/m'],
  ['Avena', 'شُوفَانْ', 'f/m'],
  ['Cacao', 'كَاكَاوْ', 'm/m'],
  ['Flan', 'فْلَانْ', 'm/m'],
  ['Margarina', 'مَارْݣَارِينْ', 'f/f'],
  ['Girasol', 'عَبَّادْ الشَّمْسْ', 'm/m'],
  ['Pipas', 'زْرِيعَة', 'f/f'],
  ['Coco', 'كُوكُو', 'm/m'],
  ['Membrillo', 'سْفَرْجَلْ', 'm/m'],
  ['Bicarbonato', 'بِيكَرْبُونَاتْ', 'm/m'],
  ['Pan de molde', 'خُبْزْ الطُّوسْطْ', 'm/m', 'pan de sandwich'],
  ['Tostadas', 'طُوسْطْ', 'f/m', 'tostada'],
  // Lo que se lee en las etiquetas: «leche sin lactosa», «pollo sin hueso»
  ['Lactosa', 'لَاكْتُوزْ', 'f/m'],
  ['Gluten', 'جْلُوتَانْ', 'm/m'],
  ['Hueso', 'عْظَمْ', 'm/m'],
  ['Grasa', 'دْهَنْ', 'f/m'],

  // Más limpieza e higiene
  ['Bayeta', 'شِيفُونْ', 'f/m'],
  ['Estropajo', 'سْكُوتْشْ', 'm/m'],
  ['Suavizante', 'أَدُوسِيسَانْ', 'm/m'],
  ['Guantes', 'ݣْوَانْطْ', 'm/m', 'guante'],
  ['Pilas', 'بِيلَاتْ', 'f/f', 'pila'],
  ['Toallitas', 'لَانْجِيتْ', 'f/f', 'toallita'],
  ['Biberón', 'بِيبِرُونْ', 'm/m', 'biberon'],
  ['Chupete', 'سُوسَة', 'm/f'],
  ['Carbón', 'فَحَمْ', 'm/m', 'carbon'],
  ['Bombona de gas', 'بُوطَاݣَازْ', 'f/m', 'butano'],

  // Lo que apareció faltando al probar una compra de verdad
  ['Helado', 'لَاݣْلَاسْ', 'm/m'],
  ['Vainilla', 'فَانِيلَا', 'f/f'],
  ['Salsa', 'صَالْصَة', 'f/f'],
  ['Lonchas', 'شْرَايَحْ', 'f/f', 'loncha', 'rodajas'],
  ['Horno', 'الْفُرْنْ', 'm/m'],
  ['Papel', 'كَاغِيطْ', 'm/m'],
  ['Congelación', 'التَّجْمِيدْ', 'f/m', 'congelacion'],
  ['Polvo', 'بُودْرَة', 'm/f'],
  ['Palomitas', 'بُوفْرِيوَة', 'f/f'],
  ['Pita', 'بِيتَا', 'f/f'],
  ['Café soluble', 'نِسْكَافِي', 'm/m', 'nescafe'],
  ['Maicena', 'مَايْزِينَا', 'f/f'],
  ['Mortadela', 'مُورْتَادِيلَا', 'f/f'],
  ['Lasaña', 'لَازَانْيَا', 'f/f', 'lasana'],
  ['Espaguetis', 'سْبَاݣِيتِي', 'm/m', 'espagueti'],
  ['Harissa', 'هَرِيسَة', 'f/f'],
  ['Amlou', 'أَمْلُو', 'm/m'],
  ['Smen', 'السْمَنْ', 'm/m'],
  ['Briouat', 'بْرِيوَاتْ', 'm/m'],

  // Cantidades y envases (para que «2 kg de tomates» salga entero)
  ['Kilo', 'كِيلُو', 'm/m', 'kg'],
  ['Litro', 'لِيتْرْ', 'm/m', 'l'],
  ['Gramo', 'ݣْرَامْ', 'm/m', 'g'],
  ['Paquete', 'بَاكِي', 'm/m'],
  ['Caja', 'صَنْدُوقْ', 'f/m'],
  ['Lata', 'عُلْبَة', 'f/f', 'bote'],
  ['Botella', 'قَرْعَة', 'f/f'],
  ['Docena', 'طُوزِينَة', 'f/f'],
];

// ───────────────────────── Modificadores ─────────────────────────
// [español masculino/femenino, darija masculino/femenino]
// Los invariables (una sola forma) se escriben sin barra.

const MODIFICADORES = [
  ['rojo/roja', 'حْمَرْ/حَمْرَا'],
  ['verde', 'خْضَرْ/خَضْرَا'],
  ['blanco/blanca', 'بْيَضْ/بَيْضَا'],
  ['negro/negra', 'كْحَلْ/كَحْلَة'],
  ['amarillo/amarilla', 'صْفَرْ/صَفْرَا'],
  ['grande', 'كْبِيرْ/كْبِيرَة'],
  ['pequeño/pequeña', 'صْغِيرْ/صْغِيرَة'],
  ['fresco/fresca', 'طْرِي/طْرِيَّة'],
  ['congelado/congelada', 'مْجَمَّدْ/مْجَمْدَة'],
  ['seco/seca', 'نَاشَفْ/نَاشْفَة'],
  ['molido/molida', 'مَطْحُونْ/مَطْحُونَة'],
  ['picado/picada', 'مْفَرَّمْ/مْفَرْمَة'],
  ['rallado/rallada', 'مْبَشُّورْ/مْبَشُّورَة'],
  ['entero/entera', 'كَامَلْ/كَامْلَة'],
  ['integral', 'كَامَلْ/كَامْلَة'],
  ['desnatado/desnatada', 'بْلَا دْهَنْ'],
  ['dulce', 'حْلُو/حْلْوَة'],
  ['salado/salada', 'مَالَحْ/مَالْحَة'],
  ['picante', 'حَارّْ/حَارَّة'],
  ['amargo/amarga', 'مَرّْ/مَرَّة'],
  ['frito/frita', 'مَقْلِي/مَقْلِيَّة'],
  ['asado/asada', 'مْحَمَّرْ/مْحَمْرَة'],
  ['a la plancha', 'مَشْوِي/مَشْوِيَّة'],
  ['cocido/cocida', 'مَطْيُوبْ/مَطْيُوبَة'],
  ['crudo/cruda', 'نِي/نِيَّة'],
  ['caliente', 'سْخُونْ/سْخُونَة'],
  ['frío/fría', 'بَارَدْ/بَارْدَة'],
  ['natural', 'طَبِيعِي/طَبِيعِيَّة'],
  ['mineral', 'مِينِيرَالْ'],
  ['ecológico/ecológica', 'بِيُو'],
  ['barato/barata', 'رْخِيصْ/رْخِيصَة'],
  ['condensado/condensada', 'مْكَثَّفْ/مْكَثْفَة'],
  ['evaporado/evaporada', 'مْبَخَّرْ/مْبَخْرَة'],
  ['líquido/líquida', 'سَائِلْ/سَائْلَة'],
  ['concentrado/concentrada', 'مْرَكَّزْ/مْرَكْزَة'],
  ['relleno/rellena', 'مْعَمَّرْ/مْعَمْرَة'],
  ['triturado/triturada', 'مَطْحُونْ/مَطْحُونَة'],
  ['campero/campera', 'بَلْدِي/بَلْدِيَّة', 'de corral'],
  ['light', 'لَايْتْ'],
  ['semidesnatado/semidesnatada', 'نُصّْ دْهَنْ'],
  ['griego/griega', 'يُونَانِي/يُونَانِيَّة'],
  ['marroquí', 'مْغْرِبِي/مْغْرِبِيَّة', 'marroqui'],
  ['español/española', 'إِسْبَانْيُولِي/إِسْبَانْيُولِيَّة', 'espanol'],
  ['francés/francesa', 'فْرَانْسَاوِي/فْرَانْسَاوِيَّة', 'frances'],
  ['casero/casera', 'دْيَالْ الدَّارْ'],
];

// Palabras de enlace: en darija el «de» es دْ, y encaja igual que en español.
const CONECTORES = {
  es: { de: 'دْ', del: 'دْ', sin: 'بْلَا', con: 'بْ', en: 'فْ', para: 'لْ', y: 'وْ', al: 'لْ' },
  dar: { 'د': 'de', 'ديال': 'de', 'بلا': 'sin', 'ب': 'con', 'ف': 'en', 'ل': 'para', 'و': 'y' },
};

// Artículos que se tiran al comparar: «la leche» y «leche» son lo mismo.
const ARTICULOS_ES = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas']);

const TASHKIL = /[\u064B-\u0652\u0670\u0640]/g;

/** Deja una palabra árabe comparable: sin vocales, sin «ال» y con las letras que bailan unificadas. */
export function normalizarArabe(texto) {
  return texto
    .replace(TASHKIL, '')
    .replace(/[\u0623\u0625\u0622\u0671]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/[\u0763\u06AF]/g, 'ك') // las dos «gaf» de la darija se escriben de varias formas
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^ال/, '')
    .trim();
}

/** Deja una palabra española comparable: minúsculas, sin tildes y sin artículo. */
export function normalizarEspanol(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[^a-z0-9ñ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((palabra, i, todas) => !(i === 0 && todas.length > 1 && ARTICULOS_ES.has(palabra)))
    .join(' ');
}

/**
 * Singular y plural de lo escrito, para buscar en el diccionario. En vez de
 * inventar una raíz («tomates» → «tomat») se prueban las formas enteras: es lo
 * que salva a «limón/limones» y a «tomate/tomates» a la vez.
 */
const variantes = (clave) => [
  clave,
  `${clave}s`,
  `${clave}es`,
  clave.replace(/es$/, ''),
  clave.replace(/s$/, ''),
];

export const esArabe = (texto) => /[\u0600-\u06FF]/.test(texto ?? '');

/** El idioma en el que está escrito un nombre, mirando el alfabeto. */
export const idiomaDe = (nombre) => (esArabe(nombre) ? 'dar' : 'es');

const normalizar = (texto, idioma) => (idioma === 'dar' ? normalizarArabe(texto) : normalizarEspanol(texto));

export const ARTICULOS_CONOCIDOS = SUSTANTIVOS.map(([es, dar, genero]) => {
  const [ges, gdar] = genero.split('/');
  return { es, dar, ges, gdar };
});

// Índice único: de cualquier forma escrita (en cualquiera de los dos idiomas) a
// su pareja. Se construye una vez al cargar el módulo.
const INDICE = new Map();
for (const [i, [es, dar, , ...alias]] of SUSTANTIVOS.entries()) {
  const pareja = ARTICULOS_CONOCIDOS[i];
  const claves = [normalizarEspanol(es), normalizarArabe(dar)];
  for (const forma of alias) claves.push(normalizar(forma, idiomaDe(forma)));
  for (const clave of claves) if (clave && !INDICE.has(clave)) INDICE.set(clave, pareja);
}

/** Las dos formas (masculina y femenina) de un modificador, en cada idioma. */
const formas = (texto) => {
  const [m, f] = texto.split('/');
  return { m, f: f ?? m };
};

const MODIFICADOR_ES = new Map();
const MODIFICADOR_DAR = new Map();
for (const [espanol, darija] of MODIFICADORES) {
  const es = formas(espanol);
  const dar = formas(darija);
  for (const forma of new Set([es.m, es.f])) MODIFICADOR_ES.set(normalizarEspanol(forma), { es, dar });
  for (const forma of new Set([dar.m, dar.f])) {
    const clave = normalizarArabe(forma);
    if (!MODIFICADOR_DAR.has(clave)) MODIFICADOR_DAR.set(clave, { es, dar });
  }
}

/**
 * Busca un nombre entero en el diccionario. Devuelve `{ es, dar, ges, gdar }`
 * o null. Da igual cómo se escriba: «LECHES», «leche» o «الحليب» son la misma.
 */
export function traducir(nombre) {
  if (!nombre) return null;
  const idioma = idiomaDe(nombre);
  const clave = normalizar(nombre, idioma);
  if (!clave) return null;
  if (idioma === 'dar') return INDICE.get(clave) ?? null;
  for (const forma of variantes(clave)) {
    const pareja = INDICE.get(forma);
    if (pareja) return pareja;
  }
  return null;
}

const esNumero = (palabra) => /^\d+([.,]\d+)?$/.test(palabra);

/**
 * Arma la traducción palabra a palabra cuando el nombre entero no está en el
 * diccionario: «zumo de naranja» → «عْصِيرْ دْ لِيمُونْ».
 *
 * Lo que no conoce no lo deja en el otro alfabeto: lo TRANSCRIBE (ver
 * transliteracion.js). En esta familia hay quien solo lee árabe, y «Nocilla»
 * en letras latinas no lo puede ni deletrear; escrito «نُوسِيَا» lo lee en alto
 * y lo reconoce, que es de lo que se trata.
 */
export function componer(nombre, idioma) {
  const escrito = (nombre ?? '').trim();
  const origen = idiomaDe(escrito);
  if (!escrito || origen === idioma) return null;

  const palabras = escrito.split(/\s+/).filter(Boolean);
  if (!palabras.length) return null;

  const conectores = CONECTORES[origen];
  const salida = [];
  let generoCabeza = null;

  for (const palabra of palabras) {
    const limpia = normalizar(palabra, origen);
    // Cantidades, símbolos y emojis (0%, 5L, ☕) se leen igual en los dos
    // idiomas: se copian tal cual, sin pasar por la limpieza.
    if (!limpia || esNumero(limpia)) { salida.push({ texto: palabra }); continue; }

    const conector = conectores[limpia];
    if (conector) { salida.push({ texto: conector, delDiccionario: true }); continue; }

    const sustantivo = origen === 'es'
      ? variantes(limpia).map((forma) => INDICE.get(forma)).find(Boolean)
      : INDICE.get(limpia);
    if (sustantivo) {
      // El primer sustantivo manda: es el que concuerda con los adjetivos.
      if (!generoCabeza) generoCabeza = idioma === 'dar' ? sustantivo.gdar : sustantivo.ges;
      salida.push({ texto: sustantivo[idioma], delDiccionario: true });
      continue;
    }

    // Los adjetivos también vienen en plural: «sardinas frescas».
    const modificador = origen === 'es'
      ? variantes(limpia).map((forma) => MODIFICADOR_ES.get(forma)).find(Boolean)
      : MODIFICADOR_DAR.get(limpia);
    if (modificador) {
      salida.push({ texto: modificador[idioma][generoCabeza === 'f' ? 'f' : 'm'], delDiccionario: true });
      continue;
    }

    // Ni en el diccionario ni modificador: una marca, un apellido, «LED»…
    // Se escribe con el alfabeto del que lee, para que al menos pueda leerlo.
    salida.push({ texto: transcribir(palabra, idioma) });
  }

  if (!salida.length) return null;
  // En español los artículos del diccionario están en mayúscula («Naranja») y
  // dentro de una frase solo la lleva la primera palabra. Lo que NO viene del
  // diccionario (una marca, «Puleva») se deja tal y como se escribió.
  const frase = salida
    .map((pieza, i) => {
      if (idioma !== 'es' || !pieza.delDiccionario || i === 0) return pieza.texto;
      return pieza.texto.toLowerCase();
    })
    .join(' ');
  return idioma === 'es' ? frase.charAt(0).toUpperCase() + frase.slice(1) : frase;
}

/**
 * Un nombre con palabras de los dos alfabetos («حليب Puleva», «Leche حليب»):
 * pasa al alfabeto del que lee las que no están en él. Devuelve null si no
 * había nada que pasar, que es lo normal.
 */
function completarMezcla(escrito, idioma) {
  const palabras = escrito.split(/\s+/).filter(Boolean);
  const ajenas = palabras.filter((palabra) => idiomaDe(palabra) !== idioma && /[a-z؀-ۿ]/i.test(palabra));
  if (!ajenas.length) return null;
  return palabras
    .map((palabra) => {
      if (idiomaDe(palabra) === idioma || !/[a-z؀-ۿ]/i.test(palabra)) return palabra;
      return traducir(palabra)?.[idioma] ?? transcribir(palabra, idioma);
    })
    .join(' ');
}

/**
 * Cómo se enseña un artículo en el idioma elegido:
 *   `principal` es lo que va grande y `original` lo que va debajo en pequeño,
 *   para que quien lo escribió siga reconociendo su artículo.
 * Solo se traduce lo escrito en el OTRO idioma: lo que alguien apuntó en
 * español se enseña tal cual en español, aunque esté en el diccionario.
 */
export function mostrar(nombre, idioma) {
  const escrito = (nombre ?? '').trim();
  if (!escrito) return { principal: escrito, original: null, traducido: false };

  if (idiomaDe(escrito) === idioma) {
    // Aunque el nombre esté «en su idioma», puede traer palabras del otro
    // alfabeto («حليب Puleva»). Quien solo lee árabe no puede con esa mitad.
    const completo = completarMezcla(escrito, idioma);
    return completo
      ? { principal: completo, original: escrito, traducido: true }
      : { principal: escrito, original: null, traducido: false };
  }
  const pareja = traducir(escrito);
  const principal = pareja ? pareja[idioma] : componer(escrito, idioma);
  if (!principal) return { principal: escrito, original: null, traducido: false };
  return { principal, original: escrito, traducido: true };
}

/** Sugerencias mientras se escribe el nombre, en el idioma de la app. */
export function sugerir(escrito, idioma, tope = 4) {
  const texto = (escrito ?? '').trim();
  if (!texto) return [];
  const idiomaEscrito = idiomaDe(texto);
  const busca = normalizar(texto, idiomaEscrito);
  if (!busca) return [];
  const empiezan = [];
  const contienen = [];
  for (const pareja of ARTICULOS_CONOCIDOS) {
    const candidato = normalizar(pareja[idiomaEscrito], idiomaEscrito);
    if (candidato === busca) continue;
    if (candidato.startsWith(busca)) empiezan.push(pareja[idioma]);
    else if (candidato.includes(busca)) contienen.push(pareja[idioma]);
    if (empiezan.length >= tope) break;
  }
  return [...empiezan, ...contienen].slice(0, tope);
}

/**
 * ¿Casa este artículo con lo que se busca? Busca en los dos idiomas, así que
 * escribiendo «leche» aparece también el que se apuntó como «حْلِيبْ».
 */
export function coincide(nombre, busqueda) {
  const texto = (busqueda ?? '').trim();
  if (!texto) return true;
  const idiomaBusqueda = idiomaDe(texto);
  const busca = normalizar(texto, idiomaBusqueda);
  if (!busca) return true;
  const pareja = traducir(nombre);
  const donde = [nombre, pareja?.es, pareja?.dar, componer(nombre, 'es'), componer(nombre, 'dar')];
  return donde
    .filter(Boolean)
    .some((candidato) => normalizar(candidato, idiomaDe(candidato)).includes(busca));
}
