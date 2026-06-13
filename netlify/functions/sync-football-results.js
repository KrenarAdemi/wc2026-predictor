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
    console.error("Missing FOOTBALL_DATA_TOKEN");

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
    console.log("Starting football results sync...");

    const response = await fetch(url, {
      headers: {
        "X-Auth-Token": token,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Football-data API error:", data);

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
    let finishedMatchesFound = 0;

    for (const match of matches) {
      const matchId = String(match.id);

      const homeTeam = match.homeTeam?.name || "";
      const awayTeam = match.awayTeam?.name || "";

      const fullTimeHome = match.score?.fullTime?.home ?? null;
      const fullTimeAway = match.score?.fullTime?.away ?? null;

      const isFinished =
        match.status === "FINISHED" &&
        fullTimeHome !== null &&
        fullTimeAway !== null;

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

        // Important result fields
        fullTimeHome,
        fullTimeAway,
        homeScore: isFinished ? Number(fullTimeHome) : null,
        awayScore: isFinished ? Number(fullTimeAway) : null,
        isFinished,

        lastSyncedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "officialMatches", matchId), officialMatch, {
        merge: true,
      });

      savedMatches++;

      if (isFinished) {
        finishedMatchesFound++;

        console.log(
          `Finished match found: ${homeTeam} ${fullTimeHome}-${fullTimeAway} ${awayTeam}`
        );

        await setDoc(
          doc(db, "officialResults", matchId),
          {
            apiMatchId: matchId,
            status: "finished",
            homeTeam,
            awayTeam,
            homeScore: Number(fullTimeHome),
            awayScore: Number(fullTimeAway),
            fullTimeHome: Number(fullTimeHome),
            fullTimeAway: Number(fullTimeAway),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        savedResults++;
      }
    }

    console.log("Football sync completed:", {
      totalFromApi: matches.length,
      savedMatches,
      finishedMatchesFound,
      savedResults,
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Football data synced to Firestore.",
        totalFromApi: matches.length,
        savedMatches,
        finishedMatchesFound,
        savedResults,
      }),
    };
  } catch (error) {
    console.error("Sync failed:", error);

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
  schedule: "*/5 * * * *",
};