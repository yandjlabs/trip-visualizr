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

function processLocationName() {

}

function processLocationCoordinates() {

}

function processLocationAddress() {
    
}