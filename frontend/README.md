# Meeting Platform Frontend

Modern, responsive React (Vite) frontend for real-time meetings, participant presence, and live instant messaging.

## Features
- **Auth Flow**: User registration, login, JWT token persistence, and route protection
- **Meeting Dashboard**: Instant meeting creation with one-click copy and meeting ID joiner
- **Live Meeting Room**:
  - Real-time active participant list with Host badges
  - Live chat stream powered by Socket.IO
  - Full chat history loaded from MongoDB
  - Host meeting termination controls

## Setup
```bash
npm install
cp .env.example .env
npm run dev
```
