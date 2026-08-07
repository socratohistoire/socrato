# Migration future des données locales

L’outil actuel produit uniquement un aperçu (`dryRun`). Il ne possède aucune fonction d’envoi, de suppression ou de remplacement des données locales.

## Données transférables

- Les activités dont l’identifiant commence par `activity-local-`.
- Le brouillon actif de l’enseignant, lorsqu’il existe.

Les groupes fictifs sont retirés de la copie de migration. L’enseignant devra choisir les vrais groupes du serveur avant de publier ou d’assigner les éléments importés.

## Données exclues

- Les activités de démonstration fournies avec Socrato.
- Les activités dont l’identifiant existe déjà sur le serveur.
- Toutes les progressions et tous les bilans locaux tant qu’ils ne peuvent pas être reliés à une identité élève vérifiée.
- Les codes d’accès, les sessions et les identifiants fictifs.

## Vérification et reprise

L’aperçu contient un total d’éléments exclus, leur motif et une empreinte de contrôle des éléments transférables. La future procédure devra comparer cette empreinte et les quantités après importation. Les données locales ne devront être effacées qu’après confirmation explicite de l’enseignant et sauvegarde réussie sur le serveur.
