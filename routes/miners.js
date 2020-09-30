import { getMiners } from "../service/miners";

var express = require('express');
var router = express.Router();

router.get('/', getMiners);

module.exports = router;
