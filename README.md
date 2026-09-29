# Sagar Trace GIS 🌊🛰️

**Smart Identification of Marine Oil Spills & Polluting Vessels**

Sagar Trace GIS is a maritime intelligence platform designed to detect marine oil spills and attribute them to the responsible vessels. Built for the **Smart India Hackathon (SIH) 2026** (Problem Statement: SIH26143 for NTRO), this system bridges the gap between satellite remote sensing and vessel tracking.

## 🎯 The Challenge
Marine oil spills inflict severe damage on marine ecosystems, yet the polluting vessels often go undetected or unaccounted for. This project aims to leverage **Satellite Imagery (SAR/EO)** and **AIS (Automatic Identification System)** data to trace back the origin of a spill and rank the most probable suspect vessels.

## ✨ Key Features
- **Interactive Maritime Dashboard**: A highly responsive, map-based interface built on Leaflet and OpenStreetMap.
- **Data Layering**: Toggle between Oil Slick geometries, AIS Vessel tracks, Backward Drift simulations, and Forward Forecasts.
- **Lagrangian Backtracking**: Visualizes the simulated path of the oil slick back in time to identify its probable geographic origin based on wind and ocean currents.
- **Evidence-Based Vessel Ranking**: Ranks suspected vessels using a multi-factor evidence matrix:
  - 📍 **Spatial Match**: Was the vessel near the origin?
  - 🕐 **Time Match**: Was it there during the release window?
  - 🛤️ **Trajectory Match**: Does the vessel's path align with the spill?
  - ⚓ **Behaviour Match**: Are there anomalous speed drops or maneuvers?
  - 📡 **AIS Integrity**: Did the vessel turn off its transponder (AIS gaps)?
- **Automated Data Pipeline UI**: Simulates the 7-stage processing pipeline from raw satellite feed to final suspect attribution.

## 🛠️ Technology Stack
- **Frontend**: React, Vite
- **Mapping**: Leaflet, React-Leaflet
- **Styling**: Modern Vanilla CSS (Glassmorphism, Dark Accents, Animations)
- **Deployment**: Node.js environment

## 🚀 Running Locally

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd sagar-trace-gis
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---
*Developed for Smart India Hackathon 2026 | National Technical Research Organisation (NTRO)*
