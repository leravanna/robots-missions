export default function CreateMission({ form, onChange, onCreate, busy }) {
  function change(e) {
    onChange({ ...form, [e.target.name]: e.target.value });
  }
  function submit(e) {
    e.preventDefault();
    onCreate();
  }
  return (
    <section className="panel">
      <h2>Create mission</h2>
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <label>
            Mission name
            <input
              placeholder="Mission Annihilation"
              name="name"
              value={form.name}
              onChange={change}
              required
              maxLength={80}
            />
          </label>
          <label>
            Objective
            <textarea
              placeholder="Clear the parasite-filled cave"
              name="objective"
              value={form.objective}
              onChange={change}
              required
              maxLength={240}
            />
          </label>
          <label>
            HP stakes
            <input
              type="number"
              min="1"
              max="10000"
              name="hp"
              value={form.hp}
              onChange={change}
              required
            />
          </label>
          <p className="muted">
            Success earns HP. Failure costs HP and reopens the mission.
          </p>
          <button className="primary wide">
            {busy ? "Please wait…" : "Create mission"}
          </button>
        </fieldset>
      </form>
    </section>
  );
}
