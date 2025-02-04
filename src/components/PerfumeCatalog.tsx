"use client";

import { useState } from "react";
import { useEffect} from "react";


import { FavoritesMenu } from '@/components/componentes/favorites-menu'
import { FavoritesButton } from '@/components/componentes/favorites-button'
//import { ProductCard } from '@/components/componentes/product-card' 
 
//import { ShoppingBag, X } from 'lucide-react'

import  Image from "next/image";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import {Card,CardContent,CardFooter,CardHeader,CardTitle,} from "@/ui/card";
import { Slider } from "@/ui/slider";
import { Label } from "@/ui/label"; 
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";



//import Link from "next/link";
//import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { Perfume } from "@/types/product";
import {Contacto} from "./componentes/Contacto";

// Datos para los perfumes
const perfumes : Perfume[] = [
  {
    id: 1,
    name: "212-Men",
    brand: "Carolina Herrera",
    gender: "hombre",
    price: 33000,
    image: "/imagenes/212-men-hombres.jpg",
    notes: "Las Notas de Salida son notas verdes, toronja (pomelo), especias, bergamota,lavanda y petit grain; las Notas de Corazón son jengibre, violeta, gardenia y salvia; las Notas de Fondo son almizcle, sándalo, incienso, vetiver, madera de gaiac y ládano.",
  },
  {
    id: 2,
    name: "212-Vip Black",
    brand: "Carolina Herrera",
    gender: "hombre",
    price: 33000,
    image: "/imagenes/212-vip Black-hombres.jpg",
    notes: "Notas de salida:Anis y Hinojo,La nota de Corazon:Lavanda,Las notas de Fondo:Vainilla negra y almizcle",
  },
  {
    id: 3,
    name: "212-Vip Night Club Men",
    brand: "Carolina Herrera",
    gender: "hombre",
    price: 33000,
    image: "/imagenes/212-vipNighClub-hombres.jpg",
    notes:"Las Notas de Salida son lima (limón verde), notas acuosas y caviar; las Notas de Corazón son nuez moscada, notas amaderadas y pimienta; las Notas de Fondo son chocolate y notas amaderadas",
  },
  {
    id: 4,
    name: "Acqua Di Gio",
    brand: "Giorgio Armani",
    gender: "hombre",
    price: 33000,
    image: "/imagenes/Acquadi-men-hombres.jpg",
    notes:"Las Notas de Salida son lima (limón verde), limón (lima ácida), bergamota, jazmín, naranja, mandarina y neroli; las Notas de Corazón son notas marinas, jazmín, calone, durazno (melocotón), fresia, ciclamen (violeta persa), jacinto, romero, violeta, cilantro, nuez moscada, rosa y reseda (miñoneta); las Notas de Fondo son almizcle blanco, cedro, musgo de roble, pachulí y ámbar.",
  },
  {
    id: 5,
    name: "Amor Amor Cacharel",
    brand: "Jean Bousquet",
    gender: "mujer",
    price: 33000,
    image: "/imagenes/AmorAmor-women-mujeres.jpg",
    notes:"Las Notas de Salida son grosella negra, naranja, mandarina, pomelo, casia y bergamota; las Notas de Corazón son rosa, albaricoque, jazmín, azucena y lirio de los valles; las Notas de Fondo son vainilla, haba tonka, almizcle, ámbar y cedro de Virginia.",
  },
  {
    id: 6,
    name: "Armani Code",
    brand: "Giorgio Armani",
    gender: "hombre",
    price: 33000,
    image: "/imagenes/ArmaniCode-hombres.jpg",
    notes:"Las Notas de Salida son limón (lima ácida) y bergamota; las Notas de Corazón son anís estrellado, flor del olivo y madera de gaiac; las Notas de Fondo son cuero, haba tonka y tabaco.",
  },
  {
    id: 7,
    name: "Bad Boy Cobalt",
    brand: "Carolina Herrera",
    gender: "hombre",
    price: 33000,
    image: "/imagenes/badboy-Covalt-hombres.jpg",
    notes:"Las Notas Olfativas son: Pimienta rosa, lavanda, geranio, ciruela negra y vetiver.",
  },
  {
    id: 8,
    name: "Bad Boy",
    brand: "Carolina Herrera",
    gender: "hombre",
    price: 33000,
    image: "/imagenes/badboy-hombres.jpg",
    notes:"Las Notas de Salida son pimienta blanca, pimienta negra y bergamota; las Notas de Corazón son salvia y cedro; las Notas de Fondo son haba tonka, cacao y Amberwood.",
  },
  {
    id: 9,
    name: "Black XS L'Aphrodisiaque",
    brand: "Paco Rabanne ",
    gender: "hombre",
    price:  33000,
    image: "/imagenes/blackXS-afro-hombres.jpg",
    notes:"Las Notas de Salida son canela y azafrán; las Notas de Corazón son miel, ciprés y flor de azahar del naranjo; las Notas de Fondo son praliné, cuero y almendra.",
  },
  {
    id: 10,
    name: "CH Women",
    brand: "Carolina Herrera",
    gender: "mujer",
    price: 33000,
    image: "/imagenes/Ch-women-mujeres.jpg",
    notes:"Las Notas de Salida son frutas tropicales, bergamota, pomelo, limón de Amalfi y notas acuáticas; las Notas de Corazón son praliné, canela, flor de naranja africana, jazmín y tintura de rosa; las Notas de Fondo son gamuza, pachulí, madera de cachemira, sándalo, almizcle, ámbar y cedro de Virginia.",
  },
  {
    id: 11,
    name: "Eve EDP",
    brand: "Paco Rabanne",
    gender: "mujer",
    price: 33000,
    image: "/imagenes/EveParfum-hombres.jpg",
    notes:"Las Notas Olfativas son: Mango, jazmín, vainilla y Sándalo ",
  },
  {
    id: 12,
    name: "Givenchy-Very Irresistible Sensual",
    brand: "Givenchy",
    gender: "mujer",
    price: 33000,
    image: "/imagenes/Givenchy-women-mujeres.jpg",
    notes:"La fragancia se compone de peonía, acordes de color verde afrutado de rosa Liv Tyler, bouquet de varios tipos de rosas, anís estrellado, pachulí y vainilla.",
  },
  {
    id: 13,
    name: "Good Girl",
    brand: "Carolina Herrera",
    gender: "mujer",
    price: 33000,
    image: "/imagenes/Good-Girl-women-mujeres.jpg",
    notes:"Las Notas de Salida son almendra, café, bergamota y limón; las Notas de Corazón son nardosos, jazmín sambac, azahar, lirio y rosa búlgara; las Notas de Fondo son haba tonka, cacao, vainilla, praliné, sándalo, ámbar, almizcle, madera de cachemira, canela, pachulí y cedro.",
  },
  {
    id: 14,
    name: "Halloween women",
    brand: "Jesús del Pozo",
    gender: "mujer",
    price: 33000,
    image: "/imagenes/Halloween-women-mujeres.jpg",
    notes:"Las Notas de Salida son violeta, notas marinas, hoja de plátano y petitgrain; las Notas de Corazón son violeta, magnolia, lirio de los valles, tuberosa y pimienta; las Notas de Fondo son incienso, vainilla de Madagascar, sándalo y mirra.",
  },
  {
    id: 15,
    name: "Hugo Boss Just Diferent",
    brand: "Hugo Boss",
    gender: "hombre",
    price: 33000,
    image: "/imagenes/HugoBoss-hombres.jpg",
    notes:"Las Notas de Salida son menta y manzana Granny Smith; las Notas de Corazón son albahaca, fresia y cilantro; las Notas de Fondo son cachemira, pachulí, incienso de olíbano (franquincienso) y ládano.",
  },
  {
    id: 16,
    name: "L'Interdit",
    brand: "Givenchy",
    gender: "mujer",
    price: 33000,
    image: "/imagenes/L-interdit-women-mujeres.jpg",
    notes:"Las Notas de Salida son pera y bergamota; las Notas de Corazón son nardosos, azahar y jazmín sambac; las Notas de Fondo son pachulí, vainilla, ambroxano y vetiver.",
  },
  {
    id: 17,
    name: "La Vida Es Bella",
    brand: "Lancôme",
    gender: "mujer",
    price: 33000,
    image: "/imagenes/LaVidaEsBella-women-mujeres.jpg",
    notes:"Las Notas de Salida son Grosella Negra y Pera; las Notas de Corazón son iris, jazmín y azahar; las Notas de Fondo son praliné, vainilla, pachulí y haba tonka",
  },
  {
    id: 18,
    name: "My way",
    brand: "Giorgio Armani",
    gender: "mujer",
    price: 33000,
    image: "/imagenes/My-way-women-mujeres.jpg",
    notes:"Las Notas Olfativas son: Flor de Azahar, Bergamota, Jazmin, Vainilla y Cedro ",
  },
  {
    id: 19,
    name: "Nina Ricci",
    brand: "Nina Ricci",
    gender: "mujer",
    price: 33000,
    image: "/imagenes/NinaRicci-women-mujeres.jpg",
    notes:"Las Notas de Salida son limón y lima de Amalfi; las Notas de Corazón son manzana Granny Smith, Praliné, Peonía y Datura; las Notas de Fondo son manzano, almizcle y cedro de Virginia.",
  },
  {
    id: 20,
    name: "Phantom Black Parfum",
    brand: "Paco Rabanne",
    gender: "hombre",
    price: 33000,
    image: "/imagenes/Phantom-black-hombres.jpg",
    notes:"Notas de salida: bergamota, limón, acorde de ruibarbo y cardamomomo,Notas de corazón: trío de lavanda, geranio, pachulí y madera de cedro,Notas de fondo: haba de vainilla, bálsamo de tolú y vetiver",
  },
  {
    id: 21,
    name: "Phantom",
    brand: "Paco Rabanne",
    gender: "hombre",
    price: 33000,
    image: "/imagenes/Phantom-hombres.jpg",
    notes:"Notas olfativas: Lavanda, Limon de Amalfi, Pachuli y Vainilla",
  },
  {
    id: 22,
    name: "Polo Blue EDT",
    brand: "Ralph Lauren",
    gender: "hombre",
    price: 33000,
    image: "/imagenes/poloBlue-hombres.jpg",
    notes:"Las Notas de Salida son pepino, melón y mandarina; las Notas de Corazón son albahaca, salvia y geranio; las Notas de Fondo son gamuza, notas amaderadas y almizcle.",
  },
  {
    id: 23,
    name: "Sauvage Dior",
    brand: "Dior",
    gender: "hombre",
    price: 33000,
    image: "/imagenes/Sauvage-men-hombres.jpg",
    notes:"Las Notas de Salida son bergamota de Calabria y pimienta; las Notas de Corazón son pimienta de Sichuan, lavanda, pimienta rosa, vetiver, pachulí, geranio y elemí; las Notas de Fondo son ambroxan, cedro y ládano.",
  },
  {
    id: 24,
    name: "Scandal Pour Homme",
    brand: "Jean Paul Gaultier",
    gender: "hombre",
    price: 33000,
    image: "/imagenes/Scandal-men-hombres.jpg",
    notes:"Las Notas Olfativas son: Caramelo, vetiver, amaderado y salvia esclarea🪵",
  },
  {
    id: 25,
    name: "Tom Ford - Oud Wood",
    brand: "tom ford",
    gender: "hombre",
    price: 33000,
    image: "/imagenes/Tomford-hombres.jpg",
    notes:"Notas de salida: Madera de oud, palo de rosa de brasil, cardamomo. Notas medias: Pimienta de Sichuan, sandalo, vetiver,Notas de fondo: Haba Tonka, vainilla, ambar.",
  },
  {
    id: 26,
    name: "212 Vip Rose",
    brand: "Carolina Herrera",
    gender: "mujer",
    price: 33000,
    image: "/imagenes/212-VipRose-mujer.jpg",
    notes:"Las Notas de Salida son champán y notas afrutadas; la Nota de Corazón es Peach Blossom; las Notas de Fondo son almizcle blanco, notas amaderadas y ámbar.",
  },
  {
    id: 27,
    name: "Scandal Le Parfum Intense",
    brand: "Jean Paul Gaultier",
    gender: "mujer",
    price: 33000,
    image: "/imagenes/Scandal-Le-Parfum-Intense-mujer.jpg",
    notes:"Las Notas Olfativas son: Flor de Azahar, tuberosa y Jazmín.",
  },
  {
    id: 28,
    name: "Olimpea- Intense-mujer",
    brand: "Paco Rabanne",
    gender: "mujer",
    price: 33000,
    image: "/imagenes/Olimpea-Intense-mujer.jpg",
    notes:"Las notas de salida son mandarina verde, jazmín de agua y flor de jengibre; las notas de corazón son vainilla y sal; las notas de fondo son ámbar gris, madera de cachemira y sándalo..",
  },
  {
    id: 29,
    name: "212-Sexy Fem",
    brand: "Carolina Herrera",
    gender: "mujer",
    price: 33000,
    image: "/imagenes/212-sexyFem-mujer.jpg",
    notes:"Las Notas de Salida son pimienta rosa, mandarina y bergamota; las Notas de Corazón son algodón de azúcar, gardenia, flores, pelargonio y rosa; las Notas de Fondo son vainilla, almizcle, sándalo, caramelo, pachulí y violeta.",
  },
  {
    id: 30,
    name: "Miss Millionaire Fabulous",
    brand: "Paco Rabanne",
    gender: "mujer",
    price: 33000,
    image: "/imagenes/Millionarire-mujer.jpg",
    notes:"Mandarina, Pimienta Rosa, Nardos, Jazmín, Vainilla, Haba Tonka Y Musgo",
  },
  {
    id: 31,
    name: "Bella-Leclat-100ml",
    brand: "Paco Rabanne",
    gender: "mujer",
    price: 33000,
    image: "/imagenes/Bella-Leclat-100ml.jpg",
    notes:"Mandarina, Pimienta Rosa, Nardos, Jazmín, Vainilla, Haba Tonka Y Musgo",
  },
  {
    id: 33,
    name: "One Million",
    brand: "Paco Rabanne",
    gender: "hombre",
    price: 33000,
    image: "/imagenes/One-Million-Hombre.jpg",
    notes:"Las Notas de Salida son mandarina roja, toronja (pomelo) y menta; las Notas de Corazón son canela, notas especiadas y rosa; las Notas de Fondo son ámbar, cuero, notas amaderadas y pachulí hindú.",
  },
  {
    id: 34,
    name: "Badboy X 50Ml. -Jacques Ryon MEN",
    brand: "Paco Rabanne",
    gender: "hombre",
    price: 12000,
    image: "/imagenes/minis/Bad-boy50ml.jpg",
    notes:"Las Notas son Cacao, Ambar, Salvia, Pimienta Negra Y Blanca, Bergamota ",
  },
  {
    id: 35,
    name: "Saulvag X 50Ml. - Jacques Ryon MEN",
    brand: "Christian Dior",
    gender: "hombre",
    price: 12000,
    image: "/imagenes/minis/sauvage-50ml.jpg",
    notes:"Las Notas son Cacao, Ambar, Salvia, Pimienta Negra Y Blanca, Bergamota ",
  },
  {
    id: 36,
    name: "Invicts X 50Ml. -Jacques Ryon MEN",
    brand: "Paco Rabanne",
    gender: "hombre",
    price: 12000,
    image: "/imagenes/minis/invictus-50ml.jpg",
    notes:"Las Notas son Cítrico Fresco, Notas Marinas, Madera, Pimienta Rosa ",
  },
  {
    id: 37,
    name: "12Heroes Men X 50Ml. - Jacques Ryon MEN",
    brand: "Carolina Herrera",
    gender: "hombre",
    price: 12000,
    image: "/imagenes/minis/invictus-50ml.jpg",
    notes:"Las Notas son Pera, Jengibre, Geranio, Salvia, Almizcle Y Cuero ",
  },
  // Agregar más productos aquí
]




