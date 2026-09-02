import type { SummaryProducer } from "./ports.ts";
import type {
  PedagogicalResultEntry,
  PedagogicalSessionState,
  PedagogicalSummary,
  QuestionResult,
  ResultStatus,
  WorkbookReference,
} from "./types.ts";
import { HISTORICAL_KNOWLEDGE_CATALOG } from "../student-dashboard/historical-knowledge-catalog.ts";

function mostCautiousStatus(current: ResultStatus | undefined, candidate: ResultStatus): ResultStatus {
  const rank: Record<ResultStatus, number> = { to_work_on: 0, to_consolidate: 1, mastered: 2 };
  return !current || rank[candidate] < rank[current] ? candidate : current;
}

function aggregate(results: QuestionResult[], field: "operationIds" | "historicalKnowledgeIds"): PedagogicalResultEntry[] {
  const statuses = new Map<string, ResultStatus>();
  for (const result of results) {
    const assessments = field === "operationIds" ? result.operationAssessments : result.historicalKnowledgeAssessments;
    const entries = assessments ?? result[field].map((id) => ({ id, status: result.status }));
    for (const { id, status } of entries) statuses.set(id, mostCautiousStatus(statuses.get(id), status));
  }
  return [...statuses].map(([id, status]) => ({ id, status }));
}

function isDateAssociationDifficulty(result: QuestionResult) {
  const context = `${result.questionPrompt ?? ""} ${result.consolidationTargets.join(" ")}`;
  return /time|space|temps|espace/i.test(result.primaryOperationId)
    && /date|année|adoption|entrée en vigueur/iu.test(context);
}

function isHistoricalKnowledgeConfusion(result: QuestionResult) {
  const context = `${result.questionPrompt ?? ""} ${result.consolidationTargets.join(" ")}`;
  const difficulties = result.consolidationTargets.join(" ");
  return /invers|confond|précision essentielle|correction essentielle|erreur factuelle|exactitude historique/iu.test(difficulties)
    || (/population.+dette|dette.+population/iu.test(context) && /valeur|attribu|étiquette|colonie/iu.test(difficulties));
}

function questionExample(state: PedagogicalSessionState, result: QuestionResult) {
  const prompt = result.questionPrompt ?? "";
  if (/1840|1841/iu.test(prompt) && /date|année|Acte d.Union/iu.test(prompt)) return "Dans la question sur les dates de l’Acte d’Union";
  if (/recommandations?.+Durham/iu.test(prompt)) return "Dans la question sur les recommandations de Durham";
  if (/population.+dette|dette.+population|mise en commun des dettes/iu.test(prompt)) return "Dans la question sur la population et la dette des deux Canadas";
  if (/Russell.+La Fontaine|La Fontaine.+Russell/iu.test(prompt)) return "Dans la question sur les points de vue de Russell et de La Fontaine";
  if (prompt) return `Dans la question sur « ${prompt.replace(/[.!?]+$/u, "")} »`;
  const number = state.questionStates.findIndex(({ questionId }) => questionId === result.questionId) + 1;
  return `À la question ${number}`;
}

