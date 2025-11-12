# 🎓 Study Buddy - AI-Powered Learning Platform

A comprehensive full-stack application that helps students study smarter with AI-generated quizzes, flashcards, study planning, and analytics tracking.

![Study Buddy](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node](https://img.shields.io/badge/Node-24.x-green)
![React](https://img.shields.io/badge/React-18-blue)

## ✨ Features

### 📝 AI Quiz Generation
- Upload PDF documents
- Auto-generate quizzes using Google Gemini AI
- Multiple difficulty levels (Easy, Medium, Hard)
- Detailed explanations for each answer
- Track quiz attempts and scores

### 🎴 Smart Flashcards
- AI-generated flashcard sets from PDFs
- Interactive flip animations
- Track study sessions automatically
- Review cards at your own pace

### 📅 Study Planner
- Create and manage study topics
- Set priorities and deadlines
- Track completion status
- Estimate study time

### 💬 AI Chat Assistant
- Get instant help with study questions
- Powered by Google Gemini AI
- Context-aware responses

### 📊 Analytics Dashboard
- Track quiz performance over time
- Monitor study time and patterns
- View learning streaks 🔥
- Performance trend charts
- Activity history

### 🔐 User Authentication
- Secure JWT-based authentication
- HTTP-only cookies for security
- Auto-login after registration
- Protected routes

## 🚀 Tech Stack

### Frontend
- **React 18** - UI Library
- **Redux Toolkit** - State Management
- **React Router v6** - Routing
- **Axios** - HTTP Client
- **Vite** - Build Tool
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime
- **Express.js** - Web Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password Hashing
- **Google Gemini AI** - AI Generation
- **Multer** - File Upload
- **PDF-Parse** - PDF Processing

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account
- Google Gemini API key

### Clone Repository
```bash
git clone https://github.com/Romantic-Runtime/study-buddy.git
cd study-buddy
```

### Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
# MONGO_URI=your_mongodb_connection_string
# GEMINI_API_KEY=your_gemini_api_key
# JWT_SECRET=your_secret_key
# CLIENT_URL=http://localhost:5173
```

### Frontend Setup
```bash
cd frontend
npm install
```

## 🎮 Running Locally

### Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:3000

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5173

## 🌐 Deployment on Vercel

### Backend Deployment

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Deploy on Vercel**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set Root Directory to `backend`
   - Add Environment Variables:
     - `MONGO_URI`
     - `GEMINI_API_KEY`
     - `JWT_SECRET`
     - `CLIENT_URL` (your frontend URL)
     - `NODE_ENV=production`
   - Click "Deploy"

3. **Copy Backend URL** (e.g., `https://your-backend.vercel.app`)

### Frontend Deployment

1. **Update API URL**
   - Edit `frontend/src/` files
   - Replace `http://localhost:3000` with your backend Vercel URL

2. **Deploy on Vercel**
   - Click "New Project"
   - Import same repository
   - Set Root Directory to `frontend`
   - Click "Deploy"

3. **Update Backend CORS**
   - Go to backend Vercel project
   - Update `CLIENT_URL` environment variable with frontend URL
   - Redeploy backend

## 📁 Project Structure

```
study-buddy/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── analytics.controller.js
│   │   ├── chat.controller.js
│   │   ├── flashcard.controller.js
│   │   ├── pdf.controller.js
│   │   ├── planner.controller.js
│   │   ├── quiz.controller.js
│   │   └── user.controller.js
│   ├── middlewares/
│   │   ├── auth.js             # JWT verification
│   │   └── validation.js       # Input validation
│   ├── models/
│   │   ├── Analytics.js
│   │   ├── Flashcard.js
│   │   ├── Quiz.js
│   │   ├── StudyTopic.js
│   │   └── User.js
│   ├── routes/
│   │   ├── analyticsRoutes.js
│   │   ├── authRoute.js
│   │   ├── chatRoutes.js
│   │   ├── flashcardRoutes.js
│   │   ├── pdfRoutes.js
│   │   ├── plannerRoutes.js
│   │   └── quizRoutes.js
│   ├── uploads/                # PDF uploads
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── seedData.js             # Database seeder
│   ├── server.js               # Entry point
│   └── vercel.json             # Vercel config
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   └── store.js        # Redux store
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── features/
│   │   │   └── authSlice.jsx   # Auth state
│   │   ├── pages/
│   │   │   ├── Analytics.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Flashcards.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Planner.jsx
│   │   │   ├── quiz.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
└── README.md
```

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=3000
NODE_ENV=production
MONGO_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://your-frontend.vercel.app
```

### Frontend
Update API base URL in all API calls to your backend Vercel URL.

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### PDF Processing
- `POST /api/pdf/getData` - Upload and extract PDF text

### Quizzes
- `POST /api/quiz/generate` - Generate quiz from text
- `GET /api/quiz` - Get all quizzes
- `GET /api/quiz/my-quizzes` - Get user's quizzes
- `GET /api/quiz/:id` - Get quiz by ID
- `POST /api/quiz/complete` - Record quiz completion

### Flashcards
- `POST /api/flashcard/generate` - Generate flashcards
- `GET /api/flashcard/my-flashcards` - Get user's flashcards
- `POST /api/flashcard/complete` - Record flashcard session

### Study Planner
- `POST /api/planner/topics` - Create study topic
- `GET /api/planner/topics` - Get user's topics
- `PUT /api/planner/topics/:id` - Update topic
- `DELETE /api/planner/topics/:id` - Delete topic

### Analytics
- `GET /api/analytics/dashboard` - Get analytics dashboard
- `POST /api/analytics/quiz-attempt` - Record quiz attempt
- `POST /api/analytics/flashcard-session` - Record flashcard session

### Chat
- `POST /api/chat/message` - Send message to AI

## 🧪 Testing

### Seed Database with Dummy Data
```bash
cd backend
node seedData.js
```

This creates:
- Test user: `nayankumar@gmail.com` / `password123`
- 3 quizzes (JavaScript, React, Python)
- 4 flashcard sets
- 7 study topics
- Complete analytics data with 5-day streak

## 🎨 Features in Detail

### Analytics Tracking
- **Automatic**: Quiz and flashcard sessions auto-tracked
- **Real-time**: Updates immediately after activities
- **Comprehensive**: Tracks time, scores, streaks, and trends
- **Visual**: Charts and graphs for easy understanding

### Security Features
- JWT tokens with HTTP-only cookies
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- XSS prevention
- Error boundaries

### Gamification
- Daily study streaks 🔥
- Achievement tracking
- Progress visualization
- Motivational feedback based on performance

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Romantic Runtime Team**
- GitHub: [@Romantic-Runtime](https://github.com/Romantic-Runtime)

## 🙏 Acknowledgments

- Google Gemini AI for quiz and flashcard generation
- MongoDB Atlas for database hosting
- Vercel for deployment platform
- React team for the amazing framework

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Made with ❤️ by Romantic Runtime**

*Happy Studying! 📚*
