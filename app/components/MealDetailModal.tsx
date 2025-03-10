import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Theme } from '../utils/theme';
import { fetchMealDetails, MealDetails } from '../services/mealService';

interface MealDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  mealId: string | null;
}

const MealDetailModal = ({ isVisible, onClose, mealId }: MealDetailModalProps) => {
  const [mealDetails, setMealDetails] = useState<MealDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mealId && isVisible) {
      loadMealDetails(mealId);
    } else {
      setMealDetails(null);
      setError(null);
    }
  }, [mealId, isVisible]);

  const loadMealDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const details = await fetchMealDetails(id);
      setMealDetails(details);
    } catch (err) {
      setError('Failed to load meal details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator size="large" color={Theme.colors.primary} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : mealDetails ? (
            <ScrollView contentContainerStyle={styles.detailsContainer}>
              <Text style={styles.title}>{mealDetails.strMeal}</Text>
              <Image 
                source={{ uri: mealDetails.strMealThumb }} 
                style={styles.mealImage}
                resizeMode="cover"
              />
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ingredients</Text>
                {mealDetails.ingredients.map((item, index) => (
                  <View key={index} style={styles.ingredientRow}>
                    <Text style={styles.ingredient}>{item.ingredient}</Text>
                    <Text style={styles.measure}>{item.measure}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Instructions</Text>
                <Text style={styles.instructions}>{mealDetails.strInstructions}</Text>
              </View>
            </ScrollView>
          ) : (
            <Text style={styles.errorText}>No meal details available</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    color: Theme.colors.primary,
  },
  detailsContainer: {
    paddingBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Theme.colors.primary,
    textAlign: 'center',
    marginVertical: 10,
  },
  mealImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginVertical: 15,
  },
  section: {
    marginVertical: 10,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.primary,
    marginBottom: 10,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ingredient: {
    flex: 2,
    fontSize: 16,
  },
  measure: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
  },
  instructions: {
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 20,
  },
});

export default MealDetailModal;
