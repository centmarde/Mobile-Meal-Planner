import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Modal, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import useUserStore from '../store/userStore';
import { Theme } from '../utils/theme';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Meal } from '../types/mealTypes';
import { fetchMeals, addMeal, updateMeal, deleteMeal, groupMealsByDate } from '../components/twoComponents/TwoOperations';

export default function TabTwoScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Form state for adding/editing meals
  const [mealName, setMealName] = useState('');
  const [mealTime, setMealTime] = useState('12:00 AM');
  const [mealType, setMealType] = useState('breakfast');

  useEffect(() => {
    if (useUserStore.getState().isAuthenticated) {
      loadMeals();
    }
  }, [useUserStore.getState().isAuthenticated]);

  const loadMeals = async () => {
    if (!useUserStore.getState().isAuthenticated) return;
    
    setLoading(true);
    const mealsList = await fetchMeals();
    setMeals(mealsList);
    setLoading(false);
  };

  const handleAddMeal = async () => {
    if (!useUserStore.getState().isAuthenticated) {
      Alert.alert('Error', 'You must be logged in to add meals');
      return;
    }
    
    const success = await addMeal(
      mealName,
      mealTime,
      mealType,
      selectedDate
    );
    
    if (success) {
      resetForm();
      loadMeals();
      setModalVisible(false);
    }
  };

  const handleUpdateMeal = async () => {
    if (!useUserStore.getState().isAuthenticated || !editingMeal) {
      Alert.alert('Error', 'You must be logged in to update meals');
      return;
    }
    
    const success = await updateMeal(
      editingMeal,
      mealName,
      mealTime,
      mealType,
      selectedDate
    );
    
    if (success) {
      resetForm();
      loadMeals();
      setModalVisible(false);
    }
  };

  const handleDeleteMeal = async (mealId: string, mealName: string) => {
    if (!useUserStore.getState().isAuthenticated) {
      Alert.alert('Error', 'You must be logged in to delete meals');
      return;
    }
    
    Alert.alert(
      'Delete Meal',
      `Are you sure you want to delete "${mealName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            const success = await deleteMeal(mealId);
            if (success) {
              loadMeals();
            }
          } 
        }
      ]
    );
  };

  const openAddModal = () => {
    resetForm();
    setEditingMeal(null);
    setModalVisible(true);
  };

  const openEditModal = (meal: Meal) => {
    setEditingMeal(meal);
    setMealName(meal.mealName);
    setMealTime(meal.mealTime);
    setMealType(meal.mealType);
    setSelectedDate(new Date(meal.date));
    setModalVisible(true);
  };

  const resetForm = () => {
    setMealName('');
    setMealTime('12:00 AM');
    setMealType('breakfast');
    setSelectedDate(new Date());
    setEditingMeal(null);
  };

  if (!useUserStore.getState().isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Please log in to view your meals</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meal Planner</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      ) : (
        <ScrollView style={styles.mealsList}>
          {Object.entries(groupMealsByDate(meals)).map(([date, dateMeals]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
              
              {dateMeals.map((meal) => (
                <View key={meal.id} style={styles.mealCard}>
                  <View style={styles.mealHeader}>
                    <Text style={styles.mealName}>{meal.mealName}</Text>
                    <Text style={styles.mealType}>{meal.mealTime} - {meal.mealType}</Text>
                  </View>
                  
                  {meal.mealDetails.strMealThumb ? (
                    <Image 
                      source={{ uri: meal.mealDetails.strMealThumb }} 
                      style={styles.mealImage} 
                    />
                  ) : null}
                  
                  <View style={styles.mealActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.editButton]} 
                      onPress={() => openEditModal(meal)}
                    >
                      <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton]} 
                      onPress={() => meal.id && handleDeleteMeal(meal.id, meal.mealName)}
                    >
                      <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
      
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={openAddModal}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingMeal ? 'Edit Meal' : 'Add New Meal'}
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Meal Name</Text>
              <TextInput
                style={styles.input}
                value={mealName}
                onChangeText={setMealName}
                placeholder="Enter meal name"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date</Text>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={(event: DateTimePickerEvent, date?: Date | undefined) => date && setSelectedDate(date)}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                value={mealTime}
                onChangeText={setMealTime}
                placeholder="e.g., 12:00 PM"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Meal Type</Text>
              <Picker
                selectedValue={mealType}
                onValueChange={(itemValue: string) => setMealType(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Breakfast" value="breakfast" />
                <Picker.Item label="Lunch" value="lunch" />
                <Picker.Item label="Dinner" value="dinner" />
                <Picker.Item label="Snack" value="snack" />
                <Picker.Item label="Midnight Snack" value="midnight_snack" />
              </Picker>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={editingMeal ? handleUpdateMeal : handleAddMeal}
              >
                <Text style={styles.buttonText}>{editingMeal ? 'Update' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.light,
    padding: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.dark,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  mealsList: {
    flex: 1,
  },
  dateGroup: {
    marginBottom: Theme.spacing.lg,
  },
  dateHeader: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.sm,
    padding: Theme.spacing.xs,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.roundness.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.light,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  mealName: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.dark,
    flex: 1,
  },
  mealType: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.primaryDark,
  },
  mealImage: {
    width: '100%',
    height: 150,
    borderRadius: Theme.roundness.sm,
    marginBottom: Theme.spacing.sm,
  },
  mealActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Theme.spacing.sm,
  },
  actionButton: {
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.roundness.sm,
    marginLeft: Theme.spacing.sm,
  },
  editButton: {
    backgroundColor: Theme.colors.primary,
  },
  deleteButton: {
    backgroundColor: Theme.colors.error,
  },
  buttonText: {
    color: Theme.colors.light,
    fontWeight: Theme.typography.weights.medium,
  },
  addButton: {
    position: 'absolute',
    bottom: Theme.spacing.lg,
    right: Theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.medium,
  },
  addButtonText: {
    fontSize: 28,
    color: Theme.colors.light,
    fontWeight: Theme.typography.weights.semibold,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.overlay,
  },
  modalContent: {
    width: '90%',
    backgroundColor: Theme.colors.light,
    borderRadius: Theme.roundness.md,
    padding: Theme.spacing.lg,
    ...Theme.shadows.medium,
  },
  modalTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.dark,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.dark,
    marginBottom: Theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Theme.colors.secondary,
    borderRadius: Theme.roundness.sm,
    padding: Theme.spacing.sm,
    fontSize: Theme.typography.sizes.md,
  },
  picker: {
    borderWidth: 1,
    borderColor: Theme.colors.secondary,
    borderRadius: Theme.roundness.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.md,
  },
  modalButton: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.roundness.md,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: Theme.spacing.xs,
  },
  cancelButton: {
    backgroundColor: Theme.colors.dark,
  },
  saveButton: {
    backgroundColor: Theme.colors.primary,
  },
});
