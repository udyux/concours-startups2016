/** app.js -----------------------------
 * @file 			WAQ 2016 Startups Contest App Scripts
 *						https://github.com/webaquebec/concours-startups
 *
 * @author 		Nicolas Udy
 * 						http://udy.io
 *
 * @license 	MIT License
 *						https://tldrlegal.com/license/mit-license
 *
 * @copyright WAQ 2016
--------------------------------------*/
(function app() {
	'use strict';

	var app = document.getElementById('app');
	var state = {};


	/* manage session
	--------------------------------------*/
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

			update.view('landing');
		},

		/* save session state object (as JSON) to localStorage */
		save: function() {
			localStorage.setItem('state', JSON.stringify(state));
		}
	};


	/* update pages, state and views
	--------------------------------------*/
	var update = {

		/* roll in new view */
		view: function(view) {
			app.dataset.view = view;
			update.state('view',view);
		},

		/* update state object */
		state: function(key,val) {
			// check if key is a nested object
			state[key] = val;
			session.save();
		},

		/* update view output with new value */
		output: function(nodes,val) {
			for (var i = 0; i < nodes.length; i++) {
				nodes[i].value = val[i];
			}
		}
	};


	/* utility functions
	--------------------------------------*/
	var util = {

		/* return formatted number with commas */
		formatVal: function(int) {
			return int.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
		},

		/* return parsed currency value as int */
		parseVal: function(str) {
			return parseInt(str.split(',').join(''));
		},

		/* return parent .category node's id */
		getParentCategory: function(node) {
			while (!node.parentElement.classList.contains('category')) {
				node = node.parentElement;
			}
			return node.parentElement.id;
		}
	};


	/* app setup, listeners and handlers
	--------------------------------------*/
	(function setup() {

		/* decrease the value of the related output */
		var decreaseInvestment = function() {
			var output = this.nextElementSibling;
			var currentVal = util.parseVal(output.value);

			var category = util.getParentCategory(this) + '-bank';
			var bank = document.getElementById(category);
			var currentBank = util.parseVal(bank.value);

			// min 100k, increment by 50k
			if (currentVal === 100000) {
				output.value = '0$';
				bank.value = util.formatVal(currentBank+100000) + '$';
			} else if (currentVal > 100000) {
				output.value = util.formatVal(currentVal-50000) + '$';
				bank.value = util.formatVal(currentBank+50000) + '$';
			}
		};

		/* increase the value of the related output */
		var increaseInvestment = function() {
			var output = this.previousElementSibling;
			var currentVal = util.parseVal(output.value);

			var category = util.getParentCategory(this) + '-bank';
			var bank = document.getElementById(category);
			var currentBank = util.parseVal(bank.value);

			// min 100k, max 500k, increment by 50k
			if (currentVal === 0) {
				output.value = util.formatVal(currentVal+100000) + '$';
				bank.value = util.formatVal(currentBank-100000) + '$';
			} else if (currentVal => 100000 && currentVal <= 500000) {
				output.value = util.formatVal(currentVal+50000) + '$';
				bank.value = util.formatVal(currentBank-50000) + '$';
			}
		};

		// attach handlers to less/more buttons
		[].forEach.call(document.querySelectorAll('.less'), function(node) {
			node.addEventListener('click',decreaseInvestment);
		});

		[].forEach.call(document.querySelectorAll('.more'), function(node) {
			node.addEventListener('click',increaseInvestment);
		});

		/*------------------------------------*/

		// prevent default behavior for on page anchors and form submits
		var stopIt = function(e) {
			e.preventDefault();
		};

		[].forEach.call(document.querySelectorAll('form button, a[href^="#"]'), function(node) {
			node.addEventListener('click',stopIt);
		});

		// add event listeners to nav/submit buttons
		document.getElementById('launch')
		.addEventListener('click', function() {
			update.view('email');
		});

		document.getElementById('submit-email')
		.addEventListener('click', function() {
			if (! /[^\s@]+@[^\s@]+\.[^\s@]+/.test(this.value) ) {
				update.view('main');
				update.state('email',this.value);
			} else {
				return false;
			}
		});
	})();

	// check if there's a session to restore
	if (session.exists()) session.restore();
	else session.init();

})();
