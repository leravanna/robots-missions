import { NavLink, Outlet } from "react-router";
export default function Layout({
  loading,
  busy,
  locked,
  hasData,
  notice,
  error,
  mutationError,
  onReload,
  onReset,
  confirmation,
  onConfirm,
  onCancelConfirmation,
}) {
  return (
    <main>
      <header>
        <div>
          <h1>Mission control</h1>
          <p className="muted">
            Build your fleet. Choose an objective. Launch into the unknown.
          </p>
          <nav className="actions" aria-label="Main navigation">
            <NavLink to="/" end>
              Dashboard
            </NavLink>
            <NavLink to="/robots">Robots</NavLink>
            <NavLink to="/missions">Missions</NavLink>
            <NavLink to="/login">Login</NavLink>
          </nav>
        </div>
        <button disabled={locked || !hasData} onClick={onReset}>
          Reset demo
        </button>
      </header>
      <div className="feedback" aria-live="polite">
        {busy ? (
          <p>Sending request…</p>
        ) : loading ? (
          <p>Synchronizing fleet and missions…</p>
        ) : null}
        {notice && <p>{notice}</p>}
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
          <button disabled={locked} onClick={onReload}>
            Reload data
          </button>
        </div>
      )}
      {mutationError && (
        <div className="error" role="alert">
          {mutationError}
        </div>
      )}
      {confirmation && (
        <section className="panel confirmation">
          <h2>
            {confirmation.type === "reset"
              ? "Restore sample data?"
              : `Delete ${confirmation.robot.name}?`}
          </h2>
          <p>
            {confirmation.type === "reset"
              ? "All local robots and missions will be replaced."
              : "This removes the robot from your fleet."}
          </p>
          <div className="actions">
            <button disabled={locked} onClick={onConfirm}>
              Confirm
            </button>
            <button disabled={busy} onClick={onCancelConfirmation}>
              Cancel
            </button>
          </div>
        </section>
      )}
      <Outlet />
      <footer>LOCAL SIMULATION</footer>
    </main>
  );
}
