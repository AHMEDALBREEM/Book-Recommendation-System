# Book Recommendation System

This is a full-stack book recommendation system that provides personalized book suggestions based on user preferences.

## Project Structure

```
book-recommendation-system-fixed/
├── backend/               # Backend server code
│   ├── app.py             # Main Flask application
│   ├── app.json           # Book data storage
│   ├── Dockerfile         # Docker configuration for backend
│   └── requirements.txt   # Python dependencies
├── frontend/              # Frontend web interface
│   ├── index.html         # Main HTML file
│   ├── script.js          # Frontend JavaScript logic
│   ├── styles.css         # Frontend styling
│   └── Dockerfile         # Docker configuration for frontend
├── docker-compose.yml     # Docker compose configuration
└── README.md              # This documentation file
```

## Features

- **AI-Powered Recommendations**: Get personalized book suggestions based on genre, tags, and other preferences
- **Advanced Filtering**: Filter by rating, popularity, publication year, and page count
- **Detailed Book Information**: View comprehensive details including description, tags, and ratings
- **Responsive Design**: Works on both desktop and mobile devices

## Backend

The backend is built with Python Flask and provides RESTful APIs for:

- Book recommendations
- Genre listing
- Book data management
- AI-based predictions

### API Endpoints

- `POST /ai-recommend` - Get AI-powered recommendations
- `GET /genres` - List all available genres
- `GET /books` - Get all books
- `POST /predict-genres` - Get genre predictions based on user data

## Frontend

The frontend is built with HTML, CSS, and JavaScript and provides:

- User-friendly interface for selecting preferences
- Display of recommendations in card format
- Detailed book information
- Responsive design

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Installation

1. Clone the repository
2. Run `docker-compose up --build`
3. Access the application at `http://localhost:5000`

## Configuration

Environment variables can be set in `.env` file:

```
FLASK_ENV=development
FLASK_DEBUG=1
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
