/* Map of GeoJSON data from airPollution.geojson */
//declare map var in global scope
var map = L.map('map').setView([20,0],1.5);

    //add OSM base tilelayer
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

//call getData function

 //function to attach popups to each mapped feature
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
}
    
//function to retrieve the data and place it on the map
    function getData(){
        //load the data
        fetch("data/airPollution.geojson")
            .then(function(response){
                return response.json();
            })
            .then(function(json){
               //create marker options
            var geojsonMarkerOptions = {
                radius: 5,
                fillColor: "#f80c00",
                color: "#ffffff",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
              //create a Leaflet GeoJSON layer and add it to the map
              //use pointToLayer to create Leaflet layer from GeoJSON points
              //circleMarker methond to use circle icons
              //call onEachFeature function to attach popups
            L.geoJson(json, {
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                    
                },  
                onEachFeature: onEachFeature
            }).addTo(map); //add points to map
        });
        };
                
                
getData();//call getData function