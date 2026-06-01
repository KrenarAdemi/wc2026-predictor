import { useEffect, useMemo, useState } from "react";


import Dashboard from "./pages/Dashboard";
import FixturesPage from "./pages/FixturesPage";
import StandingsPage from "./pages/StandingsPage";
import NationsPage from "./pages/NationsPage";
import MembersPage from "./pages/MembersPage";
import AdminPage from "./pages/AdminPage";
import RulesPage from "./pages/RulesPage";
import JoinRoomPage from "./pages/JoinRoomPage";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import { tabs } from "./data/tabs";
import { mapOfficialMatchesToFixtures } from "./utils/fixtureMapper";
import { nations } from "./data/nations";
import { calculatePoints } from "./utils/scoring";
import { isLocked } from "./utils/dateUtils";

import {
  createRoomInFirestore,
  findRoomByCode,
  addMemberToRoom,
  subscribeToRoomMembers,
  savePredictionToFirestore,
  subscribeToRoomPredictions,
  subscribeToOfficialMatches,
  subscribeToOfficialResults,
} from "./firebase/firestoreService";

const ADMIN_EMAIL = "krenar.ademi3@gmail.com";
const HOST_SESSION_STORAGE_KEY = "wc2026PredictorHostSession";
const MEMBER_SESSION_STORAGE_KEY = "wc2026PredictorMemberSession";

function saveHostSession(session) {
  localStorage.setItem(HOST_SESSION_STORAGE_KEY, JSON.stringify(session));
}

function loadHostSession() {
  const savedSession = localStorage.getItem(HOST_SESSION_STORAGE_KEY);

  if (!savedSession) return null;

  try {
    return JSON.parse(savedSession);
  } catch {
    return null;
  }
}

function saveMemberSession(session) {
  localStorage.setItem(MEMBER_SESSION_STORAGE_KEY, JSON.stringify(session));
}

