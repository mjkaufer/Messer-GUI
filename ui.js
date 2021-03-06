var blessed = require('blessed')
var chatLib = require('./chatLib.js')
var maxChatsToRender = 25
var screen = blessed.screen({
    autoPadding: false,
    fullUnicode: true,
    warnings: true
});
var chatListHeader = "Chats"
var darkPrimary = "#2980b9"
var lightPrimary = "#3498db"
var darkSecondary = "#bdc3c7"
var lightSecondary = "#ecf0f1"

var border = {
    fg: darkSecondary,
}

var inverseBorder = {
    fg: darkPrimary,
    bg: lightSecondary
}

// var chatList = []

var chats = chatLib.chats
var mostRecent = chatLib.mostRecent
var friendIDMap = chatLib.friendIDMap
var api = chatLib.api


var chatListTable = blessed.listtable({
    parent: screen,
    top: 0,
    left: 0,
    data: null,
    border: 'line',
    align: 'center',
    tags: true,
    keys: true,
    shrink: false,
    width: '20%',
    height: '100%',
    vi: true,
    mouse: true,
    scrollable: true,
    style: {
        fg: lightSecondary,
        bg: lightPrimary,
        border: border,
        header: {
            bold: false,
            bg: lightPrimary,
            underline: false,
        },
        cell: {
            selected: {
                fg: darkPrimary,
                bg: lightSecondary,
            }
        },
        focus: {
            header: {
                bold: true,
                underline: true
            }
        }
    }
});

var form = blessed.form({
	parent: screen,
	mouse: true,
	right: 0,
	top: 0,
    border: 'line',
    align: 'left',
    height: '100%',
	width: '80%',
	style: {
		bg: lightSecondary,
		fg: darkPrimary,
		border: border
	},
	scrollable: false,
	//alwaysScroll: true
});

form.on('submit', function(data) {
    //data.messageText
});

var title = blessed.box({
	parent: form,
	mouse: true,
	right: 3,
	top: 2,
    height: 3,
	width: '80%+4',
	valign: 'middle',
	align: 'center',
	style: {
		bg: darkPrimary,
		fg: lightSecondary,
    	bold: true,
	},
	scrollable: true
	//alwaysScroll: true
});

var output = blessed.log({
	parent: form,
	mouse: true,
	right: 3,
	top: 5,
    tags: true,
    align: 'left',
    height: '100%-11',
	width: '80%+4',
	style: {
		bg: lightSecondary,
		fg: darkPrimary,
	},
	scrollable: true
	//alwaysScroll: true
});

var messageText = blessed.textbox({
	parent: form,
	mouse: true,
	border: 'bg',
// 	border: 'line',
	style: {
		bg: lightSecondary,
		fg: darkPrimary,
		border: {
		    bg: darkPrimary
		},
		focus: {
		  //  border: {
		  //      border: 'bg',
		  //      fg: 1,
		  //      bg: 1
		  //  }
		}
// 		border: inverseBorder
	},
	height: 3,
	right: 12,
	bottom: 1,
	width: '80%-5',
	name: 'messageText'
});
var submitButton = blessed.button({
	parent: form,
	mouse: true,
	shrink: true,
	right: 1,
	bottom: 1,
	width: 10,
	height: 3,
	name: 'submit',
	content: 'Send',
	align: 'center',
	valign: 'middle',
	style: {
        bg: lightSecondary,
		fg: darkPrimary,
		focus: {
    	    bg: darkPrimary,
    	    fg: lightSecondary
		}
	}
});
messageText.on('keypress', function(ch, key){
    tabEvent(key)
})
messageText.on('focus', function() {
	messageText.readInput();
});

