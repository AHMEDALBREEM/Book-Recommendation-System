document.addEventListener('DOMContentLoaded', () => {
    const genreList = document.querySelector('.genre-list');
    const genreRecommendations = document.getElementById('genre-recommendations');
    const selectedGenre = document.getElementById('selected-genre');
    const bookList = document.getElementById('book-list');
    const allBooksList = document.getElementById('all-books-list');
    const loadingSpinner = document.getElementById('loading-spinner');

    // Fetch and display available genres
    fetchGenres(genreList);

    // Load all books on page load
    loadAllBooks(allBooksList);

    // Add click handler for genre items

    if (genreList) {
        genreList.addEventListener('click', async (e) => {
            if (e.target.tagName === 'LI') {
                const genre = e.target.textContent.trim();
    
                // Update selected genre text
                selectedGenre.textContent = genre;
    
                // Show recommendations section if it exists
                if (genreRecommendations) {
                    genreRecommendations.style.display = 'block';
                }
    
                // Clear previous recommendations if bookList exists
                if (bookList) {
                    bookList.innerHTML = '<p id="loading-message">Loading recommendations...</p>';
                }
    
                // Show loading spinner if it exists
                if (loadingSpinner) {
                    loadingSpinner.style.display = 'block';
                }
    
                try {
                    const response = await fetch('http://127.0.0.1:5000/recommend', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ genre }),
                    });
    
                    const data = await response.json();
    
                    if (response.ok) {
                        displayRecommendations(bookList, data); // Display recommendations
                    } else {
                        bookList.innerHTML = `<p class="error">${data.error || data.message}</p>`;
                    }
                } catch (error) {
                    console.error('Error fetching recommendations:', error);
                    bookList.innerHTML = '<p class="error">An error occurred while fetching recommendations.</p>';
                } finally {
                    loadingSpinner.style.display = 'none'; // Hide loading spinner
                }
            }
        });
    }


});

/**
 * Fetches all books from the backend and displays them.
 * @param {HTMLElement} list - The element where books will be displayed.
 */

async function loadAllBooks(list) {
    const loadingMessage = document.getElementById('loading-all-books');
    loadingMessage.style.display = 'block'; // Show loading message

    try {
        const response = await fetch('http://127.0.0.1:5000/books');
        const data = await response.json();

        if (response.ok) {
            displayBooks(list, data);
        } else {
            console.error('Error fetching books:', data);
        }
    } catch (error) {
        console.error('An error occurred while fetching all books:', error);
    } finally {
        loadingMessage.style.display = 'none'; // Hide loading message
    }
}
function displayBooks(list, data) {
    list.innerHTML = '';  // Clear any existing content

    if (data.books && data.books.length > 0) {
        // Create table element
        const table = document.createElement('table');
        table.classList.add('book-table');
        
        // Create table header
        const headerRow = document.createElement('tr');
        ['Title', 'Author', 'Description', 'Genre', 'Year', 'Rating'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Create table rows for each book
        data.books.forEach(book => {
            const row = document.createElement('tr');
            
            // Create table cells for each book property
            const properties = ['title', 'author', 'description', 'genre', 'published_year', 'rating'];
            properties.forEach(prop => {
                const cell = document.createElement('td');
                cell.textContent = book[prop];
                row.appendChild(cell);
            });

            table.appendChild(row);
        });

        list.appendChild(table);
    }
}

/**
 * Handles the recommendation request based on genre input.
 * @param {HTMLInputElement} input - Genre input from the user.
 * @param {HTMLElement} message - Message element to show status.
 * @param {HTMLElement} list - List to display recommendations.
 * @param {HTMLElement} loadingSpinner - Spinner to show loading state.
 */


async function handleRecommendationRequest(input, message, list, loadingSpinner) {
    const genre = input.value.trim();

    // Validate input
    if (!genre) {
        message.textContent = 'Please enter a genre.';
        message.className = 'error';
        return;
    }

    message.textContent = 'Fetching recommendations...';
    message.className = 'info';
    list.innerHTML = ''; // Clear previous recommendations
    loadingSpinner.style.display = 'block'; // Show loading spinner

    try {
        const response = await fetch('http://127.0.0.1:5000/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ genre })
        });

        const data = await response.json();

        if (response.ok) {
            message.textContent = '';
            message.className = 'success';
            displayRecommendations(list, data);  // Display the recommendations
        } else {
            message.textContent = data.error || data.message;
            message.className = 'error';
        }
    } catch (error) {
        message.textContent = 'An error occurred while fetching recommendations.';
        message.className = 'error';
    } finally {
        loadingSpinner.style.display = 'none'; // Hide loading spinner
    }
}


/**
 * Displays a list of books in the given list element.
 * @param {HTMLElement} list - The element where books will be displayed.
 * @param {Array} books - Array of books to be displayed.
 */


