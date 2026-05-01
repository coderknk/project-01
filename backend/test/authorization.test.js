const test = require("node:test");
const assert = require("node:assert/strict");
const authorize = require("../src/middleware/roleMiddleware");

test("authorize blocks non-admin users", () => {
  const middleware = authorize("admin");
  const req = { user: { role: "member" } };
  const res = {};

  middleware(req, res, (error) => {
    assert.ok(error);
    assert.equal(error.statusCode, 403);
  });
});

test("authorize allows valid admin role", () => {
  const middleware = authorize("admin");
  const req = { user: { role: "admin" } };
  const res = {};

  middleware(req, res, (error) => {
    assert.equal(error, undefined);
  });
});
