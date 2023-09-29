const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Define an endpoint for scraping with specified elements
app.post('/scrape', async (req, res) => {
  const { url, elements } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!elements || !Array.isArray(elements) || elements.length === 0) {
    return res.status(400).json({ error: 'Specify at least one element to scrape' });
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const scrapedData = {};

    if (elements.includes('headings')) {
      const headings = await page.evaluate(() =>
        Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h) => h.textContent)
      );
      scrapedData.headings = headings;
    }

    if (elements.includes('paragraphs')) {
      const paragraphs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('p')).map((p) => p.textContent)
      );
      scrapedData.paragraphs = paragraphs;
    }

    if (elements.includes('images')) {
      const images = await page.evaluate(() =>
        Array.from(document.querySelectorAll('img')).map((img) => img.src)
      );
      scrapedData.images = images;
    }

    if (elements.includes('links')) {
      const links = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a')).map((a) => a.href)
      );
      scrapedData.links = links;
    }

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
