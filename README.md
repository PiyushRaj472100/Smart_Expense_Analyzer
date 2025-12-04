# Smart Expense Analyzer

A full-stack personal finance dashboard that helps you track daily expenses, visualize spending patterns, and get AI‑powered insights from your transactions.

## Live Demo

### 🔹 Frontend (User Interface)
https://smart-expense-analyzer.vercel.app

### 🔹 Backend API (Node.js + Express)
https://smart-expense-analyzer.onrender.com


## Screenshots

> Save your screenshots in the repo under `assets/` with the filenames below so these links render correctly on GitHub.

- **Landing / Auth Screen**  
  ![Smart Expense Analyzer – Login](assets/01-login.png)

- **Dashboard Overview**  
  ![Smart Expense Analyzer – Dashboard](assets/02-dashboard.png)

- **Analytics View**  
  ![Smart Expense Analyzer – Analytics](assets/03-analytics.png)

- **Transactions Management**  
  ![Smart Expense Analyzer – Transactions](assets/04-transactions.png)

## Features

- **Authentication** – Register and login with JWT‑based auth.
- **Expense Dashboard** – Today, monthly, and yearly summaries with quick stats.
- **Analytics** – Charts and category‑wise breakdowns of spending.
- **Transactions** – Add, view, and manage transactions with categories and payment methods.
- **AI Insights** – Lightweight AI text insights on your recent transactions.

## Tech Stack

- **Frontend:** React + Vite, Axios
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB Atlas
- **Auth:** JSON Web Tokens (JWT)

## Project Structure

```bash
Smart_Expense_Analyzer/
├─ client/        # React frontend
├─ server/        # Node/Express backend
├─ ai/            # AI service (if applicable)
└─ README.md
```

## Getting Started (Local)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/Smart_Expense_Analyzer.git
cd Smart_Expense_Analyzer
```

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
PORT=4000
AI_URL=http://localhost:8000
```

Then run:

```bash
npm run dev
```

### 3. Frontend setup

In a new terminal:

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:4000
```

Then run:

```bash
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

## Deployment

- **Backend:** Deploy `server/` on Render / Railway or another Node hosting platform.  
  Set environment variables there: `MONGO_URI`, `JWT_SECRET`, `AI_URL`, `PORT`.
- **Frontend:** Deploy `client/` on Vercel or similar.  
  Set `VITE_API_URL` to your deployed backend URL.

## License

This project is for educational purposes. Add a license here if you plan to make it open source.
