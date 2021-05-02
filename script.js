//Declaring user library
let myLibrary = []

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
	let title;
	let author;
	let pages;
	let read;

	myLibrary.push(newBook(title,author,pages,read))
}