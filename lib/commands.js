/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let { Cu } = require('chrome');
let self = require('sdk/self');
let tabs = require('sdk/tabs');
let { TextDecoder, OS } = Cu.import('resource://gre/modules/osfile.jsm');

Cu.import('resource://gre/modules/Services.jsm');

/**
 * Add-on's identifier (located in `package.json`).
 * @type {String}
 */
const ADDON_ID = require('../package.json').id;

/**
 * Add-on's homepage URL (located in `package.json`).
 * @type {String}
 */
const HOMEPAGE_URL = require('../package.json').homepage;

/**
 * Called when tab with the main page is ready.
 * @param {Tab} aTab
 * @param {CsvDocument} aCsvDocument 
 */
function onMainPageReady(aTab, aCsvDocument) {
	// Attach the worker
	let worker = aTab.attach({
		contentScriptFile: self.data.url('csvviewer/index.js')
	});

	// Listen for request for closing the page
	worker.port.on('close_page', function() {
		aTab.close();
	});

	// Pass resulting object to the tab
	worker.port.emit('ready', aCsvDocument);
} // end onMainPageReady(aTab, aCsvDocument)

/**
 * Create new CSV document command.
 */
function cmd_New() {
	tabs.open({
		url: self.data.url('csvviewer/index.html'),
		onReady: function (aTab) {
			onMainPageReady(aTab, require('lib/doc.js').createBlankDocument());
		}
	});
} // end cmd_New()

/**
 * Open CSV document command.
 */
function cmd_Open() {
	let path = require('./io.js').filepicker();
	if (path === '') {
		return;
	}

	// TODO Should be like this:
	/*doc.openDocument(path).then(
		function onSuccess(csvDocument) {
			console.log(csvDocument);
		}
	);*/

	let promise = OS.File.read(path);
	promise = promise.then(
		function onSuccess(aData) {
			let decoder = new TextDecoder();
			let csv = decoder.decode(aData);
			let doc = require('./doc.js').createDocument(csv);

			tabs.open({
				url: self.data.url('csvviewer/index.html'),
				onReady: function (aTab) {
					onMainPageReady(aTab, doc);
				}
			});
		},
		function(aError) {
			console.log('Reading CSV file failed...');
			console.log(aError);
		}
	);
} // end cmd_Open()

/**
 * Open add-on's preferences page.
 */
function cmd_Settings() {
	Services.wm.getMostRecentWindow('navigator:browser').
		BrowserOpenAddonsMgr('addons://detail/' + ADDON_ID + '/preferences');
} // end cmd_Settings()

/**
 * Open new tab with given URL.
 * @param {String} aUrl
 */
function openTab(aUrl) {
	// Check if page is already opened - if yes bring it to the foreground.
	for (let tab of tabs) {
		if (tab.url.indexOf(HOMEPAGE_URL) != -1) {
			tab.activate();
			return;
		}
	}
	// Page is not opened yet - open it
	tabs.open(aUrl);
} // end openTab(aUrl)

// Export all public items
exports.cmdNew = cmd_New;
exports.cmdOpen = cmd_Open;
exports.cmdSettings = cmd_Settings;
exports.cmdHomepage = function() { openTab(HOMEPAGE_URL); };
