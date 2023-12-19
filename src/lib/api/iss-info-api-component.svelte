<script>
    import { onMount } from 'svelte';
    
        
    
    let map;
    let leaflet;
    let issMarker;
    let latitude;
    let longitude;
    let longitude2=0;
    let latitude2=0;
    let speedISS =0;
    let time=0;
    let latitudeDifference;
    let latitudeDistance;
    let longitudeDifference;
    let longitudeDistance;
    let distanceInKM;
    let phaseOffset;
    let predictedLat;
    let predictedLong;
    let circumferenceAtLatitude
    let distanceTraveled
    let earthRotationalSpeed;
    let deltaLongitude
    let parsedlat
    let parsedlong
    onMount(async()=>{ 
         leaflet= await import('leaflet');
        map=leaflet.map('map').setView([0,0],1);
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        const updateMarker=async()=>{
            const response = await fetch('http://api.open-notify.org/iss-now.json');
            const issLocation = await response.json();
           // const { latitude, longitude } = issLocation.iss_position;
             latitude=issLocation.iss_position.latitude;
             longitude=issLocation.iss_position.longitude;
            // console.log('lat is: '+latitude,'long is: '+longitude);
            
            if(issMarker) {
                issMarker.setLatLng([latitude, longitude]);
            }else{
                issMarker= leaflet.marker([latitude, longitude]).addTo(map).bindPopup('ISS Current Location').openPopup();
            }
            map.setView([latitude, longitude], 4);
            if(time<60) console.log()//console.log(time+' seconds passed')
            else console.log(); //console.log(parseInt(time/60) +'minutes passed and '+time%60 + 'seconds')
            time+=6;

            latitudeDifference=latitude-latitude2;
            longitudeDifference=longitude-longitude2;
            latitudeDistance=latitudeDifference*111.32;
            longitudeDistance=longitudeDifference*111.32 *Math.cos(latitude*Math.PI/180)
            distanceInKM = Math.sqrt(Math.pow(latitudeDistance, 2) + Math.pow(longitudeDistance, 2));
            speedISS= (distanceInKM * 1000) / 6;
            longitude2= longitude;
            latitude2= latitude;
        };


        updateMarker();
        const interval = setInterval(updateMarker,6000);
        return ()=>{
            clearInterval(interval);
        };
    });
    
    let sliderValue=0;//present time in minutes starting with 0 which is the current time (live) and 12 hours in the future (720 minutes in this case) and -12 hours in the past (-720 minutes in the past)
    let onSliderChange=()=>{
        parsedlat=parseFloat(latitude);
        parsedlong=parseFloat(longitude)
        console.log(sliderValue)
        phaseOffset = Math.asin(parsedlat / 51.6);
        predictedLat = 51.6 * Math.sin((2 * Math.PI / 90) * sliderValue + phaseOffset);
        //
        earthRotationalSpeed=(1670*1000/3600)*Math.cos(parsedlat*Math.PI/180)
        distanceTraveled = (speedISS - earthRotationalSpeed) * (sliderValue * 60);
        circumferenceAtLatitude = 40075000 * Math.cos(parsedlat * Math.PI / 180);
        deltaLongitude = (distanceTraveled / circumferenceAtLatitude) * 360;
        predictedLong = parsedlong + deltaLongitude;
       // predictedLong= longitude+((speedISS-earthRotationalSpeed)/40.075*1000)*(sliderValue*360/60)
        // console.log(earthRotationalSpeed)
        // console.log(distanceTraveled)parseFloat(latitude)
      
        console.log(deltaLongitude)
        // console.log(deltaLongitude)
        // console.log(predictedLong)



    };
    let onResetButtonClick=()=>{sliderValue=0};
    </script>
    
    <div id="map" style="height: 500px;"></div>

    <div class="slider-container">
        
        <input on:change={onSliderChange} class="slider" type="range" min="-720" max="720" bind:value={sliderValue}>
        <button class="button" on:click={onResetButtonClick}>reset</button>
    </div>

    <div>
        speed: {speedISS}m/s
        long: {longitude2}
        lat: {latitude2}
        
    </div>
   predicted lat is: {predictedLat} <br>
   earth's speed at current lat is: {earthRotationalSpeed}  <br>
   predicted long is: {predictedLong}
  
    <!-- {#if issLocation }
    <h1>ISS Current Location</h1>
    <p>Latitude: {issLocation.iss_position.latitude}</p>
    <p>Longitude: {issLocation.iss_position.longitude}</p>
    {:else}
    <p>Loading ISS location...</p>
    {/if} -->

    <style>
        @import 'leaflet/dist/leaflet.css';
        

    </style>