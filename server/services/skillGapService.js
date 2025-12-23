/**
 * Skill Gap Service
 * Defines required skills for roles and calculates gaps.
 */

// Centralized map of required skills for key roles
const careerSkillMap = {
  "ai engineer": {
    core: ["python", "machine learning", "mathematics"],
    recommended: ["tensorflow", "pytorch", "sql", "git"]
  },
  "data scientist": {
    core: ["python", "statistics", "sql", "data visualization"],
    recommended: ["r", "pandas", "scikit-learn", "communication"]
  },
  "full stack developer": {
    core: ["html", "css", "javascript", "react", "node.js"],
    recommended: ["mongodb", "sql", "git", "typescript"]
  },
  "frontend developer": {
    core: ["html", "css", "javascript", "react"],
    recommended: ["tailwind", "ux design", "git"]
  },
  "backend developer": {
    core: ["node.js", "database", "api design"],
    recommended: ["docker", "aws", "python", "java"]
  },
  "cybersecurity analyst": {
    core: ["networking", "linux", "security fundamentals"],
    recommended: ["python", "bash", "encryption"]
  },
  "mobile developer": {
    core: ["react native", "javascript"],
    recommended: ["ios", "android", "firebase"]
  },
  "devops engineer": {
    core: ["linux", "docker", "ci/cd"],
    recommended: ["kubernetes", "aws", "python"]
  }
};

exports.analyzeSkillGaps = (userSkills, targetRole) => {
  const roleKey = targetRole.toLowerCase();
  
  // Find the closest matching role in our map (simple inclusion check)
  const mapKey = Object.keys(careerSkillMap).find(key => roleKey.includes(key));
  
  if (!mapKey) {
    return { missingSkills: [], matchScore: 0 }; // Unknown role, no gap analysis possible
  }

  const requirements = careerSkillMap[mapKey];
  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  
  const missingSkills = [];
  let coreMatches = 0;
  let recommendedMatches = 0;

  // Check Core Skills
  requirements.core.forEach(skill => {
    if (userSkillsLower.includes(skill)) {
      coreMatches++;
    } else {
      missingSkills.push({ skill, priority: "High", type: "Core" });
    }
  });

  // Check Recommended Skills
  requirements.recommended.forEach(skill => {
    if (userSkillsLower.includes(skill)) {
      recommendedMatches++;
    } else {
      missingSkills.push({ skill, priority: "Medium", type: "Recommended" });
    }
  });

  const totalRequired = requirements.core.length + requirements.recommended.length;
  const totalMatches = coreMatches + recommendedMatches;
  const matchScore = totalRequired > 0 ? Math.round((totalMatches / totalRequired) * 100) : 0;

  return {
    missingSkills, // Array of { skill, priority, type }
    matchScore
  };
};
