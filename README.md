<div align="center">
  
# 🌊 Sagar Trace GIS 🛰️
**Smart Identification of Marine Oil Spills & Polluting Vessels**

[![React](https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Map-199900?style=for-the-badge&logo=leaflet)](https://leafletjs.com/)
[![SIH 2026](https://img.shields.io/badge/SIH-2026-FF9900?style=for-the-badge)](https://sih.gov.in/)

*Developed for the **Smart India Hackathon (SIH) 2026** • Problem Statement: **SIH26143*** <br>
*National Technical Research Organisation (NTRO)*

</div>

---

## 🎯 The Challenge

Marine oil spills inflict severe damage on marine ecosystems, yet the polluting vessels often go undetected or unaccounted for. **Sagar Trace GIS** bridges the gap between **Satellite Remote Sensing (SAR/EO)** and **AIS (Automatic Identification System)** data to trace back the origin of a spill and algorithmically rank the most probable suspect vessels.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🗺️ **Interactive Maritime Dashboard** | A highly responsive, map-based interface built on Leaflet and OpenStreetMap. |
| 🎛️ **Dynamic Data Layering** | Toggle seamlessly between Oil Slick geometries, AIS Vessel tracks, Backward Drift simulations, and Forward Forecasts. |
| ⏪ **Lagrangian Backtracking** | Visualizes the simulated path of the oil slick *back in time* to identify its probable geographic origin based on wind and ocean currents. |
| 📊 **Automated Processing Pipeline** | Simulates the 7-stage data processing pipeline from raw satellite feed to final suspect attribution. |

---

## 🔬 Evidence-Based Vessel Ranking

Sagar Trace GIS ranks suspected vessels using a comprehensive multi-factor evidence matrix. We look at:

- 📍 **Spatial Match**: Was the vessel geographically near the origin?
- 🕐 **Time Match**: Was it present during the calculated release window?
- 🛤️ **Trajectory Match**: Does the vessel's path align with the spill's shape and drift?
- ⚓ **Behaviour Match**: Are there anomalous speed drops or unusual maneuvers?
- 📡 **AIS Integrity**: Did the vessel turn off its transponder (AIS gaps) during the event?

---

## 🛠️ Technology Stack

- **Frontend Framework:** React + Vite (for blazing fast HMR and builds)
- **Geospatial Mapping:** Leaflet, React-Leaflet
- **Styling UI/UX:** Modern Vanilla CSS (Glassmorphism, Dark Accents, Micro-Animations)
- **Deployment & Env:** Node.js

---

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/xmohit01/Sagar-Trace.git
   cd sagar-trace-gis
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **View the App:**
   Open your browser and navigate to `http://localhost:5173` to see the magic! ✨

---

<div align="center">
  <i>If you like this project, please give it a ⭐ on GitHub!</i>
</div>
