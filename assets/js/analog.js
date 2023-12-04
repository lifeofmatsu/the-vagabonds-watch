let globalTime = new Date(); //global variable to hold the current time of the searched city
let clockInterval; //global variable for the clock interval
let currentCity = '';

//display location, time, and timezone data (see event listeners)
const displayUserResults = async (userInput) => {
    const locationData = await fetchLocationData(userInput);

    if (locationData && locationData.city) {
        await fetchLocationTime(locationData.city);
        displayDigitalData(globalTime, locationData);
        currentCity = userInput;
    } else {
        console.error('Location data not found for the input:', userInput); //for error or no data
    }
}

/*
============
API HANDLING
============
*/

//fetch time data for user search location
const fetchLocationTime = async (city) => {
    const apiKey = 'LJFoOzyDdkNHaa49NCVDxQ==XdhyzQc0aGZxeKx4';
    const worldTimeUrl = `https://api.api-ninjas.com/v1/worldtime?city=${encodeURIComponent(city)}`;

    try {
        const response = await fetch(worldTimeUrl, {
            method: 'GET',
            headers: { 'X-Api-Key': apiKey }
        });
        const data = await response.json();

        if (data && data.datetime) {
            globalTime = new Date(data.datetime);
            startClocks(); //new instance of clocks
            document.getElementById('analogTime').style.visibility = 'visible';
            document.getElementById('digitalTime').style.visibility = 'visible';
            document.getElementById('timeZone').style.visibility = 'visible';
            document.getElementById('placeInfo').style.visibility = 'visible';
        } else {
            console.error('Invalid response from API or missing data'); //for invalid response or missing data
        }
    } catch (err) {
        console.error('Error fetching time data:', err); //for fetch error
    }
}

//fetch city, state, country from Teleport API w/ API Ninjas postal code verification
const fetchLocationData = async (userInput) => {
    const isPostalCode = /^\d+$/.test(userInput); //determine if input is postal code

    if (isPostalCode) {
        return fetchPostalToCity(userInput); //convert postal code to city
    } else {
        //get location details through city name using Teleport API
        const teleportUrl = `https://api.teleport.org/api/cities/?search=${encodeURIComponent(userInput)}`;
        try {
            const response = await fetch(teleportUrl);
            const data = await response.json();
            
            if (data && data._embedded) {
                const locationUrl = data._embedded['city:search-results'][0]._links['city:item'].href;
                const locationResponse = await fetch(locationUrl);
                const locationData = await locationResponse.json();

                return {
                    city: locationData.name,
                    state: locationData._links['city:admin1_division'].name,
                    country: locationData._links['city:country'].name,
                    timezone: locationData._links['city:timezone'].name.replace(/_/g, ' ')
                };
            }
            return null;
        } catch (err) {
            console.error('Error fetching location data:', err);
            return null;
        }
    }
}

//fetch city name by converting from postal code using API Ninjas ZipCode API
const fetchPostalToCity = async (postalCode) => {
    const apiKey = 'LJFoOzyDdkNHaa49NCVDxQ==XdhyzQc0aGZxeKx4';
    const postalCodeUrl = `https://api.api-ninjas.com/v1/zipcode?zip=${postalCode}`;

    try {
        const response = await fetch(postalCodeUrl, {
            method: 'GET',
            headers: { 'X-Api-Key': apiKey }
        });
        const data = await response.json();

        if (data && data.length > 0) {
            return { city: data[0].city };
        }
        return null;
    } catch (err) {
        console.error('Error fetching city from postal code:', err);
        return null;
    }
}

//fetch autocomplete suggestions for user search using Teleport API
const fetchSuggestions = async (userInput) => {
    const teleportUrl = `https://api.teleport.org/api/cities/?search=${encodeURIComponent(userInput)}`;

    try {
        const response = await fetch(teleportUrl);
        const data = await response.json();
        return data && data._embedded
            ? data._embedded['city:search-results'].map(item => item.matching_full_name)
            : [];
    } catch (err) {
        console.error('Error fetching suggestions:', err);
        return [];
    }
}

/*
=============
DATA HANDLING
=============
*/

