const { convert } = require('geo-coordinates-parser')

// CODE FOR MAP
// init leaflet.js map
const map = L.map('map').setView([33.750746, -84.391830], 12);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' // DO NOT REMOVE OR WE WILL GET SUED
}).addTo(map);

// dummy coordinates list
COORDINATES_LIST = [
    [33.7575, -84.3897], // aquarium
    [33.762573, -84.392586], // coke company hq
    [33.7262, -84.3685] // zoo
]

// draw pins on map for every coordinate in list
function drawCoordinates() {
    for (coordinate of COORDINATES_LIST) {
        L.marker(coordinate).addTo(map);
    }
}
drawCoordinates(); // call this function on build, and whenever list updates

// CODE FOR LOCATION INPUT PROCESSING
// retrieve location input whenever new one submitted
const locationInput = document.getElementsByClassName("location-form-input")[0];
locationInput.addEventListener("change", () => {
    const locationInputValue = locationInput.value;
    console.log(locationInputValue);

    // TODO: whenever location changes, run appropriate checks and add to list
})

async function geocode(query) {
  // returns array of locations
    const response = await fetch(`https://photon.komoot.io/api/?q=${query}&limit=10`)
        .then(response => response.json())
        .then(response => response.features)

    // for now, retrieve first result (add search functionality later)
    const name = response[0].properties.name;
    const coordinates = response[0].geometry.coordinates;

    const result = {
        'name': name,
        'coordinates': coordinates
    }

    return result;
}

// takes string representing coordinate
async function reverseGeocode(coordinates) {
    const converted = convert(coordinates, 5); // add handling of invalid coords later
    const lon = converted.decimalLongitude;
    const lat = converted.decimalLatitude;
    
    // returns array of results
    const response = await fetch(`https://photon.komoot.io/reverse?lon=${lon}&lat=${lat}`)
        .then(response => response.json())
        .then(response => response.features)
    
    try {
        // take first result for now
        const addressData = response[0].properties;
    
        // const country = addressData.countrycode || null; too general, don't use for now
        const state = addressData.state || null;
        const city = addressData.city || null;
        const district = addressData.district || null;
        const county = addressData.county || null;
        const locality = addressData.locality || null;
        const name = addressData.name || null;
    
        const addressArray = [name, locality, county, district, city, state].filter(item => item);
        const address = addressArray.join(', ');
    
        console.log(addressData);
        console.log(address);
    } catch {
        return null;
    }
}