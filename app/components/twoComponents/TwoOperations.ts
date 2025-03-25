import { Alert } from 'react-native';
import { db } from '../../../FirebaseConfig';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Meal } from '../../types/mealTypes';
import useUserStore from '../../store/userStore';

// Get the current user id from the store
const getCurrentUserId = () => {
  return useUserStore.getState().uid;
};

// This function now returns an unsubscribe function for cleanup
export const subscribeToMeals = (
  onMealsUpdate: (meals: Meal[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const uid = getCurrentUserId();
  
  if (!useUserStore.getState().isAuthenticated || !uid) {
    console.log('User not authenticated');
    onMealsUpdate([]);
    return () => {}; // Empty unsubscribe function when not authenticated
  }
  
  try {
    const mealsQuery = query(
      collection(db, 'meals'),
      where('userId', '==', uid),
      orderBy('date', 'asc')
    );
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(mealsQuery, 
      (querySnapshot) => {
        const mealsList: Meal[] = [];
        querySnapshot.forEach((doc) => {
          mealsList.push({ id: doc.id, ...doc.data() } as Meal);
        });
        onMealsUpdate(mealsList);
      },
      (error) => {
        console.error('Error in meals subscription:', error);
        if (onError) onError(error);
        Alert.alert('Error', 'Failed to load meals');
      }
    );
    
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up meals subscription:', error);
    Alert.alert('Error', 'Failed to set up meals subscription');
    return () => {}; // Return empty function in case of error
  }
};

// Keep the original fetchMeals for backward compatibility if needed
export const fetchMeals = async (): Promise<Meal[]> => {
  const uid = getCurrentUserId();
  
  if (!useUserStore.getState().isAuthenticated || !uid) {
    console.log('User not authenticated');
    return [];
  }
  
  try {
    const mealsQuery = query(
      collection(db, 'meals'),
      where('userId', '==', uid),
      orderBy('date', 'asc')
    );
    
    const querySnapshot = await getDocs(mealsQuery);
    const mealsList: Meal[] = [];
    
    querySnapshot.forEach((doc) => {
      mealsList.push({ id: doc.id, ...doc.data() } as Meal);
    });
    
    return mealsList;
  } catch (error) {
    console.error('Error fetching meals:', error);
    Alert.alert('Error', 'Failed to fetch meals');
    return [];
  }
};

export const addMeal = async (
  mealName: string,
  mealTime: string,
  mealType: string,
  selectedDate: Date
): Promise<boolean> => {
  const uid = getCurrentUserId();
  
  if (!useUserStore.getState().isAuthenticated || !uid) {
    Alert.alert('Error', 'You must be logged in to add meals');
    return false;
  }
  
  try {
    // Create a new meal object
    const newMeal: Omit<Meal, 'id'> = {
      date: selectedDate.toISOString().split('T')[0],
      mealDetails: {
        idMeal: Math.random().toString(36).substring(2, 9),
        strMeal: mealName,
        strCategory: '',
        strArea: '',
        strInstructions: '',
        strMealThumb: '',
      },
      mealName,
      mealTime,
      mealType,
      timestamp: Date.now(),
      userId: uid,
    };
    
    await addDoc(collection(db, 'meals'), newMeal);
    return true;
  } catch (error) {
    console.error('Error adding meal:', error);
    Alert.alert('Error', 'Failed to add meal');
    return false;
  }
};

export const updateMeal = async (
  editingMeal: Meal,
  mealName: string,
  mealTime: string,
  mealType: string,
  selectedDate: Date
): Promise<boolean> => {
  if (!useUserStore.getState().isAuthenticated || !editingMeal?.id) {
    Alert.alert('Error', 'You must be logged in to update meals');
    return false;
  }
  
  try {
    const updatedMeal = {
      ...editingMeal,
      mealName,
      mealTime,
      mealType,
      date: selectedDate.toISOString().split('T')[0],
      timestamp: Date.now(),
    };
    
    await updateDoc(doc(db, 'meals', editingMeal.id), updatedMeal);
    return true;
  } catch (error) {
    console.error('Error updating meal:', error);
    Alert.alert('Error', 'Failed to update meal');
    return false;
  }
};

export const deleteMeal = async (mealId: string, mealName: string): Promise<boolean> => {
  if (!useUserStore.getState().isAuthenticated) {
    Alert.alert('Error', 'You must be logged in to delete meals');
    return false;
  }
  
  try {
    await deleteDoc(doc(db, 'meals', mealId));
    return true;
  } catch (error) {
    console.error('Error deleting meal:', error);
    Alert.alert('Error', 'Failed to delete meal');
    return false;
  }
};

// Helper function to group meals by date
export const groupMealsByDate = (meals: Meal[]): { [date: string]: Meal[] } => {
  const groupedMeals: { [date: string]: Meal[] } = {};
  
  meals.forEach((meal) => {
    if (!groupedMeals[meal.date]) {
      groupedMeals[meal.date] = [];
    }
    groupedMeals[meal.date].push(meal);
  });
  
  return groupedMeals;
};
