import MissionsLaunch from "./MissionsLaunch.jsx";
export default function MissionsList({
  missions,
  eligible,
  selections,
  onSelectRobot,
  status,
  onStatusChange,
  busy,
  onLaunch,
  onSimulate,
}) {
  return (
    <section className="panel">
      <div className="section-head">
        <h2>Mission queue</h2>
        <label>
          Status
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="">All missions</option>
            {["open", "launched", "completed"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      {!missions.length && (
        <p className="empty">No missions here. Create your next objective.</p>
      )}
      {missions.map((m) => (
        <article className="mission" key={m.id}>
          <div className="section-head">
            <h3>{m.name}</h3>
            <span className="badge">{m.status}</span>
          </div>
          <p>{m.objective}</p>
          <p className="muted">Stakes: {m.hp} HP</p>
          <MissionsLaunch
            mission={m}
            eligible={eligible}
            robotId={selections[m.id] || ""}
            onSelectRobot={(id) => onSelectRobot(m.id, id)}
            busy={busy}
            onLaunch={onLaunch}
            onSimulate={onSimulate}
          />
        </article>
      ))}
    </section>
  );
}
