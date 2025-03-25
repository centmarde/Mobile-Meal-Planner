import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { useUserStore } from '../store/userStore';
import { Theme, Colors } from '../utils/theme';
import { 
  UserProfile, 
  getOrCreateUserProfile, 
  updateUserProfile,
  listenToUserProfile,
} from '../components/fourComponents/fourOperations';
import { Unsubscribe } from 'firebase/firestore';

export default function UserProfileScreen() {
  const { uid, email, isAuthenticated } = useUserStore();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  
  // Use a ref to store the unsubscribe function
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (isAuthenticated && uid) {
      setLoading(true);
      
      // First ensure user has a profile
      getOrCreateUserProfile(uid, email)
        .then(() => {
          // Then set up the listener
          const unsubscribe = listenToUserProfile(uid, (profile) => {
            if (profile) {
              setUserProfile(profile);
              setLoading(false);
              console.log('Profile screen received real-time update:', profile.displayName);
            }
          });
          
          // Store the unsubscribe function
          unsubscribeRef.current = unsubscribe;
        })
        .catch(error => {
          console.error('Error setting up user profile:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
      setUserProfile(null);
    }
    
    // Clean up the listener when component unmounts or user changes
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isAuthenticated, uid, email]);

  const saveProfile = async () => {
    if (!uid || !editedProfile) return;
    
    setLoading(true);
    try {
      await updateUserProfile(uid, editedProfile);
      // No need to setUserProfile here as the real-time listener will update it
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setLoading(false);
    }
  };

  const startEditing = () => {
    setEditedProfile(userProfile);
    setEditing(true);
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.title}>Please log in to view your profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        {!editing ? (
          <TouchableOpacity style={styles.editButton} onPress={startEditing}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          {userProfile?.profilePicture ? (
            <Image source={{ uri: userProfile.profilePicture }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{userProfile?.displayName?.charAt(0) || 'U'}</Text>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Display Name</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={editedProfile?.displayName}
              onChangeText={(text) => setEditedProfile({ ...editedProfile!, displayName: text })}
              placeholder="Your name"
            />
          ) : (
            <Text style={styles.sectionContent}>{userProfile?.displayName}</Text>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Bio</Text>
          {editing ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editedProfile?.bio}
              onChangeText={(text) => setEditedProfile({ ...editedProfile!, bio: text })}
              placeholder="Tell us about yourself..."
              multiline
              numberOfLines={4}
            />
          ) : (
            <Text style={styles.sectionContent}>{userProfile?.bio}</Text>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          {editing ? (
            <View style={styles.preferencesContainer}>
              {['Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-Free', 'Keto', 'Paleo'].map((pref) => (
                <TouchableOpacity
                  key={pref}
                  style={[
                    styles.preferenceTag,
                    editedProfile?.dietaryPreferences.includes(pref) && styles.activePreferenceTag,
                  ]}
                  onPress={() => {
                    const current = [...(editedProfile?.dietaryPreferences || [])];
                    if (current.includes(pref)) {
                      setEditedProfile({
                        ...editedProfile!,
                        dietaryPreferences: current.filter((p) => p !== pref),
                      });
                    } else {
                      setEditedProfile({
                        ...editedProfile!,
                        dietaryPreferences: [...current, pref],
                      });
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.preferenceTagText,
                      editedProfile?.dietaryPreferences.includes(pref) && styles.activePreferenceTagText,
                    ]}
                  >
                    {pref}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.preferencesContainer}>
              {userProfile?.dietaryPreferences.length ? (
                userProfile.dietaryPreferences.map((pref) => (
                  <View key={pref} style={styles.preferenceTag}>
                    <Text style={styles.preferenceTagText}>{pref}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No preferences set</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Favorite Recipes</Text>
          {userProfile?.favoriteRecipes.length ? (
            <Text style={styles.sectionContent}>
              You have {userProfile.favoriteRecipes.length} favorite recipes
            </Text>
          ) : (
            <Text style={styles.emptyText}>No favorite recipes yet</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: Colors.primary,
  },
  title: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold as any,
    color: Colors.light,
  },
  profileContainer: {
    padding: Theme.spacing.lg,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarText: {
    fontSize: 48,
    color: Colors.light,
    fontWeight: Theme.typography.weights.bold as any,
  },
  infoSection: {
    marginBottom: Theme.spacing.lg,
    backgroundColor: '#fff',
    borderRadius: Theme.roundness.md,
    padding: Theme.spacing.md,
    ...Theme.shadows.light,
  },
  sectionTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold as any,
    color: Colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  sectionContent: {
    fontSize: Theme.typography.sizes.md,
    color: Colors.dark,
  },
  editButton: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.roundness.sm,
  },
  editButtonText: {
    color: Colors.light,
    fontWeight: Theme.typography.weights.medium as any,
  },
  saveButton: {
    backgroundColor: Colors.success,
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.roundness.sm,
  },
  saveButtonText: {
    color: Colors.light,
    fontWeight: Theme.typography.weights.medium as any,
  },
  deleteButton: {
    backgroundColor: Colors.error,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.roundness.sm,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  deleteButtonText: {
    color: Colors.light,
    fontWeight: Theme.typography.weights.medium as any,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.secondaryLight,
    borderRadius: Theme.roundness.sm,
    padding: Theme.spacing.sm,
    fontSize: Theme.typography.sizes.md,
    color: Colors.dark,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Theme.spacing.xs,
  },
  preferenceTag: {
    backgroundColor: Colors.secondaryLight,
    borderRadius: Theme.roundness.sm,
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
    margin: 4,
  },
  preferenceTagText: {
    color: Colors.dark,
    fontSize: Theme.typography.sizes.sm,
  },
  activePreferenceTag: {
    backgroundColor: Colors.primary,
  },
  activePreferenceTagText: {
    color: Colors.light,
  },
  emptyText: {
    color: Colors.secondaryDark,
    fontStyle: 'italic',
  },
});
