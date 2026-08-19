# Real-Time Meeting & Chat Platform

A real-time meeting and chat web application built with React, Node.js, Express, MongoDB, and Socket.IO.

The project enables users to create meeting rooms with unique identifiers, join active sessions, track participant presence in real time, and exchange instant messages with persistent chat history.

---

## Features

- **Authentication**: User registration and login using JWT and bcrypt password hashing.
- **Meeting Management**: Host room creation with unique 6-character codes, participant tracking, and host-controlled termination.
- **Real-Time Presence**: Instant join and leave updates via Socket.IO rooms.
- **Real-Time Chat**: Bidirectional group messaging with instant broadcast.
- **Chat History**: Messages stored in MongoDB with indexed retrieval (`{ meetingId: 1, createdAt: 1 }`).
- **Authorization**: Backend-enforced host controls preventing unauthorized session termination.

---

## Architecture

```text
React Client (Vite)
  ├── REST API (Bearer JWT) ──> Express Server ──> MongoDB (Users, Meetings, Messages)
  └── WebSockets (Socket.IO) ──> Node Server (Room Presence & Live Messaging)
```

---

## Tech Stack

- **Frontend**: React, React Router v6, Axios, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JSON Web Tokens (JWT), bcryptjs
- **Testing**: Supertest, MongoMemoryServer

---

## Project Structure

```text
real-time-meeting-platform/
├── backend/
│   ├── src/
│   │   ├── config/db.js                 # Database connection
│   │   ├── controllers/                 # Route controllers (auth, meeting, message)
│   │   ├── middleware/                  # JWT auth and error middleware
│   │   ├── models/                      # Mongoose models (User, Meeting, Message)
│   │   ├── routes/                      # API route definitions
│   │   ├── socket/socketHandler.js      # Socket.IO room and event handlers
│   │   ├── utils/                       # Helper utilities (meeting ID generator)
│   │   ├── app.js                       # Express app configuration
│   │   └── server.js                    # HTTP + Socket server entry point
│   ├── tests/runTests.js                # Integration test suite
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/                  # UI components (Navbar, ChatPanel, ParticipantList)
│   │   ├── context/AuthContext.jsx      # Authentication state provider
│   │   ├── hooks/useSocket.js           # Socket.IO connection and lifecycle hook
│   │   ├── pages/                       # Page components (Login, Register, Dashboard, MeetingRoom)
│   │   ├── services/api.js              # Axios instance with interceptors
│   │   ├── App.jsx                      # Router configuration
│   │   ├── main.jsx                     # Entry point
│   │   └── index.css                    # Styling
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## API Reference

### Auth Routes (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Authenticate user & get JWT |
| `GET` | `/api/auth/me` | Bearer | Get current user profile |

### Meeting Routes (`/api/meetings`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/meetings` | Bearer | Create a new meeting (creator becomes host) |
| `GET` | `/api/meetings/user/history` | Bearer | Get user meeting history |
| `GET` | `/api/meetings/:meetingId` | Bearer | Get meeting details and participants |
| `POST` | `/api/meetings/:meetingId/join` | Bearer | Join an active meeting |
| `POST` | `/api/meetings/:meetingId/leave` | Bearer | Leave a meeting |
| `POST` | `/api/meetings/:meetingId/end` | Bearer (Host) | End meeting for all participants |
| `GET` | `/api/meetings/:meetingId/messages`| Bearer | Get paginated chat history |

---

## Socket Events

| Event | Flow | Description |
|---|---|---|
| `joinRoom` | Client → Server | Join meeting room and register presence |
| `roomParticipants` | Server → Client | Current participant list |
| `userJoined` | Server → Room | Notify that a new user entered |
| `sendMessage` | Client → Server | Send a new message |
| `receiveMessage` | Server → Room | Broadcast message to all participants |
| `leaveRoom` | Client → Server | Leave meeting room |
| `userLeft` | Server → Room | Notify that a user left |
| `endMeeting` | Host → Server | Host ends meeting |
| `meetingEnded` | Server → Room | Notify all clients to redirect |

---

## Getting Started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## Running Tests

Run the integration test suite:

```bash
cd backend
npm test
```

---

## License

MIT
