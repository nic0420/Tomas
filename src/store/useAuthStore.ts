import { create } from 'zustand';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initAuthListener: () => (() => void);
  logout: () => Promise<void>;
}

let unsubscribeAuth: (() => void) | null = null;

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  initAuthListener: () => {
    if (unsubscribeAuth) {
      unsubscribeAuth();
    }
    unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          let userData: User;
          
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            userData = {
              id: firebaseUser.uid,
              name: data.name || firebaseUser.displayName || 'Usuario',
              email: data.email || firebaseUser.email || '',
              phone: data.phone,
              address: data.address,
            };
          } else {
            userData = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Usuario',
              email: firebaseUser.email || '',
            };
          }
          
          set({ user: userData, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          set({
            user: {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Usuario',
              email: firebaseUser.email || '',
            },
            isAuthenticated: true,
            isLoading: false,
          });
        }
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    });
    return unsubscribeAuth;
  },
  
  logout: async () => {
    try {
      await firebaseSignOut(auth);
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }
}));
