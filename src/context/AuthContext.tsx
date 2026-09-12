import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  auth,
  googleProvider,
  facebookProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged,
  fbUpdateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User,
} from '../lib/firebase';
import { getUserProfile, claimUsername } from '../lib/userService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  userUsername: string | null;
  needsUsernameSetup: boolean;
  setUserUsername: (username: string) => void;
  setNeedsUsernameSetup: (needs: boolean) => void;
  signInWithGoogle: () => Promise<User>;
  signInWithFacebook: () => Promise<User>;
  signInWithEmail: (email: string, pass: string) => Promise<User>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<User>;
  setupPhoneRecaptcha: (containerId: string) => RecaptchaVerifier;
  sendPhoneOtp: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  confirmPhoneOtp: (confirmationResult: ConfirmationResult, otp: string) => Promise<User>;
  assignUsername: (username: string, additional?: { displayName?: string; sscBatch?: string; group?: string; targetGpa?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userUsername, setUserUsername] = useState<string | null>(null);
  const [needsUsernameSetup, setNeedsUsernameSetup] = useState(false);

  // Monitor auth state and fetch user's registered username
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile?.username) {
            setUserUsername(profile.username);
            setNeedsUsernameSetup(false);
          } else {
            setUserUsername(null);
            setNeedsUsernameSetup(true);
          }
        } catch (err) {
          console.error('Error fetching username for user:', err);
          setUserUsername(null);
          setNeedsUsernameSetup(true);
        }
      } else {
        setUserUsername(null);
        setNeedsUsernameSetup(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<User> => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      return res.user;
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      throw err;
    }
  };

  const signInWithFacebook = async (): Promise<User> => {
    try {
      const res = await signInWithPopup(auth, facebookProvider);
      return res.user;
    } catch (err: unknown) {
      console.error('Facebook sign-in error:', err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<User> => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    return res.user;
  };

  const registerWithEmail = async (name: string, email: string, pass: string): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if (name.trim()) {
      await fbUpdateProfile(userCredential.user, {
        displayName: name.trim(),
      });
    }
    return userCredential.user;
  };

  // Phone Authentication: reCAPTCHA setup
  const setupPhoneRecaptcha = (containerId: string): RecaptchaVerifier => {
    // Clear any previous widget if rendered
    const existingRecaptcha = (window as unknown as { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier;
    if (existingRecaptcha) {
      try {
        existingRecaptcha.clear();
      } catch (e) {
        console.warn('Clearing previous recaptcha:', e);
      }
    }

    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        console.warn('reCAPTCHA expired. Please try again.');
      },
    });

    (window as unknown as { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier = verifier;
    return verifier;
  };

  const sendPhoneOtp = async (phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  };

  const confirmPhoneOtp = async (confirmationResult: ConfirmationResult, otp: string): Promise<User> => {
    const res = await confirmationResult.confirm(otp);
    return res.user;
  };

  const assignUsername = async (
    username: string,
    additional?: { displayName?: string; sscBatch?: string; group?: string; targetGpa?: string }
  ) => {
    if (!currentUser) throw new Error('লগইন অবস্থায় নেই');
    const result = await claimUsername(currentUser, username, additional);
    setUserUsername(result.username);
    setNeedsUsernameSetup(false);
  };

  const logout = async () => {
    await fbSignOut(auth);
    setUserUsername(null);
    setNeedsUsernameSetup(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        userUsername,
        needsUsernameSetup,
        setUserUsername,
        setNeedsUsernameSetup,
        signInWithGoogle,
        signInWithFacebook,
        signInWithEmail,
        registerWithEmail,
        setupPhoneRecaptcha,
        sendPhoneOtp,
        confirmPhoneOtp,
        assignUsername,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
