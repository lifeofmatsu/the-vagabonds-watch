let globalTime = new Date(); //global variable to hold the current time of the searched city
let clockInterval; //global variable for the clock interval
let currentCity = '';

//add user search to local storage - to be added to Collections
async function saveCity() {
    let storedCities = localStorage.getItem('savedCities');
    let savedCities = JSON.parse(storedCities);

    if (!savedCities) {
        savedCities = [];
    };

    savedCities.push(currentCity);
    localStorage.setItem('savedCities', JSON.stringify(savedCities));
}

//select and display city & time
async function handleCitySelection(input) {
    const locationData = await fetchLocationData(input);

    if (locationData && locationData.city) {
        await fetchCityTime(locationData.city); //call fetchCityTime only if city name is available
        updateDigitalTimeAndCity(globalTime, locationData);
        currentCity = input;
    } else {
        console.error('Location data not found for the input:', input); //for error or no data
    }
}

//fetch time data for user search
async function fetchCityTime(city) {
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
            document.getElementById('analogTime').style.visibility = 'visible';
            document.getElementById('digitalTime').style.visibility = 'visible';
            document.getElementById('placeInfo').style.visibility = 'visible';
        } else {
            console.error('Invalid response from API or missing data'); //for invalid response or missing data
        }
    } catch (error) {
        console.error('Error fetching time data:', error); //for fetch error
    }
}

//fetch location data from Teleport API
async function fetchLocationData(input) {
    //determine if input is a postal code or city name
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

//populate datalist for autocomplete suggestions
function populateDatalist(suggestions) {
    const datalist = document.getElementById('suggestions');

    datalist.innerHTML = ''; //clear existing suggestions

    suggestions.forEach(suggestion => {
        const option = document.createElement('option');
        option.value = suggestion;
        datalist.appendChild(option);
    });
}

//event listeners for city menu links
function setupCityLinks() {
    const cityLinks = document.querySelectorAll('.menuSearch a');

    cityLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            handleCitySelection(event.target.getAttribute('data-city'));
        });
    });
}

//event listener on the user search field for suggestion dropdown
document.getElementById('citySearch').addEventListener('input', async () => {
    const input = document.getElementById('citySearch').value;

    if (input) {
        const suggestions = await fetchSuggestions(input);
        populateDatalist(suggestions);
    }
});

//event listener for 'Enter' key on user search
document.getElementById('citySearch').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const input = document.getElementById('citySearch').value.trim();

        if (input) {
            handleCitySelection(input);
        }
    }
});

//event listener for the search button on user search
document.getElementById('searchButton').addEventListener('click', () => {
    const input = document.getElementById('citySearch').value.trim();

    if (input) {
        handleCitySelection(input);
    }
});

//event listener to add user search to Collections page
document.getElementById('saveButton').addEventListener('click', () => {
    saveCity();
});

//fetch autocomplete suggestions displayed as user types in search bar
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

//event listener for loaded webpage to set up place links
document.addEventListener('DOMContentLoaded', setupCityLinks);

//ensures analog and digital time are generated in sync
function startClocks() {
    if (clockInterval) {
        clearInterval(clockInterval); //clear existing interval if it exists
    }

    clockInterval = setInterval(() => {
        globalTime.setMilliseconds(globalTime.getMilliseconds() + 50);

        updateAnalogClockHands(); //update analog clock hands for smoother rotation
        updateDigitalTime(globalTime); //update digital clock

    }, 50); //update every 50 milliseconds
}

//continuous translation of analog clock hands
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

//continuous updating of displayed digital time
function updateDigitalTime(time) {
    const digitalTimeString = time.toLocaleTimeString();
    document.getElementById('digitalTime').innerText = digitalTimeString;
}

//displays updating digital time and place data
function updateDigitalTimeAndCity(time, locationData) {
    const digitalTimeString = time.toLocaleTimeString();
    document.getElementById('digitalTime').innerText = digitalTimeString;

    let locationDisplay = `${locationData.city}`;
    if (locationData.state && locationData.state !== locationData.city) {
        locationDisplay += `, ${locationData.state}`;
    }

    locationDisplay += `, ${locationData.country}`;
    document.getElementById('placeInfo').innerText = locationDisplay;
}

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

//init
startClocks();
