import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Trophy,
  Users,
  Flag,
  ShieldCheck,
  KeyRound,
  Lock,
  CheckCircle2,
  Copy,
} from "lucide-react";

import { initialFixtures } from "./data/fixtures";
import { nations } from "./data/nations";
import { calculatePoints } from "./utils/scoring";
import { isLocked, formatDate } from "./utils/dateUtils";
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

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [roomCode, setRoomCode] = useState("");
  const [currentRoom, setCurrentRoom] = useState(null);
  const [firebaseMessage, setFirebaseMessage] = useState("");

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

  const currentMember = members.find((member) => member.id === currentMemberId);
  const isAdmin = currentMember?.isAdmin;

  const fixtures = useMemo(() => {
    if (!officialMatches.length) {
      return initialFixtures;
    }

    return officialMatches.map((match, index) => {
      const result = officialResults[match.id];

      const isFinished =
        match.status === "FINISHED" || result?.status === "finished";

      return {
        id: match.id,
        matchNo: index + 1,
        group: match.group || match.stage || "World Cup",
        round: match.matchday || 1,
        home: match.homeTeam || "TBD",
        away: match.awayTeam || "TBD",
        kickoff: match.utcDate,
        city: "TBD",
        status: isFinished ? "finished" : "scheduled",
        homeScore: result?.homeScore ?? match.fullTimeHome ?? null,
        awayScore: result?.awayScore ?? match.fullTimeAway ?? null,
      };
    });
  }, [officialMatches, officialResults]);

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

    const unsubscribe = subscribeToRoomPredictions(
      currentRoom.id,
      (firebasePredictions) => {
        setPredictions(firebasePredictions);
      }
    );

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
    if (!joinForm.firstName || !joinForm.lastName || !joinForm.roomCode) return;

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

      setCurrentRoom(room);
      setRoomCode(room.roomCode);

      const localMember = {
        id: newMember.id,
        firstName: newMember.firstName,
        lastName: newMember.lastName,
        isAdmin: false,
      };

      setMembers([...members, localMember]);
      setCurrentMemberId(localMember.id);

      setJoinForm({
        firstName: "",
        lastName: "",
        roomCode: "",
      });

      setFirebaseMessage("Joined room successfully.");
      setActiveTab("dashboard");
    } catch (error) {
      console.error(error);
      setFirebaseMessage("Could not join room. Check Firebase rules.");
    }
  }

  async function savePrediction(fixtureId) {
    if (!currentRoom?.id) {
      setFirebaseMessage("Create or join a room first.");
      console.log("No currentRoom found.");
      return;
    }

    const fixture = fixtures.find((item) => item.id === fixtureId);

    if (!fixture || isLocked(fixture.kickoff)) {
      console.log("Fixture missing or prediction locked.");
      return;
    }

    const draft = draftScores[fixtureId];

    if (!draft || draft.home === "" || draft.away === "") {
      console.log("Missing score input.");
      return;
    }

    try {
      await savePredictionToFirestore(
        currentRoom.id,
        currentMemberId,
        fixtureId,
        draft.home,
        draft.away
      );

      setFirebaseMessage("Prediction saved.");
      console.log("Prediction saved to Firebase.");
    } catch (error) {
      console.error("Prediction save failed:", error);
      setFirebaseMessage("Prediction could not be saved.");
    }
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Trophy },
    { id: "fixtures", label: "Fixtures", icon: CalendarDays },
    { id: "members", label: "Members", icon: Users },
    { id: "standings", label: "Standings", icon: ShieldCheck },
    { id: "nations", label: "Nations", icon: Flag },
    { id: "admin", label: "Admin", icon: KeyRound, adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-slate-700 bg-[#141a2b] p-5">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-4 w-4 rounded-full bg-[#f5d36b]" />
            <div>
              <h1 className="text-lg font-semibold tracking-wide text-[#f5d36b]">
                WC2026 Predictor
              </h1>
              <p className="text-xs text-slate-400">
                {currentMember?.firstName} {currentMember?.lastName}
              </p>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-300">
            <span>{roomCode || "No room yet"}</span>
            <Copy size={14} />
          </div>

          <nav className="grid gap-2">
            {tabs
              .filter((tab) => !tab.adminOnly || isAdmin)
              .map((tab) => {
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm ${
                      activeTab === tab.id
                        ? "border border-rose-500/50 bg-rose-500/10 text-white"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
          </nav>
        </aside>

        <main>
          <header className="flex items-center justify-between border-b border-slate-700 bg-[#111729] px-6 py-4">
            <h2 className="text-xl font-semibold capitalize">{activeTab}</h2>

            <button
              onClick={() => {
                if (roomCode) navigator.clipboard.writeText(roomCode);
              }}
              className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300"
            >
              Copy invite code
            </button>
          </header>

          <div className="p-6">
            {firebaseMessage && (
              <div className="mb-5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200">
                {firebaseMessage}
              </div>
            )}

            {activeTab === "dashboard" && (
              <div className="grid gap-6">
                <section className="grid gap-4 md:grid-cols-4">
                  <Stat
                    label="My points"
                    value={
                      standings.find((m) => m.id === currentMemberId)?.points || 0
                    }
                    color="text-[#f5b400]"
                  />

                  <Stat
                    label="Predictions made"
                    value={`${
                      standings.find((m) => m.id === currentMemberId)?.guesses || 0
                    }/${fixtures.length}`}
                    color="text-emerald-400"
                  />

                  <Stat
                    label="Members"
                    value={members.length}
                    color="text-cyan-300"
                  />

                  <Stat
                    label="Games finished"
                    value={`${
                      fixtures.filter((f) => f.status === "finished").length
                    }/${fixtures.length}`}
                    color="text-rose-400"
                  />
                </section>

                <Leaderboard
                  standings={standings}
                  currentMemberId={currentMemberId}
                />

                <MatchList
                  fixtures={fixtures}
                  predictions={predictions}
                  draftScores={draftScores}
                  setDraftScores={setDraftScores}
                  savePrediction={savePrediction}
                  currentMemberId={currentMemberId}
                />
              </div>
            )}

            {activeTab === "fixtures" && (
              <MatchList
                fixtures={fixtures}
                predictions={predictions}
                draftScores={draftScores}
                setDraftScores={setDraftScores}
                savePrediction={savePrediction}
                currentMemberId={currentMemberId}
              />
            )}

            {activeTab === "members" && (
              <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="rounded-xl border border-slate-700 bg-[#151c30] p-5">
                  <h3 className="mb-4 text-lg font-semibold">Members</h3>

                  <div className="grid gap-2">
                    {members.map((member, index) => (
                      <button
                        key={member.id}
                        onClick={() => setCurrentMemberId(member.id)}
                        className={`flex justify-between rounded-xl px-4 py-3 text-left ${
                          currentMemberId === member.id
                            ? "bg-cyan-400/15 text-cyan-200"
                            : "bg-white/5"
                        }`}
                      >
                        <span>
                          {index + 1}. {member.firstName} {member.lastName}
                        </span>

                        {member.isAdmin && (
                          <span className="text-xs text-[#f5d36b]">Admin</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700 bg-[#151c30] p-5">
                  <h3 className="mb-4 text-lg font-semibold">Join room</h3>

                  <div className="grid gap-3">
                    <input
                      className="rounded-xl border border-slate-700 bg-[#0d1324] p-3 outline-none"
                      placeholder="First name"
                      value={joinForm.firstName}
                      onChange={(e) =>
                        setJoinForm({ ...joinForm, firstName: e.target.value })
                      }
                    />

                    <input
                      className="rounded-xl border border-slate-700 bg-[#0d1324] p-3 outline-none"
                      placeholder="Last name"
                      value={joinForm.lastName}
                      onChange={(e) =>
                        setJoinForm({ ...joinForm, lastName: e.target.value })
                      }
                    />

                    <input
                      className="rounded-xl border border-slate-700 bg-[#0d1324] p-3 uppercase outline-none"
                      placeholder="Room code"
                      value={joinForm.roomCode}
                      onChange={(e) =>
                        setJoinForm({
                          ...joinForm,
                          roomCode: e.target.value.toUpperCase(),
                        })
                      }
                    />

                    <button
                      onClick={joinRoom}
                      className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950"
                    >
                      Join Room
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "standings" && (
              <Leaderboard
                standings={standings}
                currentMemberId={currentMemberId}
              />
            )}

            {activeTab === "nations" && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {nations.map((nation) => (
                  <div
                    key={nation.name}
                    className="rounded-xl border border-slate-700 bg-[#151c30] p-5"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{nation.name}</h3>
                      <span className="rounded-md bg-cyan-400/10 px-2 py-1 text-xs text-cyan-300">
                        {nation.code}
                      </span>
                    </div>

                    <p className="mb-3 text-sm text-slate-400">
                      Group {nation.group}
                    </p>

                    <p className="mb-3 text-sm leading-6 text-slate-300">
                      {nation.info}
                    </p>

                    <p className="text-sm">
                      <span className="text-[#f5d36b]">Player to watch:</span>{" "}
                      {nation.player}
                    </p>

                    <p className="mt-2 text-sm text-slate-400">{nation.fact}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "admin" && isAdmin && (
              <div className="rounded-xl border border-slate-700 bg-[#151c30] p-5">
                <h3 className="mb-2 text-lg font-semibold">Admin Panel</h3>

                <p className="text-sm text-slate-400">
                  Admin is only for creating rooms. Results update automatically
                  from the football data sync.
                </p>

                <button
                  onClick={createFirebaseRoom}
                  className="mt-4 rounded-xl bg-[#f5d36b] px-4 py-3 font-semibold text-slate-950"
                >
                  Create Firebase Room
                </button>

                <p className="mt-4 text-xs text-slate-500">
                  Admin email planned for final protection: {ADMIN_EMAIL}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-[#151c30] p-5">
      <p className={`text-3xl font-semibold ${color}`}>{value}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function Leaderboard({ standings, currentMemberId }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-[#151c30]">
      <div className="border-b border-slate-700 px-5 py-4">
        <h3 className="text-lg font-semibold">Leaderboard</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">Player</th>
              <th className="px-5 py-3">Pts</th>
              <th className="px-5 py-3">Correct</th>
              <th className="px-5 py-3">Exact</th>
              <th className="px-5 py-3">Guesses</th>
            </tr>
          </thead>

          <tbody>
            {standings.map((member, index) => (
              <tr
                key={member.id}
                className={`border-t border-slate-700 ${
                  member.id === currentMemberId ? "bg-cyan-400/10" : ""
                }`}
              >
                <td className="px-5 py-4 text-[#f5b400]">{index + 1}</td>

                <td className="px-5 py-4 font-medium">
                  {member.firstName} {member.lastName}
                  {member.id === currentMemberId && (
                    <span className="ml-2 rounded bg-cyan-400/20 px-2 py-1 text-xs text-cyan-300">
                      You
                    </span>
                  )}
                </td>

                <td className="px-5 py-4 text-[#f5b400]">{member.points}</td>
                <td className="px-5 py-4">{member.correct}</td>
                <td className="px-5 py-4 text-emerald-400">{member.exact}</td>
                <td className="px-5 py-4">{member.guesses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MatchList({
  fixtures,
  predictions,
  draftScores,
  setDraftScores,
  savePrediction,
  currentMemberId,
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-[#151c30]">
      <div className="border-b border-slate-700 px-5 py-4">
        <h3 className="text-lg font-semibold">Matchday — Group Stage</h3>
      </div>

      {fixtures.map((fixture) => {
        const locked = isLocked(fixture.kickoff);
        const prediction = predictions[`${currentMemberId}:${fixture.id}`];

        const draft = draftScores[fixture.id] || prediction || {
          home: "",
          away: "",
        };

        const points = calculatePoints(prediction, fixture);

        return (
          <div
            key={fixture.id}
            className="grid gap-4 border-b border-slate-700 px-5 py-5 md:grid-cols-[1fr_240px_1fr] md:items-center"
          >
            <div>
              <p className="text-xs text-slate-400">
                {fixture.group} • Match {fixture.matchNo}
              </p>
              <p className="mt-2 font-semibold">{fixture.home}</p>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-400">VS</p>
              <p className="text-xs text-cyan-300">
                {formatDate(fixture.kickoff)}
              </p>
              <p className="text-xs text-slate-500">{fixture.city}</p>

              <div className="mt-3 flex items-center justify-center gap-2">
                <input
                  disabled={locked}
                  type="number"
                  min="0"
                  value={draft.home}
                  onChange={(e) =>
                    setDraftScores({
                      ...draftScores,
                      [fixture.id]: {
                        ...draft,
                        home: e.target.value,
                      },
                    })
                  }
                  className="h-9 w-12 rounded-lg border border-slate-700 bg-[#0d1324] text-center outline-none disabled:opacity-40"
                />

                <span className="text-slate-500">-</span>

                <input
                  disabled={locked}
                  type="number"
                  min="0"
                  value={draft.away}
                  onChange={(e) =>
                    setDraftScores({
                      ...draftScores,
                      [fixture.id]: {
                        ...draft,
                        away: e.target.value,
                      },
                    })
                  }
                  className="h-9 w-12 rounded-lg border border-slate-700 bg-[#0d1324] text-center outline-none disabled:opacity-40"
                />
              </div>

              <div className="mt-3 flex justify-center gap-2">
                <button
                  disabled={locked}
                  onClick={() => savePrediction(fixture.id)}
                  className="flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-2 text-xs disabled:opacity-40"
                >
                  {locked ? <Lock size={12} /> : <CheckCircle2 size={12} />}
                  Predict
                </button>
              </div>

              {fixture.status === "finished" && (
                <p className="mt-2 text-xs text-emerald-400">
                  Final {fixture.homeScore}-{fixture.awayScore} • {points} pts
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400">
                {locked ? "Locked" : "Open"}
              </p>
              <p className="mt-2 font-semibold">{fixture.away}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}