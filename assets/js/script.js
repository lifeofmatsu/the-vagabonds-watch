var autocompleteInput = document.getElementById("searchInp");
var suggestBoxElement = document.getElementById("suggestBoxElement");

autocompleteInput.addEventListener("input", function () {
    var cityName = autocompleteInput.value;
    var username = "ljnorton12"; // Replace with your Geonames.org username

    // Make a request to the Geonames.org API for city search
    fetch(`https://secure.geonames.org/searchJSON?q=${cityName}&maxRows=5&username=${username}`)
        .then(response => response.json())
        .then(data => {
            updateAutocompleteSuggestions(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
});

function updateAutocompleteSuggestions(data) {
    if (data.geonames && data.geonames.length > 0) {
        var suggestBoxHTML = '';
        data.geonames.forEach(city => {
            suggestBoxHTML += `<div class='suggestions' onclick='selectAutocomplete("${city.name}, ${city.countryCode}")'>${city.name}, ${city.countryCode}</div>`;
        });

        suggestBoxElement.innerHTML = suggestBoxHTML;
        suggestBoxElement.style.visibility = 'visible';
    } else {
        suggestBoxElement.innerHTML = '';
        suggestBoxElement.style.visibility = 'hidden';
    }
}

function closeSuggestBox() {
    suggestBoxElement.innerHTML = '';
    suggestBoxElement.style.visibility = 'hidden';
}

function selectAutocomplete(selectedCity) {
    autocompleteInput.value = selectedCity;
    closeSuggestBox();
}

function showData() {
    var cityName = document.getElementById("searchInp").value;
    var country = document.getElementById("countrySelect").value;
    var postalcode = document.getElementById("postalcodeInput").value;
    var username = "ljnorton12"; // Replace with your Geonames.org username

    // Make a request to the Geonames.org API for city information
    fetch(`https://secure.geonames.org/searchJSON?q=${cityName}&country=${country}&postalcode=${postalcode}&maxRows=1&username=${username}`)
        .then(response => response.json())
        .then(data => {
            displayCityInfo(data);
        })
        .catch(error => {
            console.error('Error fetching city data:', error);
        });
}

function displayCityInfo(data) {
    var cityInfoElement = document.getElementById("cityInfo");

    if (data.geonames && data.geonames.length > 0) {
        var cityData = data.geonames[0];
        var cityName = cityData.name;
        var country = cityData.countryCode;
        var state = cityData.adminName1 || ""; // Add this line to get the state information

        // Display city information in the HTML element
        cityInfoElement.innerHTML = `<p>City: ${cityName}</p><p>State: ${state}</p><p>Country: ${country}</p>`;
    } else {
        cityInfoElement.innerHTML = "<p>No information found for the entered city.</p>";
    }
}

// Additional functions for postal code lookup (if needed)
function postalCodeLookup() {
    // Add your postal code lookup functionality here if needed
}

function setDefaultCountry() {
    // Add your default country setting functionality here
}