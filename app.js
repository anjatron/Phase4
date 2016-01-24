// -- SETUP
var bodyParser = require('body-parser');
var express = require('express');
var path = require('path');

var app = express();
var PORT = process.env.port || 8000;

// Specify the phonebuzz routes
var phonebuzz = require('./routes/phonebuzz.js');

// -- CONFIG MIDDLEWARE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', phonebuzz);


// - START SERVER
app.listen(PORT, function () {
	console.log('Magica is happening at: ', PORT);
});