export default function RobotForm({
  form,
  onChange,
  onSave,
  onCancel,
  busy,
  editing = false,
}) {
  function change(e) {
    onChange({ ...form, [e.target.name]: e.target.value });
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <fieldset disabled={busy}>
        <label>
          Name
          <input
            name="name"
            value={form.name}
            onChange={change}
            required
            maxLength={60}
          />
        </label>
        <div className="fields">
          <label>
            Rank
            <select name="rank" value={form.rank} onChange={change}>
              {["Scout", "Guardian", "Elite"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Power
            <select name="power" value={form.power} onChange={change}>
              {["Plasma", "Shield", "Laser"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            HP
            <input
              name="hp"
              type="number"
              min="0"
              max="10000"
              required
              value={form.hp}
              onChange={change}
            />
          </label>
        </div>
        <div className="actions">
          <button className="primary">
            {busy ? "Saving…" : editing ? "Save robot" : "Create robot"}
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </fieldset>
    </form>
  );
}
