import { PerfumeInput } from "../types";

// Estaban acá los 27 perfumes cargados a mano a $60.000. El proveedor vende
// todos, con su propio nombre — Sauvage es Wildest, Acqua di Gio es Acqua di
// Ydo, One Million es G. Millionaire — así que el catálogo los mostraba dos
// veces, y la versión curada salía entre $5.000 y $15.000 más cara.
//
// Se conservan los del proveedor: precio derivado del costo, notas completas y
// foto de producto. El nombre original sigue siendo buscable porque
// buildTags extrae el "Inspirado en …" de la descripción.
//
// Este archivo queda para perfumes que se quieran cargar a mano y que el
// proveedor no tenga. Lo que esté acá va primero en la asignación de ids.
export const perfumesRegulares: PerfumeInput[] = [];
