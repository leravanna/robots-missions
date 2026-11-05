import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "./components/Layout.jsx";
import MissionsDashboard from "./components/MissionsDashboard.jsx";
import RobotsPage from "./components/RobotsPage.jsx";
import CreateRobot from "./components/CreateRobot.jsx";
import EditRobot from "./components/EditRobot.jsx";
import MissionsPage from "./components/MissionsPage.jsx";
import CreateMission from "./components/CreateMission.jsx";
import Login from "./components/Login.jsx";
import { useMissionData } from "./components/hooks/useMissionData.jsx";
import "./App.css";

// The hook owns state and operations; routed views receive controlled props.
export function MissionRoutes() {
  const data = useMissionData();
  return (
    <Routes>
      <Route
        element={
          <Layout
            loading={data.loading}
            busy={data.busy}
            locked={data.locked}
            hasData={data.hasData}
            notice={data.notice}
            error={data.error}
            mutationError={data.mutationError}
            onReload={data.reload}
            onReset={data.requestReset}
            confirmation={data.confirmation}
            onConfirm={data.confirmAction}
            onCancelConfirmation={data.cancelConfirmation}
          />
        }
      >
        <Route
          index
          element={
            data.hasData || data.loading ? (
              <MissionsDashboard
                stats={data.stats}
                loading={data.loading && !data.hasData}
              />
            ) : null
          }
        />
        <Route
          path="robots"
          element={
            <RobotsPage
              result={data.result}
              filters={data.filters}
              onFiltersChange={data.changeFilters}
              onPageChange={data.changePage}
              onEdit={data.openEditRobot}
              onCreate={data.openCreateRobot}
              onRemove={data.requestRemove}
              missions={data.missions}
              busy={data.busy}
              locked={data.locked}
              loading={data.loading && !data.hasData}
              error={!data.hasData ? data.error : ""}
            />
          }
        />
        <Route
          path="robots/new"
          element={
            <CreateRobot
              form={data.robotForm}
              onChange={data.changeRobotForm}
              onSave={data.createRobot}
              onCancel={data.cancelRobot}
              busy={data.locked || !data.hasData}
            />
          }
        />
        <Route
          path="robots/:id/edit"
          element={
            data.hasData || data.loading ? (
              <EditRobot
                robot={data.editorRobot}
                form={data.robotForm}
                onChange={data.changeRobotForm}
                onSave={data.updateRobot}
                onCancel={data.cancelRobot}
                busy={data.locked}
                loading={data.loading}
              />
            ) : null
          }
        />
        <Route
          path="missions"
          element={
            <MissionsPage
              loading={data.loading}
              hasData={data.hasData}
              missions={data.visibleMissions}
              eligible={data.eligible}
              selections={data.selectedRobots}
              status={data.status}
              onStatusChange={data.changeStatus}
              onSelectRobot={data.selectRobot}
              busy={data.locked}
              onLaunch={data.launchMission}
              onSimulate={data.simulateMission}
              onCreate={data.openCreateMission}
            />
          }
        />
        <Route
          path="missions/new"
          element={
            <CreateMission
              form={data.missionForm}
              onChange={data.changeMissionForm}
              onCreate={data.createMission}
              busy={data.locked || !data.hasData}
            />
          }
        />
        <Route path="login" element={<Login />} />
        <Route path="*" element={<h2>404 — Page not found</h2>} />
      </Route>
    </Routes>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <MissionRoutes />
    </BrowserRouter>
  );
}
