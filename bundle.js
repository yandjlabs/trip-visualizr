(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
//function for converting coordinates from a string to decimal and verbatim
//this is just a comment
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const regex_js_1 = require("./regex.js");
const toCoordinateFormat_js_1 = __importDefault(require("./toCoordinateFormat.js"));
/**
 * Function for converting coordinates in a variety of formats to decimal coordinates
 * @param {string} coordsString The coordinates string to convert
 * @param {number} [decimalPlaces] The number of decimal places for converted coordinates; default is 5
 * @returns {{verbatimCoordinates: string, decimalCoordinates: string, decimalLatitude: string, decimalLongitude: string, closeEnough: function(string): boolean, toCoordinateFormat: toCoordinateFormat}}
 */
function converter(coordsString, decimalPlaces) {
    //TODO add exact match to entered string, so that it can be used to filter out superflous text around it
    if (!decimalPlaces) {
        decimalPlaces = 5;
    }
    coordsString = coordsString.replace(/\s+/g, ' ').trim(); //just to tidy up whitespaces
    let ddLat = null;
    let ddLng = null;
    let latdir = "";
    let lngdir = "";
    let originalFormat = null;
    let match = [];
    let matchSuccess = false;
    if (regex_js_1.dm_invalid.test(coordsString)) {
        throw new Error("invalid coordinate value");
    }
    if (regex_js_1.dm_numbers.test(coordsString)) {
        match = regex_js_1.dm_numbers.exec(coordsString);
        matchSuccess = checkMatch(match);
        if (matchSuccess) {
            ddLat = Math.abs(match[1]) + match[2] / 60;
            if (Number(match[1]) < 0) {
                ddLat *= -1;
            }
            ddLng = Math.abs(match[3]) + match[4] / 60;
            if (Number(match[3]) < 0) {
                ddLng *= -1;
            }
            originalFormat = "DM";
        }
        else {
            throw new Error("invalid coordinate format");
        }
    }
    else if (regex_js_1.dd_re.test(coordsString)) {
        match = regex_js_1.dd_re.exec(coordsString);
        matchSuccess = checkMatch(match);
        if (matchSuccess) {
            ddLat = match[2];
            ddLng = match[6];
            //need to fix if there are ','s instead of '.'
            if (ddLat.includes(',')) {
                ddLat = ddLat.replace(',', '.');
            }
            if (ddLng.includes(',')) {
                ddLng = ddLng.replace(',', '.');
            }
            originalFormat = "DD";
            //validation, we don't want things like 23.00000
            //some more validation: no zero coords or degrees only
            if (Number(Math.round(ddLat)) == Number(ddLat)) {
                throw new Error('integer only coordinate provided');
            }
            if (Number(Math.round(ddLng)) == Number(ddLng)) {
                throw new Error('integer only coordinate provided');
            }
            //get directions
            if (match[1]) {
                latdir = match[1];
                lngdir = match[5];
            }
            else if (match[4]) {
                latdir = match[4];
                lngdir = match[8];
            }
        }
        else {
            throw new Error("invalid decimal coordinate format");
        }
    }
    else if (regex_js_1.dms_periods.test(coordsString)) {
        match = regex_js_1.dms_periods.exec(coordsString);
        matchSuccess = checkMatch(match);
        if (matchSuccess) {
            ddLat = Math.abs(parseInt(match[2]));
            if (match[4]) {
                ddLat += match[4] / 60;
                originalFormat = "DM";
            }
            if (match[6]) {
                ddLat += match[6].replace(',', '.') / 3600;
                originalFormat = "DMS";
            }
            if (parseInt(match[2]) < 0) {
                ddLat = -1 * ddLat;
            }
            ddLng = Math.abs(parseInt(match[9]));
            if (match[11]) {
                ddLng += match[11] / 60;
            }
            if (match[13]) {
                ddLng += match[13].replace(',', '.') / 3600;
            }
            if (parseInt(match[9]) < 0) {
                ddLng = -1 * ddLng;
            }
            //the compass directions
            if (match[1]) {
                latdir = match[1];
                lngdir = match[8];
            }
            else if (match[7]) {
                latdir = match[7];
                lngdir = match[14];
            }
        }
        else {
            throw new Error("invalid DMS coordinates format");
        }
    }
    else if (regex_js_1.dms_abbr.test(coordsString)) {
        match = regex_js_1.dms_abbr.exec(coordsString);
        matchSuccess = checkMatch(match);
        if (matchSuccess) {
            ddLat = Math.abs(parseInt(match[2]));
            if (match[4]) {
                ddLat += match[4] / 60;
                originalFormat = "DM";
            }
            if (match[6]) {
                ddLat += match[6] / 3600;
                originalFormat = "DMS";
            }
            if (parseInt(match[2]) < 0) {
                ddLat = -1 * ddLat;
            }
            ddLng = Math.abs(parseInt(match[10]));
            if (match[12]) {
                ddLng += match[12] / 60;
            }
            if (match[14]) {
                ddLng += match[14] / 3600;
            }
            if (parseInt(match[10]) < 0) {
                ddLng = -1 * ddLng;
            }
            //the compass directions
            if (match[1]) {
                latdir = match[1];
                lngdir = match[9];
            }
            else if (match[8]) {
                latdir = match[8];
                lngdir = match[16];
            }
        }
        else {
            throw new Error("invalid DMS coordinates format");
        }
    }
    else if (regex_js_1.coords_other.test(coordsString)) {
        match = regex_js_1.coords_other.exec(coordsString);
        matchSuccess = checkMatch(match);
        // we need an extra check here for things that matched that shouldn't have
        if (match.filter(x => x).length <= 5) {
            throw new Error("invalid coordinates format");
        }
        if (matchSuccess) {
            ddLat = Math.abs(parseInt(match[2]));
            if (match[4]) {
                ddLat += match[4].replace(',', '.') / 60;
                originalFormat = "DM";
            }
            if (match[6]) {
                ddLat += match[6].replace(',', '.') / 3600;
                originalFormat = "DMS";
            }
            if (parseInt(match[2]) < 0) {
                ddLat = -1 * ddLat;
            }
            ddLng = Math.abs(parseInt(match[10]));
            if (match[12]) {
                ddLng += match[12].replace(',', '.') / 60;
            }
            if (match[14]) {
                ddLng += match[14].replace(',', '.') / 3600;
            }
            if (parseInt(match[10]) < 0) {
                ddLng = -1 * ddLng;
            }
            //the compass directions
            if (match[1]) {
                latdir = match[1];
                lngdir = match[9];
            }
            else if (match[8]) {
                latdir = match[8];
                lngdir = match[16];
            }
        }
        else {
            throw new Error("invalid coordinates format");
        }
    }
    if (matchSuccess) {
        //more validation....
        //check longitude value - it can be wrong!
        if (Math.abs(ddLng) >= 180) {
            throw new Error("invalid longitude value");
        }
        //just to be safe check latitude also...
        if (Math.abs(ddLat) >= 90) {
            throw new Error("invalid latitude value");
        }
        //if we have one direction we must have the other
        if ((latdir && !lngdir) || (!latdir && lngdir)) {
            throw new Error("invalid coordinates value");
        }
        //the directions can't be the same
        if (latdir && latdir == lngdir) {
            throw new Error("invalid coordinates format");
        }
        // a bit of tidying up...
        if (ddLat.toString().includes(',')) {
            ddLat = ddLat.replace(',', '.');
        }
        if (ddLng.toString().includes(',')) {
            ddLng = ddLng.replace(',', '.');
        }
        //make sure the signs and cardinal directions match
        let patt = /S|SOUTH/i;
        if (patt.test(latdir)) {
            if (ddLat > 0) {
                ddLat = -1 * ddLat;
            }
        }
        patt = /W|WEST/i;
        if (patt.test(lngdir)) {
            if (ddLng > 0) {
                ddLng = -1 * ddLng;
            }
        }
        //we need to get the verbatim coords from the string
        //we can't split down the middle because if there are decimals they may have different numbers on each side
        //so we need to find the separating character, or if none, use the match values to split down the middle
        const verbatimCoordinates = match[0].trim();
        let verbatimLat;
        let verbatimLng;
        const sepChars = /[,/;\u0020]/g; //comma, forward slash and spacebar
        const seps = verbatimCoordinates.match(sepChars);
        if (seps == null) {
            //split down the middle
            const middle = Math.floor(coordsString.length / 2);
            verbatimLat = verbatimCoordinates.substring(0, middle).trim();
            verbatimLng = verbatimCoordinates.substring(middle).trim();
        }
        else { //if length is odd then find the index of the middle value
            //get the middle index
            let middle;
            //easy for odd numbers
            if (seps.length % 2 == 1) {
                middle = Math.floor(seps.length / 2);
            }
            else {
                middle = (seps.length / 2) - 1;
            }
            //walk through seps until we get to the middle
            let splitIndex = 0;
            //it might be only one value
            if (middle == 0) {
                splitIndex = verbatimCoordinates.indexOf(seps[0]);
                verbatimLat = verbatimCoordinates.substring(0, splitIndex).trim();
                verbatimLng = verbatimCoordinates.substring(splitIndex + 1).trim();
            }
            else {
                let currSepIndex = 0;
                let startSearchIndex = 0;
                while (currSepIndex <= middle) {
                    splitIndex = verbatimCoordinates.indexOf(seps[currSepIndex], startSearchIndex);
                    startSearchIndex = splitIndex + 1;
                    currSepIndex++;
                }
                verbatimLat = verbatimCoordinates.substring(0, splitIndex).trim();
                verbatimLng = verbatimCoordinates.substring(splitIndex + 1).trim();
            }
        }
        //validation again...
        //we only allow zeros after the period if its DM
        const splitLat = verbatimLat.split('.');
        if (splitLat.length == 2) {
            if (splitLat[1] == 0 && splitLat[1].length != 2) {
                throw new Error('invalid coordinates format');
            }
        }
        const splitLon = verbatimLng.split('.');
        if (splitLon.length == 2) {
            if (splitLon[1] == 0 && splitLon[1].length != 2) {
                throw new Error('invalid coordinates format');
            }
        }
        //no integer coords allowed
        if (/^\d+$/.test(verbatimLat) || /^\d+$/.test(verbatimLng)) {
            throw new Error('degree only coordinate/s provided');
        }
        //all done!!
        //just truncate the decimals appropriately
        ddLat = Number(Number(ddLat).toFixed(decimalPlaces));
        ddLng = Number(Number(ddLng).toFixed(decimalPlaces));
        return Object.freeze({
            verbatimCoordinates,
            verbatimLatitude: verbatimLat,
            verbatimLongitude: verbatimLng,
            decimalLatitude: ddLat,
            decimalLongitude: ddLng,
            decimalCoordinates: `${ddLat},${ddLng}`,
            originalFormat,
            closeEnough: coordsCloseEnough,
            toCoordinateFormat: toCoordinateFormat_js_1.default
        });
    }
    else {
        throw new Error("coordinates pattern match failed");
    }
}
function checkMatch(match) {
    if (!isNaN(match[0])) { //we've matched a number, not what we want....
        return false;
    }
    //first remove the empty values from the array
    const filteredMatch = [...match];
    //we need to shift the array because it contains the whole coordinates string in the first item
    filteredMatch.shift();
    //check the array length is an even number
    if (filteredMatch.length % 2 > 0) {
        return false;
    }
    // regex for testing corresponding values match
    const numerictest = /^[-+]?\d+([\.,]\d+)?$/; //for testing numeric values
    const stringtest = /[eastsouthnorthwest]+/i; //for testing string values (north, south, etc)
    const halflen = filteredMatch.length / 2;
    for (let i = 0; i < halflen; i++) {
        const leftside = filteredMatch[i];
        const rightside = filteredMatch[i + halflen];
        const bothAreNumbers = numerictest.test(leftside) && numerictest.test(rightside);
        const bothAreStrings = stringtest.test(leftside) && stringtest.test(rightside);
        const valuesAreEqual = leftside == rightside;
        if (leftside == undefined && rightside == undefined) { //we have to handle undefined because regex converts it to string 'undefined'!!
            continue;
        }
        else if (leftside == undefined || rightside == undefined) { //no we need to handle the case where one is and the other not...
            return false;
        }
        else if (bothAreNumbers || bothAreStrings || valuesAreEqual) {
            continue;
        }
        else {
            return false;
        }
    }
    return true;
}
//functions for coordinate validation
//as decimal arithmetic is not straightforward, we approximate
function decimalsCloseEnough(dec1, dec2) {
    const originaldiff = Math.abs(dec1 - dec2);
    const diff = Number(originaldiff.toFixed(6));
    if (diff <= 0.00001) {
        return true;
    }
    else {
        return false;
    }
}
function coordsCloseEnough(coordsToTest) {
    if (!coordsToTest) {
        throw new Error('coords must be provided');
    }
    if (coordsToTest.includes(',')) {
        const coords = coordsToTest.split(',');
        if (Number(coords[0]) == NaN || Number(coords[1]) == NaN) {
            throw new Error("coords are not valid decimals");
        }
        else {
            return decimalsCloseEnough(this.decimalLatitude, Number(coords[0])) && decimalsCloseEnough(this.decimalLongitude, coords[1]); //this here will be the converted coordinates object
        }
    }
    else {
        throw new Error("coords being tested must be separated by a comma");
    }
}
// An enum for coordinates formats
const to = Object.freeze({
    DMS: 'DMS',
    DM: 'DM',
    DD: 'DD'
});
converter.to = to;
exports.default = converter;

},{"./regex.js":3,"./toCoordinateFormat.js":5}],2:[function(require,module,exports){
"use strict";
//adds the formats to the convert object
//we need to use this as the source for the npm package so that the formats are not included in the bundle
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convert = void 0;
const converter_js_1 = __importDefault(require("./converter.js"));
const testformats_js_1 = __importDefault(require("./tests/testformats.js"));
converter_js_1.default.formats = testformats_js_1.default.map(format => format.verbatimCoordinates);
exports.convert = converter_js_1.default;

},{"./converter.js":1,"./tests/testformats.js":4}],3:[function(require,module,exports){
"use strict";
//Coordinates pattern matching regex
Object.defineProperty(exports, "__esModule", { value: true });
exports.coords_other = exports.dms_abbr = exports.dms_periods = exports.dd_re = exports.dm_numbers = exports.dm_invalid = void 0;
//DM with invalid minutes (goes to coords_other); this is just a shortened version of that to create a guard condition
const dm_invalid = /^(NORTH|SOUTH|[NS])?\s*([+-]?[0-8]?[0-9])\s*([•º°\.:]|D(?:EG)?(?:REES)?)?\s*,?([6-9][0-9])\s*(['′´’\.:]|M(?:IN)?(?:UTES)?)?\s*(NORTH|SOUTH|[NS])?(?:\s*[,/;]\s*|\s*)(EAST|WEST|[EW])?\s*([+-]?[0-1]?[0-9]?[0-9])\s*([•º°\.:]|D(?:EG)?(?:REES)?)?\s*,?([6-9][0-9])\s*(['′´’\.:]|M(?:IN)?(?:UTES)?)?\s*(EAST|WEST|[EW])?$/i;
exports.dm_invalid = dm_invalid;
//DM as numbers only - see issue #15
const dm_numbers = /^([+-]?[0-8]?[0-9])\s+([0-5]?[0-9]\.\d{3,})[\s,]{1,}([+-]?[0-1]?[0-9]?[0-9])\s+([0-5]?[0-9]\.\d{3,})$/;
exports.dm_numbers = dm_numbers;
//decimal degrees
const dd_re = /^(NORTH|SOUTH|[NS])?[\s]*([+-]?[0-8]?[0-9](?:[\.,]\d{3,}))[\s]*([•º°]?)[\s]*(NORTH|SOUTH|[NS])?[\s]*[,/;]?[\s]*(EAST|WEST|[EW])?[\s]*([+-]?[0-1]?[0-9]?[0-9](?:[\.,]\d{3,}))[\s]*([•º°]?)[\s]*(EAST|WEST|[EW])?$/i;
exports.dd_re = dd_re;
//degrees minutes seconds with '.' as separator - gives array with 15 values
const dms_periods = /^(NORTH|SOUTH|[NS])?\s*([+-]?[0-8]?[0-9])\s*(\.)\s*([0-5]?[0-9])\s*(\.)\s*((?:[0-5]?[0-9])(?:[\.,]\d{1,3})?)?\s*(NORTH|SOUTH|[NS])?(?:\s*[,/;]\s*|\s*)(EAST|WEST|[EW])?\s*([+-]?[0-1]?[0-9]?[0-9])\s*(\.)\s*([0-5]?[0-9])\s*(\.)\s*((?:[0-5]?[0-9])(?:[\.,]\d{1,3})?)?\s*(EAST|WEST|[EW])?$/i;
exports.dms_periods = dms_periods;
//degrees minutes seconds with words 'degrees, minutes, seconds' as separators (needed because the s of seconds messes with the S of SOUTH) - gives array of 17 values
const dms_abbr = /^(NORTH|SOUTH|[NS])?\s*([+-]?[0-8]?[0-9])\s*(D(?:EG)?(?:REES)?)\s*([0-5]?[0-9])\s*(M(?:IN)?(?:UTES)?)\s*((?:[0-5]?[0-9])(?:[\.,]\d{1,3})?)?\s*(S(?:EC)?(?:ONDS)?)?\s*(NORTH|SOUTH|[NS])?(?:\s*[,/;]\s*|\s*)(EAST|WEST|[EW])?\s*([+-]?[0-1]?[0-9]?[0-9])\s*(D(?:EG)?(?:REES)?)\s*([0-5]?[0-9])\s*(M(?:IN)?(?:UTES)?)\s*((?:[0-5]?[0-9])(?:[\.,]\d{1,3})?)?\s*(S(?:EC)?(?:ONDS)?)\s*(EAST|WEST|[EW])?$/i;
exports.dms_abbr = dms_abbr;
//everything else - gives array of 17 values 
const coords_other = /^(NORTH|SOUTH|[NS])?\s*([+-]?[0-8]?[0-9])\s*([•º°\.:]|D(?:EG)?(?:REES)?)?\s*,?([0-5]?[0-9](?:[\.,]\d{1,})?)?\s*(['′´’\.:]|M(?:IN)?(?:UTES)?)?\s*,?((?:[0-5]?[0-9])(?:[\.,]\d{1,3})?)?\s*(''|′′|’’|´´|["″”\.])?\s*(NORTH|SOUTH|[NS])?(?:\s*[,/;]\s*|\s*)(EAST|WEST|[EW])?\s*([+-]?[0-1]?[0-9]?[0-9])\s*([•º°\.:]|D(?:EG)?(?:REES)?)?\s*,?([0-5]?[0-9](?:[\.,]\d{1,})?)?\s*(['′´’\.:]|M(?:IN)?(?:UTES)?)?\s*,?((?:[0-5]?[0-9])(?:[\.,]\d{1,3})?)?\s*(''|′′|´´|’’|["″”\.])?\s*(EAST|WEST|[EW])?$/i;
exports.coords_other = coords_other;

},{}],4:[function(require,module,exports){
"use strict";
//return an array of coordinate strings for testing
Object.defineProperty(exports, "__esModule", { value: true });
//coordinations-parser formats
//https://www.npmjs.com/package/coordinate-parser
const coordsParserFormats = [
    {
        verbatimCoordinates: '40.123, -74.123',
        verbatimLatitude: '40.123',
        verbatimLongitude: '-74.123'
    },
    {
        verbatimCoordinates: '40.123° N 74.123° W',
        verbatimLatitude: '40.123° N',
        verbatimLongitude: '74.123° W'
    },
    {
        verbatimCoordinates: '40.123° N 74.123° W',
        verbatimLatitude: '40.123° N',
        verbatimLongitude: '74.123° W'
    },
    {
        verbatimCoordinates: '40° 7´ 22.8" N 74° 7´ 22.8" W',
        verbatimLatitude: '40° 7´ 22.8" N',
        verbatimLongitude: '74° 7´ 22.8" W'
    },
    {
        verbatimCoordinates: '40° 7.38’ , -74° 7.38’',
        verbatimLatitude: '40° 7.38’',
        verbatimLongitude: '-74° 7.38’'
    },
    {
        verbatimCoordinates: 'N40°7’22.8’’, W74°7’22.8’’',
        verbatimLatitude: 'N40°7’22.8’’',
        verbatimLongitude: 'W74°7’22.8’’'
    },
    {
        verbatimCoordinates: '40°7’22.8"N, 74°7’22.8"W',
        verbatimLatitude: '40°7’22.8"N',
        verbatimLongitude: '74°7’22.8"W'
    },
    {
        verbatimCoordinates: '40°7\'22.8"N, 74°7\'22.8"W',
        verbatimLatitude: '40°7\'22.8"N',
        verbatimLongitude: '74°7\'22.8"W'
    },
    {
        verbatimCoordinates: '40 7 22.8, -74 7 22.8',
        verbatimLatitude: '40 7 22.8',
        verbatimLongitude: '-74 7 22.8'
    },
    {
        verbatimCoordinates: '40.123 -74.123',
        verbatimLatitude: '40.123',
        verbatimLongitude: '-74.123'
    },
    {
        verbatimCoordinates: '40.123°,-74.123°',
        verbatimLatitude: '40.123°',
        verbatimLongitude: '-74.123°'
    },
    {
        verbatimCoordinates: '40.123N74.123W',
        verbatimLatitude: '40.123N',
        verbatimLongitude: '74.123W'
    },
    {
        verbatimCoordinates: '4007.38N7407.38W',
        verbatimLatitude: '4007.38N',
        verbatimLongitude: '7407.38W'
    },
    {
        verbatimCoordinates: '40°7’22.8"N, 74°7’22.8"W',
        verbatimLatitude: '40°7’22.8"N',
        verbatimLongitude: '74°7’22.8"W'
    },
    {
        verbatimCoordinates: '400722.8N740722.8W',
        verbatimLatitude: '400722.8N',
        verbatimLongitude: '740722.8W'
    },
    {
        verbatimCoordinates: 'N 40 7.38 W 74 7.38',
        verbatimLatitude: 'N 40 7.38',
        verbatimLongitude: 'W 74 7.38'
    },
    {
        verbatimCoordinates: '40:7:22.8N 74:7:22.8W',
        verbatimLatitude: '40:7:22.8N',
        verbatimLongitude: '74:7:22.8W'
    },
    {
        verbatimCoordinates: '40:7:23N,74:7:23W',
        verbatimLatitude: '40:7:23N',
        verbatimLongitude: '74:7:23W',
        decimalLatitude: 40.1230555555,
        decimalLongitude: -74.1230555555
    },
    {
        verbatimCoordinates: '40°7’23"N 74°7’23"W',
        verbatimLatitude: '40°7’23"N',
        verbatimLongitude: '74°7’23"W',
        decimalLatitude: 40.1230555555,
        decimalLongitude: -74.12305555555555
    },
    {
        verbatimCoordinates: '40°7’23"S 74°7’23"E',
        verbatimLatitude: '40°7’23"S',
        verbatimLongitude: '74°7’23"E',
        decimalLatitude: -40.1230555555,
        decimalLongitude: 74.12305555555555
    },
    {
        verbatimCoordinates: '40°7’23" -74°7’23"',
        verbatimLatitude: '40°7’23"',
        verbatimLongitude: '-74°7’23"',
        decimalLatitude: 40.1230555555,
        decimalLongitude: -74.123055555
    },
    {
        verbatimCoordinates: '40d 7’ 23" N 74d 7’ 23" W',
        verbatimLatitude: '40d 7’ 23" N',
        verbatimLongitude: '74d 7’ 23" W',
        decimalLatitude: 40.1230555555,
        decimalLongitude: -74.123055555
    },
    {
        verbatimCoordinates: '40.123N 74.123W',
        verbatimLatitude: '40.123N',
        verbatimLongitude: '74.123W'
    },
    {
        verbatimCoordinates: '40° 7.38, -74° 7.38',
        verbatimLatitude: '40° 7.38',
        verbatimLongitude: '-74° 7.38'
    },
    {
        verbatimCoordinates: '40° 7.38, -74° 7.38',
        verbatimLatitude: '40° 7.38',
        verbatimLongitude: '-74° 7.38'
    },
    {
        verbatimCoordinates: '40 7 22.8; -74 7 22.8',
        verbatimLatitude: '40 7 22.8',
        verbatimLongitude: '-74 7 22.8'
    }
];
const coordsParserDecimals = {
    decimalLatitude: 40.123,
    decimalLongitude: -74.123
};
//formats from https://gist.github.com/moole/3707127/337bd31d813a10abcf55084381803e5bbb0b20dc 
const coordsRegexFormats = [
    {
        verbatimCoordinates: '50°4\'17.698"south, 14°24\'2.826"east',
        verbatimLatitude: '50°4\'17.698"south',
        verbatimLongitude: '14°24\'2.826"east',
        decimalLatitude: -50.0715827777777778,
        decimalLongitude: 14.400785
    },
    {
        verbatimCoordinates: '50d4m17.698S 14d24m2.826E',
        verbatimLatitude: '50d4m17.698S',
        verbatimLongitude: '14d24m2.826E',
        decimalLatitude: -50.0715827777777778,
        decimalLongitude: 14.400785
    },
    {
        verbatimCoordinates: '40:26:46N,79:56:55W',
        verbatimLatitude: '40:26:46N',
        verbatimLongitude: '79:56:55W',
        decimalLatitude: 40.4461111111111111,
        decimalLongitude: -79.9486111111111111
    },
    {
        verbatimCoordinates: '40:26:46.302N 79:56:55.903W',
        verbatimLatitude: '40:26:46.302N',
        verbatimLongitude: '79:56:55.903W',
        decimalLatitude: 40.446195,
        decimalLongitude: -79.9488619444444444
    },
    {
        verbatimCoordinates: '40°26′47″N 79°58′36″W',
        verbatimLatitude: '40°26′47″N',
        verbatimLongitude: '79°58′36″W',
        decimalLatitude: 40.4463888888888889,
        decimalLongitude: -79.9766666666666667
    },
    {
        verbatimCoordinates: '40d 26′ 47″ N 79d 58′ 36″ W',
        verbatimLatitude: '40d 26′ 47″ N',
        verbatimLongitude: '79d 58′ 36″ W',
        decimalLatitude: 40.4463888888888889,
        decimalLongitude: -79.9766666666666667
    },
    {
        verbatimCoordinates: '40.446195N 79.948862W',
        verbatimLatitude: '40.446195N',
        verbatimLongitude: '79.948862W',
        decimalLatitude: 40.446195,
        decimalLongitude: -79.948862
    },
    {
        verbatimCoordinates: '40,446195° 79,948862°',
        verbatimLatitude: '40,446195°',
        verbatimLongitude: '79,948862°',
        decimalLatitude: 40.446195,
        decimalLongitude: 79.948862
    },
    {
        verbatimCoordinates: '40° 26.7717, -79° 56.93172',
        verbatimLatitude: '40° 26.7717',
        verbatimLongitude: '-79° 56.93172',
        decimalLatitude: 40.446195,
        decimalLongitude: -79.948862
    },
    {
        verbatimCoordinates: '40.446195, -79.948862',
        verbatimLatitude: '40.446195',
        verbatimLongitude: '-79.948862',
        decimalLatitude: 40.446195,
        decimalLongitude: -79.948862
    },
    {
        verbatimCoordinates: '40.123256; -74.123256',
        verbatimLatitude: '40.123256',
        verbatimLongitude: '-74.123256',
        decimalLatitude: 40.123256,
        decimalLongitude: -74.123256
    },
    {
        verbatimCoordinates: '18°24S 22°45E',
        verbatimLatitude: '18°24S',
        verbatimLongitude: '22°45E',
        decimalLatitude: -18.4,
        decimalLongitude: 22.75
    }
];
// additional formats we've encountered
const otherFormats = [
    {
        verbatimCoordinates: '10.432342S 10.6345345E',
        verbatimLatitude: '10.432342S',
        verbatimLongitude: '10.6345345E',
        decimalLatitude: -10.432342,
        decimalLongitude: 10.6345345
    },
    {
        verbatimCoordinates: '10.00S 10.00E',
        verbatimLatitude: '10.00S',
        verbatimLongitude: '10.00E',
        decimalLatitude: -10.00000,
        decimalLongitude: 10.00000
    },
    {
        verbatimCoordinates: '00.00S 01.00E',
        verbatimLatitude: '00.00S',
        verbatimLongitude: '01.00E',
        decimalLatitude: 0.00000,
        decimalLongitude: 1.00000
    },
    {
        verbatimCoordinates: '18.24S 22.45E',
        verbatimLatitude: '18.24S',
        verbatimLongitude: '22.45E',
        decimalLatitude: -18.4,
        decimalLongitude: 22.75
    },
    {
        verbatimCoordinates: '27deg 15min 45.2sec S 18deg 32min 53.7sec E',
        verbatimLatitude: '27deg 15min 45.2sec S',
        verbatimLongitude: '18deg 32min 53.7sec E',
        decimalLatitude: -27.2625555555555556,
        decimalLongitude: 18.54825
    },
    {
        verbatimCoordinates: '-23.3245° S / 28.2344° E',
        verbatimLatitude: '-23.3245° S',
        verbatimLongitude: '28.2344° E',
        decimalLatitude: -23.3245,
        decimalLongitude: 28.2344
    },
    {
        verbatimCoordinates: '40° 26.7717 -79° 56.93172',
        verbatimLatitude: '40° 26.7717',
        verbatimLongitude: '-79° 56.93172',
        decimalLatitude: 40.446195,
        decimalLongitude: -79.948862
    },
    {
        verbatimCoordinates: '27.15.45S 18.32.53E',
        verbatimLatitude: '27.15.45S',
        verbatimLongitude: '18.32.53E',
        decimalLatitude: -27.2625,
        decimalLongitude: 18.548055
    },
    {
        verbatimCoordinates: '-27.15.45 18.32.53',
        verbatimLatitude: '-27.15.45',
        verbatimLongitude: '18.32.53',
        decimalLatitude: -27.2625,
        decimalLongitude: 18.548055
    },
    {
        verbatimCoordinates: '27.15.45.2S 18.32.53.4E',
        verbatimLatitude: '27.15.45.2S',
        verbatimLongitude: '18.32.53.4E',
        decimalLatitude: -27.262556,
        decimalLongitude: 18.548167
    },
    {
        verbatimCoordinates: '27.15.45,2S 18.32.53,4E',
        verbatimLatitude: '27.15.45,2S',
        verbatimLongitude: '18.32.53,4E',
        decimalLatitude: -27.262556,
        decimalLongitude: 18.548167
    },
    {
        verbatimCoordinates: 'S23.43563 °  E22.45634 °',
        verbatimLatitude: 'S23.43563 °',
        verbatimLongitude: 'E22.45634 °',
        decimalLatitude: -23.43563,
        decimalLongitude: 22.45634
    },
    {
        verbatimCoordinates: '27,71372° S 23,07771° E',
        verbatimLatitude: '27,71372° S',
        verbatimLongitude: '23,07771° E',
        decimalLatitude: -27.71372,
        decimalLongitude: 23.07771
    },
    {
        verbatimCoordinates: '27.45.34 S 23.23.23 E',
        verbatimLatitude: '27.45.34 S',
        verbatimLongitude: '23.23.23 E',
        decimalLatitude: -27.759444,
        decimalLongitude: 23.38972222
    },
    {
        verbatimCoordinates: 'S 27.45.34 E 23.23.23',
        verbatimLatitude: 'S 27.45.34',
        verbatimLongitude: 'E 23.23.23',
        decimalLatitude: -27.759444,
        decimalLongitude: 23.38972222
    },
    {
        verbatimCoordinates: '53 16.3863,4 52.8171',
        verbatimLatitude: '53 16.3863',
        verbatimLongitude: '4 52.8171',
        decimalLatitude: 53.273105,
        decimalLongitude: 4.88029
    },
    {
        verbatimCoordinates: '50 8.2914,-5 2.4447',
        verbatimLatitude: '50 8.2914',
        verbatimLongitude: '-5 2.4447',
        decimalLatitude: 50.13819,
        decimalLongitude: -5.040745
    },
    {
        verbatimCoordinates: `N 48° 30,6410', E 18° 57,4583'`,
        verbatimLatitude: `N 48° 30,6410'`,
        verbatimLongitude: `E 18° 57,4583'`,
        decimalLatitude: 48.51068,
        decimalLongitude: 18.95764
    },
    {
        verbatimCoordinates: `1.23456, 18.33453`,
        verbatimLatitude: `1.23456`,
        verbatimLongitude: `18.33453`,
        decimalLatitude: 1.23456,
        decimalLongitude: 18.33453
    }
];
function getAllTestFormats() {
    const arr1 = [];
    coordsParserFormats.forEach(item => {
        if (item.decimalLatitude) {
            arr1.push(item);
        }
        else {
            arr1.push(Object.assign(Object.assign({}, item), coordsParserDecimals));
        }
    });
    return [...arr1, ...coordsRegexFormats, ...otherFormats];
}
exports.default = getAllTestFormats();

},{}],5:[function(require,module,exports){
"use strict";
//borrowed from https://www.codegrepper.com/code-examples/javascript/javascript+converting+latitude+longitude+to+gps+coordinates
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Converts decimalCoordinates to commonly used string formats
 * Note that this will add degree and direction symbols to decimal coordinates
 * @param {string} format Either DMS or DM
 * @returns {string}
 */
function toCoordinateFormat(format) {
    if (!['DMS', 'DM', 'DD'].includes(format))
        throw new Error('invalid format specified');
    if (this.decimalCoordinates && this.decimalCoordinates.trim()) {
        const parts = this.decimalCoordinates.split(',').map(x => Number(x.trim()));
        const decimalLatitude = Number(parts[0]);
        const decimalLongitude = Number(parts[1]);
        const absoluteLatitude = Math.abs(decimalLatitude);
        const absoluteLongitude = Math.abs(decimalLongitude);
        const latDir = decimalLatitude > 0 ? "N" : "S";
        const longDir = decimalLongitude > 0 ? "E" : "W";
        let result;
        if (format == 'DD') {
            result = `${absoluteLatitude}° ${latDir}, ${absoluteLongitude}° ${longDir}`;
        }
        //else we need some more things
        const degreesLatitude = Math.floor(absoluteLatitude);
        const degreesLongitude = Math.floor(absoluteLongitude);
        const minutesLatitudeNotTruncated = (absoluteLatitude - degreesLatitude) * 60;
        const minutesLongitudeNotTruncated = (absoluteLongitude - degreesLongitude) * 60;
        if (format == 'DM') {
            let dmMinsLatitude = round(minutesLatitudeNotTruncated, 3).toFixed(3).padStart(6, '0');
            let dmMinsLongitude = round(minutesLongitudeNotTruncated, 3).toFixed(3).padStart(6, '0');
            if (dmMinsLatitude.endsWith('.000') && dmMinsLongitude.endsWith('.000')) {
                dmMinsLatitude = dmMinsLatitude.replace(/\.000$/, '');
                dmMinsLongitude = dmMinsLongitude.replace(/\.000$/, '');
            }
            result = `${degreesLatitude}° ${dmMinsLatitude}' ${latDir}, ${degreesLongitude}° ${dmMinsLongitude}' ${longDir}`;
        }
        if (format == "DMS") {
            const latMinutes = Math.floor(minutesLatitudeNotTruncated);
            const longMinutes = Math.floor(minutesLongitudeNotTruncated);
            let latSeconds = ((minutesLatitudeNotTruncated - latMinutes) * 60).toFixed(1).padStart(4, '0');
            let longSeconds = ((minutesLongitudeNotTruncated - longMinutes) * 60).toFixed(1).padStart(4, '0');
            const latMinutesString = latMinutes.toString().padStart(2, '0');
            const longMinutesString = longMinutes.toString().padStart(2, '0');
            // if they both end in .0 we drop the .0
            if (latSeconds.endsWith('.0') && longSeconds.endsWith('.0')) {
                latSeconds = latSeconds.replace(/\.0$/, '');
                longSeconds = longSeconds.replace(/\.0$/, '');
            }
            result = `${degreesLatitude}° ${latMinutesString}' ${latSeconds}" ${latDir}, ${degreesLongitude}° ${longMinutesString}' ${longSeconds}" ${longDir}`;
        }
        return result;
    }
    else {
        throw new Error('no decimal coordinates to convert');
    }
}
function round(num, places) {
    const d = Math.pow(10, places);
    return Math.round((num + Number.EPSILON) * d) / d;
}
exports.default = toCoordinateFormat;

},{}],6:[function(require,module,exports){
const { convert } = require('geo-coordinates-parser')

// CODE FOR MAP
// init leaflet.js map
const map = L.map('map').setView([33.750746, -84.391830], 12);

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
            return null;
        } else {
            locations.unshift(location);
        }
    } else { // else if name or address, geocode
        const location = await geocode(input);
        if (locationNames.includes(location.name)) { // check if location already in list
            return null;
        } else {
            locations.unshift(location);
        }
    }

    // after locations updated, update html
    updateLocationList();

    drawLocations();
    locationInput.value = '';
})

function updateLocationList() {
    const locationList = document.getElementById("location-list");
    const locationListItems = locations.map((location, index) => `
        <li class="location-item">
            <h3 class="location-item-title">${location.name}</h3>
            <p class="location-item-address">${location.address}.</p>
            <button class="location-item-delete" data-index="${index}">🗑</button>
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
    const street = input.street || null;
    const housenumber = input.housenumber || null;

    // TODO: format address depending on location, according to national norms
    const addressArray = [housenumber, street, locality, county, district, city, state].filter(item => item);
    const address = addressArray.join(', ');

    return address
}
},{"geo-coordinates-parser":2}]},{},[6]);
