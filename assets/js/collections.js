document.addEventListener('DOMContentLoaded', () => {
    loadSavedCities();
});
    
function loadSavedCities() {
    const savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];
    const uniqueCities = [...new Set(savedCities)]; //ensures uniqueness of place added to Collections
    const citiesList = document.getElementById('saved-cities');
    
    uniqueCities.forEach(city => {
        const listItem = document.createElement('li');
        const cityLink = document.createElement('a');

        cityLink.href = "#";
        cityLink.textContent = city;
        cityLink.addEventListener('click', (event) => {
            event.preventDefault();
            fetchCityTime(city, listItem);
        });

        listItem.appendChild(cityLink);
        citiesList.appendChild(listItem);
    });
}

async function fetchCityTime(city, listItem) {
    const apiKey = 'LJFoOzyDdkNHaa49NCVDxQ==XdhyzQc0aGZxeKx4'; 
    const url = `https://api.api-ninjas.com/v1/worldtime?city=${encodeURIComponent(city)}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'X-Api-Key': apiKey }
        });
        const data = await response.json();

        if (data && data.datetime) {
            const timeString = new Date(data.datetime).toLocaleTimeString();
            listItem.innerHTML += ` - Current Time: ${timeString}`;
        } else {
            listItem.innerHTML += ' - Time not available';
        }
    } catch (error) {
        listItem.innerHTML += ' - Error fetching time';
    }
}
