# 🛰️ ORBITAL — Space Intelligence Dashboard

> A real-time Space Situational Awareness and Satellite Intelligence platform for tracking and analyzing satellites using live orbital data.

## 🚀 Overview

ORBITAL is an interactive satellite-tracking dashboard built to visualize real-time orbital telemetry and satellite movement.

The platform uses live Two-Line Element (TLE) data to calculate satellite position, altitude, velocity, and orbital parameters directly in the browser.

## ✨ Features

- 🛰️ Real-time satellite tracking
- 🌍 Interactive world map with satellite positions
- 📍 Satellite ground-track visualization
- 📡 Live altitude and velocity telemetry
- 📊 Real-time orbital analytics
- 🔎 Satellite search using NORAD catalog data
- ⚖️ Multi-satellite comparison
- 📈 Live altitude and velocity charts
- 🎯 Primary and secondary satellite selection
- 🔄 Real-time telemetry updates
- 🧭 Orbit classification (LEO / MEO / GEO)

## 🛠️ Tech Stack

- **HTML5** — Dashboard structure
- **CSS3** — UI and responsive styling
- **JavaScript (ES6+)** — Application logic and orbital calculations
- **Leaflet.js** — Interactive satellite map
- **Chart.js** — Real-time telemetry visualization
- **satellite.js** — Orbital propagation and coordinate calculations
- **CelesTrak** — Live satellite orbital data
- **OpenStreetMap** — Map tiles

## 📡 Data & Orbital Calculations

ORBITAL retrieves current satellite orbital elements from CelesTrak.

The application uses `satellite.js` to propagate satellite orbits and calculate:

- Latitude
- Longitude
- Altitude
- Velocity
- Orbital period
- Perigee
- Apogee
- Inclination
- Orbit classification

## ⚙️ How It Works

```text
CelesTrak
    ↓
Live TLE / Orbital Data
    ↓
satellite.js
    ↓
Orbital Propagation
    ↓
Telemetry & Position
    ↓
Leaflet Map + Chart.js
    ↓
ORBITAL Dashboard
