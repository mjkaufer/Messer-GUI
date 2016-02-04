#! /usr/bin/env node
var chatLib = require('./chatLib.js')

// var chats = {
// 	/*
// 	threadID: {
// 		participants: [participantIDs,...],
// 		name: "chatname",
// 		messageHistory: [
// 			//messages, where index 0 is first and last index is most recent
// 		]
// 	}
	
// 	*/
// }

// var mostRecent = [
// 	//threadIDs sorted from most recent at 0 to least recent at index.length-1	
// ]

// var friendIDMap = {
// 	//friendId: friendName
// }

var chats = chatLib.chats
var mostRecent = chatLib.mostRecent
var friendIDMap = chatLib.friendIDMap

var me = null;



if(process.argv.length < 3){//user didn't store credentials in JSON, make them manually enter credentials

	return console.log("Please specify a config JSON as your second argument!")

	//have to comment this stuff out temporarily because blessed is not playing nice with prompt or other password prompting modules

	// var prompt = require('prompt')
	// console.log("Enter your Facebook credentials - your password will not be visible as you type it in")
	// prompt.start();

	// prompt.get([{
	// 		name: 'email',
	// 		required: true
	// 	}, {
	// 		name: 'password',
	// 		hidden: true,
	// 		conform: function (value) {
	// 			return true;
	// 		}
	// 	}], function (err, result) {
	// 		prompt.pause()
	// 		return authenticate(result)
	// });

} else{
	var fs = require('fs')
	fs.readFile(process.argv[2], function(err, data){
		if(err)
			return console.log(err)

		chatLib.authenticate(JSON.parse(data))
	})
}


		
