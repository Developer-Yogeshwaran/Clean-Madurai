import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "demo-key";
const genAI = new GoogleGenerativeAI(API_KEY);

// Helper to convert File to base64
export const fileToGenerativePart = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve({
                inlineData: {
                    data: reader.result.split(",")[1],
                    mimeType: file.type
                }
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const analyzeCleanup = async (beforeFile, afterFile) => {
    if (API_KEY === "demo-key") {
        // Return dummy response for demo purposes
        return new Promise((resolve) => setTimeout(() => resolve({
            beforeScore: 20,
            afterScore: 90,
            improvementScore: 70,
            credits: 35,
            type: "organic, plastic",
            size: "medium",
            message: "Great job! A noticeable improvement in the area. Found plastic and organic waste.",
            valid: true
        }), 2000));
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const beforePart = await fileToGenerativePart(beforeFile);
        const afterPart = await fileToGenerativePart(afterFile);

        const prompt = `
    You are an AI trained to evaluate public space cleanup efforts.
    You will receive two images:
    1: Before cleanup
    2: After cleanup
    
    Analyze the images and output a JSON response with the following keys exactly:
    - beforeScore (0-100 indicating cleanliness before, lower means dirtier)
    - afterScore (0-100 indicating cleanliness after, higher means cleaner)
    - type (detect the main type of garbage: "plastic", "organic", "e-waste", "mixed")
    - size (estimate the cleaned area: "small", "medium", "large")
    - valid (boolean, true if it looks like a genuine cleanup, false if images don't match or look fake)
    - message (short feedback message)
    
    Calculate an improvementScore (afterScore - beforeScore). If improvementScore > 20 and valid is true, assign credits (e.g., 20 for small, 35 for medium, 50 for large). Include 'improvementScore' and 'credits' in the JSON too.
    Ensure your output is strictly valid JSON without any markdown formatting.
    `;

        const result = await model.generateContent([prompt, beforePart, afterPart]);
        const response = await result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);

    } catch (error) {
        console.error("Gemini AI Error:", error);
        throw new Error("Failed to analyze images. Please try again.");
    }
};
