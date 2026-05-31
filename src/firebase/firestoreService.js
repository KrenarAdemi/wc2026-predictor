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
} from "firebase/firestore";

import { db } from "./firebaseConfig";

export async function createRoomInFirestore(roomName, adminName) {
  const roomCode = Math.random().toString(36).slice(2, 8).toUpperCase();

  const roomRef = await addDoc(collection(db, "rooms"), {
    roomName,
    roomCode,
    adminName,
    createdAt: serverTimestamp(),
  });

  return {
    id: roomRef.id,
    roomName,
    roomCode,
    adminName,
  };
}

export async function findRoomByCode(roomCode) {
  const roomsRef = collection(db, "rooms");
  const roomQuery = query(
    roomsRef,
    where("roomCode", "==", roomCode.toUpperCase())
  );

  const snapshot = await getDocs(roomQuery);

  if (snapshot.empty) {
    return null;
  }

  const roomDoc = snapshot.docs[0];

  return {
    id: roomDoc.id,
    ...roomDoc.data(),
  };
}

export async function addMemberToRoom(roomId, firstName, lastName) {
  const memberRef = await addDoc(collection(db, "rooms", roomId, "members"), {
    firstName,
    lastName,
    joinedAt: serverTimestamp(),
  });

  return {
    id: memberRef.id,
    firstName,
    lastName,
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
    fixtureId,
    home: Number(homeScore),
    away: Number(awayScore),
    updatedAt: serverTimestamp(),
  });

  return {
    id: predictionId,
    memberId,
    fixtureId,
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

export async function saveResultToFirestore(
  roomId,
  fixtureId,
  homeScore,
  awayScore,
  updatedBy = "admin"
) {
  const resultRef = doc(db, "rooms", roomId, "results", fixtureId);

  await setDoc(resultRef, {
    fixtureId,
    homeScore: Number(homeScore),
    awayScore: Number(awayScore),
    status: "finished",
    updatedBy,
    updatedAt: serverTimestamp(),
  });

  return {
    fixtureId,
    homeScore: Number(homeScore),
    awayScore: Number(awayScore),
    status: "finished",
  };
}

export function subscribeToRoomResults(roomId, callback) {
  const resultsRef = collection(db, "rooms", roomId, "results");

  return onSnapshot(resultsRef, (snapshot) => {
    const results = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      results[data.fixtureId] = {
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        status: data.status,
      };
    });

    callback(results);
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
      };
    });

    callback(results);
  });
}