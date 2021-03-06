/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Create CSV document from the given string.
 * @param {String} aData CSV data as a string.
 * @param {Object} aOptions (Optional.)
 * @returns {Object}
 */
function Doc_CreateDocument(aData, aOptions) {
	if (aOptions === undefined) {
		aOptions = {};
	}

	/** @var {String} Char used as a values delimiter. Default: ','. */
	var delimiter = ',';
	/** @var {Boolean} True if values are closed by quotes. */
	var quoteValues = false;
	/** @var {String} Used quote. Default: empty string. */
	var usedQuote = '';
	/** @var {String} Used line endings. Default: "\n" */
	var lineEnding = "\n";
	/** @var {Boolean} True if the first line contains names of columns. */
	var hasHeaderRow = (aOptions.hasHeaderRow !== undefined) ? aOptions.hasHeaderRow : false;
	/** @var {Array} Array with columns description. */
	var columns = [];
	/** @var {Array} Array with data rows. */
	var rows = [];

	// Set correct delimiter
	if (aOptions.delimiter !== undefined) {
		// Use given delimiter
		delimiter = aOptions.delimiter;
	} else {
		// Recognize delimiter
		var possibleDelimiters = [
			{ char: ',', count: 0 },
			{ char: ';', count: 0 },
			{ char: '|', count: 0 }
		];

		for (var i=0; i<possibleDelimiters.length; i++) {
			possibleDelimiters[i].count = aData.split(possibleDelimiters[i].char).length - 1;
		}

		possibleDelimiters.sort(function(a, b) { return b.count - a.count; });
		delimiter = possibleDelimiters[0].char;
	} 

	// Set correct quote
	if (aOptions.usedQuote !== undefined) {
		// Use given quote
		quoteValues = true;
		usedQuote = aOptions.usedQuote;
	} else {
		// Recognize quote
		var delimiterCount = aData.split(delimiter).length - 1;
		var possibleQuotes = ['"', '"', '`'];

		for (var i=0; i<possibleQuotes.length; i++) {
			var _quote = possibleQuotes[i];
			var quotesCount = aData.split(possibleQuotes[i]).length - 1;

			if (aData[0] == _quote && (delimiterCount < quotesCount)) {
				quoteValues = true;
				usedQuote = _quote;
			}
		}
	}

	// Set correct line ending
	if (aOptions.lineEnding !== undefined) {
		// Use given line ending
		lineEnding = aOptions.lineEnding;
	} else {
		// Try to find correct line ending
		var possibleLineEndings = [
			{ char: "\l\n", count: 0 },
			{ char: "\n", count: 0 },
			{ char: "\l", count: 0 }
		];

		for (var i=0; i<possibleLineEndings.length; i++) {
			possibleLineEndings[i].count = aData.split(possibleLineEndings[i].char).length - 1;
		}

		possibleLineEndings.sort(function(a, b) { return b.count - a.count; });
		lineEnding = possibleLineEndings[0].char;
	}

	// Parse data
	var lines = aData.split(lineEnding);
	for (var i=0; i<lines.length; i++) {
		var sep = usedQuote + delimiter + usedQuote;
		var cols = (new String(lines[i])).split(sep);

		//if (`quoteValues` === TRUE) {
			// TODO Remove the first character of the first col.
			// TODO Remove the last character of the last col.
		//}

		if (hasHeaderRow && i == 0) {
			for (var ii=0; ii<cols.length; i++) {
				if (quoteValues === true && ii == 0) {
					columns.push(cols[ii].substring(1));
				} else if (quotesValues === true && ii + 1 == cols.length) {
					columns.push(cols[ii].substring(0, cols[ii].length - 1));
				} else {
					columns.push(cols[ii]);
				}
			}
		} else {
			if (quoteValues === true) {
				cols[0] = cols[0].substring(1);
				var last = cols.length - 1;
				cols[last] = cols[last].substring(0, cols[last].length - 1);
			}

			rows.push(cols);
		}
	}

	// Define columns if are not defined yet
	if (columns.length == 0 && rows.length > 0) {
		if (Array.isArray(rows[0])) {
			for (var i=0; i<rows[0].length; i++) {
				columns.push('Col #' + (i + 1));
			}
		}
	}

	// Return object describing CSV document.
	return {
		get delimiter() { return delimiter;	},
		get quoteValues() { return quoteValues; },
		get usedQuote() { return usedQuote; },
		get lineEnding() { return lineEnding; },
		get hasHeaderRow() { return hasHeaderRow; },
		get columns() { return columns; },
		get columnsCount() { return columns.length; },
		get rows() { return rows; },
		get rowsCount() { return rows.length; }
	};
} // end Doc_CreateDocument(aData, aOptions)

/**
 * Create new blank CSV document.
 * @returns {Object}
 */
function Doc_CreateBlankDocument() {
	/** @var {String} Char used as a values delimiter. */
	var delimiter = ',';
	/** @var {Boolean} True if values are closed by quotes. */
	var quoteValues = false;
	/** @var {String} Used quote. */
	var usedQuote = '';
	/** @var {String} Used line endings. */
	var lineEnding = "\n";
	/** @var {Boolean} True if the first line contains names of columns. */
	var hasHeaderRow = true;
	/** @var {Array} Array with columns description. */
	var columns = ['A','B','C','D','E'];
	/** @var {Array} Array with data rows. */
	var rows = [];

	// Create empty rows
	for (var i=0; i<99; i++) {
		rows.push(['', '', '', '', '']);
	}

	// Return object describing CSV document.
	return {
		get delimiter() { return delimiter;	},
		get quoteValues() { return quoteValues; },
		get usedQuote() { return usedQuote; },
		get lineEnding() { return lineEnding; },
		get hasHeaderRow() { return hasHeaderRow; },
		get columns() { return columns; },
		get columnsCount() { return columns.length; },
		get rows() { return rows; },
		get rowsCount() { return rows.length; }
	};
} // end Doc_CreateBlankDocument()

// ==========================================================================
// Export public functions and objects

exports.createDocument = Doc_CreateDocument;
exports.createBlankDocument = Doc_CreateBlankDocument;
