import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ArrowDownToLine, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop install prompt
  if (isInstallable) {
    return (
      <button
        type="button"
        id="pwa-install-btn"
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer"
        title="অ্যাপ ইনস্টল করুন (Install App)"
      >
        <ArrowDownToLine className="w-3.5 h-3.5" />
        <span>ইনস্টল করুন</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
          title="আইফোনে ইনস্টল করুন"
        >
          <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
          <span>ইনস্টল (iOS)</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                  iPhone / iPad এ ইনস্টল করুন
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600 leading-relaxed">
                <p>
                  ১. Safari ব্রাউজারের নিচে <strong>Share</strong> (শেয়ার) বাটনে চাপুন।
                </p>
                <p>
                  ২. তালিকায় নিচের দিকে গিয়ে <strong>Add to Home Screen</strong> সিলেক্ট করুন।
                </p>
                <p>
                  ৩. উপরে ডানে <strong>Add</strong> বাটনে ক্লিক করলেই হোমস্ক্রিনে অ্যাপটি যুক্ত হবে।
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                বুঝেছি (Close)
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