function demonstratedStrength(result: QuestionResult) {
  const operationId = result.primaryOperationId;
  const prompt = result.questionPrompt ?? "";
  if (/instaure-t-il immédiatement le gouvernement responsable/iu.test(prompt)) return {
    key: "responsible-government",
    title: "Distinguer l’Acte d’Union du gouvernement responsable",
    explanation: "Tu as bien compris que l’existence d’un Conseil exécutif ne suffit pas : ses membres doivent aussi conserver la confiance de l’Assemblée.",
  };
  if (/impact significatif pour les Canadiens français/iu.test(prompt)) return {
    key: "language-impact",
    title: "Comprendre l’impact linguistique de l’Acte d’Union",
    explanation: "Tu as clairement expliqué que l’anglais devient la langue officielle des documents parlementaires, tandis que les traductions françaises n’ont pas la même valeur officielle.",
  };
  if (/replace les six événements|ordre chronologique/iu.test(prompt)) return {
    key: "time-space",
    title: "Ordonner les événements avec précision",
    explanation: "",
  };
  if (/quelle conclusion/iu.test(prompt) && /(?:Rébellions|répression|emprisonnement|déportation)/iu.test(prompt)) return {
    key: "causality",
    title: "Comprendre les conséquences de la répression",
    explanation: "Tu as bien relié la répression britannique à ses conséquences concrètes sur les Patriotes.",
  };
  if (/quelle conclusion/iu.test(prompt) && /documents/iu.test(prompt)) return {
    key: "causality",
    title: "Choisir une conclusion bien appuyée",
    explanation: "",
  };
  if (/recommandation.+appliquée.+recommandation.+ne l’est pas/iu.test(prompt)) return {
    key: "comparison",
    title: "Distinguer les recommandations de Durham",
    explanation: "",
  };
  if (/compare la population et la dette/iu.test(prompt)) return {
    key: "causality",
    title: "Comparer la population et la dette des deux colonies",
    explanation: "",
  };
  if (/réponse britannique.+déclenchement des Rébellions/iu.test(prompt)) return {
    key: "causality",
    title: "Relier la réponse britannique aux Rébellions",
    explanation: "",
  };
  if (/difference|similar|compar/i.test(operationId)) return {
    key: "comparison",
    title: "Comparer des points de vue avec précision",
    explanation: "Tu rends la comparaison claire en nommant précisément ce qui rapproche ou oppose les éléments.",
  };
  if (/cause|consequence|causal/i.test(operationId)) return {
    key: "causality",
    title: "Expliquer clairement une cause et sa conséquence",
    explanation: "Tu construis un raisonnement historique clair en montrant comment un fait entraîne une réaction ou une conséquence.",
  };
  if (/change|continuit/i.test(operationId)) return {
    key: "change",
    title: "Distinguer ce qui change et ce qui continue",
    explanation: "Tu compares la situation avant et après afin de préciser ce qui change et ce qui demeure.",
  };
  if (/time|space|temps|espace/i.test(operationId)) return {
    key: "time-space",
    title: "Organiser les repères historiques",
    explanation: "Tu places les faits dans un ordre ou un espace cohérent pour rendre la transformation historique facile à suivre.",
  };
  if (/relationship|relation/i.test(operationId)) return {
    key: "relationships",
    title: "Relier des faits historiques",
    explanation: "Tu dépasses l’énumération des faits en expliquant clairement le lien qui les unit.",
  };
  return {
    key: "facts",
    title: "Établir des faits historiques précis",
    explanation: "Tu sélectionnes une information pertinente et tu l’emploies directement pour répondre à la question.",
  };
}

function strengthLimit(masteredCount: number) {
  return Math.min(2, masteredCount);
}

function isSpecificObservation(entry: string) {
  return entry.trim().length >= 35
    && !/correctement mobilisé|démarche demandée|réponse (?:est )?réussie|bonne réponse|accompli avec justesse/iu.test(entry);
}

export const POSITIVE_CONCLUSION_VARIANTS = {
  autonomous: [
    "Tu as réussi sans demander d’indice : bravo!", "Ton raisonnement était clair et autonome.",
    "Tu as trouvé la bonne réponse dès ton premier essai.", "Tu as avancé avec assurance du début à la fin.",
    "Tu savais exactement quoi faire, et ça paraît dans ta réponse.", "Tu as fait les bons liens par toi-même.",
    "Tu as répondu avec précision, sans avoir besoin d’aide.", "Tu as été efficace et sûr de ton raisonnement.",
    "Tu as bien vérifié ta réponse avant de l’envoyer.", "Tu as compris rapidement ce qui était demandé.",
    "Tu as choisi les bons faits dès le départ.", "Tu as mené ton explication avec beaucoup d’autonomie.",
    "Ta réponse montre que cette démarche est déjà solide pour toi.", "Tu as construit une réponse juste dès la première tentative.",
    "Tu as travaillé avec méthode, sans demander d’indice.", "Tu peux être fier de cette réponse : elle est claire et autonome.",
  ],
  autonomousWithDocuments: [
    "Tu as utilisé les documents efficacement, sans aide.", "Tu as repéré seul les informations vraiment utiles dans les documents.",
    "Tu as bien choisi tes preuves dès ton premier essai.", "Tu as fait parler les documents avec précision, sans demander d’indice.",
    "Tes preuves étaient bien choisies et directement liées à ton idée.", "Tu as utilisé les documents avec assurance et autonomie.",
    "Tu as trouvé rapidement les bons passages pour appuyer ta réponse.", "Tu as bien relié les documents à ton explication, par toi-même.",
    "Ton utilisation des documents était précise dès le départ.", "Tu as su tirer l’essentiel des documents sans aide de Socrato.",
  ],
  supported: [
    "Tu as bien utilisé les conseils de Socrato pour améliorer ta réponse.", "Tu as su reprendre ta réponse et ajouter exactement ce qui manquait.",
    "Tu as fait un beau progrès entre ton premier essai et ta réponse finale.", "Tu as écouté la rétroaction et ton raisonnement est devenu beaucoup plus clair.",
    "Tu n’as pas abandonné : tu as ajusté ta réponse avec méthode.", "Tu as transformé l’indice en une réponse plus précise.",
    "Tu as bien profité de l’accompagnement pour consolider ta compréhension.", "Tu as corrigé le point important et ta réponse finale est solide.",
    "Tu as su te servir de la rétroaction sans repartir au hasard.", "Tu as persévéré et trouvé une façon plus juste d’expliquer ton idée.",
    "Tu as utilisé l’aide au bon moment pour faire avancer ton raisonnement.", "Ta réponse finale montre que tu as vraiment compris la rétroaction.",
  ],
} as const;

