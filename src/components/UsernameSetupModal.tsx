import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  checkUsernameAvailability,
  normalizeUsername,
  validateUsernameFormat,
} from '../lib/userService';
import {
  Sparkles,
  AtSign,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  ShieldCheck,
  RefreshCw,
  Award,
} from 'lucide-react';

interface UsernameSetupModalProps {
  isOpen: boolean;
  onSuccess?: () => void;
}

export const UsernameSetupModal: React.FC<UsernameSetupModalProps> = ({
  isOpen,
  onSuccess,
}) => {
  const { currentUser, assignUsername } = useAuth();
  const [usernameInput, setUsernameInput] = useState('');
  const [displayNameInput, setDisplayNameInput] = useState(currentUser?.displayName || '');
  const [sscBatch, setSscBatch] = useState('2028');
  const [group, setGroup] = useState('Science');
  const [targetGpa, setTargetGpa] = useState('5.00');

  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'available' | 'taken' | 'invalid'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill suggested username from email/displayName
  useEffect(() => {
    if (currentUser) {
      if (!displayNameInput && currentUser.displayName) {
        setDisplayNameInput(currentUser.displayName);
      }
      if (!usernameInput) {
        let base = '';
        if (currentUser.email) {
          base = currentUser.email.split('@')[0];
        } else if (currentUser.displayName) {
          base = currentUser.displayName.replace(/\s+/g, '').toLowerCase();
        } else if (currentUser.phoneNumber) {
          base = `user${currentUser.phoneNumber.slice(-4)}`;
        }
        const cleaned = normalizeUsername(base).slice(0, 15);
        if (cleaned.length >= 3) {
          setUsernameInput(cleaned);
        }
      }
    }
  }, [currentUser]);

  // Debounced username availability checker
  useEffect(() => {
    const raw = usernameInput.trim();
    if (!raw) {
      setStatus('idle');
      setStatusMessage('');
      return;
    }

    const validation = validateUsernameFormat(raw);
    if (!validation.valid) {
      setStatus('invalid');
      setStatusMessage(validation.message || 'অবৈধ ইউজারনেম');
      return;
    }

    setChecking(true);
    setStatus('idle');
    setStatusMessage('ইউজারনেম চেক করা হচ্ছে...');

    const timer = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(raw, currentUser?.uid);
        if (result.available) {
          setStatus('available');
          setStatusMessage(`@${normalizeUsername(raw)} ইউজারনেমটি উপলব্ধ আছে! 🎉`);
        } else {
          setStatus('taken');
          setStatusMessage(result.error || 'এই ইউজারনেমটি ইতিমধ্যে নেওয়া হয়েছে');
        }
      } catch (e: unknown) {
        setStatus('invalid');
        setStatusMessage('ইউজারনেম যাচাই করা সম্ভব হয়নি');
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [usernameInput, currentUser?.uid]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeUsername(usernameInput);
    const validation = validateUsernameFormat(normalized);
    if (!validation.valid) {
      setStatus('invalid');
      setStatusMessage(validation.message || 'অবৈধ ইউজারনেম');
      return;
    }

    if (status === 'taken') {
      setStatusMessage('অনুগ্রহ করে অন্য একটি ইউজারনেম নির্বাচন করুন');
      return;
    }

    setSubmitting(true);
    try {
      await assignUsername(normalized, {
        displayName: displayNameInput.trim() || currentUser?.displayName || `@${normalized}`,
        sscBatch,
        group,
        targetGpa,
      });
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ইউজারনেম সংরক্ষণ করতে ব্যর্থ হয়েছে';
      setStatus('taken');
      setStatusMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="username-setup-modal-backdrop"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"
    >
      <div
        id="username-setup-card"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header - Unclosable */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <img
              src="/icon.svg"
              alt="Study Tracker Logo"
              className="w-11 h-11 rounded-2xl shadow-md shrink-0 object-contain ring-1 ring-white/20"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-white leading-tight">
                  ইউনিক ইউজারনেম নির্বাচন করুন
                </h2>
                <span className="text-[10px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  বাধ্যতামূলক
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                আপনার স্টাডি প্রোফাইল ও কেন্দ্রীয় ড্যাশবোর্ডের জন্য একটি স্বতন্ত্র হ্যান্ডেল সেট করুন
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              পুরো নাম (Full Name)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={displayNameInput}
                onChange={(e) => setDisplayNameInput(e.target.value)}
                placeholder="যেমন: সাকিব হাসান"
                className="w-full pl-9 pr-3 py-2.5 text-xs font-medium rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Username Input with Live Validation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                ইউনিক ইউজারনেম (Unique Username)
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                ৩-২০ অক্ষর (a-z, 0-9, _)
              </span>
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm select-none">
                @
              </div>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="saimon2028"
                className={`w-full pl-8 pr-10 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                  status === 'available'
                    ? 'border-emerald-500 bg-emerald-50/20 text-emerald-950 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                    : status === 'taken' || status === 'invalid'
                    ? 'border-rose-500 bg-rose-50/20 text-rose-950 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                }`}
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checking ? (
                  <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
                ) : status === 'available' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : status === 'taken' || status === 'invalid' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                ) : null}
              </div>
            </div>

            {/* Status Message */}
            {statusMessage && (
              <p
                className={`text-[11px] font-medium mt-1.5 flex items-center gap-1 ${
                  status === 'available'
                    ? 'text-emerald-600'
                    : status === 'taken' || status === 'invalid'
                    ? 'text-rose-600'
                    : 'text-slate-500'
                }`}
              >
                {statusMessage}
              </p>
            )}
          </div>

          {/* Academic Info */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                এসএসসি ব্যাচ
              </label>
              <input
                type="text"
                value={sscBatch}
                onChange={(e) => setSscBatch(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                গ্রুপ (বিভাগ)
              </label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium bg-white"
              >
                <option value="Science">বিজ্ঞান (Science)</option>
                <option value="Commerce">ব্যবসায় শিক্ষা (Commerce)</option>
                <option value="Humanities">মানবিক (Humanities)</option>
              </select>
            </div>
          </div>

          {/* Informational note */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3 text-[11px] text-indigo-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              আপনার ইউজারনেম দিয়ে পরবর্তীতে এডমিন ড্যাশবোর্ড ও পাবলিক লিডারবোর্ডে আপনার সিলেবাসের অগ্রগতি নিরাপদে সংরক্ষিত থাকবে।
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="confirm-username-btn"
            disabled={submitting || checking || status === 'taken' || status === 'invalid' || !usernameInput.trim()}
            className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>সংরক্ষণ করা হচ্ছে...</span>
              </>
            ) : (
              <>
                <span>ইউজারনেম নিশ্চিত করুন ও শুরু করুন</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
