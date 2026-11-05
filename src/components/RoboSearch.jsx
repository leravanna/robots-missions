export default function RoboSearch({ filters, onChange, disabled }) {
  function change(e) {
    onChange({ ...filters, [e.target.name]: e.target.value, page: 1 });
  }
  return (
    <fieldset disabled={disabled} className="search">
      <label>
        Search robots
        <input
          name="search"
          placeholder="Find a unit…"
          value={filters.search}
          onChange={change}
        />
      </label>
      <label>
        Rank
        <select name="rank" value={filters.rank} onChange={change}>
          <option value="">All ranks</option>
          {["Scout", "Guardian", "Elite"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <label>
        Power
        <select name="power" value={filters.power} onChange={change}>
          <option value="">All powers</option>
          {["Plasma", "Shield", "Laser"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <label>
        Sort
        <select name="sort" value={filters.sort} onChange={change}>
          <option value="name">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="hp">HP high–low</option>
          <option value="hp-asc">HP low–high</option>
          <option value="rank">Rank</option>
        </select>
      </label>
    </fieldset>
  );
}
