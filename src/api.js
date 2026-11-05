import initialRobots from "./data/robo-data.json" with { type: "json" };
import initialMissions from "./data/missions-data.json" with { type: "json" };
const ROBOTS_KEY = "robo-demo-data";
const MISSIONS_KEY = "mission-demo-data";
// Set errorChance to 0 for a predictable demo, or 1 to demonstrate errors.
export const API_CONFIG = { minDelay: 500, maxDelay: 3000, errorChance: 0.05 };
export async function fakeRequest(operation, options = {}) {
  const config = { ...API_CONFIG, ...options };
  const ms =
    Math.floor(Math.random() * (config.maxDelay - config.minDelay + 1)) +
    config.minDelay;
  await new Promise((resolve) => setTimeout(resolve, ms));
  if (Math.random() < config.errorChance)
    throw new Error("Simulated server error. Please try again.");
  // Failure is decided BEFORE the operation; failed requests never execute it.
  return operation();
}

function initializeDatabase() {
  if (!localStorage.getItem(ROBOTS_KEY)) write(ROBOTS_KEY, initialRobots);
  if (!localStorage.getItem(MISSIONS_KEY)) write(MISSIONS_KEY, initialMissions);
}
function read(key) {
  initializeDatabase();
  return JSON.parse(localStorage.getItem(key));
}
function write(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function find(items, id, kind) {
  const item = items.find((item) => item.id === Number(id));
  if (!item) throw new Error(`${kind} not found`);
  return item;
}
function text(value, label) {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`${label} is required`);
  return value.trim();
}
function hp(value, positive = false) {
  const n = Number(value);
  if (
    value === "" ||
    !Number.isInteger(n) ||
    n < (positive ? 1 : 0) ||
    n > 10000
  )
    throw new Error(
      "HP must be a whole number within the allowed range (0–10000; missions at least 1).",
    );
  return n;
}
function robotFields(data) {
  return {
    name: text(data.name, "Name"),
    rank: text(data.rank, "Rank"),
    power: text(data.power, "Power"),
    hp: hp(data.hp),
  };
}
function available(id) {
  if (
    read(MISSIONS_KEY).some(
      (m) => m.status === "launched" && m.robotId === Number(id),
    )
  )
    throw new Error("This robot is on a launched mission. Simulate it first.");
}
export async function getRobots(query = "") {
  return fakeRequest(() => {
    const q = new URLSearchParams(query);
    let items = read(ROBOTS_KEY).filter(
      (r) =>
        (!q.get("search") ||
          r.name.toLowerCase().includes(q.get("search").toLowerCase())) &&
        (!q.get("rank") || r.rank === q.get("rank")) &&
        (!q.get("power") || r.power === q.get("power")),
    );
    const sort = q.get("sort") || "name";
    items.sort((a, b) =>
      sort === "hp"
        ? b.hp - a.hp
        : sort === "hp-asc"
          ? a.hp - b.hp
          : sort === "rank"
            ? a.rank.localeCompare(b.rank)
            : sort === "name-desc"
              ? b.name.localeCompare(a.name)
              : a.name.localeCompare(b.name),
    );
    const page = Math.max(1, Math.floor(Number(q.get("page")) || 1));
    const limit = Math.max(1, Math.floor(Number(q.get("limit")) || 10));
    return {
      data: items.slice((page - 1) * limit, page * limit),
      total: items.length,
      page,
      limit,
      totalPages: Math.ceil(items.length / limit),
    };
  });
}
export async function getRobot(id) {
  return fakeRequest(() => find(read(ROBOTS_KEY), id, "Robot"));
}
export async function createRobot(data) {
  return fakeRequest(() => {
    const items = read(ROBOTS_KEY);
    const robot = {
      ...robotFields(data),
      id: Math.max(0, ...items.map((r) => r.id)) + 1,
    };
    write(ROBOTS_KEY, [...items, robot]);
    return robot;
  });
}
export async function updateRobot(id, changes) {
  return fakeRequest(() => {
    available(id);
    const items = read(ROBOTS_KEY);
    const old = find(items, id, "Robot");
    const robot = { ...robotFields({ ...old, ...changes }), id: old.id };
    write(
      ROBOTS_KEY,
      items.map((r) => (r.id === robot.id ? robot : r)),
    );
    return robot;
  });
}
export async function deleteRobot(id) {
  return fakeRequest(() => {
    const items = read(ROBOTS_KEY);
    const robot = find(items, id, "Robot");
    available(id);
    write(
      ROBOTS_KEY,
      items.filter((r) => r.id !== robot.id),
    );
    return { success: true, id: robot.id };
  });
}
export async function getMissions(query = "") {
  return fakeRequest(() => {
    const q = new URLSearchParams(query);
    return read(MISSIONS_KEY).filter(
      (m) =>
        (!q.get("search") ||
          m.name.toLowerCase().includes(q.get("search").toLowerCase())) &&
        (!q.get("status") || m.status === q.get("status")),
    );
  });
}
export async function getMission(id) {
  return fakeRequest(() => find(read(MISSIONS_KEY), id, "Mission"));
}
export async function createMission(data) {
  return fakeRequest(() => {
    const items = read(MISSIONS_KEY);
    const mission = {
      id: Math.max(Date.now(), ...items.map((m) => m.id + 1)),
      name: text(data.name, "Name"),
      objective: text(data.objective, "Objective"),
      hp: hp(data.hp, true),
      status: "open",
      robotId: null,
    };
    write(MISSIONS_KEY, [...items, mission]);
    return mission;
  });
}
export async function launchMission(missionId, robotId) {
  return fakeRequest(() => {
    const items = read(MISSIONS_KEY);
    const mission = find(items, missionId, "Mission");
    const robot = find(read(ROBOTS_KEY), robotId, "Robot");
    if (mission.status !== "open") throw new Error("Mission is not available");
    if (robot.hp <= 0) throw new Error("Repair this robot before launch");
    available(robot.id);
    const launched = { ...mission, status: "launched", robotId: robot.id };
    write(
      MISSIONS_KEY,
      items.map((m) => (m.id === mission.id ? launched : m)),
    );
    return launched;
  });
}
export async function simulateMission(missionId) {
  return fakeRequest(() => {
    const missions = read(MISSIONS_KEY),
      robots = read(ROBOTS_KEY);
    const mission = find(missions, missionId, "Mission");
    if (mission.status !== "launched")
      throw new Error("Mission has not been launched");
    const robot = find(robots, mission.robotId, "Robot");
    const success = Math.random() >= 0.5;
    const updatedMission = {
      ...mission,
      status: success ? "completed" : "open",
      robotId: success ? robot.id : null,
    };
    const updatedRobot = {
      ...robot,
      hp: success ? robot.hp + mission.hp : Math.max(0, robot.hp - mission.hp),
    };
    write(
      MISSIONS_KEY,
      missions.map((m) => (m.id === mission.id ? updatedMission : m)),
    );
    write(
      ROBOTS_KEY,
      robots.map((r) => (r.id === robot.id ? updatedRobot : r)),
    );
    return { success, mission: updatedMission, robot: updatedRobot };
  });
}
export async function resetDatabase() {
  return fakeRequest(() => {
    write(ROBOTS_KEY, initialRobots);
    write(MISSIONS_KEY, initialMissions);
    return read(ROBOTS_KEY);
  });
}
