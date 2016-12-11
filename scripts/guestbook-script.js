//Global Variables
var browser = "Unknown";
var canvas,context;
var mouseX,mouseY,mouseDown=0; //Keep track of state of mouse
var touchX,touchY; //Keep track of touch position
var activeForm = false;
var tilted = false;

window.onresize = checkSize;

//jQuery
$(document).ready(function(){
	browser = checkBrowser();
	checkSize(); 
	
	loadGuestbookData();
	
	//Pre-load hand image
	$('<img />').attr('src',"./images/hand.png").appendTo('body').css('display','none');
	
	//Navigation Scroll
	$("nav ul li").click(function() {
		window.location = "index.html";
	});0
	
	//Sign guestbook click
	$(document).on('click','#pen-div',function(){
		$('#sign-section').css('transform','translateY(0)');
		$('#hand-div').css('transform','translateY(-3000px)'); //moves hand back out of view
		initGraffiti();
		window.addEventListener("deviceorientation", orientationEvent);
		activeForm = true;
		//Initialise google maps api
		setTimeout(function() { initializeMap(); },1300 ); //initialises map after animation
	});
	
	//Geolocation on user's location
	$(document).on('click','#form-getlocation',function(){
		if (navigator.geolocation) {
			var options = {enableHighAccuracy:true};
			//Get location
			navigator.geolocation.getCurrentPosition(function(position) {
				//Set map
				var map = new google.maps.Map(document.getElementById("googleMap"), {
					center: {lat: 51.508742, lng: -0.120850},
					zoom: 9
				});
				//Use location
				var infoWindow = new google.maps.InfoWindow({map: map});				
				var pos = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				//Mark location on map
				infoWindow.setPosition(pos);
				infoWindow.setContent('Your location at<br/>Lat: '+pos.lat+', Long: '+pos.lng+'<br/>Accuracy: '+position.coords.accuracy+'m');
				$('#user-lat').text(pos.lat);
				$('#user-lng').text(pos.lng);
				map.setCenter(pos);
			}, 
			function() {
				alert("Can't find your location.");
			},
			options);
		} 
		else {
			alert("Your browser doesn't support Geolocation.");
		}
	});

	//User's avatar from camera/file
	$(document).on('change','#form-image-input',function() {
		showAvatar();
	});
	
	//Clearing the graffiti canvas on click of button
	$(document).on('click','#tools-clear-button',function() {
		clearCanvas();
	});
	
	//Clicking the clear form button handler
	$(document).on('click','#clear-gb-btn',function() {
		clearGbForm();
	});
	
	//Clicking the SIGN form button handler
	$(document).on('click','#sign-gb-btn',function() {
		saveSignFormData();
	});
	
});

//Load the guestbook with local storage data
function loadGuestbookData() {
	var json = JSON.parse( localStorage.getItem("guestbookData") );
	var html = "";
	if (json !== null) {
		for (var i=0;i<json['data'].length;i++) {
			//html += json['data'][i]['name'];
			html += '<tr>';
				html += '<td><img id="gb-avatar" src="'+json['data'][i]['avatar']+'"></td>';
				html += '<td>';
					html += '<span id="gb-name" class="gb-bold-text">'+json['data'][i]['name']+'</span><br/><span id="gb-nick">\''+json['data'][i]['nick']+'\'</span><br/><span class="gb-gap"></span>';
					html += '<span id="gb-age">Aged '+json['data'][i]['age']+'</span><br/><span id="gb-gender">'+json['data'][i]['gender']+'</span>';
				html += '</td>';
				html += '<td>';
					html += '<span class="gb-bold-text">Home</span><br/>';
					html += '<span id="gb-home">'+json['data'][i]['hometown']+'</span>'
					html += '<br/>';
					html += '<span class="gb-gap"></span>';
					html += '<span class="gb-bold-text">Current</span><br/>';
					html += '<span class="gb-bold-text">Lat: </span><span id="gb-lat">'+json['data'][i]['lat']+'</span><br/>';
					html += '<span class="gb-bold-text">Long: </span><span id="gb-lng">'+json['data'][i]['long']+'</span>';
				html += '</td>';
				html += '<td><span id="gb-message">'+json['data'][i]['message']+'</span></td>';
				html += '<td><img id="gb-graffiti" src="'+json['data'][i]['graffiti']+'"></td>';
			html += '</tr>';
		}
		$('#guestbook tbody').html(html);
	}
}

