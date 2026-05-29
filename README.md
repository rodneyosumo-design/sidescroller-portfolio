# Slum Runner - Side-scroller Game Portfolio

A premium, highly interactive portfolio website featuring a custom 2D Canvas sidescroller game, **Slum Runner**, built entirely with Vanilla HTML5, CSS3, and JavaScript.

![Slum Runner](assets/backdrop/layer3.png)

## 🎮 The Game Metaphor
"Slum Runner" represents the journey of creative resilience. The player controls a short, stylized male child with an exaggerated big head (symbolizing massive dreams and curiosity) navigating a modern African slum backdrop. The barriers in the road (police barricades and broken-down non-functional cars) represent institutional constraints and societal roadblocks that require leap-frogging and dynamic navigation to overcome.

## ✨ Features
- **Interactive Retro Arcade Cabinet Layout**: Immersive grid cabinet mockup showcasing tactile physical buttons and responsive controls.
- **Dynamic 16:9 Canvas Game Loop**: Custom gravity engine, double-jump physics, duck/slide mechanics, dust particles, and dynamic scaling/rotational animations.
- **Client-Side Web Audio API SFX**: retro synthesized arcade effects (jumps, crashes, score milestones) generated entirely programmatically with no external audio latency or dependencies.
- **Parallax Infinite Backdrop**: Multiple offset seamless horizontal layers simulating realistic evening sunset light depths.
- **Polished Portfolio Styling**: Gorgeous custom HSL palette, dark theme, smooth slide scrolling, glassmorphism card panels, and dynamic menu actions.

## 🛠️ Technology Stack
- **Core Structure**: HTML5 Semantic skeleton
- **Styling Tokens**: Vanilla CSS Custom Properties, Glassmorphism gradients
- **Client Engine**: Object-oriented JavaScript (ES6+ Modules)
- **Visuals**: AI generated high-fidelity asset textures
- **Audio Synthesizer**: Web Audio API Oscillators and Gain nodes
- **Deployment**: Git & GitHub repositories

## ⌨️ Controls
- **Jump**: `Spacebar` / `ArrowUp` / `W` / Cabinet **Button A** (Supports Double Jump)
- **Slide**: `ArrowDown` / `S` / Cabinet **Button B**
- **Sound Toggle**: Cabinet **Mute** Button

## 🚀 Running Locally
Simply spin up any static local web server inside the directory:
```bash
# Using python:
python3 -m http.server 8000

# Using Node.js (npx):
npx browser-sync start --server --files "css/*.css, js/*.js, *.html"
```
Then visit `http://localhost:8000` or `http://localhost:3000` in your web browser.

---
Crafted with ❤️ and resilience.
