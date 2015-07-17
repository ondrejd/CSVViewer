/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Handles clicks on menu button.
 * @param {DOMEvent} aEvent
 */
function onClick(aEvent) {
	if (aEvent.target.nodeName != 'BUTTON') {
		return;
	}

	switch (aEvent.target.id) {
		case 'new'     : addon.port.emit('newCmd'); break;
		case 'open'    : addon.port.emit('openCmd'); break;
		case 'settings': addon.port.emit('settingsCmd'); break;
		case 'homepage': addon.port.emit('homepageCmd'); break;
	}
} // end onClick()

// Register event listeners when panel is showing.
addon.port.on('show', function onShow() {
	document.getElementById('new').addEventListener('click', onClick, false);
	document.getElementById('open').addEventListener('click', onClick, false);
	document.getElementById('settings').addEventListener('click', onClick, false);
	document.getElementById('homepage').addEventListener('click', onClick, false);
});

// Remove registered event listeners when panel is hiding.
addon.port.on('hide', function onHide() {
	document.getElementById('new').removeEventListener('click', onClick, false);
	document.getElementById('open').removeEventListener('click', onClick, false);
	document.getElementById('settings').removeEventListener('click', onClick, false);
	document.getElementById('homepage').removeEventListener('click', onClick, false);
});
