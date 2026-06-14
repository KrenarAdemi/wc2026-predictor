import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";

import { db } from "./firebaseConfig";

function normalizeName(firstName, lastName) {
  return `${firstName} ${lastName}`.trim().toLowerCase();
}

export async function createRoomInFirestore(roomName, adminName) {
  const roomCode = Math.random().toString(36).slice(2, 8).toUpperCase();

  const roomRef = await addDoc(collection(db, "rooms"), {
    roomName,
    roomCode,
    adminName,
    createdAt: serverTimestamp(),
  });

  return { id: roomRef.id, roomName, roomCode, adminName };
}

export async function findRoomByCode(roomCode) {
  const roomsRef = collection(db, "rooms");
  const roomQuery = query(
    roomsRef,
    where("roomCode", "==", roomCode.toUpperCase())
  );

  const snapshot = await getDocs(roomQuery);
  if (snapshot.empty) return null;

  const roomDoc = snapshot.docs[0];
  return { id: roomDoc.id, ...roomDoc.data() };
}

export async function findMemberByNameInRoom(roomId, normalizedFullName) {
  const membersRef = collection(db, "rooms", roomId, "members");
  const membersQuery = query(
    membersRef,
    where("normalizedFullName", "==", normalizedFullName)
  );

  const snapshot = await getDocs(membersQuery);
  if (snapshot.empty) return null;

  const memberDoc = snapshot.docs[0];

  return {
    id: memberDoc.id,
    ...memberDoc.data(),
    isAdmin: false,
  };
}

export async function addMemberToRoom(
  roomId,
  firstName,
  lastName,
  normalizedFullName
) {
  const safeNormalizedFullName =
    normalizedFullName || normalizeName(firstName, lastName);

  const memberRef = await addDoc(collection(db, "rooms", roomId, "members"), {
    firstName,
    lastName,
    normalizedFullName: safeNormalizedFullName,
    joinedAt: serverTimestamp(),
  });

  return {
    id: memberRef.id,
    firstName,
    lastName,
    normalizedFullName: safeNormalizedFullName,
    isAdmin: false,
  };
}

export function subscribeToRoomMembers(roomId, callback) {
  const membersRef = collection(db, "rooms", roomId, "members");
  const membersQuery = query(membersRef, orderBy("joinedAt", "asc"));

  return onSnapshot(membersQuery, (snapshot) => {
    const members = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      isAdmin: false,
    }));

    callback(members);
  });
}

export async function deleteMemberFromRoom(roomId, memberId) {
  const batch = writeBatch(db);

  const predictionsRef = collection(db, "rooms", roomId, "predictions");
  const predictionsQuery = query(
    predictionsRef,
    where("memberId", "==", memberId)
  );

  const predictionsSnapshot = await getDocs(predictionsQuery);

  predictionsSnapshot.docs.forEach((predictionDoc) => {
    batch.delete(predictionDoc.ref);
  });

  const memberRef = doc(db, "rooms", roomId, "members", memberId);
  batch.delete(memberRef);

  await batch.commit();

  return { deletedMemberId: memberId };
}

export async function savePredictionToFirestore(
  roomId,
  memberId,
  fixtureId,
  homeScore,
  awayScore
) {
  const predictionId = `${memberId}_${fixtureId}`;

  const predictionRef = doc(
    db,
    "rooms",
    roomId,
    "predictions",
    predictionId
  );

  await setDoc(predictionRef, {
    memberId,
    fixtureId: String(fixtureId),
    home: Number(homeScore),
    away: Number(awayScore),
    updatedAt: serverTimestamp(),
  });

  return {
    id: predictionId,
    memberId,
    fixtureId: String(fixtureId),
    home: Number(homeScore),
    away: Number(awayScore),
  };
}

export function subscribeToRoomPredictions(roomId, callback) {
  const predictionsRef = collection(db, "rooms", roomId, "predictions");

  return onSnapshot(predictionsRef, (snapshot) => {
    const predictions = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      predictions[`${data.memberId}:${data.fixtureId}`] = {
        home: data.home,
        away: data.away,
      };
    });

    callback(predictions);
  });
}

export function subscribeToOfficialMatches(callback) {
  const matchesRef = collection(db, "officialMatches");
  const matchesQuery = query(matchesRef, orderBy("utcDate", "asc"));

  return onSnapshot(matchesQuery, (snapshot) => {
    const matches = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(matches);
  });
}

export function subscribeToOfficialResults(callback) {
  const resultsRef = collection(db, "officialResults");

  return onSnapshot(resultsRef, (snapshot) => {
    const results = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      results[doc.id] = {
        status: data.status,
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        fullTimeHome: data.fullTimeHome,
        fullTimeAway: data.fullTimeAway,
        manualOverride: data.manualOverride || false,
      };
    });

    callback(results);
  });
}

export async function saveOfficialResultManually(
  fixtureId,
  homeScore,
  awayScore,
  updatedBy = "Administrator Ademi"
) {
  const safeFixtureId = String(fixtureId);
  const safeHomeScore = Number(homeScore);
  const safeAwayScore = Number(awayScore);

  await setDoc(
    doc(db, "officialResults", safeFixtureId),
    {
      apiMatchId: safeFixtureId,
      status: "finished",
      homeScore: safeHomeScore,
      awayScore: safeAwayScore,
      fullTimeHome: safeHomeScore,
      fullTimeAway: safeAwayScore,
      manualOverride: true,
      updatedBy,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await setDoc(
    doc(db, "officialMatches", safeFixtureId),
    {
      apiMatchId: safeFixtureId,
      status: "FINISHED",
      homeScore: safeHomeScore,
      awayScore: safeAwayScore,
      fullTimeHome: safeHomeScore,
      fullTimeAway: safeAwayScore,
      isFinished: true,
      manualOverride: true,
      updatedBy,
      lastSyncedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return {
    fixtureId: safeFixtureId,
    homeScore: safeHomeScore,
    awayScore: safeAwayScore,
    status: "finished",
  };
}