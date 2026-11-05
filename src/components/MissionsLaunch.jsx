export default function MissionsLaunch({
  mission,
  eligible,
  robotId,
  onSelectRobot,
  busy,
  onLaunch,
  onSimulate,
}) {
  if (mission.status === "completed")
    return (
      <p className="muted">
        Mission complete. Unit {mission.robotId} returned safely.
      </p>
    );
  if (mission.status === "launched")
    return (
      <div className="actions">
        <span className="muted">Unit {mission.robotId} deployed</span>
        <button
          className="primary"
          disabled={busy}
          onClick={() => onSimulate(mission.id)}
        >
          Simulate result
        </button>
      </div>
    );

  return (
    <form
      className="launch"
      onSubmit={(e) => {
        e.preventDefault();
        if (!busy && eligible.some((robot) => String(robot.id) === robotId))
          onLaunch(mission.id);
      }}
    >
      <label className="sr-only" htmlFor={`robot-${mission.id}`}>
        Robot for {mission.name}
      </label>
      <select
        id={`robot-${mission.id}`}
        value={eligible.some((r) => String(r.id) === robotId) ? robotId : ""}
        onChange={(e) => onSelectRobot(e.target.value)}
        disabled={busy}
        required
      >
        <option value="">Select a robot</option>
        {eligible.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name} · {r.hp} HP
          </option>
        ))}
      </select>
      <button
        disabled={busy || !eligible.some((r) => String(r.id) === robotId)}
      >
        Launch →
      </button>
      {eligible.length === 0 && (
        <p className="muted">
          Create or repair a robot, or finish its active mission.
        </p>
      )}
    </form>
  );
}
