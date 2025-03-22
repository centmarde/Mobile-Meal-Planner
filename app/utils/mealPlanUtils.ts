import { MealTimeInfo } from '../components/TimeSelectionDialog';
import { db, auth } from '../../FirebaseConfig';
import { collection, addDoc, query, where, getDocs, DocumentData } from 'firebase/firestore';

export interface MealData {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
}

export interface SavedMeal {
  id?: string;
  userId: string;
  date: string;
  mealTime: string;
  mealType: string | null;
  mealName: string;
  mealDetails?: {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
    strCategory: string;
    strArea: string;
  } | null;
  timestamp: number;
}

// Helper function to get meal emoji
export const getMealEmoji = (mealType: string | undefined | null) => {
  switch(mealType) {
    case 'breakfast': return '🍳';
    case 'lunch': return '🥗';
    case 'dinner': return '🍽️';
    case 'afternoon_snack': return '🍎';
    case 'midnight_snack': return '🍪';
    default: return '🕒';
  }
};

export const createMealDescription = (
  currentMeal: string, 
  selectedTimeInfo: MealTimeInfo | null,
  mealData?: MealData | null
): string => {
  if (!selectedTimeInfo) return currentMeal;
  
  const mealEmoji = getMealEmoji(selectedTimeInfo.mealType);
  let description = currentMeal;
  
  // Add meal metadata if available
  if (mealData) {
    description = `${currentMeal} (${mealData.strCategory}, ${mealData.strArea})`;
  }
  
  if (selectedTimeInfo.mealType) {
    return `${mealEmoji} [${selectedTimeInfo.mealType}] ${description} (${selectedTimeInfo.time})`;
  } else {
    return `${mealEmoji} ${description} (${selectedTimeInfo.time})`;
  }
};

export const addMealPlan = (
  currentMeal: string,
  selectedDate: string,
  selectedTimeInfo: MealTimeInfo | null,
  existingMealPlans: { [key: string]: string[] },
  mealData?: MealData | null
): { [key: string]: string[] } => {
  if (!currentMeal || !selectedDate) return existingMealPlans;

  // Build meal description with time and meal type
  const mealDescription = createMealDescription(currentMeal, selectedTimeInfo, mealData);

  // Update meal plans state
  return {
    ...existingMealPlans,
    [selectedDate]: [...(existingMealPlans[selectedDate] || []), mealDescription]
  };
};

// Save meal to Firestore
export const saveMealToFirestore = async (
  meal: string,
  date: string,
  timeInfo: MealTimeInfo | null,
  mealData: MealData | null
): Promise<string | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('No authenticated user found');
      return null;
    }

    const mealToSave: SavedMeal = {
      userId: currentUser.uid,
      date: date,
      mealTime: timeInfo?.time || '',
      mealType: timeInfo?.mealType || null,
      mealName: meal,
      mealDetails: mealData || null,
      timestamp: Date.now()
    };

    const docRef = await addDoc(collection(db, 'meals'), mealToSave);
    return docRef.id;
  } catch (error) {
    console.error('Error saving meal to Firestore:', error);
    return null;
  }
};

// Get meals for a specific date
export const getMealsForDate = async (date: string): Promise<SavedMeal[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('No authenticated user found');
      return [];
    }

    const q = query(
      collection(db, 'meals'),
      where('userId', '==', currentUser.uid),
      where('date', '==', date)
    );

    const querySnapshot = await getDocs(q);
    const meals: SavedMeal[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as SavedMeal;
      meals.push({
        ...data,
        id: doc.id
      });
    });

    return meals;
  } catch (error) {
    console.error('Error fetching meals from Firestore:', error);
    return [];
  }
};

// Convert saved meals to display format
export const formatSavedMealsForDisplay = (meals: SavedMeal[]): string[] => {
  return meals.map(meal => {
    const mealEmoji = getMealEmoji(meal.mealType);
    let description = meal.mealName;
    
    if (meal.mealDetails) {
      description = `${meal.mealName} (${meal.mealDetails.strCategory}, ${meal.mealDetails.strArea})`;
    }
    
    if (meal.mealType) {
      return `${mealEmoji} [${meal.mealType}] ${description} (${meal.mealTime})`;
    } else {
      return `${mealEmoji} ${description} (${meal.mealTime})`;
    }
  });
};

// Default export combining all meal plan utilities
export default {
  getMealEmoji,
  createMealDescription,
  addMealPlan,
  saveMealToFirestore,
  getMealsForDate,
  formatSavedMealsForDisplay
};
