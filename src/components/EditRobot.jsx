import RobotForm from "./RobotForm.jsx";
export default function EditRobot({
  robot,
  form,
  onChange,
  onSave,
  onCancel,
  busy,
  loading,
}) {
  if (loading && !robot) return <p>Loading robot…</p>;
  if (!robot)
    return (
      <section className="panel editor">
        <h2>Robot not found</h2>
        <button onClick={onCancel}>Back to robots</button>
      </section>
    );
  return (
    <section className="panel editor">
      <h2>Edit robot</h2>
      <RobotForm
        editing
        form={form}
        onChange={onChange}
        onSave={onSave}
        onCancel={onCancel}
        busy={busy || robot.assigned}
      />
      {robot.assigned && (
        <p className="muted">
          Simulate this robot’s active mission before editing.
        </p>
      )}
    </section>
  );
}
