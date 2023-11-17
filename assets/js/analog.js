let globalTime = new Date(); // Global variable to hold the current time of the searched city
let clockInterval; // Global variable for the clock interval

async function fetchCityTime() {
    let input = document.getElementById('cityInput').value;

    // Use OpenWeather Geocoding API to get detailed location information
    const locationData = await fetchLocationData(input);
    if (!locationData) {
        console.error('Location not found for provided input');
        return;
    }

    // Extract city, state, and country from location data
    const { city, state, country } = locationData;

    // Proceed to fetch time for the city
    const apiKey = 'LJFoOzyDdkNHaa49NCVDxQ==XdhyzQc0aGZxeKx4';
    const url = `https://api.api-ninjas.com/v1/worldtime?city=${city}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Api-Key': apiKey
            }
        });
        const data = await response.json();

        if (data && data.datetime) {
            globalTime = new Date(data.datetime);
            startClocks(); // Restart the clocks with the new time
            updateDigitalTimeAndCity(globalTime, { city, state, country });
    
            // Make clock and information visible
            document.getElementById('clock').style.visibility = 'visible';
            document.getElementById('digitalTime').style.visibility = 'visible';
            document.getElementById('cityCountry').style.visibility = 'visible';
        } else {
            console.error('Invalid response from API or missing data');
        }
    } catch (error) {
        console.error('Error fetching time data:', error);
    }
}

async function fetchLocationData(input) {
    const geocodingApiKey = '7fb10ded0e3bbf31a5a35aa57ec19351';
    let geocodingUrl;

    if (/^\d+$/.test(input)) {
        // Input is a postal code
        geocodingUrl = `http://api.openweathermap.org/geo/1.0/zip?zip=${input}&appid=${geocodingApiKey}`;
    } else {
        // Input is a city name
        geocodingUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=1&appid=${geocodingApiKey}`;
    }

    try {
        const response = await fetch(geocodingUrl);
        const data = await response.json();
        if (data && data.length > 0) {
            // Extract and return city, state, and country
            return {
                city: data[0].name,
                state: data[0].state,
                country: data[0].country
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching location data:', error);
        return null;
    }
}

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

function updateDigitalTimeAndCity(time, locationData) {
    const digitalTimeString = time.toLocaleTimeString();
    document.getElementById('digitalTime').innerText = digitalTimeString;

    // Extract city, state, and country information from the API response
    // Adjust these lines based on the actual response structure
    // Format location display
    let locationDisplay = locationData.city;
    if (locationData.state && locationData.state !== locationData.city) {
        locationDisplay += `, ${locationData.state}`;
    }
    locationDisplay += `, ${locationData.country}`;
    document.getElementById('cityCountry').innerText = locationDisplay;
}

startClocks();




