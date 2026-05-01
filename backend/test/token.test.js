const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { createAccessToken } = require("../src/utils/token");

process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "test-access-secret";

test("createAccessToken signs valid JWT payload", () => {
  const token = createAccessToken({ id: "abc123", role: "member" });
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

  assert.equal(decoded.id, "abc123");
  assert.equal(decoded.role, "member");
});
