import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// FRONTEND STATIC (agar bir serverda tursa)
app.use(express.static('public')); // public ichida index.html, style.css, app.js

// /api/search – bu yerga YouTube yoki boshqa sayt orqali qidiruv logikasini qo'yasan
app.get('/api/search', async (req, res) => {
  const q = (req.query.query || '').toString();
  const initData = req.header('X-Telegram-InitData') || '';

  console.log('SEARCH QUERY:', q);
  console.log('TELEGRAM INIT DATA (short):', initData.slice(0, 50));

  if (!q) return res.json([]);

  try {
    // TODO: bu joyga REAL qidiruv qo'shasan (tokensiz API / scraping)
    // Masalan, youtube-search-without-api-key, yoki o'z skripting:

    /*
    const results = await yt.search(q);
    const tracks = results.slice(0, 10).map((v, idx) => ({
      title: v.title,
      artist: v.channel?.name || '',
      url: v.url,                // https://www.youtube.com/watch?v=...
      isPremium: idx % 3 === 0,  // misol uchun premium flag
    }));
    */

    // Hozircha test uchun mock:
    const tracks = [
      {
        title: q + ' (Test Track 1)',
        artist: 'VKMusicX',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        isPremium: false
      },
      {
        title: q + ' (Premium Track)',
        artist: 'VKMusicX',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        isPremium: true
      }
    ];

    res.json(tracks);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'search_failed' });
  }
});

// /api/checkPremium – PRO status
app.get('/api/checkPremium', (req, res) => {
  const initData = req.header('X-Telegram-InitData') || '';
  console.log('CHECK PREMIUM INIT DATA (short):', initData.slice(0, 50));

  // TODO: bu yerda initData -> userId -> DB’dan premium holatni tekshirasan
  // Hozircha hamma FREE:
  res.json({ isPremium: false });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('VKMusicX API running on port', PORT);
});