/**
 * Displays a list of recommended books in the given list element.
 * @param {HTMLElement} list - The element where recommendations will be displayed.
 * @param {Array} recommendations - Array of book recommendations to be displayed.
 */

function displayRecommendations(list, data) {
    list.innerHTML = '';  // Clear previous recommendations

    if (data.recommendations && data.recommendations.length > 0) {
        // Create table element
        const table = document.createElement('table');
        table.classList.add('book-table');
        
        // Create table header
        const headerRow = document.createElement('tr');
        ['Title', 'Author', 'Description', 'Genre', 'Year', 'Rating'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Create table rows for each book
        data.recommendations.forEach(book => {
            const row = document.createElement('tr');
            
            // Create table cells for each book property
            const properties = ['title', 'author', 'description', 'genre', 'published_year', 'rating'];
            properties.forEach(prop => {
                const cell = document.createElement('td');
                cell.textContent = book[prop];
                row.appendChild(cell);
            });

            table.appendChild(row);
        });

        list.appendChild(table);
    } else {
        const noRecommendations = document.createElement('p');
        noRecommendations.textContent = 'No recommendations found for the selected genre.';
        list.appendChild(noRecommendations);
    }
}

/**
 * Creates a text input element for the user to enter genre.
 * @param {string} placeholder - Placeholder text for the input.
 * @returns {HTMLInputElement} The created input element.
 */
function createInputElement(placeholder) {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = placeholder;
    return input;
}

/**
 * Creates a button element for user interaction.
 * @param {string} text - Text to display on the button.
 * @returns {HTMLButtonElement} The created button element.
 */
function createButtonElement(text) {
    const button = document.createElement('button');
    button.textContent = text;
    return button;
}

/**
 * Fetches available genres from the backend and displays them.
 * @param {HTMLElement} genreText - The element where genres will be displayed.
 */
async function fetchGenres(genreList) {
    try {
        const response = await fetch('http://127.0.0.1:5000/genres');
        const data = await response.json();

        if (response.ok) {
            // Clear existing content
            genreList.innerHTML = '';
            
            // Create list items for each genre
            data.genres.forEach(genre => {
                const genreItem = document.createElement('li');
                genreItem.textContent = genre;
                genreList.appendChild(genreItem);
            });
        } else {
            console.error('Error fetching genres:', data);
            genreList.innerHTML = '<li>Error loading genres</li>';
        }
    } catch (error) {
        console.error('An error occurred while fetching genres:', error);
        genreList.innerHTML = '<li>Error loading genres</li>';
    }
}

emailjs.init('PtoSBE84N3_FJdRVR');  

// Handle contact form submission with detailed error logging
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const statusMessage = document.createElement('p');
        
        // Ensure elements exist before modifying them
        if (!form || !submitButton || !statusMessage) {
            console.error('Form elements not found');
            return;
        }

        statusMessage.className = 'form-status';
        form.appendChild(statusMessage);

        // Disable submit button
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        // Validate form data
        const formData = new FormData(form);
        const formObject = Object.fromEntries(formData.entries());
        console.log('Form data:', formObject);

        // Set initial status message
        statusMessage.textContent = 'Sending message...';
        statusMessage.className = 'form-status info';

        // Send email using EmailJS with detailed error handling
        emailjs.sendForm('test', 'test', form)
            .then(function(response) {
                console.log('EmailJS response:', response);
                statusMessage.textContent = 'Message sent successfully!';
                statusMessage.className = 'form-status success';
                form.reset();
            }, function(error) {
                console.error('EmailJS error details:', {
                    status: error.status,
                    text: error.text,
                    stack: error.stack
                });
                statusMessage.textContent = 'Failed to send message. Please try again.';
                statusMessage.className = 'form-status error';
            })
            .finally(function() {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Send';
                }
            });
    }); // Close contact form event listener
} // Close contact form null check


function displayAIRecommendations(container, recommendations) {
    // Clear previous content
    container.innerHTML = '';

    if (!recommendations || recommendations.length === 0) {
        container.innerHTML = '<p class="no-results">No recommendations found for your preferences.</p>';
        return;
    }

    // Sort recommendations by popularity (descending)
    const sortedRecommendations = recommendations.sort((a, b) => b.popularity - a.popularity);

    // Create table element
    const table = document.createElement('table');
    table.className = 'recommendations-table';

    // Create table header
    const headerRow = document.createElement('tr');
    ['Title', 'Author', 'Genre', 'Year', 'Rating', 'Popularity', 'Pages', 'Tags', 'Description'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create table rows for each recommendation
    sortedRecommendations.forEach(rec => {
        const row = document.createElement('tr');
        row.className = 'recommendation-row';

        // Create and append table cells
        const properties = [
            rec.title,
            rec.author,
            rec.genre,
            rec.published_year,
            rec.rating,
            `${rec.popularity}%`,
            rec.page_count,
            rec.tags.join(', '),
            rec.description
        ];

        properties.forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.appendChild(cell);
        });

        table.appendChild(row);
    });

    container.appendChild(table);
}



