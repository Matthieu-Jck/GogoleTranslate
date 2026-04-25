# Style Translator AI

MVP full-stack pour transformer un texte dans un style cible via une API LLM.

## Architecture cible

- `frontend/`: application Angular standalone
- `backend/`: API Java Spring Boot
- `LLM API`: fournisseur Groq OpenAI-compatible appele en HTTP par le backend
- `Docker`: un conteneur frontend et un conteneur backend
- `Fly.io`: deploiement separe frontend/backend
- `GitHub Actions`: build, test et deploy conditionnel sur `main`

## Composants essentiels

- UI de saisie texte + selection de style
- endpoint REST `POST /api/v1/translate`
- endpoint REST `GET /api/v1/styles`
- registre de styles et prompts systeme
- adaptateur LLM configurable
- mode mock pour demarrer sans cle API

## Flux de donnees

1. Angular charge les styles via `GET /api/v1/styles`
2. L'utilisateur envoie le texte et le style via `POST /api/v1/translate`
3. Spring Boot valide la requete
4. Le service choisit le prompt du style cible
5. L'adaptateur LLM appelle l'API externe
6. Le backend renvoie le texte reformule au frontend
7. Angular affiche le resultat dans le panneau de sortie

## Endpoints REST

- `GET /api/v1/styles`
- `POST /api/v1/translate`

Exemple de payload:

```json
{
  "text": "Notre produit sera disponible la semaine prochaine.",
  "style": "corporate"
}
```

## Structure backend

```text
backend/
  src/main/java/com/styletranslator/
    api/
    application/
    config/
    domain/
    infrastructure/llm/
  src/main/resources/
```

## Structure frontend

```text
frontend/
  src/app/
    core/models/
    core/services/
    app.component.*
  src/environments/
```

## Lancement local

### Option 1 - Docker Compose

```bash
docker compose up --build
```

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:8080`

### Option 2 - local

Backend:

```bash
cd backend
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm start
```

## Variables d'environnement

Copier `.env.example` vers `.env` puis renseigner:

- `LLM_ENABLED`
- `GROQ_API_KEY`
- `LLM_API_KEY`
- `LLM_MODEL`
- `LLM_BASE_URL`
- `LLM_CHAT_PATH`

Si `GROQ_API_KEY` est vide, le backend renvoie une reponse mock utile pour le MVP.

## Deploiement GitHub Actions + Fly.io

Secrets GitHub a configurer dans le repo:

- `FLY_API_TOKEN`
- `GROQ_API_KEY`

Optionnel si tu preferes des tokens Fly separes par app:

- `FLY_API_TOKEN_BACKEND`
- `FLY_API_TOKEN_FRONTEND`
- `FLY_API_KEY_BACKEND`
- `FLY_API_KEY_FRONTEND`

Workflows:

- [ci.yml](<C:\Users\matth\Desktop\Projets\GogoleTranslate\.github\workflows\ci.yml>)
- [deploy-backend.yml](<C:\Users\matth\Desktop\Projets\GogoleTranslate\.github\workflows\deploy-backend.yml>)
- [deploy-frontend.yml](<C:\Users\matth\Desktop\Projets\GogoleTranslate\.github\workflows\deploy-frontend.yml>)

Configs Fly:

- [backend/fly.toml](<C:\Users\matth\Desktop\Projets\GogoleTranslate\backend\fly.toml>)
- [frontend/fly.toml](<C:\Users\matth\Desktop\Projets\GogoleTranslate\frontend\fly.toml>)

En production, le frontend passe par un proxy Nginx vers le backend Fly, ce qui evite les appels cross-origin depuis le navigateur.

Si tes apps Fly portent d'autres noms que `gogoletranslate-api` et `gogoletranslate-web`, il faut mettre a jour:

- `app = ...` dans les deux `fly.toml`
- `API_PROXY_PASS` dans [frontend/fly.toml](<C:\Users\matth\Desktop\Projets\GogoleTranslate\frontend\fly.toml>)
