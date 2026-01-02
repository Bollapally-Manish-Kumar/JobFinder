# JobFinder+

> 🚀 Find Every Job. Before You Miss It.

A full-stack job aggregation platform that collects jobs from Accenture, TCS, Infosys, and other top companies - all in one place.

![JobFinder+ Screenshot](screenshot.png)

## 🧠 System Architecture

```
Frontend (React + Tailwind)
        |
Backend (Node.js + Express)
        |
Database (PostgreSQL / SQLite)
        |
Job Collectors (Scrapers + APIs)
        |
AI Service (Gemini API)
```

## ✨ Features

- **Job Aggregation**: Collect jobs from multiple company career pages
- **Payment System**: ₹10/month subscription via Razorpay (UPI + Card)
- **Blur Logic**: Free users see 1 job, paid users see all
- **Resume Builder**: AI-powered LaTeX resume generator using Gemini API
- **User Authentication**: JWT-based secure auth
- **Save Jobs**: Bookmark jobs for later
- **Responsive Design**: Works on all devices

## 📁 Project Structure

```
jobfinder/
├── frontend/
│   ├── src/
│   │   ├── pages/          # React pages
│   │   ├── components/     # Reusable components
│   │   ├── hooks/          # Custom hooks & state
│   │   ├── services/       # API services
│   │   └── styles/         # Global styles
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic
│   │   ├── scrapers/       # Job scrapers
│   │   ├── middlewares/    # Auth, error handling
│   │   ├── models/         # Prisma models
│   │   └── utils/          # Helper utilities
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
│
├── .env                    # Environment variables
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Zustand (state management)
- Lucide React (icons)
- React Hot Toast

### Backend
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT Authentication
- Razorpay Payment Gateway
- Cheerio + Axios (scraping)
- Puppeteer (for JS-heavy pages)

### AI
- Google Gemini API (resume generation)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (or use SQLite for development)
- Razorpay account (for payments)
- Google AI Studio account (for Gemini API)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/jobfinder.git
cd jobfinder
```

### 2. Set up environment variables

Create a `.env` file in the root directory:

```env
# AUTH
JWT_SECRET=your_super_secret_jwt_key

# DATABASE
DATABASE_URL=postgresql://user:password@localhost:5432/jobfinder

# PAYMENTS (Get from https://dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# GEMINI API (Get from https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=AIzaSyXXXXXX

# SCRAPING
USER_AGENT=JobFinderBot/1.0

# SERVER
PORT=5000
NODE_ENV=development

# FRONTEND URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 3. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Set up database

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio
npm run db:studio
```

### 5. Seed jobs (optional)

```bash
cd backend
npm run scrape
```

### 6. Start development servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📡 API Endpoints

### Authentication
```
POST /api/auth/register    - Register new user
POST /api/auth/login       - Login user
GET  /api/auth/profile     - Get current user
PUT  /api/auth/profile     - Update profile
```

### Jobs
```
GET  /api/jobs             - Get all jobs (with blur for free users)
GET  /api/jobs/search      - Search jobs
GET  /api/jobs/:id         - Get single job
GET  /api/jobs/user/saved  - Get saved jobs
POST /api/jobs/:id/save    - Save a job
DELETE /api/jobs/:id/save  - Unsave a job
```

### Payments
```
POST /api/payments/create-order  - Create Razorpay order
POST /api/payments/verify        - Verify payment
GET  /api/payments/history       - Get payment history
GET  /api/payments/status        - Get subscription status
```

### Resume
```
POST /api/resume/generate  - Generate LaTeX resume (paid only)
```

## 💳 Payment Flow

1. User clicks "Pay ₹10" button
2. Frontend calls `/api/payments/create-order`
3. Backend creates Razorpay order
4. Razorpay checkout opens
5. User completes payment (UPI/Card)
6. Razorpay sends callback to frontend
7. Frontend calls `/api/payments/verify` with payment details
8. Backend verifies signature and updates user's `isPaid` status
9. User gets 30-day access to all features

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting (100 req/15min general, 20 req/15min auth)
- Input validation with express-validator
- Razorpay signature verification
- CORS protection
- Environment variable protection

## 🤖 Job Scraping

The platform scrapes jobs from official company career pages only:
- ✅ Accenture Careers
- ✅ TCS iBegin
- ✅ Infosys Careers
- ✅ Wipro Careers

**Note**: LinkedIn and Indeed scraping is avoided due to legal restrictions.

Run scrapers manually:
```bash
cd backend
npm run scrape
```

## 📱 Screenshots

### Home Page
- Hero section with call-to-action
- How it works explanation
- Pricing section

### Dashboard
- Job listings with search and filters
- Blur effect for locked jobs
- Save/bookmark functionality

### Payment Page
- Razorpay integration
- UPI and Card options
- Subscription status

### Resume Builder
- Job description input
- AI-generated LaTeX output
- Copy and download options

## 🚀 Deployment

### Backend (Railway/Render)
1. Push code to GitHub
2. Connect to Railway/Render
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Connect to Vercel/Netlify
3. Set `VITE_API_URL` environment variable
4. Deploy

### Database
- Use Railway PostgreSQL or Supabase for production

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📧 Support

For support, email support@jobfinder.example.com or open an issue.

---

Built with ❤️ using React, Node.js, and Tailwind CSS
