const Book = require('../models/bookModel');
const File = require('../models/fileModel'); // Import the File model

async function addBook(req, res) {
    try {
        const { title, author } = req.body;

        // Create a new book record
        const newBook = new Book({ title, author });
        await newBook.save();

        const fileData = req.file.buffer;

        // Create a new file record and associate it with the book
        const newFile = new File({
            filename: `${title}.pdf`,
            mimeType: 'application/pdf',
            bookId: newBook._id,
            fileData: fileData // Store the file buffer
        });

        await newFile.save();

        newBook.file_id = newFile._id; // Assign the fileId to the book
        await newBook.save();

        res.status(201).json({ message: 'New book added' });
    } catch (error) {
        console.error('Error adding a new book:', error);
        res.status(500).json({ message: 'Error adding a new book' });
    }
}

async function addNewEdition(req, res) {
    try {
        const bookId = req.params.bookId;

        const existingBook = await Book.findById(bookId);

        if (!existingBook) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const fileData = req.file.buffer;
        // Create a new file record and associate it with the new edition
        const newFile = new File({
            filename: `${existingBook.title}-Edition-${Date.now()}.pdf`,
            mimeType: 'application/pdf',
            bookId: bookId,
            fileData:fileData// Store the file buffer
        });
        await newFile.save();

         // Update the editions field of the corresponding book
         const updatedEditions = [...existingBook.editions, newFile._id];
         existingBook.editions = updatedEditions;
         await existingBook.save();

        res.status(201).json({ message: 'New edition added' });
    } catch (error) {
        console.error('Error adding new edition:', error);
        res.status(500).json({ message: 'Error adding new edition' });
    }
}

async function updateBook(req, res) {
    try {
        const bookId = req.params.id;
        const { title, author } = req.body;

        // Update the book details in the Books collection
        const updatedBook = await Book.findByIdAndUpdate(
            bookId,
            { title, author },
            { new: true }
        );

        // Update the book title in the corresponding File document in the Files collection
        const fileUpdateResult = await File.updateOne(
            { bookId },
            { filename: `${title}.pdf` }
        );

        if (!updatedBook || fileUpdateResult.nModified === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.status(200).json({ message: 'Book updated successfully', updatedBook });
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ message: 'Error updating book' });
    }
}


// Delete a book
async function deleteBook(req, res) {
    try {
        const id  = req.params.id;

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
    addNewEdition
};
