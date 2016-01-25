# PhoneBuzz - Phase 4
An implementation of FizzBuzz but over the phone using [Twilio](https://www.twilio.com/). It's a simple API that requires you to have a Twilio number to access the endpoint and the PhoneBuzz magic.

Created by: Anja Draskovic


##Process
This Phase was a build up from Phase 3, which made it easier since I already had a base established. 
- References:
	I primarily used the [Twilio node](http://twilio.github.io/twilio-node/) as my reference, along with there standard [API reference](https://www.twilio.com/docs/api/twiml/gather).
- Challenges:
	Data persistence was a little more difficult that I thought. Since Twilio sends a response back to my input handler, it would update the table before the call had any results. 


## Quick Start
This application requires you to have an exisiting Twilio account so you can point your Twilio number to it. 
I used [ngrok](https://ngrok.com/) to fire up my app publicly for Twilio to interact with. 
Under Phone Number > Manage, change the Request URL for your numbers Voice capabilities to whichever server you happen to be using. Then add the phonebuzz endpoint (Note: keep the HTTP method as POST): 
	http://example.com/phonebuzz/respondToCall

After starting the server, open: example.com/phonebuzz

The landing page will prompt you to submit a phone number and how long you would like the phone call to delay. Once submitted the number entered will be dialed after the specified time interval and the Phonebuzz game will start. 


## Technologies Used
- Node
- MongoDB
- twilio-node


## Structure
This application used MongoDB for data storage. I created a simple Phase4 db with one collection 'calls'. To modify the file db_utils.js, make sure whatever naming convention you may use replaces the collection name. The database URL is located in the config.js file, where all of the credentails are stored. 

Any Twilio related authentication is also stored inside config.js, replace as needed for you account to work.