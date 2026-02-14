
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ExamConfiguration } from './components/ExamConfiguration';
import { GeneratedExam } from './components/GeneratedExam';
import { ExamHistory } from './components/ExamHistory';
import { Loader } from './components/Loader';
import { useExamGenerator } from './hooks/useExamGenerator';
import type { Exam, Difficulty, QuestionType } from './types';

const App: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(['MCQ']);
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(7);
  const [examHistory, setExamHistory] = useState<Exam[]>([]);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);

  const { isGenerating, error, generatedExam, generateExam } = useExamGenerator();

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('examHistory');
      if (storedHistory) {
        setExamHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse exam history from localStorage", e);
      localStorage.removeItem('examHistory');
    }
  }, []);

  useEffect(() => {
    if (generatedExam) {
      setCurrentExam(generatedExam);
      const newHistory = [generatedExam, ...examHistory].slice(0, 10); // Keep last 10
      setExamHistory(newHistory);
      localStorage.setItem('examHistory', JSON.stringify(newHistory));
    }
  }, [generatedExam]); // removed examHistory from deps to avoid loop on setExamHistory

  const handleGenerateClick = useCallback(() => {
    if (!uploadedFile) {
      alert('Please upload a file first.');
      return;
    }
    setCurrentExam(null);
    generateExam(uploadedFile, difficulty, questionTypes, numberOfQuestions);
  }, [uploadedFile, difficulty, questionTypes, numberOfQuestions, generateExam]);

  const handleSelectHistory = (exam: Exam) => {
    setCurrentExam(exam);
    setUploadedFile(null); // Clear file upload when viewing history
  };
  
  const startNewExam = () => {
    setCurrentExam(null);
    setUploadedFile(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
             <div className="space-y-8 sticky top-8">
               <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Create New Exam</h2>
                  <FileUpload onFileSelect={setUploadedFile} currentFile={uploadedFile} />
                  {uploadedFile && (
                    <>
                      <ExamConfiguration
                        difficulty={difficulty}
                        onDifficultyChange={setDifficulty}
                        questionTypes={questionTypes}
                        onQuestionTypesChange={setQuestionTypes}
                        numberOfQuestions={numberOfQuestions}
                        onNumberOfQuestionsChange={setNumberOfQuestions}
                      />
                      <button
                        onClick={handleGenerateClick}
                        disabled={isGenerating || !uploadedFile}
                        className="w-full mt-6 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition-all duration-300 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isGenerating ? 'Generating...' : 'Generate Exam'}
                      </button>
                    </>
                  )}
               </div>
               <ExamHistory history={examHistory} onSelect={handleSelectHistory} currentExamId={currentExam?.id} startNewExam={startNewExam}/>
             </div>
          </div>
          <div className="lg:col-span-8 xl:col-span-9">
            {isGenerating && <Loader />}
            {error && <div className="text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">{error}</div>}
            {currentExam && !isGenerating && <GeneratedExam exam={currentExam} />}
            {!isGenerating && !error && !currentExam && (
              <div className="flex flex-col items-center justify-center h-full min-h-[50vh] bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
                <img src="https://picsum.photos/seed/examprep/400/300" alt="Illustration of books and a lightbulb" className="rounded-lg mb-8" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome to ExaPrep AI</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-md text-center">
                  Upload your course material, choose your settings, and let our AI create a practice exam to help you ace your test.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
