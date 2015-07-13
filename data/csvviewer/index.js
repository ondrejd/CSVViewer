/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * ...
 */
function onOpen() {
	console.log('[csvviewer/index.js].onOpen()');
	// ...
} // end onOpen()

/**
 * ...
 */
function onClose() {
	console.log('[csvviewer/index.js].onClose()');
	// ...
} // end onClose()

/**
 * ...
 */
function onReady(aCsvDocument) {
	console.log('[csvviewer/index.js].onReady()');
	console.log(aCsvDocument);

	// Create data table
	//var dataTable = new DataTablePrototype('data-table', aCsvDocument);
	//dataTable.attachTo(document.getElementById('main'));

} // end onReady()

/**
 * ...
 */
function onPageShow() {
	console.log('[csvviewer/index.js].onPageShow()');
	// ...
} // end onPageShow()

// ==========================================================================
// Register events emitters/recievers. 

self.port.on('open', onOpen);
self.port.on('close', onClose);
self.port.on('ready', onReady);
self.port.on('page_show', onPageShow);
