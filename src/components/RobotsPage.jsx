import RoboSearch from "./RoboSearch.jsx";
import RobotList from "./RobotList.jsx";
export default function RobotsPage({
  result,
  filters,
  onFiltersChange,
  onPageChange,
  onEdit,
  onRemove,
  missions,
  busy,
  locked,
  loading,
  error,
  onCreate,
}) {
  return (
    <section className="fleet">
      <div className="section-head">
        <div>
          <p className="eyebrow">01 / FLEET MANAGEMENT</p>
          <h2>
            Your robots <span className="muted">/ {result.total}</span>
          </h2>
        </div>
        <button className="primary" disabled={locked} onClick={onCreate}>
          + Add robot
        </button>
      </div>
      <RoboSearch
        filters={filters}
        onChange={onFiltersChange}
        disabled={busy}
      />
      <RobotList
        result={result}
        loading={loading}
        error={error}
        onRemove={onRemove}
        onEdit={onEdit}
        locked={locked}
        missions={missions}
      />
      <div className="pagination">
        <button
          disabled={busy || result.page <= 1}
          onClick={() => onPageChange(result.page - 1)}
        >
          ← Previous
        </button>
        <span>
          Page {result.page} of {result.totalPages}
        </span>
        <button
          disabled={busy || result.page >= result.totalPages}
          onClick={() => onPageChange(result.page + 1)}
        >
          Next →
        </button>
      </div>
    </section>
  );
}
