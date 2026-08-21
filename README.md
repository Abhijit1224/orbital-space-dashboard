# 🛰️ ORBITAL — Space Intelligence Dashboard

> A real-time Space Situational Awareness and Satellite Intelligence platform for tracking and analyzing satellites using live orbital data.

## 🚀 Overview

ORBITAL is an interactive satellite-tracking dashboard designed to visualize real-time orbital telemetry and satellite movement.

The platform retrieves live Two-Line Element (TLE) data and uses orbital propagation to calculate satellite position, altitude, velocity, and other orbital parameters directly in the browser.

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

- HTML5
- CSS3
- JavaScript (ES6+)
- Leaflet.js
- Chart.js
- satellite.js
- CelesTrak
- OpenStreetMap

## 📡 Data & Orbital Calculations

ORBITAL retrieves current satellite orbital elements from CelesTrak.

Using satellite.js, the application calculates:

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

## 💻 Run Locally

Clone the repository:

git clone https://github.com/Abhijit1224/orbital-space-dashboard.git

cd orbital-space-dashboard

Open the frontend folder and run index.html using a local development server such as VS Code Live Server.

## 📁 Project Structure

orbital-space-dashboard/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md

## 🎯 Future Scope

- Satellite visibility prediction
- Satellite pass prediction
- Collision-risk analysis
- Historical orbital data
- Satellite constellation analysis

## 👨‍💻 Author

Abhijit Pradhan

Built as a personal project to explore satellite tracking, orbital mechanics, real-time data visualization, and modern web development.
