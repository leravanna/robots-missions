import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  matchPath,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";
import * as api from "../../api.js";

const newRobot = () => ({ name: "", rank: "Scout", power: "Plasma", hp: 100 });
const newMission = () => ({ name: "", objective: "", hp: 20 });
const ranks = ["Scout", "Guardian", "Elite"];
const powers = ["Plasma", "Shield", "Laser"];
const sorts = ["name", "name-desc", "hp", "hp-asc", "rank"];
const messageOf = (error) =>
  error instanceof Error ? error.message : String(error);

export function useMissionData() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const [params, setParams] = useSearchParams();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [robotForm, setRobotForm] = useState(newRobot);
  const [missionForm, setMissionForm] = useState(newMission);
  const [status, setStatus] = useState("");
  const [selections, setSelections] = useState({});
  const mounted = useRef(false);
  const request = useRef(null);
  const writeLock = useRef(false);

  const reload = useCallback(() => {
    if (request.current) return request.current;
    setLoading(true);
    setError("");
    // Reuse the full-fleet read already present in the original hook.
    // No second filtered read or independent dashboard fetch is needed.
    const pending = Promise.all([
      api.getRobots("limit=1000000"),
      api.getMissions(),
    ])
      .then(([all, missions]) => {
        if (all.total > all.data.length)
          throw new Error("Fleet exceeds the complete-read limit.");
        if (mounted.current) setSnapshot({ robots: all.data, missions });
        return true;
      })
      .catch((error) => {
        if (mounted.current) setError(messageOf(error));
        return false;
      })
      .finally(() => {
        request.current = null;
        if (mounted.current) setLoading(false);
      });
    request.current = pending;
    return pending;
  }, []);

  useEffect(() => {
    mounted.current = true;
    reload();
    return () => {
      mounted.current = false;
    };
  }, [reload]);

  const robots = snapshot?.robots ?? [];
  const missions = snapshot?.missions ?? [];
  const editorId = matchPath("/robots/:id/edit", pathname)?.params.id;
  const editorRobot = robots.find((robot) => String(robot.id) === editorId);
  // Initialize once per editor route/record, never overwrite a dirty draft on refresh.
  useEffect(() => {
    setRobotForm(
      editorRobot
        ? {
            name: editorRobot.name,
            rank: editorRobot.rank,
            power: editorRobot.power,
            hp: editorRobot.hp,
          }
        : newRobot(),
    );
  }, [pathname, editorRobot?.id]);
  useEffect(() => {
    setConfirmation(null);
    setMutationError("");
    if (pathname === "/missions/new") setMissionForm(newMission());
  }, [pathname]);

  const filters = useMemo(() => {
    const page = Number(params.get("page") || 1);
    return {
      search: params.get("search") || "",
      rank: ranks.includes(params.get("rank")) ? params.get("rank") : "",
      power: powers.includes(params.get("power")) ? params.get("power") : "",
      sort: sorts.includes(params.get("sort")) ? params.get("sort") : "name",
      page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    };
  }, [params]);
  const result = useMemo(() => {
    const data = robots.filter(
      (robot) =>
        robot.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        (!filters.rank || robot.rank === filters.rank) &&
        (!filters.power || robot.power === filters.power),
    );
    // Match the fake API's exact sorting, including stable ties and alphabetical rank.
    data.sort((a, b) =>
      filters.sort === "hp"
        ? b.hp - a.hp
        : filters.sort === "hp-asc"
          ? a.hp - b.hp
          : filters.sort === "rank"
            ? a.rank.localeCompare(b.rank)
            : filters.sort === "name-desc"
              ? b.name.localeCompare(a.name)
              : a.name.localeCompare(b.name),
    );
    const totalPages = Math.max(1, Math.ceil(data.length / 6));
    const page = Math.min(filters.page, totalPages);
    return {
      data: data.slice((page - 1) * 6, page * 6),
      total: data.length,
      totalPages,
      page,
    };
  }, [robots, filters]);
  useEffect(() => {
    if (
      pathname === "/robots" &&
      snapshot &&
      !loading &&
      filters.page !== result.page
    ) {
      const next = new URLSearchParams(params);
      next.set("page", String(result.page));
      setParams(next, { replace: true });
    }
  }, [
    pathname,
    snapshot,
    loading,
    filters.page,
    result.page,
    params,
    setParams,
  ]);
  function changeFilters(next) {
    const updated = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (
        value === "" ||
        (key === "page" && value === 1) ||
        (key === "sort" && value === "name")
      )
        updated.delete(key);
      else updated.set(key, String(value));
    }
    setParams(updated);
  }

  async function mutate(operation, message) {
    if (writeLock.current || request.current || !snapshot) return false;
    writeLock.current = true;
    setBusy(true);
    setNotice("");
    setMutationError("");
    try {
      let value;
      try {
        value = await operation();
      } catch (error) {
        if (mounted.current) setMutationError(messageOf(error));
        return false;
      }
      if (mounted.current) {
        setNotice(typeof message === "function" ? message(value) : message);
        await reload(); // Read errors are distinct from a successful write.
      }
      return true;
    } finally {
      writeLock.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  const locked = busy || loading;
  const eligible = robots.filter(
    (robot) =>
      robot.hp > 0 &&
      !missions.some(
        (mission) =>
          mission.status === "launched" && mission.robotId === robot.id,
      ),
  );
  const selectedRobots = Object.fromEntries(
    missions.map((mission) => [
      mission.id,
      eligible.some((robot) => String(robot.id) === selections[mission.id])
        ? selections[mission.id]
        : "",
    ]),
  );
  async function saveRobot(editing) {
    const data = { ...robotForm, hp: Number(robotForm.hp) };
    const saved = await mutate(
      () =>
        editing ? api.updateRobot(editorRobot.id, data) : api.createRobot(data),
      "Robot saved.",
    );
    if (saved) navigate(`/robots${search}`);
    return saved;
  }
  async function createMission() {
    const saved = await mutate(
      () => api.createMission({ ...missionForm, hp: Number(missionForm.hp) }),
      "Mission created.",
    );
    if (saved) {
      setMissionForm(newMission());
      navigate("/missions");
    }
    return saved;
  }
  async function confirmAction() {
    if (!confirmation) return;
    const action = confirmation;
    if (
      await mutate(
        () =>
          action.type === "reset"
            ? api.resetDatabase()
            : api.deleteRobot(action.robot.id),
        action.type === "reset" ? "Demo restored." : "Robot deleted.",
      )
    ) {
      setConfirmation(null);
      setSelections({});
    }
  }
  return {
    robots,
    missions,
    result,
    filters,
    loading,
    error,
    mutationError,
    busy,
    locked,
    notice,
    hasData: snapshot !== null,
    reload,
    changeFilters,
    changePage: (page) => changeFilters({ ...filters, page }),
    confirmation,
    requestReset: () => setConfirmation({ type: "reset" }),
    requestRemove: (robot) => setConfirmation({ type: "delete", robot }),
    cancelConfirmation: () => setConfirmation(null),
    confirmAction,
    robotForm,
    changeRobotForm: setRobotForm,
    editorRobot: editorRobot && {
      ...editorRobot,
      assigned: missions.some(
        (mission) =>
          mission.status === "launched" && mission.robotId === editorRobot.id,
      ),
    },
    openCreateRobot: () => navigate(`/robots/new${search}`),
    openEditRobot: (robot) => navigate(`/robots/${robot.id}/edit${search}`),
    openCreateMission: () => navigate("/missions/new"),
    stats: [
      [robots.length, "Fleet units"],
      [missions.filter((m) => m.status === "open").length, "Open missions"],
      [missions.filter((m) => m.status === "launched").length, "In progress"],
      [missions.filter((m) => m.status === "completed").length, "Completed"],
    ],
    createRobot: () => saveRobot(false),
    updateRobot: () => saveRobot(true),
    cancelRobot: () => navigate(`/robots${search}`),
    missionForm,
    changeMissionForm: setMissionForm,
    createMission,
    status,
    changeStatus: setStatus,
    visibleMissions: missions.filter(
      (mission) => !status || mission.status === status,
    ),
    eligible,
    selectedRobots,
    selectRobot: (missionId, robotId) =>
      setSelections((previous) => ({ ...previous, [missionId]: robotId })),
    launchMission: async (missionId) => {
      const robot = eligible.find(
        (robot) => String(robot.id) === selectedRobots[missionId],
      );
      if (!robot) return false;
      const saved = await mutate(
        () => api.launchMission(missionId, robot.id),
        "Robot deployed. Simulate the mission to see the outcome.",
      );
      if (saved)
        setSelections((previous) => ({ ...previous, [missionId]: "" }));
      return saved;
    },
    simulateMission: (id) =>
      mutate(
        () => api.simulateMission(id),
        (result) =>
          result.success
            ? `Mission completed. ${result.robot.name} gained HP.`
            : `Mission failed. ${result.robot.name} lost HP; mission reopened.`,
      ),
  };
}
