// set up AJAX request
var ajax = new XMLHttpRequest();
ajax.onload = function() {
	// render the returned markup
  if (this.status >= 200 && this.status < 400) render(this.response);
  else console.log('The server returned an error: ' + this.response);
};

ajax.onerror = function() {
  console.log('AJAX could not be processed.');
};

app.dataset.loading = true;
ajax.open('GET', 'views/' + view + '.html', true);
ajax.send();
