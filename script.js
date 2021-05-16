//Declaring user library
let myLibrary = []

/* FIREBASE AUTHENTICATION */
const auth = firebase.auth();

//Query selectors
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');

const provider = new firebase.auth.GoogleAuthProvider();

// Sign in event handlers
signInBtn.onclick = () => auth.signInWithPopup(provider);
signOutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
    if (user) {
        // signed in
        signInBtn.hidden = true;
        signOutBtn.hidden = false;
		myLibrary = [];
		setTimeout(getFromFirestore(), 5000);
    } else {
        // not signed in
        signInBtn.hidden = false;
        signOutBtn.hidden = true;
		myLibrary = [];
		setLibrary();
		printAllBooks();
    }
});



//Template for book
/* commented out as i used class
function book(title, author, pages, read) {
	this.title = title;
	this.author = author;
	this.pages = pages;
	this.read = read;
}
*/

class book {
	constructor(title, author, pages, read) {
		this.title = title;
		this.author = author;
		this.pages = pages;
		this.read = read;
	}
}

function newBook() {
	//If the book is being modified, change values of modified book
	if(isModified!="no") {
		myLibrary[isModified].title = title.value;
		myLibrary[isModified].author = author.value;
		myLibrary[isModified].pages = pages.value;
		myLibrary[isModified].read = read.checked;
	} else {
		//else, just create new book
		myLibrary.push(new book(title.value,author.value,pages.value,read.checked));
	}

	//After creating new book, print all books, and close form
	printAllBooks();
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
	read.innerHTML = "<p>Has been read?</p>";
	if(book.read){
		readButton.textContent="Yes";
	} else readButton.textContent="No";
	readButton.id = myLibrary.indexOf(book);
	//Clicking read button will change
	readButton.onclick = function() { changeStatus(this); };
	read.appendChild(readButton);

	//Modify and Delete buttons
	buttons.classList.add('inline');
	buttons.innerHTML = `<button id="${myLibrary.indexOf(book)}" onclick="modifyBook(this)">Modify</button><button id="${myLibrary.indexOf(book)}" onclick="deleteBook(this)">Delete</button>`

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
	booksList.innerHTML = "";

	//Print every book that is in myLibrary
	myLibrary.forEach(book => {
		printBook(book);
	});

	//After printing all books, add them to storage
	populateStorage();
}

function closeForm() {
	//Hide form
	form.classList.add("hidden");
	isModified = "no";
}

function openForm() {
	//Show form
	form.classList.remove("hidden");

	//If the book is modified, show book info inside input fields
	if(isModified!="no") {
		title.value = myLibrary[isModified].title;
		author.value = myLibrary[isModified].author;
		pages.value = myLibrary[isModified].pages;
		read.checked = myLibrary[isModified].read;
	} else {
		//Else, show empty fields
		title.value = "";
		author.value = "";
		pages.value = "";
		read.checked = false;
	}
}

function changeStatus(btn) {
	//After clicking read button, change book status
	if (myLibrary[btn.id].read==true) myLibrary[btn.id].read = false;
	else if (myLibrary[btn.id].read==false) myLibrary[btn.id].read = true;

	//Reprint all books, so the book shows updated status
	printAllBooks();
}

function deleteBook(btn) {
	//Remove book from library
	myLibrary.splice(btn.id, 1);
	printAllBooks();
}

function modifyBook(btn) {
	//Set modified book index, and open form to modify that book
	isModified = btn.id;
	openForm();
}

function populateStorage() {
	//If the user is using cloud storage, add data to firestore
	if(signInBtn.hidden) {
		addToFirestore();
	} else if(signOutBtn.hidden) {
		//Else, add data to local storage
		localStorage.setItem('library', JSON.stringify(myLibrary));
	}
}

//Get data from local storage, and set it to myLibrary
function setLibrary() {
	myLibrary = JSON.parse(localStorage.getItem('library'));
}

//Query selectors
const booksList = document.querySelector('.booksList');
const form = document.querySelector('.inputForm');

const title = document.querySelector('#bookTitle');
const author = document.querySelector('#bookAuthor');
const pages = document.querySelector('#numberOfPages');
const read = document.querySelector('#isRead');

//Global variables
let isModified = "no";

/*  !!!!!!!!!!!!!FIRESTORE DATABASE!!!!!!!!!!!!!!!!! */
const db = firebase.firestore();
let libraryRef = db.collection('Libraries');

function addToFirestore() {
	//Checking if user is logged in
	auth.onAuthStateChanged(user => {
		//Removing length (for some reasons it wouldn't be set to 0 when no books are in myLibrary)
		libraryRef.doc(user.uid).update({
			length: firebase.firestore.FieldValue.delete()
		});

		//Set the same document for each book
		myLibrary.forEach((book) => {
			//Converting object into array
			let arrayBook = Object.values(book);

			//Set document for each user
			libraryRef.doc(user.uid).set({
				uid: user.uid,
				length: myLibrary.length,
				//Add current book to document
				[`book${myLibrary.indexOf(book)}`]: arrayBook,
				
				//Merge info, so you can add books to database
			}, { merge:true });
		});
	});
}

function getFromFirestore() {
	//Checking if user is logged in
	auth.onAuthStateChanged(user => {
		//Get user's document
		libraryRef.doc(user.uid).get().then((doc) => {
			//Need to make sure the doc exists
			if(doc.exists) {
				//Clearing current library
				myLibrary = [];
				//Get number of books in the document
				let length = doc.data().length;
				//For each book in the document
				for(i=0; i<length; i++) {	
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