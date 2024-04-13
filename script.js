//Declaring user library
let myLibrary = [];
let storageType = '';
let isModified = 'no';

/* FIREBASE AUTHENTICATION */
const auth = firebase.auth();

//Query selectors
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const localStorageBtn = document.getElementById('localStorageBtn');
const cloudStorageBtn = document.getElementById('cloudStorageBtn');
const chooseStoragePopup = document.querySelector('.popup');
const changeStorageBtn = document.querySelector('#changeStorageBtn');

const booksList = document.querySelector('.booksList');
const form = document.querySelector('.inputForm');
const title = document.querySelector('#bookTitle');
const author = document.querySelector('#bookAuthor');
const pages = document.querySelector('#numberOfPages');
const read = document.querySelector('#isRead');

const provider = new firebase.auth.GoogleAuthProvider();

class book {
	constructor(title, author, pages, read) {
		this.title = title;
		this.author = author;
		this.pages = pages;
		this.read = read;
	}
}

function chooseStorage() {
	storageType = '';
	myLibrary = [];
	printAllBooks();
	chooseStoragePopup.classList.remove('hidden');
	changeStorageBtn.classList.add('hidden');
	auth.signOut();
}

function setLocalStorage() {
	storageType = 'local';
	chooseStoragePopup.classList.add('hidden');
	changeStorageBtn.classList.remove('hidden');
	setLibrary();
	printAllBooks();
}

// Logging with cloud
function setCloudStorage() {
	auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
		.then(() => {
			// Existing and future Auth states are now persisted in the current
			// session only. Closing the window would clear any existing state even
			// if a user forgets to sign out.
			// ...
			// New sign-in will be persisted with session persistence.
			return auth.signInWithPopup(provider);
		})
		.catch(error => {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
		});
}

// Check if login was successful
auth.onAuthStateChanged(user => {
	if (user) {
		// signed in
		myLibrary = [];
		storageType = 'cloud';
		chooseStoragePopup.classList.add('hidden');
		changeStorageBtn.classList.remove('hidden');
		setTimeout(getFromFirestore(), 5000);
	}
});

changeStorageBtn.addEventListener('click', chooseStorage);
localStorageBtn.addEventListener('click', setLocalStorage);
cloudStorageBtn.addEventListener('click', setCloudStorage);

function newBook() {
	//If the book is being modified, change values of modified book
	if (isModified != 'no') {
		myLibrary[isModified].title = title.value;
		myLibrary[isModified].author = author.value;
		myLibrary[isModified].pages = pages.value;
		myLibrary[isModified].read = read.checked;
	} else {
		//else, just create new book
		myLibrary.push(
			new book(title.value, author.value, pages.value, read.checked)
		);
	}

	//After creating new book, print all books, and close form
	printAllBooks();
	populateStorage();
	closeForm();
}

//Create new elements for book tile
function printBook(book) {
	const bookDiv = document.createElement('div');
	const title = document.createElement('h2');
	const author = document.createElement('p');
	const pages = document.createElement('p');
	//Read div
	const read = document.createElement('div');
	const readButton = document.createElement('button');
	const buttons = document.createElement('div');

	bookDiv.classList.add('book');
	//Title, author and number of pages
	title.textContent = book.title;
	author.textContent = `by ${book.author}`;
	pages.textContent = `Pages: ${book.pages}`;

	//Is book read text and button
	read.classList.add('inline');
	read.innerHTML = '<p>Has been read?</p>';
	if (book.read) {
		readButton.textContent = 'Yes';
	} else readButton.textContent = 'No';
	readButton.id = myLibrary.indexOf(book);
	//Clicking read button will change
	readButton.onclick = function () {
		changeStatus(this);
	};
	read.appendChild(readButton);

	//Modify and Delete buttons
	buttons.classList.add('inline');
	buttons.innerHTML = `<button id="${myLibrary.indexOf(
		book
	)}" onclick="modifyBook(this)">Modify</button><button id="${myLibrary.indexOf(
		book
	)}" onclick="deleteBook(this)">Delete</button>`;

	//Appending everything
	bookDiv.appendChild(title);
	bookDiv.appendChild(author);
	bookDiv.appendChild(pages);
	bookDiv.appendChild(read);
	bookDiv.appendChild(buttons);

	//Add book into the page
	booksList.appendChild(bookDiv);
}

