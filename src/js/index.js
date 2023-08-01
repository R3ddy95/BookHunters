import axios from 'axios';
import _ from 'lodash';

const API_URL = process.env.API_URL;
const API_COVER_URL = process.env.API_COVER_URL;

// Seleziono gli elementi del DOM
const categoryInput = document.getElementById('category-input');
const searchButton = document.getElementById('search-button');
const booksList = document.getElementById('books-list');
const viewDescriptionButtons = document.getElementsByClassName('view-description');

let currentPage = 1;

// Aggiungo gli event listener ai pulsanti
searchButton.addEventListener('click', searchBooks);
categoryInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    searchBooks();
  }
});

// Funzione per gestire la ricerca dei libri in base alla categoria inserita dall'utente
async function searchBooks() {
  const category = getInputValue(categoryInput);

  if (category === '') {
    alert('Enter a valid category');
    return;
  }

  try {
    // Effettua la chiamata all'API per recuperare i libri della categoria specificata
    const response = await fetchBooks(category, currentPage);
    const books = response.works;

    // Se non ci sono libri per la categoria specificata, mostra un messaggio
    if (books.length === 0) {
      booksList.innerHTML = 'No books found for this category.';
      return;
    }

    // Resetta la lista dei libri prima di aggiungere i nuovi libri
    booksList.innerHTML = '';

    // Aggiungo ciascun libro alla lista
    books.forEach(book => {
      const title = _.get(book, 'title', 'Titolo non disponibile');
      const authors = getAuthors(_.get(book, 'authors', []));
      const coverUrl = getCoverUrl(book.cover_id);

      const bookElement = createBookElement(title, authors, coverUrl, book.key);
      booksList.appendChild(bookElement);
    });

    // Aggiungo gli event listener ai pulsanti "Visualizza descrizione"
    Array.from(viewDescriptionButtons).forEach(button => {
      button.addEventListener('click', () => {
        const bookKey = button.dataset.key;
        const bookDescriptionContainer = button.parentNode.querySelector('.book-description');
        toggleBookDescription(bookKey, bookDescriptionContainer);
      });
    });

  } catch (error) {
    // Gestione degli errori durante la ricerca dei libri
    console.error('Error searching books:', error);
    booksList.innerHTML = 'An error occurred while searching for books.';
  }
}

// Funzione per effettuare la chiamata all'API e recuperare i libri
async function fetchBooks(category, page) {
  const response = await axios.get(`${API_URL}/subjects/${category}.json?page=${page}`);
  return response.data;
}

// Funzione per creare l'elemento di un libro da aggiungere alla lista
function createBookElement(title, authors, coverUrl, bookKey) {
  const bookElement = document.createElement('div');
  bookElement.classList.add('book');
  bookElement.innerHTML = `<h3>${title}</h3>
                           <img src="${coverUrl}" alt="Copertina del libro" />
                           <p><strong>Autore/i:</strong> ${authors}</p>
                           <button class="view-description" data-key="${bookKey}">View description</button>
                           <div class="book-description"></div>`;
  return bookElement;
}

// Funzione per mostrare o nascondere la descrizione di un libro
function toggleBookDescription(bookKey, bookDescriptionContainer) {
  if (bookDescriptionContainer.classList.contains('visible')) {
    hideBookDescription(bookDescriptionContainer);
  } else {
    fetchBookDescription(bookKey, bookDescriptionContainer);
  }
}

// Funzione per effettuare la chiamata all'API e recuperare la descrizione di un libro
async function fetchBookDescription(bookKey, bookDescriptionContainer) {
  try {
    const response = await axios.get(`${API_URL}${bookKey}.json`);
    const book = response.data;
    const description = _.get(book, 'description', 'Descrizione non disponibile');

    bookDescriptionContainer.innerHTML = `<p>${description}</p>`;
    bookDescriptionContainer.classList.add('visible');
  } catch (error) {
    // Gestione degli errori durante il recupero della descrizione
    console.error('Error fetching book description:', error);
    bookDescriptionContainer.innerHTML = 'Unable to retrieve book description.';
  }
}

// Funzione per nascondere la descrizione di un libro
function hideBookDescription(bookDescriptionContainer) {
  bookDescriptionContainer.classList.remove('visible');
  bookDescriptionContainer.innerHTML = '';
}

// Funzione per ottenere gli autori formattati come stringa
function getAuthors(authorsArray) {
  return authorsArray.map(author => author.name).join(', ');
}

// Funzione per ottenere l'URL della copertina di un libro
function getCoverUrl(coverId) {
  if (coverId) {
    return `${API_COVER_URL}/b/id/${coverId}-M.jpg`;
  } else {
    return './src/img/placeholder.png'; // Inserisci il percorso dell'immagine di placeholder
  }
}

// Funzione per ottenere il valore di un elemento di input
function getInputValue(inputElement) {
  return inputElement.value.toLowerCase();
}
