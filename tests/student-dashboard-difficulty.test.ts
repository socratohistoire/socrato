import assert from "node:assert/strict";
import test from "node:test";
import { difficultyAsStatement } from "../lib/student-dashboard/database-provider.ts";

test("transforme globalement les difficultés interrogatives en objectifs déclaratifs", () => {
  const cases = [
    ["Quel est le nom du nouveau territoire créé par cette union, selon l’extrait?", "Tu dois encore préciser le nom du nouveau territoire créé par cette union, selon l’extrait."],
    ["Pourquoi cette mesure provoque-t-elle une opposition?", "Tu dois encore expliquer clairement la cause demandée et l’appuyer avec les faits ou les documents pertinents."],
    ["Comment l’Union transforme-t-elle les institutions?", "Tu dois encore expliquer clairement le mécanisme ou la transformation demandée et l’appuyer avec les faits pertinents."],
    ["Combien de recommandations faut-il nommer?", "Tu dois encore préciser le nombre demandé et identifier chacun des éléments concernés."],
    ["Quelles actions britanniques déclenchent les Rébellions?", "Tu dois encore préciser les actions britanniques et expliquer comment ces éléments conduisent aux Rébellions."],
  ];
  for (const [question, expected] of cases) {
    const statement = difficultyAsStatement(question);
    assert.equal(statement, expected);
    assert.equal(statement.endsWith("?"), false);
  }
});
