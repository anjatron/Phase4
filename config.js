
// Hold all info needed for the Twilio API along with server information just to make it easier later on since ngrok changes
// urls every new tunnel.

var credentials = {
	TWILIO_SID: 'ACae611fb6aba23630e0805c97cfe4bc23',

	TWILIO_AUTH_TOKEN: '65521f5f40de05bdcb3980a3eb9cea84',

	TWILIO_NUMBER: '+18173506843',

	SERVER_URL: 'https://fc2f7b87.ngrok.io',

	DB_URL: 'mongodb://localhost:27017/Phase4'
}

module.exports = credentials;