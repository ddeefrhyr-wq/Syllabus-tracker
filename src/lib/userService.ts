import {
  db,
  doc,
  getDoc,
  setDoc,
  runTransaction,
  User,
} from './firebase';
import { UserSummaryRecord } from '../types';

/**
 * Format and sanitize username:
 * - strips leading '@'
 * - lowercases
 * - trims whitespace
 * - allows only letters, numbers, and underscores (3-20 chars)
 */
export const normalizeUsername = (raw: string): string => {
  return raw.replace(/^@+/, '').trim().toLowerCase();
};

export const validateUsernameFormat = (username: string): { valid: boolean; message?: string } => {
  const normalized = normalizeUsername(username);
  if (!normalized) {
    return { valid: false, message: 'ইউজারনেম লিখুন (e.g. saimon2028)' };
  }
  if (normalized.length < 3) {
    return { valid: false, message: 'ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে' };
  }
  if (normalized.length > 20) {
    return { valid: false, message: 'ইউজারনেম সর্বোচ্চ ২০ অক্ষরের হতে পারে' };
  }
  const regex = /^[a-z0-9_]+$/;
  if (!regex.test(normalized)) {
    return { valid: false, message: 'শুধুমাত্র ছোট হাতের ইংরেজি অক্ষর, সংখ্যা এবং _ ব্যবহার করুন' };
  }
  return { valid: true };
};

/**
 * Checks in Firestore whether the given username is already taken.
 * If currentUid is provided and matches the owner, it is considered available for this user.
 */
export const checkUsernameAvailability = async (
  rawUsername: string,
  currentUid?: string
): Promise<{ available: boolean; error?: string }> => {
  const validation = validateUsernameFormat(rawUsername);
  if (!validation.valid) {
    return { available: false, error: validation.message };
  }

  const normalized = normalizeUsername(rawUsername);

  try {
    const usernameDocRef = doc(db, 'usernames', normalized);
    const docSnap = await getDoc(usernameDocRef);

    if (!docSnap.exists()) {
      return { available: true };
    }

    const data = docSnap.data();
    if (currentUid && data?.uid === currentUid) {
      return { available: true };
    }

    return { available: false, error: `@${normalized} ইউজারনেমটি ইতিমধ্যে নেওয়া হয়েছে। অন্য একটি নির্বাচন করুন।` };
  } catch (err: unknown) {
    console.error('Error checking username availability:', err);
    // If offline or network error, let the user proceed or surface error
    return { available: false, error: 'ইউজারনেম যাচাই করতে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করুন।' };
  }
};

/**
 * Atomically claim a unique username for a user and sync to their profile.
 */
export const claimUsername = async (
  user: User,
  rawUsername: string,
  additionalInfo?: {
    displayName?: string;
    sscBatch?: string;
    group?: string;
    targetGpa?: string;
    authProvider?: string;
  }
): Promise<{ success: boolean; username: string }> => {
  const normalized = normalizeUsername(rawUsername);
  const validation = validateUsernameFormat(normalized);
  if (!validation.valid) {
    throw new Error(validation.message || 'অবৈধ ইউজারনেম');
  }

  const usernameDocRef = doc(db, 'usernames', normalized);
  const userProfileRef = doc(db, 'users', user.uid);

  // Firestore transaction to guarantee uniqueness without race conditions
  await runTransaction(db, async (transaction) => {
    const existingUsernameDoc = await transaction.get(usernameDocRef);
    if (existingUsernameDoc.exists()) {
      const existingOwner = existingUsernameDoc.data()?.uid;
      if (existingOwner !== user.uid) {
        throw new Error(`@${normalized} ইউজারনেমটি ইতিমধ্যে ব্যবহৃত হচ্ছে। অন্য একটি ইউজারনেম বাছুন।`);
      }
    }

    // Claim the username in the usernames registry
    transaction.set(usernameDocRef, {
      uid: user.uid,
      username: normalized,
      claimedAt: new Date().toISOString(),
    });

    // Update user record with the username
    const profileUpdate: Partial<UserSummaryRecord> = {
      uid: user.uid,
      displayName: additionalInfo?.displayName || user.displayName || 'শিক্ষার্থী',
      username: normalized,
      email: user.email || undefined,
      phoneNumber: user.phoneNumber || undefined,
      authProvider: additionalInfo?.authProvider || user.providerData?.[0]?.providerId || 'custom',
      lastActive: new Date().toISOString(),
    };

    if (additionalInfo?.sscBatch) profileUpdate.sscBatch = additionalInfo.sscBatch;
    if (additionalInfo?.group) profileUpdate.group = additionalInfo.group;
    if (additionalInfo?.targetGpa) profileUpdate.targetGpa = additionalInfo.targetGpa;

    transaction.set(userProfileRef, profileUpdate, { merge: true });
  });

  return { success: true, username: normalized };
};

/**
 * Fetch the registered username for a given user UID, if any.
 */
export const getUserProfile = async (uid: string): Promise<UserSummaryRecord | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserSummaryRecord;
    }
    return null;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
};
