/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let { Cc, Ci } = require('chrome');
let tabs = require('sdk/tabs');

/**
 * Shows file picker and returns path of selected file. If no file is selected 
 * returns empty string.
 *
 * @see https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Creating_reusable_modules
 * @returns {String}
 */
function Utils_Filepicker() {
	let nsIFilePicker = Ci.nsIFilePicker;
	let fp = Cc['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);
	let win = require('sdk/window/utils').getMostRecentBrowserWindow();
	let path = '';

	fp.init(win, 'Select CSV file', nsIFilePicker.modeOpen);
	fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);

	var rv = fp.show();
	if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
		path = fp.file.path;
	}

	return path;
} // end Utils_Filepicker()

/**
 * Open new tab with given URL.
 * @param {String} aUrl
 */
function Utils_OpenTab(aUrl) {
	// Check if page is already opened - if yes bring it to the foreground.
	for (let tab of tabs) {
		if (tab.url.indexOf(aUrl) != -1) {
			tab.activate();
			return;
		}
	}
	// Page is not opened yet - open it
	tabs.open(aUrl);
} // end Utils_OpenTab(aUrl)

// ==========================================================================
// Export public functions and objects

exports.filepicker = Utils_Filepicker;
exports.openTab    = Utils_OpenTab;
