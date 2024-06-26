const { convert } = require('geo-coordinates-parser')

// CODE FOR MAP
// init leaflet.js map
const map = L.map('map').setView([33.750746, -84.391830], 12);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' // DO NOT REMOVE OR WE WILL GET SUED
}).addTo(map);

// dummy coordinates list
let coordinates = [
    {
        'name': 'Georgia Aquarium',
        'address': '225 Baker St NW, Atlanta, GA 30313, USA',
        'coordinates': [33.7575, -84.3897]
    },
    {
        'name': 'Zoo Atlanta',
        'address': '800 Cherokee Ave SE, Atlanta, GA 30315, USA',
        'coordinates': [33.7262, -84.3685]
    }
]

// draw pins on map for every coordinate in list
function drawCoordinates() {
    for (const location of coordinates) {
        const marker = L.marker(location.coordinates);
        marker.bindPopup(location.name).openPopup();
        marker.addTo(map);
    }
}
drawCoordinates(); // call this function on build, and whenever list updates

// CODE FOR LOCATION INPUT PROCESSING
// retrieve location input whenever new one submitted
const locationInput = document.getElementsByClassName("location-form-input")[0];
locationInput.addEventListener("change", async () => {
    const input = locationInput.value;

    const coordRegex = /[0-9]+\.[0-9]+.*\s+.*[0-9]+\.[0-9]+/i;

    // if coordinate, reverse geocode
    if (coordRegex.test(input)) {
        const location = await reverseGeocode(input);
        coordinates.push(location);
    } else { // else if name or address, geocode
        const location = await geocode(input);
        coordinates.push(location);
    }

    drawCoordinates(); 
})

async function geocode(query) {
  // returns array of locations
    const response = await fetch(`https://photon.komoot.io/api/?q=${query}&limit=10`)
        .then(response => response.json())
        .then(response => response.features)

    // for now, retrieve first result (add search functionality later)
    const name = response[0].properties.name;
    const address = extractAddress(response[0].properties);
    const coordinates = response[0].geometry.coordinates;

    coordinates.reverse(); // correct photon's odd lat-lon coordinates

    const result = {
        'name': name,
        'address': address,
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

        const name = addressData.name || null;
        const address = extractAddress(addressData);
    
        return({
            'name': name,
            'address': address,
            'coordinates': [lon, lat]
        })
    } catch {
        return null;
    }
}

// UTILS!
function extractAddress(input) {
    // const country = input.countrycode || null; too general, don't use for now
    const state = input.state || null;
    const city = input.city || null;
    const district = input.district || null;
    const county = input.county || null;
    const locality = input.locality || null;
    const name = input.name || null;

    // TODO: format address depending on country, according to national norms
    const addressArray = [name, locality, county, district, city, state].filter(item => item);
    const address = addressArray.join(', ');

    return address
}