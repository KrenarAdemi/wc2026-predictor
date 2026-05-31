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

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Football API request failed",
        message: error.message,
      }),
    };
  }
};