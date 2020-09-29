import { signIn, createUser, getProfile } from "../service/user";

var express = require('express');
var router = express.Router();

router.post('/signup', createUser);
router.post('/signin', signIn);
router.get('/:id', getProfile);

module.exports = router;
