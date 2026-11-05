export default function RobotCard({
  robot,
  onRemove,
  onEdit,
  visible = true,
  busy,
  assigned,
}) {
  if (!visible) return null;
  const { id, name, rank, power, hp } = robot;
  return (
    <article className="robot-card">
      <div className="card-top">
        <span className="eyebrow">UNIT / {String(id).padStart(3, "0")}</span>
        <button
          aria-label={`Delete ${name}`}
          disabled={busy || assigned}
          onClick={onRemove}
        >
          ×
        </button>
      </div>
      <img
        className="robot-image"
        src={`https://robohash.org/${id}?size=100x100`}
        alt={`${name} robot`}
        loading="lazy"
      />
      <div className="robot-header">
        <div>
          <h3>{name}</h3>
          <p>{rank}</p>
        </div>
        <span className="badge">
          {assigned ? "ON MISSION" : hp > 0 ? "ACTIVE" : "OFFLINE"}
        </span>
      </div>
      <p>
        Main Power: <strong>{power}</strong>
      </p>
      <div className="hp">
        {hp}
        <small> HP</small>
      </div>
      <div className="actions">
        <button disabled={busy || assigned} onClick={onEdit}>
          Edit robot
        </button>
      </div>
    </article>
  );
}
