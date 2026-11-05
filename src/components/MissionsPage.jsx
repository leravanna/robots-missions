import MissionsList from "./MissionsList.jsx";
export default function MissionsPage({ loading, hasData, onCreate, ...props }) {
  return (
    <div>
      <div className="section-head">
        <div>
          <p className="eyebrow">02 / FIELD OPERATIONS</p>
          <h2>Mission command</h2>
        </div>
        <button className="primary" disabled={props.busy} onClick={onCreate}>
          + Create mission
        </button>
      </div>
      {loading && !hasData ? (
        <p>Loading missions…</p>
      ) : hasData ? (
        <MissionsList {...props} />
      ) : null}
    </div>
  );
}
