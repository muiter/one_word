"use strict";

var map, map2;
var marker;
var markerArray = new Array();
var infowindow = new google.maps.InfoWindow({ 
    size: new google.maps.Size(150,50)
});

// THIS ISN'T WORKING AND I CAN'T FIGURE OUT WHY FOR THE LIFE OF ME
var infowindow2 = new google.maps.InfoWindow({ 
    size: new google.maps.Size(200,60)
});

// A function to create the marker and set up the event window function 
function createMarker(latlng, name, html) {
    var contentString = html;
    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        zIndex: Math.round(latlng.lat()*-100000)<<5
    });

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(contentString); 
        infowindow.open(map,marker);
    });
    google.maps.event.trigger(marker, 'click');    
    return marker;
}

// make both the maps!
function initialize() {
        var mapOptions = {
			zoom: 1,
			center: new google.maps.LatLng(0,0),
			mapTypeControl: true,
			mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
			navigationControl: true,
			mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
        map2 = new google.maps.Map(document.getElementById("map"), mapOptions);

        google.maps.event.addListener(map, 'click', function() {
            infowindow.close();
        });

        google.maps.event.addListener(map, 'click', function(event) {
        //call function to create marker
        if (marker) {
			marker.setMap(null);
			marker = null;
        }
         marker = createMarker(event.latLng, "name", "<b>Location</b><br>"+event.latLng);
         $("#lat").val(event.latLng.lat());
         $("#lon").val(event.latLng.lng());
  });
}

google.maps.event.addDomListener(window, 'load', initialize);

$(document).ready(function(){
	$.ajax({
		url: "gettweets.php",
		type: "GET",
		success: function(json) {
			// gets json data for all tweets
			// should we enter a date for tweets entered as well?
			var jsonData = JSON.parse(json);
			for(var i = jsonData.length - 1; i >= 0 ; i--) {
				var tweet = document.createElement("div");
				$(tweet).addClass("tweet");
				var name = document.createElement("a");
				name.href= "#";
				// when a username is clicked, take users to page with just that users tweets.
				// requires a seperate AJAX/mySQL call
				$(name).click(function(){
					document.getElementById("tweetSect").innerHTML = "";
					$("#seeAll").show();
					
					$.ajax({
						url: "gettweets.php",
						type: "GET",
						data:{name: $(this).text()},
						success: function(json) {
							var jsonData = JSON.parse(json);
							for(var i = jsonData.length - 1; i >= 0 ; i--) {
									var tweet = document.createElement("div");
									$(tweet).addClass("tweet");
									var name = document.createElement("a");
									name.href= "#";
									name.innerHTML = jsonData[i].user;
									$(name).addClass("username");
									var time = document.createElement("span");
									time.innerHTML = jsonData[i].time;
									tweet.innerHTML = jsonData[i].tweet;
									tweet.appendChild(name);
									tweet.appendChild(time);
									document.getElementById("tweetSect").appendChild(tweet);
							}
							var arrayLength = markerArray.length;
							for(var j = 0; j < arrayLength; ++j){
									if(markerArray[j].name != jsonData[0].user){
													markerArray[j].setMap(null);
									}
							}
						},
						error: function() {
							alert("There was a problem. Please try again.");
						}
					});
				});
				name.innerHTML = jsonData[i].user;
				var lat = jsonData[i].latitude;
				var lon = jsonData[i].longitude;
				$(name).addClass("username");
				var time = document.createElement("span");
				time.innerHTML = jsonData[i].time;
				tweet.innerHTML = jsonData[i].tweet;
				tweet.appendChild(name);
				tweet.appendChild(time);
				document.getElementById("tweetSect").appendChild(tweet);
				
				// populate with tweet locations
				var myLatLng = new google.maps.LatLng(lat, lon);
				markerArray[i] = new google.maps.Marker({
					position: myLatLng,
					map: map2,
					latitude: lat,
					longitude: lon,
					tweet: jsonData[i].tweet,
					name: jsonData[i].user
				});
				google.maps.event.addListener(markerArray[i], 'click', function(){
					infowindow2.close();
					infowindow2 = new google.maps.InfoWindow({
									content: "<b>" + this.name + " </b><br><em>" + this.tweet + "</em> "
					});

					infowindow2.open(map2, this);
				});
			}
		},
		error: function() {
			alert("There was a problem. Please try again.");
		}
	});
	$("#submitTweet").click(function(){
		if($("#word").val() == "" || $("#lat").val() == "" || $("#lon").val() == ""){
						alert("Please enter all data before submitting");
		}else if(isNaN($("#lat").val()) || isNaN($("#lon").val())){
						alert("Please make sure your latitude and longitude are numbers");
		}else {
			$.ajax({
				url: 'home.php',  
				type: 'POST',
				data: {tweet: $("#word").val(), lat: $("#lat").val(), lon: $("#lon").val()},
				success: function(){location.reload(); },  //  refresh page or do above function again without ajax 
				error: function(){
					// change this span's appearance!!!!!!!
					if($("#error").length == 0){ // if there isn't already an error message present
						$("#word").after("<div id=\"error\">Please enter valid coordinates.</div>");
					}
				}
			});
		}
	});
	
	$("#seeAll").click(function() {
		location.reload();
	});
});