function positiveConclusion(result: QuestionResult) {
  const autonomous = result.attemptNumber === 1 && result.hintLevel === 0;
  const bank = autonomous
    ? result.documentIds.length > 0 && result.documentUse === "demonstrated"
      ? [...POSITIVE_CONCLUSION_VARIANTS.autonomousWithDocuments, ...POSITIVE_CONCLUSION_VARIANTS.autonomous]
      : POSITIVE_CONCLUSION_VARIANTS.autonomous
    : POSITIVE_CONCLUSION_VARIANTS.supported;
  const seed = `${result.questionId}:${result.primaryOperationId}:${result.historicalKnowledgeIds.join(":")}`;
  const index = [...seed].reduce((total, character) => total + (character.codePointAt(0) ?? 0), 0) % bank.length;
  return bank[index];
}

function taskSpecificAchievement(result: QuestionResult, key: string) {
  const prompt = result.questionPrompt ?? "";
  if (/instaure-t-il immédiatement le gouvernement responsable/iu.test(prompt)) return "tu as expliqué dès ton premier essai que le gouverneur conserve la nomination du Conseil exécutif et que le gouvernement responsable ne sera obtenu qu’en 1848.";
  if (/impact significatif pour les Canadiens français/iu.test(prompt)) return "tu as repéré dans le document la perte de reconnaissance institutionnelle du français et tu en as expliqué l’effet concret pour les Canadiens français.";
  if (/replace les six événements|ordre chronologique/iu.test(prompt)) return "tu as placé correctement les six événements dans l’ordre chronologique dès ta première vérification.";
  if (/quelle conclusion/iu.test(prompt) && /(?:Rébellions|répression|emprisonnement|déportation)/iu.test(prompt)) return "tu as reconnu que la répression des Rébellions a mené à de nombreux emprisonnements et à la déportation de certains condamnés hors de la colonie.";
  if (/quelle conclusion/iu.test(prompt)) return "tu as identifié dès le premier essai la conclusion qui était la mieux appuyée par les documents.";
  if (/nomme deux/iu.test(prompt)) return "tu as fourni les deux éléments historiques demandés, sans oublier une partie de la consigne.";
  if (/recommandation.+appliquée.+recommandation.+ne l’est pas/iu.test(prompt)) return "tu as distingué la recommandation appliquée par la loi de celle qui ne l’est pas immédiatement, puis tu as justifié cette différence avec les documents.";
  if (/compare la population et la dette/iu.test(prompt)) return "tu as comparé les populations et les dettes des deux colonies, puis tu as expliqué l’avantage obtenu par le Haut-Canada.";
  if (/explique pourquoi/iu.test(prompt) && /documents/iu.test(prompt)) return "tu as expliqué le lien causal demandé dès le premier essai en reliant les informations des documents.";
  if (key === "comparison") return "tu as formulé une comparaison complète en répondant à chacun des éléments demandés.";
  if (key === "causality") return "tu as construit dès le premier essai le lien de cause à conséquence demandé.";
  if (key === "time-space") return "tu as organisé correctement tous les repères demandés dès ta première vérification.";
  return "tu as répondu précisément à la tâche dès le premier essai avec les faits historiques attendus.";
}

