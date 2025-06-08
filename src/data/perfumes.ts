import { Perfume } from "../types";

export const perfumes: Perfume[] = [
  {
    id: 1,
    name: "Victorious ONYX",
    brand: "Paco Rabanne",
    price: 40000,
    gender: "masculino",
    category: "cítrico",
    size: "100ml",
    image: "/imagenes/perfumes/invictus-onyx.jpg",
    description:
      "Un perfume que con sus notas marinas, pomelo y mandarina en la salida, jazmín y laureles en el corazón y, ámbar gris, pachulí, madera de gaiac y musgo en el fondo componen el aroma de la victoria.",
    notes: {
      top: ["Pomelo", "marinas", "mandarina"],
      middle: ["laureles", "jazmín"],
      base: ["ámbar gris", "pachulí", "madera de gaiac", "musgo"],
    },
  },
  {
    id: 2,
    name: "YD12 Men",
    brand: "Yves d'Orgeval",
    price: 40000,
    gender: "masculino",
    category: "amaderado",
    size: "100ml",
    image: "/imagenes/perfumes/212-men-hombres.jpg", // por ejemplo: '../assets/images/perfumes/yd12-men.jpg'
    description:
      "Inspirado en 212 Men de Carolina Herrera. Una fragancia fresca y urbana con notas verdes, amaderadas y especiadas. Ideal para hombres modernos y sofisticados.",
    notes: {
      top: ["Pomelo", "Bergamota", "Verde Hoja"],
      middle: ["Pimienta", "Jengibre", "Gardenia"],
      base: ["Sándalo", "Incienso", "Almizcle"],
    },
  },
  {
    id: 3,
    name: "212-Vip Black",
    brand: "Carolina Herrera",
    price: 40000,
    gender: "masculino",
    category: "oriental",
    size: "100ml",
    image: "/imagenes/perfumes/212-vipBlack-hombres.jpg", // '../assets/images/perfumes/212-vip-black-hombres.jpg'
    description:
      "Inspirado en 212 VIP Black de Carolina Herrera. Una fragancia intensa y seductora con anis y hinojo en salida, corazón de lavanda y fondo de vainilla negra y almizcle.",
    notes: {
      top: ["Anis", "Hinojo"],
      middle: ["Lavanda"],
      base: ["Vainilla negra", "Almizcle"],
    },
  },
  {
    id: 4,
    name: "212-Vip Night Club Men",
    brand: "Carolina Herrera",
    price: 40000,
    gender: "masculino",
    category: "amaderado",
    size: "100ml",
    image: "/imagenes/perfumes/212-vipNighClub-hombres.jpg", // '../assets/images/perfumes/212-vip-night-club-hombres.jpg'
    description:
      "Inspirado en 212 VIP Night Club Men de Carolina Herrera. Notas de salida cítricas y acuáticas, corazón especiado y fondo achocolatado.",
    notes: {
      top: ["Lima", "Notas acuosas", "Caviar"],
      middle: ["Nuez moscada", "Notas amaderadas", "Pimienta"],
      base: ["Chocolate", "Notas amaderadas"],
    },
  },
  {
    id: 5,
    name: "Acqua Di Gio",
    brand: "Giorgio Armani",
    price: 40000,
    gender: "masculino",
    category: "cítrico",
    size: "100ml",
    image: "/imagenes/perfumes/Acquadi-men-hombres.jpg", // '../assets/images/perfumes/acqua-di-gio-hombres.jpg'
    description:
      "Inspirado en Acqua Di Gio de Giorgio Armani. Fresca y marina con limón, bergamota y notas marinas, corazón floral y fondo amaderado.",
    notes: {
      top: ["Lima", "Limón", "Bergamota", "Neroli"],
      middle: ["Notas marinas", "Jazmín", "Romero"],
      base: ["Almizcle blanco", "Cedro", "Ámbar"],
    },
  },
  {
    id: 6,
    name: "Amor Amor Cacharel",
    brand: "Jean Bousquet",
    price: 40000,
    gender: "femenino",
    category: "floral",
    size: "100ml",
    image: "/imagenes/perfumes/AmorAmor-women-mujeres.jpg", // '../assets/images/perfumes/minis/bad-boy-50ml.jpg', // '../assets/images/perfumes/amor-amor-cacharel-mujeres.jpg'
    description:
      "Inspirado en Amor Amor de Cacharel. Frutal y gourmand con grosella negra, rosa y fondo de vainilla y almizcle.",
    notes: {
      top: ["Grosella negra", "Naranja", "Pomelo"],
      middle: ["Rosa", "Jazmín", "Azucena"],
      base: ["Vainilla", "Haba tonka", "Almizcle"],
    },
  },
  {
    id: 7,
    name: "Armani Code",
    brand: "Giorgio Armani",
    price: 40000,
    gender: "masculino",
    category: "oriental",
    size: "100ml",
    image: "/imagenes/perfumes/ArmaniCode-hombres.jpg", // '../assets/images/perfumes/minis/bad-boy-50ml.jpg', // '../assets/images/perfumes/armani-code-hombres.jpg'
    description:
      "Inspirado en Armani Code de Giorgio Armani. Elegante y sofisticado con bergamota, flor de olivo y fondo de cuero y tabaco.",
    notes: {
      top: ["Limón", "Bergamota"],
      middle: ["Anís estrellado", "Flor de olivo"],
      base: ["Cuero", "Haba tonka", "Tabaco"],
    },
  },
  {
    id: 8,
    name: "Bad Boy Cobalt",
    brand: "Carolina Herrera",
    price: 40000,
    gender: "masculino",
    category: "frutal",
    size: "100ml",
    image: "/imagenes/perfumes/badboy-cobalt-hombres.jpg", // '../assets/images/perfumes/minis/bad-boy-50ml.jpg', // '../assets/images/perfumes/bad-boy-cobalt-hombres.jpg'
    description:
      "Inspirado en Bad Boy de Carolina Herrera. Dinámico y audaz con pimienta rosa y vetiver.",
    notes: {
      top: ["Pimienta rosa", "Lavanda"],
      middle: ["Geranio", "Ciruela negra"],
      base: ["Vetiver"],
    },
  },
  {
    id: 9,
    name: "Bad Boy",
    brand: "Carolina Herrera",
    price: 40000,
    gender: "masculino",
    category: "amaderado",
    size: "100ml",
    image: "/imagenes/perfumes/badboy-hombres.jpg", // '../assets/images/perfumes/bad-boy-hombres.jpg'
    description:
      "Inspirado en Bad Boy de Carolina Herrera. Con pimienta, salvia y fondo cálido de haba tonka.",
    notes: {
      top: ["Pimienta blanca", "Pimienta negra", "Bergamota"],
      middle: ["Salvia", "Cedro"],
      base: ["Haba tonka", "Cacao", "Amberwood"],
    },
  },
  {
    id: 10,
    name: "Black XS L'Aphrodisiaque",
    brand: "Paco Rabanne",
    price: 40000,
    gender: "masculino",
    category: "oriental",
    size: "100ml",
    image: "/imagenes/perfumes/blackXS-afro-hombres.jpg", // '../assets/images/perfumes/black-xs-laphrodisiaque-hombres.jpg'
    description:
      "Inspirado en Black XS de Paco Rabanne. Cálido y exótico con canela, miel y cuero.",
    notes: {
      top: ["Canela", "Azafrán"],
      middle: ["Miel", "Ciprés"],
      base: ["Praliné", "Cuero", "Almendra"],
    },
  },
  {
    id: 11,
    name: "CH Women",
    brand: "Carolina Herrera",
    price: 40000,
    gender: "femenino",
    category: "floral",
    size: "100ml",
    image: "/imagenes/perfumes/Ch-women-mujeres.jpg", // '../assets/images/perfumes/ch-women-mujeres.jpg'
    description:
      "Inspirado en CH Woman de Carolina Herrera. Floral y suave con praliné, rosa y fondo de sándalo.",
    notes: {
      top: ["Frutas tropicales", "Bergamota", "Pomelo"],
      middle: ["Praliné", "Flor de naranja africana", "Jazmín"],
      base: ["Sándalo", "Ámbar", "Cedro"],
    },
  },
  {
    id: 12,
    name: "Eve EDP",
    brand: "Paco Rabanne",
    price: 40000,
    gender: "femenino",
    category: "floral",
    size: "100ml",
    image: "/imagenes/perfumes/EveParfum-mujeres.jpg", // '../assets/images/perfumes/eve-edp-mujeres.jpg'
    description:
      "Inspirado en Olympea EDP de Paco Rabanne. Dulce y seductor con jazmín, vainilla y sándalo.",
    notes: {
      top: ["Mango"],
      middle: ["Jazmín"],
      base: ["Vainilla", "Sándalo"],
    },
  },
  {
    id: 13,
    name: "Givenchy Very Irresistible Sensual",
    brand: "Givenchy",
    price: 40000,
    gender: "femenino",
    category: "floral",
    size: "100ml",
    image: "/imagenes/perfumes/Givenchy-women-mujeres.jpg", // '../assets/images/perfumes/givenchy-very-irresistible-sensual-mujeres.jpg'
    description:
      "Inspirado en Very Irrésistible de Givenchy. Femme con peonía, rosa y fondo de vainilla.",
    notes: {
      top: ["Peonía"],
      middle: ["Rosa"],
      base: ["Pachulí", "Vainilla"],
    },
  },
  {
    id: 14,
    name: "Good Girl",
    brand: "Carolina Herrera",
    price: 40000,
    gender: "femenino",
    category: "oriental",
    size: "100ml",
    image: "/imagenes/perfumes/Good-Girl-women-mujeres.jpg", // '../assets/images/perfumes/good-girl-mujeres.jpg'
    description:
      "Inspirado en Good Girl de Carolina Herrera. Alterna lo dulce y lo oscuro con almendra, jazmín y cacao.",
    notes: {
      top: ["Almendra", "Café"],
      middle: ["Jazmín sambac", "Azahar"],
      base: ["Haba tonka", "Cacao"],
    },
  },
  {
    id: 15,
    name: "Halloween Women",
    brand: "Jesús del Pozo",
    price: 40000,
    gender: "femenino",
    category: "floral",
    size: "100ml",
    image: "/imagenes/perfumes/Halloween-women-mujeres.jpg", // '../assets/images/perfumes/halloween-women-mujeres.jpg'
    description:
      "Inspirado en Halloween Women de Jesús del Pozo. Misteriosa con violeta, tuberosa y fondo de mirra.",
    notes: {
      top: ["Violeta", "Petitgrain"],
      middle: ["Magnolia", "Tuberosa"],
      base: ["Incienso", "Mirra"],
    },
  },
  {
    id: 16,
    name: "Hugo Boss Just Different",
    brand: "Hugo Boss",
    price: 40000,
    gender: "masculino",
    category: "oriental",
    size: "100ml",
    image: "/imagenes/perfumes/HugoBoss-hombres.jpg", // '../assets/images/perfumes/bad-boy-50ml.jpg', // '../assets/images/perfumes/hugo-boss-just-different-hombres.jpg'
    description:
      "Inspirado en Boss Bottled de Hugo Boss. Fresco con menta y manzana, fondo especiado y amaderado.",
    notes: {
      top: ["Menta", "Manzana Granny Smith"],
      middle: ["Albahaca", "Cilantro"],
      base: ["Cachemira", "Tabaco"],
    },
  },
  {
    id: 17,
    name: "L'Interdit",
    brand: "Givenchy",
    price: 40000,
    gender: "femenino",
    category: "floral",
    size: "100ml",
    image: "/imagenes/perfumes/L-interdit-women-mujeres.jpg", // '../assets/images/perfumes/linterdit-mujeres.jpg'
    description:
      "Inspirado en L'Interdit de Givenchy. Elegante con pera, jazmín y fondo de vetiver.",
    notes: {
      top: ["Pera", "Bergamota"],
      middle: ["Jazmín sambac", "Azahar"],
      base: ["Pachulí", "Vetiver"],
    },
  },
  {
    id: 18,
    name: "La Vida Es Bella",
    brand: "Lancôme",
    price: 40000,
    gender: "femenino",
    category: "oriental",
    size: "100ml",
    image: "/imagenes/perfumes/LaVidaEsBella-women-mujeres.jpg", // '../assets/images/perfumes/la-vida-es-bella-mujeres.jpg'
    description:
      "Inspirado en La Vie Est Belle de Lancôme. Dulce con grosella negra, iris y fondo de haba tonka.",
    notes: {
      top: ["Grosella negra", "Pera"],
      middle: ["Iris", "Jazmín"],
      base: ["Haba tonka", "Praliné"],
    },
  },
  {
    id: 19,
    name: "My Way",
    brand: "Giorgio Armani",
    price: 40000,
    gender: "femenino",
    category: "floral",
    size: "100ml",
    image: "/imagenes/perfumes/My-way-women-mujeres.jpg", // '../assets/images/perfumes/my-way-mujeres.jpg'
    description:
      "Inspirado en My Way de Giorgio Armani. Brillante con flor de azahar, bergamota y fondo de cedro.",
    notes: {
      top: ["Bergamota", "Azahar"],
      middle: ["Jazmín"],
      base: ["Cedro"],
    },
  },
  {
    id: 20,
    name: "Nina Ricci",
    brand: "Nina Ricci",
    price: 40000,
    gender: "femenino",
    category: "frutal",
    size: "100ml",
    image: "/imagenes/perfumes/NinaRicci-women-mujeres.jpg", // '../assets/images/perfumes/nina-ricci-mujeres.jpg'
    description:
      "Inspirado en Nina Ricci. Fresco y joven con limón, manzana y fondo suave amaderado.",
    notes: {
      top: ["Limón", "Lima de Amalfi"],
      middle: ["Manzana Granny Smith", "Peonía"],
      base: ["Almizcle", "Cedro"],
    },
  },
  {
    id: 21,
    name: "Phantom Black Parfum",
    brand: "Paco Rabanne",
    price: 40000,
    gender: "masculino",
    category: "oriental",
    size: "100ml",
    image: "/imagenes/perfumes/Phantom-black-hombres.jpg", // '../assets/images/perfumes/phantom-black-parfum-hombres.jpg'
    description:
      "Inspirado en Phantom de Paco Rabanne. Moderno y enérgico con bergamota, lavanda y fondo de vetiver.",
    notes: {
      top: ["Bergamota", "Limón"],
      middle: ["Lavanda", "Geranio"],
      base: ["Haba de vainilla", "Vetiver"],
    },
  },
  {
    id: 22,
    name: "Phantom",
    brand: "Paco Rabanne",
    price: 40000,
    gender: "masculino",
    category: "oriental",
    size: "100ml",
    image: "/imagenes/perfumes/Phantom-hombres.jpg", // '../assets/images/perfumes/phantom-hombres.jpg'
    description:
      "Inspirado en Phantom de Paco Rabanne. Fresco con lavanda, pimienta y fondo amaderado.",
    notes: {
      top: ["Lavanda", "Limón de Amalfi"],
      middle: ["Pachulí", "Pimienta rosa"],
      base: ["Vainilla"],
    },
  },
  {
    id: 23,
    name: "Polo Blue EDT",
    brand: "Ralph Lauren",
    price: 40000,
    gender: "masculino",
    category: "acuático",
    size: "100ml",
    image: "/imagenes/perfumes/poloBlue-hombres.jpg", // '../assets/images/perfumes/polo-blue-edt-hombres.jpg'
    description:
      "Inspirado en Polo Blue EDT de Ralph Lauren. Refrescante con pepino, melón y fondo amaderado.",
    notes: {
      top: ["Pepino", "Melón", "Mandarina"],
      middle: ["Salvia", "Geranio"],
      base: ["Gamuza", "Almizcle"],
    },
  },
  {
    id: 24,
    name: "Sauvage Dior",
    brand: "Dior",
    price: 40000,
    gender: "masculino",
    category: "amaderado",
    size: "100ml",
    image: "/imagenes/perfumes/Sauvage-men-hombres.jpg", // '../assets/images/perfumes/sauvage-dior-hombres.jpg'
    description:
      "Inspirado en Sauvage de Dior. Vibrante con bergamota de Calabria, pimienta y fondo ahumado.",
    notes: {
      top: ["Bergamota de Calabria", "Pimienta"],
      middle: ["Lavanda", "Vetiver"],
      base: ["Cedro", "Ambroxan"],
    },
  },
  {
    id: 25,
    name: "Scandal Pour Homme",
    brand: "Jean Paul Gaultier",
    price: 40000,
    gender: "masculino",
    category: "amaderado",
    size: "100ml",
    image: "/imagenes/perfumes/Scandal-men-hombres.jpg", // '../assets/images/perfumes/scandal-pour-homme-hombres.jpg'
    description:
      "Inspirado en Scandal Pour Homme de Jean Paul Gaultier. Atrevido con caramelo, vetiver y salvia esclarea.",
    notes: {
      top: ["Caramelo"],
      middle: ["Vetiver", "Salvia esclarea"],
      base: [],
    },
  },
  {
    id: 26,
    name: "Tom Ford - Oud Wood",
    brand: "Tom Ford",
    price: 40000,
    gender: "masculino",
    category: "amaderado",
    size: "100ml",
    image: "/imagenes/perfumes/Tomford-hombres.jpg", // '../assets/images/perfumes/tom-ford-oud-wood-hombres.jpg'
    description:
      "Inspirado en Oud Wood de Tom Ford. Rico y exótico con madera de oud, sándalo y haba tonka.",
    notes: {
      top: ["Madera de oud", "Cardamomo"],
      middle: ["Pimienta de Sichuan", "Sándalo"],
      base: ["Haba tonka", "Ámbar"],
    },
  },
  {
    id: 27,
    name: "212 Vip Rose",
    brand: "Carolina Herrera",
    price: 40000,
    gender: "femenino",
    category: "floral",
    size: "100ml",
    image: "/imagenes/perfumes/212-VipRose-mujer.jpg", // '../assets/images/perfumes/212-vip-rose-mujeres.jpg'
    description:
      "Inspirado en 212 VIP Rosé de Carolina Herrera. Sofisticado con champán, notas afrutadas y fondo almizclado.",
    notes: {
      top: ["Champán", "Notas afrutadas"],
      middle: ["Peach Blossom"],
      base: ["Almizcle blanco", "Ámbar"],
    },
  },
  {
    id: 28,
    name: "Scandal Le Parfum Intense",
    brand: "Jean Paul Gaultier",
    price: 40000,
    gender: "femenino",
    category: "floral",
    size: "100ml",
    image: "/imagenes/perfumes/Scandal-Le-Parfum-Intense-mujer.jpg", // '../assets/images/perfumes/scandal-le-parfum-intense-mujeres.jpg'
    description:
      "Inspirado en Scandal Le Parfum Intense de Jean Paul Gaultier. Intenso con tuberosa y jazmín.",
    notes: {
      top: [],
      middle: ["Tuberosa", "Jazmín"],
      base: [],
    },
  },
  {
    id: 29,
    name: "Olimpea Intense",
    brand: "Paco Rabanne",
    price: 40000,
    gender: "femenino",
    category: "floral",
    size: "100ml",
    image: "/imagenes/perfumes/Olimpea-Intense-mujer.jpg", // '../assets/images/perfumes/bad-boy-50ml.jpg', // '../assets/images/perfumes/olimpea-intense-mujeres.jpg'
    description:
      "Inspirado en Olympea Intense de Paco Rabanne. Cálido con jazmín de agua, vainilla y ámbar gris.",
    notes: {
      top: ["Mandarina verde", "Jazmín de agua"],
      middle: ["Vainilla", "Sal"],
      base: ["Ámbar gris", "Sándalo"],
    },
  },
  {
    id: 30,
    name: "212-Sexy Fem",
    brand: "Carolina Herrera",
    price: 40000,
    gender: "femenino",
    category: "floral",
    size: "100ml",
    image: "/imagenes/perfumes/212-sexyFem-mujer.jpg", // '../assets/images/perfumes/212-sexy-fem-mujeres.jpg'
    description:
      "Inspirado en 212 Sexy de Carolina Herrera. Jugoso con pimienta rosa, gardenia y fondo dulce.",
    notes: {
      top: ["Pimienta rosa", "Mandarina"],
      middle: ["Gardenia", "Pelargonio"],
      base: ["Vainilla", "Ámbar"],
    },
  },
  {
    id: 31,
    name: "Miss Millionaire Fabulous",
    brand: "Paco Rabanne",
    price: 40000,
    gender: "femenino",
    category: "oriental",
    size: "100ml",
    image: "/imagenes/perfumes/millionaire.jpg", // '../assets/images/perfumes/miss-millionaire-fabulous-mujeres.jpg'
    description:
      "Inspirado en Lady Million de Paco Rabanne. Dulce y caramelizado con jazmín y haba tonka.",
    notes: {
      top: ["Mandarina", "Pimienta rosa"],
      middle: ["Jazmín"],
      base: ["Haba tonka", "Musgo"],
    },
  },
  {
    id: 32,
    name: "Bella Leclat ",
    brand: "Paco Rabanne",
    price: 40000,
    gender: "femenino",
    category: "frutal",
    size: "100ml",
    image: "/imagenes/perfumes/Bella-Leclat-100ml.jpg", // '../assets/images/perfumes/bella-leclat-100ml-mujeres.jpg'
    description:
      "Inspirado en LeClat de Paco Rabanne. Brillante con mandarina, jazmín y fondo suave.",
    notes: {
      top: ["Mandarina"],
      middle: ["Jazmín"],
      base: ["Vainilla"],
    },
  },
  {
    id: 33,
    name: "One Million",
    brand: "Paco Rabanne",
    price: 40000,
    gender: "masculino",
    category: "oriental",
    size: "100ml",
    image: "/imagenes/perfumes/One-Million-Hombre.jpg", // '../assets/images/perfumes/one-million-hombres.jpg'
    description:
      "Inspirado en One Million de Paco Rabanne. Especiado con mandarina roja, canela y fondo amaderado.",
    notes: {
      top: ["Mandarina roja", "Pomelo"],
      middle: ["Canela", "Rosa"],
      base: ["Ámbar", "Cuero"],
    },
  },
  {
    id: 34,
    name: "Badboy Mini",
    brand: "Jaques Ryon",
    price: 15000,
    gender: "femenino",
    category: "amaderado",
    size: "50ml",
    image: "/imagenes/minis/Badboy-50ml.jpg", //
    description:
      "Versión mini de Bad Boy. Especiada con cacao, pimienta y bergamota.",
    notes: {
      top: ["Cacao", "Bergamota"],
      middle: ["Pimienta negra", "Salvia"],
      base: [],
    },
  },
  {
    id: 35,
    name: "Sauvage Mini",
    brand: "Jaques Ryon",
    price: 15000,
    gender: "masculino",
    category: "amaderado",
    size: "50ml",
    image: "/imagenes//minis/sauvage-50ml.jpg", // '../assets/images/perfumes/minis/sauvage-50ml.jpg'
    description:
      "Miniatura de Sauvage. Fresco con bergamota, lavanda y vetiver.",
    notes: {
      top: ["Bergamota"],
      middle: ["Lavanda"],
      base: ["Vetiver"],
    },
  },
  {
    id: 36,
    name: "Invictus Mini",
    brand: "Jaques Ryon",
    price: 15000,
    gender: "masculino",
    category: "acuático",
    size: "50ml",
    image: "/imagenes/minis/invictus-50ml.jpg", // '../assets/images/perfumes/minis/invictus-50ml.jpg',
    description:
      "Miniatura de Invictus. Refrescante con notas marinas, cítricos y maderas.",
    notes: {
      top: ["Notas marinas", "Cítricos"],
      middle: [],
      base: [],
    },
  },
  {
    id: 37,
    name: "12Heroes  Mini",
    brand: "Jaques Ryon",
    price: 15000,
    gender: "masculino",
    category: "amaderado",
    size: "50ml",
    image: "/imagenes/minis/12HeroesMen-50ml.jpg",
    description:
      "Miniatura inspirada en 212 Heroes Men. Con pera, jengibre y fondo almizclado.",
    notes: {
      top: ["Pera", "Jengibre"],
      middle: ["Geranio", "Salvia"],
      base: ["Almizcle"],
    },
  },
  {
    id: 38,
    name: "Perfumero recargable",
    brand: "Otros",
    price: 5000,
    gender: "unisex",
    category: "perfumeria",
    size: "5ml",
    image: "/imagenes/perfumes/perfumeroRecargable.jpg",
    description:
      "Hoy te presentamos La mini botella atomizadora de perfume, es lo suficientemente pequeña y ligera para meterla en el bolsillo o en el bolso, haciendo que disfrutes de una fragancia maravillosa en cada momento.Cuando asista a una fiesta, pasa tiempo en vacaciones o en un viaje de negocios, es una gran herramienta para mantenerte oliendo fresco y darte confianza.Botella pequeña recargable de Perfume de 5ML, atomizador de aluminio portátil, botella de Perfume de repuesto para viaje.IMPORTANTE(el producto se vende sin contenido en su interior)",
    notes: {
      top: ["", ""],
      middle: ["", ""],
      base: [""],
    },
  },
  {
    id: 39,
    name: "9pm",
    brand: "Arabes",
    price: 61000,
    gender: "masculino",
    category: "oriental",
    size: "100ML",
    image: "/imagenes/arabes/9PM.jpg",
    description:
      "Es una fragancia masculina muy popular, conocida por su aroma dulce, especiado y ambarado, ideal para la noche o climas fríos",
    notes: {
      top: ["manzana", "canela", "lavanda silvestre", "bergamota"],
      middle: ["flor de azahar", " lirio"],
      base: ["vainilla", "haba tonka", "ambar", "pachuli"],
    },
  },
  {
    id: 40,
    name: "Asad Lattafa",
    brand: "Arabes",
    price: 61000,
    gender: "masculino",
    category: "oriental",
    size: "100ML",
    image: "/imagenes/arabes/Asad-Lattafa.jpg",
    description:
      "Asad de Lattafa Perfumes es una fragancia de la familia olfativa Oriental para Hombre",
    notes: {
      top: ["Pimienta ngera", "Tabaco", "piña"],
      middle: ["Pachuli", "Cafe", "Iris"],
      base: ["Vainilla", "Madera seca", "Ambar"],
    },
  },
  {
    id: 41,
    name: "Bharara King",
    brand: "Arabes",
    price: 114000,
    gender: "masculino",
    category: "aromatica",
    size: "100ML",
    image: "/imagenes/arabes/bhararaKing.jpg",
    description:
      "King de Bharara es una fragancia de la familia olfativa Aromática para Hombres",
    notes: {
      top: ["Naranja ", "Limón ", "Bergamota"],
      middle: ["Notas afrutadas"],
      base: ["Vainilla", "Almizcleblanco", "Ambar"],
    },
  },
  {
    id: 42,
    name: "Al Haramain Amber Oud",
    brand: "Arabes",
    price: 110000,
    gender: "masculino",
    category: "amaderado",
    size: "100ML",
    image: "/imagenes/arabes/Haramain-AmberOud.jpg",
    description:
      "Amber Oud de Al Haramain Perfumes es una fragancia de la familia olfativa Oriental Amaderada para Hombres y Mujeres",
    notes: {
      top: ["Romero ", "Cedro", "Bergamota", "Limon"],
      middle: ["especies", "madera degaiac"],
      base: ["Resinas", "Ambar", "Almizcle"],
    },
  },
  {
    id: 43,
    name: "Yara Moi Lattafa",
    brand: "Arabes",
    price: 55000,
    gender: "femenino",
    category: "cítrico",
    size: "100ml",
    image: "/imagenes/arabes/Yara-Moi-Lattafa.jpg",
    description:
      "Una fragancia fresca y floral con notas de jazmín, durazno, caramelo y ámbar.",
    notes: {
      top: ["Jazmín", "Durazno (melocotón)"],
      middle: ["Caramelo", "Ámbar"],
      base: ["Pachulí", "Sándalo"],
    },
  },
  {
    id: 44,
    name: "Yara Pink Lattafa",
    brand: "Arabes",
    price: 55000,
    gender: "femenino",
    category: "ambar",
    size: "100ml",
    image: "/imagenes/arabes/Yara-Lattafa.jpg",
    description:
      "Yara de Lattafa es una fragancia de la familia olfativa Ámbar Vainilla para Mujeres.",
    notes: {
      top: ["Orquídea", "Heliotropo", "Naranja tangerina"],
      middle: ["Acuerdo goloso", "Frutas tropicales"],
      base: ["Vainilla", "Almizcle", "Sándalo"],
    },
  },
  {
    id: 45,
    name: "Yara Tous Lattafa ",
    brand: "Arabes",
    price: 55000,
    gender: "femenino",
    category: "oriental",
    size: "100ml",
    image: "/imagenes/arabes/Yara-Amarrillo-Lattafa.jpg",
    description:
      "Yara Tous de Lattafa es una fragancia cautivadora y exótica gracias a una armoniosa combinación de notas olfativas",
    notes: {
      top: ["Mango", "Coco", "Maracuyá (fruta de la pasión)"],
      middle: ["Jazmín", "Flor de azahar del naranjo", "Heliotropo"],
      base: ["Vainilla", "Almizcle", "Cachemira"],
    },
  },
  {
    id: 46,
    name: "Haya de Lattafa",
    brand: "Arabes",
    price: 60000,
    gender: "femenino",
    category: "floral",
    size: "100ml",
    image: "/imagenes/arabes/Haya-Lattafa.jpg", // Asegúrate de que la ruta de la imagen sea correcta
    description:
      "Haya de Lattafa es una fragancia floral y afrutada que evoca la frescura y la elegancia.",
    notes: {
      top: [
        "Champaña",
        "Fresa",
        "naranja tangerina",
        "naranja sanguina y rosa",
      ],
      middle: ["Gardenia", "Gardenia", "orquídea de vainilla"],
      base: ["Ambar", "castaña", "Sándalo"],
    },
  },
  {
    id: 47,
    name: "Odyssey Mandarin Sky",
    brand: "Arabes",
    price: 81000,
    gender: "masculino",
    category: "floral",
    size: "100ml",
    image: "/imagenes/arabes/odysseyMandarinSky.jpg", // Asegúrate de que la ruta de la imagen sea correcta
    description:
      "Odyssey Mandarin Sky de Armaf es una fragancia cautivadora de la familia olfativa para hombres, lanzada en 2023",
    notes: {
      top: ["mandarina", "naranja", "azafrán", "salvia"],
      middle: ["caramelo", "haba tonka", "cempasúchil"],
      base: ["vetiver", "ambroxan", "cedro brindan"],
    },
  },
  {
    id: 48,
    name: "Armaf Club de Nuit Intense",
    brand: "Arabes",
    price: 61000,
    gender: "masculino",
    category: "amaderado especiado",
    size: "105ml",
    image: "/imagenes/arabes/ClubdeNuit.jpg", // Asegúrate de que la ruta de la imagen sea correcta
    description:
      "Club de Nuit Intense Man de Armaf es mucho más que una fragancia: es una declaración de estilo, misterio y presencia. Diseñada para el hombre que no pasa desapercibido, combina elegancia clásica con un giro audaz gracias a sus notas frutales, florales y Club de Nuit Intense Man de Armaf es mucho más que una fragancia: es una declaración de estilo, misterio y presencia. Diseñada para el hombre que no pasa desapercibido, combina elegancia clásica con un giro audaz gracias a sus notas frutales, florales y amaderadas",
    notes: {
      top: [
        "Limón chispeante.",
        "piña jugosa",
        "bergamota vibrante",
        "grosella negra",
      ],
      middle: ["Abedul ahumado", "jazmín refinado", " rosa elegante"],
      base: [
        "Almizcle sensual",
        "ámbar cálido",
        "pachulí terroso",
        "vainilla cremosa",
      ],
    },
  },
  {
    id: 49,
    name: "Honor & Glory",
    brand: "Arabes",
    price: 61000,
    gender: "masculino",
    category: "amaderada dulce",
    size: "100ml",
    image: "/imagenes/arabes/HonorAndGlory.jpg", // Asegúrate de que la ruta de la imagen sea correcta
    description:
      "Bade'e Al Oud Honor & Glory de Lattafa Perfumes es una fragancia de la familia olfativa para Hombres y Mujeres. Esta fragrancia es nueva. Bade'e Al Oud Honor & Glory se lanzó en 2023",
    notes: {
      top: ["Piña", "Créme bruléea"],
      middle: ["canela", "cúrcuma ", "pimienta negra", "Benjuí"],
      base: ["vainilla", "sándalo", "cachemira ", "musgo"],
    },
  },
  {
    id: 50,
    name: "Khamrah Qahwa Lattafa",
    brand: "Arabes",
    price: 61000,
    gender: "masculino",
    category: "amaderada dulce",
    size: "100ml",
    image: "/imagenes/arabes/Khamrah-Qahwa.jpg", // Asegúrate de que la ruta de la imagen sea correcta
    description:
      "Khamrah Qahwa de Lattafa Perfumes es una fragancia de la familia olfativa Oriental Vainilla para Hombres y Mujeres. Esta fragrancia es nueva. Khamrah Qahwa se lanzó en 2022",
    notes: {
      top: ["canela", "Cardamomo", "jengibre"],
      middle: ["praliné", "Frutas confitadas", "flores blancas"],
      base: ["vainilla", "Cafe", "Haba tonka", "benjuí", "almizcle"],
    },
  },
];