//continuous, smooth translation of analog clock hands
function updateAnalogTime() {
    const second = globalTime.getSeconds();
    const minute = globalTime.getMinutes();
    const hour = globalTime.getHours();
    const ms = globalTime.getMilliseconds();

    const hourDeg = (hour % 12) / 12 * 360 + minute / 2;
    const minuteDeg = minute / 60 * 360;
    const secondDeg = (second + ms / 1000) / 60 * 360; // Include milliseconds for smooth rotation

    document.getElementById('hourHand').style.transform = `rotate(${hourDeg}deg)`;
    document.getElementById('minuteHand').style.transform = `rotate(${minuteDeg}deg)`;
    document.getElementById('secondHand').style.transform = `rotate(${secondDeg}deg)`;
}

//continuous update to displayed digital time
function updateDigitalTime(time) {
    const digitalTimeString = time.toLocaleTimeString();
    document.getElementById('digitalTime').innerText = digitalTimeString;
}

//display running digital clock, timezone, and location info
const displayDigitalData = (time, locationData) => {
    updateDigitalTime(time); //display digital time

    //extract and display timezone
    let timeZone = `${locationData.timezone}`;
    document.querySelector('#timeZone p').textContent = '[' + timeZone + ']';

    //extract and display city, state, country
    let locationDisplay = `${locationData.city}`;
    if (locationData.state && locationData.state !== locationData.city) {
        locationDisplay += `, ${locationData.state}`;
    }

    locationDisplay += `, ${locationData.country}`;
    document.getElementById('placeInfo').innerText = locationDisplay;
}

//generate analog and digital clocks in sync
const startClocks = () => {
    if (clockInterval) {
        clearInterval(clockInterval); //clear existing interval if it exists
    }

    clockInterval = setInterval(() => {
        globalTime.setMilliseconds(globalTime.getMilliseconds() + 50);

        updateAnalogTime();
        updateDigitalTime(globalTime);

    }, 50); //update every 50 milliseconds
}

/*
================
HELPER FUNCTIONS
================
*/

//event listener for top search menu options (links)
const setupMenuOptions = () => {
    const menuLinks = document.querySelectorAll('.menuSearch a');

    menuLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            displayUserResults(event.target.getAttribute('data-city'));
        });
    });
}

//populate list of autocomplete suggestions
const populateAutocomplete = (suggestions) => {
    const datalist = document.getElementById('suggestions');

    datalist.innerHTML = ''; //clear existing suggestions

    suggestions.forEach(suggestion => {
        const option = document.createElement('option');
        option.value = suggestion;
        datalist.appendChild(option);
    });
}

/*
===============
EVENT LISTENERS
===============
*/

//event listener for loaded webpage to set up place links
document.addEventListener('DOMContentLoaded', setupMenuOptions);

//event listener for 'Enter' key on user search
document.getElementById('userSearch').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const userInput = document.getElementById('userSearch').value.trim();

        if (userInput) {
            displayUserResults(userInput);
        }
    }
});

//event listener for the search button on user search
document.getElementById('searchButton').addEventListener('click', () => {
    const userInput = document.getElementById('userSearch').value.trim();

    if (userInput) {
        displayUserResults(userInput);
    }
});

//event listener on the user search field for suggestion dropdown
document.getElementById('userSearch').addEventListener('input', async () => {
    const userInput = document.getElementById('userSearch').value.trim();

    if (userInput) {
        const suggestions = await fetchSuggestions(userInput);
        populateAutocomplete(suggestions);
    }
});


//init
startClocks();


/*
================
COLLECTIONS PAGE
================
*/

//add user search to local storage - to be added to Collections
const storeCollectionItem = async () => {
    let storedCities = localStorage.getItem('savedCities');
    let savedCities = JSON.parse(storedCities);

    if (!savedCities) {
        savedCities = [];
    };

    savedCities.push(currentCity);
    localStorage.setItem('savedCities', JSON.stringify(savedCities));
}

//event listener to add user search to Collections page
document.getElementById('saveButton').addEventListener('click', () => {
    storeCollectionItem();
});

//event listener for button to add search to Collections
document.getElementById('saveButton').addEventListener('click', function() {
    const collection = JSON.parse(localStorage.getItem('clockCollection')) || [];
    const newClock = {
        time: globalTime.toString(),
        location: document.getElementById('placeInfo').innerText,
        timezoneOffset: globalTime.getTimezoneOffset() //save timezone offset or other relevant data
    };

    collection.push(newClock);
    localStorage.setItem('clockCollection', JSON.stringify(collection));
    
    window.location.href = 'collections.html'; //redirect to Collections page
});
