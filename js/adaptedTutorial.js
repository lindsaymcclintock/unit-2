/* Map of GeoJSON data from MegaCities.geojson */
//declare map var in global scope
var map = L.map('map').setView([20,0],2);

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
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
        fetch("data/MegaCities.geojson")
            .then(function(response){
                return response.json();
            })
            .then(function(json){
               //create marker options
            var geojsonMarkerOptions = {
                radius: 5,
                fillColor: "#4e8b9c",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.9
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