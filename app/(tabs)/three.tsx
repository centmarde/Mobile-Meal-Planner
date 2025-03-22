import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { app, auth } from '../../FirebaseConfig';
import { Theme } from '../utils/theme';
import { Calendar } from 'react-native-calendars';
import TimeSelectionDialog, { MealTimeInfo } from '../components/TimeSelectionDialog';
import { getMealEmoji, MealData } from '../utils/mealPlanUtils';
import AddMealForm from '../components/threeComponents/AddMealForm';
import MealList from '../components/threeComponents/MealList';
import MealSuggestionDialog from '../components/threeComponents/MealSuggestionDialog';
import { useUserStore } from '../store/userStore';

export default function TabFourScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [mealPlans, setMealPlans] = useState<{ [key: string]: string[] }>({});
  const [markedDates, setMarkedDates] = useState({});
  const [isTimeDialogVisible, setIsTimeDialogVisible] = useState(false);
  const [isSuggestionDialogVisible, setIsSuggestionDialogVisible] = useState(false);
  const [selectedTimeInfo, setSelectedTimeInfo] = useState<MealTimeInfo | null>(null);
  const [suggestedMeal, setSuggestedMeal] = useState<MealData | null>(null);
  
  // Replace local auth state with userStore
  const { isAuthenticated, email, uid } = useUserStore();

  useEffect(() => {
    // Check if user is logged in
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        useUserStore.getState().setUser(user.email, user.uid);
      } else {
        useUserStore.getState().clearUser();
        Alert.alert('Authentication Required', 'Please log in to use the meal planner');
      }
      
      // Log the current user state
      console.log('User Store State:', {
        isAuthenticated: useUserStore.getState().isAuthenticated,
        email: useUserStore.getState().email,
        uid: useUserStore.getState().uid
      });
    });

    return () => unsubscribe();
  }, []);

  // Also log the user state whenever it's used in a render
  useEffect(() => {
    console.log('User authentication state in render:', { isAuthenticated, email, uid });
  }, [isAuthenticated, email, uid]);

  interface DayObject {
    dateString: string;
  }

  interface MarkedDates {
    [key: string]: {
      selected: boolean;
      selectedColor: string;
    };
  }

  const handleDateSelect = (day: DayObject) => {
    const selectedDate = day.dateString;
    setSelectedDate(selectedDate);

    // Show time selection dialog
    setIsTimeDialogVisible(true);

    // Mark the selected date
    const updatedMarkedDates: MarkedDates = {
      ...markedDates,
      [selectedDate]: {
        selected: true,
        selectedColor: Theme.colors.primary,
      }
    };
    setMarkedDates(updatedMarkedDates);
  };

  const handleSelectTime = (timeInfo: MealTimeInfo) => {
    setSelectedTimeInfo(timeInfo);
    
    // After selecting time, show the meal suggestion dialog
    setIsTimeDialogVisible(false);
    setIsSuggestionDialogVisible(true);
  };

  const handleSelectSuggestedMeal = (meal: MealData) => {
    setSuggestedMeal(meal);
    setIsSuggestionDialogVisible(false);
  };

  const handleManualInput = () => {
    setIsSuggestionDialogVisible(false);
    setSuggestedMeal(null);
  };

  const handleUpdateMealPlans = (updatedMealPlans: { [key: string]: string[] }) => {
    setMealPlans(updatedMealPlans);
    // Clear the suggested meal after adding it
    setSuggestedMeal(null);
    
    // Force refresh of the MealList by toggling a key or timestamp
    // This ensures the list updates after a new meal is added
    setSelectedDate(prev => {
      // Toggle the selected date to force a refresh, then set it back
      const temp = '';
      setTimeout(() => setSelectedDate(prev), 50);
      return temp;
    });
  };

  const handleRequestNewSuggestion = () => {
    // Re-open the suggestion dialog
    setIsSuggestionDialogVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        scrollEnabled={true} // Explicitly enable scrolling
        showsVerticalScrollIndicator={true} // Show scroll indicator
      >
        <View style={styles.container}>
        
          
          <Calendar
            onDayPress={handleDateSelect}
            markedDates={markedDates}
            theme={{
              calendarBackground: Theme.colors.light,
              textSectionTitleColor: Theme.colors.dark,
              selectedDayBackgroundColor: Theme.colors.primary,
              selectedDayTextColor: Theme.colors.light,
              todayTextColor: Theme.colors.secondary,
              dayTextColor: Theme.colors.dark,
              textDisabledColor: Theme.colors.secondaryLight,
              arrowColor: Theme.colors.primary,
              monthTextColor: Theme.colors.dark,
              indicatorColor: Theme.colors.primary,
            }}
            style={styles.calendar}
          />

          {selectedDate ? (
            <View style={styles.mealPlanSection}>
              <Text style={styles.dateTitle}>
                Meals for {selectedDate}
                {selectedTimeInfo && (
                  <Text>
                    {' '}{getMealEmoji(selectedTimeInfo.mealType)}{' '}
                    {selectedTimeInfo.mealType ? `(${selectedTimeInfo.mealType}, ` : '('}
                    {selectedTimeInfo.time})
                  </Text>
                )}
              </Text>
              
              {isAuthenticated ? (
                <>
                  <AddMealForm
                    selectedDate={selectedDate}
                    selectedTimeInfo={selectedTimeInfo}
                    onAddMeal={handleUpdateMealPlans}
                    existingMealPlans={mealPlans}
                    suggestedMeal={suggestedMeal}
                    onRequestNewSuggestion={handleRequestNewSuggestion}
                  />

                  <MealList 
                    date={selectedDate}
                  />
                </>
              ) : (
                <Text style={styles.loginPrompt}>
                  Please log in to plan your meals
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.text}>Select a date to plan your meals</Text>
          )}
        </View>
      </ScrollView>

      <TimeSelectionDialog 
        isVisible={isTimeDialogVisible}
        onClose={() => setIsTimeDialogVisible(false)}
        onSelectTime={handleSelectTime}
        selectedDate={selectedDate}
      />

      <MealSuggestionDialog
        isVisible={isSuggestionDialogVisible}
        onClose={() => setIsSuggestionDialogVisible(false)}
        onSelectMeal={handleSelectSuggestedMeal}
        onManualInput={handleManualInput}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Theme.colors.light,
    flex: 1, // Add flex: 1 to ensure it takes full height
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: Theme.spacing.md, // Add horizontal padding
  },
  container: {
    padding: 0,
    marginBottom: Theme.spacing.xl,
    // Remove any height constraints that might be limiting scrolling
  },
  title: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: Theme.spacing.lg,
    color: Theme.colors.dark,
  },
  calendar: {
    width: '100%',
    marginBottom: Theme.spacing.md,
    borderRadius: 0,
    ...Theme.shadows.light,
  },
  mealPlanSection: {
    width: '100%',
    marginTop: Theme.spacing.md,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.light,
    borderRadius: Theme.roundness.md,
    ...Theme.shadows.light,
  },
  dateTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: Theme.spacing.md,
    color: Theme.colors.dark,
  },
  text: {
    color: Theme.colors.dark,
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    margin: Theme.spacing.lg,
  },
  loginPrompt: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.secondary,
    textAlign: 'center',
    marginVertical: Theme.spacing.lg,
  },
});