/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let { Cc, Ci, Cu, Cr } = require('chrome');
let panels = require('sdk/panel');
let self = require('sdk/self');
let tabs = require('sdk/tabs');
let { ToggleButton } = require('sdk/ui/button/toggle');
let { TextDecoder, OS } = Cu.import('resource://gre/modules/osfile.jsm');
let doc = require('./lib/doc.js');
let utils = require('./lib/utils.js');

Cu.import('resource://gre/modules/Services.jsm');

// TODO Use `_('label') for strings!!!

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
 * Data loaded from the current CSV document.
 * @type {String}
 */
var gLoadedData = '';

/**
 * CSVViewer's main toolbarbutton.
 * @var {ToggleButton}
 */
var gToolbarButton = ToggleButton({
	id: 'csvviewer-toolbarbutton',
	label: 'CSVViewer',
	icon: {
		'16': self.data.url('icon-16.png'),
		'32': self.data.url('icon-32.png'),
		'64': self.data.url('icon-64.png')
	},
	onChange: function(aState) {
		if (aState.checked) {
			gToolbarPanel.show({
				position: gToolbarButton
			});
		}
	}
});

/**
 * CSVViewer's panel for the main toolbarbutton.
 * @var {Panel} gToolbarPanel
 */
var gToolbarPanel = panels.Panel({
	height: 210,
	width: 200,
	contentURL: './toolbarpanel/index.html'
});

// Inform the toolbar panel about show event.
gToolbarPanel.on('show', function() {
	gToolbarPanel.port.emit('show');
});

// Inform the toolbar panel about hide event.
gToolbarPanel.on('hide', function() {
	gToolbarButton.state('window', { checked: false });
	gToolbarPanel.port.emit('hide');
});

// Handle new CSV file command.
gToolbarPanel.port.on('newCmd', function() {
	gToolbarPanel.hide();
	openMainPage(doc.createBlankDocument());
});

// Handle open CSV file command.
gToolbarPanel.port.on('openCmd', function() {
	gToolbarPanel.hide();

	let path = utils.filepicker();
	if (path === '') {
		return;
	}

	let promise = OS.File.read(path);
	promise = promise.then(
		function onSuccess(aData) {
			let decoder = new TextDecoder();
			let csv = decoder.decode(aData);

			openMainPage(doc.createDocument(csv));
		}
	);
});

// Handle show add-on settings command.
gToolbarPanel.port.on('settingsCmd', function() {
	gToolbarPanel.hide();

	Services.wm.getMostRecentWindow('navigator:browser').
		BrowserOpenAddonsMgr('addons://detail/' + ADDON_ID + '/preferences');
});

// Handle homepage command.
gToolbarPanel.port.on('homepageCmd', function() {
	gToolbarPanel.hide();

	utils.openTab(HOMEPAGE_URL);
});

// ==========================================================================
// Functions for the main CsvViewer's page.

/**
 * Opens new tab with main page.
 * @param {CsvDocument} aCsvDocument
 */
function openMainPage(aCsvDocument) {
	tabs.open({
		url: self.data.url('csvviewer/index.html'),
		onReady: function (aTab) {
			onMainPageReady(aTab, aCsvDocument);
		}
	});
} // end openMainPage(aCsvDocument)

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

// ==========================================================================
// Observers

/**
 * Listener for reading data from responses with content type `text/csv`.
 * Implements `Components.interfaces.nsIStreamListener`.
 * @link https://developer.mozilla.org/docs/Mozilla/Tech/XPCOM/Reference/Interface/NsIStreamListener
 */
