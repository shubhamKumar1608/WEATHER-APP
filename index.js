document.addEventListener("DOMContentLoaded", () => {
    const userTab = document.querySelector("[data-userWeather]");
    const searchTab = document.querySelector("[data-searchWeather]");
    const grantAccessContainer = document.querySelector(".grant-location-container");
    const searchForm = document.querySelector("[data-searchForm]");
    const loadingScreen = document.querySelector(".loading-container");
    const userInfoContainer = document.querySelector(".user-info-container");
    const searchInput = document.querySelector("[data-searchInput]");

    let currentTab = userTab;
    currentTab.classList.add("current-tab");

    function switchTab(clickedTab) {
        if (clickedTab !== currentTab) {
            currentTab.classList.remove("current-tab");
            currentTab = clickedTab;
            currentTab.classList.add("current-tab");

            if (!searchForm.classList.contains("active")) {
                userInfoContainer.classList.remove("active");
                searchForm.classList.add("active");
                getFromSessionStorage();
            } else {
                searchForm.classList.remove("active");
                userInfoContainer.classList.add("active");
                grantAccessContainer.classList.add("active");
            }
        }
    }

    userTab.addEventListener("click", () => {
        switchTab(userTab);
    });

    searchTab.addEventListener("click", () => {
        switchTab(searchTab);
    });

    function getFromSessionStorage() {
        const localCoordinates = sessionStorage.getItem("user-coordinates");
        if (!localCoordinates) {
            grantAccessContainer.classList.add("active");
        } else {
            const coordinates = JSON.parse(localCoordinates);
            fetchUserWeather(coordinates);
        }
    }

    async function fetchUserWeather(coordinates) {
        const { lat, lon } = coordinates;
        grantAccessContainer.classList.remove("active");
        loadingScreen.classList.add("active");
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${"773e6ded1e7577ce4e932b83452dabe8"}&units=metric`);
            const data = await response.json();
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        } catch (err) {
            loadingScreen.classList.remove("active");
            console.error("Error fetching user weather:", err);
        }
    }

    function renderWeatherInfo(weatherInfo) {
        const city = document.querySelector("[data-cityName]");
        const desc = document.querySelector("[data-weatherDesc]");
        const weatherIcon = document.querySelector("[data-weatherIcon]");
        const temp = document.querySelector("[data-temp]");
        const windspeed = document.querySelector("[data-windspeed]");
        const humidity = document.querySelector("[data-humidity]");
        const cloud = document.querySelector("[data-cloud]");
        const countryIcon = document.querySelector("[data-countryIcon]");

        city.innerText = weatherInfo?.name;
        countryIcon.src = `https://flagcdn.com/256x192/${weatherInfo?.sys?.country.toLowerCase()}.png`;
        desc.innerText = weatherInfo?.weather?.[0]?.description;
        weatherIcon.src = `https://openweathermap.org/img/wn/${weatherInfo?.weather?.[0]?.icon}@2x.png`;
        temp.innerText = `${weatherInfo?.main?.temp} °C`;
        windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
        humidity.innerText = `${weatherInfo?.main?.humidity} %`;
        cloud.innerText = `${weatherInfo?.clouds?.all} %`;
    }

    const grantAccessButton = document.querySelector("[data-grantAccess]");
    grantAccessButton.addEventListener("click", getLocation);

    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        let cityName = searchInput.value.trim();
        if (cityName === "") {
            alert("Please enter a city name.");
            return;
        } else {
            fetchWeatherByCityName(cityName);
        }
    });

    async function fetchWeatherByCityName(city) {
        loadingScreen.classList.add("active");
        userInfoContainer.classList.remove("active");
        grantAccessContainer.classList.remove("active");

        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${"773e6ded1e7577ce4e932b83452dabe8"}&units=metric`);
            if (!response.ok) {
                throw new Error(`Failed to fetch weather data for ${city}`);
            }
            const data = await response.json();
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        } catch (err) {
            loadingScreen.classList.remove("active");
            console.error("Error fetching city weather:", err);
            alert("Failed to fetch weather data. Please try again.");
        }
    }

    function getLocation() {
       
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const coordinates = { lat, lon };
                sessionStorage.setItem("user-coordinates", JSON.stringify(coordinates));
                showWeather(lat, lon);
            }, error => {
                console.error("Geolocation error:", error);
                let errorPara = document.createElement('p');
                errorPara.textContent = `Failed to get location. Error: ${error.message}`;
                document.body.appendChild(errorPara);
            });
        } else {
            console.error("Geolocation is not supported by this browser.");
            let errorPara = document.createElement('p');
            errorPara.textContent = "Geolocation is not supported by this browser.";
            document.body.appendChild(errorPara);
        }
    }

    async function showWeather(lat, lon) {
        grantAccessContainer.classList.remove("active");
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${"773e6ded1e7577ce4e932b83452dabe8"}&units=metric`);
            if (!response.ok) {
                throw new Error("Failed to fetch weather data.");
            }
            const data = await response.json();
            console.log("Weather data:", data);
            renderWeatherInfo(data);
        } catch (error) {
            console.error("Error fetching weather data:", error);
        }
    }

    getFromSessionStorage(); // Initialize weather data if available
});
