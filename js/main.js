/* Map of GeoJSON data from airPollution.geojson */
//GOAL: Proportional symbols representing attribute values of mapped features
var map;
var dataStats = {};

//Step 1. Create the Leaflet map
function createMap(){

    //create the map
    map = L.map('map', {
        center: [0, 0],
        zoom: 2
    });
//add OSM base tilelayer
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    getData(map);
};

function calcStats(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var city of data.features){
        //loop through each year
        for(var year = 2013; year <= 2019; year+=1){
              //get PM for current year
              var value = city.properties["PM_"+ String(year)];
              //add value to array
              allValues.push(value);
        }
    }
    //get minimum, maximum, and mean values of our array
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    //calculate meanValue
    var sum = allValues.reduce(function(a, b){return a+b;});
    dataStats.mean = sum/ allValues.length;

}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/dataStats.min,0.5715) * minRadius

    return radius;
};

//calculate the symbol color based on AQI
function calcPropColor(attValue){
    
    if(attValue <= 12){
        fillColor = '#05e841'
    } else if (attValue > 12 && attValue <= 35.4){
        fillColor = '#f7f70c'
    } else if (attValue > 35.4 && attValue <= 55.5){
        fillColor = '#f78e0c'
    } else if (attValue > 55.5 && attValue <= 150.4){
        fillColor ='#f70c0c'
    } else{
        fillColor = '#9602c7'
    };
    return fillColor;

};
//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];

    //create marker options
    var options = {
        fillColor: "#3b4eff",
        color: "#ffffff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);
    
    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //popup content
    var popupContent = createPopupContent(feature.properties, attribute);

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius) 
        });
    //add event listener to change color when hovering over symbol
    //add event listner to change color back to default    
    layer.addEventListener('mouseover',function(){
        layer.setStyle({fillColor: calcPropColor(attValue)});
            
    layer.addEventListener('mouseout',function(){
        layer.setStyle({fillColor: '#3b4eff'});
        }); 
        
        })
        
        //return the circle marker to the L.geoJson pointToLayer option
        return layer;
};

//popup content function
function createPopupContent(properties, attribute){
        //build popup content string
        var year = attribute.split("_")[1];
        var popupContent = "<p><b>City:</b> " + properties.City + "</p>";
      
        popupContent += "<p><b>PM2.5:</b> " + properties[attribute] + " (μg/m3) in "+"<b>" + year + "</b>";
        
        return popupContent;
        };

// Add circle markers for point features to the map
function createPropSymbols(data, attributes){

    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes)
        }
    }).addTo(map);
};

//Create new sequence controls
function createSequenceControls(attributes){
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
 
        onAdd: function(){
          // create the control container div with a particular class name
          var container = L.DomUtil.create('div', 'sequence-control-container');  
        
           //create range input element (slider)
           container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">')

            //set slider attributes
            container.querySelector(".range-slider").max = 6;
            container.querySelector(".range-slider").min = 0;
            container.querySelector(".range-slider").value = 0;
            container.querySelector(".range-slider").step = 1;

            //add skip buttons
            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse"><img src="img/reverse.png"></button>'); 
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward"><img src="img/forward.png"></button>');

            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

           return container;
       
    }
    });

    map.addControl(new SequenceControl());


    //click listener for buttons
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;

            // increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                //if past the last attribute, wrap around to first attribute
                index = index > 6 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                //if past the first attribute, wrap around to last attribute
                index = index < 0 ? 6 : index;
            };

            //update slider
            document.querySelector('.range-slider').value = index;
            updatePropSymbols(attributes[index]);

          
        })
    })
  

    //Step 5: input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){            
        //get the new index value
        var index = this.value;
        updatePropSymbols(attributes[index]);
    });

};
 

function createLegend(){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');
            //legend description
            
            container.innerHTML = '<p class="temporalLegend">PM2.5 in <span class="year">2013</span></p>';

            var svg = '<svg id="attribute-legend" width="190px" height="120px">';

            //array of circle names to base loop on  
            var circles = ["max", "mean", "min"]; 
        
             //Step 2: loop to add each circle and text to svg string  
            for (var i=0; i<circles.length; i++){
                //Step 3: assign the r and cy attributes  
                var radius = calcPropRadius(dataStats[circles[i]]);  
                var cy = 75 - radius;  

               //circle string  
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy +
                '" fill="#3b4eff" fill-opacity="0.9" stroke="#ffffff" cx="50"/>';  
            
                //evenly space out labels            
                var textY = i * 20 + 20;            

                //text string            
                svg += '<text id="' + circles[i] + '-text" x="100" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " μg/m3" + '</text>';
        
            };  

            //close svg string  
            svg += "</svg>";

            //add attribute legend svg to container
            container.insertAdjacentHTML('beforeend',svg);


            return container;
        }
    });

    map.addControl(new LegendControl());
};

//Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    var year = attribute.split("_")[1];
        //update temporal legend
        document.querySelector("span.year").innerHTML = year;
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            var popupContent = createPopupContent(props, attribute);

            //update popup content            
            popup = layer.getPopup();            
            popup.setContent(popupContent).update();
        };
    });
};

// build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with PM values
        if (attribute.indexOf("PM") > -1){
            attributes.push(attribute);
        };
    };

    return attributes;
};



// Import GeoJSON data
function getData(){
    //load the data
    fetch("data/airPollution.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //create attribute array
            var attributes = processData(json);
            //calculate statistics
            calcStats(json);
            //call function to create proportional symbols
            createPropSymbols(json, attributes);
            //call function to create controls
            createSequenceControls(attributes);
            //call function to create legend
            createLegend(attributes);
        
    
        })
};

document.addEventListener('DOMContentLoaded',createMap)

