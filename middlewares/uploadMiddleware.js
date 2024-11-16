
const multer = require('multer');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileSizeLimit = 10 * 1024 * 1024;

const upload = multer({
    storage,
    limits: {
        fileSize: fileSizeLimit,
    },
    
});


module.exports = upload;
