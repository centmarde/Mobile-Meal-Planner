import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import { Theme, Colors } from '../utils/theme';
import { useEffect, useState, useRef } from 'react';
import { useMealContext, Meal } from '../context/MealContext';
import { fetchRandomMeal } from '../services/mealService';
import MealDetailModal from '../components/MealDetailModal';
import { useUserStore } from '../store/userStore';
import { UserProfile, getOrCreateUserProfile, listenToUserProfile } from '../components/fourComponents/fourOperations';
import { Unsubscribe } from 'firebase/firestore';

export default function TabOneScreen() {
  const { meals, setMeals, selectedMeal, setSelectedMeal } = useMealContext();
  const { uid, isAuthenticated } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [usePreferences, setUsePreferences] = useState(true);
  const [filteringActive, setFilteringActive] = useState(false);
  
  // Use a ref to store the unsubscribe function
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  // Set up realtime listener when authenticated user changes
  useEffect(() => {
    if (isAuthenticated && uid) {
      // First ensure user has a profile
      getOrCreateUserProfile(uid, null)
        .then(() => {
          // Then set up the listener
          const unsubscribe = listenToUserProfile(uid, (profile) => {
            if (profile) {
              setUserProfile(profile);
              console.log('Received real-time profile update:', profile.displayName);
            }
          });
          
          // Store the unsubscribe function
          unsubscribeRef.current = unsubscribe;
        })
        .catch(error => {
          console.error('Error setting up user profile listener:', error);
        });
    } else {
      setUserProfile(null);
    }
    
    // Clean up the listener when component unmounts or user changes
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isAuthenticated, uid]);

  const fetchRandomMeals = async (count: number) => {
    setLoading(true);
    setError(null);
    try {
      // Check if we should apply dietary preference filters
      const shouldFilter = usePreferences && 
                           userProfile && 
                           userProfile.dietaryPreferences && 
                           userProfile.dietaryPreferences.length > 0;
      
      if (shouldFilter) {
        setFilteringActive(true);
        await fetchFilteredMeals(count, userProfile!.dietaryPreferences);
      } else {
        setFilteringActive(false);
        const mealPromises = Array(count).fill(0).map(() => fetchRandomMeal());
        const fetchedMeals = await Promise.all(mealPromises);
        setMeals(fetchedMeals.filter(meal => meal !== null) as Meal[]);
      }
    } catch (err) {
      setError('Failed to fetch meals. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch meals filtered by user's dietary preferences
  const fetchFilteredMeals = async (count: number, preferences: string[]) => {
    let filteredMeals: Meal[] = [];
    let attempts = 0;
    const maxAttempts = 20; // Limit the number of attempts to avoid infinite loops
    
    try {
      // Handle common dietary preferences
      const vegetarian = preferences.includes('Vegetarian');
      const vegan = preferences.includes('Vegan');
      const glutenFree = preferences.includes('Gluten-Free');
      
      // Keep fetching until we have the requested number of meals or reach max attempts
      while (filteredMeals.length < count && attempts < maxAttempts) {
        attempts++;
        
        // Fetch a random meal
        let meal = await fetchRandomMeal();
        if (!meal) continue;
        
        // Check if the meal matches dietary preferences
        let meetsPreferences = true;
        
        // Get categories and ingredients for filtering
        let categories: string[] = meal.strCategory ? [meal.strCategory] : [];
        let ingredients: string[] = [];
        
        // Extract ingredients from meal object
        for (let i = 1; i <= 20; i++) {
          const ingredient = meal[`strIngredient${i}`];
          if (ingredient && ingredient.trim() !== '') {
            ingredients.push(ingredient.toLowerCase());
          }
        }
        
        // Apply filters based on preferences
        if (vegan || vegetarian) {
          // Check for vegetarian category
          if (vegetarian && categories.includes('Vegetarian')) {
            // Good to include
          } else if (vegan) {
            // Exclude for vegans: meat, dairy, eggs, fish
            const nonVeganIngredients = [
              'chicken', 'beef', 'pork', 'meat', 'fish', 'salmon', 'tuna', 'milk',
              'cream', 'cheese', 'butter', 'yogurt', 'egg', 'honey'
            ];
            if (nonVeganIngredients.some(item => 
                ingredients.some(ing => ing.includes(item)))) {
              meetsPreferences = false;
            }
          } else if (vegetarian) {
            // Exclude for vegetarians: meat, fish
            const nonVegetarianIngredients = [
              'chicken', 'beef', 'pork', 'meat', 'fish', 'salmon', 'tuna'
            ];
            if (nonVegetarianIngredients.some(item => 
                ingredients.some(ing => ing.includes(item)))) {
              meetsPreferences = false;
            }
          }
        }
        
        if (glutenFree) {
          // Exclude gluten-containing ingredients
          const glutenIngredients = [
            'flour', 'bread', 'pasta', 'wheat', 'barley', 'rye'
          ];
          if (glutenIngredients.some(item => 
              ingredients.some(ing => ing.includes(item)))) {
            meetsPreferences = false;
          }
        }
        
        // Handle other preferences as needed (Pescatarian, Keto, Paleo)
        if (preferences.includes('Pescatarian')) {
          const nonPescatarianIngredients = [
            'chicken', 'beef', 'pork', 'meat'
          ];
          if (nonPescatarianIngredients.some(item => 
              ingredients.some(ing => ing.includes(item)))) {
            meetsPreferences = false;
          }
        }
        
        if (preferences.includes('Keto')) {
          const nonKetoIngredients = [
            'sugar', 'honey', 'maple syrup', 'corn', 'pasta', 'rice', 'potato'
          ];
          if (nonKetoIngredients.some(item => 
              ingredients.some(ing => ing.includes(item)))) {
            meetsPreferences = false;
          }
        }
        
        if (preferences.includes('Paleo')) {
          const nonPaleoIngredients = [
            'dairy', 'milk', 'cheese', 'yogurt', 'grain', 'pasta', 
            'bread', 'cereal', 'rice', 'bean', 'legume'
          ];
          if (nonPaleoIngredients.some(item => 
              ingredients.some(ing => ing.includes(item)))) {
            meetsPreferences = false;
          }
        }
        
        // If the meal meets all the preferences, add it to our results
        if (meetsPreferences) {
          filteredMeals.push(meal);
        }
      }
      
      // If we couldn't find enough meals that match preferences, fetch random ones
      if (filteredMeals.length < count) {
        setError(`Could only find ${filteredMeals.length} meals matching your preferences. Try disabling preference filtering for more options.`);
      }
      
      setMeals(filteredMeals);
    } catch (err) {
      console.error('Error filtering meals:', err);
      throw err;
    }
  };

  // Reload meals when profile or preference toggle changes
  useEffect(() => {
    if (userProfile) {
      console.log('Profile or preferences changed, refreshing meals');
      fetchRandomMeals(6);
    }
  }, [userProfile, usePreferences]);

  const handleRefresh = () => {
    fetchRandomMeals(6);
  };

  const handleMealPress = (mealId: string) => {
    setSelectedMeal(mealId);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const toggleUsePreferences = () => {
    setUsePreferences(!usePreferences);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Random Meal Ideas</Text>
      
      {/* Preference filter toggle */}
      {isAuthenticated && (userProfile?.dietaryPreferences?.length ?? 0) > 0 && (
        <View style={styles.preferencesContainer}>
          <Text style={styles.preferencesLabel}>Filter by my preferences</Text>
          <Switch
            value={usePreferences}
            onValueChange={toggleUsePreferences}
            trackColor={{ false: Colors.secondaryLight, true: Colors.primaryLight }}
            thumbColor={usePreferences ? Colors.primary : Colors.secondary}
          />
        </View>
      )}
      
      {/* Show active filters */}
      {filteringActive && usePreferences && userProfile?.dietaryPreferences && userProfile.dietaryPreferences.length > 0 && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersLabel}>Active filters:</Text>
          <View style={styles.filtersRow}>
            {userProfile && userProfile.dietaryPreferences.map(pref => (
              <View key={pref} style={styles.filterTag}>
                <Text style={styles.filterTagText}>{pref}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshButtonText}>Refresh Meals</Text>
      </TouchableOpacity>
      
      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.mealsContainer}>
          {meals.map(meal => (
            <TouchableOpacity 
              key={meal.idMeal} 
              style={styles.mealCard}
              onPress={() => handleMealPress(meal.idMeal)}
            >
              <Image 
                source={{ uri: meal.strMealThumb }} 
                style={styles.mealImage}
                resizeMode="cover"
              />
              <Text style={styles.mealName}>{meal.strMeal}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      
      <MealDetailModal 
        isVisible={modalVisible}
        onClose={handleCloseModal}
        mealId={selectedMeal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.light,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Theme.colors.primary,
  },
  mealsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  mealCard: {
    width: '45%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mealImage: {
    width: '100%',
    height: 120,
  },
  mealName: {
    padding: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    height: 60,
  },
  refreshButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    color: Colors.error,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  preferencesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    backgroundColor: Colors.light,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    ...Theme.shadows.light,
  },
  preferencesLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark,
  },
  activeFiltersContainer: {
    width: '90%',
    marginBottom: 15,
    backgroundColor: Colors.primaryLight,
    padding: 10,
    borderRadius: 8,
  },
  activeFiltersLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light,
    marginBottom: 5,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterTag: {
    backgroundColor: Colors.light,
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 10,
    margin: 2,
  },
  filterTagText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
});