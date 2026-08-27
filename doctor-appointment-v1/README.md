# ClinicSlot V1

A deliberately small appointment-booking MVP for one doctor.

## Features

- Patient can view available slots and book an appointment.
- Booking generates a token number.
- Doctor can set start time, end time and slot duration.
- Doctor can view booked appointments.
- Local development works without any database setup using `data/store.json`.
- Production can use Neon PostgreSQL by setting `DATABASE_URL`.
- PostgreSQL uses a unique `(appointment_date, appointment_time)` constraint to prevent two bookings for the same slot.

## Requirements

Install:

1. Node.js 20+ (Node 22 LTS recommended)
2. Git
3. VS Code (recommended)

Verify:

```bash
node -v
npm -v
git --version
```

## Run locally

```bash
npm install
```

Copy `.env.example` to `.env.local`.

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```bash
cp .env.example .env.local
```

Leave `DATABASE_URL` empty for local development.

Start the app:

```bash
npm run dev
```

Open:

- http://localhost:3000
- Patient: http://localhost:3000/doctor/dr-ravi
- Doctor: http://localhost:3000/doctor/dashboard

## Production database with Neon

1. Create a free Neon PostgreSQL project.
2. Copy its connection string.
3. Set:

```env
DATABASE_URL=postgresql://...
```

The app creates the two small tables automatically on first use.

## Deploy to Vercel

1. Push this project to GitHub.
2. In Vercel choose **Add New > Project**.
3. Import the GitHub repository.
4. Framework should be detected as Next.js.
5. Add the `DATABASE_URL` environment variable from Neon.
6. Click Deploy.

Important: do not deploy using local JSON storage because Vercel's serverless filesystem is not durable. Use Neon for deployed persistence.

## GitHub

```bash
git init
git add .
git commit -m "Initial ClinicSlot V1"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## V1 scope

Intentionally not included: accounts, payments, SMS, WhatsApp, multiple doctors, reviews, maps, AI, insurance, medical records, video calls, or advanced queue prediction.
