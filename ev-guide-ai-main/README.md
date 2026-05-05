<div align="center">

# ⚡ EV Guide AI

### Intelligent EV Range Prediction & Route Planning System

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Three.js](https://img.shields.io/badge/Three.js-3D_Sim-000000?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-pseudo--coders.onrender.com-blue?style=flat-square)](https://pseudo-coders.onrender.com)

*A system that doesn't just predict your range — it **learns** from every journey.*

### 🌐 [Live Demo → https://pseudo-coders.onrender.com](https://pseudo-coders.onrender.com)

[Features](#-features) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Tech Stack](#-tech-stack) · [Team](#-team)

</div>

---

## 🎯 What is EV Guide AI?

EV Guide AI is an **adaptive EV range prediction platform** that combines real-time route planning with a learning engine that improves predictions over time. Unlike static calculators, our system evolves — every trip refines its understanding of your specific vehicle, driving style, and real-world conditions.

> **After 10 trips, predictions become personal.**

### The Problem
Existing EV range tools use generic factory specifications. But real-world range depends on **your car's battery health**, **your driving style**, **weather**, and **route terrain** — factors that vary for every driver.

### Our Solution
A **Behavior + Vehicle Intelligence Store** that:
- 📊 **Stores history** — every trip is data for improvement
- 🧠 **Learns behavior** — compares predicted vs actual consumption
- 🚗 **Models vehicles** — Tesla ≠ Nexon ≠ MG ZS (each car gets its own profile)
- 🎯 **Improves predictions** — efficiency correction after every journey

---

## ✨ Features

### 🗺️ Smart Route Planning
- Real-time route calculation using OSRM
- Geocoding with OpenStreetMap Nominatim
- Battery consumption prediction per route
- Alternate route suggestions

### 🔋 Battery Intelligence
- Per-vehicle learned efficiency (adapts from trip data)
- Battery degradation tracking over time
- Weather impact on battery performance
- Color-coded reachability warnings

### 🌍 Interactive 3D Simulation
- Three.js EV car that drives along calculated routes
- Real-time battery level visualization on the car
- Weather effects (rain particles, dim lighting)
- Charging station indicators with availability status
- HUD overlay showing distance, remaining battery, and EV model

### 📊 Analytics Dashboard
- Battery drain over distance charts
- Weather impact analysis
- Historical usage patterns
- Vehicle health scoring

### 🔐 Full Authentication System
- JWT-based auth with bcrypt password hashing
- Protected routes with smart redirect-after-login
- Persistent sessions across page refreshes

### 👤 Profile & Personalization
- **Vehicle Management** — add cars from a 10-model catalog
- **Driving Modes** — Eco / Balanced / Fast (affects predictions)
- **Battery Buffer** — configurable minimum battery reserve
- **Notification Toggles** — email, push, charging alerts (persistent)

### 🗄️ Learning Engine
- Compares predicted vs actual consumption per trip
- Adjusts `learned_efficiency` with a 0.1 learning rate
- Detects battery degradation after 10+ trips
- Preference injection (mode + buffer → prediction adjustment)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           Frontend (React + Vite)            │
│              Port 8080                       │
│                                             │
│  Landing ─── Auth ─── Dashboard ─── Map     │
│                         │                   │
│              ┌──────────┼──────────┐        │
│              │          │          │        │
│          RouteForm  3D Sim   Battery/Weather │
│              │                              │
│         Analytics ─── History ─── Profile   │
└──────────────────────┬──────────────────────┘
                       │ JWT + REST
┌──────────────────────┴──────────────────────┐
│           Backend (Express + SQLite)         │
│              Port 3001                       │
│                                             │
│  Auth ─── Vehicles ─── Trips ─── Preferences│
│                          │                  │
│                   Learning Engine            │
│              (efficiency correction)         │
│                          │                  │
│                    SQLite Database           │
│              (6 tables, WAL mode)            │
└─────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/pseudo-coders/ev-guide-ai.git
cd ev-guide-ai

# 2. Install frontend dependencies
npm install --legacy-peer-deps

# 3. Install backend dependencies
cd server
npm install
cd ..

# 4. Set up environment variables
cp .env.example .env
cp server/.env.example server/.env
```

### Running Locally

You need **two terminals** — one for the backend, one for the frontend:

```bash
# Terminal 1 — Start the backend
cd server
node index.js
# ⚡ EV Guide AI Backend running on http://localhost:3001
```

```bash
# Terminal 2 — Start the frontend
npm run dev
# VITE ready on http://localhost:8080
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Quick Start

1. Click **Sign Up** → create an account
2. Go to **Profile** → add your vehicle from the catalog
3. Go to **Dashboard** → enter source, destination, select EV model
4. Click **Predict Range** → see route, battery consumption, 3D simulation
5. Check **History** → your trips are saved and persistent

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Create account |
| `POST` | `/api/auth/login` | Get JWT token |
| `GET` | `/api/auth/profile` | 🔒 User profile |

### Vehicles
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/vehicles` | 🔒 List user's vehicles |
| `POST` | `/api/vehicles` | 🔒 Add vehicle |
| `DELETE` | `/api/vehicles/:id` | 🔒 Remove vehicle |

### Trips
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/trips/history` | 🔒 Trip history |
| `POST` | `/api/trips` | 🔒 Save trip (triggers learning) |
| `PUT` | `/api/trips/:id/actual` | 🔒 Report actual consumption |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/ev-models` | EV model catalog (10 models) |
| `GET/PUT` | `/api/preferences` | 🔒 User preferences |
| `GET` | `/api/analytics/vehicle/:id` | 🔒 Vehicle performance |
| `GET` | `/api/health` | Server health check |

> 🔒 = Requires `Authorization: Bearer <token>` header

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool + dev server |
| Tailwind CSS | Styling |
| Zustand | State management (persisted) |
| React Three Fiber | 3D simulation |
| Leaflet | Interactive maps |
| Recharts | Data visualization |
| Framer Motion | Animations |
| React Router v6 | Routing + route guards |
| Axios | HTTP client |
| shadcn/ui | 50+ UI components |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| SQLite (better-sqlite3) | Embedded database |
| JWT (jsonwebtoken) | Authentication tokens |
| bcryptjs | Password hashing |
| CORS | Cross-origin requests |

### External APIs
| API | Purpose |
|---|---|
| OSRM | Route calculation |
| Nominatim | Geocoding (address → coordinates) |

---

## 📁 Project Structure

```
ev-guide-ai/
├── public/                    # Static assets
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── api/
│   │   └── services.ts        # API client (Axios)
│   ├── components/
│   │   ├── Navbar.tsx          # Navigation + user menu
│   │   ├── ProtectedRoute.tsx  # Auth route guard
│   │   ├── RouteForm.tsx       # Trip planning form
│   │   ├── BatteryCard.tsx     # Battery visualization
│   │   ├── WeatherCard.tsx     # Weather display
│   │   ├── threeD/
│   │   │   └── EVSimulation.tsx # 3D car + route sim
│   │   └── ui/                 # 50 shadcn/ui components
│   ├── pages/
│   │   ├── LandingPage.tsx     # Home / hero
│   │   ├── LoginPage.tsx       # Authentication
│   │   ├── SignupPage.tsx      # Registration
│   │   ├── Dashboard.tsx       # Main trip planner
│   │   ├── MapPage.tsx         # Leaflet map
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── ProfilePage.tsx     # Vehicles + preferences
│   │   ├── TripHistory.tsx     # Past trips
│   │   └── ...
│   ├── services/
│   │   ├── routing.ts          # OSRM integration
│   │   └── geocoding.ts        # Nominatim integration
│   ├── store/
│   │   └── appStore.ts         # Zustand state
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── App.tsx                 # Router + providers
│   └── main.tsx                # Entry point
├── server/
│   ├── index.js                # Express entry
│   ├── db.js                   # SQLite schema
│   ├── seed.js                 # EV model data
│   ├── middleware/
│   │   └── auth.js             # JWT middleware
│   ├── routes/
│   │   ├── auth.js
│   │   ├── vehicles.js
│   │   ├── evModels.js
│   │   ├── trips.js
│   │   ├── preferences.js
│   │   └── analytics.js
│   └── services/
│       └── learningEngine.js   # Efficiency correction
├── .env.example
├── .gitignore
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🧠 How the Learning Engine Works

```
1. User completes a trip
2. System records: predicted_consumption = 35%

3. User reports: actual_consumption = 40%

4. Learning Engine calculates:
   error = 40 - 35 = 5
   correction = 5 × 0.1 = 0.5
   new_efficiency = old + (0.5 × base / 100)

5. Vehicle's learned_efficiency is updated
6. Next prediction for this vehicle is more accurate

→ After 10+ trips: predictions become personalized
→ System also detects battery degradation over time
```

---

## 🗄️ Database Schema

| Table | Records | Purpose |
|---|---|---|
| `users` | User accounts | Identity + auth |
| `vehicles` | Per-user cars | Learned efficiency + degradation |
| `trips` | Trip records | Predicted + actual consumption |
| `preferences` | User settings | Driving mode, buffer, notifications |
| `ev_models` | 10 EV catalog | Factory specs (seed data) |
| `charging_history` | Charging events | Future analytics |

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Pseudo Coders** — Built for SSMRV Hackathon 2026

---

<div align="center">

⚡ *Built with passion for a greener future* ⚡

</div>
