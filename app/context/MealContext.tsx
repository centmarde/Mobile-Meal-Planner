import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

interface MealContextType {
  meals: Meal[];
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
  selectedMeal: string | null;
  setSelectedMeal: React.Dispatch<React.SetStateAction<string | null>>;
  favorites: Meal[];
  addToFavorites: (meal: Meal) => void;
  removeFromFavorites: (mealId: string) => void;
  isFavorite: (mealId: string) => boolean;
}

const MealContext = createContext<MealContextType | undefined>(undefined);

export const MealProvider = ({ children }: { children: ReactNode }) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Meal[]>([]);

  const addToFavorites = (meal: Meal) => {
    setFavorites(prev => [...prev, meal]);
  };

  const removeFromFavorites = (mealId: string) => {
    setFavorites(prev => prev.filter(meal => meal.idMeal !== mealId));
  };

  const isFavorite = (mealId: string) => {
    return favorites.some(meal => meal.idMeal === mealId);
  };

  return (
    <MealContext.Provider 
      value={{ 
        meals, 
        setMeals, 
        selectedMeal, 
        setSelectedMeal,
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite
      }}
    >
      {children}
    </MealContext.Provider>
  );
};

export const useMealContext = (): MealContextType => {
  const context = useContext(MealContext);
  if (context === undefined) {
    throw new Error('useMealContext must be used within a MealProvider');
  }
  return context;
};

// Add default export for the MealProvider component
export default MealProvider;
