import logging
from flask import Flask, request, jsonify,session # type: ignore
from flask_cors import CORS # type: ignore
import pandas as pd
import json
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler()]
)

def generate_book_data(file_path='app.json'):
    """Generate additional book data and save to the specified JSON file."""
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)

        # Generate additional items
        for i in range(101, 201):
            data['id'].append(i)
            data['title'].append(f"Book Title {i}")
            data['genre'].append("Fiction" if i % 2 == 0 else "Non-Fiction")
            data['author'].append(f"Author {i}")
            data['rating'].append(round(3.0 + (i % 2) * 1.5, 1))  # Example ratings between 3.0 and 4.5
            data['published_year'].append(2000 + (i % 25))  # Example years between 2000 and 2024
            data['description'].append(f"Description for Book Title {i}")

        with open(file_path, 'w') as file:
            json.dump(data, file, indent=4)

        logging.info(f"Generated additional book data in {file_path}")

    except Exception as e:
        logging.error(f"Error generating book data: {e}")


# Load book data from a JSON file
def load_book_data(file_path='app.json'):
    """Load and validate book data from the specified JSON file."""
    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File '{file_path}' not found.")
        
        with open(file_path, 'r') as file:
            books_data = json.load(file)
        
        # Create DataFrame and validate required columns
        books_df = pd.DataFrame(books_data)
        required_columns = {'title', 'author', 'genre', 'published_year'}
        missing_columns = required_columns - set(books_df.columns)
        
        if missing_columns:
            raise ValueError(f"Missing required columns: {missing_columns}")
        
        logging.info(f"Loaded {len(books_df)} books from {file_path}")
        return books_df

    except FileNotFoundError as fnf_error:
        logging.error(fnf_error)
        return pd.DataFrame(columns=['title', 'author', 'genre', 'published_year'])

    except json.JSONDecodeError as json_error:
        logging.error(f"Error parsing JSON: {json_error}")
        return pd.DataFrame(columns=['title', 'author', 'genre', 'published_year'])

    except Exception as e:
        logging.error(f"Error loading book data: {e}")
        return pd.DataFrame(columns=['title', 'author', 'genre', 'published_year'])

# Initialize book data
BOOKS_DATA = load_book_data()
app.secret_key = 'your-unique-secret-key'  # Change this to something secret and unique

@app.route('/books', methods=['GET'])
def get_all_books():
    """Return all books in the dataset."""
    try:
        logging.info("Received request for all books.")

        # Check if the book data is empty
        if BOOKS_DATA.empty:
            logging.info("No books found in the dataset.")
            return jsonify({'message': 'No books found in the dataset'}), 404

        # Convert the DataFrame to a list of dictionaries
        all_books = BOOKS_DATA.to_dict(orient='records')

        logging.info(f"Returning {len(all_books)} books.")
        return jsonify({'message': 'Success', 'books': all_books}), 200

    except Exception as e:
        logging.error(f"Error processing request: {e}")
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

# Helper function to filter books by genre
def filter_books_by_genre(genre: str):
    """Filter books by genre and return recommendations."""
    if not genre:
        return pd.DataFrame(columns=['title', 'author', 'genre', 'published_year'])
    
    # Use case-insensitive filtering with str.contains
    return BOOKS_DATA[BOOKS_DATA['genre'].str.contains(genre, case=False, na=False)]

# Recommendation route
@app.route('/recommend', methods=['GET', 'POST'])
def recommend():
    """Handle book recommendation requests."""
    try:
        logging.info("Received request for book recommendations.")

        # Extract genre from the request
        if request.method == 'GET':
            user_genre = request.args.get('genre', '').strip()
        else:  # POST
            request_data = request.get_json()
            user_genre = request_data.get('genre', '').strip()

        if not user_genre:
            return jsonify({'error': 'Genre is required'}), 400

        recommendations = filter_books_by_genre(user_genre)

        if recommendations.empty:
            logging.info(f"No books found for genre: {user_genre}")
            return jsonify({'message': 'No books found for the given genre'}), 404

        logging.info(f"Returning {len(recommendations)} recommendations for genre: {user_genre}")
        return jsonify({'message': 'Success', 'recommendations': recommendations.to_dict(orient='records')}), 200

    except ValueError as e:
        logging.error(f"Validation error: {e}")
        return jsonify({'error': str(e)}), 400

    except Exception as e:
        logging.error(f"Error processing request: {e}")
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

