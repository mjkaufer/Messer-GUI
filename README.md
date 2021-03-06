# Messer-GUI

Command-line messaging for Facebook Messenger, now with a pretty GUI

**Note: This project is not yet finished, and should not be used. In the meantime, you can use [Messer](http://github.com/mjkaufer/Messer).**

## Installation

Install `messer-gui` globally with `npm install messer-gui -g`, so you can use the command in any context.

## Setup

Make sure you are running Node 4.x

~~If you want to log in with your credentials stored in a file, do the following - otherwise, you'll log in by typing in your credentials each time you run Messer-GUI~~ This doesn't work right now, because any prompting messes with `blessed. I've tried both `prompt` and `read` - both make the `listtable` in `blessed` act really funky

Create a `config.json` somewhere. Inside of the `config.json`, add

```
{
	"email": "email",
	"password": "password"
}
```
Fill in the email you use for Facebook, along with your Facebook password

## Usage

If you stored your credentials in a json, simply type `messer-gui path/to/config.json`, replacing `path/to/config.json` with the path to your `config.json` Otherwise, type `messer-gui` and input your email and password as you are prompted for them. The password will not be visible as you type it in.

Once you're logged in, you'll see a GUI. This has yet to be designed, so more instructions will come.

## Todo

* Update message history with new messages (easy)
* Ability to send messages (sorta easy)
* Make `blessed` work with `prompt` and/or `read` modules (tricky)

* Make an option to use prettier UI vs plain text
* Giphy support - send random gif based on text user sends

## Warnings

facebook-chat-api@1.0.6 relies on a version of node which requires basic ES6 support - use facebook-chat-api@1.0.5 if you have an older version of node

Windows is a bit glitchy with `blessed`, so try using Linux or OSX if you can.

## Contributing

Send a pull request! Check out the list of todos