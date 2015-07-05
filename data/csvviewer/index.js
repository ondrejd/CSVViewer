/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var addon = {
	port: {
		on: function(aWhat, aCallback) {
			console.log(aWhat, aCallback);
		}
	}
};

// Register event listeners when panel is showing.
addon.port.on('show', function onShow() {
	console.log('[csvviewer.js].show()');
	// ...
});

// Remove registered event listeners when panel is hiding.
addon.port.on('hide', function onHide() {
	console.log('[toolbarpanel.js].hide()');
	// ...
});
