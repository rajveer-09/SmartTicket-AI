import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const analyzeTicket = async (ticket) => {

  const systemInstruction = `You are an expert AI assistant that processes technical support tickets. 

Your job is to:
1. Summarize the issue.
2. Estimate its priority.
3. Provide helpful notes and resource links for human moderators.
4. List relevant technical skills required.
5. Keep Helpul Notes Crisp 2-4 lines only

IMPORTANT:
- Respond with *only* valid raw JSON.
- Do NOT include markdown, code fences, comments, or any extra formatting.
- The format must be a raw JSON object.

Repeat: Do not wrap your output in markdown or code fences.`;

  const userPrompt = `You are a ticket triage agent. Only return a strict JSON object with no extra text, headers, or markdown.
        
Analyze the following support ticket and provide a JSON object with:

- summary: A short 1-2 sentence summary of the issue.
- priority: One of "low", "medium", or "high".
- helpfulNotes: A detailed technical explanation that a moderator can use to solve this issue. Include useful external links or resources if possible.
- relatedSkills: An array of relevant skills required to solve the issue (e.g., ["React", "MongoDB"]).

Respond ONLY in this JSON format and do not include any other text or markdown in the answer:

{
"summary": "Short summary of the ticket",
"priority": "HIGH",
"helpfulNotes": "Here are useful tips...",
"relatedSkills": ["React", "Node.js"]
}

---

Ticket information:

- Title: ${ticket.title}
- Description: ${ticket.description}`;

  try {
    // Calling the Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json", 
        systemInstruction: systemInstruction,
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
    });

    const raw = response.text; 

    // Check if raw response exists
    if (!raw) {
      console.error(
        "AI response is empty or undefined. Full response structure:",
        JSON.stringify(response, null, 2)
      );
      return null;
    }

    // Cleaning the response string
    let cleanedResponse = String(raw).trim();

    // First, try to extract JSON from markdown code blocks (fallback)
    const markdownMatch = cleanedResponse.match(/```json\n([\s\S]*?)\n```/i) || 
                          cleanedResponse.match(/```([\s\S]*?)```/i);
    
    if (markdownMatch) {
      cleanedResponse = markdownMatch[1].trim();
    }

    // Remove any leading/trailing text that might interfere with JSON parsing
    // Look for JSON object boundaries
    const jsonStart = cleanedResponse.indexOf("{");
    const jsonEnd = cleanedResponse.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
    }

    // Parse the JSON
    const parsedResult = JSON.parse(cleanedResponse);

    // Validate the required fields
    if (
      !parsedResult.summary ||
      !parsedResult.priority ||
      !parsedResult.helpfulNotes ||
      !parsedResult.relatedSkills
    ) {
      console.warn("Parsed JSON is missing required fields:", parsedResult);
    }


    const validPriorities = ["LOW", "MEDIUM", "HIGH"];
    if (!validPriorities.includes(parsedResult.priority.toUpperCase())) {
      console.warn(
        `Invalid priority "${parsedResult.priority}". Setting to "medium".`
      );
      parsedResult.priority = "MEDIUM";
    }


    if (!Array.isArray(parsedResult.relatedSkills)) {
      console.warn("relatedSkills is not an array. Converting to array.");
      parsedResult.relatedSkills = parsedResult.relatedSkills
        ? [parsedResult.relatedSkills]
        : [];
    }

    return parsedResult;
  } catch (e) {
    // console.error("Failed to parse JSON from AI response:", e.message);
    
    // console.error("Full error:", e);

   
    return {
      summary: "Unable to process ticket automatically",
      priority: "MEDIUM",
      helpfulNotes: "Manual review required. AI parsing failed.",
      relatedSkills: ["Manual Review"],
    };
  }
};

export default analyzeTicket;