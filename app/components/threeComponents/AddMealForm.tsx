import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, TextInput, Image, Alert } from 'react-native';
import { Theme } from '../../utils/theme';
import { MealTimeInfo } from '../TimeSelectionDialog';
import { addMealPlan, MealData, saveMealToFirestore } from '../../utils/mealPlanUtils';
import MealDetailDialog from './MealDetailDialog';

interface AddMealFormProps {
  selectedDate: string;
  selectedTimeInfo: MealTimeInfo | null;
  onAddMeal: (updatedMealPlans: { [key: string]: string[] }) => void;
  existingMealPlans: { [key: string]: string[] };
  suggestedMeal?: MealData | null;
  onRequestNewSuggestion: () => void;
}

const AddMealForm = ({ 
  selectedDate, 
  selectedTimeInfo, 
  onAddMeal,
  existingMealPlans,
  suggestedMeal,
  onRequestNewSuggestion
}: AddMealFormProps) => {
  const [currentMeal, setCurrentMeal] = useState('');
  const [isManualMode, setIsManualMode] = useState(!suggestedMeal);
  const [isDetailDialogVisible, setIsDetailDialogVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update current meal when a suggestion is provided
  useEffect(() => {
    if (suggestedMeal) {
      setCurrentMeal(suggestedMeal.strMeal);
      setIsManualMode(false);
    } else {
      setIsManualMode(true);
    }
  }, [suggestedMeal]);

  const handleAddMealPlan = async () => {
    if (!currentMeal || !selectedDate) return;
    
    setIsSaving(true);
    
    try {
      // Save to Firestore
      const mealId = await saveMealToFirestore(
        currentMeal, 
        selectedDate, 
        selectedTimeInfo, 
        isManualMode ? null : suggestedMeal || null
      );
      
      if (mealId) {
        // Use the extracted utility function with meal data if available
        const updatedMealPlans = addMealPlan(
          currentMeal,
          selectedDate,
          selectedTimeInfo,
          existingMealPlans,
          isManualMode ? null : suggestedMeal
        );
        
        onAddMeal(updatedMealPlans);
        setCurrentMeal('');
        setIsManualMode(true);
      } else {
        Alert.alert('Error', 'Failed to save meal. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleAddMealPlan:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const switchToManualMode = () => {
    // Instead of immediately going to manual mode, show the detail dialog
    if (suggestedMeal) {
      setIsDetailDialogVisible(true);
    } else {
      setIsManualMode(true);
      setCurrentMeal('');
    }
  };

  const handleClearMeal = () => {
    setIsManualMode(true);
    setCurrentMeal('');
    setIsDetailDialogVisible(false);
  };

  const handleSuggestNewMeal = () => {
    setIsDetailDialogVisible(false);
    onRequestNewSuggestion();
  };

  const handleEditMealName = (newName: string) => {
    setCurrentMeal(newName);
  };

  return (
    <View style={styles.container}>
      {!isManualMode && suggestedMeal && (
        <View style={styles.suggestionContainer}>
          <Image 
            source={{ uri: suggestedMeal.strMealThumb }} 
            style={styles.mealImage}
            resizeMode="cover"
          />
          <View style={styles.mealInfo}>
            <Text style={styles.mealName}>{suggestedMeal.strMeal}</Text>
            <Text style={styles.mealCategory}>
              {suggestedMeal.strCategory} • {suggestedMeal.strArea}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={switchToManualMode}
          >
            <Text style={styles.editButtonText}>View</Text>
          </TouchableOpacity>
        </View>
      )}

      {isManualMode && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add meal..."
            value={currentMeal}
            onChangeText={setCurrentMeal}
          />
        </View>
      )}

      <TouchableOpacity 
        style={[
          styles.addButton, 
          !isManualMode && styles.confirmButton,
          isSaving && styles.disabledButton
        ]} 
        onPress={handleAddMealPlan}
        disabled={isSaving}
      >
        <Text style={styles.buttonText}>
          {isSaving 
            ? 'Saving...' 
            : isManualMode ? 'Add' : 'Confirm'}
        </Text>
      </TouchableOpacity>

      <MealDetailDialog 
        isVisible={isDetailDialogVisible}
        onClose={() => setIsDetailDialogVisible(false)}
        mealId={suggestedMeal?.idMeal || null}
        onClear={handleClearMeal}
        onSuggest={handleSuggestNewMeal}
        onEditMeal={handleEditMealName}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Theme.colors.secondaryLight,
    padding: Theme.spacing.sm,
    borderRadius: Theme.roundness.sm,
    fontSize: Theme.typography.sizes.md,
  },
  suggestionContainer: {
    backgroundColor: Theme.colors.secondaryLight,
    borderRadius: Theme.roundness.md,
    padding: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: Theme.roundness.sm,
    marginRight: Theme.spacing.sm,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.dark,
  },
  mealCategory: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.secondary,
  },
  editButton: {
    padding: Theme.spacing.xs,
    backgroundColor: Theme.colors.secondaryLight,
    borderRadius: Theme.roundness.sm,
    borderWidth: 1,
    borderColor: Theme.colors.secondary,
  },
  editButtonText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.dark,
  },
  addButton: {
    padding: Theme.spacing.sm,
    borderRadius: Theme.roundness.md,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.medium,
  },
  confirmButton: {
    backgroundColor: Theme.colors.success,
  },
  buttonText: {
    ...Theme.buttons.text,
  },
  disabledButton: {
    backgroundColor: Theme.colors.secondaryLight,
    opacity: 0.7,
  },
});

export default AddMealForm;
