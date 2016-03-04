	// List of theaters used in the app

var theaters = [
{
	name: "Morris Park Players",
	location: "Edison High School, ",
	type: "Community",
	description: "Located in the cities, this group frequently puts on productions with a large number of roles for kids and adults, emphasizing community above all. It first opened in 1952 and has performed over 100 musicals over it's 60+ years. For more information, visit http://www.morrisparkplayers.org/",
	lat: 45.0094185,
	lon: -93.2538724,
	mark: null
},
{
	name: "Lyric Arts",
	location: "Lyric Arts Main Street Stage, Anoka",
	type: "Community",
	description: "Located in Anoka, Lyric Arts sports some of the best talent available to community theaters, and consistently puts on stellar performances in a sold out house where no seat is a bad seat. Founded as recently as 1995, this little theater always puts on must-see performances. For more information, visit http://www.lyricarts.org/",
	lat: 45.1975685,
	lon: -93.3865027,
	mark: null
},
{
	name: "Chanhassen Dinner Theaters",
	location: "Chanhassen Dinner Theaters, Chanhassen",
	type: "Semi-Professional",
	description: "A innovative way to enjoy theater, feel free to order a meal before the show begins and enjoy it during the long intermission. Chanhassen Dinner Theater brings together great performing art with great food, leaving patrons eager for their next trip to see another marvelous show. For more information, visit http://www.chanhassendt.calls.net/",
	lat: 44.8609628,
	lon: -93.5344077,
	mark: null
},
{
	name: "Chaska Valley Family Theater",
	location: "Chaska High School, Chaska",
	type: "Community",
	description: "Chaska Valley Family Theater is a theater that boasts a community so strong and friendly you feel like family the moment you meet them. Founded by a group of former Chaska High School students, CVFT has stood the test of time and continues putting on exceptional community shows. For more information, visit http://www.cvft.org/",
	lat: 44.8243878,
	lon: -93.5914921,
	mark: null
},
{
	name: "Orpheum",
	location: "Orpheum Theatre, Minneapolis",
	type: "Professional",
	description: "Though the price tag may seem a bit intimidating at first, you are guaranteed to not be disappointed. The Orpheum has a long standing reputation of providing some of the very best performances to ever hit the Twin Cities of Minnesota. Each show will leave you breathless and in awe at the marvelous talent you witness. For more information, visit http://theatreminneapolis.com/",
	lat: 44.9763528,
	lon: -93.2796657,
	mark: null
}];

	//Starting coordinates and zoom for our app

var defaultCoordinates = {
	lat: 45.0187021,
	lon: -93.5053253,
	zoom: 11
}

var Error = function() {
	alert("Unable to connect to Google Maps. Refresh page or check back at a later time.");
}

var RunWebpage = function() {
var ViewModel = function() {
	self = this;

	// Constructor for theaters in the View Model

	var theater = function (data) {
		this.name = data.name;
		this.location = data.location;
		this.type = data.type;
		this.description = data.description;
		this.lat = data.lat;
		this.lon = data.lon;
		this.mark = data.mark;
	};

	// Creates the Google Map in the back

	var initializeMap = function() {
		map = new google.maps.Map(document.getElementById("map"), {
			center: new google.maps.LatLng(defaultCoordinates.lat,defaultCoordinates.lon),
			zoom: defaultCoordinates.zoom,
			mapTypeId: google.maps.MapTypeId.TERRAIN,
			disableDefaultUI: true
		});
	};
	initializeMap();

	this.searchInput = ko.observable('');
	
	// Keeps track of any open Info Window to avoid having more than 1 up at a time

	var openInfo = null;

	// Return map to it's starting position, closing any info pop-ups

	var centerMap = function() {
		if (openInfo !== null) {openInfo.close(map, this)};
		map.setCenter({lat: defaultCoordinates.lat, lng: defaultCoordinates.lon});
		map.setZoom(defaultCoordinates.zoom);	
		openInfo = null;
	}

	// Creates markers on the map for each theater and gives them the id of "marker"

	theaters.forEach(function (theater) {
		marker = new google.maps.Marker({
			map: map,
			position: {lat: theater.lat, lng: theater.lon},
			animation: google.maps.Animation.DROP,
			name: theater.name,
			id: "marker",
			clickable: true
		});

	// Fills out the Info Window with information pertaining to the location

		infoWindow = new google.maps.InfoWindow({
			position: {lat: theater.lat, lng: theater.lon},
			content: "<p><b>" + theater.name + "</b> performing at <b>" + theater.location + "</b></p>" + theater.description
		});

	// Adds functionality to clicking on markers, Zooming into newly clicked areas and leaving behind previously visited ones

		marker.addListener("click", function () {
			if (openInfo === infoWindow) {
				centerMap();
				self.searchInput('');
			} else {
				if (openInfo !== null) {
					centerMap();
					self.searchInput('');
				} 
				map.panTo(marker.position);
				map.setZoom(15);
				infoWindow.open(map, marker);
				openInfo = infoWindow;
				marker.setAnimation(google.maps.Animation.BOUNCE);
				setTimeout(function() {marker.setAnimation(null)}, 1450);
				self.currentTheater(theater);
			}
		});

		google.maps.event.addListener(infoWindow, 'closeclick', function() {
			centerMap();
		});


		theater.mark = marker;
	});

	// Keep track of currently selected theater

	this.currentTheater = ko.observable(null);

	// Adds all the theaters into an observable array (not in use at the moment...)

	this.mapTheaters = ko.observableArray([]);
	theaters.forEach(function(newTheater) {
		self.mapTheaters.push(new theater(newTheater));
		}
	);


	// Navigates you to the marker for the button you click

	this.clickTheaterTitle = function (theater) {
		map.panTo(marker.position);
		map.setZoom(15);
		infoWindow.open(map, marker);
		openInfo = infoWindow;
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function() {marker.setAnimation(null)}, 1450);
		self.currentTheater(theater);
	}


	// Filters as you type into the search bar both buttons and the markers

	this.inSearch = ko.computed(function() {
		var visible = ko.utils.arrayFilter(theaters, function (theater) {
			if (theater.name.toLowerCase().includes(self.searchInput().toLowerCase())) {
				theater.mark.setVisible(true);
				return true;
			} else {
				theater.mark.setVisible(false);
				centerMap();
				return false;
			}
		});

		return visible;
		
	});


};
			
$(document).ready(function(){
	ko.applyBindings(new ViewModel());
});};