import { createAgent, gemini} from "@inngest/agent-kit";

const analyzeTicket = async (ticketData) => {
  const supportAgent = createAgent({
    model: gemini({
        mode: "gemini-2.0-flash",
        apiKey: process.env.GEMINI_API_KEY,
    }),
    name: "AI Ticket Tagging Assistant",
    system: 
    `
    You are an expert AI assistant specialized in analyzing and processing technical support tickets.
    Your task is to analyze the provided ticket data and generate a summary, estimate its priority, and suggest relevant tags based on the content of the ticket.

    Your Job is to :
    1. Summarize the issue.
    2. Estimate its priority.
    3. Provide helpful notes and resources links for human moderators.
    4. List relevant skills that might be needed to resolve the issue.
    5. Provide relevant tags based on the content of the ticket.

    IMPORTANT:
    - Respond with *only* valid raw JSON.
    - Do Not include markdown, code fences, comments or any extra formatting.
    - The format must be a raw JSON object.

    REPEAT : Do not wrap your output in markdown or code fences.

    `
    });

  const response = await supportAgent.run(`

    You are a ticket triage agent. Only return a strict JSON object with no extra text, headers, or markdown.

    Analyze the following ticket data and provide a summary, priority estimate, helpful notes, relevant skills, and tags:
    - summary : A brief description of the issue.
    - priority : A priority estimate (low, medium, high).
    - helpfulNotes : Helpful notes and resources links for human moderators.
    - relatedSkills : Relevant skills that might be needed to resolve the issue.

    Respond ONLY in this JSON format and do not include any additional text or formatting, text or markdown in answer:
    {
      "summary": "A brief description of the issue.",
      "priority": "low | medium | high",
      "helpfulNotes": "Helpful note .....",
      "relatedSkills": ["Skill 1", "Skill 2"],
    }

    ---

    TICKET information:
    - Ttile: ${ticketData.title}
    - Description: ${ticketData.description}
 
    `)

    const raw = response.output[0].context

    try{
        const match = raw.match(/```json\s*([\s\S]*?)\s*```/i);
        
        const jsonString = match ? match[1] : raw.trim();

        const jsonData = JSON.parse(jsonString);

        console.log("Parsed JSON Data:", jsonData);

        return jsonData;
    } catch (error) {
        console.error("Error parsing JSON from AI:", error);

        return null;
    }
};


export default analyzeTicket;