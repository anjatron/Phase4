// This file holds some basic data logic for inserting, updating, or getting all calls. 
var config = require('../config.js')
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

exports.insertCall = function (call) {
	MongoClient.connect(config.DB_URL, function (error, db) {
		if (error) console.log(error); // im logging the errors, but in production these would thrown

		db.collection('calls').insert(call, function (error, call) {
			if (error) console.log(error);

			db.close();
		});
	});
}

exports.getAllCalls = function (res) {
	MongoClient.connect(config.DB_URL, function (error, db) {
		if (error) console.log(error);

		db.collection('calls').find({}).toArray(function (error, calls) {
			if (error) console.log(error);

			res.send(calls);

			db.close();
		});
	});
}

exports.updateCall = function (call, fields) {
	MongoClient.connect(config.DB_URL, function (error, db) {
		if (error) console.log(error);

		db.collection('calls').update({timestamp: call.timestamp}, {$set: fields}, {upsert: false}, function (error, call) {
			if (error) console.log(error);

			db.close();
		});
	});
}
