import { auth } from '../../FirebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { useUserStore } from '../store/userStore';

export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Store user details in Zustand store
    useUserStore.getState().setUser(
      userCredential.user.email, 
      userCredential.user.uid
    );
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signUp = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Store user details in Zustand store
    useUserStore.getState().setUser(
      userCredential.user.email, 
      userCredential.user.uid
    );
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    useUserStore.getState().clearUser();
  } catch (error) {
    throw error;
  }
};

export const initAuthListener = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged((user) => {
    if (user) {
      useUserStore.getState().setUser(user.email, user.uid);
    } else {
      useUserStore.getState().clearUser();
    }
    callback(user);
  });
};

// Default export combining all auth functions
export default {
  signIn,
  signUp,
  signOut,
  initAuthListener
};
