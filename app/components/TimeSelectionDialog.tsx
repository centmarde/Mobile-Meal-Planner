import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Theme } from '../utils/theme';
import MealTypeSelector from './MealTypeSelector';

// Update meal type interface to include new types
export interface MealTimeInfo {
  time: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'afternoon_snack' | 'midnight_snack' | null;
}

interface TimeSelectionDialogProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectTime: (timeInfo: MealTimeInfo) => void;
  selectedDate: string;
}

const TimeSelectionDialog = ({ 
  isVisible, 
  onClose, 
  onSelectTime, 
  selectedDate 
}: TimeSelectionDialogProps) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<MealTimeInfo | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const timeSlotRefs = useRef<{ [key: string]: number }>({});
  const [contentVerticalOffset, setContentVerticalOffset] = useState(0);
  
  // Generate time slots with meal type suggestions
  const generateTimeSlots = (): MealTimeInfo[] => {
    const slots: MealTimeInfo[] = [];
    
    // Define suggested meal times including new snack options
    const suggestedMeals: {[key: string]: 'breakfast' | 'lunch' | 'dinner' | 'afternoon_snack' | 'midnight_snack'} = {
      // Breakfast times
      '7:00 AM': 'breakfast',
      '7:30 AM': 'breakfast',
      '8:00 AM': 'breakfast',
      '8:30 AM': 'breakfast',
      // Lunch times
      '12:00 PM': 'lunch',
      '12:30 PM': 'lunch',
      '1:00 PM': 'lunch',
      '1:30 PM': 'lunch',
      // Afternoon snack times
      '3:00 PM': 'afternoon_snack',
      '3:30 PM': 'afternoon_snack',
      '4:00 PM': 'afternoon_snack',
      // Dinner times
      '6:00 PM': 'dinner',
      '6:30 PM': 'dinner',
      '7:00 PM': 'dinner',
      '7:30 PM': 'dinner',
      // Midnight snack times
      '11:00 PM': 'midnight_snack',
      '11:30 PM': 'midnight_snack',
      '12:00 AM': 'midnight_snack',
      '12:30 AM': 'midnight_snack',
    };

    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const displayMinute = minute === 0 ? '00' : minute;
        const timeString = `${displayHour}:${displayMinute} ${period}`;
        
        const timeInfo: MealTimeInfo = {
          time: timeString,
          mealType: suggestedMeals[timeString] || null
        };
        
        slots.push(timeInfo);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Keep track of scroll position for accurate scrolling
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setContentVerticalOffset(event.nativeEvent.contentOffset.y);
  };

  const scrollToTimeSlot = (time: string) => {
    if (scrollViewRef.current && timeSlotRefs.current[time] !== undefined) {
      // Scroll to the position with some padding for better visibility
      scrollViewRef.current.scrollTo({
        y: timeSlotRefs.current[time] - 80,
        animated: true,
      });
    }
  };

  const handleMealSelection = (timeInfo: MealTimeInfo) => {
    setSelectedTimeSlot(timeInfo);
    
    // Add a small delay to ensure the component has rendered
    setTimeout(() => {
      scrollToTimeSlot(timeInfo.time);
    }, 100);
  };

  const handleTimeSelection = (timeInfo: MealTimeInfo) => {
    setSelectedTimeSlot(timeInfo);
  };

  const handleConfirm = () => {
    if (selectedTimeSlot) {
      onSelectTime(selectedTimeSlot);
    }
    onClose();
  };

  // Helper function to get meal type tag
  const getMealTypeTag = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'afternoon_snack' | 'midnight_snack' | null) => {
    switch(mealType) {
      case 'breakfast': return '🍳 Breakfast';
      case 'lunch': return '🥗 Lunch';
      case 'dinner': return '🍽️ Dinner';
      case 'afternoon_snack': return '🍎 Afternoon Snack';
      case 'midnight_snack': return '🍪 Midnight Snack';
      default: return null;
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Time for {selectedDate}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Use the MealTypeSelector component */}
          <MealTypeSelector 
            onSelectMeal={handleMealSelection}
            selectedMealType={selectedTimeSlot?.mealType}
          />
          
          <ScrollView 
            ref={scrollViewRef}
            style={styles.timeSlotContainer}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {timeSlots.map((timeInfo, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeSlot,
                  selectedTimeSlot?.time === timeInfo.time && styles.selectedTimeSlot,
                  timeInfo.mealType && styles[`${timeInfo.mealType}TimeSlot`]
                ]}
                onPress={() => handleTimeSelection(timeInfo)}
                onLayout={(event) => {
                  // Store the y-position of each time slot for scrolling
                  timeSlotRefs.current[timeInfo.time] = event.nativeEvent.layout.y;
                }}
              >
                <Text style={[
                  styles.timeSlotText,
                  selectedTimeSlot?.time === timeInfo.time && styles.selectedTimeSlotText
                ]}>
                  {timeInfo.time}
                </Text>
                {timeInfo.mealType && (
                  <Text style={styles.mealTypeTag}>
                    {getMealTypeTag(timeInfo.mealType)}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.confirmButton,
                !selectedTimeSlot && styles.disabledButton
              ]} 
              onPress={handleConfirm}
              disabled={!selectedTimeSlot}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: Theme.colors.light,
    borderRadius: Theme.roundness.md,
    ...Theme.shadows.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.secondaryLight,
  },
  title: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.dark,
  },
  closeButton: {
    fontSize: Theme.typography.sizes.lg,
    color: Theme.colors.secondary,
    fontWeight: Theme.typography.weights.bold,
  },
  timeSlotContainer: {
    maxHeight: 400,
  },
  timeSlot: {
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.secondaryLight,
  },
  selectedTimeSlot: {
    backgroundColor: Theme.colors.primaryLight,
  },
  breakfastTimeSlot: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFB340', // breakfast color
  },
  lunchTimeSlot: {
    borderLeftWidth: 4,
    borderLeftColor: '#34C759', // lunch color
  },
  dinnerTimeSlot: {
    borderLeftWidth: 4,
    borderLeftColor: '#A35C7A', // dinner color
  },
  afternoon_snackTimeSlot: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500', // orange for afternoon snack
  },
  midnight_snackTimeSlot: {
    borderLeftWidth: 4,
    borderLeftColor: '#5856D6', // purple for midnight snack
  },
  timeSlotText: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.dark,
  },
  selectedTimeSlotText: {
    color: Theme.colors.light,
    fontWeight: Theme.typography.weights.bold,
  },
  mealTypeTag: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.secondary,
    fontWeight: Theme.typography.weights.medium,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.secondaryLight,
  },
  button: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.roundness.sm,
    marginLeft: Theme.spacing.sm,
  },
  cancelButton: {
    backgroundColor: Theme.colors.secondaryLight,
  },
  confirmButton: {
    backgroundColor: Theme.colors.primary,
  },
  disabledButton: {
    backgroundColor: Theme.colors.secondaryLight,
    opacity: 0.5,
  },
  cancelButtonText: {
    color: Theme.colors.dark,
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.medium,
  },
  confirmButtonText: {
    color: Theme.colors.light,
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.medium,
  },
  selectedQuickMealButton: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primaryDark,
    borderWidth: 1,
  },
  selectedQuickMealText: {
    color: Theme.colors.light,
    fontWeight: Theme.typography.weights.bold,
  },
});

export default TimeSelectionDialog;
