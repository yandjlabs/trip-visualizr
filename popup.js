const { convert } = require('geo-coordinates-parser')

// CODE FOR MAP
// init leaflet.js map
const map = L.map('map').setView([33.750746, -84.391830], 12);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' // DO NOT REMOVE OR WE WILL GET SUED
}).addTo(map);

// dummy coordinates list
let locations = [];

// draw pins on map for every coordinate in list
function drawLocations() {
    for (const location of locations) {
        const marker = L.marker(location.coordinates);
        marker.bindPopup(location.name).openPopup();
        marker.addTo(map);
    }
}
drawLocations(); // call this function on build, and whenever list updates

// CODE FOR LOCATION INPUT PROCESSING
// retrieve location input whenever new one submitted
const locationInput = document.getElementsByClassName("location-form-input")[0];
locationInput.addEventListener("change", async () => {
    const input = locationInput.value;

    const coordRegex = /[0-9]+\.[0-9]+.*\s+.*[0-9]+\.[0-9]+/i;
    const locationNames = locations.map(location => location.name);

    // if coordinate, reverse geocode
    if (coordRegex.test(input)) {
        const location = await reverseGeocode(input);
        if (locationNames.includes(location.name)) { // check if location already in list
            return null;
        } else {
            locations.push(location);
        }
    } else { // else if name or address, geocode
        const location = await geocode(input);
        if (locationNames.includes(location.name)) { // check if location already in list
            return null;
        } else {
            locations.push(location);
        }
    }

    // after locations updated, update html
    updateLocationList();

    drawLocations();
    locationInput.value = '';
})

function updateLocationList() {
    const locationList = document.getElementById("location-list");
    const locationListItems = locations.map(location => `
        <li class="location-item">
            <h3 class="location-item-title">${location.name}</h3 class="location-item-title">
            <p class="location-item-address">${location.address}.</p>
        </li>
    `).join('');

    locationList.innerHTML = locationListItems;
}

async function geocode(query) {
    // returns array of locations
    const response = await fetch(`https://photon.komoot.io/api/?q=${query}&limit=10`) // TODO: handle no results
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
    const response = await fetch(`https://photon.komoot.io/reverse?lon=${lon}&lat=${lat}`) // TODO: handle no results
        .then(response => response.json())
        .then(response => response.features)

    try {
        // take first result for now
        const addressData = response[0].properties;

        const name = addressData.name || null;
        const address = extractAddress(addressData);

        return ({
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
    // const location = input.locationcode || null; too general, don't use for now
    const state = input.state || null;
    const city = input.city || null;
    const district = input.district || null;
    const county = input.county || null;
    const locality = input.locality || null;
    const name = input.name || null;

    // TODO: format address depending on location, according to national norms
    const addressArray = [name, locality, county, district, city, state].filter(item => item);
    const address = addressArray.join(', ');

    return address
}