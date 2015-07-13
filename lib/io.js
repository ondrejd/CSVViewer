/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let { Cc, Ci } = require('chrome');

/**
 * Shows file picker and returns path of selected file. If no file is selected 
 * returns empty string.
 *
 * @see https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Creating_reusable_modules
 * @returns {String}
 */
function filepicker() {
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
} // end filepicker()

// Export public functions
exports.filepicker = filepicker;
