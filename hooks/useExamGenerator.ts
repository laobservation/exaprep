import { useState, useCallback } from 'react';
import { generateExam as generateExamFromApi } from '../services/geminiService';
import type { Exam, Difficulty, QuestionType } from '../types';

export const useExamGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedExam, setGeneratedExam] = useState<Exam | null>(null);

  const generateExam = useCallback(
    async (file: File, difficulty: Difficulty, questionTypes: QuestionType[], numberOfQuestions: number) => {
      setIsGenerating(true);
      setError(null);
      setGeneratedExam(null);

      try {
        const exam = await generateExamFromApi(file, difficulty, questionTypes, numberOfQuestions);
        setGeneratedExam(exam);
      } catch (err) {
        if (err instanceof Error) {
            // Use the specific error message from the service layer
            setError(err.message);
        } else {
            setError('An unknown error occurred while generating the exam.');
        }
        console.error(err);
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  return { isGenerating, error, generatedExam, generateExam };
};