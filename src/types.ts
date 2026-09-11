export interface StudentProfile {
  student_id: string;
  full_name: string;
  ssc_batch: string;
  group: string;
  target_gpa: string;
  active_exam_filter: string;
}

export interface CustomExamSyllabus {
  exam_id: string;
  exam_title: string;
  is_active: boolean;
}

export interface ProgressBreakdown {
  board_book_reading: boolean;
  cq_practice: boolean;
  mcq_practice: boolean;
  test_paper_solve: boolean;
  revision_done: boolean;
}

export interface Chapter {
  chapter_id: string;
  chapter_number: number;
  chapter_title: string;
  included_in_exams: string[];
  progress_breakdown: ProgressBreakdown;
  completion_percentage: number;
  notes?: string;
}

export interface Subject {
  subject_id: string;
  subject_name: string;
  english_name: string;
  theme_color: string;
  chapters: Chapter[];
}

export interface AppData {
  student_profile: StudentProfile;
  custom_exam_syllabuses: CustomExamSyllabus[];
  subjects: Subject[];
}
