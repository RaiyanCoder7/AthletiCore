⚡ AthletiCore

«AI-Powered Athlete Development & Management Platform built with React, TypeScript & Firebase.»

"React" (https://img.shields.io/badge/React-19-61DAFB?logo=react)
"TypeScript" (https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
"Firebase" (https://img.shields.io/badge/Firebase-Backend-FFCA28?logo=firebase)
"Vite" (https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite)
"License" (https://img.shields.io/badge/License-MIT-green)

---

🌐 Live Demo

🔗 https://athleticore-ca65a.web.app/

---

📌 Overview

AthletiCore is a modern athlete development and management platform designed to connect athletes and coaches through centralized performance data, training management, goals, analytics, and development insights.

Athletes can manage their profiles, training sessions, goals, matches, achievements, and performance history through an interactive dashboard.

Coaches can monitor athletes, review performance information, manage training activities, and gain a centralized view of athlete development.

The long-term vision of AthletiCore is to transform raw athlete data into actionable performance intelligence using AI, analytics, computer vision, and eventually wearable integrations.

«From tracking performance → to understanding performance.»

---

✨ Features

🌐 Landing Page

- Modern product landing page
- Athleticore product introduction
- Athlete, Coach & Manager positioning
- Feature highlights
- Call-to-action sections
- Login and registration navigation
- Responsive design

---

🏠 Athlete Dashboard

- Personalized athlete dashboard
- Performance summary
- Training statistics
- Recent activity
- Personal best tracking
- Achievement cards
- Weekly activity visualization
- Performance trends
- Upcoming schedule

---

👤 Athlete Profile

- Edit athlete information
- Age, height & weight
- Team & position
- Dominant foot
- Location & contact information
- Training preferences
- Personal bio
- Athlete achievements
- Match history
- Personal best information

---

📊 Analytics

- Performance trend analysis
- Training load analysis
- Skill distribution
- Recovery information
- Performance metrics
- Interactive charts
- AI-powered performance insight foundation

---

💪 Training Management

- Create and schedule training sessions
- Track training sessions
- Update training status
- Weekly training overview
- Training history
- Session duration tracking
- Training performance data

---

🎯 Goal Management

- Create personal goals
- Track goal progress
- Completion percentage
- Goal status management
- Goal history

---

📅 Calendar

- Monthly calendar
- Create events
- Edit events
- Delete events
- Upcoming events
- Training and activity scheduling

---

🏆 Achievements

- Add achievements
- Edit achievements
- Delete achievements
- Achievement types
- Achievement descriptions
- Achievement dates
- Firebase-backed persistent data

---

⚽ Match Management

- Add match records
- Edit match records
- Delete match records
- Opponent information
- Match result tracking
- Competition information
- Match dates
- Firebase-backed persistent data

---

🧑‍🏫 Coach Dashboard

AthletiCore now includes a dedicated coaching workspace for managing and monitoring athletes.

- Coach dashboard overview
- Athlete management
- Athlete search
- Athlete filtering
- Athlete performance monitoring
- Athlete-specific information
- Training management
- Team-oriented coaching workflow
- Performance analytics foundation
- Centralized athlete development data

The Coach Dashboard is designed to evolve into a complete coaching intelligence system where coaches can monitor athlete development and make data-driven decisions.

---

🔐 Authentication

- Email & Password authentication
- User registration
- Google authentication
- Secure Firebase Authentication
- User-specific profiles
- Protected application access
- Role-based authentication architecture

Supported roles:

- Athlete
- Coach
- Manager

---

🔔 Notifications

- Training reminders
- Performance update preferences
- Notification settings
- Low-fitness awareness
- User-configurable notification preferences

---

🎨 Appearance & Settings

- Profile settings
- Training preferences
- Notification preferences
- Dark theme
- Light theme
- System theme
- Persistent theme preference
- Account security settings

---

🛠 Tech Stack

Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide React
- React Router

Backend & Data

- Firebase Authentication
- Cloud Firestore
- Firebase App Check

Development

- Git
- GitHub
- VS Code

Deployment

- Firebase Hosting

---

🏗 Architecture

AthletiCore follows a modular feature-based architecture.

User
 │
 ├── Authentication
 │
 ├── Role
 │    ├── Athlete
 │    ├── Coach
 │    └── Manager
 │
 └── Dashboard
      │
      ├── Profile
      ├── Training
      ├── Goals
      ├── Calendar
      ├── Analytics
      ├── Matches
      ├── Achievements
      │
      └── Coach Workspace
           ├── Athletes
           ├── Training
           ├── Performance
           └── Team Management

---

📂 Project Structure

src/
│
├── assets/
│
├── components/
│   ├── layout/
│   └── ui/
│
├── features/
│   ├── athlete/
│   ├── coach/
│   └── auth/
│
├── hooks/
│
├── pages/
│   ├── landing/
│   ├── athlete/
│   ├── coach/
│   └── settings/
│
├── services/
│   ├── firebase/
│   └── theme/
│
├── routes/
│
└── App.tsx

«The exact folder structure may evolve as additional platform modules are introduced.»

---

📸 Screenshots

🌐 Landing Page

"Landing Page" (./screenshots/landing.png)

---

🔐 Login

"Login" (./screenshots/login.png)

---

📝 Register

"Register" (./screenshots/register.png)

---

🏠 Athlete Dashboard

"Dashboard" (./screenshots/dashboard.png)

---

👤 Athlete Profile

"Profile" (./screenshots/profile.png)

---

📊 Analytics

"Analytics" (./screenshots/analytics.png)

---

💪 Training

"Training" (./screenshots/training.png)

---

🎯 Goals

"Goals" (./screenshots/goals.png)

---

📅 Calendar

"Calendar" (./screenshots/calendar.png)

---

🧑‍🏫 Coach Dashboard

"Coach Dashboard" (./screenshots/coach-dashboard.png)

---

⚙️ Settings

"Settings" (./screenshots/settings.png)

---

🚀 Installation

Clone the repository

git clone https://github.com/RaiyanCoder7/AthletiCore.git

Go to the project folder

cd AthletiCore

Install dependencies

npm install

Create a ".env" file

VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_RECAPTCHA_SITE_KEY=YOUR_RECAPTCHA_SITE_KEY

Run the development server

npm run dev

Build for production

npm run build

---

🔒 Security

AthletiCore uses Firebase security mechanisms to protect user data.

- Firebase Authentication
- Firestore Security Rules
- Firebase App Check
- User-specific Firestore data
- Authenticated access
- Protected application routes
- Role-aware application architecture

Each athlete's personal data is isolated within their Firebase user document and associated subcollections.

---

🧠 Development Roadmap

✅ Completed

- [x] Landing Page
- [x] Firebase Authentication
- [x] Google Authentication
- [x] Athlete Dashboard
- [x] Athlete Profile
- [x] Training Management
- [x] Goal Management
- [x] Calendar
- [x] Analytics
- [x] Achievements
- [x] Match Management
- [x] Notification Preferences
- [x] Appearance / Theme System
- [x] Coach Dashboard
- [x] Coach Athlete Management
- [x] Firebase-backed athlete data

🚧 In Progress

- [ ] Complete role-based routing
- [ ] Manager Dashboard
- [ ] Advanced coach analytics
- [ ] Coach-athlete feedback workflow
- [ ] AI-powered training recommendations
- [ ] AI coach insights

🔮 Future

- [ ] Team & squad management
- [ ] Athlete recruitment / discovery
- [ ] Coach recruitment
- [ ] Training & match video analysis
- [ ] Computer vision-based performance assessment
- [ ] Injury-risk prediction
- [ ] Wearable / GPS integration
- [ ] Performance forecasting
- [ ] Automated PDF performance reports
- [ ] Sponsorship & opportunity discovery
- [ ] Training equipment marketplace
- [ ] Mobile application
- [ ] Academy & organization management

---

🎯 Vision

AthletiCore aims to build a connected athlete-development ecosystem where performance data is not just recorded but transformed into meaningful decisions.

ATHLETE DATA
     ↓
PROFILE + TRAINING + MATCHES + FITNESS
     ↓
ATHLETICORE
     ↓
ANALYTICS
     ↓
AI INTELLIGENCE
     ↓
ACTIONABLE INSIGHTS
     ↓
BETTER ATHLETE DEVELOPMENT

The long-term vision is to make performance intelligence more accessible to athletes, coaches, academies, and sporting organizations.

---

👨‍💻 Author

Md Raiyan Raza Khan

GitHub:
https://github.com/RaiyanCoder7

LinkedIn:
https://www.linkedin.com/in/mdraiyanzakhan

---

⭐ Support

If you like this project, consider giving it a ⭐ on GitHub.

It helps the project grow and motivates future development.

---

📄 License

This project is licensed under the MIT License.