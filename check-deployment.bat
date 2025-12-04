@echo off
echo ========================================
echo VERIFICATION DU DEPLOIEMENT
echo ========================================
echo.

echo [1/4] Verification du statut Git...
git status
echo.

echo [2/4] Verification des derniers commits...
git log --oneline -3
echo.

echo [3/4] Verification de la connexion GitHub...
git remote -v
echo.

echo [4/4] Instructions pour verifier Vercel:
echo.
echo 1. Allez sur: https://vercel.com/dashboard
echo 2. Trouvez votre projet "grandson-project"
echo 3. Verifiez que le dernier deploiement est en cours ou termine
echo 4. Cliquez sur le deploiement pour voir les logs
echo.
echo ========================================
echo VARIABLES D'ENVIRONNEMENT A VERIFIER
echo ========================================
echo.
echo Sur Vercel, assurez-vous que ces variables sont definies:
echo - CLOUDINARY_CLOUD_NAME
echo - CLOUDINARY_API_KEY
echo - CLOUDINARY_API_SECRET
echo - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
echo - SUPABASE_SERVICE_ROLE_KEY
echo - NEXT_PUBLIC_SUPABASE_URL
echo - NEXT_PUBLIC_SUPABASE_ANON_KEY
echo.
echo ========================================
echo TESTS A EFFECTUER APRES DEPLOIEMENT
echo ========================================
echo.
echo 1. Aller sur votre site en production
echo 2. Se connecter au panel admin
echo 3. Essayer d'ajouter un produit avec une image
echo 4. Verifier que l'image s'upload correctement
echo 5. Verifier que l'image s'affiche dans la liste des produits
echo.
pause
