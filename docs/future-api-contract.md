# Contrat de la future API Socrato

Ce contrat prépare le remplacement du stockage local par un serveur. Il ne démarre aucun serveur et ne modifie pas le fonctionnement actuel de l’application.

## Principes

- Toutes les routes sont préfixées par `/api/v1`.
- L’identité de l’élève ou de l’enseignant vient de la session authentifiée. Elle ne doit pas être choisie librement dans une requête.
- Les dates sont transmises au format ISO 8601.
- Les contrats versionnés existants sont conservés pour les activités, les brouillons et la progression.
- Une erreur répond avec un statut HTTP approprié et un objet `{ "error": { "code": "...", "message": "..." } }`.

## Routes prévues

| Méthode | Route | Rôle |
| --- | --- | --- |
| `GET` | `/api/v1/student/dashboard?activityId=...` | Charger le tableau de bord élève déjà assemblé |
| `GET` | `/api/v1/teacher/activities` | Lister les activités accessibles à l’enseignant |
| `POST` | `/api/v1/teacher/activities` | Publier une activité |
| `PATCH` | `/api/v1/teacher/activities/:activityId/status` | Suspendre, réactiver ou archiver une activité |
| `GET` | `/api/v1/teacher/activity-drafts/active` | Charger le brouillon actif |
| `PUT` | `/api/v1/teacher/activity-drafts/active` | Enregistrer le brouillon actif |
| `DELETE` | `/api/v1/teacher/activity-drafts/active` | Supprimer le brouillon actif |
| `GET` | `/api/v1/student/progress` | Charger les progressions de l’élève connecté |
| `PUT` | `/api/v1/student/progress/:activityId` | Enregistrer la progression d’une activité |
| `DELETE` | `/api/v1/student/progress/:activityId` | Recommencer une activité |
| `GET` | `/api/v1/student/outcomes` | Charger les bilans confirmés |
| `PUT` | `/api/v1/student/outcomes/:activityId` | Enregistrer un bilan confirmé |
| `DELETE` | `/api/v1/student/outcomes/:activityId` | Retirer le bilan lors d’une reprise autorisée |

## Authentification et sessions

| Méthode | Route | Rôle |
| --- | --- | --- |
| `POST` | `/api/v1/auth/student/code-session` | Échanger un code élève contre une session sécurisée |
| `GET` | `/api/v1/auth/session` | Vérifier la session courante et son rôle |
| `DELETE` | `/api/v1/auth/session` | Fermer la session courante |
| `GET` | `/api/v1/auth/teacher/login?returnTo=/teacher` | Démarrer la future connexion institutionnelle de l’enseignant |

Le serveur devra placer la session dans un témoin `HttpOnly`, `Secure` en production et `SameSite=Lax`. Aucun jeton de session ne doit être retourné au code JavaScript du navigateur. Les erreurs de code élève doivent rester génériques, et les tentatives doivent être limitées côté serveur. Le mécanisme d’identité institutionnelle de l’enseignant reste volontairement à choisir avec l’établissement.

Les types exacts de chaque requête et réponse sont définis dans `lib/data-repository/api-contract.ts`. La future implémentation HTTP devra respecter l’interface `SocratoDataRepository`, comme le fait actuellement le dépôt local du navigateur.

L’adaptateur `HttpSocratoDataRepository` est déjà disponible, mais volontairement non activé. Son activation devra attendre une adresse de serveur, une authentification fonctionnelle et la validation de ces routes par le backend.

## Activation contrôlée

Le sélecteur utilise le stockage local par défaut. Le mode serveur exige simultanément :

- `NEXT_PUBLIC_SOCRATO_DATA_SOURCE=server`
- `NEXT_PUBLIC_SOCRATO_API_BASE_URL=https://adresse-du-serveur`

Une valeur inconnue ou une adresse absente provoque une erreur explicite au lieu d’activer une source de données par accident.
