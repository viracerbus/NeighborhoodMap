	// List of theaters used in the app

var map, geocode, mapBounds, infoWindow;

var theaters = [
{
	name: "Children's Theatre Company",
	location: "Minneapolis Institure of Arts",
	address: "2400 3rd Ave S, Minneapolis, MN 55404",
	description: "",
	mark: null,
	website: "http://childrenstheatre.org/"
},
{
	name: "Guthrie Theater",
	location: "Guthrie Theater",
	address: "818 S 2nd St, Minneapolis, MN 55415",
	description: "",
 	mark: null,
 	website: "http://www.guthrietheater.org/"
},
{
	name: "HUGE Improv Theater",
	location: "HUGE Theater",
	address: "3037 Lyndale Ave S, Minneapolis, MN 55408",
	description: "",
	mark: null,
	website: "http://www.hugetheater.com"
},
{
	name: "Mixed Blood Theatre Company",
	location: "Mixed Blood Theatre",
	address: "1501 S 4th St, Minneapolis, MN 55454",
	description: "",
	mark: null,
	website: "http://www.mixedblood.com/"
},
{
	name: "Orpheum Theatre (Minneapolis)",
	location: "Orpheum Theatre",
	address: "910 Hennepin Ave, Minneapolis, MN 55402",
	description: "",
	mark: null,
	website: "http://orpheum.theatreminneapolis.com/"
}];

	//Starting coordinates and zoom for our app

var defaultCoordinates = {
	lat: 45.0187021,
	lon: -93.5053253
};



var runWebpage = function() {

	// Creates the Google Map in the back

	var initializeMap = function() {
		map = new google.maps.Map(document.getElementById("map"), {
			center: new google.maps.LatLng(defaultCoordinates.lat,defaultCoordinates.lon),
			zoom: defaultCoordinates.zoom,
			mapTypeId: google.maps.MapTypeId.TERRAIN,
			disableDefaultUI: true
		});
		geocoder = new google.maps.Geocoder();
		mapBounds = new google.maps.LatLngBounds();
		infoWindow = new google.maps.InfoWindow();
	};

	var ViewModel = function() {
		self = this;

		// Constructor for theaters in the View Model

		var theater = function (data) {
			this.name = data.name;
			this.location = data.location;
			this.address = data.address;
			this.website = data.website;
			this.description = data.description;
			this.mark = data.mark;
		};

		// Adds all the theaters into an observable array (not in use at the moment...)

		this.mapTheaters = ko.observableArray([]);
		theaters.forEach(function(newTheater) {
			self.mapTheaters.push(new theater(newTheater));
			}
		);

		this.searchInput = ko.observable('');
		
		// Keeps track of any open Info Window to avoid having more than 1 up at a time

		var openInfo = null;

		// Return map to it's starting position, closing any info pop-ups

		var centerMap = function() {
			map.fitBounds(mapBounds);
			openInfo = null;
		};

		// Creates markers on the map for each theater and gives them the id of "marker"

		this.mapTheaters().forEach(function (theater) {
			geocoder.geocode({'address': theater.address}, function (results, status) {
				if (status == google.maps.GeocoderStatus.OK) {	 
					var marker = new google.maps.Marker({
						map: map,
						position: results[0].geometry.location,
						animation: google.maps.Animation.DROP,
						name: theater.name,
						id: "marker",
						clickable: true
					});
				

			// Fills out the Info Window with information pertaining to the location

			// Adds functionality to clicking on markers, Zooming into newly clicked areas and leaving behind previously visited ones
					marker.addListener("click", function () {
						map.panTo(marker.position);
						fillInfo(theater);
						infoWindow.open(map, marker);
						openInfo = infoWindow;
						marker.setAnimation(google.maps.Animation.BOUNCE);
						setTimeout(function() {marker.setAnimation(null);}, 1400);
						self.currentTheater(theater);
					});

					google.maps.event.addListener(infoWindow, 'closeclick', function() {
						centerMap();
					});

					theater.mark = marker;
					mapBounds.extend(results[0].geometry.location);

				} else {
					alert('Geocode failed due to: ' + status);
				}
				map.fitBounds(mapBounds);
			});
		});

		// Keep track of currently selected theater

		this.currentTheater = ko.observable(null);

		// Navigates you to the marker for the button you click

		this.clickTheaterTitle = function (theater) {
			google.maps.event.trigger(theater.mark, 'click');
		};


		// Filters as you type into the search bar both buttons and the markers

		this.inSearch = ko.computed(function() {
			var visible = ko.utils.arrayFilter(self.mapTheaters(), function (theater) {
				var input = self.searchInput().toLowerCase();
				// Prevents errors by hiding any theaters lacking a mark, initially showing buttons for each mark
				if (theater.mark === null) {
					return true;
				}
				if (theater.name.toLowerCase().includes(input)) {
					theater.mark.setVisible(true);
					return true;
				} else {
					theater.mark.setVisible(false);
					infoWindow.close();
					centerMap();
					return false;
				}
			});
			return visible;
			
		});


	};
	
	// Populates the Info Window

	var fillInfo = function (theater) {
		var wikipediaUrl = "http://en.wikipedia.org/w/api.php?action=opensearch&limit=1&search=" + theater.name + "&format=json&callback=wikiCallback";
		var wikiRequestTimeout = setTimeout(function() {
			alert("Wikipedia is taking too long to load. Refresh to try again later."); 
		}, 5000);
		$.ajax({
			url: wikipediaUrl,
			dataType: "jsonp",
			success: function(response) {
				theater.description = response[2];
				var url = "http://en.wikipedia.org/wiki/" + response[1];
				infoWindow.setContent(
					"<div class='infoWin'><h4>Theater: </h4><b>" + theater.name + "</b> at the <b>" + theater.location + "</b><br><br>" +
					  theater.description + "<br><br><b>Links:</b><br>" +
					  "<li><a href='" + url + "'>" + response[1] + " (Wikipedia)</a></li><li><a href='" + 
					  theater.website + "'>" + theater.name + " (Visit the website!)</a></li>" + "</div>"
					);
				clearTimeout(wikiRequestTimeout);
			}
		});
	};

	initializeMap();
	ko.applyBindings(new ViewModel());
};