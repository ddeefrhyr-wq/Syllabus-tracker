import React, { useState } from 'react';
import { Subject, CustomExamSyllabus } from '../types';
import { X, SlidersHorizontal, Check, Sparkles, BookOpen } from 'lucide-react';

interface CustomSyllabusManagerModalProps {
  isOpen: boolean;
  syllabuses: CustomExamSyllabus[];
  subjects: Subject[];
  initialExamId: string;
  onClose: () => void;
  onToggleExamInclusion: (chapterId: string, examId: string) => void;
  onBatchToggleSubjectExam: (subjectId: string, examId: string, includeAll: boolean) => void;
  onUpdateExamTitle: (examId: string, newTitle: string) => void;
}

export const CustomSyllabusManagerModal: React.FC<CustomSyllabusManagerModalProps> = ({
  isOpen,
  syllabuses,
  subjects,
  initialExamId,
  onClose,
  onToggleExamInclusion,
  onBatchToggleSubjectExam,
  onUpdateExamTitle,
}) => {
  const [selectedExamId, setSelectedExamId] = useState(
    initialExamId === 'ALL' ? 'EXAM_CUSTOM' : initialExamId
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  const currentExam = syllabuses.find(s => s.exam_id === selectedExamId);

  React.useEffect(() => {
    if (currentExam) {
      setEditedTitle(currentExam.exam_title);
    }
  }, [selectedExamId, currentExam]);

  if (!isOpen || !currentExam) return null;

  const handleSaveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedTitle.trim()) {
      onUpdateExamTitle(selectedExamId, editedTitle.trim());
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                পরীক্ষার সিলেবাস কাস্টমাইজেশন
              </h3>
              <p className="text-xs text-slate-500">
                নির্দিষ্ট পরীক্ষায় কোন কোন অধ্যায় থাকবে তা সহজে টিক দিয়ে নির্বাচন করুন
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

        {/* Exam Selector Tabs */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-xs font-semibold text-slate-500 shrink-0">সিলেবাস:</span>
          {syllabuses.map((exam) => {
            const isSelected = selectedExamId === exam.exam_id;
            return (
              <button
                key={exam.exam_id}
                type="button"
                onClick={() => {
                  setSelectedExamId(exam.exam_id);
                  setIsEditingTitle(false);
                }}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                {exam.exam_id === 'EXAM_CUSTOM' && <Sparkles className="w-3 h-3 text-amber-400" />}
                <span>{exam.exam_title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Active Exam Title Banner */}
        <div className="px-5 py-3 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between gap-3 shrink-0">
          {isEditingTitle ? (
            <form onSubmit={handleSaveTitle} className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs bg-white border border-emerald-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700"
              >
                সেভ
              </button>
              <button
                type="button"
                onClick={() => setIsEditingTitle(false)}
                className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                বাতিল
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  {currentExam.exam_title}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
                  নির্বাচিত
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingTitle(true)}
                className="text-[11px] text-emerald-700 hover:underline"
              >
                নাম পরিবর্তন করুন
              </button>
            </div>
          )}
        </div>

        {/* Subjects and Chapters Checklist */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {subjects.map((subject) => {
            const allIncluded = subject.chapters.every(ch =>
              ch.included_in_exams.includes(selectedExamId)
            );
            const someIncluded = subject.chapters.some(ch =>
              ch.included_in_exams.includes(selectedExamId)
            );

            return (
              <div
                key={subject.subject_id}
                className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-xs shrink-0"
                      style={{ backgroundColor: subject.theme_color }}
                    />
                    <h4 className="text-sm font-bold text-slate-800">
                      {subject.subject_name} ({subject.english_name})
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onBatchToggleSubjectExam(subject.subject_id, selectedExamId, !allIncluded)}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
                    >
                      {allIncluded ? 'সবগুলো বাদ দিন' : 'সবগুলো নির্বাচন করুন'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5">
                  {subject.chapters.map((chapter) => {
                    const isIncluded = chapter.included_in_exams.includes(selectedExamId);

                    return (
                      <button
                        key={chapter.chapter_id}
                        type="button"
                        onClick={() => onToggleExamInclusion(chapter.chapter_id, selectedExamId)}
                        className={`flex items-center gap-2.5 p-2 rounded-lg text-left transition-all border ${
                          isIncluded
                            ? 'bg-white border-emerald-300 text-emerald-900 shadow-2xs font-medium'
                            : 'bg-white/60 border-slate-200 text-slate-500 hover:bg-white'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center text-xs shrink-0 ${
                            isIncluded
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-300'
                          }`}
                        >
                          {isIncluded && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs truncate">
                          অধ্যায় {chapter.chapter_number}: {chapter.chapter_title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
          >
            সম্পন্ন
          </button>
        </div>
      </div>
    </div>
  );
};
