# Web Scraping API Documentation

This API allows you to scrape structured data from web pages and perform sentiment analysis on the text content.

## Base URL

- **Base URL:** `http://localhost:1337` (Update with your API's actual base URL)

## Endpoints

### Scraping Endpoint

#### `POST /scrape`

This endpoint scrapes structured data from a webpage based on user-defined parameters.

**Request:**

- **URL:** `/scrape`
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
- **Request Body:**

  ```json
  {
    "url": "https://example.com",
    "elements": ["headings", "paragraphs"],
    "paragraphFilter": "important",
    "pageCount": 1,
    "isNextJs": false
  }
