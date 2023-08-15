const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const path = require('path');
const multer = require('multer');

// Create an instance of multer for handling file uploads
const upload = multer({
    limits: {
        fileSize: 1048576 // 1 mb
    }
});
router.post('/add-book', upload.single('file'), bookController.addBook);
router.post('/add-new-edition/:bookId', upload.single('file'), bookController.addNewEdition);
router.put('/update-book/:id', bookController.updateBook);
router.delete('/delete/:id', bookController.deleteBook);


module.exports = router;
