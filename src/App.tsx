import React, { useState, useEffect, useMemo } from 'react';
import { AppData, StudentProfile, Subject, Chapter, ProgressBreakdown } from './types';
import { INITIAL_APP_DATA, calculateCompletion } from './data/initialData';
import { StudentHeader } from './components/StudentHeader';
import { ExamFilterBar } from './components/ExamFilterBar';
import { OverallStatsSummary } from './components/OverallStatsSummary';
import { SubjectSection } from './components/SubjectSection';
import { EditProfileModal } from './components/EditProfileModal';
import { AddChapterModal } from './components/AddChapterModal';
import { AddSubjectModal } from './components/AddSubjectModal';
import { ChapterNotesModal } from './components/ChapterNotesModal';
import { CustomSyllabusManagerModal } from './components/CustomSyllabusManagerModal';
import { EditChapterModal } from './components/EditChapterModal';
import { BookOpen, Sparkles, CheckCircle2, Award } from 'lucide-react';

const STORAGE_KEY = 'ssc_2028_tracker_data_v1';

export default function App() {
  // Load initial data from localStorage if available
  const [data, setData] = useState<AppData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.subjects && parsed.student_profile) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading localStorage data', e);
    }
    return INITIAL_APP_DATA;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error writing to localStorage', e);
    }
  }, [data]);

  // Active Exam filter (defaults to active_exam_filter from profile)
  const [activeExamId, setActiveExamId] = useState<string>(() => {
    // Check if initial has Annual_Exam or EXAM_ANNUAL
    const initial = data.student_profile.active_exam_filter;
    if (initial === 'Annual_Exam') return 'EXAM_ANNUAL';
    return initial || 'EXAM_ANNUAL';
  });

  // Search and status filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED'>('ALL');

  // Modal States
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [targetSubjectForAddChapter, setTargetSubjectForAddChapter] = useState<string | undefined>();
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isCustomManagerOpen, setIsCustomManagerOpen] = useState(false);
  const [editingChapterForNotes, setEditingChapterForNotes] = useState<Chapter | null>(null);
  const [editingChapterForEdit, setEditingChapterForEdit] = useState<Chapter | null>(null);

  // Active exam title
  const activeExamTitle = useMemo(() => {
    if (activeExamId === 'ALL') return 'সমগ্র সিলেবাস (All Chapters)';
    const found = data.custom_exam_syllabuses.find(s => s.exam_id === activeExamId);
    return found ? found.exam_title : 'বার্ষিক পরীক্ষা (Annual Exam)';
  }, [data.custom_exam_syllabuses, activeExamId]);

  // Overall Statistics across all chapters
  const overallStats = useMemo(() => {
    let totalChapters = 0;
    let completedChapters = 0;
    let totalPercentage = 0;

    data.subjects.forEach(subject => {
      subject.chapters.forEach(ch => {
        totalChapters++;
        totalPercentage += ch.completion_percentage;
        if (ch.completion_percentage === 100) {
          completedChapters++;
        }
      });
    });

    const overallPercentage = totalChapters > 0 ? Math.round(totalPercentage / totalChapters) : 0;

    // Active exam statistics
    let examTotal = 0;
    let examCompleted = 0;
    let examPercentageTotal = 0;

    data.subjects.forEach(subject => {
      subject.chapters.forEach(ch => {
        if (activeExamId === 'ALL' || ch.included_in_exams.includes(activeExamId)) {
          examTotal++;
          examPercentageTotal += ch.completion_percentage;
          if (ch.completion_percentage === 100) {
            examCompleted++;
          }
        }
      });
    });

    const activeExamPercentage = examTotal > 0 ? Math.round(examPercentageTotal / examTotal) : 0;

    return {
      totalChapters,
      completedChapters,
      overallPercentage,
      examTotal,
      examCompleted,
      activeExamPercentage,
    };
  }, [data.subjects, activeExamId]);

  // Handler: Toggle Milestone
  const handleToggleMilestone = (chapterId: string, milestoneKey: keyof ProgressBreakdown) => {
    setData(prev => {
      const updatedSubjects = prev.subjects.map(subject => {
        const chapterExists = subject.chapters.some(c => c.chapter_id === chapterId);
        if (!chapterExists) return subject;

        const updatedChapters = subject.chapters.map(ch => {
          if (ch.chapter_id !== chapterId) return ch;

          const updatedBreakdown = {
            ...ch.progress_breakdown,
            [milestoneKey]: !ch.progress_breakdown[milestoneKey],
          };

          return {
            ...ch,
            progress_breakdown: updatedBreakdown,
            completion_percentage: calculateCompletion(updatedBreakdown),
          };
        });

        return {
          ...subject,
          chapters: updatedChapters,
        };
      });

      return {
        ...prev,
        subjects: updatedSubjects,
      };
    });
  };

  // Handler: Set all milestones for chapter (Mark All 100% or Reset 0%)
  const handleSetAllMilestones = (chapterId: string, value: boolean) => {
    setData(prev => {
      const updatedSubjects = prev.subjects.map(subject => {
        const chapterExists = subject.chapters.some(c => c.chapter_id === chapterId);
        if (!chapterExists) return subject;

        const updatedChapters = subject.chapters.map(ch => {
          if (ch.chapter_id !== chapterId) return ch;

          const updatedBreakdown: ProgressBreakdown = {
            board_book_reading: value,
            cq_practice: value,
            mcq_practice: value,
            test_paper_solve: value,
            revision_done: value,
          };

          return {
            ...ch,
            progress_breakdown: updatedBreakdown,
            completion_percentage: value ? 100 : 0,
          };
        });

        return { ...subject, chapters: updatedChapters };
      });

      return { ...prev, subjects: updatedSubjects };
    });
  };

  // Handler: Toggle inclusion in exam
  const handleToggleExamInclusion = (chapterId: string, examId: string) => {
    setData(prev => {
      const updatedSubjects = prev.subjects.map(subject => {
        const chapterExists = subject.chapters.some(c => c.chapter_id === chapterId);
        if (!chapterExists) return subject;

        const updatedChapters = subject.chapters.map(ch => {
          if (ch.chapter_id !== chapterId) return ch;

          const exists = ch.included_in_exams.includes(examId);
          const newExams = exists
            ? ch.included_in_exams.filter(id => id !== examId)
            : [...ch.included_in_exams, examId];

          return {
            ...ch,
            included_in_exams: newExams,
          };
        });

        return { ...subject, chapters: updatedChapters };
      });

      return { ...prev, subjects: updatedSubjects };
    });
  };

  // Handler: Batch toggle subject's chapters in exam
  const handleBatchToggleSubjectExam = (subjectId: string, examId: string, includeAll: boolean) => {
    setData(prev => {
      const updatedSubjects = prev.subjects.map(subj => {
        if (subj.subject_id !== subjectId) return subj;

        const updatedChapters = subj.chapters.map(ch => {
          let newExams = [...ch.included_in_exams];
          if (includeAll) {
            if (!newExams.includes(examId)) newExams.push(examId);
          } else {
            newExams = newExams.filter(id => id !== examId);
          }
          return { ...ch, included_in_exams: newExams };
        });

        return { ...subj, chapters: updatedChapters };
      });

      return { ...prev, subjects: updatedSubjects };
    });
  };

  // Handler: Batch set milestones for an entire subject
  const handleBatchSetSubjectMilestones = (subjectId: string, value: boolean) => {
    setData(prev => {
      const updatedSubjects = prev.subjects.map(subj => {
        if (subj.subject_id !== subjectId) return subj;

        const updatedChapters = subj.chapters.map(ch => {
          const updatedBreakdown: ProgressBreakdown = {
            board_book_reading: value,
            cq_practice: value,
            mcq_practice: value,
            test_paper_solve: value,
            revision_done: value,
          };
          return {
            ...ch,
            progress_breakdown: updatedBreakdown,
            completion_percentage: value ? 100 : 0,
          };
        });

        return { ...subj, chapters: updatedChapters };
      });

      return { ...prev, subjects: updatedSubjects };
    });
  };

  // Handler: Save Chapter Notes
  const handleSaveNotes = (chapterId: string, notes: string) => {
    setData(prev => {
      const updatedSubjects = prev.subjects.map(subject => {
        const chapterExists = subject.chapters.some(c => c.chapter_id === chapterId);
        if (!chapterExists) return subject;

        const updatedChapters = subject.chapters.map(ch => {
          if (ch.chapter_id !== chapterId) return ch;
          return { ...ch, notes };
        });

        return { ...subject, chapters: updatedChapters };
      });

      return { ...prev, subjects: updatedSubjects };
    });
  };

  // Handler: Edit Chapter Title / Number
  const handleSaveChapterEdit = (chapterId: string, chapterNumber: number, chapterTitle: string) => {
    setData(prev => {
      const updatedSubjects = prev.subjects.map(subject => {
        const chapterExists = subject.chapters.some(c => c.chapter_id === chapterId);
        if (!chapterExists) return subject;

        const updatedChapters = subject.chapters.map(ch => {
          if (ch.chapter_id !== chapterId) return ch;
          return {
            ...ch,
            chapter_number: chapterNumber,
            chapter_title: chapterTitle,
          };
        });

        return { ...subject, chapters: updatedChapters };
      });

      return { ...prev, subjects: updatedSubjects };
    });
  };

  // Handler: Delete Chapter
  const handleDeleteChapter = (chapterId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই অধ্যায়টি মুছে ফেলতে চান?')) return;
    setData(prev => {
      const updatedSubjects = prev.subjects.map(subject => {
        return {
          ...subject,
          chapters: subject.chapters.filter(ch => ch.chapter_id !== chapterId),
        };
      });
      return { ...prev, subjects: updatedSubjects };
    });
  };

  // Handler: Add New Chapter
  const handleAddChapter = (
    subjectId: string,
    chapterNumber: number,
    chapterTitle: string,
    includedExams: string[]
  ) => {
    const newChapterId = `${subjectId}_CH_${Date.now().toString().slice(-4)}`;
    const newChapter: Chapter = {
      chapter_id: newChapterId,
      chapter_number: chapterNumber,
      chapter_title: chapterTitle,
      included_in_exams: includedExams,
      progress_breakdown: {
        board_book_reading: false,
        cq_practice: false,
        mcq_practice: false,
        test_paper_solve: false,
        revision_done: false,
      },
      completion_percentage: 0,
    };

    setData(prev => {
      const updatedSubjects = prev.subjects.map(subj => {
        if (subj.subject_id !== subjectId) return subj;
        return {
          ...subj,
          chapters: [...subj.chapters, newChapter],
        };
      });
      return { ...prev, subjects: updatedSubjects };
    });
  };

  // Handler: Add New Subject
  const handleAddSubject = (subjectName: string, englishName: string, themeColor: string) => {
    const newSubjectId = `SUBJ_${Date.now().toString().slice(-4)}`;
    const newSubject: Subject = {
      subject_id: newSubjectId,
      subject_name: subjectName,
      english_name: englishName,
      theme_color: themeColor,
      chapters: [],
    };

    setData(prev => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }));
  };

  // Handler: Update Exam Title
  const handleUpdateExamTitle = (examId: string, newTitle: string) => {
    setData(prev => ({
      ...prev,
      custom_exam_syllabuses: prev.custom_exam_syllabuses.map(exam =>
        exam.exam_id === examId ? { ...exam, exam_title: newTitle } : exam
      ),
    }));
  };

  // Handler: Save Student Profile
  const handleSaveProfile = (updatedProfile: StudentProfile) => {
    setData(prev => ({
      ...prev,
      student_profile: updatedProfile,
    }));
  };

  // Reset to initial preset
  const handleResetData = () => {
    setData(INITIAL_APP_DATA);
    setActiveExamId('EXAM_ANNUAL');
    localStorage.removeItem(STORAGE_KEY);
  };

  // Export data as JSON file
  const handleExportData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `SSC_2028_${data.student_profile.student_id}_Syllabus_Tracker.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import data from JSON file
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.student_profile && parsed.subjects) {
          setData(parsed);
          alert('ডেটা সফলভাবে ইমপোর্ট সম্পন্ন হয়েছে!');
        } else {
          alert('অবৈধ JSON ফাইল ফরম্যাট।');
        }
      } catch (err) {
        alert('ফাইল লোড করতে সমস্যা হয়েছে। দয়া করে সঠিক JSON ফাইল নির্বাচন করুন।');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Student Profile Header */}
      <StudentHeader
        profile={data.student_profile}
        totalChapters={overallStats.totalChapters}
        completedChapters={overallStats.completedChapters}
        overallPercentage={overallStats.overallPercentage}
        activeExamTitle={activeExamTitle}
        activeExamPercentage={overallStats.activeExamPercentage}
        onEditProfile={() => setIsEditProfileOpen(true)}
        onResetData={handleResetData}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {/* Sticky Exam Filter Bar */}
      <ExamFilterBar
        syllabuses={data.custom_exam_syllabuses}
        activeExamId={activeExamId}
        subjects={data.subjects}
        onSelectExam={(examId) => setActiveExamId(examId)}
        onOpenCustomManager={() => setIsCustomManagerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Overall Statistics Banner & Search */}
        <OverallStatsSummary
          activeExamId={activeExamId}
          syllabuses={data.custom_exam_syllabuses}
          subjects={data.subjects}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onAddSubject={() => setIsAddSubjectOpen(true)}
        />

        {/* Subjects Sections */}
        <div className="space-y-6">
          {data.subjects.map((subject) => (
            <SubjectSection
              key={subject.subject_id}
              subject={subject}
              activeExamId={activeExamId}
              syllabuses={data.custom_exam_syllabuses}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              onToggleMilestone={handleToggleMilestone}
              onSetAllMilestones={handleSetAllMilestones}
              onToggleExamInclusion={handleToggleExamInclusion}
              onOpenNotes={(chapter) => setEditingChapterForNotes(chapter)}
              onEditChapter={(chapter) => setEditingChapterForEdit(chapter)}
              onDeleteChapter={handleDeleteChapter}
              onAddChapterToSubject={(subjectId) => {
                setTargetSubjectForAddChapter(subjectId);
                setIsAddChapterOpen(true);
              }}
              onBatchSetSubjectMilestones={handleBatchSetSubjectMilestones}
            />
          ))}
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>SSC {data.student_profile.ssc_batch} {data.student_profile.group} Group Syllabus & Study Tracker</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Student: <strong className="text-slate-600">{data.student_profile.full_name}</strong></span>
            <span>•</span>
            <span>Target: <strong className="text-emerald-700">GPA {data.student_profile.target_gpa}</strong></span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        profile={data.student_profile}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleSaveProfile}
      />

      <AddChapterModal
        isOpen={isAddChapterOpen}
        subjects={data.subjects}
        defaultSubjectId={targetSubjectForAddChapter}
        syllabuses={data.custom_exam_syllabuses}
        onClose={() => {
          setIsAddChapterOpen(false);
          setTargetSubjectForAddChapter(undefined);
        }}
        onAdd={handleAddChapter}
      />

      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onAddSubject={handleAddSubject}
      />

      <ChapterNotesModal
        isOpen={!!editingChapterForNotes}
        chapter={editingChapterForNotes}
        onClose={() => setEditingChapterForNotes(null)}
        onSaveNotes={handleSaveNotes}
      />

      <EditChapterModal
        isOpen={!!editingChapterForEdit}
        chapter={editingChapterForEdit}
        onClose={() => setEditingChapterForEdit(null)}
        onSave={handleSaveChapterEdit}
      />

      <CustomSyllabusManagerModal
        isOpen={isCustomManagerOpen}
        syllabuses={data.custom_exam_syllabuses}
        subjects={data.subjects}
        initialExamId={activeExamId}
        onClose={() => setIsCustomManagerOpen(false)}
        onToggleExamInclusion={handleToggleExamInclusion}
        onBatchToggleSubjectExam={handleBatchToggleSubjectExam}
        onUpdateExamTitle={handleUpdateExamTitle}
      />
    </div>
  );
}
