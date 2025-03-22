export interface MealDetails {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions: string;
  ingredients: {
    ingredient: string;
    measure: string;
  }[];
}

export const fetchRandomMeal = async () => {
  try {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const data = await response.json();
    return data.meals[0];
  } catch (error) {
    console.error('Error fetching meal:', error);
    return null;
  }
};

export const fetchMealDetails = async (id: string): Promise<MealDetails | null> => {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await response.json();
    
    if (!data.meals || data.meals.length === 0) {
      return null;
    }
    
    const meal = data.meals[0];
    const ingredients = [];
    
    // TheMealDB API stores ingredients and measurements in numbered properties
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim() !== '') {
        ingredients.push({
          ingredient,
          measure: measure || ''
        });
      }
    }
    
    return {
      idMeal: meal.idMeal,
      strMeal: meal.strMeal,
      strMealThumb: meal.strMealThumb,
      strInstructions: meal.strInstructions,
      ingredients
    };
  } catch (error) {
    console.error('Error fetching meal details:', error);
    return null;
  }
};

// Add a default export that combines all meal service functions
const mealService = {
  fetchRandomMeal,
  fetchMealDetails,
};

export default mealService;
