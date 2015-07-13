/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Holds ID of the currently selected tab.
 * @var {String} gCurrentTab
 */
var gCurrentTab = 'new_file';

/**
 * Handle clicks on tab.
 * @param {String} aTabName
 */
function onTabClick(aTabName) {
	var currentTab = document.getElementById(gCurrentTab + '-tab'),
	    currentTabpanel = document.getElementById(gCurrentTab + '-tabpanel'),
	    newTab = document.getElementById(aTabName + '-tab'),
	    newTabpanel = document.getElementById(aTabName + '-tabpanel');

	currentTab.classList.remove('selected');
	currentTabpanel.classList.remove('tab-active');
	newTab.classList.add('selected');
	newTabpanel.classList.add('tab-active');

	gCurrentTab = aTabName;
} // end onTabClick(aEvent)


/**
 * Handles clicks on menu.
 * @param {DOMEvent} aEvent
 */
function onMenuClick(aEvent) {
	if (aEvent.target.nodeName != 'LI') {
		return;
	}

	switch (aEvent.target.id) {
//		case 'new-file'    : addon.port.emit('newFileCmd'); break;
		case 'open-file'   : addon.port.emit('openFileCmd'); break;
		case 'preferences' : addon.port.emit('preferencesCmd'); break;
		case 'homepage'    : addon.port.emit('homepageCmd'); break;
	}
} // end onMenuClick()

// ===========================================================================
var addon = {port: {on: function(aName, aCallback) {/* ... */}}};

// Register event listeners when panel is showing.
addon.port.on('show', function onShow() {
	MD_initSelectInputs();

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
