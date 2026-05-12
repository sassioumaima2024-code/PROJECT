# 🎯 SERVICY - Application de Services à la Demande

**Une plateforme complète pour connecter clients et prestataires de services**

---

## 📱 À Propos du Projet

SERVICY est une application mobile et web complète qui permet aux clients de découvrir et réserver des services professionnels (plomberie, électricité, ménage, taxi, coiffure, etc.) et aux prestataires de gérer leurs services et rendez-vous en temps réel.

### Fonctionnalités Principales

✅ **Pour les Prestataires**
- Dashboard avec statistiques en temps réel
- Gestion complète des services
- Calendrier et agenda des rendez-vous
- Suivi GPS des déplacements
- Système de notation et avis
- Gestion du profil professionnel

✅ **Pour les Clients**
- Recherche et découverte de services
- Mode urgence pour demandes pressantes
- Suivi GPS en temps réel du prestataire
- Système de notation des prestataires
- Historique des rendez-vous
- Gestion du profil

✅ **Pour les Administrateurs**
- Dashboard avec KPI et graphiques
- Gestion des prestataires (validation, suspension)
- Modération des avis
- Statistiques de revenus
- Gestion des catégories

---

## 🏗️ Architecture Technique

### Tech Stack

```
┌─────────────────────────────────────────────┐
│         Frontend (Mobile & Web)             │
├─────────────────────────────────────────────┤
│ Flutter (Provider + Client) │ Next.js (Admin)
└────────────────┬────────────────────────────┘
                 │ REST API (JSON)
┌────────────────▼────────────────────────────┐
│         Backend - Symfony 7                 │
├─────────────────────────────────────────────┤
│ JWT Auth │ Services │ Appointments │ Reviews│
└────────────────┬────────────────────────────┘
                 │ Doctrine ORM
┌────────────────▼────────────────────────────┐
│         MySQL Database                      │
├─────────────────────────────────────────────┤
│ Users │ Services │ Appointments │ Reviews   │
└─────────────────────────────────────────────┘
```

### Technologies Utilisées

| Component | Technology | Version |
|-----------|-----------|---------|
| Backend API | Symfony | 7.0 |
| Language | PHP | 8.3 |
| Database | MySQL | 8.0 |
| Cache | Redis | 7.0 |
| Mobile (Provider) | Flutter | 3.11+ |
| Mobile (Client) | Flutter | 3.11+ |
| Admin Dashboard | Next.js | 14.0 |
| Authentication | JWT RS256 | - |
| Push Notifications | Firebase FCM | - |
| Real-time Location | Google Maps | - |

---

## 📦 Installation

### Prérequis

- PHP 8.3+
- MySQL 8.0+
- Node.js 18+
- Flutter 3.11+
- Docker (optionnel)

### Quick Start avec Docker

```bash
# Clone le projet
git clone <repository-url>
cd PROJECT

# Démarrer les services
docker-compose up

# Accéder à l'application
Backend API: http://localhost:8000/api
Admin Dashboard: http://localhost:3000
```

### Installation Manuelle

**Backend (Symfony)**
```bash
cd backend

# Installer les dépendances
composer install

# Configurer la base de données
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
php bin/console doctrine:fixtures:load

# Démarrer le serveur
php bin/console server:run
```

**Admin Dashboard (Next.js)**
```bash
cd frontend-admin

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Accéder à http://localhost:3000
```

**Mobile Apps (Flutter)**
```bash
# Provider App
cd mobile_prestataire
flutter pub get
flutter run

# Client App
cd mobile_client
flutter pub get
flutter run
```

---

## 🔐 Authentification

### Comptes de Test

**Admin Panel**
```
Email: admin@servicy.tn
Mot de passe: admin123
```

**Provider (Prestataire)**
```
Email: provider@test.tn
Mot de passe: pass123
```

**Client**
```
Email: client@test.tn
Mot de passe: pass123
```

### JWT Token

L'application utilise JWT (JSON Web Tokens) avec RS256 pour l'authentification.

```bash
# Générer les clés JWT
php bin/console lexik:jwt:generate-keypair
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication
Ajouter le header :
```
Authorization: Bearer <JWT_TOKEN>
```

### Endpoints Clés

**Authentication**
```
POST /register          - Créer un compte
POST /login            - Se connecter
POST /verify-otp       - Vérifier OTP
```

**Services (Prestataire)**
```
GET  /provider/services         - Lister mes services
POST /provider/services         - Créer un service
PUT  /provider/services/{id}    - Modifier un service
DELETE /provider/services/{id}  - Supprimer un service
```

**Appointments**
```
GET /provider/appointments          - Mes rendez-vous
POST /appointments                  - Créer un rendez-vous
PATCH /appointments/{id}/accept    - Accepter
PATCH /appointments/{id}/refuse    - Refuser
PATCH /appointments/{id}/start     - Commencer
PATCH /appointments/{id}/complete  - Terminer
```

**Admin**
```
GET /admin/dashboard/stats          - KPIs
GET /admin/providers                - Liste prestataires
PATCH /admin/providers/{id}/validate - Valider
GET /admin/reviews                  - Avis
DELETE /admin/reviews/{id}          - Supprimer avis
```

---

## 🗄️ Base de Données

### Schema

```sql
users
├── id (int)
├── email (varchar)
├── password_hash (varchar)
├── role (enum: client, prestataire, admin)
├── phone (varchar)
├── nom_commercial (varchar)
├── rating (float)
└── is_active (boolean)

services
├── id (int)
├── provider_id (FK: users)
├── category_id (FK: categories)
├── title (varchar)
├── price (decimal)
├── description (text)
└── is_active (boolean)

