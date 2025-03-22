import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Theme } from '../utils/theme';
import { MealTimeInfo } from './TimeSelectionDialog';

interface MealTypeSelectorProps {
  onSelectMeal: (timeInfo: MealTimeInfo) => void;
  selectedMealType?: string | null;
}

const MealTypeSelector = ({ onSelectMeal, selectedMealType }: MealTypeSelectorProps) => {
  const mealOptions = [
    { emoji: '🍳', type: 'breakfast', time: '8:00 AM', label: 'Breakfast' },
    { emoji: '🥗', type: 'lunch', time: '12:30 PM', label: 'Lunch' },
    { emoji: '🍽️', type: 'dinner', time: '7:00 PM', label: 'Dinner' },
    { emoji: '🍎', type: 'afternoon_snack', time: '3:30 PM', label: 'Afternoon' },
    { emoji: '🍪', type: 'midnight_snack', time: '11:30 PM', label: 'Midnight' }
  ];
  
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {mealOptions.map((meal, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.mealButton,
              selectedMealType === meal.type && styles.selectedMealButton
            ]}
            onPress={() => onSelectMeal({ time: meal.time, mealType: meal.type as any })}
          >
            <Text style={styles.mealEmoji}>{meal.emoji}</Text>
            <Text style={[
              styles.mealLabel,
              selectedMealType === meal.type && styles.selectedMealLabel
            ]}>
              {meal.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.secondaryLight,
    paddingVertical: Theme.spacing.xs,
  },
  scrollView: {
    flexDirection: 'row',
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
  },
  mealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    marginRight: Theme.spacing.sm,
    borderRadius: Theme.roundness.sm,
    borderWidth: 1,
    borderColor: Theme.colors.secondaryLight,
  },
  selectedMealButton: {
    backgroundColor: Theme.colors.primaryLight,
    borderColor: Theme.colors.primary,
  },
  mealEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  mealLabel: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.dark,
  },
  selectedMealLabel: {
    fontWeight: Theme.typography.weights.semibold,
  },
});

export default MealTypeSelector;
