# EV Guide AI — Presentation Cheat Sheet

## 🎤 Opening (30 seconds)
> "We built EV Guide AI — an intelligent EV range prediction system that **learns from every journey**. Unlike static calculators, our system adapts to your specific vehicle, your driving style, and real-world conditions."

---

## 🏗️ Architecture Explanation (2 minutes)

### Frontend (React + Vite)
- **13 pages** — Landing, Auth, Dashboard, Map, Analytics, History, Profile
- **3D simulation** — Three.js car that drives calculated routes in real-time
- **Interactive maps** — Leaflet with route overlay and charging stations
- **State management** — Zustand with persistence across sessions

### Backend (Express + SQLite)
- **15 REST API endpoints** — auth, vehicles, trips, preferences, analytics
- **6 database tables** — users, vehicles, trips, preferences, ev_models, charging_history
- **JWT authentication** — with bcrypt password hashing and route protection

### The Learning Engine (THIS IS YOUR DIFFERENTIATOR)
> "Every trip is data. When a user reports their actual battery consumption, our learning engine compares it with our prediction, calculates an error correction, and adjusts that specific vehicle's efficiency model. After 10 trips, predictions become personalized."

**Formula:**
```
error = actual - predicted
correction = error × 0.1
learned_efficiency = old + (correction × base / 100)
```

---

## 🎨 Key UI Decisions (1 minute)

1. **Glass morphism navigation** — modern, premium feel
2. **3D EV Simulation** — not just decorative; shows real route data, battery level, weather
3. **Driving mode cards (Eco/Balanced/Fast)** — one-tap preference that affects predictions
4. **Working notification toggles** — persist to database, not just UI
5. **Vehicle catalog** — real-world EV data (Tesla, Tata, MG, BYD, Hyundai, Mahindra)

---

## 🖥️ Demo Flow (3-4 minutes)

### 1. Landing Page
- Show the hero section, features, and call-to-action

### 2. Auth Flow
- Try visiting `/dashboard` without login → **redirected to login** (route protection)
- Sign up with a new account → auto-redirected to dashboard
- Show user name + avatar in navbar

### 3. Profile Setup
- Add a vehicle (Tesla Model 3) from the catalog
- Set driving mode to **Eco**
- Toggle a notification off and on → show "Preference updated" toast

### 4. Plan a Trip
- Go to Dashboard
- Enter source: **Bangalore** → select from dropdown
- Enter destination: **Chennai** → select from dropdown
- Select EV model, set battery to 80%
- Click **Predict Range**
- Show: 3D car driving the route, battery card, weather card, route summary

### 5. View Results
- Click "View on Map" → show Leaflet map with route line + charging stations
- Click "Detailed Results" → show analytics

### 6. Trip History
- Navigate to History → show the trip persisted in the database
- Mention: "This trip is now feeding our learning engine"

### 7. Learning Engine Demo (KEY MOMENT)
> "If we now report that our actual battery consumption was different from predicted, the system adjusts this vehicle's efficiency model. After 10 trips, predictions become specific to THIS car."

---

## 💪 Key Talking Points

- **Not just CRUD — an adaptation engine**
- **Vehicle-specific modeling** — Tesla ≠ Nexon ≠ MG ZS
- **10 real-world EV models** seeded with accurate specs
- **Full-stack** — React frontend + Express backend + SQLite
- **JWT auth with route protection** — production-grade security
- **3D simulation** — practical, not decorative
- **Learning rate of 0.1** — slow, stable adaptation (no wild swings)

---

## ❓ Potential Judge Questions

**Q: How does the learning engine work?**
> "We compare predicted vs actual consumption. The error is multiplied by a learning rate of 0.1 and applied to the vehicle's efficiency model. It's bounded between 50-200% of factory spec to prevent wild swings."

**Q: Why SQLite and not PostgreSQL?**
> "For hackathon speed — zero setup. But the schema uses standard SQL with foreign keys, so migrating to PostgreSQL takes under 30 minutes."

**Q: What APIs do you use?**
> "OSRM for route calculation (open-source), Nominatim for geocoding (OpenStreetMap). No paid API keys needed."

**Q: How do you handle battery degradation?**
> "After 10+ trips, if learned_efficiency consistently exceeds base_efficiency by >10%, we automatically detect and track degradation as a factor."

**Q: What's next?**
> "Fleet management, real-time OBD integration for automatic actual consumption, and a mobile app."
