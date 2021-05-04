//Declaring user library
let myLibrary = []

/* FIREBASE AUTHENTICATION */
const auth = firebase.auth();

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
function book(title, author, pages, read) {
	this.title = title;
	this.author = author;
	this.pages = pages;
	this.read = read;
}

function newBook() {
	
	if(isModified!="no") {
		myLibrary[isModified].title = title.value;
		myLibrary[isModified].author = author.value;
		myLibrary[isModified].pages = pages.value;
		myLibrary[isModified].read = read.checked;
	} else {
		myLibrary.push(new book(title.value,author.value,pages.value,read.checked));
	}

	printAllBooks();
	closeForm();
}

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
	title.textContent = book.title;
	author.textContent = `by ${book.author}`;
	pages.textContent = `Pages: ${book.pages}`;
	

	read.classList.add('inline');
	read.innerHTML = "<p>Has been read?</p>";
	if(book.read){
		readButton.textContent="Yes";
	} else readButton.textContent="No";
	readButton.id = myLibrary.indexOf(book);
	readButton.onclick = function() { changeStatus(this); };
	read.appendChild(readButton);

	buttons.classList.add('inline');
	buttons.innerHTML = `<button id="${myLibrary.indexOf(book)}" onclick="modifyBook(this)">Modify</button><button id="${myLibrary.indexOf(book)}" onclick="deleteBook(this)">Delete</button>`

	//Appending everything
	bookDiv.appendChild(title);
	bookDiv.appendChild(author);
	bookDiv.appendChild(pages);
	bookDiv.appendChild(read);
	bookDiv.appendChild(buttons);

	booksList.appendChild(bookDiv);
}

//Will print books
function printAllBooks() {
	booksList.innerHTML = "";
	myLibrary.forEach(book => {
		printBook(book);
	});
	populateStorage();
}

//Will add and remove hidden class to form
function closeForm() {
	form.classList.add("hidden");
	isModified = "no";
}
function openForm() {
	form.classList.remove("hidden");
	if(isModified!="no") {
		title.value = myLibrary[isModified].title;
		author.value = myLibrary[isModified].author;
		pages.value = myLibrary[isModified].pages;
		read.checked = myLibrary[isModified].read;
	} else {
		title.value = "";
		author.value = "";
		pages.value = "";
		read.checked = false;
	}
}

function changeStatus(btn) {
	if (myLibrary[btn.id].read==true) myLibrary[btn.id].read = false;
	else if (myLibrary[btn.id].read==false) myLibrary[btn.id].read = true;
	printAllBooks();
}

function deleteBook(btn) {
	myLibrary.splice(btn.id, 1);
	printAllBooks();
}

function modifyBook(btn) {
	isModified = btn.id;
	openForm();
}

function populateStorage() {
	if(signInBtn.hidden) {
		addToFirestore();
	} else if(signOutBtn.hidden) {
		localStorage.setItem('library', JSON.stringify(myLibrary));
	}
}

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
				setTimeout(printAllBooks(), 5000);
			} else {
     	    	//Alert user when there is no document 
        		alert("No library in the cloud! It will be automatically created after adding first book!");
    		}
		});
	});
}