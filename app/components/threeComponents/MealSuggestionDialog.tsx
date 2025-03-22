import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Theme } from '../../utils/theme';
import { MealData } from '../../utils/mealPlanUtils';

interface MealSuggestionDialogProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectMeal: (meal: MealData) => void;
  onManualInput: () => void;
}

const MealSuggestionDialog = ({ 
  isVisible, 
  onClose, 
  onSelectMeal,
  onManualInput 
}: MealSuggestionDialogProps) => {
  const [loading, setLoading] = useState(true);
  const [meal, setMeal] = useState<MealData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomMeal = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
      const data = await response.json();
      
      if (data.meals && data.meals.length > 0) {
        setMeal(data.meals[0]);
      } else {
        setError('No meal found');
      }
    } catch (err) {
      setError('Failed to fetch meal suggestion');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchRandomMeal();
    }
  }, [isVisible]);

  const handleSelectMeal = () => {
    if (meal) {
      onSelectMeal(meal);
    }
    onClose();
  };

  const handleRefresh = () => {
    fetchRandomMeal();
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
          <Text style={styles.title}>Meal Suggestion</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color={Theme.colors.primary} />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.button} onPress={handleRefresh}>
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : meal ? (
            <View style={styles.mealContainer}>
              <Image 
                source={{ uri: meal.strMealThumb }} 
                style={styles.mealImage}
                resizeMode="cover"
              />
              <Text style={styles.mealName}>{meal.strMeal}</Text>
              <Text style={styles.mealDetails}>
                {meal.strCategory} • {meal.strArea}
              </Text>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleSelectMeal}>
                  <Text style={styles.buttonText}>Select This Meal</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.secondaryButton]} 
                  onPress={handleRefresh}
                >
                  <Text style={styles.secondaryButtonText}>Get Another Suggestion</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.manualButton]} 
                  onPress={onManualInput}
                >
                  <Text style={styles.secondaryButtonText}>Enter Meal Manually</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={onClose}
                >
                  <Text style={styles.secondaryButtonText}>No Thanks</Text>
                </TouchableOpacity>
              </View>
            </View>
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
    width: '85%',
    backgroundColor: Theme.colors.light,
    borderRadius: Theme.roundness.lg,
    padding: Theme.spacing.lg,
    ...Theme.shadows.medium,
  },
  title: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.dark,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  errorText: {
    color: Theme.colors.error,
    marginBottom: Theme.spacing.md,
  },
  mealContainer: {
    alignItems: 'center',
  },
  mealImage: {
    width: '100%',
    height: 200,
    borderRadius: Theme.roundness.md,
    marginBottom: Theme.spacing.md,
  },
  mealName: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.dark,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  mealDetails: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.secondary,
    marginBottom: Theme.spacing.md,
  },
  buttonContainer: {
    width: '100%',
    marginTop: Theme.spacing.sm,
  },
  button: {
    backgroundColor: Theme.colors.primary,
    padding: Theme.spacing.md,
    borderRadius: Theme.roundness.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
    ...Theme.shadows.light,
  },
  secondaryButton: {
    backgroundColor: Theme.colors.secondaryLight,
  },
  cancelButton: {
    backgroundColor: Theme.colors.light,
    borderWidth: 1,
    borderColor: Theme.colors.secondary,
  },
  buttonText: {
    color: Theme.colors.light,
    fontWeight: Theme.typography.weights.semibold,
  },
  secondaryButtonText: {
    color: Theme.colors.dark,
  },
  manualButton: {
    backgroundColor: Theme.colors.secondaryLight,
    borderWidth: 1,
    borderColor: Theme.colors.secondary,
  },
});

export default MealSuggestionDialog;
