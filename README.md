# PulseDesk - Forge 2 Hackathon

PulseDesk is a multi-tenant support-desk SaaS built for the Forge 2 Hackathon.

## Stack
- **Backend:** Laravel 11 + MySQL 8 + Sanctum
- **Frontend:** React 19 + Vite + Tailwind CSS

## Exact Run Steps
1. **Clone the repository:**
   ```bash
   git clone <repo-url> forge2-prashant
   cd forge2-prashant
   ```
2. **Backend Setup:**
   ```bash
   cd backend
   cp .env.example .env
   composer install
   php artisan key:generate
   php artisan migrate --seed
   php artisan serve
   ```
3. **Frontend Setup:**
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```

## Models Used (EastRouter)
- Orchestrator (Hermes): `deepseek/deepseek-v4-pro`
- Coder (OpenClaw): `z-ai/glm-5.1`
