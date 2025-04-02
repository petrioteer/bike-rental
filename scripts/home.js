const currentDate = new Date();
const month = currentDate.toLocaleString('default', { month: 'long' });
const day = currentDate.getDate();
const formattedDate = `${month} ${day}`;
const cardCity = document.querySelector('.card .city');
const cardWeather = document.querySelector('.card .weather');
const cardTemp = document.querySelector('.card .temp');
const cardMinTemp = document.querySelector('.card .minTemp');
const cardMaxTemp = document.querySelector('.card .maxTemp');

const currentHour = currentDate.getHours();

// Check if the current hour is after 6 (18:00)
if (currentHour >= 18) {
    const sunIcons = document.querySelectorAll('.sun');
    sunIcons.forEach(icon => {
        icon.style.background = 'linear-gradient(to right, #ffffff, #ffffff)';
    });
}


// Get location of user using open street view maps api
window.onload = function() {
    getLocation();
};

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        cardCity.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        .then(response => response.json())
        .then(data => {
            let city = data.address.city;

            if (city === undefined){
                city = "";
            }
            const area = data.address.suburb;
            const country = data.address.country;
            cardCity.innerHTML = `${area}, ${city}<br><p style="font-size: 12px;">${country}<p>`;
        })
        .catch(error => console.log('Error fetching location data:', error));

    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=8b7d1ed40b332b731beb9ee190eab6d9`)
        .then(response => response.json())
        .then(data => {
            const temperature = Math.round(data.main.temp);
            const weatherDescription = data.weather[0].description;
            cardWeather.innerHTML = weatherDescription.toUpperCase();
            cardTemp.innerHTML = temperature + "°";
        })
        .catch(error => console.log('Error fetching weather data:', error));
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            cardCity.innerHTML = "User denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            cardCity.innerHTML = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            cardCity.innerHTML = "The request to get user location timed out.";
            break;
        case error.UNKNOWN_ERROR:
            cardCity.innerHTML = "An unknown error occurred.";
            break;
    }
}