export default function PerfumeCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("todos");
  const [priceRange, setPriceRange] = useState([0, 40000]);

  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null); // Para manejar el perfume seleccionado
  const [isModalOpen, setIsModalOpen] = useState(false); // Para abrir/cerrar el popup

 


  // Manejar la apertura del modal
  const handleOpenModal = (perfumes: Perfume) => {
    setSelectedPerfume(perfumes);
    setIsModalOpen(true);
  };

  // Manejar el cierre del modal
  const handleCloseModal = () => {
    setSelectedPerfume(null);
    setIsModalOpen(false);
  };

  const filteredPerfumes = perfumes.filter((perfume) => {
    const matchesSearch =
      perfume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perfume.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender =
      genderFilter === "todos" || perfume.gender === genderFilter;
    const matchesPrice =
      perfume.price >= priceRange[0] && perfume.price <= priceRange[1];
    return matchesSearch && matchesGender && matchesPrice;
  });
  const handleGenderChange = (value : string) => {
    setGenderFilter(value);
  };

  //MANEJO DE PERFUMES FAVORITOS
 
  const [favorites, setFavorites] = useState<Perfume[]>([])

  useEffect(() => {
    // Cargar favoritos desde localStorage al montar el componente
    const storedFavorites = localStorage.getItem('favorites')
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites))
    }
  }, [])

  useEffect(() => {
    // Guardar favoritos en localStorage cada vez que cambian
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  const addFavorite = (perfume: Perfume) => {
    setFavorites((prevFavorites) => [...prevFavorites, perfume]);
  };
  


  const removeFavorite = (perfumeId: number) => {
    setFavorites((prevFavorites) =>
      prevFavorites.filter((favorite) => favorite.id !== perfumeId)
    );
  };

  return (
    <>
    {/* CONTENIDO PRINCIPAL */}
   <div className="container  ">
    <div className=" p-10 h-full flex flex-col">
      <h1 className="text-4xl font-bold mb-7">Catálogo de Perfumes</h1>


      {/* CARRITO DE FAVORITOS */}
      <div className="absolute  top-18 right-20 flex flex-col gap-3 sm:gap-4 z-50">
      <FavoritesMenu  
      perfumes={favorites}
      onRemoveFavorite={(id: number) => removeFavorite(id)}>
      </FavoritesMenu>
      </div>
      
    <Contacto/>

      <div className="mb-6 space-y-4">
        <Input
          type="text"
          placeholder="Buscar perfumes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[100px]">
            {/* <Label className="mb-2 block">Género</Label> */}
            <RadioGroup  value={genderFilter} onValueChange={setGenderFilter}>
              <div className="flex items-center space-x-2 pt-2 ">
                <RadioGroupItem value="todos" id="todos" className="w-6 h-6" />
                <Button  variant="outline" type="button"onClick={() => handleGenderChange("todos")}>
                TODOS
                </Button>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <RadioGroupItem value="hombre" id="hombre" className="w-6 h-6" />
                <Button variant="outline" type="button"onClick={() => handleGenderChange("hombre")}>
                HOMBRES
                </Button>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <RadioGroupItem value="mujer" id="mujer" className="w-6 h-6"/>
                <Button variant="outline" type="button"onClick={() => handleGenderChange("mujer")}>
                MUJER
                </Button>
              </div>
            </RadioGroup>
          </div>

          <div className="flex-1 min-w-[200px]">
            <Label className="mb-2 block">Rango de Precio</Label>
            <Slider
              min={0}
              max={30000}
              step={10}
              value={priceRange}
              onValueChange={setPriceRange}
              className="w-full"
            />
            <div className="flex justify-between mt-2">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div> 
       </div>
      </div>

      <div
        className="flex flex-shrink w-full"
        style={{ gap: "10px", flexWrap: "wrap" }}
      >
        {filteredPerfumes.map((perfume) => (
          <Card
            key={perfume.id}
            style={{
              flex: "1",
              minWidth: "250px",
              maxWidth: "300px",
            }}
          >
            <CardHeader>
              <Image
                src={perfume.image}
                alt={`Imagen de ${perfume.name}`}
                width={300}
                height={300}
                className="w-full h-50 object-cover rounded-t-lg"
              />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg font-bold">{perfume.name}</CardTitle>
              <p className="text-sm text-gray-600 pt-2">{perfume.brand}</p>
              <p className="text-sm text-gray-600 capitalize pt-2">
                {perfume.gender}
              </p>
            </CardContent>

          <CardFooter className="flex justify-between">
            <div className="container">
              <div className="flex p-5">
              <span className="text-lg font-bold m-1">${perfume.price}</span>
              {/* Favoritos */}
                <FavoritesButton
                  productId={perfume.id}
                  isFavorite={favorites.some((favorite) => favorite.id === perfume.id)}
                  onToggleFavorite={(perfumeId) =>
                    favorites.some((favorite) => favorite.id === perfumeId)
                      ? removeFavorite(perfumeId)
                      : addFavorite(perfume)
                  }/>
                </div>
              {/* VER DETALLES */}
                <Button
                className="btn btn-primary  items-center justify-center m-1"
                onClick={() => handleOpenModal(perfume)}>
                Ver Detalles
                </Button>
              </div>

              {/* MODAL */}
                {isModalOpen && selectedPerfume && (
                      <div className="modal-overlay fixed inset-0 bg-opacity-50  flex items-center justify-center z-50">
                      <div className="modal bg-white rounded-lg p-6 shadow-lg max-w-md w-full text-center">
                        <h2 className="text-lg font-bold mb-4"><strong>{selectedPerfume.name}</strong></h2>
                        <p className="mb-4"><strong>Marca:</strong> {selectedPerfume.brand}</p>
                        <p className="mb-4"><strong>Notas:</strong> {selectedPerfume.notes}</p>
                        <Button
                          className="btn btn-secondary"
                          onClick={handleCloseModal}
                        >
                        Cerrar
                        </Button>
                        </div>
                      </div>
                    )}
          </CardFooter>
          </Card>
        ))}
      </div>

      {filteredPerfumes.length === 0 && (
        <p className="text-center text-gray-500 mt-6">
          No se encontraron perfumes que coincidan con tu búsqueda.
        </p>
      )}
      </div>
    </div>
    </>
  );
}