# Error Handlers
@app.route('/genres', methods=['GET'])
def get_all_genres():
    """Return all unique genres in the dataset."""
    try:
        logging.info("Received request for all genres.")
        
        if BOOKS_DATA.empty:
            logging.info("No books found in the dataset.")
            return jsonify({'message': 'No genres found'}), 404
            
        # Get unique genres and sort them
        unique_genres = BOOKS_DATA['genre'].dropna().unique().tolist()
        unique_genres.sort()
        
        logging.info(f"Returning {len(unique_genres)} unique genres.")
        return jsonify({'message': 'Success', 'genres': unique_genres}), 200
        
    except Exception as e:
        logging.error(f"Error processing request: {e}")
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.errorhandler(404)
def handle_404(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def handle_500(error):
    return jsonify({'error': 'Internal server error'}), 500




from sklearn.neighbors import NearestNeighbors
import numpy as np

# Function to create recommendation model
def create_recommendation_model(books_df):
    """Create an advanced recommendation model using multiple features."""
    try:
        # Create feature matrix
        features = pd.get_dummies(books_df['genre'])
        
        # Add numerical features
        features['published_year'] = books_df['published_year'].fillna(books_df['published_year'].median())
        features['rating'] = books_df['rating'].fillna(books_df['rating'].median())
        features['page_count'] = books_df['page_count'].fillna(books_df['page_count'].median())
        features['popularity'] = books_df['popularity'].fillna(books_df['popularity'].median())
        
        # Add tag features
        all_tags = set(tag for tags in books_df['tags'] for tag in tags)
        for tag in all_tags:
            features[f'tag_{tag}'] = books_df['tags'].apply(lambda x: 1 if tag in x else 0)
        
        # Normalize features
        features = (features - features.mean()) / features.std()
        
        # Create Nearest Neighbors model with dynamic number of neighbors
        num_neighbors = min(5, len(books_df))  # Use 5 neighbors or the number of books, whichever is smaller
        model = NearestNeighbors(n_neighbors=num_neighbors, algorithm='auto')
        model.fit(features.fillna(0))
        
        return model, features
    
    except Exception as e:
        logging.error(f"Error creating recommendation model: {e}")
        return None, None

# Initialize recommendation model
RECOMMENDATION_MODEL, FEATURE_MATRIX = create_recommendation_model(BOOKS_DATA)

@app.route('/ai-recommend', methods=['POST'])
def ai_recommend():
    """Provide advanced AI-based book recommendations."""
    try:
        logging.info("Received request for AI recommendations.")
        
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
            
        data = request.get_json()
        
        # Get user preferences
        preferred_genres = data.get('genres', [])
        preferred_tags = data.get('tags', [])
        min_year = data.get('min_year', 1900)
        max_year = data.get('max_year', 2023)
        min_rating = data.get('min_rating', 3.0)
        min_pages = data.get('min_pages', 100)
        max_pages = data.get('max_pages', 1000)
        min_popularity = data.get('min_popularity', 50)
        
        # Filter books based on preferences
        filtered_books = BOOKS_DATA[
            (BOOKS_DATA['genre'].isin(preferred_genres)) &
            (BOOKS_DATA['published_year'].between(min_year, max_year)) &
            (BOOKS_DATA['rating'] >= min_rating) &
            (BOOKS_DATA['page_count'].between(min_pages, max_pages)) &
            (BOOKS_DATA['popularity'] >= min_popularity)
        ]
        
        # Additional tag filtering
        if preferred_tags:
            filtered_books = filtered_books[
                filtered_books['tags'].apply(lambda x: any(tag in x for tag in preferred_tags))
            ]
        
        if filtered_books.empty:
            return jsonify({"message": "No books match your preferences"}), 404
            
        # Get recommendations using the model
        recommendations = []
        for _, book in filtered_books.iterrows():
            book_features = FEATURE_MATRIX.loc[book.name].values.reshape(1, -1)
            _, indices = RECOMMENDATION_MODEL.kneighbors(book_features)
            similar_books = BOOKS_DATA.iloc[indices[0]]
            recommendations.extend(similar_books.to_dict(orient='records'))
        
        # Remove duplicates and limit to top 10
        unique_recommendations = []
        seen = set()
        for rec in recommendations:
            if rec['title'] not in seen:
                unique_recommendations.append(rec)
                seen.add(rec['title'])
                if len(unique_recommendations) >= 10:
                    break
        
        # Sort by popularity and rating
        unique_recommendations.sort(
            key=lambda x: (x['popularity'], x['rating']),
            reverse=True
        )
        
        return jsonify({
            "message": "Success",
            "recommendations": unique_recommendations[:10]
        }), 200
        
    except Exception as e:
        logging.error(f"Error in AI recommendations: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate-books', methods=['POST'])
def generate_books():
    """Generate additional book data and save to the JSON file."""
    try:
        logging.info("Received request to generate additional book data")
        
        # Call the generate_book_data function
        generate_book_data()
        
        # Reload the book data
        global BOOKS_DATA
        BOOKS_DATA = load_book_data()
        
        logging.info("Successfully generated additional book data")
        return jsonify({'message': 'Successfully generated additional book data'}), 200
        
    except Exception as e:
        logging.error(f"Error generating book data: {e}")
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/predict-genres', methods=['POST'])
def predict_genres():
    try:
        # Log incoming request
        logging.info("Received request at /predict-genres")
        
        # Validate request is JSON
        if not request.is_json:
            logging.error("Request must be JSON")
            return jsonify({"error": "Request must be JSON"}), 400
            
        data = request.get_json()
        logging.info(f"Request data: {data}")
        
        # If there is no existing session data, use current request data
        if 'language' not in session:
            # Store the incoming request data in the session if it's the first request or no session data
            session['language'] = data.get('language')
            session['platform'] = data.get('platform')
            session['timezone'] = data.get('timezone')
            session['screen_width'] = data.get('screenWidth')
            session['screen_height'] = data.get('screenHeight')
        else:
            # Use data from previous session
            data = {
                'language': session['language'],
                'platform': session['platform'],
                'timezone': session['timezone'],
                'screenWidth': session['screen_width'],
                'screenHeight': session['screen_height']
            }
        
        # Validate required fields
        required_fields = ['language', 'platform', 'timezone', 'screenWidth', 'screenHeight']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            logging.error(f"Missing required fields: {missing_fields}")
            return jsonify({"error": f"Missing required fields: {missing_fields}"}), 400
        
        # Extract data
        language = data.get('language')
        platform = data.get('platform')
        timezone = data.get('timezone')
        screen_width = data.get('screenWidth')
        screen_height = data.get('screenHeight')
        
        # Define recommendation logic
        def recommend_by_language(lang):
            if lang.startswith('en'):
                return ["Mystery", "Thriller", "Romance"]
            elif lang.startswith('ar'):
                return ["History", "Religion", "Philosophy"]
            elif lang.startswith('ja'):
                return ["Manga", "Light Novel", "Sci-Fi"]
            return ["Classics", "World Literature"]
        
        def recommend_by_platform(plat):
            if plat == "Win32":
                return ["Fantasy", "Science Fiction"]
            elif plat == "MacIntel":
                return ["Biography", "Self-Help"]
            return ["Adventure", "Travel"]
        
        def recommend_by_timezone(tz):
            if "Asia" in tz:
                return ["Mythology", "Cultural Studies"]
            elif "Europe" in tz:
                return ["Historical Fiction", "Art"]
            elif "America" in tz:
                return ["Business", "Technology"]
            return ["World History", "Geography"]
        
        # Aggregate recommendations
        language_genres = recommend_by_language(language)
        platform_genres = recommend_by_platform(platform)
        timezone_genres = recommend_by_timezone(timezone)
        
        # Combine and filter unique genres
        all_genres = list(set(language_genres + platform_genres + timezone_genres))
        genres = all_genres[:2]  # Limit to top 2 genres
        
        # Fetch top-rated books for the selected genres
        books_data = []
        if not BOOKS_DATA.empty:
            recommended_books = BOOKS_DATA[BOOKS_DATA['genre'].isin(genres)]
            if not recommended_books.empty:
                top_books = recommended_books.nlargest(5, 'rating')
                books_data = top_books.to_dict(orient='records')
        
        response = {
            "genres": genres,
            "books": books_data,
            "message": "Success" if books_data else "No books found for your preferences"
        }
        logging.info(f"Returning response: {response}")
        return jsonify(response), 200
    
    except KeyError as ke:
        logging.error(f"Missing key: {str(ke)}")
        return jsonify({"error": "Invalid data", "message": f"Missing key: {str(ke)}"}), 400
    except Exception as e:
        logging.error(f"Error in predict_genres: {str(e)}")
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


# Main Execution
if __name__ == '__main__':
    # Ensure books.json exists before running
    if not os.path.exists('app.json'):
        logging.error("books.json file not found. Please provide the required data file.")
        exit(1)

    app.run(debug=True)
