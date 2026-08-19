const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const Meeting = require("../src/models/Meeting");
const Message = require("../src/models/Message");

let mongoServer;

const runTests = async () => {
  console.log("Running integration test suite...");
  let passed = 0;
  let failed = 0;

  const assert = (condition, label) => {
    if (condition) {
      console.log(`  ✓ ${label}`);
      passed++;
    } else {
      console.error(`  ✗ ${label}`);
      failed++;
    }
  };

  try {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Health
    const health = await request(app).get("/api/health");
    assert(health.status === 200 && health.body.status === "ok", "GET /api/health");

    // Register User 1
    const user1Data = { name: "Utkarsh Kumar", email: "utkarsh@example.com", password: "password123" };
    const reg1 = await request(app).post("/api/auth/register").send(user1Data);
    assert(reg1.status === 201 && reg1.body.token, "POST /api/auth/register creates user and returns token");
    assert(reg1.body.user.password === undefined, "Registration response omits password hash");

    // Duplicate email rejected
    const dup = await request(app).post("/api/auth/register").send(user1Data);
    assert(dup.status === 400, "Duplicate registration returns 400 Bad Request");

    // Register User 2
    const reg2 = await request(app).post("/api/auth/register").send({
      name: "Rahul Sharma",
      email: "rahul@example.com",
      password: "password123"
    });
    assert(reg2.status === 201, "Second user registered successfully");
    const user2Token = reg2.body.token;

    // Login
    const login = await request(app).post("/api/auth/login").send({
      email: "utkarsh@example.com",
      password: "password123"
    });
    assert(login.status === 200 && login.body.token, "POST /api/auth/login succeeds with valid credentials");
    const user1Token = login.body.token;

    const wrongPass = await request(app).post("/api/auth/login").send({
      email: "utkarsh@example.com",
      password: "wrong"
    });
    assert(wrongPass.status === 401, "Invalid password returns 401 Unauthorized");

    // Auth profile
    const me = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${user1Token}`);
    assert(me.status === 200 && me.body.user.name === "Utkarsh Kumar", "GET /api/auth/me returns authenticated user");

    const noToken = await request(app).get("/api/auth/me");
    assert(noToken.status === 401, "Protected route without token returns 401");

    // Meeting creation
    const meetingRes = await request(app).post("/api/meetings").set("Authorization", `Bearer ${user1Token}`);
    assert(meetingRes.status === 201 && meetingRes.body.meeting.meetingId, "POST /api/meetings generates new room");
    const meetingId = meetingRes.body.meeting.meetingId;

    // Get meeting
    const getMeetingRes = await request(app).get(`/api/meetings/${meetingId}`).set("Authorization", `Bearer ${user1Token}`);
    assert(getMeetingRes.status === 200 && getMeetingRes.body.meeting.host.name === "Utkarsh Kumar", "GET /api/meetings/:id populates host info");

    // Join meeting
    const joinRes = await request(app).post(`/api/meetings/${meetingId}/join`).set("Authorization", `Bearer ${user2Token}`);
    assert(joinRes.status === 200 && joinRes.body.meeting.participants.length === 2, "POST /api/meetings/:id/join adds participant");

    // Messages
    await Message.create({ meetingId, sender: reg1.body.user._id, message: "Hello team" });
    await Message.create({ meetingId, sender: reg2.body.user._id, message: "Hi Utkarsh" });
    const msgs = await request(app).get(`/api/meetings/${meetingId}/messages`).set("Authorization", `Bearer ${user1Token}`);
    assert(msgs.status === 200 && msgs.body.messages.length === 2, "GET /api/meetings/:id/messages fetches history");

    // Permissions: Participant cannot end meeting
    const unauthEnd = await request(app).post(`/api/meetings/${meetingId}/end`).set("Authorization", `Bearer ${user2Token}`);
    assert(unauthEnd.status === 403, "Non-host ending meeting returns 403 Forbidden");

    // Host ends meeting
    const authEnd = await request(app).post(`/api/meetings/${meetingId}/end`).set("Authorization", `Bearer ${user1Token}`);
    assert(authEnd.status === 200 && authEnd.body.meeting.status === "ended", "Host ending meeting marks status as ended");

    // Leave
    const leaveRes = await request(app).post(`/api/meetings/${meetingId}/leave`).set("Authorization", `Bearer ${user2Token}`);
    assert(leaveRes.status === 200, "POST /api/meetings/:id/leave removes participant");

    console.log(`\nAll tests completed: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error("Test error:", err);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  }
};

runTests();