submitButton.on('press', function() {
	
    var messageToSend = messageText.getValue().trim()
    var threadID = mostRecent[currentIndex]

    if(!(api && threadID && messageToSend.length > 0))
        return false;

    form.submit()
    
    api.sendMessage(messageToSend, threadID, function(e,messageObject){

        if(e)
            return console.log(e)

        var fakeMessageObject = {
            threadID: threadID,
            threadName: chats[threadID].name,
            senderName: friendIDMap[chatLib.me].name,
            body: messageToSend
        }

        chatLib.handleMessage(fakeMessageObject, threadID)//this should push to messageHistory

        updateOutput(threadID)

        output.add(JSON.stringify(fakeMessageObject))
        // messageText.focus()//to do this, we need to integrate with tabevent
        messageText.clearValue()
        screen.render()

    })

    screen.render()
    // console.log("ay")
    

    return true;
    
    
});



var focusableElements = [chatListTable, messageText, submitButton]
var focusedIndex = 0

function tabEvent(key){
    if (key.name == 'tab') {
        focusedIndex = (focusedIndex + (key.shift ? focusableElements.length - 1 : 1)) % focusableElements.length
        focusableElements[focusedIndex].focus()
    }
}

screen.on('keypress', function(ch, key) {
    tabEvent(key)
    
    if (key.name === 'escape' || key.name === 'q') {
        return process.exit(0);
    }
});



// chatListTable.key('enter', function(e, f, g){
//     console.log(e,f, g)
// })

// chatListTable.select = function(e){

// }
var startIndex = 7
var currentIndex = 0
var currentThreadID = getThreadID(currentIndex)

chatListTable.on('select', function(el, em){
    //for some reason, the index of the 0th element is 7, so we'll just do some subtracting
    currentIndex = el.index - startIndex
    currentThreadID = getThreadID(currentIndex)
    updateOutput(currentThreadID)

    
})

function getThreadID(index){
    return mostRecent[index]
}

function updateOutput(threadID){
    try{
        messageHistoryToOutput(chats[threadID].messageHistory)
        updateTitle(threadID)
        screen.render()
    } catch (e){console.log(e)}
}

function updateTitle(threadID){
    title.content = chats[threadID].name
}
    

// chatListTable.focus();

screen.append(chatListTable);

exports.start = function(){
    console.log('ui started')
    screen.render();
    chatListTable.focus()
    updateContent()
    formatOutput()

    updateOutput(getThreadID(0))
    screen.render()
}

function messageHistoryToOutput(messageHistory){
    clearOutput()
    messageHistory.forEach(function(e){
        output.add(e)
    })
}

function shortenString(string, percentage){//percentage is from 0 to 1
    var maxLength = parseInt(percentage * process.stdout.columns)
    console.log(maxLength)
    if(string.length <= maxLength)
        return string
    else if(maxLength < 6)
        return string.substring(0, maxLength)
    return string.substring(0, maxLength - 3).trim() + "..."
}

function updateChatList(recentChats){//array of the names of the recent chats
    recentChats = (recentChats.length == 0) ? ["No messages"] : recentChats
    var chatList = recentChats.map(function(e){return [shortenString(e, 0.2)]})
    chatList.unshift([chatListHeader]);
    chatListTable.setData(chatList)
    
    return chatList
}

function updateContent(){
    updateRecentChats()
    screen.render()
}

function updateRecentChats(){
    var chatNames = []
    mostRecent.forEach(function(threadID){
        chatNames.push(
            chats[threadID].name
        )
    })
    updateChatList(chatNames)
}

function clearOutput(){
    for(var i = 0; i < output.getLines().length; i++){
        output.clearLine(i)
    }
    screen.render()
}

function formatOutput(){//so things are added starting at the bottom
    for(var i = 0; i < process.stdout.rows; i++){
        output.add(".\n")
    }
    clearOutput()
}

exports.updateChatList = updateChatList

exports.escape = blessed.helpers.escape

if(process.argv[1].indexOf("ui.js") != -1){
    exports.start()
    updateChatList(["Dorem"])
    output.add("ayy lmao")
    output.add("test\ntest")
    output.add("{bold}move cotton{/bold}")
    title.content = "1111"
    setTimeout(function(){
        clearOutput()
        screen.render()
    }, 3000)
    screen.render()
}
