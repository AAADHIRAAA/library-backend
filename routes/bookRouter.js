const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const multer = require('multer'); // For handling file uploads
const path = require('path');


// Set up multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Store files in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        const uniqueFileName = `${Date.now()}-${path.extname(file.originalname)}`;
        cb(null, uniqueFileName);
    },
});

const upload = multer({ storage });

router.post('/add', upload.single('file'), bookController.addBook);
router.put('/update/:id', bookController.updateBook);
router.delete('/delete/:id', bookController.deleteBook);


module.exports = router;