// Handle AI recommendation form submission
const aiRecommendForm = document.getElementById('ai-recommend-form');

if (aiRecommendForm) {
    aiRecommendForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const resultsDiv = document.getElementById('ai-recommendations');
        const loadingMessage = document.getElementById('ai-loading');

        // Validate form elements exist
        if (!form || !submitButton || !resultsDiv || !loadingMessage) {
            console.error('Form elements not found');
            return;
        }

        // Get and validate form data
        const formData = new FormData(form);
        const preferences = {
            genres: formData.getAll('genres'),
            tags: formData.getAll('tags'),
            min_year: parseInt(formData.get('min_year')),
            max_year: parseInt(formData.get('max_year')),
            min_rating: parseFloat(formData.get('min_rating')),
            min_pages: parseInt(formData.get('min_pages')),
            max_pages: parseInt(formData.get('max_pages'))
        };

        // Validate at least one genre or tag is selected
        if (preferences.genres.length === 0 && preferences.tags.length === 0) {
            alert('Please select at least one genre or tag');
            return;
        }

        // Show loading state
        submitButton.disabled = true;
        resultsDiv.innerHTML = '';

        try {
            // Make API request
            const response = await fetch('http://127.0.0.1:5000/ai-recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preferences)
            });

            const data = await response.json();

            if (response.ok) {
                // Shuffle recommendations before displaying
                const shuffledRecommendations = shuffleArray(data.recommendations);
                displayAIRecommendations(resultsDiv, shuffledRecommendations);
            } else {
                resultsDiv.innerHTML = `<p class="error">${data.error || data.message}</p>`;
            }
        } catch (error) {
            console.error('Error fetching AI recommendations:', error);
            resultsDiv.innerHTML = '<p class="error">An error occurred while fetching recommendations.</p>';
        } finally {
            submitButton.disabled = false;
            loadingMessage.style.display = 'none';
        }
    });
}

const browserInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    online: navigator.onLine,
    cookiesEnabled: navigator.cookieEnabled,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    colorDepth: window.screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

async function aiRecommendGenre(browserInfo) {
    try {
        console.log('Preparing POST request to /predict-genres with:', browserInfo);
        
        // Create the request options
        const requestOptions = {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(browserInfo),
            redirect: 'follow'
        };

        console.log('Request options:', requestOptions);
        
        // Make the POST request
        const response = await fetch('http://127.0.0.1:5000/predict-genres', requestOptions);

        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch AI recommendations: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Received response:', data);
        
        // Display appropriate message based on book recommendations
        if (data.books && data.books.length > 0) {
            displayBestRatedBook(data.books);
        } else {
            const bestRatedBook = document.getElementById('best-rated-book');
            bestRatedBook.innerHTML = `
                <p class="info-message">${data.message}</p>
                <p>We couldn't find any books matching your preferences.</p>
            `;
        }
        
        return data.genres;
    } catch (error) {
        console.error('Error in aiRecommendGenre:', error);
        const bestRatedBook = document.getElementById('best-rated-book');
        bestRatedBook.innerHTML = `<p class="error">Failed to load recommendations. Please try again later.</p>`;
        throw error;
    }
}

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function displayBestRatedBook(books) {
    // Find the book with the highest rating
    const bestBook = books.reduce((prev, current) => 
        (prev.rating > current.rating) ? prev : current
    );

    const bestRatedBook = document.getElementById('best-rated-book');
    bestRatedBook.innerHTML = `
        <h4>${bestBook.title}</h4>
        <p><strong>Author:</strong> ${bestBook.author}</p>
        <p><strong>Genre:</strong> ${bestBook.genre}</p>
        <p><strong>Rating:</strong> ${bestBook.rating}/5</p>
        <p>${bestBook.description}</p>
    `;
}

function displayGenres(genres) {
    const genreColumns = document.createElement('div');
    genreColumns.className = 'genre-columns';
    
    // Split genres into two columns
    const midPoint = Math.ceil(genres.length / 2);
    const firstColumn = genres.slice(0, midPoint);
    const secondColumn = genres.slice(midPoint);
    
    // Create first column
    const col1 = document.createElement('div');
    firstColumn.forEach(genre => {
        const p = document.createElement('p');
        p.textContent = genre;
        col1.appendChild(p);
    });
    
    // Create second column
    const col2 = document.createElement('div');
    secondColumn.forEach(genre => {
        const p = document.createElement('p');
        p.textContent = genre;
        col2.appendChild(p);
    });
    
    genreColumns.appendChild(col1);
    genreColumns.appendChild(col2);
    
    // Add to recommendations section
    const aiRecommendations = document.getElementById('ai-recommendations');
    aiRecommendations.appendChild(genreColumns);
}
