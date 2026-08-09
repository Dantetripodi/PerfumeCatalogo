import React, { ReactNode, useEffect, useState } from "react";
import { FAVORITES_STORAGE_KEY, FavoritesContext } from "./favoriteState";

function loadFavorites() {
  try {
    const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return savedFavorites ? JSON.parse(savedFavorites) as number[] : [];
  } catch (error) {
    console.error("Error loading favorites from storage:", error);
    return [];
  }
}

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => loadFavorites());

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch (error) {
      console.error("Error saving favorites to storage:", error);
    }
  }, [favoriteIds]);

  const isFavorite = (id: number) => favoriteIds.includes(id);

  const toggleFavorite = (id: number) => {
    setFavoriteIds(prev =>
      prev.includes(id) ? prev.filter(favoriteId => favoriteId !== id) : [...prev, id]
    );
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
