/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { User, UserRole } from '../types';
import Swal from 'sweetalert2';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdminUser: boolean;
  isSuperAdminUser: boolean;
  loginWithGoogle: () => Promise<void>;
  signUpWithEmail: (name: string, email: string, mobile: string, batch: string, role: UserRole, password?: string) => Promise<void>;
  loginWithEmail: (email: string, password?: string) => Promise<void>;
  loginAsDemoUser: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitor Auth Status
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        // Fetch or create user record in Firestore
        const userRef = doc(db, 'users', fUser.uid);
        let userSnap;
        try {
          userSnap = await getDoc(userRef);
        } catch (error) {
          console.error("Error reading initial user profile: ", error);
        }

        if (userSnap && userSnap.exists()) {
          setCurrentUser(userSnap.data() as User);
        } else {
          // If profile doesn't exist, generate default
          const email = fUser.email || '';
          const name = fUser.displayName || email.split('@')[0];
          
          // Auto assign Super Admin to bootstrapped email
          const isBootstrapped = email.toLowerCase() === 'shozolesm4409@gmail.com';
          const defaultRole: UserRole = isBootstrapped ? 'Super Admin' : 'Alumni/User';

          const newUser: User = {
            uid: fUser.uid,
            name,
            email,
            mobile: fUser.phoneNumber || '',
            batch: '2026',
            role: defaultRole,
            profilePhoto: fUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
            createdAt: new Date().toISOString()
          };

          try {
            await setDoc(userRef, newUser);
            setCurrentUser(newUser);
          } catch (err) {
            console.error("Failed to register new profile in Firestore: ", err);
            // Fallback inside local state
            setCurrentUser(newUser);
          }
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubAuth();
  }, []);

  // Sync profile details for active user
  useEffect(() => {
    if (!firebaseUser) return;
    const userRef = doc(db, 'users', firebaseUser.uid);
    const unsubSnap = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setCurrentUser(snapshot.data() as User);
      }
    }, (error) => {
      console.warn("Real-time profile subscription blocked or restricted:", error.message);
    });
    return () => unsubSnap();
  }, [firebaseUser]);

  const refreshUserProfile = async () => {
    if (!firebaseUser) return;
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        setCurrentUser(snapshot.data() as User);
      }
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (name: string, email: string, mobile: string, batch: string, role: UserRole, password?: string) => {
    try {
      // Allow actual custom password otherwise default to standard for backward-compatible/fast flows
      const actualPassword = password || 'password123';
      const userCredential = await createUserWithEmailAndPassword(auth, email, actualPassword);
      const fUser = userCredential.user;
      
      await updateProfile(fUser, { displayName: name });

      const newUser: User = {
        uid: fUser.uid,
        name,
        email,
        mobile,
        batch,
        role,
        profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', fUser.uid), newUser);
      setCurrentUser(newUser);
    } catch (error) {
      console.error('Email registration failed:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password?: string) => {
    try {
      const actualPassword = password || 'password123';
      await signInWithEmailAndPassword(auth, email, actualPassword);
    } catch (error) {
      console.error('Email login failed:', error);
      throw error;
    }
  };

  // Login As Demo roles for instantaneous UI exploration as requested!
  const loginAsDemoUser = async (role: UserRole) => {
    setLoading(true);
    const demoUid = `demo_${role.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const demoEmail = `${demoUid}@janakalyan-school.edu`;
    const dummyPassword = 'Password123!';
    try {
      let fUser: FirebaseUser;
      try {
        // Attempt to create the demo user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, demoEmail, dummyPassword);
        fUser = userCredential.user;
        await updateProfile(fUser, {
          displayName: `${role} Alumnus (Demo Account)`
        });
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          // If already registerd, sign them in
          const userCredential = await signInWithEmailAndPassword(auth, demoEmail, dummyPassword);
          fUser = userCredential.user;
        } else {
          throw err;
        }
      }

      const demoUser: User = {
        uid: fUser.uid,
        name: `${role} Alumnus (Demo Account)`,
        email: demoEmail,
        mobile: '01712345678',
        batch: '1998',
        role,
        profilePhoto: role === 'Super Admin' 
          ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150' 
          : role === 'Admin'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
          : 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
        createdAt: new Date().toISOString()
      };

      // Set user record in Firestore to ensure it exists
      await setDoc(doc(db, 'users', fUser.uid), demoUser);
      setCurrentUser(demoUser);
    } catch (error) {
      console.error('Demo login failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'লগইন ব্যর্থ!',
        text: 'ডেমো লগইন করতে ব্যর্থ হয়েছে। দয়া করে গুগল লগইন ব্যবহার করুন অথবা আবার চেষ্টা করুন।',
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Sign-Out Error:', error);
    }
  };

  const isAdminUser = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';
  const isSuperAdminUser = currentUser?.role === 'Super Admin';

  return (
    <AuthContext.Provider value={{
      currentUser,
      firebaseUser,
      loading,
      isAdminUser,
      isSuperAdminUser,
      loginWithGoogle,
      signUpWithEmail,
      loginWithEmail,
      loginAsDemoUser,
      logout,
      refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
