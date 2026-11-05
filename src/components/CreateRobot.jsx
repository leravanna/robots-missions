import RobotForm from "./RobotForm.jsx";
export default function CreateRobot({
  form,
  onChange,
  onSave,
  onCancel,
  busy,
}) {
  return (
    <section className="panel editor">
      <h2>New robot</h2>
      <RobotForm
        form={form}
        onChange={onChange}
        onSave={onSave}
        onCancel={onCancel}
        busy={busy}
      />
    </section>
  );
}
