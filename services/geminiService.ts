
import { GoogleGenAI, Chat, GenerateContentResponse, Part } from "@google/genai";
import { ChatMessage, AdminAcademicInsights, ApiResponse, StudentAttitudeStats, DropoutRiskAnalysis } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set. AI features will be disabled or limited.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const CHAT_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';
const TEXT_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

let activeChat: Chat | null = null;

export const initializeChat = (): Chat | null => {
  if (!ai) return null;
  if (!activeChat) { 
     activeChat = ai.chats.create({
      model: CHAT_MODEL_NAME,
      config: {
        systemInstruction: "You are Mindsetu, a friendly, empathetic, and supportive AI companion for students. Your goal is to provide a safe space for them to express their feelings, offer helpful advice, coping strategies, and uplifting encouragement. Avoid giving medical diagnoses. Keep responses concise, positive, and understanding. If a user expresses severe distress or mentions self-harm, gently encourage them to speak to a trusted adult, counselor, or use an emergency helpline, and provide placeholder contact info if specifically asked for emergency resources.",
      },
    });
  }
  return activeChat;
};

export const clearActiveChat = () => {
  activeChat = null;
};

export const sendMessageToChatStream = async (
  message: string,
  onChunk: (text: string) => void,
  onError: (error: string) => void
): Promise<void> => {
  if (!ai) {
    onError("Gemini API not initialized. Please ensure API_KEY is set.");
    setTimeout(() => onChunk("I'm currently unable to connect fully due to a configuration issue. I can offer limited responses."), 500);
    return;
  }
  
  const chat = initializeChat();
  if (!chat) {
     onError("Failed to initialize chat.");
     setTimeout(() => onChunk("Sorry, I couldn't start our chat session properly."), 500);
     return;
  }

  try {
    const result = await chat.sendMessageStream({ message });
    let fullResponse = "";
    for await (const chunk of result) {
      if (chunk.text) {
        onChunk(chunk.text);
        fullResponse += chunk.text;
      }
    }
    if (!fullResponse.trim()) { 
        onChunk("Hmm, I didn't get a response that time. Could you try rephrasing?");
    }

  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    onError(`Sorry, I encountered an error. ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const analyzeJournalEntry = async (entryText: string): Promise<string> => {
  if (!ai) {
     console.warn("Gemini API not initialized for analyzeJournalEntry. Returning default message.");
     return "AI reflection is currently unavailable. Take a moment to appreciate your thoughts."; 
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: `A student wrote this journal entry: "${entryText}". Provide a brief (2-3 sentences), supportive, and empathetic reflection on their entry. Focus on validating their feelings and perhaps offer a gentle, positive perspective or a simple coping thought if appropriate. Do not give advice unless it's very general (e.g., "remember to be kind to yourself"). Do not diagnose.`,
    });
    return response.text?.trim() || "Thanks for sharing. It's good to express your thoughts."; 
  } catch (error) {
    console.error("Error analyzing journal entry:", error);
    return "Sorry, I couldn't analyze the entry right now. Please try again later.";
  }
};

