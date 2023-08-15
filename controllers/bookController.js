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
            console.log(edition);
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

 async function downloadFiles(req, res){
    try {
        const fileId = req.params.id;
        const { bookId,edition_num }= req.body;
        const file = await File.findById({ _id: fileId });
        
        if (!file) {
            return res.status(404).json({
                status: 'error',
                message: 'File not found',
            });
        }
        // const edition = await Edition.findOne({file:fileId});
        // const edition_Id = edition.get('_id');
        const book = await Book.findById({_id:bookId});
        const fileName = book.get('title');
        const fileData = file.get('fileData');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}-Edition-${edition_num}.pdf"`);
        const filename=`"${fileName}-Edition-${edition_num}.pdf"`;
        console.log(filename);
        res.send(fileData);
    } catch (err) {
        const e = new AppError(err.message, 500);
        e.sendResponse(res);
    }

}

// async function updateFiles(req,res){
//     try{
//             const fileId = req.params.id;
//             const { BookId, edition_num} = req.body;
//             const fileData = req.file.buffer;
//             const file = await File.findById({_id:fileId});
//             if(!file){
//                 return res.status(404).json({
//                     status:'error',
//                     message:'File not Found'
//                 });
//             }
//             const edition = await Edition.findOneAndDelete({file:fileId});
//             const edition_id = edition.get('_id');
//             const book = Book.findById({_id:BookId});
//             const modify = book.deleteOne({editions:edition_id});
//             console.log(modify);
//     }
//     catch(err){
//         const e = new AppError(err.message, 500);
//         e.sendResponse(res);
//     }
// }

 async function updateFiles (req, res){
  const fileId = req.params.fileId;
  const { bookId, edition_num } = req.body;
  const newFileData = req.file.buffer; // Assuming you have the new file data in the request

  try {
    // Delete existing file from Files collection
    await File.findByIdAndDelete(fileId);

    // Find the corresponding edition using the fileId
    const existingEdition = await Edition.findOne({ file: fileId });

    if (!existingEdition) {
      return res.status(404).json({ message: 'Edition not found' });
    }

    const editionIdToDelete = existingEdition._id;

    // Delete the corresponding edition from Editions collection
    await Edition.findByIdAndDelete(editionIdToDelete);

    // Remove edition reference from Book's editions array
    await Book.findByIdAndUpdate(bookId, { $pull: { editions: editionIdToDelete } });

    // Create new file record and save it
    const newFile = new File({
      fileData: newFileData,
    });
    const savedFile = await newFile.save();

    // Create a new edition with the new file's id
    const newEdition = new Edition({
      edition_num: edition_num,
      file: savedFile._id,
    });
    const savedEdition = await newEdition.save();

    // Add the new edition's id to Book's editions array
    await Book.findByIdAndUpdate(bookId, { $push: { editions: savedEdition._id } });

    res.status(200).json({ message: 'File updated successfully' });
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ message: 'Error updating file' });
  }
};


module.exports = {
    addBook,
    updateBook,
    deleteBook,
    addNewEdition,
    downloadFiles,
    updateFiles
};
