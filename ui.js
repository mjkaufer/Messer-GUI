var blessed = require('blessed')
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

var chatList = []
updateChatList([])



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

var title = blessed.log({
	parent: form,
	mouse: true,
	right: 3,
	top: 2,
    align: 'left',
    height: 3,
	width: '80%+6',
	valign: 'middle',
	align: 'center',
	style: {
		bg: darkPrimary,
		fg: lightSecondary,
    	bold: true,
	},
	scrollable: true,
	content: "Chat Title"
	//alwaysScroll: true
});

var output = blessed.log({
	parent: form,
	mouse: true,
	right: 3,
	top: 5,
    align: 'left',
    height: '100%-11',
	width: '80%+6',
	style: {
		bg: lightSecondary,
		fg: darkPrimary,
	},
	scrollable: true,
	content: "No messages."
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
	form.submit();
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
    
chatListTable.on('select', function(el, em){
    console.log("AA")

    
    console.log("@" + el.index + "@")
})
    
chatListTable.setData(chatList);

// chatListTable.focus();

screen.append(chatListTable);

exports.start = function(){
    console.log('ui started')

    screen.render();
    chatListTable.focus()

    
}

exports.start()

function updateChatList(recentChats){//array of the names of the recent chats
    recentChats = (recentChats.length == 0) ? ["No messages"] : recentChats
    chatList = recentChats.map(function(e){return [e]})
    chatList.unshift([chatListHeader])
    return chatList
}

exports.updateChatList = updateChatList