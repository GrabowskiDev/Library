//Declaring user library
let myLibrary = [
	{
		title: "Pan Tadeusz",
		author: "Adam Mickiewicz",
		pages: 231,
		read: false
	},
	{
		title: "Quo Vadis",
		author: "Henryk Sienkiewicz",
		pages: 118,
		read: true
	}
]

//Template for book
function book(title, author, pages, read) {
	this.title = title;
	this.author = author;
	this.pages = pages;
	this.read = read;
	
	this.info = function() {
		let readText;
		if(read==true) {
			readText = "has been read";
		}
		else{
			readText = "not read yet";
		}
		return `${title} by ${author}, ${pages} pages, ${readText}.`;
	}
}

function newBook() {
	let title = prompt("Give title");
	let author = prompt("Give author");
	let pages = prompt("How many pages");
	let read = prompt("Is read?");

	myLibrary.push(new book(title,author,pages,read));
	printAllBooks();
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
	if(book.read=="true"){
		readButton.textContent="Yes";
	} else readButton.textContent="No";
	read.appendChild(readButton);

	buttons.classList.add('inline');
	buttons.innerHTML = "<button>Modify</button><button>Delete</button>"

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
}

//Query selectors
const booksList = document.querySelector('.booksList');