function preciseDemonstratedStrengths(state: PedagogicalSessionState, results: QuestionResult[]) {
  const mastered = results.filter((result) => result.status === "mastered"
    || result.operationAssessments?.some(({ status }) => status === "mastered"));
  const limit = strengthLimit(mastered.length);
  const knowledgeLabels = new Map((HISTORICAL_KNOWLEDGE_CATALOG[state.notionId] ?? []).map(({ id, label }) => [id, label]));
  const used = new Set<string>();
  const strengths: string[] = [];
  for (const result of mastered) {
    const descriptor = demonstratedStrength(result);
    if (used.has(descriptor.key)) continue;
    used.add(descriptor.key);
    // L'opération et la connaissance ne doivent pas reprendre la même phrase
    // comme preuve. La preuve opératoire décrit donc toujours la tâche réalisée.
    const achievement = taskSpecificAchievement(result, descriptor.key);
    const masteredKnowledgeLabels = (result.historicalKnowledgeAssessments ?? [])
      .filter(({ status }) => status === "mastered")
      .map(({ id }) => knowledgeLabels.get(id) ?? id)
      .slice(0, 2);
    const knowledgeConnection = masteredKnowledgeLabels.length
      ? `Pour y arriver, tu as bien utilisé ${masteredKnowledgeLabels.length === 1 ? `la connaissance historique suivante : ${masteredKnowledgeLabels[0]}` : `les connaissances historiques suivantes : ${masteredKnowledgeLabels.join(" et ")}`}.`
      : "";
    const conclusion = strengths.length === limit - 1 ? positiveConclusion(result) : "";
    const preciseObservation = result.observedStrengths.find(isSpecificObservation)?.trim();
    strengths.push(`${preciseObservation ?? descriptor.title}\n${[
      `${achievement.charAt(0).toUpperCase()}${achievement.slice(1)}`,
      descriptor.explanation,
      knowledgeConnection,
      conclusion,
    ].filter(Boolean).join(" ")}`);
    if (strengths.length === limit) break;
  }
  return strengths;
}

function preciseHistoricalKnowledgeStrengths(state: PedagogicalSessionState, results: QuestionResult[]) {
  const labels = new Map((HISTORICAL_KNOWLEDGE_CATALOG[state.notionId] ?? []).map(({ id, label }) => [id, label]));
  const used = new Set<string>();
  return results.flatMap((result) => (result.historicalKnowledgeAssessments ?? [])
    .filter(({ status }) => status === "mastered")
    .flatMap(({ id }) => {
      const durhamRecommendations = /recommandations? formulées? par (?:lord )?Durham/iu.test(result.questionPrompt ?? "")
        && (id === "acte-union" || id === "rapport-durham");
      const knowledgeKey = durhamRecommendations ? "durham-recommendations" : id;
      if (used.has(knowledgeKey)) return [];
      used.add(knowledgeKey);
      const detail = id === "points-de-vue-sur-union"
        ? "Tu as bien reconnu que Russell présente l’Union comme une solution politique et économique, et tu as relevé dans le texte de La Fontaine les enjeux de représentation, de langue et de dette."
        : id === "rapport-durham"
          ? "Tu as correctement reconnu les recommandations formulées par Durham et leur objectif politique."
          : id === "creation-province-canada"
            ? "Tu sais que l’Union du Haut-Canada et du Bas-Canada crée la Province du Canada."
            : id === "gouvernement-responsable"
              ? "Tu as correctement distingué le gouvernement responsable des mesures immédiatement instaurées par l’Acte d’union."
              : id === "dette-publique"
                ? "Tu as correctement relevé la mise en commun des dettes du Haut-Canada et du Bas-Canada."
                : result.observedStrengths.find(isSpecificObservation)?.trim()
                  ?? `Tu as démontré une compréhension juste de cette connaissance dans ta réponse.`;
      const title = durhamRecommendations
        ? "Tu connais bien les deux recommandations de Durham"
        : id === "points-de-vue-sur-union" ? "Tu comprends bien les points de vue sur l’Union"
          : id === "creation-province-canada" ? "Tu connais bien la création de la Province du Canada"
            : id === "gouvernement-responsable" ? "Tu comprends bien le gouvernement responsable"
              : id === "dette-publique" ? "Tu comprends bien la mise en commun des dettes"
                : `Tu connais bien « ${labels.get(id) ?? id} »`;
      return [`${title}\n${detail}`];
    })).slice(0, 2);
}

