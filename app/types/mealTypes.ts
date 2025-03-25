// Define the meal interface
export interface MealDetails {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strIngredient1?: string;
  strIngredient2?: string;
  strIngredient3?: string;
  // ... other ingredients
  strMeasure1?: string;
  strMeasure2?: string;
  strMeasure3?: string;
  // ... other measures
}

export interface Meal {
  id?: string;
  date: string;
  mealDetails: MealDetails;
  mealName: string;
  mealTime: string;
  mealType: string;
  timestamp: number;
  userId: string;
}