//Save the 'Sign Guestbook' Form data
function saveSignFormData() {
	var name = $('#form-name').val();
	var nick = $('#form-nick').val();
	var age = $('#form-age').val();
	var gender = $('#form-gender').val();
	var message = $('#form-message-input').val();
	var hometown = $('#form-hometown').val();
	var lat = $('#user-lat').text();
	var long = $('#user-lng').text();
	//get avatar
	var c = document.getElementById("avatar");
	var avatar = c.toDataURL(".jpg");
	//get graffiti
	var graffiti = canvas.toDataURL(".jpg");
	var newData = { "name":name, "nick":nick, "age":age, "gender":gender, "message":message, "hometown":hometown, "lat":lat, "long":long, "avatar":avatar, "graffiti":graffiti };
	
	var currentData = localStorage.getItem("guestbookData");
	if ( currentData === null ) {
		newData = JSON.stringify(newData);
		newData = '{"data":['+newData+']}';
		localStorage.setItem("guestbookData",newData);
	}
	else {
		var json = JSON.parse( localStorage.getItem("guestbookData") );
		json['data'].push(newData);
		localStorage.setItem("guestbookData",JSON.stringify(json));
	}
	
	loadGuestbookData();
	clearGbForm();
}

//Clear 'Sign Guestbook' Form function
function clearGbForm() {
	$('#form-name').val("");
	$('#form-nick').val("");
	$('#form-age').val("");
	$('#form-gender').val("None");
	$('#form-message-input').val("");
	$('#form-hometown').val("");
	$('#form-image-input').val("");
	$('#user-lat').text("");
	$('#user-lng').text("");
	
	//Clear avatar canvas
	var c = document.getElementById("avatar");
	var ctx = c.getContext("2d");
	ctx.clearRect(0, 0, c.width, c.height);
	
	//Remove form
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		console.log('Browser is mobile');
	}
	else {
		var formHeight = $('#sign-section').height();
		var windowHeight = $(window).height();
		var move = formHeight - windowHeight;
		$('#sign-section').css('transition','transform 100ms ease');
		$('#sign-section').css('transform','translateY(-'+move+'px)');
	}
	setTimeout(function() { 
		window.scrollTo(0, 0);
		$('#sign-section').css('transition','transform 1300ms ease');
		$('#sign-section').css('transform','translateY(-3000px)'); 
	},500);
	
	//stop listening for events
	activeForm = false;
	tilted = false;
	
	//Remove Asynchronous Google API Initialiser script
	$('body script').remove();
}

