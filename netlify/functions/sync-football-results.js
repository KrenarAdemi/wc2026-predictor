import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBG_TV5bNHB406Fvch3C5r9lzSQ4TDXkb4",
  authDomain: "wc2026-predictor-web.firebaseapp.com",
  projectId: "wc2026-predictor-web",
  storageBucket: "wc2026-predictor-web.firebasestorage.app",
  messagingSenderId: "866023692838",
  appId: "1:866023692838:web:860fc60b9a638f358924e7",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

export const handler = async () => {
  const token = process.env.FOOTBALL_DATA_TOKEN;

  if (!token) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Missing FOOTBALL_DATA_TOKEN",
      }),
    };
  }

  const url =
    "https://api.football-data.org/v4/competitions/WC/matches?season=2026";

  try {
    const response = await fetch(url, {
      headers: {
        "X-Auth-Token": token,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      };
    }

    const matches = data.matches || [];

    let savedMatches = 0;
    let savedResults = 0;

    for (const match of matches) {
      const matchId = String(match.id);

      const homeTeam = match.homeTeam?.name || "";
      const awayTeam = match.awayTeam?.name || "";

      const fullTimeHome = match.score?.fullTime?.home ?? null;
      const fullTimeAway = match.score?.fullTime?.away ?? null;

      const officialMatch = {
        apiMatchId: matchId,
        competition: data.competition?.name || "World Cup",
        status: match.status,
        utcDate: match.utcDate,
        stage: match.stage || null,
        group: match.group || null,
        matchday: match.matchday || null,
        homeTeam,
        awayTeam,
        homeTeamCode: match.homeTeam?.tla || null,
        awayTeamCode: match.awayTeam?.tla || null,
        fullTimeHome,
        fullTimeAway,
        lastSyncedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "officialMatches", matchId), officialMatch, {
        merge: true,
      });

      savedMatches++;

      if (
        match.status === "FINISHED" &&
        fullTimeHome !== null &&
        fullTimeAway !== null
      ) {
        await setDoc(
          doc(db, "officialResults", matchId),
          {
            apiMatchId: matchId,
            status: "finished",
            homeScore: Number(fullTimeHome),
            awayScore: Number(fullTimeAway),
            homeTeam,
            awayTeam,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        savedResults++;
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Football data synced to Firestore.",
        totalFromApi: matches.length,
        savedMatches,
        savedResults,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Sync failed",
        message: error.message,
      }),
    };
  }
};

export const config = {
  schedule: "*/15 * * * *",
};