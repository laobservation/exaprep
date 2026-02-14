
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type QuestionType = 'MCQ' | 'ShortAnswer' | 'Essay';

export interface Question {
  questionNumber: number;
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  correctAnswer: string;
}

export interface Exam {
  id: string;
  title: string;
  questions: Question[];
  createdAt: string;
}
