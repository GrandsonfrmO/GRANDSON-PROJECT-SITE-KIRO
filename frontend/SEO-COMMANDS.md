# 🔧 Commandes SEO Utiles

## 📋 Vérification Avant le Lancement

### Vérifier le Sitemap
```bash
# Vérifier que le sitemap est accessible
curl https://grandson-project.com/sitemap.xml

# Valider le sitemap XML
curl https://grandson-project.com/sitemap.xml | xmllint --format -
```

### Vérifier Robots.txt
```bash
# Vérifier que robots.txt est accessible
curl https://grandson-project.com/robots.txt

# Afficher le contenu
cat frontend/app/robots.ts
```

### Vérifier les Métadonnées
```bash
# Extraire les métadonnées de la page d'accueil
curl -s https://grandson-project.com | grep -E '<title>|<meta name="description"'

# Vérifier les Open Graph tags
curl -s https://grandson-project.com | grep -E 'og:title|og:description|og:image'
```

### Vérifier les Structured Data
```bash
# Extraire les schemas JSON-LD
curl -s https://grandson-project.com | grep -A 20 'application/ld+json'
```

---

## 🏗️ Build et Déploiement

### Build pour Production
```bash
cd frontend
npm run build

# Vérifier les erreurs de build
npm run build 2>&1 | grep -i error
```

### Tester Localement
```bash
cd frontend
npm run build
npm run start

# Ouvrir dans le navigateur
# http://localhost:3000
```

### Vérifier les Performances
```bash
# Lighthouse CLI
npm install -g @lhci/cli@latest

# Exécuter Lighthouse
lhci autorun

# Ou utiliser Chrome DevTools
# 1. Ouvrir Chrome DevTools (F12)
# 2. Aller à l'onglet Lighthouse
# 3. Cliquer sur "Analyze page load"
```

---

## 🔍 Vérification SEO

### Vérifier les Liens Cassés
```bash
# Utiliser wget pour vérifier les liens
wget --spider -r -o /tmp/wget.log https://grandson-project.com
grep "HTTP" /tmp/wget.log | grep -v "200 OK"

# Ou utiliser curl
for url in $(curl -s https://grandson-project.com | grep -oP 'href="\K[^"]+'); do
  echo "Checking $url"
  curl -s -o /dev/null -w "%{http_code}" "$url"
done
```

### Vérifier les Images
```bash
# Vérifier que toutes les images ont un alt text
curl -s https://grandson-project.com | grep -E '<img[^>]*>' | grep -v 'alt='

# Vérifier les images manquantes
curl -s https://grandson-project.com | grep -oP 'src="\K[^"]+' | while read url; do
  curl -s -o /dev/null -w "$url: %{http_code}\n" "$url"
done
```

### Vérifier les Redirects
```bash
# Vérifier les redirects 301
curl -I https://grandson-project.com/old-page
# Devrait retourner 301 ou 302

# Vérifier la chaîne de redirects
curl -L -I https://grandson-project.com/old-page
```

---

## 📊 Monitoring et Analytics

### Vérifier les Core Web Vitals
```bash
# Utiliser PageSpeed Insights API
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://grandson-project.com&key=YOUR_API_KEY"

# Ou utiliser web-vitals npm package
npm install web-vitals
```

### Vérifier le Trafic Organique
```bash
# Utiliser Google Search Console API
# Nécessite une authentification OAuth2

# Exemple avec curl
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fgrandson-project.com%2F/searchAnalytics/query" \
  -X POST \
  -d '{"startDate":"2025-01-01","endDate":"2025-01-31","dimensions":["query"]}'
```

---

## 🔐 Sécurité SEO

### Vérifier le HTTPS
```bash
# Vérifier que HTTPS est activé
curl -I https://grandson-project.com
# Devrait retourner 200 OK

# Vérifier le certificat SSL
openssl s_client -connect grandson-project.com:443 -servername grandson-project.com
```