//Graffiti functions

	//Draw the circular dot on the canvas
	function drawDot(context,x,y,size) {
		//Get the selected colour
		context.fillStyle = $('#tools-colour-control').css('background-color');

		//Draw a filled circle
		context.beginPath();
		context.arc(x, y, size, 0, Math.PI*2, true); // Xpos, Ypos, Radius, StartAngle, EndAngle, Anti-clockwise 
		context.closePath();
		context.fill();
	}

	//Clear the canvas 
	function clearCanvas() {
		context.clearRect(0, 0, canvas.width, canvas.height);
	}			

	//Called when mouse button is pressed
	function graffiti_mouseDown() {
		mouseDown=1;	//set var to true

		//Get the current brush size as percentage of canvas height
		var size = $("#graffiti").height() * ($('#brush-size-control').val()/100);

		//Draw a circle
		drawDot(context,mouseX,mouseY,size);
	}

	//Called when mouse button released
	function graffiti_mouseUp() {
		mouseDown=0;	//set var to false
	}

	//Track mouse position and draw circle when mouse button is held
	function graffiti_mouseMove(e) {
		// Update the mouse co-ordinates when moved
		getMousePos(e);

		//Get the current brush size as percentage of canvas height
		var size = $("#graffiti").height() * ($('#brush-size-control').val()/100);

		//Draw a circle if the mouse button is currently being pressed
		if (mouseDown==1) {
			drawDot(context,mouseX,mouseY,size);
		}
	}

	//Get current mouse position relative to canvas Top Left
	function getMousePos(e) {
		if (!e) {
			var e = event;
		}
		if (e.offsetX) {
			mouseX = e.offsetX;
			mouseY = e.offsetY;
		}
		else if (e.layerX) {
			mouseX = e.layerX;
			mouseY = e.layerY;
		}
	}

	//Called when canvas is touched
	function graffiti_touchStart() {
		//Update the touch co-ordinates
		getTouchPos();

		//Get the current brush size as percentage of canvas height
		var size = $("#graffiti").height() * ($('#brush-size-control').val()/100);

		//Draw a circle at touch location
		drawDot(context,touchX,touchY,size);

		// Prevents an additional mousedown event being triggered
		event.preventDefault();
	}

	//Called on touch-move, draw circle and prevent the default scrolling
	function graffiti_touchMove(e) { 
		//Update the touch co-ordinates
		getTouchPos(e);

		//Get the current brush size as percentage of canvas height
		var size = $("#graffiti").height() * ($('#brush-size-control').val()/100);

		//Draw the circle
		drawDot(context,touchX,touchY,size); 

		//Prevent the default scrolling
		event.preventDefault();
	}

	//Gets the touch position in canvas
	function getTouchPos(e) {
		if (!e) {
			var e = event;
		}
		if(e.touches) {
			if (e.touches.length == 1) { 	//One finger touch limit
				//Get touch location
				var touch = e.touches[0];
				touchX=touch.pageX-touch.target.offsetLeft;
				touchY=touch.pageY-$('#graffiti').offset().top;
			}
		}
	}

	//Initialise the graffiti canvas and apply event handlers
	function initGraffiti() {
		console.log('initGraffiti() called');
		
		window.addEventListener("devicemotion", shakeEvent);

		//Get the canvas element
		canvas = document.getElementById('graffiti');
		canvas.width = $('#graffiti').width();
		canvas.height = $('#graffiti').height();

		//If the browser supports the canvas tag, get the 2d drawing context
		if (canvas.getContext) {
			context = canvas.getContext('2d');
		}

		//Check that we have a valid context to draw on/with before adding event handlers
		if (context) {
			// React to mouse events on the canvas, and mouseup on the entire document
			canvas.addEventListener('mousedown', graffiti_mouseDown, false);
			canvas.addEventListener('mousemove', graffiti_mouseMove, false);
			window.addEventListener('mouseup', graffiti_mouseUp, false);

			// React to touch events on the canvas
			canvas.addEventListener('touchstart', graffiti_touchStart, false);
			canvas.addEventListener('touchmove', graffiti_touchMove, false);
		}
	}

//End of Graffiti functions

//Function to check for device shakes (clears graffiti canvas)
function shakeEvent(event){
	if (activeForm) {
		var threshold=20;
		if (Math.abs(event.acceleration.x)>threshold || Math.abs(event.acceleration.y)>threshold || Math.abs(event.acceleration.z)>threshold) {
			clearCanvas();
		}
	}
}

