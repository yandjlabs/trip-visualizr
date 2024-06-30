const { convert } = require('geo-coordinates-parser')

// CODE FOR MAP
// init leaflet.js map
const map = L.map('map').setView([33.750746, -84.391830], 13);

// add leaflet fullscreen
map.addControl(new L.Control.Fullscreen());

// init marker layer
let markerGroup = L.layerGroup().addTo(map);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' // DO NOT REMOVE OR WE WILL GET SUED
}).addTo(map);

// dummy coordinates list
let locations = [];

// draw pins on map for every coordinate in list
function drawLocations() {
    // clear all markers before redrawing, in case locations deleted
    markerGroup.clearLayers();

    for (const location of locations) {
        const marker = L.marker(location.coordinates);
        marker.bindPopup(location.name).openPopup();
        marker.addTo(markerGroup);
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
            showError('Location already in list')
        } else {
            locations.unshift(location);
            map.panTo(location.coordinates, animate=true, duration=0.3);
        }
    } else { // else if name or address, geocode
        const location = await geocode(input);
        if (locationNames.includes(location.name)) { // check if location already in list
            showError('Location already in list')
        } else {
            locations.unshift(location);
            map.panTo(location.coordinates, animate=true, duration=0.3);
        }
    }

    // after locations updated, update html
    updateLocationList();

    drawLocations();
    locationInput.value = '';
})

// update list in html according to values in location list
const locationList = document.getElementById("location-list");
function updateLocationList() {
    const locationListItems = locations.map((location, index) => `
           <li class="location-item" data-coordinates="${location.coordinates}">
                <div class="location-item-upper">
                    <h3 class="location-item-title">${location.name}</h3>
                    <button class="location-item-delete" data-index="${index}">🗑</button>
                </div>
                <p class="location-item-address">${location.address}.</p>
            </li>
    `).join('');

    locationList.innerHTML = locationListItems;

    const deleteButtons = document.getElementsByClassName('location-item-delete');
    for (const button of deleteButtons) {
        button.addEventListener('click', (event) => {
            locations.splice(event.target.dataset.index, 1);

            // update ui to reflect new list content
            updateLocationList();
            drawLocations();
        })
    }

    const listItems = document.getElementsByClassName('location-item');
    for (const item of listItems) {
        item.addEventListener('click', (event) => {
            // convert coordinate data from string to array
            const coordinates = event.currentTarget.dataset.coordinates.split(',').map(Number);

            map.panTo(coordinates, animate=true, duration=0.3);
        })
    }
}

// close error message if button clicked
const errorMessageButton = document.getElementsByClassName('location-form-error-btn')[0];
console.log(errorMessageButton)

errorMessageButton.addEventListener('click', (event) => {
    hideError();
})

// takes string representing address/name
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
    const street = input.street || null;
    const housenumber = input.housenumber || null;

    // TODO: format address depending on location, according to national norms
    const addressArray = [housenumber, street, locality, county, district, city, state].filter(item => item);
    const address = addressArray.join(', ');

    return address
}

function showError(message) {
    const error = document.getElementById('location-form-error');
    const errorText = document.getElementsByClassName('location-form-error-text')[0];

    errorText.innerHTML = message;
    error.style.display = 'flex';
}

function hideError() {
    const error = document.getElementById('location-form-error');

    error.style.display = 'none';
}