appointments
├── id (int)
├── client_id (FK: users)
├── provider_id (FK: users)
├── service_id (FK: services)
├── scheduled_at (datetime)
├── status (enum)
├── budget (decimal)
└── address (varchar)

reviews
├── id (int)
├── appointment_id (FK: appointments)
├── reviewer_id (FK: users)
├── reviewee_id (FK: users)
├── rating (int 1-5)
├── comment (text)
└── created_at (datetime)
```

### Migrations

```bash
# Lister les migrations
php bin/console doctrine:migrations:list

# Exécuter les migrations
php bin/console doctrine:migrations:migrate

# Charger les fixtures de test
php bin/console doctrine:fixtures:load
```

---

## 🧪 Tests

### Tests PHPUnit

```bash
cd backend

# Exécuter tous les tests
php bin/phpunit

# Exécuter des tests spécifiques
php bin/phpunit tests/AuthControllerTest.php

# Tests avec coverage
php bin/phpunit --coverage-html coverage
```

### Coverage des Tests
- ✅ Authentication (register, login, JWT)
- ✅ Service CRUD
- ✅ Appointment State Machine
- ✅ Admin endpoints
- ✅ Authorization/RBAC

---

## 🚀 Déploiement

### Production Checklist

- [ ] Configuration .env produit
- [ ] Générer JWT keypair
- [ ] Configurer base de données MySQL
- [ ] Activer HTTPS/SSL
- [ ] Configurer CORS
- [ ] Configurer email (Mailer)
- [ ] Configurer Firebase FCM
- [ ] Configurer Google Maps API
- [ ] Configurer Twilio SMS
- [ ] Activer rate limiting
- [ ] Configurer Redis cache
- [ ] Configurer backups

### Déploiement avec Docker

```bash
# Build images
docker-compose build

# Démarrer les services
docker-compose up -d

# Exécuter les migrations
docker-compose exec backend php bin/console doctrine:migrations:migrate

# Charger les fixtures
docker-compose exec backend php bin/console doctrine:fixtures:load
```

### Variables d'Environnement

Créer un fichier `.env` basé sur `.env.example`:

```env
DATABASE_URL=mysql://user:pass@host:3306/servicy
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
FIREBASE_API_KEY=your_key
GOOGLE_MAPS_API_KEY=your_key
TWILIO_ACCOUNT_SID=your_sid
```

---

## 📊 Monitoring & Logs

### Logs Symfony
```bash
# Voir les logs
tail -f backend/var/log/prod.log

# Logs par level
grep ERROR backend/var/log/prod.log
```

### Database Queries
```bash
# Activer le profiler
# Dans config/packages/doctrine.yaml
doctrine:
    dbal:
        logging: true
```

---

## 🛠️ Troubleshooting

### Problèmes Courants

**1. Erreur de connexion à la base de données**
```bash
# Vérifier la connexion
php bin/console doctrine:query:sql "SELECT 1"

# Créer la base de données
php bin/console doctrine:database:create
```

**2. Erreur JWT**
```bash
# Régénérer les clés
php bin/console lexik:jwt:generate-keypair --overwrite
```

**3. Permissions d'upload**
```bash
# Fixer les permissions
chmod -R 755 backend/public/uploads
chmod -R 755 backend/var/
```

**4. Cache**
```bash
# Nettoyer le cache
php bin/console cache:clear
php bin/console cache:warmup
```

---

## 📖 Documentation Complète

- **DEPLOYMENT_GUIDE.md** - Guide d'installation et déploiement
- **COMPLETION_SUMMARY.md** - Résumé des fonctionnalités implémentées
- **API Documentation** - Endpoints et exemples
- **Database Schema** - Structure complète

---

## 🤝 Contribution

Les contributions sont bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing`)
5. Ouvrir une Pull Request

---

## 📝 License

Ce projet est sous licence propriétaire. Tous droits réservés © 2025 SERVICY.

---

## 👥 Team

- **O** - Prestataire App + Backend
- **Ghada** - Client App + Admin Dashboard

---

## 📞 Support

Pour toute question ou problème :
1. Consulter la documentation
2. Vérifier les logs
3. Exécuter les tests
4. Contacter l'équipe

---

## 🎯 Feuille de Route Future

- [ ] Intégration Stripe (paiements en ligne)
- [ ] Système de messages entre utilisateurs
- [ ] Appels vidéo pour consultations
- [ ] Plans d'abonnement
- [ ] Analytics avancées
- [ ] Machine Learning pour recommandations
- [ ] Support multilingue complet

---

## ✨ Highlights du Projet

🎨 **Interface Moderne**
- Design cohérent (Violet/Or pour Prestataires, Rose/Teal pour Clients)
- Animations fluides
- Responsive sur tous les appareils

🔒 **Sécurité Enterprise**
- JWT authentication
- RBAC avec Symfony Voters
- Rate limiting
- Input validation complète

⚡ **Performance Optimisée**
- Caching multi-niveaux
- Requêtes optimisées
- Pagination
- Compression

📱 **Mobile First**
- Apps natives Flutter
- Offline mode
- Push notifications
- GPS tracking en temps réel

---

## 🎉 Conclusion

SERVICY est une application complète, prête pour la production, qui fournit une plateforme robuste pour connecter clients et prestataires de services. Avec une architecture solide, une sécurité enterprise et une expérience utilisateur optimisée, elle est prête pour le déploiement et l'expansion.

---

**SERVICY 2025** - À votre service  
*Transforming Service Delivery in Tunisia*
