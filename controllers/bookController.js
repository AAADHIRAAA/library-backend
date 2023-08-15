const Book = require('../models/bookModel');
const Edition = require('../models/editionModel'); 
const File = require('../models/fileModel'); // Import the File model
const AppError = require('../utils/appError');

// async function addBook(req, res) {
//     const { title, author_name } = req.body;
//         if(!title||
//             !author_name){
//                 // throw new AppError("All fields are required", 400);
//                 return res.status(400).json({ message: 'All fields are required' }); 
//             }
//     try {
        
//         // Create a new book record
//         const newBook = new Book({ title, author_name });
//         await newBook.save();

//         const fileData = req.file.buffer;
        
//         // Create a new file record and associate it with the book
//         const newFile = new File({
//             filename: `${title}-Edition-0.pdf`,
//             mimeType: 'application/pdf',
//             bookId: newBook._id,
//             fileData: fileData // Store the file buffer
//         });

//         await newFile.save();
        
//         // Create a new edition document and associate it with the book and file
//         const newEdition = new Edition({
//             edition_num: 0,
//             book: newBook._id,
//             file: newFile._id
//         });
//         await newEdition.save();

//         newBook.editions.push(newEdition._id); // Assign the fileId to the book
//         await newBook.save();

//         res.status(201).json({ message: 'New book added' });
//     } catch (error) {
//         console.error('Error adding a new book:', error);
//         res.status(500).json({ message: 'Error adding a new book' });
//     }
// }
async function addBook(req, res) {
    const { title, author_name } = req.body;

    if (!title || !author_name) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {

        // Check if a book with the same title and author already exists
        const existingBook = await Book.findOne({ title, author_name });

        if (existingBook) {
            return res.status(409).json({ message: 'Book already exists' });
        }

        // Create a new file record for the initial edition
        const fileData = req.file.buffer;
        const newFile = new File({
            filename: `${title}-Edition-0.pdf`,
            mimeType: 'application/pdf',
            bookId: null, // Set this initially to null
            fileData: fileData
        });
        await newFile.save();

        // Create a new edition document and associate it with the file
        const newEdition = new Edition({
            edition_num: 0,
            file: newFile._id
        });
        await newEdition.save();

        // Create a new book record and associate it with the initial edition
        const newBook = new Book({ title, author_name });
        newBook.editions.push(newEdition._id);
        await newBook.save();

        // Update the bookId in the file record and save it again
        newFile.bookId = newBook._id;
        await newFile.save();

        res.status(201).json({ message: 'New book added' });
    } catch (error) {
        console.error('Error adding a new book:', error);
        res.status(500).json({ message: 'Error adding a new book' });
    }
}


// async function addNewEdition(req, res) {
//     try {
//         const bookId = req.params.bookId;

//         const existingBook = await Book.findById(bookId);

//         if (!existingBook) {
//             return res.status(404).json({ message: 'Book not found' });
//         }
//         const {edition_num }= req.body;
//         const fileData = req.file.buffer;
        
//         // Create a new file record and associate it with the new edition
//         const newFile = new File({
//             filename: `${existingBook.title}-Edition-${edition_num}.pdf`,
//             mimeType: 'application/pdf',
//             bookId: bookId,
//             fileData:fileData// Store the file buffer
//         });
//         await newFile.save();

//          // Update the editions field of the corresponding book
//          const updatedEditions = [...existingBook.editions,
//             {
//                 edition_num: edition_num, // Add the new edition's edition_num
//                 file: newFile._id // Add the new edition's file_id
//             }
//         ];
//          existingBook.editions = updatedEditions;
//          await existingBook.save();

//         res.status(201).json({ message: 'New edition added:',edition_num });
//     } catch (error) {
//         console.error('Error adding new edition:', error);
//         res.status(500).json({ message: 'Error adding new edition' });
//     }
// }

async function addNewEdition(req, res) {
    try {
        const bookId = req.params.bookId;

        const existingBook = await Book.findById(bookId);

        if (!existingBook) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const { edition_num } = req.body;
        const fileData = req.file.buffer;

        // Create a new file record for the new edition
        const newFile = new File({
            edition_num:edition_num,
            filename: `${existingBook.title}-Edition-${edition_num}.pdf`,
            mimeType: 'application/pdf',
            bookId: existingBook._id, // Set the bookId for the file
            fileData: fileData
        });
        await newFile.save();

        // Create a new edition document and associate it with the file
        const newEdition = new Edition({
            edition_num: edition_num,
            file: newFile._id
        });
        await newEdition.save();

        // Update the editions field of the corresponding book
        existingBook.editions.push(newEdition._id);
        await existingBook.save();

        res.status(201).json({ message: 'New edition added:', edition_num });
    } catch (error) {
        console.error('Error adding new edition:', error);
        res.status(500).json({ message: 'Error adding new edition' });
    }
}


// async function updateBook(req, res) {
//     try {
//         const bookId = req.params.id;
//         const { title, author_name } = req.body;

//         // Update the book details in the Books collection
//         const updatedBook = await Book.findByIdAndUpdate(
//             bookId,
//             { title, author_name },
//             { new: true }
//         );

//         // Update the book title in the corresponding File document in the Files collection
//         const fileUpdateResult = await File.updateOne(
//             { bookId },
//             { filename: `${title}.pdf` }
//         );
        
//         // Update the book title in the editions array of the corresponding book
//         const editionsUpdateResult = await File.updateMany(
//             { bookId },
//             { filename: `${title}-Edition-${Date.now()}.pdf` }
//         );

//         if (!updatedBook || fileUpdateResult.nModified === 0||editionsUpdateResult.nModified === 0) {
//             return res.status(404).json({ message: 'Book not found' });
//         }

//         res.status(200).json({ message: 'Book updated successfully', updatedBook });
//     } catch (error) {
//         console.error('Error updating book:', error);
//         res.status(500).json({ message: 'Error updating book' });
//     }
// }

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
        const filesUpdateResult = await File.updateMany(
                       { bookId },
                       { filename: `${title}-Edition-${Date.now()}.pdf` }
        );
        const fileDoc = File.findById(bookId);
        const edition_num = fileDoc.edition_num;
        // Update the book title in the corresponding File documents in the Files collection
        const fileUpdateResult = await File.updateMany(
            { bookId },
            { filename: `${title}-Edition-${edition_num}.pdf` }
        );

        // Update the book title in the editions array of the corresponding book
        // const editions = updatedBook.editions;
        // for (const edition of editions) {
        //     const { file,edition_num } = edition;
        //     const updatedFilename = `${title}-Edition-${edition_num}.pdf`;
        //     await File.findByIdAndUpdate(
        //         file,
        //         { filename: updatedFilename}
        //     );
        // }

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
