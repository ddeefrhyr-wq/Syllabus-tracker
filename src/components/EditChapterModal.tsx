import React, { useState, useEffect } from 'react';
import { Chapter } from '../types';
import { X, Edit2 } from 'lucide-react';

interface EditChapterModalProps {
  isOpen: boolean;
  chapter: Chapter | null;
  onClose: () => void;
  onSave: (chapterId: string, chapterNumber: number, chapterTitle: string) => void;
}

export const EditChapterModal: React.FC<EditChapterModalProps> = ({
  isOpen,
  chapter,
  onClose,
  onSave,
}) => {
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [chapterTitle, setChapterTitle] = useState('');

  useEffect(() => {
    if (chapter) {
      setChapterNumber(chapter.chapter_number);
      setChapterTitle(chapter.chapter_title);
    }
  }, [chapter]);

  if (!isOpen || !chapter) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTitle.trim()) return;
    onSave(chapter.chapter_id, Number(chapterNumber), chapterTitle.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              অধ্যায় সম্পাদনা করুন
            </h3>
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
              অধ্যায় নম্বর
            </label>
            <input
              type="number"
              min={1}
              required
              value={chapterNumber}
              onChange={(e) => setChapterNumber(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              অধ্যায়ের নাম (বাংলায়)
            </label>
            <input
              type="text"
              required
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
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
              আপডেট করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
