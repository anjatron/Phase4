var config = require('../config.js');
var express = require('express');
var twilio = require('twilio');

// var router = express.Router();
var app = express();
var client = twilio(config.TWILIO_SID, config.TWILIO_AUTH_TOKEN);

var voice_options = {
    voice: 'woman',
    language: 'en-gb'
}

app.get('/phonebuzz', function (req, res) {
    res.render('index', {title: 'Lets play a game!'});
});

app.post('/phonebuzz/placeCall', function (req, res) {
    if (req.body.phone_number !== '') {
        client.makeCall({
            to: req.body.phone_number,
            from: config.TWILIO_NUMBER,
            url: 'http://' + req.headers.host + '/phonebuzz/respondToCall'
        }, function (error, message) {
            if (error) {
                res.status(500).send(error);
            } else {
                res.send({
                    message: 'Thank you! We will be calling you shortly.'
                });
            }
        });
    }
});

// Where the phone buzz magic happens
app.post('/phonebuzz/respondToCall', function (req, res) {

    // the Twilio module for node comes with validation for Express, switch out my token with yours
    if (twilio.validateExpressRequest(req, config.TWILIO_AUTH_TOKEN)) {
        var twiml = new twilio.TwimlResponse();

        // Prompt the user to end a number 
    	twiml.say('Hello there, let\'s play phone buzz! ', voice_options)
            .gather({
                action: 'http://' + req.headers.host + '/phonebuzz/playGame',
                method: 'GET',
                finishOnKey: '#'
            }, function (node) {
    		 	node.say('Start by entering a number.', voice_options)
                    .pause({
                        length: 1
                    });
    		});

    	// Render twiml response
    	res.writeHead(200, {'Content-Type': 'text/xml'});
    	res.end(twiml.toString()); 
    } else {
        res.status(403).send('you are not twilio, buzz off');
    }
});

app.get('/phonebuzz/playGame', function (req, res) {
    var twiml2 = new twilio.TwimlResponse();

    // Get the game results
	var results = fizzbuzz(req.query.Digits);

    // Respond with the game verdict!
    twiml2.say('The game output is: ' + results, voice_options)
         .pause({
            length: 1
         })
         .say('Thank you for playing', voice_options)
         .hangup();

	res.writeHead(200, {'Content-Type': 'text/xml'});
	res.end(twiml2.toString()); 
});

function fizzbuzz(number) {
    var output = '';

    for (var count = 1; count <= number; count++) {
        if (count % 3 === 0 && count % 5 === 0) {
            output += 'FizzBuzz, ';
        } else if (count % 5 === 0) {
            output += 'Buzz, ';
        } else if (count % 3 === 0) {
            output += 'Fizz, ';
        } else {
            output += String(count) + ', ';
        }
    }
    return output;
}

module.exports = app;