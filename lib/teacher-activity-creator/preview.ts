import type { ActivityConfiguration, ActivityCreatorCatalog, ActivityPreview } from "./types.ts";

export function createLocalActivityPreview(config: ActivityConfiguration, catalog: ActivityCreatorCatalog, variant = 0): ActivityPreview {
  const notion = catalog.notions.find(({ id }) => id === config.notionIds[0]) ?? catalog.notions[0];
  const selectedOperation = catalog.operations.find(({ id }) => id === config.operationId);
  const operation = selectedOperation ?? catalog.operations[variant % catalog.operations.length];
  const hasDocuments = notion.id === "acte-union";
  const approvedQuestion = hasDocuments
    ? "À l’aide des documents 1, 2 et 3, explique pourquoi la représentation égale du Canada-Est et du Canada-Ouest pouvait désavantager le Canada-Est au moment de l’Acte d’union."
    : "Formule une question que tu aimerais approfondir à propos de cette notion.";
  const developmentQuestion = selectedOperation
    ? `À partir des documents approuvés, mobilise la notion « ${notion.title} » pour réaliser l’opération « ${selectedOperation.label} ».`
    : "Sélectionnez une opération intellectuelle pour composer la question à développement.";
  const question = config.workType === "development" ? developmentQuestion : approvedQuestion;
  const instruction = config.workType === "development"
    ? "Rédigez une réponse développée d’environ 150 mots."
    : config.workType === "enrichment"
      ? "Justifie ta réponse en croisant précisément les sources approuvées disponibles."
      : hasDocuments
        ? "Appuie ta réponse sur un élément précis du tableau et sur les propos d’au moins un des deux acteurs politiques."
        : "Explique brièvement pourquoi cette question te semble importante.";
  return {
    operationLabel: config.workType === "development" && !selectedOperation ? "Opération requise" : operation.label,
    notionTitle: notion.title,
    question,
    instruction,
    guidance: config.workType === "enrichment"
      ? ["Commence par relever les informations utiles dans chaque source.", "Compare ensuite leur portée avant de formuler une conclusion nuancée."]
      : config.workType === "development"
        ? ["Définis d’abord l’idée directrice de ta réponse.", "Organise ensuite les faits tirés des documents selon l’opération demandée."]
        : ["Repère d’abord les informations importantes.", "Relie-les ensuite à la question avant de répondre."],
    documents: hasDocuments ? catalog.documents : [],
  };
}
