
import React from 'react';

const messages = [
    "Analyzing your materials...",
    "Crafting challenging questions...",
    "Simulating your teacher's style...",
    "Brewing some strong coffee for this...",
    "Assembling the answer key...",
    "Checking for typos (AI's are meticulous)...",
    "Finalizing the exam layout...",
];

export const Loader: React.FC = () => {
    const [message, setMessage] = React.useState(messages[0]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = messages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % messages.length;
                return messages[nextIndex];
            });
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);


  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[50vh] bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-800 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
      <h3 className="text-xl font-semibold mt-8 text-slate-800 dark:text-slate-200">Generating Your Exam</h3>
      <p className="text-slate-500 dark:text-slate-400 mt-2 transition-opacity duration-500">{message}</p>
    </div>
  );
};
