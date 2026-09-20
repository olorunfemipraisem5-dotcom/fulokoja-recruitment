# FULokoja Electronic Recruitment Portal

A full-stack recruitment system for Federal University Lokoja, modeled on the
University of Abuja recruitment portal. Applicants register, browse open
positions, apply with a CV + application letter (PDF), and track their status.
Admins post vacancies and review/shortlist applicants.

**Stack:** React (Vite + Tailwind) · Node.js/Express · MongoDB · JWT auth · Multer file uploads

---

## Project Structure

```
fulokoja-recruitment/
├── backend/          Express API, MongoDB models, auth, file uploads
└── frontend/         React application (Vite)
```

---

## 1. Prerequisites

- Node.js 18+ and npm
- MongoDB running locally, or a free MongoDB Atlas cluster (https://www.mongodb.com/cloud/atlas)

---

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```
MONGO_URI=mongodb://127.0.0.1:27017/fulokoja_recruitment
JWT_SECRET=some_long_random_string
PORT=5000
CLIENT_URL=http://localhost:5173
```

Create the first admin account (edit the values in `seedAdmin.js` first, or pass
env vars):

```bash
node seedAdmin.js
```

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:5000/api`. Visit `http://localhost:5000/api/health`
to confirm it's up.

---

## 3. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` should point at your backend:

```
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

Visit `http://localhost:5173`.

---

## 4. How It Works

### Applicants
- Register at `/register`, log in at `/login`
- Browse vacancies at `/jobs`
- Apply from a job's detail page — uploads a CV and a cover/application letter (PDF, 5MB max each)
- Track status at `/my-applications` (Submitted → Under Review → Shortlisted → Accepted/Rejected)

### Admins
- Log in with the account created by `seedAdmin.js`
- `/admin` — dashboard with stats and a list of postings
- `/admin/jobs` — create, edit, close/reopen, or delete job postings
- `/admin/jobs/:jobId/applications` — review each applicant, download their CV/cover letter, and change their status

There's no public "become an admin" flow — admin accounts are created directly
in the database via `seedAdmin.js`, or by an existing admin using MongoDB
directly (e.g. `db.users.updateOne({email: "..."}, {$set: {role: "admin"}})`).

---

## 5. Deploying

- **Backend:** any Node host (Render, Railway, a VPS). Set the same environment
  variables as `.env`. Point `CLIENT_URL` at your deployed frontend's URL.
  Uploaded PDFs are stored on disk in `backend/uploads/` — on most PaaS hosts
  this is *not* persistent across deploys/restarts, so for production use a
  proper file store (e.g. swap the `multer` disk storage for an S3-compatible
  bucket) or a host with a persistent volume.
- **Frontend:** `npm run build` produces a static `dist/` folder deployable to
  Netlify, Vercel, or any static host. Set `VITE_API_URL` to your live backend URL.
- **Database:** MongoDB Atlas free tier is enough to get started.

---

## 6. Security Notes Before Going Live

- Change `JWT_SECRET` to a long random value and never commit `.env`
- Change the seeded admin password immediately after first login (there's no
  "change password" UI here yet — update it directly in MongoDB with a fresh
  bcrypt hash, or add a change-password endpoint)
- Restrict `CLIENT_URL`/CORS to your real frontend domain in production
- Consider adding rate limiting (e.g. `express-rate-limit`) on `/api/auth/login`
- Add HTTPS (via your host or a reverse proxy like Nginx) before real applicants use it

---

## 7. Possible Next Additions

- Email notifications when application status changes
- Password reset flow
- Multiple admin roles (e.g. per-department reviewers)
- Pagination/search/filtering on the admin applications list
- Applicant profile page to edit personal details
