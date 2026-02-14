import { GoogleGenAI, Type } from "@google/genai";
import type { Difficulty, QuestionType, Exam } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const getResponseSchema = () => ({
  type: Type.OBJECT,
  properties: {
    title: { 
      type: Type.STRING,
      description: "A creative and relevant title for the exam based on the provided material."
    },
    questions: {
      type: Type.ARRAY,
      description: "An array of exam questions.",
      items: {
        type: Type.OBJECT,
        properties: {
          questionNumber: { 
            type: Type.INTEGER,
            description: "The sequential number of the question."
          },
          questionText: { 
            type: Type.STRING,
            description: "The full text of the question."
          },
          questionType: {
            type: Type.STRING,
            description: "The type of question. Must be one of: 'MCQ', 'ShortAnswer', 'Essay'."
          },
          options: {
            type: Type.ARRAY,
            description: "An array of 4 string options for MCQ questions. This field should be omitted for other question types.",
            items: {
              type: Type.STRING,
            }
          },
          correctAnswer: {
            type: Type.STRING,
            description: "The correct answer. For MCQs, this should be the full text of the correct option."
          }
        },
        required: ["questionNumber", "questionText", "questionType", "correctAnswer"]
      }
    }
  },
  required: ["title", "questions"]
});

export const generateExam = async (
  file: File,
  difficulty: Difficulty,
  questionTypes: QuestionType[],
  numberOfQuestions: number
): Promise<Exam> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const filePart = await fileToGenerativePart(file);

  const prompt = `
    You are ExaPrep AI, an expert exam creator. Your task is to create a high-quality practice exam based on the provided course material.

    Instructions:
    1.  **Analyze Material:** Carefully examine the content of the file, identifying key concepts, vocabulary, the language of the document, and the overall subject matter.
    2.  **Language Matching:** The generated exam, including all questions, options, and answers, MUST be in the same language as the original course material provided in the file.
    3.  **Generate Questions:** Create a set of exactly ${numberOfQuestions} new questions based on the material.
    4.  **Adhere to Configuration:**
        *   **Difficulty Level:** ${difficulty}. The complexity of questions and required knowledge should match this level.
        *   **Question Types:** The exam must include questions of the following types: ${questionTypes.join(', ')}. Distribute them logically throughout the exam.
    5.  **Content Requirements:**
        *   For Multiple Choice (MCQ) questions, provide exactly 4 distinct options, with one clear correct answer.
        *   For Short Answer questions, require a concise, factual answer.
        *   For Essay questions, pose a prompt that requires a more detailed, structured response.
        *   The 'correctAnswer' field must be comprehensive and accurate for all question types. For MCQs, it must be the full text of the correct option.
    6.  **Output Format:** Provide the output strictly in the requested JSON format with the specified schema. Do not include any markdown formatting like \`\`\`json.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: prompt },
          filePart,
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: getResponseSchema(),
      }
    });

    // Check for safety blocks or other reasons for no response
    if (response.promptFeedback?.blockReason) {
      throw new Error(`The request was blocked for safety reasons (${response.promptFeedback.blockReason}). Please try with different material.`);
    }

    const jsonText = response.text?.trim();

    if (!jsonText) {
      console.error("Gemini API returned an empty response. Full response:", response);
      throw new Error("The AI returned an empty response. This could be due to the content of your file, server load, or a content policy violation. Please try again with a different file.");
    }

    const parsedResponse = JSON.parse(jsonText);

    if (!parsedResponse.title || !Array.isArray(parsedResponse.questions)) {
      throw new Error("The AI returned an invalid data structure. Please try again.");
    }

    return {
      id: `exam_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...parsedResponse,
    };
  } catch (error) {
    console.error("Error in generateExam:", error);
    if (error instanceof SyntaxError) {
      // This catches JSON.parse errors
      throw new Error("The AI returned a response that was not in the correct format. Please try again.");
    }
    if (error instanceof Error) {
      // Re-throw our custom errors or other JS errors
      throw error;
    }
    // Fallback for non-Error objects
    throw new Error("An unknown error occurred while generating the exam.");
  }
};