

# 🎓 Academic Agent
**The AI-Powered Intelligence Platform for Personalized Education**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org)
[![React Version](https://img.shields.io/badge/React-18.x-61DAFB.svg?logo=react&logoColor=white)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg?logo=mongodb&logoColor=white)](https://mongodb.com)
[![AI Powered](https://img.shields.io/badge/Powered_by-Gemini_AI-FFD700.svg?logo=google&logoColor=black)](https://deepmind.google/technologies/gemini/)

_Academic Agent transforms university syllabi and past exams into an interactive, predictive, and hyper-personalized **Academic Twin**—helping students master their subjects through AI-driven Mock Exams and real-time Viva Coaching._

<br/>

![Project Banner Placeholder](https://via.placeholder.com/1000x400/1A2226/EAEAEA?text=Academic+Agent+Dashboard+Preview)

</div>

---

## 🚨 The Problem

University students face massive amounts of unstructured study material, outdated evaluation methods, and high exam anxiety. They struggle to identify exactly what to study and constantly ask: *"Am I ready for the exam?"* Traditional studying lacks **predictive insights**, **real-time feedback**, and **personalized gap analysis**.

## 💡 The Solution

**Academic Agent** eliminates exam anxiety by converting static syllabi into a living, breathing **Academic Twin**. Our AI digests historical exam data (PYQs) to predict what matters most, continuously evaluates the student through dynamic Mock Exams and Voice-to-Text Viva sessions, and synthesizes performance data into actionable Intelligence Reports.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| 🧠 **Academic Twin** | A unified Knowledge Graph tracking mastery across hundreds of syllabus concepts. |
| 📈 **PYQ Engine** | Analyzes Previous Year Questions to predict high-probability exam topics. |
| 📝 **Mock Exam Generator** | Auto-generates targeted exams focusing heavily on the student's known weak areas. |
| 🎙️ **Viva Coach** | Interactive vocal practice using Speech-to-Text and AI concept evaluation. |
| 📊 **Report Architect** | Generates executive-level intelligence reports to pinpoint readiness scores. |
| 🔐 **Multi-User Auth** | JWT-secured, multi-tenant architecture allowing students to have isolated workspaces. |

---

## 🏗️ Architecture

### High-Level Workflow

```mermaid
graph LR
    A[Student] --> B{JWT Auth}
    B --> C[Workspace Dashboard]
    
    C -->|Uploads| D[(Knowledge Graph)]
    C -->|Past Exams| E[PYQ Engine]
    
    D --> F[Mock Exam Generator]
    E --> F
    
    D --> G[Viva Coach]
    
    F --> H[Performance Data]
    G --> H
    
    H --> I[Report Architect]
    I --> J((Academic Twin))
    J -.->|Feedback Loop| C
```

### The "Academic Twin" Concept

Rather than just displaying test scores, the backend builds a multi-dimensional array mapping the student's mastery across all extracted concepts. When the student takes a **Mock Exam** or completes a **Viva Session**, the twin's `readiness` score dynamically adjusts based on strict weighted algorithms.

---

## 📸 UI / UX Showcase

<div align="center">
  <!-- Replace src with your Dashboard screenshot URL -->
  <img width="1900" height="1023" alt="Screenshot 2026-06-14 at 02-57-00 Academic Agent" src="https://github.com/user-attachments/assets/76fde60d-69ea-4adc-ae8c-9299a2c19609" />
<img width="1900" height="1023" alt="Screenshot 2026-06-14 at 02-56-53 Academic Agent" src="https://github.com/user-attachments/assets/8450e787-80c0-402f-9490-d6e8b7e09e60" />
<img width="1900" height="1023" alt="Screenshot 2026-06-14 at 02-56-35 Academic Agent" src="https://github.com/user-attachments/assets/5ff8c151-0c6d-474f-b21a-50b1d3424394" />
<img width="1900" height="1023" alt="Screenshot 2026-06-14 at 02-56-26 Academic Agent" src="https://github.com/user-attachments/assets/1c96590c-9e2f-4c65-8280-a8e61cbd74b5" />
<img width="1900" height="1023" alt="Screenshot 2026-06-14 at 02-56-15 Academic Agent" src="https://github.com/user-attachments/assets/ae5495f5-fdc4-4bcb-8e63-5e444fcabec8" />
<img width="1900" height="1023" alt="Screenshot 2026-06-14 at 02-55-52 Academic Agent" src="https://github.com/user-attachments/assets/69de79d4-45ac-4cfd-af30-6f5d4de3a7f5" />
<img width="1900" height="1023" alt="Screenshot 2026-06-14 at 02-55-32 Academic Agent" src="https://github.com/user-attachments/assets/875539bf-e41e-441c-b06e-a705858f5249" />
<div align="center">
  <br/>
  <em>Next-Gen Academic Analytics Dashboard</em>
</div>

<br/>

### Core Modules

| Authentication & Setup | Subject Configuration |
| :---: | :---: |
| <img src="[https://via.placeholder.com/400x250/1E2528/EAEAEA?text=Upload+Login+Screenshot+Here](https://private-user-images.githubusercontent.com/128074372/607517665-875539bf-e41e-441c-b06e-a705858f5249.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3ODEzNzA1ODksIm5iZiI6MTc4MTM3MDI4OSwicGF0aCI6Ii8xMjgwNzQzNzIvNjA3NTE3NjY1LTg3NTUzOWJmLWU0MWUtNDQxYy1iMDZlLWE3MDU4NThmNTI0OS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYwNjEzJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MDYxM1QxNzA0NDlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT04NjBkMzY2ZjZkYTYyZjY5NjBkZmRkMjcwNzU4YTYyNTYwNTQwMzdhYzNhM2VkNjQzM2I1MGMxZWMxOTI3MmZjJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.MdqOLJeLFO1_1S9vSYrrZx3B-rvL8hmE0JeUbGE9A2M)" alt="Login" width="400"/> | <img src="https://private-user-images.githubusercontent.com/128074372/607517669-69de79d4-45ac-4cfd-af30-6f5d4de3a7f5.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3ODEzNzA1ODksIm5iZiI6MTc4MTM3MDI4OSwicGF0aCI6Ii8xMjgwNzQzNzIvNjA3NTE3NjY5LTY5ZGU3OWQ0LTQ1YWMtNGNmZC1hZjMwLTZmNWQ0ZGUzYTdmNS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYwNjEzJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MDYxM1QxNzA0NDlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1jMjkwNTc0YTQ1NWViZTZlNjBjOTQwZDQ5OWUzOWMyZDEyNjc3ZmM5MjAzZDI4ZmVmMDg1YWIwNTU1ZTNlNWVkJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.piONSCG9BxJJvaDrZfa7TbfA6-eEeB1rN1qsYg4onf0" alt="New Subject" width="400"/> |
| <i>Minimalist, secure JWT Authentication</i> | <i>Workspace generation & theme selection</i> |

| Knowledge Graph & Predictions | Analytics Health |
| :---: | :---: |
| <img src="[https://via.placeholder.com/400x250/1E2528/EAEAEA?text=Upload+Graph+Screenshot+Here](https://private-user-images.githubusercontent.com/128074372/607517675-1c96590c-9e2f-4c65-8280-a8e61cbd74b5.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3ODEzNzA1ODksIm5iZiI6MTc4MTM3MDI4OSwicGF0aCI6Ii8xMjgwNzQzNzIvNjA3NTE3Njc1LTFjOTY1OTBjLTllMmYtNGM2NS04MjgwLWE4ZTYxY2JkNzRiNS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYwNjEzJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MDYxM1QxNzA0NDlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0zNjUxZjAzZjUzMTUzOWNlZWRmMGE0MDlkY2Y5NDEwZDMwODEwNmJkMjA5YTdhYmUyMTcxZDY2NDdlYzBhZTY0JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.qmmfdfdZV03H7lPuYQ0XXxCG-zgMXBcmfqkzgPP7bAc)" alt="Knowledge Graph" width="400"/> | <img src="https://private-user-images.githubusercontent.com/128074372/607517681-8450e787-80c0-402f-9490-d6e8b7e09e60.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3ODEzNzA1ODksIm5iZiI6MTc4MTM3MDI4OSwicGF0aCI6Ii8xMjgwNzQzNzIvNjA3NTE3NjgxLTg0NTBlNzg3LTgwYzAtNDAyZi05NDkwLWQ2ZThiN2UwOWU2MC5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYwNjEzJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MDYxM1QxNzA0NDlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1jYTc2NTZkN2Q4ZDIwNmUzYTgxODdlZDZmZDBlZGY0NjNlMDk0M2Y3ODEzZmFiNTM1OTg4ZDc3NTY3Y2M0YWQ0JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.ejEACwaXAHth9vpXYLOcLy6M8ATkXJnoE2gK8z_5IUU" alt="Analytics" width="400"/> |
| <i>PYQ Engine identifying Emerging Trends</i> | <i>Graph Confidence & Extraction Metrics</i> |

---

## 🚀 Installation Guide

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas URI
- Google Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/academic-agent.git
cd academic-agent
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create your .env file
cp .env.example .env
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

The app will be running at `http://localhost:5173`.

---

## 🔑 Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/academic_agent
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_key
DEMO_MODE=true # Set to true to bypass AI rate limits during Hackathon demos
```

---

## 🌐 API Architecture

Our RESTful API uses Express routers isolated by entities.

| Route | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Issues JWT for new students |
| `/api/workspaces` | `POST` | Creates a new isolated subject workspace |
| `/api/workspaces/:id/viva/evaluate` | `POST` | Evaluates student speech against expected concepts |
| `/api/workspaces/:id/report` | `GET` | Triggers the Report Architect algorithm |

---

## 🗄️ Database Schema Overview

```mermaid
erDiagram
    USER ||--o{ WORKSPACE : owns
    WORKSPACE ||--o{ MASTERY_PROFILE : tracks
    WORKSPACE ||--o{ MOCK_EXAM : generates
    WORKSPACE ||--o{ VIVA_SESSION : records
    WORKSPACE ||--o{ REPORT_SNAPSHOT : builds

    MASTERY_PROFILE {
        Map topics
        Number totalReadiness
    }
    
    REPORT_SNAPSHOT {
        Number readiness
        Number potentialGain
        String mostLikelyGrade
    }
```

---

## 📁 Folder Structure

```text
academic-agent/
├── backend/
│   ├── config/          # Database & Env configurations
│   ├── middleware/      # JWT & Error handlers
│   ├── models/          # Mongoose Schemas (Workspace, ReportSnapshot)
│   ├── routes/          # Express Routers (auth, workspace, viva)
│   ├── services/        # AI integrations (ModelRouter)
│   └── server.js        # App entry point
└── frontend/
    ├── public/          # Favicon & Static assets
    ├── src/
    │   ├── components/  # Reusable UI (Cards, Badges)
    │   ├── context/     # React Context (Auth, Workspace)
    │   ├── views/       # Main Pages (Dashboard, ReportArchitect, VivaChat)
    │   ├── index.css    # Tailwind & Theme configuration
    │   └── main.jsx     # Vite entry point
```

---

## 🏆 Hackathon Highlights

Academic Agent was built with extreme resilience in mind:
- **Fallback Circuit Breakers**: If the LLM quota is exhausted, the `ModelRouter` instantly fails over to a mock deterministic fallback to keep the demo running seamlessly.
- **Defensive Data Parsing**: Mathematical safeguards prevent empty datasets from corrupting MongoDB with `NaN` states.
- **Glassmorphic UI**: High-end, brutalist typography blended with modern dashboard aesthetics.

---

## 🔮 Future Roadmap

- [ ] **Canvas/Blackboard Integration**: Direct ingestion of university assignments.
- [ ] **Voice Synthesis**: Give the Viva Coach a synthesized, realistic voice to speak back to the student.
- [ ] **Peer-to-Peer Matchmaking**: Connect students with inverted Academic Twins (where one is strong, the other is weak) for mutual study sessions.

---

## 🤝 Contributors

- **Your Name** - Lead Developer & Architect
- *Add team members here*

## 📜 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

<div align="center">
  <p><i>"The future of education is not mass instruction, but precise personalization."</i></p>
</div>
