import React, { useState } from 'react';
import { X, Layers, Palette } from 'lucide-react';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubject: (subjectName: string, englishName: string, themeColor: string) => void;
}

const PRESET_COLORS = [
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#14B8A6', // Teal
  '#6366F1', // Indigo
];

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  onAddSubject,
}) => {
  const [subjectName, setSubjectName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [themeColor, setThemeColor] = useState('#F59E0B');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim() || !englishName.trim()) return;
    onAddSubject(subjectName.trim(), englishName.trim(), themeColor);
    setSubjectName('');
    setEnglishName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              নতুন বিষয় যোগ করুন
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
              বিষয়ের নাম (বাংলায়)
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: জীববিজ্ঞান বা সাধারণ গণিত"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              English Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Biology or General Mathematics"
              value={englishName}
              onChange={(e) => setEnglishName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-500" />
              থিম কালার নির্বাচন করুন
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setThemeColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    themeColor === c ? 'scale-115 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
              বিষয় সংরক্ষণ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
