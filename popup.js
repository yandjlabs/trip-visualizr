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
const { convert } = require('geo-coordinates-parser')

// retrieve location input whenever new one submitted
const locationInput = document.getElementsByClassName("location-form-input")[0];
locationInput.addEventListener("change", () => {
    const locationInputValue = locationInput.value;
    console.log(locationInputValue);

    // TODO: whenever location changes, run appropriate checks and add to list
})

async function processLocationCoordinates(coords) {
    coords.trim();
    const COORDINATES = convert(coords);

    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${COORDINATES.decimalLatitude}&lon=${COORDINATES.decimalLongitude}`)
        .then(response => response.json())
        .then(response => response.address);

    const ADDRESS = Object.values(response).join(', ');

    return {
        "coordinates": COORDINATES,
        "address": ADDRESS
    };
}

processLocationCoordinates("33.7338° N, 84.3717° W");

function processLocationAddress(address) {
    // geocode address for coords
    // /search api query to nominatim

    // return coords, address in one object
}