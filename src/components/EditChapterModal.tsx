import React, { useState, useEffect } from 'react';
import { Chapter, ProgressBreakdown, CustomExamSyllabus } from '../types';
import { X, Edit2, CheckSquare, Layers } from 'lucide-react';

interface EditChapterModalProps {
  isOpen: boolean;
  chapter: Chapter | null;
  syllabuses?: CustomExamSyllabus[];
  onClose: () => void;
  onSave: (
    chapterId: string,
    chapterNumber: number,
    chapterTitle: string,
    updatedBreakdown?: ProgressBreakdown,
    updatedExams?: string[]
  ) => void;
}

const MILESTONE_LABELS: Record<keyof ProgressBreakdown, { bn: string; en: string }> = {
  board_book_reading: { bn: 'বোর্ড বই রিডিং', en: 'Main Book Reading' },
  cq_practice: { bn: 'সৃজনশীল (CQ) সমাধান', en: 'CQ Practice' },
  mcq_practice: { bn: 'নৈর্ব্যক্তিক (MCQ) চর্চা', en: 'MCQ Practice' },
  test_paper_solve: { bn: 'টেস্ট পেপার অনুশীলন', en: 'Test Paper Solve' },
  revision_done: { bn: 'ফাইনাল রিভিশন সম্পন্ন', en: 'Final Revision' },
};

export const EditChapterModal: React.FC<EditChapterModalProps> = ({
  isOpen,
  chapter,
  syllabuses = [],
  onClose,
  onSave,
}) => {
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [chapterTitle, setChapterTitle] = useState('');
  const [breakdown, setBreakdown] = useState<ProgressBreakdown>({
    board_book_reading: false,
    cq_practice: false,
    mcq_practice: false,
    test_paper_solve: false,
    revision_done: false,
  });
  const [includedExams, setIncludedExams] = useState<string[]>([]);

  useEffect(() => {
    if (chapter) {
      setChapterNumber(chapter.chapter_number);
      setChapterTitle(chapter.chapter_title);
      setBreakdown({ ...chapter.progress_breakdown });
      setIncludedExams([...chapter.included_in_exams]);
    }
  }, [chapter]);

  if (!isOpen || !chapter) return null;

  const handleToggleExam = (examId: string) => {
    setIncludedExams(prev =>
      prev.includes(examId) ? prev.filter(id => id !== examId) : [...prev, examId]
    );
  };

  const handleToggleBreakdown = (key: keyof ProgressBreakdown) => {
    setBreakdown(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTitle.trim()) return;
    onSave(chapter.chapter_id, Number(chapterNumber), chapterTitle.trim(), breakdown, includedExams);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                অধ্যায় ও সাব-টাস্ক সম্পাদনা (Admin Edit)
              </h3>
              <p className="text-xs text-slate-500">অধ্যায়ের তথ্য ও মাইলস্টোন আপডেট করুন</p>
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                অধ্যায়ের নাম (বাংলায়)
              </label>
              <input
                type="text"
                required
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Sub-task Milestones Edit Section */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
              <span>সাব-টাস্ক ও মাইলস্টোন স্ট্যাটাস (Sub-tasks)</span>
            </label>
            <div className="space-y-1.5">
              {(Object.keys(MILESTONE_LABELS) as (keyof ProgressBreakdown)[]).map((key) => {
                const isChecked = breakdown[key];
                const label = MILESTONE_LABELS[key];
                return (
                  <label
                    key={key}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <span className="font-semibold">{label.bn}</span>
                      <span className="text-[11px] text-slate-400 block">{label.en}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleBreakdown(key)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Included Exam Syllabuses */}
          {syllabuses.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>যেসব পরীক্ষার সিলেবাসে অন্তর্ভুক্ত</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {syllabuses.map((exam) => {
                  const isIncluded = includedExams.includes(exam.exam_id);
                  return (
                    <button
                      key={exam.exam_id}
                      type="button"
                      onClick={() => handleToggleExam(exam.exam_id)}
                      className={`text-left p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                        isIncluded
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{exam.exam_title}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          isIncluded ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isIncluded ? 'যুক্ত' : 'বাদ'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
            >
              সংরক্ষণ করুন (Save Changes)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

