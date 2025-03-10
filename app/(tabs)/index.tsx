import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Theme } from '../utils/theme';
import { useEffect, useState } from 'react';
import { useMealContext, Meal } from '../context/MealContext';
import { fetchRandomMeal } from '../services/mealService';
import MealDetailModal from '../components/MealDetailModal';

export default function TabOneScreen() {
  const { meals, setMeals, selectedMeal, setSelectedMeal } = useMealContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchRandomMeals = async (count: number) => {
    setLoading(true);
    setError(null);
    try {
      const mealPromises = Array(count).fill(0).map(() => fetchRandomMeal());
      const fetchedMeals = await Promise.all(mealPromises);
      setMeals(fetchedMeals.filter(meal => meal !== null) as Meal[]);
    } catch (err) {
      setError('Failed to fetch meals. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomMeals(6);
  }, []);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Random Meal Ideas</Text>
      
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
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  }
});