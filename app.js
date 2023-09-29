const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Define an endpoint for scraping
app.post('/scrape', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const scrapedData = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h3')).map((h3) => h3.textContent);
      const paragraphs = Array.from(document.querySelectorAll('p')).map((p) => p.textContent);

      return { headings, paragraphs };
    });

    await browser.close();

    res.json(scrapedData);
  } catch (error) {
    console.error('Error scraping the webpage:', error);
    res.status(500).json({ error: 'An error occurred while scraping the webpage' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
