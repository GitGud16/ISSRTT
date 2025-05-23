<script>
    import { onMount } from 'svelte';
    
    let map;
    let leaflet;
    let satellite;
    let issMarker;
    let predictionMarker;
    let predictionPath;
    let latitude;
    let longitude;
    let longitude2 = 0;
    let latitude2 = 0;
    let speedISS = 0;
    let time = 0;
    let distanceInMeters;
    let predictedLat;
    let predictedLong;
    let latency = 0;
    let totalLatency;
    let predictionHistory = [];
    let zoomLevel = 3;
    let countdownTimer = null;
    let timeRemaining = 0;
    let issTLE = null;
    let issInfo = null;
    let windowHeight;
    let windowWidth;

    let lastLatitude = null;
    let lastLongitude = null;
    let latitudeDirection = 0;
    let longitudeDirection = 0;
    
    const calculateDistanceInMeters = (lat1, lon1, lat2, lon2) => {
        const earthRadiusKm = 6371.0;
        
        const lat1Rad = degreesToRadians(lat1);
        const lon1Rad = degreesToRadians(lon1);
        const lat2Rad = degreesToRadians(lat2);
        const lon2Rad = degreesToRadians(lon2);
        
        const deltaLat = lat2Rad - lat1Rad;
        const deltaLon = lon2Rad - lon1Rad;
        const a = Math.sin(deltaLat / 2) ** 2 +
                Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                Math.sin(deltaLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return (earthRadiusKm * c) * 1000;
    };

    const degreesToRadians = (degrees) => {
        return degrees * Math.PI / 180;
    };

    async function fetchAndProcessISSOrbitData() {
        try {
            const response = await fetch('https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE');
            const data = await response.text();
            const lines = data.split('\n');
            
            if (lines.length >= 3) {
                issTLE = {
                    name: lines[0].trim(),
                    line1: lines[1].trim(),
                    line2: lines[2].trim()
                };
                
                issInfo = satellite.twoline2satrec(issTLE.line1, issTLE.line2);
                console.log("TLE data loaded:", issTLE);
            } else {
                console.error("Invalid TLE data format");
            }
        } catch (error) {
            console.error("Error fetching TLE data:", error);
        }
    }

    function calculateISSPositionAt(date) {
        if (!issInfo) return null;
        
        const positionAndVelocity = satellite.propagate(issInfo, date);
        const positionEci = positionAndVelocity.position;
        
        const gmst = satellite.gstime(date);
        const positionGd = satellite.eciToGeodetic(positionEci, gmst);
        
        const latitude = satellite.degreesLat(positionGd.latitude);
        const longitude = satellite.degreesLong(positionGd.longitude);
        const altitude = positionGd.height;
        
        return { latitude, longitude, altitude };
    }

    onMount(async() => {
        initializeWindowDimensions();
        setupResizeHandler();
        
        leaflet = await import('leaflet');
        satellite = await import('satellite.js');
        
        initializeMap();
        await fetchAndProcessISSOrbitData();
        
        const updateISSPosition = async() => {
            const startingTime = Date.now();
            
            if (issInfo) {
                updatePositionFromTLE();
            } else {
                await updatePositionFromAPI();
            }
            
            time += 6;
            calculateISSSpeed(startingTime);
            
            longitude2 = longitude;
            latitude2 = latitude;
            
            validatePredictions();
        };
        
        function updatePositionFromTLE() {
            const currentDate = new Date();
            const position = calculateISSPositionAt(currentDate);
            
            if (position) {
                latitude = position.latitude;
                longitude = position.longitude;
                updateOrCreateISSMarker();
            }
        }
        
        async function updatePositionFromAPI() {
            const response = await fetch('http://api.open-notify.org/iss-now.json');
            const issLocation = await response.json();
            
            latitude = issLocation.iss_position.latitude;
            longitude = issLocation.iss_position.longitude;
            updateOrCreateISSMarker();
        }
        
        function updateOrCreateISSMarker() {
            if(issMarker) {
                issMarker.setLatLng([latitude, longitude]);
            } else {
                issMarker = leaflet.marker([latitude, longitude]).addTo(map).bindPopup('ISS Current Location').openPopup();
            }
            map.setView([latitude, longitude], zoomLevel);
        }
        
        function calculateISSSpeed(startingTime) {
            if (latitude2 !== 0 && longitude2 !== 0) {
                distanceInMeters = calculateDistanceInMeters(latitude2, longitude2, latitude, longitude);
                
                const endingTime = Date.now();
                latency = (endingTime - startingTime) / 1000;
                totalLatency = 6 - latency;
                speedISS = distanceInMeters / totalLatency;
            }
        }

        function initializeWindowDimensions() {
            windowHeight = window.innerHeight;
            windowWidth = window.innerWidth;
        }
        
        function setupResizeHandler() {
            const handleResize = () => {
                windowHeight = window.innerHeight;
                windowWidth = window.innerWidth;
                
                if (map) {
                    const mapHeight = Math.floor(windowHeight * 0.6);
                    document.getElementById('map').style.height = `${mapHeight}px`;
                    map.invalidateSize();
                }
            };
            
            window.addEventListener('resize', handleResize);
            return handleResize;
        }
        
        function initializeMap() {
            const mapHeight = Math.floor(windowHeight * 0.6);
            const mapElement = document.getElementById('map');
            if (mapElement) {
                mapElement.style.height = `${mapHeight}px`;
            }
            
            map = leaflet.map('map').setView([0,0], 3);
            leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            
            setTimeout(() => map.invalidateSize(), 100);
            
            map.on('zoomend', () => {
                zoomLevel = map.getZoom();
            });
        }
        
        updateISSPosition();
        
        const interval = setInterval(updateISSPosition, 6000);
        const handleResize = setupResizeHandler();
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    });
    
    let sliderValue = 0; // present time in minutes
    
    const predictISSPosition = () => {
        if (!issInfo) {
            console.error("TLE data not available for prediction");
            return;
        }
        
        resetCountdownTimer();
        startCountdownIfNeeded();
        
        const currentDate = new Date();
        const futureDate = new Date(currentDate.getTime() + sliderValue * 60 * 1000);
        const position = calculateISSPositionAt(futureDate);
        
        if (position) {
            predictedLat = position.latitude;
            predictedLong = position.longitude;
            
            console.log(`Predicted position at ${futureDate}:`, position);
            
            if (sliderValue > 0) {
                storePrediction(sliderValue, predictedLat, predictedLong);
            }
            
            updatePredictionMarker(predictedLat, predictedLong);
            showPredictionPath();
        }
    };
    
    function resetCountdownTimer() {
        if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
        }
    }
    
    function startCountdownIfNeeded() {
        if (sliderValue > 0) {
            timeRemaining = sliderValue * 60;
            countdownTimer = setInterval(() => {
                timeRemaining--;
                if (timeRemaining <= 0) {
                    clearInterval(countdownTimer);
                    countdownTimer = null;
                }
            }, 1000);
        } else {
            timeRemaining = 0;
        }
    }
    
    function updatePredictionMarker(lat, lon) {
        if (!map || !leaflet) return;
        
        if (predictionMarker) {
            predictionMarker.setLatLng([lat, lon]);
        } else {
            const predictionIcon = leaflet.divIcon({
                html: '<div class="prediction-icon">📍</div>',
                className: 'prediction-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            });
            
            predictionMarker = leaflet.marker([lat, lon], {
                icon: predictionIcon,
                zIndexOffset: 1000
            }).addTo(map).bindPopup('Predicted ISS Location');
        }
    }
    
    function showPredictionPath() {
        if (!map || !leaflet || sliderValue <= 0 || !issInfo) return;
        
        clearExistingPredictionPath();
        const pathPoints = generatePathPoints();
        drawPathOnMap(pathPoints);
    }
    
    function clearExistingPredictionPath() {
        if (predictionPath) {
            map.removeLayer(predictionPath);
        }
    }
    
    function generatePathPoints() {
        const pathPoints = [];
        const currentTime = sliderValue;
        const currentDate = new Date();
        
        for (let t = 0; t <= currentTime; t += 5) {
            const pointDate = new Date(currentDate.getTime() + t * 60 * 1000);
            const position = calculateISSPositionAt(pointDate);
            
            if (position) {
                pathPoints.push([position.latitude, position.longitude]);
            }
        }
        
        return pathPoints;
    }
    
    function drawPathOnMap(pathPoints) {
        predictionPath = leaflet.polyline(pathPoints, {
            color: 'red',
            weight: 2,
            opacity: 0.7,
            dashArray: '5, 5'
        }).addTo(map);
    }
    
    function storePrediction(minutes, lat, long) {
        predictionHistory.push({
            targetTime: Date.now() + (minutes * 60 * 1000),
            minutes: minutes,
            latitude: lat,
            longitude: long
        });
    }
    
    function validatePredictions() {
        const currentTime = Date.now();
        
        predictionHistory = predictionHistory.filter(pred => {
            if (pred.targetTime < currentTime) {
                const actualLat = parseFloat(latitude);
                const actualLong = parseFloat(longitude);
                const predLat = pred.latitude;
                const predLong = pred.longitude;
                
                const errorDistance = calculateDistanceInMeters(
                    actualLat, actualLong, 
                    predLat, predLong
                );
                
                console.log(`Prediction error: ${errorDistance.toFixed(2)} meters after ${pred.minutes} minutes`);
                return false;
            }
            return true;
        });
    }

    let resetPrediction = () => {
        sliderValue = 0;
        resetCountdownTimer();
        timeRemaining = 0;
        clearPredictionVisualization();
    };
    
    function clearPredictionVisualization() {
        if (predictionMarker && map) {
            map.removeLayer(predictionMarker);
            predictionMarker = null;
        }
        
        if (predictionPath && map) {
            map.removeLayer(predictionPath);
            predictionPath = null;
        }
    }
    
    async function refreshOrbitData() {
        await fetchAndProcessISSOrbitData();
    }
</script>

<div class="iss-tracker-container">
    <div class="map-container">
        <div id="map"></div>
        <div class="floating-controls">
            <button class="icon-button reset" on:click={resetPrediction} title="Reset prediction and clear visualization">↺</button>
            <button class="icon-button refresh" on:click={refreshOrbitData} title="Refresh ISS orbital data">↻</button>
            {#if timeRemaining > 0}
                <div class="floating-timer">
                    <div class="timer-display">
                        {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                    </div>
                </div>
            {/if}
        </div>
    </div>

    <div class="controls-container">
        <div class="slider-container">
            <div class="slider-row">
                <input on:change={predictISSPosition} class="slider" type="range" min="-720" max="720" bind:value={sliderValue}>
                <input class="time-input" type="text" bind:value={sliderValue}>
            </div>
            <button class="predict-button" on:click={predictISSPosition}>Predict Position</button>
        </div>
        
        <div class="info-container">
            <div class="info-section">
                <h3>Current ISS Data</h3>
                <p>Speed: {speedISS.toFixed(2)} m/s</p>
                <p>Position: {latitude2}, {longitude2}</p>
                {#if issTLE}
                    <p class="tle-data">{issTLE.name}</p>
                {/if}
            </div>
            
            <div class="info-section">
                <h3>Prediction Data</h3>
                <p>Position in {sliderValue} min: {predictedLat?.toFixed(4) || 'N/A'}, {predictedLong?.toFixed(4) || 'N/A'}</p>
            </div>
        </div>
    </div>
</div>

<style>
    @import 'leaflet/dist/leaflet.css';
    
    .iss-tracker-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        max-width: 100%;
        overflow: hidden;
        padding: 10px;
        box-sizing: border-box;
    }
    
    .map-container {
        position: relative;
        width: 100%;
        margin-bottom: 10px;
        min-height: 300px; 
    }
    
    #map {
        width: 100%;
        height: 60vh; 
        min-height: 300px;
        border-radius: 8px;
        overflow: hidden;
    }
    
    .floating-controls {
        position: absolute;
        top: 10px;
        right: 10px;
        display: flex;
        justify-content: end;
        align-items: end;
        flex-direction: column;
        gap: 10px;
        z-index: 1000;
    }
    
    .icon-button {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: rgba(58, 80, 107, 0.8);
        color: #bdbdbd;
        border: none;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.3s;
    }
    
    .icon-button:hover {
        background-color: rgba(77, 107, 138, 0.9);
    }
    
    .floating-timer {
        background-color: rgba(51, 51, 51, 0.8);
        padding: 8px 12px;
        border-radius: 20px;
        text-align: center;
        backdrop-filter: blur(4px);
    }
    
    .controls-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
    }
    
    .slider-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
    }
    
    .slider-row {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
    }
    
    .slider {
        flex: 1;
        height: 8px;
        background-color: #333;
        border-radius: 4px;
        outline: none;
    }
    
    .time-input {
        width: 60px;
        background-color: #333;
        color: #bdbdbd;
        border: 1px solid #444;
        padding: 5px;
        border-radius: 3px;
        text-align: center;
    }
    
    .predict-button {
        padding: 8px 16px;
        background-color: #3a506b;
        color: #bdbdbd;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
        align-self: flex-end;
    }
    
    .predict-button:hover {
        background-color: #4d6b8a;
    }
    
    .info-container {
        display: flex;
        gap: 10px;
        width: 100%;
    }
    
    .info-section {
        flex: 1;
        padding: 10px;
        border: 1px solid #444;
        border-radius: 5px;
        background-color: #2a2a2a;
        overflow: auto;
    }
    
    .prediction-marker {
        background: none;
        border: none;
    }
    
    .prediction-icon {
        font-size: 24px;
        color: #ff0000;
        text-shadow: 0px 0px 3px white, 0px 0px 5px white;
        z-index: 1000;
    }
    
    h3 {
        margin-top: 0;
        margin-bottom: 10px;
        color: #bdbdbd;
        font-size: 1rem;
    }
    
    p {
        margin: 5px 0;
        color: #bdbdbd;
        font-size: 0.9rem;
    }
    
    .timer-display {
        font-weight: bold;
        color: #5bc0be;
        text-shadow: 0 0 5px rgba(91, 192, 190, 0.5);
        font-family: monospace;
        font-size: 1.2rem;
    }
    
    .tle-data {
        font-family: monospace;
        font-size: 0.8em;
        color: #5bc0be;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    /* Media queries for responsive design */
    @media (min-width: 768px) {
        .iss-tracker-container {
            flex-direction: row;
            gap: 15px;
        }
        
        .map-container {
            flex: 2;
            margin-bottom: 0;
        }
        
        .controls-container {
            flex: 1;
            max-width: 30%;
        }
    }
    
    @media (max-width: 767px) {
        .info-container {
            flex-direction: column;
        }
        
        .iss-tracker-container {
            height: auto;
            min-height: 100vh;
        }
    }
</style>
    
    
