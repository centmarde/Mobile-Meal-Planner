import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Theme } from '../../utils/theme';
import { MealData } from '../../utils/mealPlanUtils';

interface MealDetailDialogProps {
  isVisible: boolean;
  onClose: () => void;
  mealId: string | null;
  onClear: () => void;
  onSuggest: () => void;
  onEditMeal: (name: string) => void;
}

const MealDetailDialog = ({ 
  isVisible, 
  onClose, 
  mealId, 
  onClear, 
  onSuggest,
  onEditMeal
}: MealDetailDialogProps) => {
  const [loading, setLoading] = useState(true);
  const [meal, setMeal] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible && mealId) {
      fetchMealDetails(mealId);
    }
  }, [isVisible, mealId]);

  const fetchMealDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      const data = await response.json();
      
      if (data.meals && data.meals.length > 0) {
        setMeal(data.meals[0]);
      } else {
        setError('No meal details found');
      }
    } catch (err) {
      setError('Failed to fetch meal details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMeal = () => {
    if (meal) {
      onEditMeal(meal.strMeal);
      onClose();
    }
  };

  const getIngredientsList = () => {
    if (!meal) return [];
    
    const ingredients = [];
    // The API returns ingredients as strIngredient1, strIngredient2, etc.
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim() !== '') {
        ingredients.push({
          name: ingredient,
          measure: measure || ''
        });
      }
    }
    
    return ingredients;
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Meal Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator size="large" color={Theme.colors.primary} />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : meal ? (
            <ScrollView style={styles.detailsContainer}>
              <Image 
                source={{ uri: meal.strMealThumb }} 
                style={styles.mealImage}
                resizeMode="cover"
              />
              
              <Text style={styles.mealName}>{meal.strMeal}</Text>
              <Text style={styles.mealCategory}>
                {meal.strCategory} • {meal.strArea}
              </Text>
              
              <Text style={styles.sectionTitle}>Ingredients</Text>
              {getIngredientsList().map((item, index) => (
                <Text key={index} style={styles.ingredient}>
                  • {item.name} {item.measure && `(${item.measure})`}
                </Text>
              ))}
              
              <Text style={styles.sectionTitle}>Instructions</Text>
              <Text style={styles.instructions}>{meal.strInstructions}</Text>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.button} 
                  onPress={handleEditMeal}
                >
                  <Text style={styles.buttonText}>Use This Meal</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.suggestButton]} 
                  onPress={onSuggest}
                >
                  <Text style={styles.buttonText}>Get New Suggestion</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.clearButton]} 
                  onPress={onClear}
                >
                  <Text style={styles.clearButtonText}>Clear & Enter Manually</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: Theme.colors.light,
    borderRadius: Theme.roundness.lg,
    padding: Theme.spacing.lg,
    ...Theme.shadows.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.dark,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Theme.colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: Theme.colors.dark,
    fontWeight: 'bold',
  },
  detailsContainer: {
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  errorText: {
    color: Theme.colors.error,
    marginBottom: Theme.spacing.md,
  },
  mealImage: {
    width: '100%',
    height: 200,
    borderRadius: Theme.roundness.md,
    marginBottom: Theme.spacing.md,
  },
  mealName: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.dark,
    marginBottom: Theme.spacing.xs,
  },
  mealCategory: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.secondary,
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.dark,
    marginBottom: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
  },
  ingredient: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.dark,
    marginBottom: Theme.spacing.xs,
  },
  instructions: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.dark,
    lineHeight: 22,
    marginBottom: Theme.spacing.md,
  },
  buttonContainer: {
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  button: {
    backgroundColor: Theme.colors.primary,
    padding: Theme.spacing.md,
    borderRadius: Theme.roundness.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
    ...Theme.shadows.light,
  },
  suggestButton: {
    backgroundColor: Theme.colors.success,
  },
  clearButton: {
    backgroundColor: Theme.colors.secondaryLight,
  },
  buttonText: {
    color: Theme.colors.light,
    fontWeight: Theme.typography.weights.semibold,
  },
  clearButtonText: {
    color: Theme.colors.dark,
    fontWeight: Theme.typography.weights.semibold,
  },
});

export default MealDetailDialog;
