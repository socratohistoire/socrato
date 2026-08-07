# Référentiel pédagogique de Socrato

Ce dossier est la source canonique du contenu prescrit en Histoire du Québec et du Canada de quatrième secondaire.

## Portée de l’inventaire initial

- 4 périodes historiques, dans l’ordre du programme;
- 4 réalités sociales officielles;
- 12 concepts particuliers;
- 5 concepts communs;
- 56 rubriques de connaissances historiques, réparties 14–15–15–12.

Le terme `knowledgeHeading` correspond aux rubriques placées sous « Précision des connaissances » dans le programme. L’interface destinée aux enseignants peut employer le terme plus naturel « notion », sans modifier la désignation conservée dans le référentiel.

## Source officielle

Gouvernement du Québec, *Programme de formation de l’école québécoise – Histoire du Québec et du Canada*.

- structure de la quatrième secondaire : page PDF 44;
- précisions des connaissances : pages PDF 49–50, 55–56, 61–62 et 67–68;
- tableau synthèse des connaissances : pages PDF 73–74.

## Règles de stabilité

- `id` est l’identifiant technique stable utilisé par les autres modules;
- `officialLabel` reproduit le libellé ministériel;
- `officialOrder` préserve l’ordre du tableau synthèse;
- toute correction future doit conserver les identifiants déjà utilisés ou prévoir une migration explicite;
- les enrichissements historiques documentés seront ajoutés séparément du contenu officiel.

## Les quatre objets du référentiel

Chaque notion repose désormais sur quatre objets distincts :

1. le `HistoricalRecord`, qui contient le manuel historique détaillé, les faits structurés et leurs sources;
2. la `NotionReferenceCard`, qui transpose ce dossier en une fiche pédagogique concise et validée;
3. l’`ApprovedQuestion`, qui représente une question documentée, vérifiée, versionnée et approuvée avant son entrée dans la banque;
4. le `HistoricalDocumentRecord`, qui décrit un document historique original, sa provenance, ses droits, la notice documentaire de Socrato et ses usages pédagogiques approuvés.

Un document historique est conservé une seule fois, puis relié à une ou plusieurs périodes, notions et opérations intellectuelles. Une fiche prête à valider exige une provenance et un localisateur précis, les droits d’utilisation, une description accessible, un contexte historique, des éléments à observer et des usages pédagogiques documentés. Un besoin de recherche n’est jamais présenté comme un document trouvé ou approuvé.

Le manuel historique est une véritable monographie interne et la référence historique principale de Socrato. Il est rédigé sous forme de chapitres et de paragraphes cohérents afin de fournir le contexte nécessaire au raisonnement. Il peut également contenir des tableaux sourcés; la chronologie, le glossaire et la bibliographie sont assemblés à partir des objets canoniques du même dossier. Chaque paragraphe et chaque ligne de tableau sont vérifiables et doivent pointer vers une ou plusieurs sources approuvées. La monographie n’est pas présentée automatiquement aux élèves : elle nourrit la préparation des fiches, des questions, des explications et des rétroactions encadrées.

La monographie doit être une synthèse originale rédigée pour Socrato. Elle ne copie ni ne juxtapose les textes des sources. Les informations sont recoupées, reformulées et organisées selon une structure éditoriale propre. Une citation directe ne peut être utilisée qu’exceptionnellement, de façon brève, clairement signalée et accompagnée d’un localisateur précis. Le dossier distingue les faits établis, les nuances méthodologiques, les interprétations historiques et les dérivations pédagogiques de Socrato.

Chaque monographie fixe aussi une limite de portée avec les notions voisines. Elle peut expliquer un lien causal nécessaire à la compréhension, mais ne doit pas absorber le contenu détaillé d’une notion suivante. Pour l’Acte d’Union, la responsabilité ministérielle est définie et le problème constitutionnel est établi; les ministères LaFontaine-Baldwin et le rôle détaillé de Bagot, Metcalfe et Elgin appartiennent au dossier du gouvernement responsable.

Les affirmations, repères chronologiques, acteurs, territoires, relations, éléments de vocabulaire, confusions et objectifs de maîtrise proposés constituent une représentation structurée du même dossier. L’administration doit les valider avec le manuel et le catalogue de sources avant que le dossier puisse être approuvé.

L’administration présente ce contenu selon deux modes complémentaires sans maintenir deux textes concurrents :

- la **lecture intégrale** assemble directement les sections et paragraphes du manuel canonique dans une forme continue, avec notes et bibliographie;
- le **mode audit** expose les mêmes paragraphes et les objets structurés afin de vérifier séparément leur exactitude, leurs sources et leur concordance avec le programme.

Une demande de correction doit contenir un commentaire. Elle demeure ouverte tant que le contenu n’a pas été corrigé puis revalidé, et elle est conservée comme résolue dans l’historique local de révision. Toute exportation future destinée à une évaluation externe devra provenir de la version canonique approuvée et inclure sa traçabilité, plutôt que d’introduire une copie indépendante du manuel.

Les objectifs de maîtrise ne sont pas présentés comme des formulations officielles du ministère. Ce sont des dérivations éditoriales de Socrato qui doivent indiquer leur assise dans le programme, les connaissances mobilisées et les opérations intellectuelles visées. Ils demeurent des propositions jusqu’à leur validation administrative.

## Opérations intellectuelles

Le fichier `intellectual-operations.ts` est la source canonique des sept opérations intellectuelles. Il conserve les identifiants techniques stables tout en reproduisant l’ordre et les libellés ministériels :

1. Situer dans le temps et dans l’espace;
2. Établir des faits;
3. Dégager des différences et des similitudes;
4. Déterminer des causes et des conséquences;
5. Déterminer des changements et des continuités;
6. Mettre en relation des faits;
7. Établir des liens de causalité.

Chaque définition contient une description concise, les comportements attendus, les références ministérielles et une indication précisant si l’opération est détaillée dans la section A du document d’information de l’épreuve 2025-2026. Les interfaces ne doivent pas maintenir leur propre copie des libellés ou de l’ordre.

## Fiche type d’une notion

Chaque rubrique officielle peut recevoir une fiche éditoriale conforme au schéma `NotionReferenceCard`. La fiche ne copie pas le libellé ministériel : elle conserve son identifiant et rejoint la source canonique.

La fiche distingue :

- la synthèse, le contexte et l’importance historique;
- les repères chronologiques, acteurs et territoires;
- les causes, conséquences, changements, continuités et liens entre notions;
- le vocabulaire, les confusions fréquentes et la profondeur attendue;
- les opérations intellectuelles compatibles;
- le catalogue des sources et les documents historiques associés;
- le statut éditorial et la liste de validation.

Une fiche prête à valider doit relier chacune de ses affirmations à une source vérifiée. Une fiche approuvée exige en plus tous les contrôles de validation, un numéro de version et une date d’approbation.
