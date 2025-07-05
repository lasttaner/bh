// Vercel Serverless Function - Tweet beğeni API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Sadece POST desteklenir.' });
  }

  const { tweetId } = req.body;
  const tokens = process.env.TOKENS?.split(',');

  if (!tweetId || !tokens || tokens.length === 0) {
    return res.status(400).json({ message: 'Eksik veri' });
  }

  const results = [];

  for (const token of tokens) {
    try {
      const userRes = await fetch("https://api.twitter.com/2/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = await userRes.json();
      const userId = user.data?.id;

      if (!userId) throw new Error("Kullanıcı alınamadı");

      await fetch(`https://api.twitter.com/2/users/${userId}/likes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tweet_id: tweetId }),
      });

      results.push({ token, success: true });
    } catch (err) {
      results.push({ token, success: false, error: err.message });
    }
  }

  res.status(200).json({ results });
}
