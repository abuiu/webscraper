const express = require('express');
const puppeteer = require('puppeteer');
const Sentiment = require('sentiment');
const winston = require('winston');

const app = express();
const port = process.env.PORT || 1337;

app.use(express.json());

// Configure Winston for error logging
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log' }),
  ],
});

// Define an endpoint for scraping with specified elements, filters, sentiment analysis, word count, and Next.js support
app.post('/scrape', async (req, res) => {
  try {
    const { url, elements, paragraphFilter, pageCount, isNextJs } = req.body;

    if (!url) {
      throw new Error('URL is required');
    }

    if (!elements || !Array.isArray(elements) || elements.length === 0) {
      throw new Error('Specify at least one element to scrape');
    }

    if (!pageCount || pageCount <= 0) {
      throw new Error('Invalid pageCount value');
    }

    const browser = await puppeteer.launch();
    const scrapedData = {};

    for (let pageIdx = 1; pageIdx <= pageCount; pageIdx++) {
      try {
        const page = await browser.newPage();
        await page.goto(`${url}?page=${pageIdx}`);

        // Wait for specific elements or events to appear on the page
        await page.waitForSelector('h1, h2, h3, h4, h5, h6, p, img, a, div');

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
            Array.from(document.querySelectorAll('p, div')).map((el) => el.textContent)
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

          // Calculate word count for paragraphs
          const wordCount = paragraphs.reduce((count, paragraph) => {
            const words = paragraph.split(/\s+/); // Split by whitespace to count words
            return count + words.length;
          }, 0);
          scrapedData.wordCount = (scrapedData.wordCount || 0) + wordCount;
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

        if (isNextJs) {
          // If scraping a Next.js page, add custom Next.js scraping logic here
          // For example, you can wait for specific Next.js components to load and scrape their content
          // Ensure that you respect the Next.js page structure and adapt the logic accordingly
        }

        await page.close();
      } catch (pageError) {
        logger.error(`Error scraping page ${pageIdx}: ${pageError.message}`);
      }
    }

    await browser.close();

    // Calculate overall sentiment based on paragraph sentiments
    const overallSentiment = calculateOverallSentiment(scrapedData.paragraphs);

    res.json({ scrapedData, overallSentiment });
  } catch (error) {
    const errorMessage = `An error occurred while scraping the webpage: ${error.message}`;
    logger.error(errorMessage);
    res.status(500).json({ error: errorMessage });
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
