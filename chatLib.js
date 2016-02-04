var blessedHelpers = require('blessed').helpers
var login = require("facebook-chat-api");



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

var friendIDMap = {
	//friendId: friendName
}

exports.chats = chats
exports.mostRecent = mostRecent
exports.friendIDMap = friendIDMap

var lastThread = null;
exports.api = null

exports.authenticate = function(credentials){//where credentials is the user's credentials as an object, fields `email` and `password
		
	login(credentials, function(err, api) {

		if(err) return console.error(err);

		exports.api = api
		
		console.log("Logged in as " + credentials.email)
		me = api.getCurrentUserID()
		exports.me = me

		api.getUserInfo([me], function(err, friends) {
			if(err) return console.error(err);
	
			var friendArray = []
	
			for(var friendID in friends) {
				friendArray.push(friends[friendID])
				friendIDMap[friendID] = friends[friendID]
			}
		});

		api.setOptions({
			logLevel: "silent"
		})
		
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

							
						
						api.getThreadHistory(threadCopy.threadID, 0, 10, Date.now(), function(err, history){
							if(err){ return console.log(err)}
							
							for(var j = 0; j < history.length; j++){
							
								var message = history[j];

								(function(messageCopy){handleMessage(messageCopy, threadCopy.threadID)})(message);
							}
							
							
							chatLoadComplete[index] = true

							if(chatLoadComplete.every(function(e){return e == true})){
								console.log("Done!")
								createUI()
							}else{
								var percentage = chatLoadComplete.filter(function(e){return e}).length / chatLoadComplete.length * 100
								console.log("Loading: " + percentage + "%")
							}
							// createUI()
						})
						
						// createUI()

					})
				})(thread, i);
				
				
				
				
			}
		})
		
		
		function handleMessage(message, threadID){//bug - for some reason, group message objects ielded thru getThreadHistory have 'null' threadIDs
			var formattedMessage = messageToText(message)
			chats[message.threadID || threadID].messageHistory.push(formattedMessage)//add message to chat history
		}

		exports.handleMessage = handleMessage

		function messageToText(message){//takes a message object and turns it into a piece of text

			var from = message.threadName

			var formattedMessage = "{bold}" + message.senderName + "{/bold}"
			
			if(message.type != "message"){
				return
			} else if(message.body !== undefined && message.body != ""){
				formattedMessage += ": " + blessedHelpers.escape(message.body)
			} else if(message.attachments.length > 0){
				var attachment = message.attachments[0]//only first attachment
				var attachmentType = attachment.type.replace(/\_/g," ")
				formattedMessage += " sent a " + attachmentType
			}
			
			return formattedMessage

		}

		exports.messageToText = messageToText

		api.listen(function cb(err, message) {
			if(err)
				return console.log(err)
			
			var threadID = message.threadID

			
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
			
			handleMessage(message)

			
			process.stderr.write("\007");//makes a beep
			
			
		});
		
		
		function createUI(){
			console.log("Ready!")
			console.log(chats)
			console.log("\n----\n")
			console.log(friendIDMap)
			var ui = require('./ui.js')
			
			ui.start()
		}

	});
}