function printAllBooks() {
	//Clear current booklist
	booksList.innerHTML = '';

	//Print every book that is in myLibrary
	myLibrary.forEach(book => {
		printBook(book);
	});
}

function closeForm() {
	//Hide form
	form.classList.add('hidden');
	isModified = 'no';
}

function openForm() {
	//Show form
	form.classList.remove('hidden');

	//If the book is modified, show book info inside input fields
	if (isModified != 'no') {
		title.value = myLibrary[isModified].title;
		author.value = myLibrary[isModified].author;
		pages.value = myLibrary[isModified].pages;
		read.checked = myLibrary[isModified].read;
	} else {
		//Else, show empty fields
		title.value = '';
		author.value = '';
		pages.value = '';
		read.checked = false;
	}
}

function changeStatus(btn) {
	//After clicking read button, change book status
	if (myLibrary[btn.id].read == true) myLibrary[btn.id].read = false;
	else if (myLibrary[btn.id].read == false) myLibrary[btn.id].read = true;

	//Reprint all books, so the book shows updated status
	printAllBooks();
	populateStorage();
}

function deleteBook(btn) {
	//Remove book from library
	myLibrary.splice(btn.id, 1);
	printAllBooks();
	populateStorage();
}

function modifyBook(btn) {
	//Set modified book index, and open form to modify that book
	isModified = btn.id;
	openForm();
}

// function populateStorage() {
// 	//If the user is using cloud storage, add data to firestore
// 	if (signInBtn.hidden) {
// 		addToFirestore();
// 	} else if (signOutBtn.hidden) {
// 		//Else, add data to local storage
// 		localStorage.setItem('library', JSON.stringify(myLibrary));
// 	}
// }

function populateStorage() {
	//If the user is using cloud storage, add data to firestore
	if (storageType === 'local') {
		localStorage.setItem('library', JSON.stringify(myLibrary));
	} else if (storageType === 'cloud') {
		addToFirestore();
	}
}

//Get data from local storage, and set it to myLibrary
function setLibrary() {
	myLibrary = JSON.parse(localStorage.getItem('library'));
	if (myLibrary == null) {
		myLibrary = [];
	}
}

/*  !!!!!!!!!!!!!FIRESTORE DATABASE!!!!!!!!!!!!!!!!! */
const db = firebase.firestore();
let libraryRef = db.collection('Libraries');

function addToFirestore() {
	//Checking if user is logged in
	auth.onAuthStateChanged(user => {
		if (myLibrary.length == 0) {
			libraryRef.doc(user.uid).update({
				length: 0,
			});
		}
		//Set the same document for each book
		myLibrary.forEach(book => {
			//Converting object into array
			let arrayBook = Object.values(book);

			//Set document for each user
			libraryRef.doc(user.uid).set(
				{
					uid: user.uid,
					length: myLibrary.length,
					//Add current book to document
					[`book${myLibrary.indexOf(book)}`]: arrayBook,

					//Merge info, so you can add books to database
				},
				{ merge: true }
			);
		});
	});
}

function getFromFirestore() {
	//Checking if user is logged in
	auth.onAuthStateChanged(user => {
		//Get user's document
		libraryRef
			.doc(user.uid)
			.get()
			.then(doc => {
				//Need to make sure the doc exists
				if (doc.exists) {
					//Clearing current library
					myLibrary = [];
					//Get number of books in the document
					let length = doc.data().length;
					//For each book in the document
					for (i = 0; i < length; i++) {
						//Get that book array
						let oldBook = doc.data()[`book${i}`];
						//Create new book object
						let newBook = {};

						//Set newBook obj values to oldBook values
						newBook.title = oldBook[0];
						newBook.author = oldBook[1];
						newBook.pages = oldBook[2];
						newBook.read = oldBook[3];
						//Push new book to myLibrary
						myLibrary.push(newBook);
					}
					//After getting library from firestore, print it
					setTimeout(printAllBooks(), 5000);
				}
			});
	});
}
