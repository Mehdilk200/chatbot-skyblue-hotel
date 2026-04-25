# 🏨 Stayava - SkyBlue Hotel Operations & Booking Platform

Stayava is a cutting-edge, full-stack hotel management and booking platform. It features an **AI-powered Chatbot Assistant** built with **LangGraph** and **Gemini**, designed to handle guest inquiries, manage reservations, and streamline hotel operations.

---

## 🚀 Features

### 🤖 AI-Powered Chatbot Assistant
- **Intelligent Orchestration**: Built using **LangGraph** for stateful multi-turn conversations.
- **RAG (Retrieval-Augmented Generation)**: Uses **ChromaDB** to provide accurate information about hotel services and policies.
- **Smart Booking**: Handles reservation inquiries and processes bookings through conversational AI.
- **Service Integration**: Can search for rooms, services, and handle guest complaints.

### 🏢 Backend (FastAPI)
- **Asynchronous Operations**: High-performance API built with **FastAPI**.
- **Database**: Uses **MongoDB** (via Motor) for flexible data storage (Rooms, Users, Reservations, Complaints).
- **Authentication**: Secure **JWT-based** authentication system.
- **Admin Dashboard**: Comprehensive API endpoints for managing hotel inventory and guest requests.

### 💻 Frontend (React + Vite)
- **Modern UI**: Built with **React 19** and **Vite** for a fast, responsive experience.
- **Navigation**: Uses **React Router 7** for seamless transitions.
- **Aesthetics**: Premium design with **Lucide React** icons and smooth animations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Lucide React, CSS3, React Router |
| **Backend** | FastAPI, Uvicorn, Python 3.10+ |
| **AI/LLM** | LangChain, LangGraph, Google Gemini AI |
| **Database** | MongoDB (Motor), ChromaDB (Vector DB) |
| **Tools** | Pydantic, JWT, Bcrypt, Pytest, Docker |

---

## 📦 Project Structure

```bash
├── src/
│   ├── interface/        # React Frontend (Vite)
│   ├── main.py           # FastAPI Entry Point
│   ├── config/           # Database & Settings
│   ├── models/           # Pydantic Data Models
│   ├── routes/           # API Endpoints (Auth, Admin, Rooms, etc.)
│   ├── services/         # Business Logic & AI Orchestrator
│   ├── middleware/       # Auth & Security Middlewares
│   └── utils/            # Helper Functions
├── docker/               # Docker Configuration
├── run.py                # Backend Development Server Runner
└── requirements.txt      # Python Dependencies
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone <repo-url>
cd chatbot-skyblue-hotel
```

### 2. Backend Setup
Create a virtual environment and install dependencies:
```bash
# Create venv
python -m venv venv

# Activate venv
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r src/requirements.txt
```

### 3. Environment Variables
Create a `src/.env` file based on `src/.env.EXMPLE`:
```env
MONGODB_URI="your_mongodb_uri"
MONGODB_DB_NAME="skyblue_hotel"
GEMINI_API_KEY="your_google_gemini_api_key"
GEMINI_API_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent"
SECRET_KEY="your_jwt_secret_key"
```

### 4. Running the Backend
```bash
python run.py
```
The API will be available at `http://localhost:2330`.
Swagger documentation: `http://localhost:2330/docs`

### 5. Frontend Setup
```bash
cd src/interface
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`.

---

## 🧪 Testing
Run the backend tests using pytest:
```bash
pytest
```

## 📝 License
This project is private and intended for SkyBlue Hotel operations.