### Vérifier les Headers de Sécurité
```bash
# Vérifier les headers de sécurité
curl -I https://grandson-project.com | grep -E 'X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security'

# Vérifier avec curl verbose
curl -v https://grandson-project.com 2>&1 | grep -E '^<|^>'
```

---

## 📝 Maintenance Continue

### Vérifier les Erreurs de Crawl
```bash
# Vérifier les logs du serveur
tail -f /var/log/nginx/access.log | grep "404\|500"

# Ou utiliser Google Search Console API
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fgrandson-project.com%2F/crawlIssues"
```

### Mettre à Jour le Sitemap
```bash
# Le sitemap est généré automatiquement par Next.js
# Mais vous pouvez le régénérer manuellement

# Redéployer le site
npm run build
npm run start

# Ou soumettre manuellement à Google Search Console
```

### Vérifier les Backlinks
```bash
# Utiliser des outils comme Ahrefs, SEMrush, ou Moz
# Ou utiliser l'API Google Search Console

curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fgrandson-project.com%2F/sitemaps"
```

---

## 🚀 Déploiement sur Vercel

### Déployer avec Vercel CLI
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Déployer en production
vercel --prod
```

### Configurer les Variables d'Environnement
```bash
# Ajouter les variables SEO
vercel env add NEXT_PUBLIC_SITE_URL
vercel env add NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
vercel env add NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

# Vérifier les variables
vercel env list
```

### Vérifier le Déploiement
```bash
# Vérifier que le site est accessible
curl -I https://grandson-project.com

# Vérifier le sitemap
curl https://grandson-project.com/sitemap.xml

# Vérifier robots.txt
curl https://grandson-project.com/robots.txt
```

---

## 📈 Rapports et Analyses

### Générer un Rapport SEO
```bash
# Utiliser SEMrush API
curl "https://api.semrush.com/?type=domain_overview&domain=grandson-project.com&api_key=YOUR_API_KEY"

# Ou utiliser Ahrefs API
curl "https://api.ahrefs.com/v3/site-explorer/domain-rating?target=grandson-project.com&token=YOUR_API_KEY"
```

### Exporter les Données Google Search Console
```bash
# Utiliser Google Sheets avec Google Search Console Connector
# Ou utiliser l'API GSC

curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fgrandson-project.com%2F/searchAnalytics/query" \
  -X POST \
  -d '{"startDate":"2025-01-01","endDate":"2025-01-31","dimensions":["query","page"],"rowLimit":10000}' \
  > seo-report.json
```

---

## 🐛 Dépannage

### Problème: Sitemap non trouvé
```bash
# Vérifier que le fichier existe
curl https://grandson-project.com/sitemap.xml

# Vérifier les logs
npm run build 2>&1 | grep -i sitemap

# Régénérer
npm run build
```

### Problème: Robots.txt non trouvé
```bash
# Vérifier que le fichier existe
curl https://grandson-project.com/robots.txt

# Vérifier les logs
npm run build 2>&1 | grep -i robots

# Régénérer
npm run build
```

### Problème: Métadonnées manquantes
```bash
# Vérifier le layout.tsx
cat frontend/app/layout.tsx | grep -E 'metadata|title|description'

# Vérifier les métadonnées générées
curl -s https://grandson-project.com | grep -E '<title>|<meta'
```

### Problème: Images non optimisées
```bash
# Vérifier les images
curl -s https://grandson-project.com | grep -oP 'src="\K[^"]+' | head -5

# Vérifier les formats
curl -I https://grandson-project.com/image.jpg | grep -i content-type
```

---

## 📚 Ressources Utiles

### Documentation
- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)

### Outils en Ligne
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

### APIs
- [Google Search Console API](https://developers.google.com/webmaster-tools)
- [Google PageSpeed Insights API](https://developers.google.com/speed/docs/insights/v5/get-started)
- [SEMrush API](https://developer.semrush.com/)
- [Ahrefs API](https://ahrefs.com/api)

---

**Dernière mise à jour:** Décembre 2025
**Version:** 1.0
