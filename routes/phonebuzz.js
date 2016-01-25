var config = require('../config.js');
var express = require('express');
var twilio = require('twilio');

var app = express();
var client = twilio(config.TWILIO_SID, config.TWILIO_AUTH_TOKEN);

// DATA
var db = require('../db/db_utils.js');

// VARIABLES
var voice_options = {
    voice: 'woman',
    language: 'en-gb'
}

var callingAgain = false; // to help us redirect the twilio request url
var thisCall = {}; // track the call that is going to be re-dialed 
var newCall = {}; // track our new call

// ROUTES
app.get('/phonebuzz', function (req, res) {
    res.render('index', {title: 'Lets play a game!'});
});

// Make the call
app.post('/phonebuzz/placeCall', function (req, res) {
    // Carry on if we've receieved both the number to call and the time delay
    if (req.body.phone_number !== '' && req.body.delay !== '') {
        var delay = req.body.delay.split(' ');

        // Process the time delay input
        var check = processTimeDelay(delay);

        // Once the right time has passed let's make a call! 
        if (check.time_passed) {

            //Make the call
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

            newCall = {
                phone_number: req.body.phone_number,
                timestamp: check.timestamp,
                delay: delay[0] + ' ' + check.interval,
                game_results: '' 
            }

            db.insertCall(newCall);
        }

    }
});

// Where the phone buzz magic happens
app.post('/phonebuzz/respondToCall', function (req, res) {

    // the Twilio module for node comes with validation for Express, switch out my token with yours
    if (twilio.validateExpressRequest(req, config.TWILIO_AUTH_TOKEN)) {
        var twiml = new twilio.TwimlResponse();

        if (callingAgain) {
            // Redirect the user to replay the game results
            twiml.say('Welcome back to phone buzz!', voice_options)
                 .redirect('http://' + req.headers.host + '/phonebuzz/gameRecap');
        } else {
            // Prompt the user to end a number 
        	twiml.say('Hello there, let\'s play phone buzz! ', voice_options)
                .gather({
                    action: 'http://' + req.headers.host + '/phonebuzz/playGame',
                    method: 'GET',
                    finishOnKey: '#'
                }, function (node) {
        		 	node.say('Start by entering a number, followed by pound sign.', voice_options)
                        .pause({
                            length: 1
                        });
        		});            
        }

    	// Render twiml response
    	res.writeHead(200, {'Content-Type': 'text/xml'});
    	res.end(twiml.toString()); 
    } else {
        res.status(403).send('Wait a minut you are not twilio, get outta here!');
    }
});

// Run the game logic and tell the user their results
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

    // Add the game results to this call
    // newCall.game_results = results;
    db.updateCall(newCall, {game_results: results});

	res.writeHead(200, {'Content-Type': 'text/xml'});
	res.end(twiml2.toString()); 
});

// Re-dial the number and replay the game results from that call
app.get('/phonebuzz/callAgain', function (req, res) {
    callingAgain = true; // now the twilio request url knows we're calling again

    thisCall = req.query; // track the call we want to re-dial

    client.makeCall({
        to: req.query.phone_number,
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
});

// Replay the game results
app.post('/phonebuzz/gameRecap', function (req, res) {
    var date = new Date();
    var new_timestamp = String(date).substr(4, 20);

    twiml3 = new twilio.TwimlResponse();

    callingAgain = false; // reset 
    thisCall.timestamp = new_timestamp; // update the call timestamp

    twiml3.say('Hello there, the results of this game were: ' + thisCall.game_results, voice_options)
          .pause({
            length: 1
          })
          .say('Thank you for calling back!', voice_options)
          .hangup();

    db.insertCall(thisCall);

    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml3.toString()); 
});

// Show all of the call history 
app.get('/phonebuzz/callHistory', function (req, res) {
    db.getAllCalls(res);
});


// HELPER METHODS
// Game logic
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
    return output.trim();
}

// Process the time delay entered
function processTimeDelay(delay) {
    var date = new Date();  // get the current datetime

    var initial_time = ''; // initial time of submission we'll be adding our delay to
    var projected = ''; // calculate which min we should call
    var time_passed = false;    // indicated if the time has passed or not
    var timestamp = ''; // we'll return that time of the call
    var interval = '';  // helper to keep of track of which time interval type we're dealing with

    // Check which time interval we're dealing with
    if (delay[1].match(/min(.*)/)) {

        initial_time = date.getMinutes();
        interval = 'min';
    } else if (delay[1].match(/h(.*)/)) {

        initial_time = date.getHours();
        interval = 'hr';
    } else if (delay[1].match(/sec(.*)/)) {

        initial_time = date.getSeconds();
        interval = 'sec';
    }   

    projected  = Number(initial_time) + Number(delay[0]);

    // Keep checking the time to see if we've reached our projected value
    while (!time_passed) {
        var incrDate = new Date();

        if (interval === 'min') {

            if (projected === Number(incrDate.getMinutes())) {
                time_passed = true;
                timestamp = String(incrDate).substr(4, 20);
            } else {
                time_passed = false;
            }
        } else if (interval === 'hr') {

            if (projected === Number(incrDate.getHours())) {
                time_passed = true;
                timestamp = String(incrDate).substr(4, 20);
            } else {
                time_passed = false;
            }
        } else if (interval === 'sec') {
            if (projected === Number(incrDate.getSeconds())) {
                time_passed = true;
                timestamp = String(incrDate).substr(4, 20);
            } else {
                time_passed = false;
            }            
        }
    }

    // We need to return some of our results: when the call will be made, if that time has passed, what type of delay
    return {timestamp: timestamp, time_passed: time_passed, interval: interval};
}

module.exports = app;