function loadMemberSession() {
  const savedSession = localStorage.getItem(MEMBER_SESSION_STORAGE_KEY);

  if (!savedSession) return null;

  try {
    return JSON.parse(savedSession);
  } catch {
    return null;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [roomCode, setRoomCode] = useState("");
  const [currentRoom, setCurrentRoom] = useState(null);
  const [firebaseMessage, setFirebaseMessage] = useState("");
  const [hasEnteredApp, setHasEnteredApp] = useState(false);
  const [officialMatches, setOfficialMatches] = useState([]);
  const [officialResults, setOfficialResults] = useState({});

  const [members, setMembers] = useState([
    {
      id: "u1",
      firstName: "Krenar",
      lastName: "Ademi",
      isAdmin: true,
    },
  ]);

  const [currentMemberId, setCurrentMemberId] = useState("u1");
  const [predictions, setPredictions] = useState({});
  const [draftScores, setDraftScores] = useState({});

  const [joinForm, setJoinForm] = useState({
    firstName: "",
    lastName: "",
    roomCode: "",
  });
  useEffect(() => {
  const savedHostSession = loadHostSession();
  const savedMemberSession = loadMemberSession();

  const savedSession = savedMemberSession || savedHostSession;

  if (!savedSession) return;

  setCurrentRoom(savedSession.currentRoom || null);
  setRoomCode(savedSession.roomCode || "");

  if (savedSession.currentMemberId) {
    setCurrentMemberId(savedSession.currentMemberId);
  }

  // Always show login page first.
  setHasEnteredApp(false);
}, []);

  const currentMember = members.find((member) => member.id === currentMemberId);
  const isAdmin = currentMember?.isAdmin;

  const fixtures = useMemo(() => {
    return mapOfficialMatchesToFixtures(officialMatches, officialResults);
  }, [officialMatches, officialResults]);
  const fixturesAreLoading = officialMatches.length === 0;


  useEffect(() => {
    if (!currentRoom?.id) return;

    const unsubscribe = subscribeToRoomMembers(currentRoom.id, (firebaseMembers) => {
      const adminMember = members.find((member) => member.isAdmin);

      const updatedMembers = adminMember
        ? [adminMember, ...firebaseMembers]
        : firebaseMembers;

      setMembers(updatedMembers);
    });

    return () => unsubscribe();
  }, [currentRoom?.id]);

  useEffect(() => {
  if (!currentRoom?.id) return;

  const unsubscribe = subscribeToRoomMembers(currentRoom.id, (firebaseMembers) => {
    const adminMember = {
      id: "u1",
      firstName: "Krenar",
      lastName: "Ademi",
      isAdmin: true,
    };

    const membersWithoutAdmin = firebaseMembers.filter(
      (member) => member.id !== "u1"
    );

    setMembers([adminMember, ...membersWithoutAdmin]);
  });

  return () => unsubscribe();
}, [currentRoom?.id]);

  useEffect(() => {
    const unsubscribe = subscribeToOfficialMatches((matches) => {
      setOfficialMatches(matches);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToOfficialResults((results) => {
      setOfficialResults(results);
    });

    return () => unsubscribe();
  }, []);

  const standings = useMemo(() => {
    return members
      .map((member) => {
        let points = 0;
        let exact = 0;
        let correct = 0;
        let guesses = 0;

        fixtures.forEach((fixture) => {
          const prediction = predictions[`${member.id}:${fixture.id}`];

          if (prediction) guesses++;

          const earned = calculatePoints(prediction, fixture);
          points += earned;

          if (earned === 10) exact++;
          if ([5, 7, 10].includes(earned)) correct++;
        });

        return {
          ...member,
          points,
          exact,
          correct,
          guesses,
        };
      })
      .sort((a, b) => b.points - a.points || b.exact - a.exact);
  }, [members, fixtures, predictions]);

  async function createFirebaseRoom() {
    if (!isAdmin) return;

    try {
      const room = await createRoomInFirestore(
        "Krenar's WC2026 Room",
        "Krenar Ademi"
      );

      setCurrentRoom(room);
      setRoomCode(room.roomCode);
      setFirebaseMessage(`Room created. Code: ${room.roomCode}`);
    } catch (error) {
      console.error(error);
      setFirebaseMessage("Room could not be created. Check Firebase rules.");
    }
  }

  async function joinRoom() {
  if (!joinForm.firstName || !joinForm.lastName || !joinForm.roomCode) {
    setFirebaseMessage("Enter first name, last name, and room code.");
    return;
  }

  try {
    const room = await findRoomByCode(joinForm.roomCode);

    if (!room) {
      setFirebaseMessage("Room not found. Check the room code.");
      return;
    }

    const newMember = await addMemberToRoom(
      room.id,
      joinForm.firstName,
      joinForm.lastName
    );

    const joinedMember = {
      id: newMember.id,
      firstName: newMember.firstName,
      lastName: newMember.lastName,
      isAdmin: false,
    };

    setCurrentRoom(room);
    setRoomCode(room.roomCode);

    setMembers((currentMembers) => {
      const withoutDuplicate = currentMembers.filter(
        (member) => member.id !== joinedMember.id
      );

      return [...withoutDuplicate, joinedMember];
    });

    setCurrentMemberId(joinedMember.id);

    saveMemberSession({
      currentRoom: room,
      roomCode: room.roomCode,
      currentMemberId: joinedMember.id,
    });

    setJoinForm({
      firstName: "",
      lastName: "",
      roomCode: "",
    });

    setFirebaseMessage("Joined room successfully.");
    setActiveTab("dashboard");
    setHasEnteredApp(true);
  } catch (error) {
    console.error(error);
    setFirebaseMessage("Could not join room. Check Firebase rules.");
  }
}

  async function savePrediction(fixtureId) {
  const fixture = fixtures.find((item) => item.id === fixtureId);

  if (!fixture) {
    setFirebaseMessage("Fixture not found.");
    console.log("Fixture missing.");
    return;
  }

  if (isLocked(fixture.kickoff)) {
    setFirebaseMessage("This match is locked. You can no longer predict it.");
    console.log("Prediction locked.");
    return;
  }

  const draft = draftScores[fixtureId];

  if (!draft || draft.home === "" || draft.away === "") {
    setFirebaseMessage("Enter both home and away scores.");
    console.log("Missing score input.");
    return;
  }

  const homeScore = Number(draft.home);
  const awayScore = Number(draft.away);

  const scoresAreInvalid =
    !Number.isInteger(homeScore) ||
    !Number.isInteger(awayScore) ||
    homeScore < 0 ||
    awayScore < 0 ||
    homeScore > 20 ||
    awayScore > 20;

  if (scoresAreInvalid) {
    setFirebaseMessage("Enter valid whole-number scores between 0 and 20.");
    console.log("Invalid scores:", homeScore, awayScore);
    return;
  }

  if (!currentRoom?.id) {
    setFirebaseMessage("Create or join a room first before saving predictions.");
    console.log("No currentRoom found.");
    return;
  }

  const savedPrediction = {
  home: homeScore,
  away: awayScore,
};

const alreadyPredicted = Boolean(
  predictions[`${currentMemberId}:${fixtureId}`]
);

try {
    await savePredictionToFirestore(
      currentRoom.id,
      currentMemberId,
      fixtureId,
      savedPrediction.home,
      savedPrediction.away
    );

    setPredictions((currentPredictions) => ({
      ...currentPredictions,
      [`${currentMemberId}:${fixtureId}`]: savedPrediction,
    }));

    setFirebaseMessage(
      alreadyPredicted ? "Prediction updated." : "Prediction saved."
    );

console.log("Prediction saved to Firebase.");
  } catch (error) {
    console.error("Prediction save failed:", error);
    setFirebaseMessage("Prediction could not be saved.");
  }
}
function continueAsHost() {
  const savedHostSession = loadHostSession();

  if (savedHostSession?.currentRoom && savedHostSession?.roomCode) {
    setCurrentRoom(savedHostSession.currentRoom);
    setRoomCode(savedHostSession.roomCode);
    setCurrentMemberId("u1");
    setActiveTab("dashboard");
    setHasEnteredApp(true);

    setFirebaseMessage(
      `Welcome back, host. Current room: ${savedHostSession.roomCode}`
    );

    return;
  }

  setCurrentMemberId("u1");
  setActiveTab("admin");
  setHasEnteredApp(true);
  setFirebaseMessage("Create your room from the Admin panel.");
}

  const savedHostSession = loadHostSession();
  const savedHostRoomCode = savedHostSession?.roomCode || roomCode;
  if (!hasEnteredApp) {
    return (
      <JoinRoomPage
        joinForm={joinForm}
        setJoinForm={setJoinForm}
        joinRoom={joinRoom}
        continueAsHost={continueAsHost}
        savedRoomCode={savedHostRoomCode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <Sidebar
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAdmin={isAdmin}
            currentMember={currentMember}
            roomCode={roomCode}
            setFirebaseMessage={setFirebaseMessage}
          />

        <main>
          <Topbar
            activeTab={activeTab}
            roomCode={roomCode}
            setFirebaseMessage={setFirebaseMessage}
          />

          <div className="p-6">
            {firebaseMessage && (
              <div className="mb-5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200">
                {firebaseMessage}
              </div>
            )}

            {activeTab === "dashboard" && (
              <Dashboard
                standings={standings}
                currentMemberId={currentMemberId}
                members={members}
                fixtures={fixtures}
                predictions={predictions}
                draftScores={draftScores}
                setDraftScores={setDraftScores}
                savePrediction={savePrediction}
                fixturesAreLoading={fixturesAreLoading}
                roomCode={roomCode}
                currentRoom={currentRoom}
              />
            )}

            {activeTab === "fixtures" && (
              <FixturesPage
                fixtures={fixtures}
                predictions={predictions}
                draftScores={draftScores}
                setDraftScores={setDraftScores}
                savePrediction={savePrediction}
                currentMemberId={currentMemberId}
                fixturesAreLoading={fixturesAreLoading}
              />
            )}

            {activeTab === "members" && (
              <MembersPage
                members={members}
                currentMemberId={currentMemberId}
                joinForm={joinForm}
                setJoinForm={setJoinForm}
                joinRoom={joinRoom}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === "standings" && (
                <StandingsPage
                  standings={standings}
                  currentMemberId={currentMemberId}
                />
              )}

            {activeTab === "nations" && <NationsPage nations={nations} />}

            {activeTab === "rules" && <RulesPage />}

            {activeTab === "admin" && isAdmin && (
              <AdminPage
                createFirebaseRoom={createFirebaseRoom}
                adminEmail={ADMIN_EMAIL}
                roomCode={roomCode}
                currentRoom={currentRoom}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

