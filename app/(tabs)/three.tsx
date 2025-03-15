import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, Text, View, TextInput, ScrollView } from 'react-native';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../FirebaseConfig';
import { Theme } from '../utils/theme';
import { Calendar } from 'react-native-calendars';

export default function TabFourScreen() {
  const [functionResult, setFunctionResult] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [mealPlans, setMealPlans] = useState<{ [key: string]: string[] }>({});
  const [currentMeal, setCurrentMeal] = useState('');
  const [markedDates, setMarkedDates] = useState({});

  const callHelloWorldFunction = async () => {
    const functions = getFunctions(app, 'us-central1');
    const helloWorld = httpsCallable(functions, 'helloWorld');
    try {
      const result: any = await helloWorld();
      setFunctionResult(result.data.message);
    } catch (error) {
      console.error("Error calling function:", error);
      setFunctionResult('Failed to call function');
    }
  };

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

  const addMealPlan = () => {
    if (!currentMeal || !selectedDate) return;

    // Update meal plans state
    setMealPlans((prevPlans) => ({
      ...prevPlans,
      [selectedDate]: [...(prevPlans[selectedDate] || []), currentMeal]
    }));

    // Clear input field
    setCurrentMeal('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Meal Planner</Text>
          
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
              </Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Add meal..."
                  value={currentMeal}
                  onChangeText={setCurrentMeal}
                />
                <TouchableOpacity style={styles.addButton} onPress={addMealPlan}>
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>

              {mealPlans[selectedDate]?.length > 0 ? (
                <View style={styles.mealsList}>
                  <Text style={styles.mealsListTitle}>Planned Meals:</Text>
                  {mealPlans[selectedDate].map((meal, index) => (
                    <View key={index} style={styles.mealItem}>
                      <Text style={styles.mealText}>{meal}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noMealsText}>No meals planned for this day</Text>
              )}
            </View>
          ) : (
            <Text style={styles.text}>Select a date to plan your meals</Text>
          )}

          <View style={styles.functionSection}>
            <Text style={styles.text}>{functionResult}</Text>
            <TouchableOpacity style={styles.button} onPress={callHelloWorldFunction}>
              <Text style={styles.buttonText}>Call Hello World Function</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.light,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.lg,
    marginBottom: -Theme.spacing.xl,
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
    borderRadius: Theme.roundness.md,
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
  inputContainer: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: Theme.colors.secondaryLight,
    padding: Theme.spacing.sm,
    borderRadius: Theme.roundness.sm,
    marginRight: Theme.spacing.sm,
    fontSize: Theme.typography.sizes.md,
  },
  addButton: {
    padding: Theme.spacing.sm,
    borderRadius: Theme.roundness.md,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.medium,
  },
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
  functionSection: {
    marginTop: Theme.spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  button: {
    ...Theme.buttons.primary,
    marginLeft: Theme.spacing.sm,
  },
  buttonText: {
    ...Theme.buttons.text,
  },
  text: {
    color: Theme.colors.dark,
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    margin: Theme.spacing.lg,
  }
});