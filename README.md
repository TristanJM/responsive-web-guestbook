# Responsive Web Guestbook

A responsive website, built from scratch, using native HTML5 and CSS3 with jQuery.

### Learning objectives
* Pure CSS responsive web design with no front-end frameworks.
* Using Geo-location alongside the Yahoo weather and Google Maps APIs.
* Using mobile accelerometer and gyroscope to detect and act on gestures.
* Drawable canvas object and device-localstorage image saving.

## Getting started
Simply download the project zip and load the index.html file in any browser.

```
View the layout & style changes when resizing the browser window.
```

## Usage
Use the source code as reference for building a mobile responsive website.
Notable snippets include:

Device geolocation
```javascript
navigator.geolocation.getCurrentPosition(function(position) {
	// 'User location: ' + position.coords.latitude + ', ' + position.coords.longitude);
}, onError, options);
```

Device gestures
```javascript
window.addEventListener("deviceorientation", orientationEvent);
// ...
function orientationEvent(event) {
		var direction = Math.round(event.alpha);
		var tiltFrontBack = Math.round(event.beta);
		var tiltLeftRight = Math.round(event.gamma);
}
```

Local Storage
```javascript
var currentData = localStorage.getItem("guestbookData");
localStorage.setItem("guestbookData", newData);
```

Canvas & HTML5 File Reader
```javascript
// Reads in image from camera/file and shows in canvas
function showAvatar() {
	var input = document.getElementById('form-image-input');
	var file = input.files[0];
	
	// get canvas context
	
	//use HTML5 FileReader API to read the image file as dataURL
	var reader = new FileReader();
	reader.readAsDataURL(file);
	
	// draw image on canvas
}
```

CSS clouds
```
You'll have to hunt down the cloud/sun styles in the CSS!
```

CSS responsive table collapse
```css
/* Content Similar to 'Mobile Landscape' or 'Tablet' */
@media only screen and (min-width: 481px) and (max-width: 780px) {
	/* Events Table */
	
	/* End of Events Table */
}
```

## Built with
* [jscolor](http://jscolor.com) - JavaScript Colour Picker
* [simpleweather](http://simpleweatherjs.com) - jQuery Weather API plugin
* [Font Awesome](http://fontawesome.io) - Font Awesome by Dave Gandy

## Contributing
If you find a bug or have any suggestions to improve the project, please [make an issue](https://github.com/TristanJM/responsive-web-guestbook/issues) on Github.

## License
This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.