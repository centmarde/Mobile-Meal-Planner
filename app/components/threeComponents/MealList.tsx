import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Image } from 'react-native';
import { Theme } from '../../utils/theme';
import { getMealsForDate, formatSavedMealsForDisplay, SavedMeal } from '../../utils/mealPlanUtils';

interface MealListProps {
  date: string;
  meals?: string[]; // Now optional, as we'll fetch from Firestore
}

const MealList = ({ date }: MealListProps) => {
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<string[]>([]);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMeals();
  }, [date]);

  const fetchMeals = async () => {
    if (!date) return;
    
    setLoading(true);
    try {
      const fetchedMeals = await getMealsForDate(date);
      setSavedMeals(fetchedMeals);
      
      if (fetchedMeals.length > 0) {
        const formattedMeals = formatSavedMealsForDisplay(fetchedMeals);
        setMeals(formattedMeals);
      } else {
        setMeals([]);
      }
    } catch (err) {
      console.error('Error fetching meals:', err);
      setError('Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
        <Text style={styles.loadingText}>Loading meals...</Text>
      </View>
    );
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  if (!meals || meals.length === 0) {
    return <Text style={styles.noMealsText}>No meals planned for this day</Text>;
  }

  return (
    <View style={styles.mealsList}>
      <Text style={styles.mealsListTitle}>Planned Meals:</Text>
      {meals.map((meal, index) => {
        const savedMeal = savedMeals[index];
        return (
          <View key={index} style={[
            styles.mealItem,
            meal.includes('[breakfast]') && styles.breakfastMealItem,
            meal.includes('[lunch]') && styles.lunchMealItem,
            meal.includes('[dinner]') && styles.dinnerMealItem,
            meal.includes('[afternoon_snack]') && styles.afternoonSnackMealItem,
            meal.includes('[midnight_snack]') && styles.midnightSnackMealItem,
          ]}>
            {savedMeal?.mealDetails?.strMealThumb && (
              <Image 
                source={{ uri: savedMeal.mealDetails.strMealThumb }} 
                style={styles.mealImage}
              />
            )}
            <View style={styles.mealTextContainer}>
              <Text style={styles.mealText}>{meal}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  mealsList: {
    width: '100%',
  },
  mealsListTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold,
    marginBottom: Theme.spacing.sm,
    color: Theme.colors.dark,
  },
  mealItem: {
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.secondaryLight,
    borderRadius: Theme.roundness.sm,
    marginBottom: Theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakfastMealItem: {
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.warning,
  },
  lunchMealItem: {
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.success,
  },
  dinnerMealItem: {
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
  },
  afternoonSnackMealItem: {
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.warning,
  },
  midnightSnackMealItem: {
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.secondary,
  },
  mealText: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.dark,
  },
  noMealsText: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.secondary,
    fontStyle: 'italic',
    marginTop: Theme.spacing.sm,
  },
  loadingContainer: {
    padding: Theme.spacing.md,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Theme.spacing.sm,
    color: Theme.colors.secondary,
    fontSize: Theme.typography.sizes.md,
  },
  errorText: {
    color: Theme.colors.error,
    fontSize: Theme.typography.sizes.md,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Theme.spacing.md,
  },
  mealImage: {
    width: 50,
    height: 50,
    borderRadius: Theme.roundness.sm,
    marginRight: Theme.spacing.sm,
  },
  mealTextContainer: {
    flex: 1,
  },
});

export default MealList;
