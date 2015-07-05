/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Handles clicks on menu.
 * @param {DOMEvent} aEvent
 */
function onMenuClick(aEvent) {
	if (aEvent.target.nodeName != 'LI') {
		return;
	}

	switch (aEvent.target.id) {
		case 'new-file'    : addon.port.emit('newFileCmd'); break;
		case 'open-file'   : addon.port.emit('openFileCmd'); break;
		case 'preferences' : addon.port.emit('preferencesCmd'); break;
		case 'homepage'    : addon.port.emit('homepageCmd'); break;
	}
} // end onMenuClick()

// Register event listeners when panel is showing.
addon.port.on('show', function onShow() {
	var menu = document.getElementById('menu');
	if (menu) {
		menu.addEventListener('click', onMenuClick, false);
	}
});

// Remove registered event listeners when panel is hiding.
addon.port.on('hide', function onHide() {
	var menu = document.getElementById('menu');
	if (menu) {
		menu.removeEventListener('click', onMenuClick, false);
	}
});
