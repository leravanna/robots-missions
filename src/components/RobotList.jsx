import RobotCard from "./RobotCard.jsx";

export default function RobotList({
  result,
  loading,
  error,
  onRemove,
  locked,
  missions,
  onEdit,
}) {
  if (loading) {
    return <>Loading...</>;
  }
  if (error) {
    return <>ERROR! {error}</>;
  }
  return (
    <div className="robot-grid" aria-busy={locked}>
      {!loading && !error && !result.data.length && (
        <p className="empty">No robots match these filters.</p>
      )}
      {result.data.map((robot) => (
        <RobotCard
          key={robot.id}
          robot={robot}
          busy={locked}
          assigned={missions.some(
            (m) => m.status === "launched" && m.robotId === robot.id,
          )}
          onRemove={() => onRemove(robot)}
          onEdit={() => onEdit(robot)}
        />
      ))}
    </div>
  );
}
