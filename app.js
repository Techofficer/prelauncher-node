var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var path = require("path");
var methodOverride = require('method-override');
var models = require('./models');
var config = require(path.join(__dirname, './config/config.json'));
var multer = require("multer");
var http = require('http');

var routes = require("./config/routes")


app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, './public')));

app.use(methodOverride('_method'));
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ dest: 'public/uploads/'}));

routes.activate(app);

app.use(function(req, res, next) {
  res.sendStatus(404);
});

app.use(function(err, req, res, next) {
	console.log(err);
    res.sendStatus(err.status || 500);
});

var port = process.env.PORT || config["server"]["port"];
app.set('port', port);


var server = http.createServer(app);

models.sequelize.sync().then(function() {
	server.listen(port);
});

module.exports = app;