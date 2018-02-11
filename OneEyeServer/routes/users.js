var express = require('express');
var router = express.Router();
var socket = require('../routes/socket.js');
var unmarshalItem = require('dynamodb-marshaler').unmarshalItem;
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.post('/', function(req, res) {
    console.log(req.body);
    body = JSON.parse(req.body)
    var users = {};
    users["message"] = JSON.parse(body.Message);
    var items = users["message"]["Responses"]["OneEyeAccountList"].map(unmarshalItem);
    res.io.emit("send:message", {users:items[0]});
    res.send(items);
});

module.exports = router;
