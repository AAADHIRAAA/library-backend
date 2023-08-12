const Book = require('../models/bookModel');
const File = require('../models/fileModel'); // Import the File model

// Add a new book
async function addBook(req, res) {
    try {
        const { title, author } = req.body;

        // Create a new book record
        const newBook = new Book({ title, author });
        await newBook.save();

        // Create a new file record and associate it with the book
        const newFile = new File({
            filename: req.file.filename,
            bookId: newBook._id,
        });
        await newFile.save();

        res.status(201).json({ message: 'New book added' });
    } catch (error) {
        console.error('Error adding a new book:', error);
        res.status(500).json({ message: 'Error adding a new book' });
    }
}

// Update a book
async function updateBook(req, res) {
    try {
        const { id } = req.params;
        const { title, author } = req.body;

        // Update the book record
        const updatedBook = await Book.findByIdAndUpdate(id, { title, author }, { new: true });

        res.status(200).json({ message: 'Book updated', book: updatedBook });
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ message: 'Error updating book' });
    }
}

// Delete a book
async function deleteBook(req, res) {
    try {
        const { id } = req.params;

        // Find the book to be deleted
        const bookToDelete = await Book.findById(id);

        if (!bookToDelete) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Delete the associated file from the 'files' collection
        await File.findOneAndDelete({ bookId: id });

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
};

