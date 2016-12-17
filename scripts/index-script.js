var browser = "Unknown";

// Check the size of the browser window on resize event
window.onresize = checkSize;

$(document).ready(function(){
	browser = checkBrowser();
	checkSize(); 
	
	// Navigation Scroll
	$("nav ul li").click(function() {
		var elem = $(this).text();
		var elemid = "#page-header";
		if (elem === "Guestbook") { 
			// relocate to guestbook page
			window.location = "guestbook.html";
		}
		else if (elem == "Home") {
			// relocate to home page
			window.location = "index.html";
		}
		else {			
			if (elem == "Events") { elemid = "#events-section" }
			else if (elem == "Updates") { elemid = "#updates-section" }
			else if (elem == "Weather") { elemid = "#weather-section" }

			$('html, body').animate({
					scrollTop: $(elemid).offset().top
			}, 800, 'swing');			
		}
		console.log(elem + " " + elemid);
	});
	
	//Smart Nav Burger icon click
	$(document).on('click','#nav-menu-icon', function(){
		$("nav ul li:not(:first-child)").slideToggle();
		$('#nav-menu-icon').toggleClass('fa-bars');
		$('#nav-menu-icon').toggleClass('fa-times');	
	});
	
	//Simple Weather - Loughborough - From Yahoo! weather
	$.simpleWeather({
    location: /*'52.7733528,-1.2179296'*/'Loughborough',
    woeid: '',
    unit: 'c',
    success: function(weather) {
      html = '<h2><i class="icon-'+weather.code+'"></i> '+weather.temp+'&deg;'+weather.units.temp+'</h2>';
      html += '<ul><li>'+weather.city+', UK</li>';
      html += '<li class="currently">'+weather.currently+'</li>';
      html += '<li>'+weather.wind.direction+' '+weather.wind.speed+' '+weather.units.speed+'</li></ul>';
  
      $("#weather").html(html);
    },
    error: function(error) {
      $("#weather").html('<p>'+error+'</p>');
    }
  });
	
	//Simple Weather - User Location
	if (navigator.geolocation) {
		$('.js-geolocation').show(); 
	} else {
		$('.js-geolocation').hide();
	}
	
	//Get location
	$('.js-geolocation').on('click', function() {
		var options = {enableHighAccuracy:true};
		$('#weather-spinner').css('display','inline-block');
		
		navigator.geolocation.getCurrentPosition(function(position) {
			console.log('User location: '+position.coords.latitude+','+position.coords.longitude);

			$('.js-geolocation').text("Weather for Your Location");	

			loadWeather(position.coords.latitude+','+position.coords.longitude); //load weather with User's lat/long coordinates
		},onError,options);
	});
	
});

//Load weather error
function onError(e){
  alert("Oops! We cannot seem to find your location.\n\nIf you're using Chrome and running this site locally: 'Because of security restrictions, resources loaded with the file:/// scheme are not allowed access to location.' \n\nTry a different browser: eg. Firefox, Safari");
	$('#weather-spinner').css('display','none');
}

//Called to load weather at user location
function loadWeather(location) {
  $.simpleWeather({
    location: location,
    woeid: '',
    unit: 'c',
    success: function(weather) {
      html = '<h2><i class="icon-'+weather.code+'"></i> '+weather.temp+'&deg;'+weather.units.temp+'</h2>';
      html += '<ul><li>'+weather.city+'</li>';
      html += '<li class="currently">'+weather.currently+'</li>';
      html += '<li>'+weather.wind.direction+' '+weather.wind.speed+' '+weather.units.speed+'</li></ul>';
      
			$('#weather-spinner').css('display','none');
      $("#weather2").html(html);
    },
    error: function(error) {
			$('#weather-spinner').css('display','none');
      $("#weather2").html('<p>'+error+'</p>');
    }
  });
}

// Called on ready and every time browser is resized
function checkSize() {
	//Fix issues of individual browsers on resizing
	fixBrowserIssues();
	
	//Logic to decide if 'smart nav' should be created or removed
	if ($(window).width() <= 480) {
		//If smallest breakpoint AND the smart-nav does not exist yet
		if ( $('#nav-menu-icon').attr('style') == "display:none;" ) {
			createSmartNav();
		}
	}
	else {
		//If not smallest breakpoint AND smart-nav hasnt already been removed
		if ( $('#nav-menu-icon').attr('style') != "display:none;" ) {
			removeSmartNav();
		}
	}
}

//Create & Remove the 'smart nav' with the slideToggle burger menu
function createSmartNav() {
	$('#nav-menu-icon').removeAttr('style');
	$("nav ul li:not(:first-child)").css('display','none');	
}
function removeSmartNav() {
	$('#nav-menu-icon').attr('style','display:none;');
	$("nav ul li:not(:first-child)").css('display','inline-block');
	$('#nav-menu-icon').removeClass('fa-times');
	$('#nav-menu-icon').removeClass('fa-bars');
	$('#nav-menu-icon').addClass('fa-bars');
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
		
		//Fix Events table showing right border wrong
		if ($(window).width() > 780) { 
			$('#events-section').find('th:nth-child(5)').css('border-right','none');
		}
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
		//Large hero image
		if ($(window).width() > 1280) {
			//set largest
			if ( $('#large-hero-image').attr('src') != "images/hero-image-largest.jpg" ) {
				$('#large-hero-image').attr('src','images/hero-image-largest.jpg');
			}
		}
		else if ($(window).width() > 780 && $(window).width() <= 1280) {
			//set large
			if ( $('#large-hero-image').attr('src') != "images/hero-image-large.jpg" ) {
				$('#large-hero-image').attr('src','images/hero-image-large.jpg');
			}
		}
		else if ($(window).width() > 480 && $(window).width() <= 780) {
			//set medium
			if ( $('#large-hero-image').attr('src') != "images/hero-image-medium.jpg" ) {
				$('#large-hero-image').attr('src','images/hero-image-medium.jpg');
			}
		}
		else {
			//set small
			if ( $('#large-hero-image').attr('src') != "images/hero-image-small.jpg" ) {
				$('#large-hero-image').attr('src','images/hero-image-small.jpg');
			}
		}
		
		//Fix Events table showing right border wrong
		if ($(window).width() > 780) { 
			$('#events-section').find('th:nth-child(5)').css('border-right','none');
		}
	}
}