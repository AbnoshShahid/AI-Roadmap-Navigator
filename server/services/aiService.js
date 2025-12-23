const Groq = require('groq-sdk');

let groq;
if (process.env.GROQ_API_KEY) {
    groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });
} else {
    console.warn("⚠️ GROQ_API_KEY is missing. AI features will use fallback/mock data.");
}

exports.generateRoadmap = async ({ education, skills, interests, role, augmentedPrompt = "" }) => {
    // Construct the structured prompt
    const prompt = `
    You are an expert career counselor AI. Your task is to generate a personalized career roadmap for a user targeting the role of "${role}".

    User Profile:
    - Education: ${education}
    - Current Skills: ${skills.join(', ')}
    - Interests: ${interests}
    
    ${augmentedPrompt}
    
    STRICT REQUIREMENT:
    Return pure JSON only. No markdown, no "Here is the JSON", no backticks.
    The valid JSON object must strictly follow this structure:

    {
      "userSummary": {
        "role": "${role}",
        "education": "${education}",
        "currentSkills": "${skills.join(', ')}",
        "interests": "${interests}"
      },
      "jobSuggestions": [
        { "title": "Job Title 1", "description": "1-line description of what they do." },
        { "title": "Job Title 2", "description": "1-line description of what they do." }
      ],
      "skillsAnalysis": {
        "requiredSkills": ["Skill A", "Skill B", "Skill C"],
        "existingSkills": ["Skill A"],
        "missingSkills": ["Skill B", "Skill C"],
        "matchPercentage": 33 // integer 0-100
      },
      "roadmap": [
        {
          "phase": "Months 1-2: Foundations",
          "focus": "Core concepts and basics",
          "skills": ["Skill A", "Skill B"],
          "projects": ["Project Idea 1"]
        },
        {
          "phase": "Months 3-4: Advanced",
          "focus": "Deep dive and complex topics",
          "skills": ["Skill C", "Skill D"],
          "projects": ["Project Idea 2"]
        }
      ]
    }
    `;

    try {
        if (!groq) throw new Error("Groq client not initialized (missing API Key)");

        const response = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful AI assistant that outputs strictly valid JSON." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            response_format: { type: "json_object" }
        });

        const rawContent = response.choices[0]?.message?.content || "";

        try {
            const parsed = JSON.parse(rawContent);
            return parsed;
        } catch (jsonError) {
            console.warn("Failed to parse Groq JSON response:", rawContent);
            throw new Error("Invalid format from AI");
        }

    } catch (error) {
        console.error("Groq API Error:", error.message);
        console.warn("Falling back to Mock Data due to API failure.");

        // Robust Mock Data matching the EXACT new structure
        return {
            "userSummary": {
                "role": role,
                "education": education,
                "currentSkills": skills.join(', '),
                "interests": interests
            },
            "jobSuggestions": [
                { "title": "Mock " + role, "description": "Works on simulating " + role + " tasks." },
                { "title": "Senior " + role, "description": "Leads teams and designs architecture." }
            ],
            "skillsAnalysis": {
                "requiredSkills": ["Mock Skill A", "Mock Skill B", "Mock Skill C"],
                "existingSkills": skills,
                "missingSkills": ["Mock Skill A", "Mock Skill B"],
                "matchPercentage": 50
            },
            "roadmap": [
                {
                    "phase": "Months 1-2: Fundamentals (Mock)",
                    "focus": "Building specific foundations",
                    "skills": ["Basics 101", "Core Concepts"],
                    "projects": ["Simple Starter Project"]
                },
                {
                    "phase": "Months 3-4: Intermediate (Mock)",
                    "focus": "Applying knowledge",
                    "skills": ["Advanced Usage", "Optimization"],
                    "projects": ["Real-world Clone"]
                }
            ]
        };
    }
};


exports.extractSkillsFromRoadmap = async (roadmapData) => {
    let extracted = [];

    // 1. Try AI Extraction
    try {
        if (groq) {
            const prompt = `
            You are an expert technical recruiter and career coach.
            Analyze the following career roadmap JSON and extract a simplified, flat list of distinct technical and soft skills mentioned.
            
            Roadmap Data:
            ${JSON.stringify(roadmapData).slice(0, 15000)}
            
            Rules:
            1. Return ONLY a JSON array of strings. Example: ["React", "Node.js", "Leadership"].
            2. Extract skills from the "roadmap" phases, "focus" areas, and "projects".
            3. Normalize names (e.g., "Intro to Python" -> "Python").
            4. De-duplicate.
            5. No markdown, no "Here is the list". Pure JSON array.
            `;

            const response = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: "You output strictly valid JSON arrays of strings." },
                    { role: "user", content: prompt }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.3,
                response_format: { type: "json_object" }
            });

            const content = response.choices[0]?.message?.content;
            console.log("[AI Service] Raw extracted skills:", content);

            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) extracted = parsed;
            else if (parsed.skills && Array.isArray(parsed.skills)) extracted = parsed.skills;
            else if (parsed.extractedSkills && Array.isArray(parsed.extractedSkills)) extracted = parsed.extractedSkills;
            else extracted = Object.values(parsed).flat();
        }
    } catch (error) {
        console.error("AI Skill Extraction Failed:", error.message);
    }

    // 2. Heuristic Fallback (If AI failed or returned nothing)
    if (!extracted || extracted.length === 0) {
        try {
            console.log("[AI Service] Falling back to heuristic extraction...");
            const skillsSet = new Set();

            // Extract from 'skillsAnalysis'
            if (roadmapData.skillsAnalysis) {
                if (Array.isArray(roadmapData.skillsAnalysis.requiredSkills)) {
                    roadmapData.skillsAnalysis.requiredSkills.forEach(s => skillsSet.add(s));
                }
                if (Array.isArray(roadmapData.skillsAnalysis.missingSkills)) {
                    roadmapData.skillsAnalysis.missingSkills.forEach(s => skillsSet.add(s));
                }
            }

            // Extract from Roadmap Phases
            if (Array.isArray(roadmapData.roadmap)) {
                roadmapData.roadmap.forEach(phase => {
                    if (Array.isArray(phase.skills)) {
                        phase.skills.forEach(s => skillsSet.add(s));
                    }
                });
            }

            extracted = Array.from(skillsSet);
            console.log(`[AI Service] Heuristically extracted ${extracted.length} skills.`);
        } catch (fallbackError) {
            console.error("Heuristic fallback also failed:", fallbackError);
        }
    }

    return extracted || [];
};
