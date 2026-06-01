import MembersPanel from "../components/MembersPanel";

export default function MembersPage({
  members,
  currentMemberId,
  joinForm,
  setJoinForm,
  joinRoom,
  isAdmin,
  deleteMember,
}) {
  return (
    <MembersPanel
      members={members}
      currentMemberId={currentMemberId}
      joinForm={joinForm}
      setJoinForm={setJoinForm}
      joinRoom={joinRoom}
      isAdmin={isAdmin}
      deleteMember={deleteMember}
    />
  );
}