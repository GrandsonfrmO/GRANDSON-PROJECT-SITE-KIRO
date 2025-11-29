@echo off
echo 🚀 Démarrage de Grand Son Project en mode PRODUCTION
echo.

REM Vérifier que Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé ou n'est pas dans le PATH
    echo Installez Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js détecté

REM Aller dans le dossier backend
cd backend

REM Vérifier que les dépendances sont installées
if not exist "node_modules" (
    echo 📦 Installation des dépendances...
    npm install
    if errorlevel 1 (
        echo ❌ Erreur lors de l'installation des dépendances
        pause
        exit /b 1
    )
)

REM Vérifier que le fichier .env existe
if not exist ".env" (
    echo ❌ Fichier .env manquant
    echo Copiez .env.example vers .env et configurez vos variables
    pause
    exit /b 1
)

echo ✅ Configuration trouvée

REM Test rapide de la configuration email
echo 🧪 Test de la configuration email...
node -e "
require('dotenv').config();
const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'ADMIN_EMAIL'];
const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.log('❌ Variables manquantes:', missing.join(', '));
  process.exit(1);
}
console.log('✅ Configuration email OK');
"

if errorlevel 1 (
    echo ❌ Configuration email incomplète
    echo Vérifiez votre fichier .env
    pause
    exit /b 1
)

echo.
echo 🎯 Démarrage du serveur de production...
echo 📧 Notifications email activées
echo 🛒 API de commandes disponible sur http://localhost:3001
echo.
echo Appuyez sur Ctrl+C pour arrêter le serveur
echo.

REM Démarrer le serveur avec les variables d'environnement de production
set NODE_ENV=production
node orders-server.js

pause