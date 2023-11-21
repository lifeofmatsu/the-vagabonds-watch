function showData() {
    var cityName = document.getElementById("searchInp").value;
    var country = document.getElementById("countrySelect").value;
    var postalcode = document.getElementById("postalcodeInput").value;
    var username = "ljnorton12"; 
    var timezoneToken = "aecwqsxlHzKZYWPFHmVJ"; 

    // request to Geonames.org API for city info
    fetch(`https://secure.geonames.org/searchJSON?q=${cityName}&country=${country}&postalcode=${postalcode}&maxRows=1&username=${username}`)
        .then(response => response.json())
        .then(data => {
            // Get the city information and, fetch timezone data
            if (data.geonames && data.geonames.length > 0) {
                var cityData = data.geonames[0];
                var city = cityData.name;
                var countryCode = cityData.countryCode;
                var state = cityData.adminName1 || "";

                // request to get timezone data
                fetch(`https://timezoneapi.io/api/ip/?token=${timezoneToken}&search=${city},${countryCode}`)
                    .then(response => response.json())
                    .then(timezoneData => {
                        displayCityInfo(cityData, timezoneData);
                    })
                    .catch(error => {
                        console.error('Error fetching timezone data:', error);
                        displayCityInfo(cityData, null); 
                    });
            } else {
                displayCityInfo(null, null); 
            }
        })
        .catch(error => {
            console.error('Error fetching city data:', error);
        });
}

function displayCityInfo(cityData, timezoneData) {
    var cityInfoElement = document.getElementById("cityInfo");

    if (cityData) {
        var cityName = cityData.name;
        var country = cityData.countryCode;
        var state = cityData.adminName1 || "";
        var timezone = timezoneData ? timezoneData.data.timezone.id : 'N/A'; 

        // Display city information including timezone in the HTML element
        cityInfoElement.innerHTML = `<p>City: ${cityName}</p><p>State: ${state}</p><p>Country: ${country}</p><p>Timezone: ${timezone}</p>`;
    } else {
        cityInfoElement.innerHTML = "<p>No information found for the entered city.</p>";
    }
}

