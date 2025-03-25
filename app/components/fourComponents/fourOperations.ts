import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../../../FirebaseConfig';

// Define the user profile interface
export interface UserProfile {
  displayName: string;
  bio: string;
  favoriteRecipes: string[];
  dietaryPreferences: string[];
  profilePicture?: string;
}

/**
 * Fetches a user profile from Firestore
 * @param uid User ID to fetch profile for
 * @returns The user profile or null if not found
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'user', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Creates a new user profile in Firestore
 * @param uid User ID to create profile for
 * @param email User email (used to generate default display name)
 * @returns The created user profile
 */
export const createUserProfile = async (uid: string, email: string | null): Promise<UserProfile> => {
  try {
    const defaultProfile: UserProfile = {
      displayName: email?.split('@')[0] || 'User',
      bio: 'Tell us about yourself...',
      favoriteRecipes: [],
      dietaryPreferences: [],
    };
    
    const userRef = doc(db, 'user', uid);
    await setDoc(userRef, defaultProfile);
    return defaultProfile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

/**
 * Updates an existing user profile in Firestore
 * @param uid User ID to update profile for
 * @param profileData Updated profile data
 * @returns The updated user profile
 */
export const updateUserProfile = async (uid: string, profileData: UserProfile): Promise<UserProfile> => {
  try {
    const userRef = doc(db, 'user', uid);
    await setDoc(userRef, profileData, { merge: true });
    return profileData;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Fetches or creates a user profile if it doesn't exist
 * @param uid User ID
 * @param email User email
 * @returns The user profile (either existing or newly created)
 */
export const getOrCreateUserProfile = async (uid: string, email: string | null): Promise<UserProfile> => {
  try {
    const existingProfile = await getUserProfile(uid);
    if (existingProfile) {
      return existingProfile;
    }
    return await createUserProfile(uid, email);
  } catch (error) {
    console.error('Error in getOrCreateUserProfile:', error);
    throw error;
  }
};

/**
 * Sets up a real-time listener for a user profile
 * @param uid User ID to listen to
 * @param callback Function to call when data changes
 * @returns An unsubscribe function to stop listening
 */
export const listenToUserProfile = (
  uid: string, 
  callback: (profile: UserProfile | null) => void
): Unsubscribe => {
  const userRef = doc(db, 'user', uid);
  
  return onSnapshot(
    userRef,
    (doc) => {
      if (doc.exists()) {
        callback(doc.data() as UserProfile);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error listening to user profile:', error);
      callback(null);
    }
  );
};
