# 🌿 Clean Madurai AI  
## AI-Powered Civic Engagement Platform for a Cleaner Smart City  

> Turning citizens into environmental changemakers using AI, gamification, and real-time civic intelligence.

---

# 🏆 Hackathon-Ready Innovation Project

Clean Madurai AI is a full-stack AI-powered civic engagement platform designed to solve real-world waste management challenges in Madurai through technology, accountability, and gamified participation.

---

# 📌 1. Problem Statement

Madurai’s public spaces — bus stands, markets, temples, residential wards — frequently suffer from:

- Recurring garbage accumulation  
- Lack of structured civic participation  
- No verification system for cleanup claims  
- Absence of measurable environmental impact  
- Limited student & youth engagement  

Traditional reporting systems are passive and reactive.  
There is no AI-based validation, performance tracking, or motivation model.

---

# 💡 2. Our Solution

Clean Madurai AI transforms waste management into a **data-driven, reward-based ecosystem**.

We built a platform that:

✅ Encourages students to clean and earn credits  
✅ Allows citizens to report garbage hotspots  
✅ Uses AI to verify before/after cleaning images  
✅ Calculates measurable improvement scores  
✅ Displays real-time heatmaps of waste concentration  
✅ Generates digital certificates & achievement badges  
✅ Provides live leaderboards and analytics dashboards  

This creates transparency, accountability, and motivation.

---

# 🚀 3. Core Innovations

## 🤖 AI-Based Image Verification (Gemini API)

Instead of manual verification, our system:

- Analyzes Before & After images  
- Detects garbage density changes  
- Calculates Improvement Score (0–100)  
- Generates AI feedback summary  
- Prevents fake submissions  

This ensures authenticity and measurable impact.

---

## 🎓 Student Credit System

Students:

- Upload cleaning proof (Before & After)
- Receive AI-generated improvement score
- Earn credits based on impact
- Unlock milestone badges
- Generate certificates
- Appear on leaderboard

Gamification increases long-term engagement.

---

## 🏆 Public Reward System

Citizens can:

- Report garbage hotspots
- Upload minor cleanup proofs
- Earn reward points
- Track complaint resolution status

Encourages active civic participation.

---

## 🗺️ Smart Heatmap Visualization (Google Maps API)

Real-time map showing:

- Garbage hotspots
- Cleaned zones
- High participation wards
- Environmental improvement clusters

This provides ward-level intelligence for authorities.

---

## 📊 Data-Driven Dashboard

Includes:

- Student leaderboard
- Ward performance tracking
- Cleanup frequency analytics
- Total credits distribution
- AI improvement trends

---

# 🏅 Badge Ecosystem

| Badge | Criteria | Purpose |
|-------|----------|----------|
| 🌱 Eco Starter | 100 Credits | Beginner Motivation |
| 🌿 Green Warrior | 500 Credits | Consistent Contributor |
| 🏆 Madurai Hero | 1000 Credits | Civic Champion |
| 🔥 Clean Champion | Top 3 Rank | Elite Recognition |

---

# 🛠️ 4. Tech Stack

## Frontend
- React.js  
- HTML5  
- CSS3  
- JavaScript (ES6+)  

## Backend & Infrastructure
- Firebase Authentication  
- Firebase Firestore  
- Firebase Storage  
- Firebase Hosting  

## APIs & Intelligence
- Google Gemini API (AI Analysis)  
- Google Maps API (Heatmap System)  

---

# 🗂️ 5. System Architecture Overview

```
User → React Frontend → Firebase Auth
                       ↓
                Firestore Database
                       ↓
          Gemini AI Image Processing
                       ↓
         Score Calculation & Storage
                       ↓
        Dashboard + Heatmap Rendering
```

---

# 🗄️ 6. Database Structure (Firestore)

## users
```
{
  uid,
  name,
  email,
  role (student/public/admin),
  credits,
  badge,
  ward,
  totalUploads
}
```

## submissions
```
{
  userId,
  beforeImageUrl,
  afterImageUrl,
  improvementScore,
  aiFeedback,
  status,
  timestamp,
  location (lat, lng),
  ward
}
```

## reports
```
{
  reporterId,
  imageUrl,
  location,
  ward,
  status,
  rewardPoints,
  timestamp
}
```

---

# ⚙️ 7. Installation & Setup

```bash
git clone https://github.com/yourusername/clean-madurai-ai.git
cd clean-madurai-ai
npm install
firebase login
npm start
firebase deploy
```

---

# 🔐 Environment Configuration

Create `.env` file:

```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_STORAGE_BUCKET=
REACT_APP_MESSAGING_SENDER_ID=
REACT_APP_APP_ID=

REACT_APP_GEMINI_API_KEY=
REACT_APP_GOOGLE_MAPS_API_KEY=
```

---

# 🔒 Security Model

- Firebase Authentication required  
- Firestore role-based access  
- AI verification before credit allocation  
- Protected API keys using environment variables  

---

# 📈 8. Real-World Impact

## Immediate Impact
- Increases youth civic engagement  
- Transparent waste monitoring  
- Data-backed improvement tracking  
- Accountability system for cleanliness  

## Long-Term Impact
- Smart City integration  
- Ward-level predictive analytics  
- NSS & college collaboration  
- Scalable to other cities  

---

# 🌍 9. Scalability Vision

This platform can scale to:

- All wards in Madurai  
- Entire Tamil Nadu  
- National Smart City projects  
- Municipal governance systems  

Future roadmap includes:

- Mobile app  
- AI fake-image detection  
- IoT smart bin integration  
- Sponsor-based reward marketplace  
- Predictive waste trend AI  

---

# 🌟 Vision Statement

> Clean Madurai AI envisions a future where every citizen becomes an environmental guardian,  
> powered by artificial intelligence, data transparency, and collective responsibility.

---

# 👨‍💻 Built For

Hackathons • Smart City Missions • Civic Tech Innovation • AI for Social Good

---

# 💚 Let's Build a Cleaner, Smarter Madurai
