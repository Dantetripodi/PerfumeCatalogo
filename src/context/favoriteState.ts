import { createContext } from "react";

export interface FavoritesContextValue {
  favoriteIds: number[];
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
}

export const FAVORITES_STORAGE_KEY = "dtfragancias_favorites";

export const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);
