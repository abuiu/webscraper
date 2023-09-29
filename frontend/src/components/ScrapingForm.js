import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

function ScrapingForm() {
  const [formData, setFormData] = useState({
    url: '',
    elements: [], // This should be an array
    paragraphFilter: '',
    pageCount: 1,
    isNextJs: false,
  });

  const [apiResponse, setApiResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? e.target.checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const handleSelectChange = (selectedOptions) => {
    // Convert the selected options to an array of values
    const selectedValues = Array.from(selectedOptions, (option) => option.value);

    setFormData({
      ...formData,
      elements: selectedValues,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Make a POST request to your API endpoint with the form data
      const response = await axios.post('http://localhost:1337/scrape', formData);
      console.log('API Response:', response.data);

      // Set the API response in the state for display
      setApiResponse(response.data);
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while fetching data from the API.');
      setApiResponse(null);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md="8">
          <h2 className="mt-5 mb-4">Web Scraping Form</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="url">
              <Form.Label>URL:</Form.Label>
              <Form.Control
                type="text"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="elements">
              <Form.Label>Elements to Scrape:</Form.Label>
              <Form.Control
                as="select"
                name="elements"
                multiple
                value={formData.elements} // Set selected values as an array
                onChange={(e) => handleSelectChange(e.target.selectedOptions)} // Handle select changes
              >
                <option value="headings">Headings</option>
                <option value="paragraphs">Paragraphs</option>
                <option value="images">Images</option>
                <option value="links">Links</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="paragraphFilter">
              <Form.Label>Paragraph Filter:</Form.Label>
              <Form.Control
                type="text"
                name="paragraphFilter"
                value={formData.paragraphFilter}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="pageCount">
              <Form.Label>Page Count:</Form.Label>
              <Form.Control
                type="number"
                name="pageCount"
                value={formData.pageCount}
                onChange={handleInputChange}
                min="1"
              />
            </Form.Group>

            <Form.Group controlId="isNextJs">
              <Form.Check
                type="checkbox"
                label="Is Next.js"
                name="isNextJs"
                checked={formData.isNextJs}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Scrape
            </Button>
          </Form>

          {apiResponse && (
            <div className="mt-4">
              <h2>Scraped Data:</h2>
              <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
            </div>
          )}

          {error && (
            <div className="mt-4 alert alert-danger">
              <strong>Error:</strong> {error}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default ScrapingForm;
