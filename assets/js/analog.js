let globalTime = new Date(); // Global variable to hold the current time of the searched city
let clockInterval; // Global variable for the clock interval
let currentCity = '';


async function saveCity() {
    // city = currentCity; // This line seems to be unnecessary since currentCity is already a global variable

    console.log(currentCity, "FDHJGFVDSFHJHFDVJDFBJRHBVSDJFBHRBJ!!!!!!!");

    let storedCities = localStorage.getItem('savedCities'); // Changed to 'let' for local scope

    console.log(storedCities, "STORED DFOHSDFJGKKZBVJDSHTKJGLRASDL");

    let savedCities = JSON.parse(storedCities);

    if (!savedCities) {
        savedCities = [];
    };

    savedCities.push(currentCity); // Changed from appendChild to push

    console.log(savedCities, "SAVEDONES");

    localStorage.setItem('savedCities', JSON.stringify(savedCities));
}


// Function to handle city/time selection and display
async function handleCitySelection(input) {

    console.log("handleCitySelection input:", input); // Debugging log
    const locationData = await fetchLocationData(input);
    console.log("Location data:", locationData); // Debugging log

    if (locationData && locationData.city) {
        await fetchCityTime(locationData.city); // Call fetchCityTime only if city name is available
        updateDigitalTimeAndCity(globalTime, locationData);
        currentCity = input;
    } else {
        console.error('Location data not found for the input:', input);
        // Handle UI update for error or no data
    }
}

// Function to fetch city time data
async function fetchCityTime(city) {
    console.log("fetchCityTime city:", city); // Debugging log
    const apiKey = 'LJFoOzyDdkNHaa49NCVDxQ==XdhyzQc0aGZxeKx4';
    const url = `https://api.api-ninjas.com/v1/worldtime?city=${encodeURIComponent(city)}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'X-Api-Key': apiKey }
        });
        const data = await response.json();

        if (data && data.datetime) {
            globalTime = new Date(data.datetime);
            startClocks();
            document.getElementById('clock').style.visibility = 'visible';
            document.getElementById('digitalTime').style.visibility = 'visible';
            document.getElementById('cityCountry').style.visibility = 'visible';
        } else {
            console.error('Invalid response from API or missing data');
            // Handle UI for invalid response or missing data
        }
    } catch (error) {
        console.error('Error fetching time data:', error);
        // Handle UI for fetch error
    }
}

// Fetch location data from Teleport API
async function fetchLocationData(input) {
    // Determine if input is a postal code or city name
    const isPostalCode = /^\d+$/.test(input);
    const teleportUrl = isPostalCode
        ? `https://api.teleport.org/api/postalcodes/?search=${encodeURIComponent(input)}`
        : `https://api.teleport.org/api/cities/?search=${encodeURIComponent(input)}`;

    try {
        const response = await fetch(teleportUrl);
        const data = await response.json();
        
        if (data && data._embedded) {
            const firstResultLink = isPostalCode
                ? data._embedded['postalcode:search-results'][0]._links['postalcode:item'].href
                : data._embedded['city:search-results'][0]._links['city:item'].href;

            const detailedResponse = await fetch(firstResultLink);
            const detailedData = await detailedResponse.json();

            return {
                city: detailedData.name,
                state: detailedData._links['city:admin1_division'].name,
                country: detailedData._links['city:country'].name
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching location data:', error);
        return null;
    }
}

// Function to populate datalist for autocomplete suggestions
function populateDatalist(suggestions) {
    const datalist = document.getElementById('suggestions');
    datalist.innerHTML = ''; // Clear existing suggestions
    suggestions.forEach(suggestion => {
        const option = document.createElement('option');
        option.value = suggestion;
        datalist.appendChild(option);
    });
}

// Function to setup event listeners for city menu links
function setupCityLinks() {
    const cityLinks = document.querySelectorAll('.city-menu a');
    cityLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            handleCitySelection(event.target.getAttribute('data-city'));
        });
    });
}

// Event listener for the search input field
document.getElementById('cityInput').addEventListener('input', async () => {
    const input = document.getElementById('cityInput').value;
    if (input) {
        const suggestions = await fetchSuggestions(input);
        populateDatalist(suggestions);
    }
});

// Event listener for the search button
document.getElementById('searchButton').addEventListener('click', () => {
    const input = document.getElementById('cityInput').value.trim();
    if (input) {
        handleCitySelection(input);
    }
});

document.getElementById('saveButton').addEventListener('click', () => {
    saveCity();
});

// Event listener for 'Enter' key in the search input
document.getElementById('cityInput').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const input = document.getElementById('cityInput').value;
        handleCitySelection(input);
    }
});

// Function to fetch autocomplete suggestions
async function fetchSuggestions(input) {
    const teleportUrl = `https://api.teleport.org/api/cities/?search=${encodeURIComponent(input)}`;

    try {
        const response = await fetch(teleportUrl);
        const data = await response.json();
        return data && data._embedded
            ? data._embedded['city:search-results'].map(item => item.matching_full_name)
            : [];
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return [];
    }
}

// Call this function when the page loads to set up the links
document.addEventListener('DOMContentLoaded', setupCityLinks);

function startClocks() {
    if (clockInterval) {
        clearInterval(clockInterval); // Clear existing interval if it exists
    }

    clockInterval = setInterval(() => {
        globalTime.setMilliseconds(globalTime.getMilliseconds() + 50); // Increment time by 50 milliseconds
        updateAnalogClockHands(); // Update analog clock hands for smoother rotation
        updateDigitalTime(globalTime); // Update digital clock
    }, 50); // Update every 50 milliseconds
}

function updateAnalogClockHands() {
    const second = globalTime.getSeconds();
    const minute = globalTime.getMinutes();
    const hour = globalTime.getHours();
    const ms = globalTime.getMilliseconds();

    const hourDeg = (hour % 12) / 12 * 360 + minute / 2;
    const minuteDeg = minute / 60 * 360;
    const secondDeg = (second + ms / 1000) / 60 * 360; // Include milliseconds for smooth rotation

    document.getElementById('hour-hand').style.transform = `rotate(${hourDeg}deg)`;
    document.getElementById('minute-hand').style.transform = `rotate(${minuteDeg}deg)`;
    document.getElementById('second-hand').style.transform = `rotate(${secondDeg}deg)`;
}

function updateDigitalTime(time) {
    const digitalTimeString = time.toLocaleTimeString();
    document.getElementById('digitalTime').innerText = digitalTimeString;
}

// Function to update digital time and city/country display
function updateDigitalTimeAndCity(time, locationData) {
    const digitalTimeString = time.toLocaleTimeString();
    document.getElementById('digitalTime').innerText = digitalTimeString;

    let locationDisplay = `${locationData.city}`;
    if (locationData.state && locationData.state !== locationData.city) {
        locationDisplay += `, ${locationData.state}`;
    }
    locationDisplay += `, ${locationData.country}`;
    document.getElementById('cityCountry').innerText = locationDisplay;
}

document.getElementById('addToCollectionBtn').addEventListener('click', function() {
    const collection = JSON.parse(localStorage.getItem('clockCollection')) || [];
    const newClock = {
        time: globalTime.toString(),
        location: document.getElementById('cityCountry').innerText,
        timezoneOffset: globalTime.getTimezoneOffset() // Save timezone offset or other relevant data
    };
    collection.push(newClock);
    localStorage.setItem('clockCollection', JSON.stringify(collection));
    
    window.location.href = 'collections.html'; // Redirect to Collections page
});


startClocks();





