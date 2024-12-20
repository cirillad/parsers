document.addEventListener("DOMContentLoaded", function () {
    // Отримуємо елементи кнопок і вмісту
    const tabToday = document.getElementById("tab-today");
    const tabForecast = document.getElementById("tab-forecast");
    const todayContent = document.getElementById("today-content");
    const forecastContent = document.getElementById("forecast-content");

    // Функція для активації вкладки
    function activateTab(tab) {
        document.querySelectorAll(".tab").forEach(button => button.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));

        tab.classList.add("active");
        if (tab.id === "tab-today") {
            todayContent.classList.add("active");
        } else if (tab.id === "tab-forecast") {
            forecastContent.classList.add("active");
        }
    }

    // Додаємо обробники подій для кнопок
    tabToday.addEventListener("click", () => activateTab(tabToday));
    tabForecast.addEventListener("click", () => activateTab(tabForecast));
});

const apiKey = "1ec7f6a361e0094c74c41692e25938d5";
let currentCity = '';
let selectedDate = null; 

document.getElementById("search-button").addEventListener("click", async function () {
    const cityInput = document.getElementById("city-input").value.trim();

    if (!cityInput) {
        alert("Please enter a city name.");
        return;
    }

    console.log(`City entered: ${cityInput}`);

    try {
        const cityData = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityInput}&appid=${apiKey}&lang=en`);
        const cityJson = await cityData.json();

        if (!cityJson.name) {
            alert("City not found. Please enter a valid city name.");
            return;
        }

        document.getElementById("current-city").innerText = cityJson.name;

        currentCity = cityJson.name; 
        console.log(`Updated currentCity: ${currentCity}`); 

        await loadWeather(cityJson.name);
    } catch (error) {
        console.error("Error loading weather data:", error);
        alert("Failed to load city data.");
    }
});

async function fetchCityByGeolocation() {
    if (!navigator.geolocation) {
        console.error("Геолокація не підтримується вашим браузером.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            const geoURL = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

            try {
                const response = await fetch(geoURL);
                if (!response.ok) throw new Error("Не вдалося отримати дані міста.");
                const data = await response.json();
                currentCity = data.name;
                loadWeather(currentCity);
            } catch (error) {
                console.error("Помилка під час отримання міста:", error);
            }
        },
        (error) => {
            console.error("Не вдалося отримати геолокацію:", error);
        }
    );
}

function updateCurrentWeather(data) {
    document.getElementById("weather-header").innerText = "CURRENT WEATHER";
    document.getElementById("weather-date").innerText = new Date().toLocaleDateString();

    const iconCode = data.weather[0].icon;
    document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById("weather-icon").alt = data.weather[0].description;

    document.getElementById("weather-temp").innerText = `${data.main.temp}°C`;
    document.getElementById("weather-feels-like").innerText = `Real feel ${data.main.feels_like}°C`;

    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
    document.getElementById("weather-sunrise").innerText = sunrise;
    document.getElementById("weather-sunset").innerText = sunset;

    const duration = new Date(data.sys.sunset * 1000 - data.sys.sunrise * 1000);
    const hours = duration.getUTCHours();
    const minutes = duration.getUTCMinutes();
    document.getElementById("weather-duration").innerText = `${hours}:${minutes.toString().padStart(2, "0")} hr`;
}

function getWindDirection(degrees) {
    if (degrees >= 0 && degrees < 45) return "N";
    if (degrees >= 45 && degrees < 90) return "NE";
    if (degrees >= 90 && degrees < 135) return "E";
    if (degrees >= 135 && degrees < 180) return "SE";
    if (degrees >= 180 && degrees < 225) return "S";
    if (degrees >= 225 && degrees < 270) return "SW";
    if (degrees >= 270 && degrees < 315) return "W";
    if (degrees >= 315 && degrees < 360) return "NW";
    return "";
}

function updateHourlyWeather(forecastData) {
    const hourlyDetailsContainer = document.querySelector('.hourly-details');
    hourlyDetailsContainer.innerHTML = ''; 

    forecastData.list.slice(0, 4).forEach(hour => { 
        const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); 
        const iconCode = hour.weather[0].icon;  
        const description = hour.weather[0].description;  
        const temp = Math.round(hour.main.temp); 
        const feelsLike = Math.round(hour.main.feels_like);  
        const windSpeed = hour.wind.speed;
        const windDirection = hour.wind.deg;  

        hourlyDetailsContainer.innerHTML += `
            <div class="hour-row">
                <div class="hour-cell">${time}</div>
                <img class="weather-hourly-img" src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${description}">
                <div class="hour-cell">${description}</div>
                <div class="hour-cell">${temp}°C</div>
                <div class="hour-cell">${feelsLike}°C</div>
                <div class="hour-cell">${windSpeed} m/s ${getWindDirection(windDirection)}</div>
            </div>
        `;
    });
}

function fetchNearbyPlaces(currentCity) {
    const apiKey = "1ec7f6a361e0094c74c41692e25938d5"; 
    const nearbyPlacesContainer = document.querySelector(".places-grid");

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${apiKey}&units=metric&lang=en`)
        .then((response) => response.json())
        .then((data) => {
            const { lat, lon } = data.coord;
            return fetch(`https://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}&cnt=4&units=metric&appid=${apiKey}`);
        })
        .then((response) => response.json())
        .then((data) => {
            nearbyPlacesContainer.innerHTML = data.list.map(place => {
                const temp = Math.round(place.main.temp);
                const iconUrl = `https://openweathermap.org/img/wn/${place.weather[0].icon}@2x.png`;
                return `
                    <div class="place">
                        <span class="place-name">${place.name}</span>
                        <img src="${iconUrl}" alt="${place.weather[0].description}" class="weather-hourly-img">
                        <span class="temperature">${temp}°C</span>
                    </div>
                `;
            }).join('');
        })
        .catch((error) => console.error("Error fetching data:", error));
}

