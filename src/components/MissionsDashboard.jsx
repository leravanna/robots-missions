export default function MissionsDashboard({ stats, loading }) {
  if (loading) return <p>Loading statistics...</p>;
  return (
    <div className="stats">
      {stats.map(([n, label]) => (
        <div key={label}>
          <strong>{String(n).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
