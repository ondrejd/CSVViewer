/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Returns `TRUE` if given string is numeric value.
 * @param {String} aVal
 * @returns {Boolean}
 */
function isNumeric(aVal) {
	return !isNaN(parseFloat(aVal)) && isFinite(aVal);
} // end isNumeric(aVal)

/**
 * Create elements for select that looks like selects from Material Design.
 * @param {String} aId
 * @param {String} aCurrentValue
 * @param {Array} aValues
 * @returns {DOMElement}
 */
function createSelect(aId, aCurrentValue, aValues) {
	var div = document.createElement('div');
	div.setAttribute('id', aId);
	div.classList.add('select-group');

	var input = document.createElement('input');
	input.setAttribute('id', aId + 'Input');
	input.setAttribute('value', aCurrentValue);
	input.readonly = true;
	div.appendChild(input);

	var span = document.createElement('span');
	span.classList.add('md-icon');
	span.classList.add('dp24');
	span.appendChild(document.createTextNode('keyboard_arrow_down'));
	//span.addEventListener('click', onRowsCountDownIconClick, false);
	div.appendChild(span);

	var ul = document.createElement('ul');
	for (var i=0; i<aValues.length; i++) {
		var li = document.createElement('li');
		li.appendChild(document.createTextNode(aValues[i]));
		ul.appendChild(li);
	}
	//ul.addEventListener('click', onRowsCountMenuItemClick, false);
	div.appendChild(ul);

	return div;
} // end createSelect(aId, aCurrentValue, aValues)

/**
 * Prototype for object that is used for creating and controlling data table.
 * 
 * @param {HTMLElement} aParent
 * @param {String} aId
 * @param {Object} aOptions (Optional). Options for the data table.
 */
function createTable(aParent, aId, aOptions) {
	var table = document.createElement('table');
	table.setAttribute('id', aId);
	table.classList.add('mdl-data-table');
	table.classList.add('mdl-js-data-table');

	// Create <thead>
	var thead = document.createElement('thead');
	var infoRow = thead.insertRow();

	for (var i=0; i<aOptions.columnsCount; i++) {
		var col = document.createElement('th');
		col.setAttribute('scope', 'col');
		col.appendChild(document.createTextNode(
			(aOptions.columns[i] !== undefined) ? aOptions.columns[i] : 'Col #' + i
		));
		infoRow.appendChild(col);
	}

	table.appendChild(thead);

	// Create <tbody>
	var tbody = document.createElement('tbody');
	tbody.setAttribute('id', aId + '-body');

	for (var i=0; i<aOptions.rowsCount; i++) {
		var row = tbody.insertRow();
		row.setAttribute('id', aId + '__row-' + i);

		for (var ii=0; ii<aOptions.columns.length; ii++) {
			var cell = row.insertCell();

			if (aOptions.rows[i][ii] == undefined) {
				cell.appendChild(document.createTextNode("\u2026"));
			} else if (aOptions.rows[i][ii] == '') {
				cell.appendChild(document.createTextNode("\u2026"));
			} else {
				var cellVal = aOptions.rows[i][ii];

				if (isNumeric(cellVal) !== true) {
					cell.classList.add('mdl-data-table__cell--non-numeric');
					table.tHead.rows.item(0).cells.item(ii).classList.add('mdl-data-table__cell--non-numeric');
				}
				
				cell.appendChild(document.createTextNode(cellVal));
			}
		}
	}

	table.appendChild(tbody);

	// Create <tfoot>
	var tfoot = document.createElement('tfoot');
	var tfootTr = tfoot.insertRow();
	var tfootCell = tfootTr.insertCell();
	tfootCell.setAttribute('colspan', aOptions.columnsCount);

	var tfootSpan1 = document.createElement('span');
	tfootSpan1.classList.add('label'); 
	tfootSpan1.appendChild(document.createTextNode('Rows per page:'));
	tfootCell.appendChild(tfootSpan1);

	var tfootSelect = createSelect('rowsCount', 25, ['25', '50', '100']);
	tfootCell.appendChild(tfootSelect);

	var tfootSpan2 = document.createElement('span');
	tfootSpan2.setAttribute('id', aId + '-dataViewRangeInfo');
	tfootSpan2.classList.add('label');
	var dataViewInfo = '0-0 of 0';
	tfootSpan2.appendChild(document.createTextNode(dataViewInfo));
	tfootCell.appendChild(tfootSpan2);

	var tfootSpan3 = document.createElement('span');
	tfootSpan3.setAttribute('id', aId + '-moveTableToPrevPage');
	tfootSpan3.classList.add('md-icon');
	tfootSpan3.classList.add('dp24');
	tfootSpan3.appendChild(document.createTextNode('navigate_before'));
	//tfootSpan3.addEventListener('click', onPrevPageButtonClick, false);
	tfootCell.appendChild(tfootSpan3);

	var tfootSpan4 = document.createElement('span');
	tfootSpan4.setAttribute('id', aId + '-moveTableToNextPage');
	tfootSpan4.classList.add('md-icon');
	tfootSpan4.classList.add('dp24');
	tfootSpan4.appendChild(document.createTextNode('navigate_next'));
	//tfootSpan4.addEventListener('click', onNextPageButtonClick, false);
	tfootCell.appendChild(tfootSpan4);

	table.appendChild(tfoot)

	aParent.appendChild(table);
} // end createTable(aParent, aId, aOptions)

// ==========================================================================
// Event listeners

/**
 * @param {DOMEvent} aEvent
 */
function onCloseMenuitemClick(aEvent) {
	var closeMenuitem = document.getElementById('close__menuitem');
	if (closeMenuitem !== undefined) {
		closeMenuitem.removeEventListener('click', onCloseMenuitemClick, false);
	}

	self.port.emit('close_page');
} // end onCloseMenuitemClick(aEvent)

/**
 * Listener for event 'ready' emitted form the main script.
 * @param {Object} aCsvDocument
 */
function onReady(aCsvDocument) {
	// Menuitem "Close"
	var closeMenuitem = document.getElementById('close__menuitem');
	console.log(closeMenuitem);
	if (closeMenuitem !== undefined) {
		closeMenuitem.addEventListener('click', onCloseMenuitemClick, false);
	}

	// Create data table
	var content = document.getElementById('content__containter');
	console.log(content);
	if (content !== undefined) {
		createTable(content, 'dataTable', aCsvDocument);
	}
} // end onReady()

// ==========================================================================
// Register events recievers. 

self.port.on('ready', onReady);