function fetchFiveDayForecast(currentCity) {
    const apiKey = "1ec7f6a361e0094c74c41692e25938d5"; 
    const forecastContainer = document.querySelector(".five-day-forecast");

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${currentCity}&appid=${apiKey}&units=metric&lang=en`)
        .then((response) => response.json())
        .then((data) => {
            const forecasts = data.list.filter((item, index) => index % 8 === 0); 
            
            forecastContainer.innerHTML = forecasts.slice(0, 5).map(forecast => {
                const date = new Date(forecast.dt * 1000);
                const day = date.toLocaleString('en', { weekday: 'short' });
                const monthDay = date.toLocaleString('en', { day: 'numeric', month: 'short' });
                const temp = Math.round(forecast.main.temp);
                const description = forecast.weather[0].description;
                const iconUrl = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;

                return `
                    <div class="forecast-item" onclick="selectForecast(this, '${currentCity}', ${forecast.dt})">
                        <p class="forecast-date">${day}<br>${monthDay}</p>
                        <img src="${iconUrl}" alt="${description}" class="forecast-icon">
                        <p class="forecast-temp">${temp}°C</p>
                        <p class="forecast-desc">${description}</p>
                    </div>
                `;
            }).join('');
        })
        .catch((error) => console.error("Error fetching forecast data:", error));
}

function selectForecast(element, city, date) {
    const allItems = document.querySelectorAll(".forecast-item");
    allItems.forEach(item => item.classList.remove("selected"));

    element.classList.add("selected");

    selectedDate = date;
    console.log(`Selected date: ${selectedDate}`);  

    fetchHourlyDetails(city, selectedDate);
}

function fetchHourlyDetails(city, selectedDate) {
    const apiKey = "1ec7f6a361e0094c74c41692e25938d5"; 
    const hourlyDetailsContainer = document.querySelector(".weather-hourly-details");
    hourlyDetailsContainer.innerHTML = '';

    console.log(`Fetching hourly details for ${city} on ${selectedDate}`); 

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=en`)
        .then((response) => response.json())
        .then((data) => {
            const selectedDateString = new Date(selectedDate * 1000).toISOString().split('T')[0]; 
            console.log(`Selected date in ISO format: ${selectedDateString}`);

            const selectedDayForecast = data.list.filter(item => {
                const forecastDateString = new Date(item.dt * 1000).toISOString().split('T')[0]; 
                return forecastDateString === selectedDateString; 
            });

            console.log(`Found ${selectedDayForecast.length} hourly data for selected day`); 

            if (selectedDayForecast.length === 0) {
                hourlyDetailsContainer.innerHTML = "<p>No hourly data available for this date.</p>";
                return;
            }

            hourlyDetailsContainer.innerHTML = selectedDayForecast.map(hourly => {
                const hour = new Date(hourly.dt * 1000).toLocaleString('en', { hour: '2-digit', minute: '2-digit', hour12: false }); 
                const temp = Math.round(hourly.main.temp);
                const description = hourly.weather[0].description;
                const iconUrl = `https://openweathermap.org/img/wn/${hourly.weather[0].icon}@2x.png`;
                const wind = Math.round(hourly.wind.speed);
                const humidity = hourly.main.humidity;
                const feelsLike = Math.round(hourly.main.feels_like); 

                return `
                    <div class="weather-hourly-row">
                        <div class="weather-hourly-cell">${hour}</div>
                        <img class="weather-hourly-image" src="${iconUrl}" alt="${description}">
                        <div class="weather-hourly-cell">${description}</div>
                        <div class="weather-hourly-cell">${temp}°C</div>
                        <div class="weather-hourly-cell">${feelsLike}°C</div> <!-- Додаємо реальну температуру -->
                        <div class="weather-hourly-cell">${wind} m/s</div>
                    </div>
                `;
            }).join('');


            hourlyDetailsContainer.classList.add("active");

            console.log(hourlyDetailsContainer.innerHTML);  

        })
        .catch((error) => console.error("Error fetching hourly data:", error));
}

async function loadWeather(city) {
    console.log(`Loading weather data for city: ${city}`); 
    const todayURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

    try {
        const todayResponse = await fetch(todayURL);
        if (!todayResponse.ok) throw new Error("Error fetching current weather data");
        const todayData = await todayResponse.json();
        updateCurrentWeather(todayData);

        const forecastResponse = await fetch(forecastURL);
        if (!forecastResponse.ok) throw new Error("Error fetching hourly forecast data");
        const forecastData = await forecastResponse.json();

        updateHourlyWeather(forecastData);
        fetchNearbyPlaces(city)
        fetchFiveDayForecast(city);
    } catch (error) {
        console.error("Error loading weather data:", error);
    }
}


document.addEventListener("DOMContentLoaded", function () {
    fetchCityByGeolocation();
});
