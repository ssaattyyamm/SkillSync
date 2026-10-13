# SkillSync 

> A college-exclusive networking and peer-learning platform where students discover and connect based on coding & development skills.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-4f8ef7?style=flat-square) ![JWT](https://img.shields.io/badge/Auth-JWT-green?style=flat-square) ![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

##  Features

| Feature | Description |
|---|---|
|  Auth | Register, Login, JWT-protected routes |
|  Profiles | Skills, branch, year, bio, social links |
|  CP Score | Aggregated from LeetCode + Codeforces + CodeChef |
|  Dev Score | Computed from GitHub repos, contributions, stars |
|  Badges | Beginner → Intermediate → Advanced → Expert |
|  Discover | Search + filter by skills, branch, year, college |
|  Connections | Send / Accept / Reject / Remove (LinkedIn-style) |
|  Dashboard | Leaderboards, recommendations, pending requests |

---

##  Project Structure

```
skillsync/
├── server/                    # Express.js backend
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── connectionController.js
│   │   ├── ratingController.js
│   │   ├── discoverController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT protect middleware
│   │   └── validate.js       # express-validator middleware
│   ├── models/
│   │   ├── User.js           # User schema
│   │   └── Connection.js     # Connection schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── connectionRoutes.js
│   │   ├── ratingRoutes.js
│   │   ├── discoverRoutes.js
│   │   └── dashboardRoutes.js
│   ├── utils/
│   │   ├── ratingUtils.js    # Score calculation + API fetchers
│   │   └── generateToken.js
│   ├── seed/
│   │   └── seed.js           # 8 dummy students seeder
│   ├── .env.example
│   ├── index.js
│   └── package.json
│
├── client/                    # React.js frontend
│   ├── public/index.html
│   └── src/
│       ├── components/
│       │   ├── common/
│       │   │   ├── StudentCard.js   # Reusable student card
│       │   │   └── ConnectButton.js # Smart connect button
│       │   └── layout/
│       │       └── Sidebar.js       # Navigation sidebar
│       ├── context/
│       │   └── AuthContext.js       # Global auth state
│       ├── pages/
│       │   ├── LoginPage.js
│       │   ├── RegisterPage.js
│       │   ├── DashboardPage.js     # Leaderboards + recommendations
│       │   ├── ProfilePage.js       # Full profile + scores
│       │   ├── EditProfilePage.js   # Edit + refresh scores
│       │   ├── DiscoverPage.js      # Search + filter students
│       │   ├── ConnectionsPage.js   # All accepted connections
│       │   └── RequestsPage.js      # Pending requests
│       ├── utils/
│       │   └── api.js               # Axios instance + interceptors
│       ├── App.js
│       ├── index.js
│       └── index.css               # Global design system
│
├── package.json               # Root scripts with concurrently
└── README.md
```

---

##  Database Schema

### User
```js
{
  name, email, password (hashed), college,
  branch, year, bio, profilePicture,
  skills[], interests[],
  linkedinUrl, githubUsername,
  leetcodeUsername, codeforcesUsername, codechefUsername,
  cpScore, devScore, cpBadge, devBadge,
  ratingData: {
    leetcode: { rating, problemsSolved },
    codeforces: { rating, rank },
    codechef: { rating, stars },
    github: { repos, contributions, followers, stars }
  },
  lastScoreUpdate, isActive, timestamps
}
```

### Connection
```js
{
  requester: ObjectId(User),
  recipient: ObjectId(User),
  status: 'pending' | 'accepted' | 'rejected',
  timestamps
}
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Private |

### Users
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/users/:id` | Private |
| PUT | `/api/users/profile` | Private |
| PUT | `/api/users/change-password` | Private |

### Connections
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/connections/request/:userId` | Private |
| PUT | `/api/connections/accept/:id` | Private |
| PUT | `/api/connections/reject/:id` | Private |
| DELETE | `/api/connections/:id` | Private |
| GET | `/api/connections` | Private |
| GET | `/api/connections/pending` | Private |
| GET | `/api/connections/status/:userId` | Private |

### Ratings
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/ratings/refresh` | Private |
| PUT | `/api/ratings/manual` | Private |
| GET | `/api/ratings/:userId` | Private |

### Discover
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/discover?search=&skills=&branch=&year=&sortBy=&page=` | Private |

### Dashboard
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/dashboard` | Private |

---

##  Scoring Algorithm

### CP Score (0 – 1000)
```
LeetCode:    rating/5 (max 200) + problemsSolved×0.2 (max 200)
Codeforces:  rating/4 (max 400)
CodeChef:    rating/10 (max 200)
```

| Score | Badge |
|---|---|
| 0–249 | Beginner |
| 250–499 | Intermediate |
| 500–749 | Advanced |
| 750+ | Expert |

### Dev Score (0 – 1000)
```
GitHub Repos:          repos×10 (max 300)
Contributions:         contributions×0.5 (max 400)
Followers:             followers×2 (max 150)
Stars:                 stars×5 (max 150)
```

| Score | Badge |
|---|---|
| 0–249 | Beginner Developer |
| 250–499 | Intermediate Developer |
| 500–749 | Advanced Developer |
| 750+ | Expert Developer |

---

##  Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd skillsync

# Install all dependencies
npm run install:all
```

### 2. Configure Environment
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillsync
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
# Optional: GitHub token for higher API rate limits
GITHUB_TOKEN=ghp_your_token_here
```

### 3. Seed the Database
```bash
npm run seed
```
This creates 8 dummy students with scores and connections.

**Demo accounts** (all use password `password123`):
```
arjun@nitdelhi.ac.in   → Expert CP coder (CP: 920)
priya@nitdelhi.ac.in   → Expert Developer (DEV: 890)
karan@nitdelhi.ac.in   → Backend expert
divya@nitdelhi.ac.in   → Data scientist
sneha@nitdelhi.ac.in   → ECE + Web dev
rahul@nitdelhi.ac.in   → Year 2, learning DSA
anjali@nitdelhi.ac.in  → Year 1 beginner
vikram@nitdelhi.ac.in  → Mechanical + Python
```

### 4. Run the App
```bash
# From root — runs both server and client
npm run dev
```

Or separately:
```bash
# Terminal 1
cd server && npm run dev     # → http://localhost:5000

# Terminal 2
cd client && npm start       # → http://localhost:3000
```

---

## 🎯 Score Refresh Notes

- **Rate Limited**: Scores can only be refreshed once every **30 minutes** to respect platform APIs.
- LeetCode, Codeforces, and GitHub are fetched via their **public APIs** (no API key needed for basic data).
- If APIs are unavailable or usernames are incorrect, scores default to 0.
- Use **"Refresh Scores Now"** in Edit Profile after adding your platform usernames.
- For testing, use **Manage Scores → Manual Entry** (via `/api/ratings/manual`).

---

## 🚀 Deployment

### Backend (Railway / Render)
1. Set env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`
2. Start command: `node index.js`

### Frontend (Vercel / Netlify)
1. Build: `cd client && npm run build`
2. Set: `REACT_APP_API_URL=https://your-backend.com/api`
3. Update `client/src/utils/api.js` baseURL accordingly

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Context API, Axios |
| Backend | Node.js, Express.js, MVC Architecture |
| Database | MongoDB, Mongoose ODM |
| Auth | JWT, bcryptjs |
| Styling | Custom CSS Design System (dark theme) |
| Validation | express-validator |
| External APIs | LeetCode GraphQL, Codeforces API, GitHub REST API |

---

## 📝 Interview Talking Points

- **MVC architecture** with clear separation: models, controllers, routes
- **JWT auth** with protected routes on both frontend (React Router) and backend (middleware)
- **Aggregated scoring system** fetching from 4 external APIs
- **LinkedIn-style connection system** with pending/accepted/rejected states
- **Same-college isolation**: discover only shows students from your college
- **Rate limiting** on score refresh to prevent API abuse
- **Pagination** on discover endpoint
- **Text indexing** on MongoDB for search performance

---

*Built with  for college coders | Interview-ready MERN project*


## Live Demo
https://skill-sync-sable-two.vercel.app