function CSVViewerTracingListener() {
	this.originalListener = null;
	this.receivedData = [];
}
CSVViewerTracingListener.prototype = {
	onDataAvailable: function (aSubject, aContext, aInputStream, aOffset, aCount) {
		var binaryInputStream = Cc['@mozilla.org/binaryinputstream;1'].
			createInstance(Ci.nsIBinaryInputStream);
		binaryInputStream.setInputStream(aInputStream);

		var data = binaryInputStream.readBytes(aCount);
		this.receivedData.push(data);
	},

	onStartRequest: function (aSubject, aContext) {
		this.originalListener.onStartRequest(aSubject, aContext);
		this.charset = aSubject.contentCharset;
		//console.log('onStartRequest triggered', aSubject.URI.spec);
		//console.log(this.charset);
	},

	onStopRequest: function (aSubject, aContext, aStatusCode) {
		var that = this;

		// TODO The `if` is probably redundant - here should be always
		//      processed `text/csv` document.
		if (aSubject.contentType == 'text/csv') {
			//console.log('status is', aSubject.status);
			//console.log('onStopRequest called for CSV', aSubject.URI.spec, ' and status is', aStatusCode);
			console.log(this.receivedData.join(''));

			gLoadedData = this.receivedData.join('');
			// TODO tabs.open('./csvviewer/index.html');
		}

		// Pass data to original listener onDataAvailable and onStopRequest
		this.modifyHtmlResponse(aSubject, aContext, aStatusCode);
	},

	modifyHtmlResponse: function (aSubject, aContext, aStatusCode) {
		var data = this.receivedData.join('');
		if (data == '') {
			data = ' ';
		}

		var len = data.length;
		var stream = this.makeResponseBody(data);

		try {
			this.originalListener.onDataAvailable(
				aSubject,
				aContext,
				stream.newInputStream(0),
				0,
				len
			);
			this.originalListener.onStopRequest(
				aSubject,
				aContext,
				aStatusCode
			);
		} catch (ex) {
			console.log('error with', aSubject.URI.spec, 'spec', 'error:', ex);
		}
	},

	makeResponseBody: function (aData) {
		// convert string to stream
		try {
			var len = aData.length;
			var storageStream = Cc['@mozilla.org/storagestream;1'].
				createInstance(Ci.nsIStorageStream);
			var binaryOutputStream = Cc["@mozilla.org/binaryoutputstream;1"].
				createInstance(Ci.nsIBinaryOutputStream);

			storageStream.init(8192, len, null);
			binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));
			binaryOutputStream.writeBytes(aData, len);

			return storageStream
		} catch (ex) {
			console.log(ex);
		}
	},

	// Implementation of `Components.interfaces.nsISupport`
	QueryInterface: function (aIID) {
		if (aIID.equals(Ci.nsIStreamListener) || aIID.equals(Ci.nsISupports)) {
			return this;
		}
		throw Cr.NS_NOINTERFACE;
	}
}; // End of CSVViewerTracingListener

/**
 * Our main observer.
 */
var gMainObserver = {
	observe: function (aSubject, aTopic, aData) {
		if (aTopic == 'xpcom-shutdown') {
			Services.obs.removeObserver(gMainObserver, 'http-on-examine-response');
			Services.obs.removeObserver(gMainObserver, 'xpcom-shutdown');
			return;
		}

		// Topic is 'http-on-examine-response'
		//console.log('observer:', aSubject, aTopic, aData);

		aSubject.QueryInterface(Ci.nsIHttpChannel);
		let contentType = aSubject.getResponseHeader('Content-Type');

		if (
			aSubject.responseStatus == 200 &&
			contentType.toLowerCase().indexOf('text/csv') == 0
		) {
			var newListener = new CSVViewerTracingListener();
			aSubject.QueryInterface(Ci.nsITraceableChannel);
			newListener.originalListener = aSubject.setNewListener(newListener);
			// TODO This doesn't stop the original action (it offers CSV
			//      document for download)!
		}

		// Response is not CSV document, do nothing...
	},

	// Implementation of `Components.interfaces.nsISupport`
	// TODO This is probably not required...
	QueryInterface : function (aIID) {
		if (aIID.equals(Ci.nsIObserver) || aIID.equals(Ci.nsISupports)) {
			return this;
		}

		throw Cr.NS_NOINTERFACE;
	}
}; // End of gMainObserver

// Register our observer
Services.obs.addObserver(gMainObserver, 'http-on-examine-response', false);
Services.obs.addObserver(gMainObserver, 'xpcom-shutdown', false);


// ###### Generated by JPM:
// a dummy function, to show how tests work.
// to see how to test this function, look at test/test-index.js
//function dummy(text, callback) {
//	callback(text);
//}
//
//exports.dummy = dummy;