//Function to check for orientation for form quit
function orientationEvent(event){
	if (activeForm) {
		var dir = Math.round(event.alpha);
		var tiltFB=Math.round(event.beta);
		var tiltLR=Math.round(event.gamma);
		
		if (tiltLR < -25 && !tilted) {
			tilted = true;
			var r = confirm("Do you want to clear this form?\nAll your progress will be lost!");
			if (r == true) {
				clearGbForm();
			} 
			else {
				console.log("User selected not to clear form");
				setTimeout(function() { tilted = false; },1000); //set tilted back to false after a short delay
			}
		}
		else if (tiltLR > 25 && !tilted) {
			tilted = true;
			var r = confirm("Do you want to sign the guestbook with this form?");
			if (r == true) {
				saveSignFormData();
			} 
			else {
				console.log("User selected not to clear form");
				setTimeout(function() { tilted = false; },1000); //set tilted back to false after a short delay
			}
		}
	}
}

//Reads in image from camera/file and shows in canvas
function showAvatar() {
	var input = document.getElementById('form-image-input');	
	var file = input.files[0];
	
	var c = document.getElementById("avatar");
	//create context drawing object
	var ctx = c.getContext("2d");
	
	//use HTML5 FileReader API to read the image file as dataURL
	var reader = new FileReader();
	reader.readAsDataURL(file);
	//when the read is successful
	reader.onload = function (e) {
		//clear the old canvas
		ctx.clearRect(0, 0, c.width, c.height);
		//use the dataURL to create an image element
		var dataURL = e.target.result,
		img = new Image();
		img.src = dataURL;
		img.onload = function() {
			//set the width and height of canvas
			c.width = img.width;
			c.height = img.height;
			//draw the image on canvas
			ctx.drawImage(img, 0, 0);
		};
	};
	$('#avatar').css('height','100');
	$('#avatar').css('width','100');
}

//Called on ready and every time browser is resized
function checkSize() {
	//Fix issues of individual browsers on resizing
	fixBrowserIssues();
	
	//If the "Guestbook Sign" form is expanded, resize the canvas
	if ($('#sign-section').attr('style') == "transform: translateY(0px);") {
		canvas.width = $('#graffiti').width();
		canvas.height = $('#graffiti').height();
		console.log("Graffiti canvas has been resized");
	}
}

//Loads Google Maps Asynchronously
function initializeMap() {
	var script = document.createElement("script");
  script.src = "http://maps.googleapis.com/maps/api/js?callback=initialize";
  document.body.appendChild(script);
}

//Initialise Google Maps API (must use initialiZe for callback)
function initialize() {
	var mapProp = {
		center:new google.maps.LatLng(51.508742,-0.120850),
		zoom:5,
		mapTypeId:google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
}

//Checks what browser is being used
function checkBrowser() {
	$.mobile.pushStateEnabled = false;	
	var browser = "Non-webkit";	
	var userAgent = navigator.userAgent.toLowerCase(); 
	if (userAgent .indexOf('safari')!=-1){ 
		if(userAgent .indexOf('chrome')  > -1){
			//browser is chrome
			browser = "Chrome";
		}
		else if((userAgent .indexOf('opera')  > -1)||(userAgent .indexOf('opr')  > -1)){
			//browser is opera 
			browser = "Opera";
		}
		else{
			//browser is safari
			browser = "Safari";
		}
	}
	return browser;
}

//Javascipt to fix any issues with individual browsers
function fixBrowserIssues() {
	if (browser == "Unknown") {
		//console.log('Browser unknown.');
	}
	else if (browser == "Non-webkit") {
		//console.log('Browser is non-webkit eg. IE / FF');
	}
	else if (browser == "Chrome") {
		//console.log('Browser is Chrome');
	}
	else if (browser == "Safari") {
		//console.log('Browser is safari');
		
		//Fix Safari not recognising <picture>
		//Header Logo
		if ($(window).width() > 780) {
			if ($('#lu-logo-header').attr('src') == "images/lu-shield-white.png") {
				$('#lu-logo-header').attr('src','images/lu-logo-white.png');
			}
		}
		else {
			if ($('#lu-logo-header').attr('src') == "images/lu-logo-white.png") {
				$('#lu-logo-header').attr('src','images/lu-shield-white.png');
			}
		}
	}
}