const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");

const message = document.getElementById("message");

const weatherSection = document.getElementById("weatherSection");
const travelSection = document.getElementById("travelSection");

const cityName = document.getElementById("cityName");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");

const travelSuggestion =
    document.getElementById("travelSuggestion");

const forecastContainer =
    document.getElementById("forecastContainer");


weatherSection.style.display = "none";
travelSection.style.display = "none";


searchButton.addEventListener("click", getWeather);


cityInput.addEventListener("keypress", function (event) {

    if (event.key === "Enter") {
        getWeather();
    }

});


async function getWeather() {

    const city = cityInput.value.trim();

    if (city === "") {

        message.textContent = "Please enter a city name.";

        return;
    }


    message.textContent = "Loading weather...";

    weatherSection.style.display = "none";
    travelSection.style.display = "none";


    try {

        // Find city coordinates
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );


        if (!geoResponse.ok) {
            throw new Error("Unable to find city.");
        }


        const geoData = await geoResponse.json();


        if (!geoData.results ||
            geoData.results.length === 0) {

            throw new Error("City not found.");
        }


        const location = geoData.results[0];


        // Get weather
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );


        if (!weatherResponse.ok) {
            throw new Error("Unable to get weather.");
        }


        const data = await weatherResponse.json();


        // Current weather
        cityName.textContent =
            `${location.name}, ${location.country}`;

        temperature.textContent =
            `${data.current.temperature_2m} °C`;

        humidity.textContent =
            `${data.current.relative_humidity_2m}%`;

        wind.textContent =
            `${data.current.wind_speed_10m} km/h`;


        const currentCode =
            data.current.weather_code;


        condition.textContent =
            getCondition(currentCode);

        weatherIcon.textContent =
            getIcon(currentCode);


        // Travel suggestion
        travelSuggestion.textContent =
            getTravelSuggestion(currentCode);


        // Forecast
        displayForecast(data.daily);


        message.textContent = "";

        weatherSection.style.display = "block";
        travelSection.style.display = "block";


    } catch (error) {

        message.textContent =
            "Error: " + error.message;

        weatherSection.style.display = "none";
        travelSection.style.display = "none";
    }

}


function getCondition(code) {

    if (code === 0) return "Clear Sky";

    if (code >= 1 && code <= 3)
        return "Partly Cloudy";

    if (code >= 45 && code <= 48)
        return "Fog";

    if (code >= 51 && code <= 67)
        return "Rain";

    if (code >= 71 && code <= 77)
        return "Snow";

    if (code >= 80 && code <= 82)
        return "Rain Showers";

    if (code >= 95)
        return "Thunderstorm";

    return "Unknown";
}


function getIcon(code) {

    if (code === 0) return "☀️";

    if (code >= 1 && code <= 3)
        return "⛅";

    if (code >= 45 && code <= 48)
        return "🌫️";

    if (code >= 51 && code <= 67)
        return "🌧️";

    if (code >= 71 && code <= 77)
        return "❄️";

    if (code >= 80 && code <= 82)
        return "🌦️";

    if (code >= 95)
        return "⛈️";

    return "🌤️";
}


function getTravelSuggestion(code) {

    if (code === 0) {
        return "☀️ Great weather for sightseeing and outdoor activities.";
    }

    if (code >= 1 && code <= 3) {
        return "⛅ Good conditions for sightseeing. Carry light protection.";
    }

    if (code >= 51 && code <= 67) {
        return "🌧️ Rain is expected. Carry an umbrella and consider indoor attractions.";
    }

    if (code >= 80 && code <= 82) {
        return "🌦️ Rain showers are possible. Plan flexible travel activities.";
    }

    if (code >= 95) {
        return "⛈️ Thunderstorms are possible. Avoid outdoor travel when conditions are unsafe.";
    }

    return "🌤️ Check local conditions before planning outdoor activities.";
}


function displayForecast(daily) {

    forecastContainer.innerHTML = "";

    for (let i = 0; i < 5; i++) {

        const card =
            document.createElement("div");

        card.className = "forecast-card";

        const date =
            new Date(daily.time[i]);

        const day =
            date.toLocaleDateString("en-US", {
                weekday: "short"
            });


        card.innerHTML = `
            <h3>${day}</h3>

            <div class="forecast-icon">
                ${getIcon(daily.weather_code[i])}
            </div>

            <p>
                ${getCondition(daily.weather_code[i])}
            </p>

            <p>
                Max: ${daily.temperature_2m_max[i]} °C
            </p>

            <p>
                Min: ${daily.temperature_2m_min[i]} °C
            </p>
        `;


        forecastContainer.appendChild(card);
    }
}