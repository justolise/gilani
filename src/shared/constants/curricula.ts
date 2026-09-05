export interface CurriculumSubject {
  id: string;
  name: string;
  iconName?: string;
  starterPrompt: string;
}

export interface CurriculumConfig {
  id: string;
  label: string;
  description: string;
  subjects: CurriculumSubject[];
}

export const CURRICULA_CONFIG: Record<string, CurriculumConfig> = {
  KCSE: {
    id: "KCSE",
    label: "KCSE (KNEC)",
    description: "Kenya Certificate of Secondary Education",
    subjects: [
      {
        id: "math",
        name: "Mathematics",
        starterPrompt: "I need help solving a KCSE mathematics question step-by-step:",
      },
      {
        id: "physics",
        name: "Physics",
        starterPrompt: "Explain this KCSE physics concept and show how KNEC tests it:",
      },
      {
        id: "chem",
        name: "Chemistry",
        starterPrompt: "Help me understand this chemistry reaction/equation step-by-step:",
      },
      {
        id: "bio",
        name: "Biology",
        starterPrompt: "Explain this biology process with key KCSE definitions and functions:",
      },
      {
        id: "eng",
        name: "English",
        starterPrompt:
          "Help me analyze this English grammar question or literary set book excerpt:",
      },
      {
        id: "hist",
        name: "History & Gov",
        starterPrompt: "Outline the key factors and historical significance of:",
      },
      {
        id: "comp",
        name: "Computer Studies",
        starterPrompt: "Explain this computer studies topic with practical examples:",
      },
    ],
  },
  CBC: {
    id: "CBC",
    label: "CBC (Junior/Senior)",
    description: "Competency-Based Curriculum",
    subjects: [
      {
        id: "math",
        name: "Mathematics",
        starterPrompt: "Help me solve this practical mathematics problem step-by-step:",
      },
      {
        id: "science",
        name: "Integrated Science",
        starterPrompt: "Help me understand this science concept and its real-life application:",
      },
      {
        id: "tech",
        name: "Pre-Technical",
        starterPrompt: "Guide me through this technical design/concept:",
      },
      {
        id: "eng",
        name: "English",
        starterPrompt: "Help me improve my comprehension or essay writing:",
      },
      {
        id: "social",
        name: "Social Studies",
        starterPrompt: "Explain this citizenship and community topic:",
      },
      {
        id: "agri",
        name: "Agriculture",
        starterPrompt: "Explain this agricultural practice and its principles:",
      },
    ],
  },
  IGCSE: {
    id: "IGCSE",
    label: "Cambridge IGCSE",
    description: "International General Certificate of Secondary Education",
    subjects: [
      {
        id: "math",
        name: "Maths (0580)",
        starterPrompt:
          "Help me solve this Cambridge IGCSE maths question step-by-step with mark scheme working:",
      },
      {
        id: "physics",
        name: "Physics (0625)",
        starterPrompt: "Explain this IGCSE physics principle and its formula derivation:",
      },
      {
        id: "chem",
        name: "Chemistry (0620)",
        starterPrompt: "Break down this IGCSE chemistry mechanism or reaction:",
      },
      {
        id: "bio",
        name: "Biology (0610)",
        starterPrompt: "Explain this biological process with key syllabus terminology:",
      },
      {
        id: "cs",
        name: "Computer Science",
        starterPrompt: "Help me with this algorithm or pseudo-code problem:",
      },
      {
        id: "econ",
        name: "Economics",
        starterPrompt: "Explain this micro/macro economic graph and concept:",
      },
    ],
  },
  "A-Level": {
    id: "A-Level",
    label: "Cambridge A-Level",
    description: "Advanced Level Qualifications",
    subjects: [
      {
        id: "pure-math",
        name: "Pure Mathematics",
        starterPrompt: "Help me derive and solve this A-Level calculus/algebra problem:",
      },
      {
        id: "physics",
        name: "Physics",
        starterPrompt:
          "Analyze this A-Level physics problem with relevant laws and vector analysis:",
      },
      {
        id: "chem",
        name: "Chemistry",
        starterPrompt: "Break down this organic reaction mechanism or equilibrium problem:",
      },
      {
        id: "bio",
        name: "Biology",
        starterPrompt: "Explain this biochemistry / cellular mechanism in detail:",
      },
      {
        id: "cs",
        name: "Computer Science",
        starterPrompt: "Help me solve this data structures / computational problem:",
      },
      {
        id: "econ",
        name: "Economics",
        starterPrompt: "Evaluate this macroeconomic policy scenario with economic reasoning:",
      },
    ],
  },
  IB: {
    id: "IB",
    label: "IB Diploma",
    description: "International Baccalaureate",
    subjects: [
      {
        id: "math",
        name: "Maths (AA / AI)",
        starterPrompt: "Help me work through this IB Mathematics problem step-by-step:",
      },
      {
        id: "physics",
        name: "Physics HL/SL",
        starterPrompt: "Explain this physics concept according to the IB syllabus guide:",
      },
      {
        id: "chem",
        name: "Chemistry HL/SL",
        starterPrompt:
          "Guide me through this IB Chemistry problem with stoichiometry and reasoning:",
      },
      {
        id: "bio",
        name: "Biology HL/SL",
        starterPrompt:
          "Explain this molecular / physiological system with IB mark scheme precision:",
      },
      {
        id: "tok",
        name: "TOK / Essay",
        starterPrompt: "Help me structure my knowledge questions and real-life situations for:",
      },
      {
        id: "econ",
        name: "Economics HL/SL",
        starterPrompt: "Explain this economic model and evaluate its assumptions:",
      },
    ],
  },
  University: {
    id: "University",
    label: "University / Higher Ed",
    description: "Undergraduate & Graduate Studies",
    subjects: [
      {
        id: "calc",
        name: "Calculus & Linear Algebra",
        starterPrompt: "Help me prove or compute this advanced mathematics problem step-by-step:",
      },
      {
        id: "cs",
        name: "Algorithms & Programming",
        starterPrompt: "Help me understand this algorithm's logic, complexity, and implementation:",
      },
      {
        id: "eng",
        name: "Engineering Mechanics",
        starterPrompt:
          "Analyze this engineering mechanics / circuits problem from first principles:",
      },
      {
        id: "stats",
        name: "Statistics & Probability",
        starterPrompt: "Help me calculate and interpret these statistical distributions / tests:",
      },
      {
        id: "life-sci",
        name: "Biochemistry & Anatomy",
        starterPrompt: "Explain this physiological pathway and its clinical relevance:",
      },
      {
        id: "writing",
        name: "Academic Research Paper",
        starterPrompt: "Critique this thesis statement and academic argument structure:",
      },
    ],
  },
  General: {
    id: "General",
    label: "General Learning",
    description: "Lifelong Learning & General Subjects",
    subjects: [
      {
        id: "math",
        name: "Mathematics",
        starterPrompt: "Help me solve this maths problem step-by-step:",
      },
      {
        id: "science",
        name: "Science",
        starterPrompt: "Explain how this scientific phenomenon works in simple terms:",
      },
      {
        id: "code",
        name: "Programming & Code",
        starterPrompt: "Teach me how to write or debug code for this problem:",
      },
      {
        id: "writing",
        name: "Writing & Essays",
        starterPrompt: "Help me structure, refine, and improve this writing draft:",
      },
      {
        id: "languages",
        name: "Languages",
        starterPrompt: "Help me practice and learn grammar, vocabulary, or translation for:",
      },
      {
        id: "business",
        name: "Business & Finance",
        starterPrompt: "Explain this business, finance, or economic concept clearly:",
      },
    ],
  },
};

export function getCurriculumConfig(curriculumName?: string | null): CurriculumConfig {
  if (!curriculumName) return CURRICULA_CONFIG.General;
  return CURRICULA_CONFIG[curriculumName] || CURRICULA_CONFIG.General;
}
