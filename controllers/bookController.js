const Book = require('../models/bookModel');
const Edition = require('../models/editionModel'); 
const File = require('../models/fileModel'); // Import the File model
const AppError = require('../utils/appError');

async function addBook(req, res) {
    try {
        const { title, author_name, edition } = req.body;

        if (!title || !author_name || !req.file || !edition) {
            throw  new AppError("All Fields are required", 400);
        }
        const existingBook = await Book.findOne({ title, author_name });

        if (existingBook) {
            throw  new AppError("Book Already Exists", 400);
        }

        const fileData = req.file.buffer;
        const newFile = new File({
            fileData: fileData
        });
        await newFile.save();

        // Create a new edition document and associate it with the file
        const newEdition = new Edition({
            edition_num: edition,
            file: newFile._id
        });
        await newEdition.save();

        // Create a new book record and associate it with the initial edition
        const newBook = new Book({ title, author_name });
        newBook.editions.push(newEdition._id);
        await newBook.save();

        res.status(201).json(
            { message: 'New book added' }
        );
    } catch (error) {
        // console.error('Error adding a new book:', error);
        const e = new AppError("Error adding a new book: "+error.message, 400);
        e.sendResponse(res)
    }
}

async function addNewEdition(req, res) {
    try {
        const bookId = req.params.bookId;
        const existingBook = await Book.findById(bookId);

        if (!existingBook) {
            throw new AppError("Book Not Exists", 400);

        }
        const { edition_num } = req.body;
        const fileData = req.file.buffer;

        const newFile = new File({
            fileData: fileData
        });
        await newFile.save();

        const newEdition = new Edition({
            edition_num: edition_num,
            file: newFile._id
        });
        await newEdition.save();

        // Update the editions field of the corresponding book
        existingBook.editions.push(newEdition._id);
        await existingBook.save();

        res.status(201).json(
            { message: 'New edition added', edition_num }
        );
    } catch (error) {
        // console.error('Error adding new edition:', error);
        const e = new AppError("Error adding new edition book: "+error.message, 400);
        e.sendResponse(res)    }
}


async function updateBook(req, res) {
    try {
        const bookId = req.params.id;
        const { title, author_name } = req.body;

        // Update the book details in the Books collection
        const updatedBook = await Book.findByIdAndUpdate(
            bookId,
            { title, author_name },
            { new: true }
        );

        if (!updatedBook) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.status(200).json(
            { message: 'Book updated successfully', updatedBook });
    } catch (error) {
        // console.error('Error updating book:', error);
        const e = new AppError("Error Updating book: "+error.message, 400);
        e.sendResponse(res)    }
}

// Delete a book
async function deleteBook(req, res) {
    try {
        const id  = req.params.id;

        const bookToDelete = await Book.findById(id);

        if (!bookToDelete) {
            return res.status(404).json({ message: 'Book not found' });
        }
        const editions = bookToDelete.editions;
        console.log(editions)
        for (const edition of editions){
            console.log(edition)
            const book_edition = await Edition.findById(edition);
            await File.findByIdAndDelete(book_edition.file);
            await Edition.findByIdAndDelete(edition);
        }
        // Delete the book itself from the 'books' collection
        await Book.findByIdAndDelete(id);

        res.status(200).json({ message: 'Book deleted' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ message: 'Error deleting book' });
    }
}

module.exports = {
    addBook,
    updateBook,
    deleteBook,
    addNewEdition
};
