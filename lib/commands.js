/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let { Cu } = require('chrome');
let self = require('sdk/self');
let tabs = require('sdk/tabs');
let {
	TextDecoder,
	TextEncoder,
	OS
} = Cu.import('resource://gre/modules/osfile.jsm', {});

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
 * Create new CSV document command.
 */
function cmd_NewCsvDocument() {
	tabs.open({
		url: self.data.url('csvviewer/index.html'),
		onReady: function (aTab) {
			console.log('newFileCmd -> tab -> onReady');
			console.log(aTab);
		}
	});
} // end cmd_NewCsvDocument()

/**
 * Open CSV document command.
 */
function cmd_OpenCsvDocument() {
	console.log('[lib/commands].cmd_OpenCsvDocument()');

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
		/**
		 * Called when the file is successfully readed.
		 * @param {Array} aData An array with readed chars.
		 */
		function onSuccess(aData) {
			let decoder = new TextDecoder();
			let csv = decoder.decode(aData);
			let doc = require('./doc.js').createDocument(csv);

			// Open tab with the CSVViewer's main page.
			tabs.open({
				url: self.data.url('csvviewer/index.html'),
				/**
				 * Called when the page is ready.
				 * @param {Object} aTab
				 */
				onReady: function onMainPageReady(aTab) {
					// Attach the worker
					let worker = aTab.attach({
						contentScriptFile: [
							self.data.url('csvviewer/DataTablePrototype.js'),
							self.data.url('csvviewer/index.js'),
						],
					});

					// Listen for request for closing the page
					worker.port.on('close_page', function() {
						aTab.close();
					});

					// Pass resulting object to the tab
					worker.port.emit('ready', doc);
				} // end onMainPageReady(aTab)
			});
		}
	);
} // end cmd_OpenCsvDocument()

/**
 * Open add-on's home page.
 */
function cmd_OpenHomepage() {
	// Check if homepage is already opened - if yes bring it to the foreground.
	for (let tab of tabs) {
		// We don't check exact match just the main URL
		if (tab.url.indexOf(HOMEPAGE_URL) != -1) {
			tab.activate();
			return;
		}
	}
	// Homepage is not opened yet - open it
	tabs.open(HOMEPAGE_URL);
} // end cmd_OpenHomepage()

/**
 * Open add-on's preferences page.
 */
function cmd_OpenPreferences() {
	Services.wm.getMostRecentWindow('navigator:browser').
		BrowserOpenAddonsMgr('addons://detail/' + ADDON_ID + '/preferences');
} // end cmd_OpenPreferences()

// Export all public items
exports.ADDON_ID = ADDON_ID;
exports.HOMEPAGE_URL = HOMEPAGE_URL;
exports.newCsvDocument = cmd_NewCsvDocument;
exports.openCsvDocument = cmd_OpenCsvDocument;
exports.openHomepage = cmd_OpenHomepage;
exports.openPreferences = cmd_OpenPreferences;
