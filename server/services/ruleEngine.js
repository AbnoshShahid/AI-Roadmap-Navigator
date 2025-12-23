/**
 * Rule Engine for Hybrid Intelligence
 * Analyzes user profile to detect gaps, prerequisites, and needed prompt augmentations.
 */

exports.analyzeProfile = ({ education, skills, interests, role }) => {
    const triggeredRules = [];
    const reasoning = [];
    let modifiedPrompt = "";

    const roleLower = role.toLowerCase();
    const educationLower = education.toLowerCase();
    const skillsLower = skills.map(s => s.toLowerCase());

    // Rule 1: AI/ML Roles require Python
    if ((roleLower.includes('ai') || roleLower.includes('data') || roleLower.includes('machine learning')) && !skillsLower.includes('python')) {
        triggeredRules.push("Missing Core Language (Python)");
        reasoning.push(`The target role "${role}" heavily relies on Python, which was not listed in your current skills.`);
        modifiedPrompt += " IMPORTANT: The user is missing Python. The roadmap MUST start with Python fundamentals for Data Science/AI. ";
    }

    // Rule 2: Non-tech background targeting technical role
    const techDegrees = ['computer science', 'software', 'engineering', 'information technology', 'graduate', 'undergraduate'];
    // Simple heuristic: if education is NOT in the list (or is 'High School' or 'Self-Taught' which might need CS fundamentals explicitly stated)
    // Actually, let's look for "Self-Taught" or "High School" specifically for CS fundamentals emphasis.
    if (['high school', 'self-taught', 'non-technical'].includes(educationLower)) {
        triggeredRules.push("CS Fundamentals Recommended");
        reasoning.push("Since you are starting from a non-traditional academic background, strong CS fundamentals (Algorithms, Data Structures) are critical.");
        modifiedPrompt += " ADDITION: Include specific modules on CS Fundamentals (Data Structures & Algorithms) in the early phases. ";
    }

    // Rule 3: Web Development missing JS/HTML/CSS
    if ((roleLower.includes('web') || roleLower.includes('frontend') || roleLower.includes('full stack')) &&
        (!skillsLower.includes('javascript') && !skillsLower.includes('react') && !skillsLower.includes('html'))) {
        triggeredRules.push("Missing Web Basics");
        reasoning.push("Targeting Web Development requires HTML/CSS/JS. These are prioritized.");
        modifiedPrompt += " PRIORITY: Start with robust HTML/CSS/JavaScript deep dives before frameworks. ";
    }

    // Rule 4: Conditional Stack Customization (User Preference)
    if (skillsLower.includes('python')) {
        triggeredRules.push("Stack Preference: Python");
        reasoning.push("User has existing Python skills. Roadmap will focus on Python-based web frameworks (Django/Flask).");
        modifiedPrompt += " CONSTRAINT: The user knows Python. STRICTLY generate a roadmap for a Python Full Stack Developer using Django or Flask. Do NOT suggest MERN stack unless explicitly requested. ";
    } else if (skillsLower.includes('javascript')) {
        triggeredRules.push("Stack Preference: JavaScript");
        reasoning.push("User has existing JavaScript skills. Roadmap will focus on the MERN stack.");
        modifiedPrompt += " CONSTRAINT: The user knows JavaScript. Generate a roadmap for the MERN Stack (MongoDB, Express, React, Node.js). ";
    }

    return {
        triggeredRules,
        reasoning: reasoning.join(" "),
        modifiedPrompt
    };
};
