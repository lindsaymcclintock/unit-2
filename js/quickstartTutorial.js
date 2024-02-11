//use the .map class to create map and .setView method to determine 
//coordinates where map should first appear and at what level of zoom
var map = L.map('map').setView([51.505, -0.09], 13);

//use tileLayer to call tiles from server
//addTo used to add layer map
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//marker method is used to create icons
var marker = L.marker([51.5, -0.09]).addTo(map);
//circle class will create circle icons on map
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);

//class for drawing polygons
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

//bindPopup is method to create and connect popup with layer
//openPopop is a method to open popup while closing other popups
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

//.popup creates a popup
//.setLatLng will determine the location of the popup since it is not bound
//.setContent to populate popup
//add popup to the map and open when map first opens
var popup = L.popup()
    .setLatLng([51.513, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);

//create popup
    var popup = L.popup();
//setLatLng to determine location of popup- where map is clicked
//setContent to populate popup with lat/long and use toString method to 
//return text of coordinates
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}
    
map.on('click', onMapClick);