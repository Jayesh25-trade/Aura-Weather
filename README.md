# Aura Weather — Immersive, Location-Aware Weather Visualizations

A single-file web app that blends **real-time weather**, **location-matched cinematic backgrounds**, and **subtle 3D UI**. It pulls **weather** from OpenWeather, finds **city-relevant videos** via Pexels (with a scoring + landmark system), and gracefully falls back to **Unsplash images**.

> ✅ Works as a **static site** — just open `index.html` locally or host on any static host (Vercel/Netlify/GitHub Pages).
>
> ✅ Time-of-day (morning/afternoon/evening/night) is computed from **the city’s timezone**, not your device.
>
> ✅ Backgrounds are **location-accurate** and **condition-aware** (e.g., “Mumbai evening skyline”, “Paris night city lights”).

---

## ✨ Features

- **Live Weather**: Current, hourly (next 12h), and daily (7-day) snapshots.
- **Cinematic Backgrounds**:
  - Pexels Video API: multi-query with **city + landmark + daypart + condition**.
  - Smart **relevance scoring** (resolution, duration, URL/title includes city/landmark/daypart).
  - Unsplash fallback image when video isn’t available.
- **3D Tilt UI**: Smooth, `requestAnimationFrame` tilt on the main card with layered depth.
- **Weather Overlays**: Subtle rain/snow visual effects.
- **Timezone-Aware Dayparts**: Morning / Afternoon / Evening / Night from city’s `timezone_offset`.
- **Metric/Imperial Units** toggle with localStorage persistence.
- **Accessible & Friendly**:
  - Respects `prefers-reduced-motion` (disables tilt/effects).
  - Keyboard-friendly search.
- **No Bundlers Needed**: Tailwind via CDN; one HTML file.

---

## 🧰 Tech Stack

- **HTML + TailwindCSS (CDN)** for UI.
- **Vanilla JavaScript** for logic & effects.
- **APIs**:
  - OpenWeather (Geocoding, One Call v2.5; and fallback to Current + 3-hourly Forecast).
  - Pexels Video API (city/landmark/daypart/condition queries).
  - Unsplash Photos API (fallback images).

---

## 📁 Project Structure

This project is intentionally minimal:


> You can rename to `index.html` and drag-drop into a browser or deploy as static.

---

## 🔑 API Keys (used directly for this demo)

> **Important:** Keys are embedded directly in the client as requested.  
> For production, you should proxy these calls through a backend or serverless function to keep keys private.

- **OpenWeather** → https://openweathermap.org/api  
- **Pexels** → https://www.pexels.com/api/  
- **Unsplash** → https://unsplash.com/developers

**Where to insert keys?**  
Open `index.html` and find:

```js
You can use my aoi keys


