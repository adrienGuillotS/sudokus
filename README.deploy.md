# Déploiement Sudoku sur Render

## Architecture
- **Frontend + Backend** : Conteneur Docker unique
- **Base de données** : PostgreSQL externe sur Render

## Fichiers de configuration créés

### 1. `Dockerfile`
Build multi-stage :
- Stage 1 : Build du frontend React (Vite)
- Stage 2 : Backend FastAPI + fichiers statiques frontend

### 2. `render.yaml`
Configuration Render avec :
- Service PostgreSQL (gratuit)
- Service Web Docker (gratuit)
- Variables d'environnement automatiques

### 3. `.dockerignore`
Exclusion des fichiers inutiles du build Docker

### 4. `.env.example`
Template des variables d'environnement

## Étapes de déploiement

### 1. Préparer le repository Git
```bash
cd /Users/admin/venv/sudokus
git add .
git commit -m "Add Docker and Render deployment config"
git push origin main
```

### 2. Sur Render.com

**Étape 1 : Créer la base de données PostgreSQL**
1. Dashboard Render → **New** → **PostgreSQL**
2. Configuration :
   - **Name** : `sudoku-db`
   - **Database** : `sudoku`
   - **User** : `sudoku_user` (ou laisser par défaut)
   - **Region** : Choisir la plus proche
   - **Plan** : **Free**
3. Cliquer sur **Create Database**
4. Une fois créée, copier l'**Internal Database URL** (commence par `postgresql://`)

**Étape 2 : Créer le service web**
1. Dashboard Render → **New** → **Web Service**
2. Connecter votre repository GitHub/GitLab
3. Configuration :
   - **Name** : `sudoku-app`
   - **Region** : Même région que la DB
   - **Branch** : `main`
   - **Root Directory** : (laisser vide)
   - **Environment** : **Python 3**
   - **Build Command** : `./build.sh`
   - **Start Command** : `./start.sh`
   - **Plan** : **Free**

4. **Variables d'environnement** (section "Environment") :
   - Cliquer sur **Add Environment Variable**
   - `DATABASE_URL` : Coller l'Internal Database URL de votre PostgreSQL
   - `PORT` : `10000` (Render utilise ce port par défaut)
   - `PYTHON_VERSION` : `3.11.0`

5. **Advanced** (optionnel) :
   - **Health Check Path** : `/health`
   - **Auto-Deploy** : Yes (pour déployer automatiquement à chaque push)

6. Cliquer sur **Create Web Service**

**Étape 3 : Attendre le déploiement**
- Le premier build prend 5-10 minutes
- Suivre les logs en temps réel
- Une fois "Live", votre app est accessible !

### 3. Vérification

Une fois déployé, votre app sera accessible sur :
```
https://sudoku-app.onrender.com
```

L'API sera sur le même domaine :
```
https://sudoku-app.onrender.com/api/sudoku/...
```

## Variables d'environnement

### Backend (automatiques via Render)
- `DATABASE_URL` : URL PostgreSQL (fournie par Render)
- `PORT` : 8000

### Frontend (build time)
- `VITE_API_URL` : Vide en production (même domaine)

## Structure de déploiement

```
Render Web Service (Docker)
├── Frontend (React/Vite) → /static/
│   └── Servi par FastAPI
└── Backend (FastAPI) → Port 8000
    ├── API Routes → /api/*
    ├── Health Check → /health
    └── Static Files → /*

Render PostgreSQL
└── Base de données Sudoku
```

## Commandes utiles

### Build local avec Docker
```bash
# Build l'image
docker build -t sudoku-app .

# Run localement
docker run -p 8000:8000 \
  -e DATABASE_URL="sqlite:///./sudoku.db" \
  sudoku-app
```

### Test local
```bash
# Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Frontend (dans un autre terminal)
cd frontend
npm run dev
```

## Notes importantes

1. **PostgreSQL vs SQLite** : Le code s'adapte automatiquement
   - Local : SQLite (`sqlite:///./sudoku.db`)
   - Production : PostgreSQL (via `DATABASE_URL`)

2. **CORS** : Configuré pour accepter toutes les origines (`allow_origins=["*"]`)

3. **Fichiers statiques** : Le backend sert automatiquement le frontend si le dossier `static/` existe

4. **Health check** : Endpoint `/health` pour que Render vérifie que l'app fonctionne

5. **Migrations** : Les tables sont créées automatiquement au démarrage (`Base.metadata.create_all()`)

## Troubleshooting

### L'app ne démarre pas
- Vérifier les logs Render
- Vérifier que `DATABASE_URL` est bien configuré
- Vérifier le health check : `https://your-app.onrender.com/health`

### Erreur de connexion DB
- Vérifier que `psycopg2-binary` est dans `requirements.txt`
- Vérifier le format de `DATABASE_URL` (doit commencer par `postgresql://`)

### Frontend ne charge pas
- Vérifier que le build Vite s'est bien passé (logs Docker)
- Vérifier que le dossier `static/` existe dans le conteneur
- Tester l'API directement : `https://your-app.onrender.com/api/sudoku/...`
