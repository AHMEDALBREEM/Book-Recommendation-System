# Backend Documentation

The backend is built using Python Flask and provides RESTful APIs for the book recommendation system.

## Main Components

### app.py
- **Flask Application**: Main entry point for the backend
- **API Endpoints**:
  - `/ai-recommend`: AI-powered book recommendations
  - `/genres`: List all available genres
  - `/books`: Get all books
  - `/predict-genres`: Predict genres based on user data
- **Data Handling**:
  - Loads book data from app.json
  - Processes and filters data for recommendations
- **AI Model**:
  - Uses Nearest Neighbors algorithm for recommendations
  - Considers genre, tags, rating, and popularity

### app.json
- Stores book data in JSON format
- Contains fields:
  - id, title, author, genre
  - rating, published_year, page_count
  - popularity, tags, description

### requirements.txt
Lists Python dependencies:
- Flask
- Flask-CORS
- pandas
- scikit-learn

## API Documentation

### POST /ai-recommend
Parameters:
```json
{
  "genres": ["Fantasy", "Mystery"],
  "tags": ["magic"],
  "min_rating": 4.0,
  "min_popularity": 80
}
```

Response:
```json
{
  "message": "Success",
  "recommendations": [
    {
      "title": "The Wizard's Journey",
      "author": "Alice Mage",
      "genre": "Fantasy",
      "rating": 4.8,
      "description": "..."
    }
  ]
}
```

## Running the Backend

1. Install dependencies: `pip install -r requirements.txt`
2. Run the server: `python app.py`
3. Access at: `http://localhost:5000`
