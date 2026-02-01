# TP CI/CD – LOL Minesweeper

Projet support : jeu de démineur en JavaScript.

## Objectif
Mettre en place une pipeline CI/CD avec des tests automatisés.

## Tests
Les tests unitaires sont réalisés avec Jest.
Ils testent la logique métier du jeu (src/gameLogic.js).

Commande :
npm test

## CI/CD
La pipeline GitLab exécute automatiquement les tests à chaque push.
Si les tests échouent, la pipeline est bloquée.

## Technologies
- JavaScript
- Node.js
- Jest
- GitLab CI/CD
