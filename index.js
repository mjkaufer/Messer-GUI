#! /usr/bin/env node
var login = require("facebook-chat-api");
var lastThread = null;

if(process.argv.length < 3){//user didn't store credentials in JSON, make them manually enter credentials

	//return console.log("Please specify a config JSON as your second argument!")
	var prompt = require('prompt')
	console.log("Enter your Facebook credentials - your password will not be visible as you type it in")
	prompt.start();

	prompt.get([{
			name: 'email',
			required: true
		}, {
			name: 'password',
			hidden: true,
			conform: function (value) {
				return true;
			}
		}], function (err, result) {
			authenticate(result)
	});

} else{
	var fs = require('fs')
	fs.readFile(process.argv[2], function(err, data){
		if(err)
			return console.log(err)

		authenticate(JSON.parse(data))
	})
}

function authenticate(credentials){//where credentials is the user's credentials as an object, fields `email` and `password
	login(credentials, function(err, api) {

		if(err) return console.error(err);
		
		var me = api.getCurrentUserID()

		var blessed = require('blessed')

		console.log("Logged in as " + credentials.email)

		api.setOptions({
			logLevel: "silent"
		})
		
		var friendIDMap = {
			//friendId: friendName
		}
		
		function findNames(friendIDArray, callback){
			api.getUserInfo(friendIDArray, function(err, friends) {
				if(err) return console.error(err);
		
				var friendArray = []
		
				for(var friendID in friends) {
					friendArray.push(friends[friendID])
					friendIDMap[friendID] = friends[friendID]
				}
				// console.log(friends)
				if(callback)
					callback(err, friendArray)
			});
		}
		
		var chats = {
			/*
			threadID: {
				participants: [participantIDs,...],
				name: "chatname",
				messageHistory: [
					//messages, where index 0 is first and last index is most recent
				]
			}
			
			*/
		}
		
		var mostRecent = [
			//threadIDs sorted from most recent at 0 to least recent at index.length-1	
		]
		
		var startingChatList = 5
		
		var chatLoadComplete = new Array(startingChatList)
		for(var i = 0; i < chatLoadComplete.length; i++)
			chatLoadComplete[i] = false

		api.getThreadList(0, startingChatList, function(err, threads){
			if(err) return console.log(err)
			for(var i = 0; i < threads.length; i++){
				var thread = threads[i]
				// console.log("------------")
				// console.log(thread.name)
				// console.log('"' + thread.snippet + '"')
				
				// console.log("------------")
				// console.log(thread)
				try{
				mostRecent.push(thread.threadID)
				} catch(e){console.log(e)}
				
				(function(threadCopy, index){
					findNames(threadCopy.participants.filter(function(e){return e != me}), function(err, arr){
						if(err){ return console.log(err)}

						chats[threadCopy.threadID] = {
							participants: threadCopy.participants,
							name: threadCopy.name || arr[0].name,
							messageHistory: []
						}
						chatLoadComplete[index] = true
						if(chatLoadComplete.every(function(e){return e == true}))
							createUI()
						else{
							var percentage = chatLoadComplete.filter(function(e){return e}).length / chatLoadComplete.length * 100
							console.log("Loading: " + percentage + "%")
						}
					})
				})(thread, i)
				
				
				
				
			}
		})
		


		api.listen(function cb(err, message) {
			if(err)
				return console.log(err)
			
			var from = message.threadName
			var threadID = message.threadID

			var formattedMessage = message.senderName
			
			if(message.type != "message"){
				return
			} else if(message.body !== undefined && message.body != ""){
				formattedMessage += ": " + message.body
			} else if(message.attachments.length > 0){
				var attachment = message.attachments[0]//only first attachment
				var attachmentType = attachment.type.replace(/\_/g," ")
				formattedMessage += " sent a " + attachmentType
			}
			
			if(mostRecent.indexOf(threadID) != -1)
				mostRecent.splice(0, 0, mostRecent.splice(mostRecent.indexOf(threadID), 1)[0] );
			else{
				mostRecent.unshift(threadID)
				chats[threadID] = {
					participants: message.participantIDs,
					name: message.threadName,
					messageHistory: []
				}
				findNames(message.participantIDs)
			}
			
			chats[threadID].messageHistory.push(formattedMessage)//add message to chat history

			
			process.stderr.write("\007");//makes a beep
			
			
		});
		
		function createUI(){
			console.log("Ready!")
			console.log(chats)
			console.log("\n----\n")
			console.log(friendIDMap)
		}

	});
}


		
