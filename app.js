const express = require('express');
const puppeteer = require('puppeteer');
const Sentiment = require('sentiment');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Define an endpoint for scraping with specified elements, filters, and sentiment analysis
app.post('/scrape', async (req, res) => {
  const { url, elements, paragraphFilter, pageCount } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!elements || !Array.isArray(elements) || elements.length === 0) {
    return res.status(400).json({ error: 'Specify at least one element to scrape' });
  }

  if (!pageCount || pageCount <= 0) {
    return res.status(400).json({ error: 'Invalid pageCount value' });
  }

  try {
    const browser = await puppeteer.launch();
    const scrapedData = {};

    for (let pageIdx = 1; pageIdx <= pageCount; pageIdx++) {
      const page = await browser.newPage();
      await page.goto(`${url}?page=${pageIdx}`);

      if (elements.includes('headings')) {
        const headings = await page.evaluate(() =>
          Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h) => h.textContent)
        );
        if (!scrapedData.headings) {
          scrapedData.headings = [];
        }
        scrapedData.headings = scrapedData.headings.concat(headings);
      }

      if (elements.includes('paragraphs')) {
        let paragraphs = await page.evaluate(() =>
          Array.from(document.querySelectorAll('p')).map((p) => p.textContent)
        );

        // Apply paragraph filter if specified
        if (paragraphFilter) {
          paragraphs = paragraphs.filter((p) => p.includes(paragraphFilter));
        }

        if (!scrapedData.paragraphs) {
          scrapedData.paragraphs = [];
        }
        scrapedData.paragraphs = scrapedData.paragraphs.concat(paragraphs);

        // Perform sentiment analysis on paragraphs
        const sentiment = new Sentiment();
        paragraphs.forEach((paragraph, index) => {
          const result = sentiment.analyze(paragraph);
          scrapedData.paragraphs[index] = { text: paragraph, sentiment: result.score };
        });
      }

      if (elements.includes('images')) {
        const images = await page.evaluate(() =>
          Array.from(document.querySelectorAll('img')).map((img) => img.src)
        );
        if (!scrapedData.images) {
          scrapedData.images = [];
        }
        scrapedData.images = scrapedData.images.concat(images);
      }

      if (elements.includes('links')) {
        const links = await page.evaluate(() =>
          Array.from(document.querySelectorAll('a')).map((a) => a.href)
        );
        if (!scrapedData.links) {
          scrapedData.links = [];
        }
        scrapedData.links = scrapedData.links.concat(links);
      }

      await page.close();
    }

    await browser.close();

    // Calculate overall sentiment based on paragraph sentiments
    const overallSentiment = calculateOverallSentiment(scrapedData.paragraphs);

    res.json({ scrapedData, overallSentiment });
  } catch (error) {
    console.error('Error scraping the webpage:', error);
    res.status(500).json({ error: 'An error occurred while scraping the webpage' });
  }
});

// Function to calculate overall sentiment based on paragraph sentiments
function calculateOverallSentiment(paragraphs) {
  if (!paragraphs || paragraphs.length === 0) {
    return 'neutral';
  }

  const totalSentiment = paragraphs.reduce((sum, paragraph) => sum + paragraph.sentiment, 0);
  const averageSentiment = totalSentiment / paragraphs.length;

  if (averageSentiment > 0) {
    return 'positive';
  } else if (averageSentiment < 0) {
    return 'negative';
  } else {
    return 'neutral';
  }
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