function metacognitiveStrategy(result: QuestionResult) {
  const operationId = result.primaryOperationId;
  const context = `${result.questionPrompt ?? ""} ${result.consolidationTargets.join(" ")}`;
  if (/difference|similar|compar/i.test(operationId)) return { key: "comparison", title: "Dégager des différences et des similitudes", advice: "Pour réaliser cette opération, choisis un même critère de comparaison, relève une ressemblance ou une différence précise, puis appuie-la avec les faits historiques pertinents." };
  if (/causal_connections|causal_connection/i.test(operationId)) return { key: "causality", title: "Établir des liens de causalité", advice: "Pour réaliser cette opération, nomme la cause, explique le mécanisme qui relie les faits, puis formule la conséquence." };
  if (/cause|consequence|causal/i.test(operationId)) return { key: "causality", title: "Déterminer des causes et des conséquences", advice: "Pour réaliser cette opération, distingue ce qui explique la situation de ce qui en découle, puis formule explicitement le lien entre les deux." };
  if (/change|continuit/i.test(operationId)) return { key: "change", title: "Déterminer des changements et des continuités", advice: "Pour réaliser cette opération, compare le même aspect avant et après un repère précis, puis indique clairement ce qui change ou ce qui demeure." };
  if (/time|space|temps|espace/i.test(operationId) && /date|année|adoption|entrée en vigueur/iu.test(context)) return {
    key: "time-space",
    title: "Situer dans le temps et dans l’espace",
    advice: "Lorsque plusieurs dates sont présentées, associe chacune à un verbe d’action précis : 1840 → adopter | 1841 → entrer en vigueur. Vérifie ensuite que les événements sont placés dans le bon ordre.",
  };
  if (/time|space|temps|espace/i.test(operationId)) return { key: "time-space", title: "Situer dans le temps et dans l’espace", advice: "Pour réaliser cette opération, associe chaque fait à un repère temporel ou géographique exact, puis vérifie leur ordre ou leur emplacement." };
  if (/relationship|relation/i.test(operationId)) return { key: "relationships", title: "Mettre en relation des faits", advice: "Pour réaliser cette opération, nomme les deux faits et explique précisément la relation qui les unit." };
  if (result.instructionOmissionObserved || result.omittedInstructionElements?.length) return {
    key: "facts",
    title: "Établir des faits",
    advice: `Relis la consigne et repère chaque élément demandé. Prépare autant de faits distincts que nécessaire, puis coche-les un à un avant d’envoyer ta réponse. Dans cette question, il fallait encore préciser : ${result.omittedInstructionElements?.[0] ?? result.consolidationTargets[0]}.`,
  };
  return { key: "facts", title: "Établir des faits", advice: "Repère le fait historique qui répond directement à la question, formule-le dans tes propres mots, puis vérifie qu’il est exact, pertinent et complet." };
}

function metacognitiveStrengths(state: PedagogicalSessionState, results: QuestionResult[]) {
  const preciseStrengths = preciseDemonstratedStrengths(state, results);
  const knowledgeStrengths = preciseHistoricalKnowledgeStrengths(state, results);
  // Le bilan porte exclusivement sur les deux dimensions évaluées. Lorsque les
  // preuves le permettent, il présente une opération et une connaissance.
  if (preciseStrengths.length && knowledgeStrengths.length) {
    const knowledge = knowledgeStrengths[0];
    const knowledgeEvidence = knowledge.split("\n").slice(1).join(" ").trim();
    const distinctOperation = preciseStrengths.find((entry) => !knowledgeEvidence || !entry.includes(knowledgeEvidence)) ?? preciseStrengths[0];
    return [distinctOperation, knowledge];
  }
  return [...knowledgeStrengths, ...preciseStrengths].slice(0, 2);
}

function prioritizedTargetResults(results: QuestionResult[]) {
  return results
    .filter((result) => result.consolidationTargets.length > 0 && (
      result.status !== "mastered"
      || result.operationAssessments?.some(({ id, status }) => id === result.primaryOperationId && status !== "mastered")
    ))
    .map((result, index) => ({ result, index }))
    .sort((left, right) => {
      const priority = (result: QuestionResult) => {
        const interactiveTimeline = /replace.+(?:événements|étapes).+(?:ordre|chronolog)|ligne du temps|frise chronologique/iu.test(result.questionPrompt ?? "");
        if (interactiveTimeline || isDateAssociationDifficulty(result)) return 0;
        return result.status === "to_work_on" ? 2
          : [...(result.operationAssessments ?? []), ...(result.historicalKnowledgeAssessments ?? [])]
            .some(({ status }) => status === "to_work_on") ? 1 : 0;
      };
      return priority(right.result) - priority(left.result) || left.index - right.index;
    })
    .map(({ result }) => result);
}

