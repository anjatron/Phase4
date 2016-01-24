# PhoneBuzz - Phase 2
An implementation of FizzBuzz but over the phone using [Twilio](https://www.twilio.com/). It's a simple API that requires you to have a Twilio number to access the endpoint and the PhoneBuzz magic.

Created by: Anja Draskovic
Purpose: LendUp coding challenge

##Process
Brief desciption of how I started the project. 
- Reference tutorial
- List challenges

## Quick Start
This application requires you to have an exisiting Twilio account so you can point your Twilio number to it. 
I used [ngrok](https://ngrok.com/) to fire up my app publicly for Twilio to interact with. 
Under Phone Number > Manage, change the Request URL for your numbers Voice capabilities to whichever server you happen to be using. Then add the phonebuzz endpoint (Note: keep the HTTP method as POST): 
	http://example.com/phonebuzz/respondToCall

After starting the server, open: example.com/phonebuzz

The landing page will prompt you to submit a phone number. Once submitted the number entered will be dialed and the Phonebuzz game will start. 
