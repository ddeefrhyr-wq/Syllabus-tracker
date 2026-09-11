import React, { useState, useEffect } from 'react';
import { Chapter } from '../types';
import { X, FileText, Sparkles } from 'lucide-react';

interface ChapterNotesModalProps {
  isOpen: boolean;
  chapter: Chapter | null;
  onClose: () => void;
  onSaveNotes: (chapterId: string, notes: string) => void;
}

export const ChapterNotesModal: React.FC<ChapterNotesModalProps> = ({
  isOpen,
  chapter,
  onClose,
  onSaveNotes,
}) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (chapter) {
      setNotes(chapter.notes || '');
    }
  }, [chapter]);

  if (!isOpen || !chapter) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveNotes(chapter.chapter_id, notes.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                অধ্যায় স্টাডি নোট
              </h3>
              <p className="text-xs text-slate-500">
                অধ্যায় {chapter.chapter_number}: {chapter.chapter_title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              প্রস্তুতির নোট, দুর্বল টপিক বা টেস্ট পেপার সমাধান রিমাইন্ডার:
            </label>
            <textarea
              rows={5}
              placeholder="যেমন: ঢাকা বোর্ড ২০২৩-২৪ এর CQ সমাধান করা হয়েছে, গ্রাফ সম্পর্কিত গাণিতিক সমস্যা আবার রিভিশন দিতে হবে..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
            >
              নোট সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
