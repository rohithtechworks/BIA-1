# Home Spoken Centre - Production Spoken English Learning Portal

**Home Spoken Centre** is a modern, high-performance spoken-English learning web application built with React, Vite, TypeScript, Express/Vercel serverless API, Supabase PostgreSQL, and Cloudflare R2 private video storage.

---

## Technology Stack

- **Frontend:** React 18, Vite, TypeScript, React Router v6.
- **Styling:** Modular CSS preserving exact brand palette (`#103665` navy, `#ad1035` maroon, `#d6a64b` gold, single-column vertical button lists).
- **Backend API:** Node.js, Express, TypeScript, Vercel Serverless Function compatible architecture.
- **Database:** Supabase PostgreSQL with Row Level Security (RLS) policies.
- **Authentication:** Phone-number-based authentication with bcrypt password hashing and single active device session enforcement.
- **Video Storage & Playback:** Cloudflare R2 / S3 private storage with short-lived presigned URLs, streaming proxy supporting HTTP Range requests (`206 Partial Content`), and subtle user watermark overlays.
- **Testing:** Vitest (Unit & Integration) and Playwright (E2E).

---

## Project Structure

```
home-spoken-centre/
├── api/
│   └── index.ts               (Vercel Serverless Function entrypoint)
├── public/
│   ├── favicon.svg
│   └── images/
│       └── poster.jpg         (Accurate Home Spoken Centre Poster)
├── reference/
│   └── home_spoken_centre_single_app_with_landing.html
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── auth/              (LoginModal, SignupModal, SessionConflictModal)
│   │   ├── layout/            (Navbar)
│   │   ├── courses/           (LandingScreen, CategoryCard, MemberButton)
│   │   └── video/             (VideoPlayer with watermark & signed auth)
│   ├── context/               (AuthContext)
│   ├── hooks/                 (useAuth)
│   ├── pages/                 (HomePage, CategoryPage, LessonPage, AdminPage)
│   ├── routes/                (AppRoutes)
│   ├── services/              (API Client)
│   ├── styles/                (global.css)
│   ├── types/                 (TypeScript definitions)
│   └── main.tsx
├── server/
│   ├── middleware/            (Auth, ErrorHandler, RateLimiter)
│   ├── routes/                (Auth, Courses, Video, Admin)
│   ├── schemas/               (Zod input validation)
│   ├── services/              (Supabase, AuthService, SessionService, VideoStorage, CSVMapping)
│   ├── utils/                 (PhoneUtils, HashUtils, Logger)
│   └── index.ts               (Express server entrypoint)
├── supabase/
│   ├── migrations/            (001_initial_schema.sql)
│   ├── seed.sql               (All 11 course categories & 88 lesson topics)
│   └── README.md
├── scripts/
│   ├── generate-admin.ts      (Initial admin setup script)
│   └── extract-poster.js      (Poster extraction helper)
├── tests/
│   ├── unit/                  (Phone & Hash unit tests)
│   ├── integration/           (Express API integration tests)
│   └── e2e/                   (Playwright browser tests)
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json
└── README.md
```

---

## Setup & Deployment Instructions

### 1. Local Development Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase project credentials (`VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) and JWT secret (`JWT_SECRET`).

3. **Database Migration & Seeding:**
   - Go to your Supabase Dashboard -> **SQL Editor**.
   - Execute `supabase/migrations/001_initial_schema.sql`.
   - Execute `supabase/seed.sql`.

4. **Run Local Development Server:**
   ```bash
   npm run dev
   ```
   Access the frontend at `http://localhost:3000` and the API server at `http://localhost:5000`.

5. **Generate Admin User & Demo Access Code:**
   ```bash
   npx tsx scripts/generate-admin.ts
   ```

---

### 2. Private Video Upload & Filename Mapping

1. Upload your lesson MP4 video files to your private Cloudflare R2 or S3 bucket (`home-spoken-centre-videos`) under `videos/<filename>.mp4`.
2. Log in as an Administrator (`+919876543210` or your configured admin phone).
3. Navigate to **Admin Portal -> Video Filename Mapping**.
4. Paste your CSV mapping in the following format:
   ```csv
   lesson_id,video_filename,status
   relative-mother,mother_english_lesson.mp4,available
   relative-father,father_english_lesson.mp4,available
   ```
5. Click **Import Video Filename Mappings**. The lessons will immediately show as "Available" and stream via short-lived presigned URLs with custom student watermarks!

---

### 3. Running Automated Tests & Builds

- **Run Unit & Integration Tests:**
  ```bash
  npm run test
  ```

- **Run End-to-End Tests:**
  ```bash
  npm run test:e2e
  ```

- **Production Build:**
  ```bash
  npm run build
  ```

---

### 4. Deploying to Vercel & GitHub

1. Initialize Git and commit code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Home Spoken Centre"
   ```
2. Create a GitHub repository and push your code:
   ```bash
   git remote add origin https://github.com/your-username/home-spoken-centre.git
   git branch -M main
   git push -u origin main
   ```
3. Import the repository into [Vercel](https://vercel.com):
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Configure Environment Variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`
5. Deploy! Vercel automatically deploys the Vite frontend and the serverless API routes in `/api/index.ts`.
