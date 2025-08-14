# Intrusion Detection System

A real-time intrusion detection system with anomaly detection, built with Next.js, Express, and Socket.IO.

## Features

- Real-time network activity simulation
- Z-score based anomaly detection
- Live event streaming via WebSockets
- Interactive dashboard with charts and controls
- Responsive design with dark/light mode
- Attack scenario simulation

## Quick Start

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Architecture

- **Frontend**: Next.js 14 with React components
- **Backend**: Express server with Socket.IO for real-time communication
- **Detection**: Z-score based anomaly detection algorithm
- **Styling**: TailwindCSS with dark/light mode support
- **Charts**: Recharts for data visualization

## Project Structure

\`\`\`
src/
  server/           # Backend logic
    config/         # Configuration files
    utils/          # Helper functions
    models/         # Detection models
    simulators/     # Data generators
    services/       # Service layer
  components/       # React components
    charts/         # Chart components
    tables/         # Data tables
    controls/       # Control panels
    layout/         # Layout components
  hooks/            # Custom React hooks
  lib/              # API clients
  context/          # React contexts
\`\`\`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
# intrusion-detector
