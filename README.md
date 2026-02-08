# 🌤️ Weather App

A simple **React 20 + Vite** web application that displays:  

- Current weather (via [Open-Meteo API](https://open-meteo.com/))  
- Current date and time  

The app is fully **Dockerized** and runs on **port 8080** once built.

---

## Features

- Fetch live weather based on user location  
- Show current date and time  
- Built with **React 20** and **Vite** for speed and performance  
- Served via **Nginx** in Docker for production-ready deployment  

---

## Quick Start

```bash
cd weather-app
docker compose build
docker compose up -d
```
Open in your browser: http://localhost:8080
