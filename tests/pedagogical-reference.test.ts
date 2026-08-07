import assert from "node:assert/strict";
import test from "node:test";
import {
  getSecondaryFourKnowledgeHeading,
  getSecondaryFourPeriod,
  SECONDARY_FOUR_KNOWLEDGE_HEADINGS,
  SECONDARY_FOUR_PERIODS,
  SECONDARY_FOUR_PROGRAM_SOURCE,
} from "../lib/pedagogical-reference/index.ts";

test("identifie la source ministérielle officielle et ses pages de synthèse", () => {
  assert.equal(SECONDARY_FOUR_PROGRAM_SOURCE.publisher, "Gouvernement du Québec");
  assert.match(SECONDARY_FOUR_PROGRAM_SOURCE.url, /quebec\.ca/);
  assert.equal(SECONDARY_FOUR_PROGRAM_SOURCE.overviewPage, 44);
  assert.deepEqual(SECONDARY_FOUR_PROGRAM_SOURCE.synthesisPages, [73, 74]);
});

test("verrouille les quatre périodes dans l’ordre officiel", () => {
  assert.deepEqual(
    SECONDARY_FOUR_PERIODS.map(({ id, officialSocialReality }) => [id, officialSocialReality]),
    [
      ["1840-1896", "La formation du régime fédéral canadien"],
      ["1896-1945", "Les nationalismes et l’autonomie du Canada"],
      ["1945-1980", "La modernisation du Québec et la Révolution tranquille"],
      ["1980-present", "Les choix de société dans le Québec contemporain"],
    ],
  );
  assert.deepEqual(SECONDARY_FOUR_PERIODS.map(({ officialOrder }) => officialOrder), [1, 2, 3, 4]);
});

test("conserve les concepts particuliers et communs officiels", () => {
  assert.deepEqual(
    SECONDARY_FOUR_PERIODS.map(({ particularConcepts }) => particularConcepts),
    [
      ["Fédéralisme", "Industrialisation", "Migration"],
      ["Impérialisme", "Libéralisme", "Urbanisation"],
      ["État-providence", "Féminisme", "Laïcisation"],
      ["Néolibéralisme", "Société civile", "Souverainisme"],
    ],
  );
  for (const { commonConcepts } of SECONDARY_FOUR_PERIODS) {
    assert.deepEqual(commonConcepts, ["Culture", "Économie", "Pouvoir", "Société", "Territoire"]);
  }
});

test("inventorie 56 rubriques officielles avec des identifiants et des ordres uniques", () => {
  assert.equal(SECONDARY_FOUR_KNOWLEDGE_HEADINGS.length, 56);
  assert.deepEqual(SECONDARY_FOUR_PERIODS.map(({ knowledgeHeadings }) => knowledgeHeadings.length), [14, 15, 15, 12]);
  assert.equal(new Set(SECONDARY_FOUR_KNOWLEDGE_HEADINGS.map(({ id }) => id)).size, 56);
  assert.deepEqual(
    SECONDARY_FOUR_KNOWLEDGE_HEADINGS.map(({ officialOrder }) => officialOrder),
    Array.from({ length: 56 }, (_, index) => index + 1),
  );
  assert.ok(SECONDARY_FOUR_KNOWLEDGE_HEADINGS.every(({ inventoryStatus }) => inventoryStatus === "verified-official"));
});

test("préserve les limites de périodes et les libellés officiels", () => {
  assert.deepEqual(SECONDARY_FOUR_KNOWLEDGE_HEADINGS.slice(0, 3).map(({ officialLabel }) => officialLabel), [
    "Acte d’Union",
    "Économie coloniale",
    "Gouvernement responsable",
  ]);
  assert.equal(SECONDARY_FOUR_KNOWLEDGE_HEADINGS[13]?.officialLabel, "Exploitations agricoles");
  assert.equal(SECONDARY_FOUR_KNOWLEDGE_HEADINGS[14]?.officialLabel, "Statut du Canada dans l’Empire britannique");
  assert.equal(SECONDARY_FOUR_KNOWLEDGE_HEADINGS[28]?.officialLabel, "Seconde Guerre mondiale");
  assert.equal(SECONDARY_FOUR_KNOWLEDGE_HEADINGS[29]?.officialLabel, "Rapports de force en Occident");
  assert.equal(SECONDARY_FOUR_KNOWLEDGE_HEADINGS[43]?.officialLabel, "Relations patronales-syndicales");
  assert.equal(SECONDARY_FOUR_KNOWLEDGE_HEADINGS[44]?.officialLabel, "Redéfinition du rôle de l’État");
  assert.equal(SECONDARY_FOUR_KNOWLEDGE_HEADINGS.at(-1)?.officialLabel, "Ère de l’information");
});

test("retrouve une période ou une rubrique par son identifiant canonique", () => {
  assert.equal(getSecondaryFourPeriod("1945-1980")?.officialOrder, 3);
  assert.equal(getSecondaryFourKnowledgeHeading("acte-union")?.officialLabel, "Acte d’Union");
  assert.equal(getSecondaryFourKnowledgeHeading("ere-de-l-information")?.officialOrder, 56);
});