function metacognitiveTargets(state: PedagogicalSessionState, results: QuestionResult[]) {
  const usedStrategies = new Set<string>();
  const targets: string[] = [];
  const prioritizedResults = prioritizedTargetResults(results);
  for (const result of prioritizedResults) {
    // Une difficulté documentaire ou factuelle peut préciser le contenu à revoir,
    // mais la stratégie prioritaire demeure toujours une opération intellectuelle.
    const strategy = metacognitiveStrategy(result);
    if (usedStrategies.has(strategy.key)) continue;
    usedStrategies.add(strategy.key);
    const prompt = result.questionPrompt ?? "";
    const verification = /population.+dette|dette.+population|mise en commun des dettes/iu.test(prompt)
      ? "Tu as inversé les données des deux colonies : le Haut-Canada compte environ 450 000 habitants et porte une dette d’environ 1 540 000 £, tandis que le Bas-Canada compte environ 650 000 habitants et une dette d’environ 133 000 £. La mise en commun peut donc sembler injuste au Canada-Est, puisque sa population plus nombreuse contribue au remboursement de la dette beaucoup plus élevée du Haut-Canada."
      : /recommandation.+appliquée.+recommandation.+ne l’est pas/iu.test(prompt)
      ? "Tu as bien reconnu que l’union législative est appliquée par la création de la Province du Canada. Toutefois, la présence d’un Conseil exécutif ne signifie pas que le gouvernement responsable est établi : ses membres sont encore nommés sous l’autorité du gouverneur et la loi ne leur impose pas de conserver la confiance de l’Assemblée."
      : /nomme deux recommandations.+Durham/iu.test(prompt)
        ? "Tu avais d’abord nommé seulement l’union législative. Il fallait aussi identifier le gouvernement responsable et le justifier avec le deuxième extrait. La présence d’un Conseil exécutif ne signifie pas que le gouvernement responsable est établi."
      : strategy.key === "time-space"
        && /1840|1841/iu.test(prompt)
        ? "Tu as inversé les deux années : 1840 correspond à l’adoption de la loi, tandis que 1841 correspond à son entrée en vigueur."
        : (() => {
          const achievement = result.observedStrengths.find((entry) => entry.trim().length >= 30
            && !/il (?:manque|reste)|tu dois|incorrect|inverse de ce que/iu.test(entry))?.trim();
          const correction = /\b(?:nom|nomme|identifie|indique)\b/iu.test(prompt)
            ? "Il te reste à repérer dans le document l’information précise demandée par la consigne, sans la confondre avec les éléments déjà établis."
            : /\bcompar/iu.test(prompt)
              ? "Il te reste à distinguer le point de vue de chaque document avec un même critère et à justifier la différence observée."
              : /\b(?:explique pourquoi|cause|conséquence|entraîne|provoque)\b/iu.test(prompt)
                ? "Il te reste à établir explicitement le lien demandé entre les faits et à l’appuyer avec les documents pertinents."
                : "Il te reste à repérer dans la consigne l’élément précis qui n’a pas encore été traité et à le justifier avec le document pertinent.";
          return achievement ? `${achievement.replace(/[?.!]?$/u, ".")} ${correction}` : correction;
        })();
    const targetTitle = /recommandations?.+Durham.+application/iu.test(prompt)
      ? "Distinguer les recommandations de Durham et leur application"
      : result.status === "to_work_on" && strategy.key === "causality" && !prompt
        ? "Construire une chaîne causale avec les documents"
      : strategy.title;
    const observedDifficulty = result.consolidationTargets[0]?.trim().replace(/[.]+$/u, "") ?? verification;
    const progressAdvice = targetTitle === "Construire une chaîne causale avec les documents"
      ? "Dans les documents, repère d’abord la cause, puis la réaction ou la conséquence. Relie ensuite les deux avec une expression comme « entraîne », « provoque » ou « mène à »."
      : strategy.advice;
    const progression = targetTitle === "Construire une chaîne causale avec les documents"
      ? progressAdvice
      : `${verification} ${progressAdvice}`;
    targets.push(`${targetTitle}\nQuestion\n${questionExample(state, result)}\nÀ vérifier\n${observedDifficulty}.\nComment progresser\n${progression}`);
    if (targets.length === 1) break;
  }
  return targets;
}

