// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: calendar-alt;

// CREDITS
// Created by u/flasozzi
// Background image code by u/ben5292001

// READ THE INSTRUCTIONS BELOW
// You need to both edit the code and add parameters in order to personalise the widget.

// To add parameters, add the widget to your home, long press it and tap 'edit widget'
// Your parameter must have the following format: image.png|padding-top|text-color|countdown-end-date|countdown-title
// The image should be placed in the iCloud Scriptable folder (case-sensitive).
// The padding-top spacing parameter moves the text down by a set amount.
// The text color parameter should be a hex value.
// For example, to use the image bkg_fall.PNG with a padding of 20, a text color of red with a countdown to your holidays on Dec 16 2020
// the parameter should be typed as: bkg_fall.png|20|#ff0000|December 16 2020|holidays
// All parameters are required and separated with "|"
// Parameters allow different settings for multiple widget instances.

let widget = new ListWidget();
var today = new Date();

var widgetInputRAW = args.widgetParameter;

try {
  widgetInputRAW.toString();
} catch (e) {
  throw new Error('Please long press the widget and add a parameter.');
}

var widgetInput = widgetInputRAW.toString();

var inputArr = widgetInput.split('|');

var spacing = parseInt(inputArr[1]);

// iCloud file path
var scriptableFilePath = '/var/mobile/Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents/';
var removeSpaces1 = inputArr[0].split(' '); // Remove spaces from file name
var removeSpaces2 = removeSpaces1.join('');
var tempPath = removeSpaces2.split('.');
var backgroundImageURLRAW = scriptableFilePath + tempPath[0];

var fm = FileManager.iCloud();
var backgroundImageURL = scriptableFilePath + tempPath[0] + '.';
var backgroundImageURLInput = scriptableFilePath + removeSpaces2;

// For users having trouble with extensions
// Uses user-input file path is the file is found
// Checks for common file format extensions if the file is not found
if (fm.fileExists(backgroundImageURLInput) == false) {
  var fileTypes = ['png', 'jpg', 'jpeg', 'tiff', 'webp', 'gif'];

  fileTypes.forEach(function (item) {
    if (fm.fileExists(backgroundImageURL + item.toLowerCase()) == true) {
      backgroundImageURL = backgroundImageURLRAW + '.' + item.toLowerCase();
    } else if (fm.fileExists(backgroundImageURL + item.toUpperCase()) == true) {
      backgroundImageURL = backgroundImageURLRAW + '.' + item.toUpperCase();
    }
  });
} else {
  backgroundImageURL = scriptableFilePath + removeSpaces2;
}

var spacing = parseInt(inputArr[1]);

// Try/catch for color input parameter
try {
  inputArr[2].toString();
} catch (e) {
  throw new Error('Please long press the widget and add a parameter.');
}

let themeColor = new Color(inputArr[2].toString());

// Try/catch for countdown input parameter
try {
  inputArr[3].toString();
} catch (e) {
  throw new Error('Please long press the widget and add a parameter.');
}

let countdownTo = inputArr[3].toString();

try {
  inputArr[4].toString();
} catch (e) {
  throw new Error('Please long press the widget and add a parameter.');
}

let countdownTitle = inputArr[4].toString();

/* --------------- */
/* Assemble Widget */
/* --------------- */

//Top spacing
widget.addSpacer(parseInt(spacing));

// Countdown
const endtime = countdownTo;
function getTimeRemaining(endtime) {
  const total = Date.parse(endtime) - Date.parse(new Date());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    total,
    days,
    hours,
    minutes,
    seconds,
  };
}

const total = Date.parse(endtime) - Date.parse(new Date());
let progressText = widget.addText(String(getTimeRemaining(endtime).days + 1) + ' days until ' + countdownTitle);
progressText.font = Font.boldSystemFont(22);
progressText.textColor = themeColor;
progressText.shadowColor = Color.black();
progressText.shadowOffset = new Point(1, 1);
progressText.shadowRadius = 2;
progressText.textOpacity = 1;
progressText.centerAlignText();

// Bottom Spacer
widget.addSpacer();
widget.setPadding(0, 0, 0, 0);

// Background image
widget.backgroundImage = Image.fromFile(backgroundImageURL);

// Set widget
Script.setWidget(widget);
