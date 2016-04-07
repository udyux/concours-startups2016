/** app.js -----------------------------------------------------
 * @file 			WAQ 2016 Startups Contest App Scripts
 *						https://github.com/webaquebec/concours-startups
 * @author 		Nicolas Udy
 * 						http://udy.io
 * @license 	MIT License
 *						https://tldrlegal.com/license/mit-license
 * @copyright WAQ 2016
--------------------------------------------------------------*/


(function app() {
	'use strict';

	var app = document.getElementById('app');
	var state = {};


	/* manage session
	------------------*/
	var session = {

		/* check if a session has already been set */
		exists: function() {
			var init = (localStorage.getItem('init')) ? true : false;
			return init;
		},

		/* restore a previous session's state */
		restore: function() {
			var intOutput = document.querySelectorAll('#int output');
			var canOutput = document.querySelectorAll('#can output');
			state = JSON.parse(localStorage.getItem('state'));

			update.output(intOutput,state.int);
			update.output(canOutput,state.can);

			update.view(state.view);
			setTimeout(update.spinner,2400);
		},

		/* start a new session */
		init: function() {
			var intOutput = document.querySelectorAll('#int output');
			var canOutput = document.querySelectorAll('#can output');
			var initialValues = ['1,000,000$','0$','0$','0$'];

			localStorage.setItem('init',true);

			update.state('int',initialValues);
			update.state('can',initialValues);

			update.output(intOutput,state.int);
			update.output(canOutput,state.can);

			update.view('intro');
			setTimeout(update.spinner,2400);
		},

		/* save session state object (as JSON) to localStorage */
		save: function() {
			localStorage.setItem('state', JSON.stringify(state));
		}
	};


	/* update pages, state and views
	---------------------------------*/
	var update = {

		/* roll in new view */
		view: function(view) {
			var pull = document.getElementById('pull');
			app.dataset.view = view;
			update.state('view',view);

			pull.style.transform = 'translateZ(-40vw)';
			setTimeout(function() {
				pull.style.transform = '';
			},1100);
		},

		/* update state object */
		state: function(key,val) {
			state[key] = val;
			session.save();
		},

		/* update view output with new value */
		output: function(nodes,val) {
			for (var i = 0; i < nodes.length; i++) nodes[i].value = val[i];
		},

		/* toggle spinner */
		spinner: function(show) {
			var spinner = document.getElementById('spinner');
			if (!show) {
				spinner.dataset.state = '';
				setTimeout(function() {
					spinner.dataset.animation = '';
				},450);
			} else {
				spinner.dataset.state = 'loading';
				spinner.dataset.animation = 'run';
			}
		}
	};


	/* user interface event handlers
	---------------------------------*/
	var handlers = {

		/* start intro */
		startBtn: function() {
			document.getElementById('intro-header')
			.dataset.state = 'done';

			document.getElementById('intro-items')
			.dataset.state = 'visible';
		},

		/* control intro item flow */
		intro: function() {
			if (!this.item) this.item = 1;
			var i = this.item;
			var items = document.getElementById('intro-items');
			var p = items.querySelectorAll('p');

			if (i < p.length) {
				p[i].dataset.state = 'visible';
			} else {
				update.view('demo');
			}

			p[i-1].dataset.state = 'done';
			this.item++;
		},

		demo: function() {
			update.view('email');
		},

		/* validate email */
		validateEmail: function() {
			var emailVal = document.getElementById('email-input').value;
			if ( /[^\s@]+@[^\s@]+\.[^\s@]+/.test(emailVal) ) {
				update.view('form');
				update.state('email',emailVal);
			} else {
				document.getElementById('email-error')
				.dataset.state = 'visible';
			}
		},

		/* decrease the value of the related output */
		lessInvestment: function() {
			var output = this.nextElementSibling;
			var currentVal = util.parseVal(output.value);

			var category = util.getParentCategory(this);
			var bank = document.getElementById(category + '-bank');
			var currentBank = util.parseVal(bank.value);
			var changed = false;

			// min 0 to 100k, increment by 50k after
			if (currentVal === 100000) {
				output.value = '0$';
				bank.value = util.formatVal(currentBank+100000) + '$';
				changed = true;
			} else if (currentVal >= 100000) {
				output.value = util.formatVal(currentVal-50000) + '$';
				bank.value = util.formatVal(currentBank+50000) + '$';
				changed = true;
			}

			// update state if change occurred
			if (changed) {
				var index = output.dataset.index;
				var stateMirror = state[category];

				stateMirror[0] = bank.value;
				stateMirror[index] = output.value;
				update.state(category,stateMirror);
			}
		},

		/* increase the value of the related output */
		moreInvestment: function() {
			var output = this.previousElementSibling;
			var currentVal = util.parseVal(output.value);

			var category = util.getParentCategory(this);
			var bank = document.getElementById(category + '-bank');
			var currentBank = util.parseVal(bank.value);
			var changed = false;

			// min 100k, max 500k, increment by 50k
			if (currentVal === 0 && currentBank >= 100000) {
				output.value = util.formatVal(currentVal+100000) + '$';
				bank.value = util.formatVal(currentBank-100000) + '$';
				changed = true;
			} else if (currentVal >= 100000 && currentVal < 500000 && currentBank >= 50000) {
				output.value = util.formatVal(currentVal+50000) + '$';
				bank.value = util.formatVal(currentBank-50000) + '$';
				changed = true;
			}

			// update state if change occurred
			if (changed) {
				var index = output.dataset.index;
				var stateMirror = state[category];

				stateMirror[0] = bank.value;
				stateMirror[index] = output.value;
				update.state(category,stateMirror);
			}
		},

		intSubmit: function() {
			var card = document.getElementById('form')
			.querySelectorAll('form');

			card[0].dataset.view = 'can';
		},

		/* AJAX entry data to google sheet */
		sendEntry: function() {
			var entryData = util.buildEntryData();
			var xhr = new XMLHttpRequest();
			xhr.open('POST', 'action url here', true);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
			xhr.send(entryData);
		}
	};


	/* utility functions
	---------------------*/
	var util = {

		/* prevent default */
		stopIt: function(e) {
			e.preventDefault();
		},

		/* return parent .category node's id */
		getParentCategory: function(node) {
			while (!node.parentElement.classList.contains('category')) {
				node = node.parentElement;
			}
			return node.parentElement.id;
		},

		/* return formatted number with commas */
		formatVal: function(int) {
			return int.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
		},

		/* return parsed currency value as int */
		parseVal: function(str) {
			return parseInt(str.split(',').join(''));
		},

		/* build entry data for AJAX */
		buildEntryData: function() {
			var i = 0;
			var entryData = '';
			var entry = document.querySelectorAll('[data-entry]');
			while (i < entry.length) {
				var prefix = (!i) ? '' : '&';
				var entryName = entry[i].dataset.entry;
				var entryValue = entry[i].value;
				entryData += prefix + entryName + '=' + entryValue;
				i++;
			}

			return entryData;
		}
	};


	/* app setup, listeners and handlers
	-------------------------------------*/
	(function setup() {

		// prevent default behavior for on page anchors and form submits
		[].forEach.call(document.querySelectorAll('form button, a[href^="#"]'), function(node) {
			node.addEventListener('click',util.stopIt);
		});

		// start button
		document.getElementById('start')
		.addEventListener('click',handlers.startBtn);

		// next button
		document.getElementById('next')
		.addEventListener('click',handlers.intro);

		// demo button
		document.getElementById('demo-btn')
		.addEventListener('click',handlers.demo);

		// validate email
		document.getElementById('submit-email')
		.addEventListener('click',handlers.validateEmail);

		// submit int
		document.getElementById('_int')
		.addEventListener('click',handlers.intSubmit);

		// send entry
		document.getElementById('_can')
		.addEventListener('click',handlers.sendEntry);

		// attach handlers to less/more buttons
		[].forEach.call(document.querySelectorAll('.less'), function(node) {
			node.addEventListener('click',handlers.lessInvestment);
		});

		[].forEach.call(document.querySelectorAll('.more'), function(node) {
			node.addEventListener('click',handlers.moreInvestment);
		});

		// check if there's a session to restore
		if (session.exists()) session.restore();
		else session.init();

	})();

})();
