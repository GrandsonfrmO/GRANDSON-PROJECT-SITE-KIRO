#!/bin/bash

# Script de déploiement Vercel
# Usage: ./deploy-vercel.sh

echo "🚀 Déploiement Vercel en cours..."
echo ""

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé"
    echo "Installation: npm install -g vercel"
    exit 1
fi

# Vérifier que nous sommes sur la branche main
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Vous êtes sur la branche $CURRENT_BRANCH, pas main"
    echo "Basculez sur main: git checkout main"
    exit 1
fi

# Vérifier que tout est commité
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Il y a des changements non commités"
    echo "Commitez d'abord: git add -A && git commit -m 'message'"
    exit 1
fi

echo "✅ Vérifications réussies"
echo ""

# Déployer en production
echo "📦 Déploiement en production..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Déploiement réussi !"
    echo ""
    echo "📍 Votre site est maintenant en ligne"
    echo "🔗 Vérifiez: https://vercel.com/dashboard"
else
    echo ""
    echo "❌ Erreur lors du déploiement"
    exit 1
fi
