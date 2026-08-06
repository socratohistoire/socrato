# Modèle de données futur de Socrato

Ce document décrit la structure logique de la future base de données. Il ne choisit aucun fournisseur et ne crée aucune base de données.

## Organisation

Une école possède des enseignants, des groupes et des élèves. Un groupe appartient à un enseignant. L’appartenance d’un élève à un groupe est conservée séparément afin de représenter correctement un changement de groupe ou d’année scolaire.

## Activités et apprentissage

Une activité appartient à son enseignant et est assignée à un ou plusieurs groupes. L’ordre des questions est conservé dans le contrat versionné de l’activité. Chaque tentative d’un élève crée une séance d’apprentissage liée à l’activité, à l’élève et au groupe au moment de l’assignation.

La progression, les réponses et le bilan final sont liés à cette séance. Cette séparation permet de reprendre une activité sans mélanger deux tentatives.

## Brouillons et archivage

Chaque enseignant peut avoir un brouillon actif. Une activité publiée peut être suspendue ou archivée sans supprimer ses résultats historiques. Les groupes et élèves sont eux aussi archivés plutôt que supprimés lorsqu’ils sont encore référencés.

## Confidentialité

- Un élève possède un alias d’affichage; aucune adresse courriel n’est exigée par le modèle.
- Les références provenant d’un système scolaire sont conservées sous forme d’empreinte lorsque possible.
- Les codes d’accès et les jetons de session ne sont jamais enregistrés en clair, seulement leurs empreintes.
- Le texte des réponses doit être chiffré au repos et associé à une date de suppression prévue.
- Les données accessibles sont toujours limitées par l’école, l’enseignant, le groupe et la session authentifiée.
- Les durées de conservation devront être approuvées avant la mise en production.

Les types exacts et le contrôle des liens se trouvent dans `lib/server-data-model/`. Ils sont indépendants de PostgreSQL, MySQL ou de tout autre choix technologique.
