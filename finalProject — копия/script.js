document.addEventListener("DOMContentLoaded", () => {
    const currentCityElement = document.getElementById("current-city");

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                try {
                    const apiKey = "1ec7f6a361e0094c74c41692e25938d5"; // Вставте ваш API ключ OpenWeather
                    const response = await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
                    );

                    if (response.ok) {
                        const data = await response.json();
                        currentCityElement.textContent = data.name;
                    } else {
                        currentCityElement.textContent = "Unable to fetch city";
                    }
                } catch (error) {
                    currentCityElement.textContent = "Error fetching data";
                    console.error(error);
                }
            },
            (error) => {
                console.error(error);
                currentCityElement.textContent = "Geolocation not available";
            }
        );
    } else {
        currentCityElement.textContent = "Geolocation is not supported by your browser";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const currentCityElement = document.getElementById("current-city");
    const cityInput = document.getElementById("city-input");
    const searchButton = document.getElementById("search-button");

    const apiKey = "1ec7f6a361e0094c74c41692e25938d5"; // Вставте ваш API ключ OpenWeather

    // Функція для отримання погодних даних за назвою міста
    async function fetchCityWeather(cityName) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric`
            );

            if (response.ok) {
                const data = await response.json();
                return data.name; // Повертає назву міста
            } else {
                throw new Error("City not found");
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    // Обробник кліку по кнопці пошуку
    searchButton.addEventListener("click", async () => {
        const cityName = cityInput.value.trim();

        if (cityName) {
            const foundCity = await fetchCityWeather(cityName);
            if (foundCity) {
                currentCityElement.textContent = foundCity;
            } else {
                currentCityElement.textContent = "City not found";
            }
        } else {
            currentCityElement.textContent = "Please enter a city name";
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const apiKey = "1ec7f6a361e0094c74c41692e25938d5";
    const currentCityElement = document.getElementById("current-city");

    const weatherHeader = document.getElementById("weather-header");
    const weatherDate = document.getElementById("weather-date");
    const weatherIcon = document.getElementById("weather-icon");
    const weatherTemp = document.getElementById("weather-temp");
    const weatherFeelsLike = document.getElementById("weather-feels-like");
    const weatherSunrise = document.getElementById("weather-sunrise");
    const weatherSunset = document.getElementById("weather-sunset");
    const weatherDuration = document.getElementById("weather-duration");

    const errorMessage = document.createElement("div");
    errorMessage.id = "error-message";
    document.body.appendChild(errorMessage);

    async function fetchWeather(cityName) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric`
            );

            if (response.ok) {
                const data = await response.json();
                errorMessage.textContent = ""; // Очистити повідомлення про помилку

                weatherHeader.textContent = `Weather in ${data.name}`;
                weatherDate.textContent = new Date().toLocaleDateString();

                const iconCode = data.weather[0].icon;
                weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
                weatherIcon.alt = data.weather[0].description;

                weatherTemp.textContent = `${Math.round(data.main.temp)}°C`;
                weatherFeelsLike.textContent = `Real feel ${Math.round(data.main.feels_like)}°C`;

                const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
                const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString();
                const duration = calculateDuration(data.sys.sunrise, data.sys.sunset);

                weatherSunrise.textContent = sunriseTime;
                weatherSunset.textContent = sunsetTime;
                weatherDuration.textContent = duration;
            } else {
                showError("City not found or API error");
            }
        } catch (error) {
            console.error("Error fetching weather data:", error);
            showError("Error fetching weather data");
        }
    }

    function calculateDuration(sunrise, sunset) {
        const durationInSeconds = sunset - sunrise;
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        return `${hours}:${minutes.toString().padStart(2, "0")} hr`;
    }

    const updateWeather = () => {
        const cityName = currentCityElement.textContent.trim();
        if (cityName) {
            fetchWeather(cityName);
        }
    };

    updateWeather();

    const observer = new MutationObserver(() => {
        updateWeather();
    });
    observer.observe(currentCityElement, { childList: true });
});

