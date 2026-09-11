import React, { useState } from 'react';
import { Subject, CustomExamSyllabus } from '../types';
import { X, BookPlus, Sparkles } from 'lucide-react';

interface AddChapterModalProps {
  isOpen: boolean;
  subjects: Subject[];
  defaultSubjectId?: string;
  syllabuses: CustomExamSyllabus[];
  onClose: () => void;
  onAdd: (subjectId: string, chapterNumber: number, chapterTitle: string, includedExams: string[]) => void;
}

export const AddChapterModal: React.FC<AddChapterModalProps> = ({
  isOpen,
  subjects,
  defaultSubjectId,
  syllabuses,
  onClose,
  onAdd,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState(defaultSubjectId || (subjects[0]?.subject_id || ''));
  const [chapterNumber, setChapterNumber] = useState<number>(() => {
    const subj = subjects.find(s => s.subject_id === (defaultSubjectId || subjects[0]?.subject_id));
    return subj ? subj.chapters.length + 1 : 1;
  });
  const [chapterTitle, setChapterTitle] = useState('');
  const [selectedExams, setSelectedExams] = useState<string[]>(['EXAM_HALF_YEARLY', 'EXAM_ANNUAL', 'EXAM_TEST', 'EXAM_CUSTOM']);

  // Update chapter number when subject changes
  React.useEffect(() => {
    if (defaultSubjectId) {
      setSelectedSubjectId(defaultSubjectId);
    }
    const subj = subjects.find(s => s.subject_id === (defaultSubjectId || selectedSubjectId));
    if (subj) {
      setChapterNumber(subj.chapters.length + 1);
    }
  }, [defaultSubjectId, subjects]);

  if (!isOpen) return null;

  const toggleExam = (examId: string) => {
    setSelectedExams(prev =>
      prev.includes(examId) ? prev.filter(id => id !== examId) : [...prev, examId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTitle.trim() || !selectedSubjectId) return;
    onAdd(selectedSubjectId, Number(chapterNumber), chapterTitle.trim(), selectedExams);
    setChapterTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BookPlus className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              নতুন অধ্যায় যোগ করুন
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
              বিষয় নির্বাচন করুন
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                const subj = subjects.find(s => s.subject_id === e.target.value);
                if (subj) setChapterNumber(subj.chapters.length + 1);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              {subjects.map((s) => (
                <option key={s.subject_id} value={s.subject_id}>
                  {s.subject_name} ({s.english_name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                অধ্যায় নং
              </label>
              <input
                type="number"
                min={1}
                required
                value={chapterNumber}
                onChange={(e) => setChapterNumber(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-center font-bold"
              />
            </div>

            <div className="col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                অধ্যায়ের শিরোনাম (বাংলায়)
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: কাজ, শক্তি ও ক্ষমতা"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              যেসব পরীক্ষার সিলেবাসে অন্তর্ভুক্ত হবে:
            </label>
            <div className="space-y-1.5">
              {syllabuses.map((exam) => {
                const checked = selectedExams.includes(exam.exam_id);
                return (
                  <label
                    key={exam.exam_id}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      checked ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-medium' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleExam(exam.exam_id)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="flex-1">{exam.exam_title}</span>
                    {exam.exam_id === 'EXAM_CUSTOM' && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                  </label>
                );
              })}
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
              অধ্যায় যোগ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