function readingAdviceFor(state: PedagogicalSessionState, results: QuestionResult[]) {
  const result = results.find((candidate) => candidate.instructionOmissionObserved
    || candidate.omittedInstructionElements?.length
    || candidate.consolidationTargets.some((target) => /deuxième|second(?:e)?|n['’]a pas été expliqué|partie de la consigne/iu.test(target)));
  if (!result) return undefined;
  const missing = result.omittedInstructionElements?.[0] ?? result.consolidationTargets[0];
  if (!missing) return undefined;
  const number = state.questionStates.findIndex(({ questionId }) => questionId === result.questionId) + 1;
  const normalizedMissing = missing.trim().replace(/[.]+$/u, "");
  const punctuation = /[?!]$/u.test(normalizedMissing) ? "" : ".";
  return `Décomposer la consigne\nQuestion\nÀ la question ${number}\nÀ vérifier\n${normalizedMissing}${punctuation}\nComment progresser\nrepère le verbe de la consigne et chacun des éléments demandés. Pour éviter cet oubli, vérifie chaque élément avant d’envoyer ta réponse.`;
}

export function produceLocalStructuredSummary(
  state: PedagogicalSessionState,
  workbookReferences: WorkbookReference[],
  completedAt = new Date().toISOString(),
): PedagogicalSummary {
  const results = state.questionStates.flatMap(({ result }) => result ? [result] : []);
  const operationResults = aggregate(results, "operationIds");
  const historicalKnowledgeResults = aggregate(results, "historicalKnowledgeIds");
  const strengths = metacognitiveStrengths(state, results);
  const consolidationTargets = metacognitiveTargets(state, results);
  const primaryResult = prioritizedTargetResults(results)[0];
  const moveFirst = (ids: string[], preferred: string | undefined) => preferred && ids.includes(preferred)
    ? [preferred, ...ids.filter((id) => id !== preferred)] : ids;
  const targetOperationIds = moveFirst(
    operationResults.filter(({ status }) => status !== "mastered").map(({ id }) => id),
    primaryResult?.primaryOperationId,
  );
  const preferredKnowledgeId = primaryResult?.historicalKnowledgeAssessments
    ?.find(({ status }) => status !== "mastered")?.id
    ?? primaryResult?.historicalKnowledgeIds[0];
  const targetHistoricalKnowledgeIds = moveFirst(
    historicalKnowledgeResults.filter(({ status }) => status !== "mastered").map(({ id }) => id),
    preferredKnowledgeId,
  );
  const priorityTarget = consolidationTargets[0];
  const recommendation = primaryResult && (targetOperationIds.length || targetHistoricalKnowledgeIds.length) ? {
    kind: "optional_consolidation" as const,
    targetOperationIds,
    targetHistoricalKnowledgeIds,
    label: priorityTarget
      ? `Reprends d’abord ce point dans une courte activité : ${priorityTarget.split("\n", 1)[0]}.`
      : "Reprends d’abord la compétence la moins maîtrisée dans une courte activité ciblée.",
  } : undefined;

  return {
    sessionId: state.sessionId,
    activityId: state.activityId,
    notionId: state.notionId,
    encouragement: "Bravo, tu as terminé l’activité. Voici le bilan de ton travail.",
    strengths,
    consolidationTargets,
    readingAdvice: readingAdviceFor(state, results),
    operationResults,
    historicalKnowledgeResults,
    recommendation,
    workbookReferences: workbookReferences.filter(({ approvedByTeacher, historicalKnowledgeIds }) =>
      approvedByTeacher && historicalKnowledgeIds.some((id) => historicalKnowledgeResults.some((result) => result.id === id))),
    localDemoNotice: "",
    completedAt,
  };
}

export class LocalStructuredSummaryProducer implements SummaryProducer {
  async produce(state: PedagogicalSessionState, workbookReferences: WorkbookReference[]) {
    return produceLocalStructuredSummary(state, workbookReferences);
  }
}