document.addEventListener("DOMContentLoaded", function () {
    const apiKey = "1ec7f6a361e0094c74c41692e25938d5"; // API ключ
    const hourlyDetailsContainer = document.querySelector(".hourly-details");
    const currentCityElement = document.getElementById("current-city");

    // Функція для отримання погодних даних за годинами
    function fetchHourlyWeather(city) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&lang=en&appid=${apiKey}`;

        fetch(apiUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch weather data.");
                }
                return response.json();
            })
            .then((data) => {
                if (data.cod !== "200") {
                    throw new Error("City not found or invalid response.");
                }
                updateHourlyWeatherUI(data);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }

    // Функція для оновлення UI
    function updateHourlyWeatherUI(data) {
        hourlyDetailsContainer.innerHTML = ""; // Очистити попередні дані

        // Відображаємо погодні дані кожні 3 години
        data.list.slice(0, 6).forEach((item) => {
            const time = new Date(item.dt * 1000);
            const temp = Math.round(item.main.temp);
            const realFeel = Math.round(item.main.feels_like);
            const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
            const description = item.weather[0].description;
            const wind = item.wind.speed;

            const hourlyBlock = document.createElement("div");
            hourlyBlock.className = "hour-row";

            hourlyBlock.innerHTML = `
                <div class="hour-cell">${time.getHours()}:00</div>
                <div style="width: 50px;"><img class="weather-hourly-img" src="${iconUrl}" alt="${description}"></div>
                <div class="hour-cell">${description}</div>
                <div class="hour-cell">${temp}°</div>
                <div class="hour-cell">${realFeel}°</div>
                <div class="hour-cell">${wind} m/s</div>
            `;

            hourlyDetailsContainer.appendChild(hourlyBlock);
        });
    }

    // Оновлюємо дані при зміні current-city
    function updateHourlyWeather() {
        const city = currentCityElement.textContent.trim();
        if (city) {
            fetchHourlyWeather(city);
        } else {
            console.error("City name is empty.");
        }
    }

    // Викликаємо оновлення при завантаженні сторінки
    updateHourlyWeather();

    // Спостереження за зміною тексту у current-city
    const observer = new MutationObserver(() => {
        updateHourlyWeather();
    });
    observer.observe(currentCityElement, { childList: true });
});

document.addEventListener("DOMContentLoaded", function () {
    const apiKey = "1ec7f6a361e0094c74c41692e25938d5"; // Ваш API ключ
    const nearbyPlacesContainer = document.querySelector(".places-grid");
    const currentCityElement = document.getElementById("current-city");

    // Функція для отримання найближчих міст на основі координат
    function fetchNearbyPlaces(lat, lon) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}&cnt=4&units=metric&lang=en&appid=${apiKey}`;

        fetch(apiUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch nearby places data.");
                }
                return response.json();
            })
            .then((data) => {
                updateNearbyPlacesUI(data);
            })
            .catch((error) => {
                console.error("Error fetching nearby places data:", error);
                alert("Failed to fetch nearby places data.");
            });
    }

    // Функція для оновлення інтерфейсу з інформацією про найближчі місця
    function updateNearbyPlacesUI(data) {
        nearbyPlacesContainer.innerHTML = ""; // Очистити попередні дані

        data.list.forEach((place) => {
            const placeName = place.name;
            const temp = Math.round(place.main.temp);
            const iconUrl = `https://openweathermap.org/img/wn/${place.weather[0].icon}@2x.png`;
            const description = place.weather[0].description;

            const placeBlock = document.createElement("div");
            placeBlock.className = "place";

            placeBlock.innerHTML = `
                <span class="place-name">${placeName}</span>
                <img src="${iconUrl}" alt="${description}" class="weather-hourly-img">
                <span class="temperature">${temp}°C</span>
            `;

            nearbyPlacesContainer.appendChild(placeBlock);
        });
    }

    // Оновлюємо найближчі міста при зміні current-city
    function updateNearbyPlaces() {
        const city = currentCityElement.textContent.trim();
        if (city) {
            fetchWeather(city);
        } else {
            console.error("City name is empty.");
        }
    }

    // Отримуємо координати міста та знаходимо найближчі місця
    function fetchWeather(city) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=en`;

        fetch(apiUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch weather data.");
                }
                return response.json();
            })
            .then((data) => {
                const lat = data.coord.lat;
                const lon = data.coord.lon;
                fetchNearbyPlaces(lat, lon); // Отримуємо найближчі міста
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }

    // Викликаємо оновлення при завантаженні сторінки
    updateNearbyPlaces();

    // Спостереження за зміною тексту у current-city
    const observer = new MutationObserver(() => {
        updateNearbyPlaces();
    });
    observer.observe(currentCityElement, { childList: true });
});

document.addEventListener("DOMContentLoaded", function () {
    // Змінні для вкладок і їх контенту
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Функція для перемикання вкладок
    function switchTab(event) {
        // Видаляємо клас "active" у всіх вкладок та контенту
        tabs.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Додаємо клас "active" до натиснутої вкладки та відповідного контенту
        const targetTab = event.target;
        targetTab.classList.add('active');
        
        // Відображаємо відповідний контент
        const targetContentId = targetTab.getAttribute('data-tab');
        const targetContent = document.getElementById(`${targetContentId}-content`);
        targetContent.classList.add('active');
    }

    // Додаємо слухачів подій до вкладок
    tabs.forEach(tab => {
        tab.addEventListener('click', switchTab);
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const apiKey = "1ec7f6a361e0094c74c41692e25938d5"; // Ваш API ключ
    const fiveDayForecastContainer = document.querySelector(".five-day-forecast");

    // Функція для отримання 5-денної прогнози
    function fetchFiveDayForecast(lat, lon) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=en&appid=${apiKey}`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch weather data.");
                }
                return response.json();
            })
            .then(data => {
                updateFiveDayForecastUI(data);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                alert("Failed to fetch weather data.");
            });
    }

    // Функція для оновлення UI з 5-денною прогнозою
    function updateFiveDayForecastUI(data) {
        fiveDayForecastContainer.innerHTML = ""; // Очищаємо попередні дані

        // Групуємо прогнози за датою
        const daysForecast = data.list.filter(item => item.dt_txt.includes("12:00:00")); // Вибираємо прогноз на середину дня

        daysForecast.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleString("en", { weekday: "short" });
            const monthDay = date.toLocaleString("en", { day: "numeric", month: "short" });
            const temp = Math.round(item.main.temp);
            const description = item.weather[0].description;
            const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

            // Створюємо блок для кожного дня
            const forecastItem = document.createElement("div");
            forecastItem.classList.add("forecast-item");

            forecastItem.innerHTML = `
                <p class="forecast-date">${day}<br>${monthDay}</p>
                <img src="${iconUrl}" alt="${description}" class="forecast-icon">
                <p class="forecast-temp">${temp}°C</p>
                <p class="forecast-desc">${description}</p>
            `;

            fiveDayForecastContainer.appendChild(forecastItem);
        });
    }

    // Якщо можна отримати геолокацію
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchFiveDayForecast(lat, lon);
            },
            error => {
                console.error("Failed to get geolocation:", error);
                alert("Failed to determine your location. Try again.");
            }
        );
    } else {
        alert("Your browser does not support geolocation.");
    }

    // Якщо вводимо місто вручну
    const cityInput = document.getElementById("city-input");
    const citySubmit = document.getElementById("search-button");

    citySubmit.addEventListener("click", () => {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherByCity(city);
        } else {
            alert("Please enter a city name.");
        }
    });

    // Функція для отримання погоди за містом
    function fetchWeatherByCity(city) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=en&appid=${apiKey}`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch weather data.");
                }
                return response.json();
            })
            .then(data => {
                updateFiveDayForecastUI(data);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                alert("Failed to fetch weather data.");
            });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const forecastContainer = document.querySelector('.five-day-forecast');
    const currentCityElement = document.getElementById("current-city");

    // Перевіряємо, чи є батьківський елемент
    if (forecastContainer) {
        forecastContainer.addEventListener("click", function (event) {
            if (event.target.closest('.forecast-item')) {
                const item = event.target.closest('.forecast-item');

                // Видаляємо клас 'selected' з усіх елементів
                const forecastItems = document.querySelectorAll('.forecast-item');
                forecastItems.forEach(item => item.classList.remove("selected"));

                // Додаємо клас 'selected' до поточного елемента
                item.classList.add("selected");

                // Витягування city з елемента current-city
                const city = currentCityElement ? currentCityElement.textContent.trim() : 'Unknown City';
                console.log("Current City:", city); // Виводимо в консоль

                // Витягування forecast-date з вибраного елемента
                const date = item.querySelector('.forecast-date').textContent.trim().replace(/\n/g, ' '); // Перетворюємо на одну строку (без перенесень)
                console.log("Selected Date:", date); // Виводимо в консоль
            }
        });
    }
});









