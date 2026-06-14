import AdminPanel from "../components/AdminPanel";

export default function AdminPage({
  createFirebaseRoom,
  adminEmail,
  roomCode,
  currentRoom,
  fixtures = [],
  saveManualResult,
}) {
  return (
    <AdminPanel
      createFirebaseRoom={createFirebaseRoom}
      adminEmail={adminEmail}
      roomCode={roomCode}
      currentRoom={currentRoom}
      fixtures={fixtures}
      saveManualResult={saveManualResult}
    />
  );
}