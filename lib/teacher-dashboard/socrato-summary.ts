import type { TeacherActivitySummary } from "./types.ts";

export type TeacherPedagogicalSummary = {
  overallObservation: string;
  mainStrength: string;
  mainChallenge: string;
};

export type TeacherPedagogicalSummaryInput = {
  activity: TeacherActivitySummary;
};

export interface TeacherPedagogicalSummaryProvider {
  createSummary(input: TeacherPedagogicalSummaryInput): TeacherPedagogicalSummary | null;
}

const overallObservations = {
  good_pace: "La progression est encourageante et se poursuit à un rythme régulier.",
  majority_completed: "La progression est encourageante.",
  improved_since_previous: "La progression depuis la dernière activité est encourageante, même si cette tendance demeure encore prudente.",
} as const;

const strengths = {
  historical_knowledge: "Les connaissances historiques liées à cette activité sont bien maîtrisées dans la majorité des groupes.",
  chronology: "Les élèves situent bien les événements dans le temps dans la majorité des groupes.",
  context: "Le contexte historique est bien compris dans la majorité des groupes.",
  causality: "Les liens de causalité sont bien établis dans la majorité des groupes.",
  document_interpretation: "Les documents sont bien interprétés dans la majorité des groupes.",
} as const;

const challenges = {
  cause_consequence: "La distinction entre les causes et les conséquences demeure toutefois le principal défi.",
  document_comparison: "La comparaison entre les documents demeure toutefois le principal défi.",
  historical_vocabulary: "La précision du vocabulaire historique demeure toutefois le principal défi.",
  incomplete_reasoning: "La construction de raisonnements complets demeure toutefois le principal défi.",
  missing_justification: "La justification des réponses demeure toutefois le principal défi.",
} as const;

const allowedComponents = {
  overallObservation: new Set<string>(Object.values(overallObservations)),
  mainStrength: new Set<string>(Object.values(strengths)),
  mainChallenge: new Set<string>(Object.values(challenges)),
};

export function validateTeacherPedagogicalSummary(value: TeacherPedagogicalSummary | null): value is TeacherPedagogicalSummary {
  if (!value) return false;
  return (Object.keys(allowedComponents) as (keyof TeacherPedagogicalSummary)[])
    .every((key) => allowedComponents[key].has(value[key]));
}

export class LocalTeacherPedagogicalSummaryProvider implements TeacherPedagogicalSummaryProvider {
  createSummary({ activity }: TeacherPedagogicalSummaryInput) {
    const signals = activity.socratoObservation;
    const hasEligibleCollectivePortrait = activity.groupPortraits.some((group) => group.targetedStudentCount >= 6);
    if (activity.resultAvailability !== "available" || !hasEligibleCollectivePortrait || !signals?.progression || !signals.strength || !signals.difficulty) return null;
    const summary = {
      overallObservation: overallObservations[signals.progression],
      mainStrength: strengths[signals.strength],
      mainChallenge: challenges[signals.difficulty],
    };
    return validateTeacherPedagogicalSummary(summary) ? summary : null;
  }
}

export function composeTeacherPedagogicalSummary(summary: TeacherPedagogicalSummary) {
  if (!validateTeacherPedagogicalSummary(summary)) return null;
  return `${summary.overallObservation} ${summary.mainStrength} ${summary.mainChallenge}`;
}

export function formatTeacherGreeting(firstName?: string) {
  const reliableFirstName = firstName?.trim();
  return reliableFirstName ? `Bonjour, ${reliableFirstName} !` : "Bonjour !";
}
