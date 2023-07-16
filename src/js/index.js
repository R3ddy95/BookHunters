import axios from 'axios';
import _ from 'lodash';

const categoryInput = document.getElementById('category-input');
const searchButton = document.getElementById('search-button');
const booksList = document.getElementById('books-list');
const loadMoreButton = document.getElementById('load-more-button');
loadMoreButton.style.display = 'none'; 
loadMoreButton.addEventListener('click', loadMoreBooks);

let currentPage = 1;
let hasLoadedBooks = false;

searchButton.addEventListener('click', searchBooks);
categoryInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    searchBooks();
  }
});

async function searchBooks() {
  const category = document.getElementById('category-input').value.toLowerCase();

  if (category === '') {
    alert('Enter a valid category');
    return;
  }

  try {
    const response = await axios.get(`https://openlibrary.org/subjects/${category}.json?page=${currentPage}`);
    const books = response.data.works;

    if (books.length === 0) {
      booksList.innerHTML = 'No books found for this category.';
      return;
    }

    booksList.innerHTML = '';

    books.forEach(book => {
      const title = _.get(book, 'title', 'Title not available');
      const authors = _.get(book, 'authors', []).map(author => author.name).join(', ');
      const coverUrl = getCoverUrl(book.cover_id);

      const bookElement = document.createElement('div');
      bookElement.classList.add('book');
      bookElement.innerHTML = `<h3>${title}</h3>
                              <img src="${coverUrl}" alt="Copertina del libro" />
                              <p><strong>Autor:</strong> ${authors}</p>
                              <button class="view-description" data-key="${book.key}">View description</button>
                              <div class="book-description"></div>`;

      booksList.appendChild(bookElement);
    });

    const viewDescriptionButtons = document.getElementsByClassName('view-description');
    Array.from(viewDescriptionButtons).forEach(button => {
      button.addEventListener('click', () => {
        const bookKey = button.dataset.key;
        const bookDescriptionContainer = button.parentNode.querySelector('.book-description');
        const isDescriptionVisible = bookDescriptionContainer.classList.contains('visible');

        if (isDescriptionVisible) {
          hideBookDescription(bookDescriptionContainer);
        } else {
          fetchBookDescription(bookKey, bookDescriptionContainer);
        }
      });
    });

    if (!hasLoadedBooks) {
      hasLoadedBooks = true;
      loadMoreButton.style.display = 'block'; // Mostra il bottone dopo il primo caricamento
    }

    if (books.length < response.data.works_count) {
      loadMoreButton.style.display = 'block';
    } else {
      loadMoreButton.style.display = 'none';
    }
  } catch (error) {
    console.error('Error searching books:', error);
    booksList.innerHTML = 'An error occurred while searching for books.';
  }
}

async function fetchBookDescription(bookKey, bookDescriptionContainer) {
  try {
    const response = await axios.get(`https://openlibrary.org${bookKey}.json`);
    const book = response.data;
    const description = _.get(book, 'description', 'Description not available');

    bookDescriptionContainer.innerHTML = `<p>${description}</p>`;
    bookDescriptionContainer.classList.add('visible');
  } catch (error) {
    console.error('Error fetching book description:', error);
    bookDescriptionContainer.innerHTML = 'Unable to retrieve book description.';
  }
}

function hideBookDescription(bookDescriptionContainer) {
  bookDescriptionContainer.classList.remove('visible');
  bookDescriptionContainer.innerHTML = '';
}

function getCoverUrl(coverId) {
  if (coverId) {
    return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
  } else {
    return './src/img/placeholder.png'; // Percorso dell'immagine di placeholder
  }
}

async function loadMoreBooks() {
  currentPage++;
  await searchBooks();
}
