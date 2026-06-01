import AdminPanel from "../components/AdminPanel";

export default function AdminPage({
  createFirebaseRoom,
  adminEmail,
  roomCode,
  currentRoom,
}) {
  return (
    <AdminPanel
      createFirebaseRoom={createFirebaseRoom}
      adminEmail={adminEmail}
      roomCode={roomCode}
      currentRoom={currentRoom}
    />
  );
}