export const generateAdminAcademicInsights = async (
  stats: { 
    onTimePercent: number; 
    latePercent: number; 
    missedPercent: number; 
    totalStudents: number; 
    instituteName: string;
  }
): Promise<ApiResponse<AdminAcademicInsights>> => {
  if (!ai) {
    console.warn("Gemini API not initialized for generateAdminAcademicInsights.");
    return { 
      success: false, 
      error: "AI insights are currently unavailable. API key not configured.",
      data: {
        academicPressureAnalysis: "AI analysis is unavailable due to configuration issues. Please review assignment submission patterns manually.",
        studentRetentionTips: ["Ensure API key is correctly set up to enable AI-powered suggestions."]
      }
    };
  }

  const prompt = `
    Given the following academic submission statistics for the institute "${stats.instituteName}", which has ${stats.totalStudents} students:
    - On-Time Assignment Submissions: ${stats.onTimePercent.toFixed(1)}%
    - Late Assignment Submissions: ${stats.latePercent.toFixed(1)}%
    - Missed Assignment Submissions: ${stats.missedPercent.toFixed(1)}%

    Please provide an analysis in JSON format. The JSON object should have two keys:
    1.  "academicPressureAnalysis": A string containing a brief (2-4 sentences) analysis of how these submission rates might reflect overall academic pressure on students. Consider potential impacts on student well-being and engagement.
    2.  "studentRetentionTips": An array of 2-3 strings, where each string is an actionable pro-tip for administrators to help mitigate student dropout risks based on these submission patterns.

    Example JSON structure:
    {
      "academicPressureAnalysis": "The submission rates suggest...",
      "studentRetentionTips": [
        "Tip 1...",
        "Tip 2..."
      ]
    }

    Focus on constructive and supportive language. Ensure the output is valid JSON.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let jsonStr = (response.text ?? "").trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as AdminAcademicInsights;

    if (parsedData && parsedData.academicPressureAnalysis && parsedData.studentRetentionTips) {
        return { success: true, data: parsedData };
    } else {
        console.error("Parsed JSON data is not in the expected format:", parsedData);
        return { 
          success: false, 
          error: "AI returned an unexpected data format for insights.",
          data: { // Fallback for unexpected format
            academicPressureAnalysis: "Received an unexpected data format from AI. Manual review is advised.",
            studentRetentionTips: ["Verify AI configuration and prompt if issues persist."]
          }
        };
    }

  } catch (error) {
    console.error("Error generating admin academic insights:", error);
    let errorMessage = "Sorry, I couldn't generate the academic insights right now.";
    if (error instanceof Error) {
        errorMessage += ` Details: ${error.message}`;
    }
     return { 
        success: false, 
        error: errorMessage,
        data: { // Provide fallback data on error
            academicPressureAnalysis: "Could not retrieve AI analysis due to an error. Please check submission data manually and try again later.",
            studentRetentionTips: ["Review student support resources.", "Encourage open communication with students about workload."]
        }
    };
  }
};


export const generateStudentDropoutRiskAnalysis = async (
  academicStats: { onTimePercent: number; latePercent: number; missedPercent: number },
  attitudeStats: StudentAttitudeStats,
  instituteDetails: { name: string; totalStudents: number }
): Promise<ApiResponse<DropoutRiskAnalysis>> => {
  if (!ai) {
    console.warn("Gemini API not initialized for generateStudentDropoutRiskAnalysis.");
    return {
      success: false,
      error: "AI analysis for dropout risk is currently unavailable. API key not configured.",
      data: {
        riskLevel: "Unavailable",
        analysisText: "AI-driven dropout risk analysis is offline due to configuration issues.",
        contributingFactors: ["API key missing or invalid."],
        proactiveSuggestions: ["Ensure the Gemini API key is correctly set up in the environment variables."]
      }
    };
  }

  const prompt = `
    As an educational risk assessment AI, analyze the following data for "${instituteDetails.name}" which has ${instituteDetails.totalStudents} students.
    Student Attitude Overview (based on journal entries from ${attitudeStats.analyzedStudentCount} students):
    - Positive Attitude: ${attitudeStats.positivePercent.toFixed(1)}%
    - Negative Attitude: ${attitudeStats.negativePercent.toFixed(1)}%
    - Neutral/Mixed Attitude: ${attitudeStats.neutralPercent.toFixed(1)}%

    Academic Submission Patterns:
    - Assignments On-Time: ${academicStats.onTimePercent.toFixed(1)}%
    - Assignments Late: ${academicStats.latePercent.toFixed(1)}%
    - Assignments Missed: ${academicStats.missedPercent.toFixed(1)}%

    Based on this combined data, provide a student dropout risk analysis in JSON format. The JSON object should have the following keys:
    1. "riskLevel": A string indicating the overall estimated dropout risk level. Choose from: "Low", "Moderate", "High".
    2. "analysisText": A string (2-4 sentences) explaining the risk level, considering both academic pressure (from submission stats) and overall student sentiment (from attitude stats).
    3. "contributingFactors": An array of 2-3 strings listing key factors derived from the data that influence this risk assessment.
    4. "proactiveSuggestions": An array of 2-3 actionable suggestions for the institute administrators to mitigate potential dropout risks.

    Example JSON output:
    {
      "riskLevel": "Moderate",
      "analysisText": "The current data suggests a moderate risk of student dropout. While a majority show positive attitudes, the percentage of missed assignments indicates potential academic stress or disengagement for a segment of students.",
      "contributingFactors": [
        "Notable percentage of missed assignments.",
        "Significant minority of students exhibiting negative attitudes.",
        "Potential imbalance in workload distribution."
      ],
      "proactiveSuggestions": [
        "Implement targeted academic support for students with high missed assignment rates.",
        "Increase availability of counseling services and promote their use.",
        "Survey students about workload and course difficulty to identify pressure points."
      ]
    }

    Ensure the output is valid JSON. Be nuanced and constructive in your analysis.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let jsonStr = (response.text ?? "").trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as DropoutRiskAnalysis;

    if (parsedData && parsedData.riskLevel && parsedData.analysisText && parsedData.contributingFactors && parsedData.proactiveSuggestions) {
        return { success: true, data: parsedData };
    } else {
        console.error("Parsed JSON data for dropout risk is not in the expected format:", parsedData);
        return { 
          success: false, 
          error: "AI returned an unexpected data format for dropout risk analysis.",
           data: { // Fallback for unexpected format
            riskLevel: "Unavailable",
            analysisText: "Received an unexpected data format from AI for dropout risk. Manual review is advised.",
            contributingFactors: ["Verify AI configuration and prompt if issues persist."],
            proactiveSuggestions: ["Check AI model response structure."]
          }
        };
    }

  } catch (error) {
    console.error("Error generating student dropout risk analysis:", error);
    let errorMessage = "Sorry, I couldn't generate the dropout risk analysis right now.";
    if (error instanceof Error) {
        errorMessage += ` Details: ${error.message}`;
    }
     return { 
        success: false, 
        error: errorMessage,
        data: { // Provide fallback data on error
            riskLevel: "Unavailable",
            analysisText: "Could not retrieve AI analysis for dropout risk due to an error. Please review student data manually.",
            contributingFactors: ["Potential API connectivity issue.", "High server load on AI provider."],
            proactiveSuggestions: ["Focus on direct student outreach.", "Review individual student performance and mood trends manually."]
        }
    };
  }
};
