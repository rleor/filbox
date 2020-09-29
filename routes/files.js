import { uploadFile, searchFiles, putFile, downloadFileByCid } from "../service/files";
import multer from "multer";

var express = require('express');
var router = express.Router();

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), uploadFile);
router.get('/', searchFiles);
router.post('/', putFile); // for test.
router.get('/:cid', downloadFileByCid);

module.exports = router;
