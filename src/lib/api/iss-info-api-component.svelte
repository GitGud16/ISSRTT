<script>
    import { onMount } from 'svelte';
    
        
    
    let map;
    let leaflet;
    let issMarker;
    let longitude1=0;
    let latitude1=0;
    let speed =0;
    let speed2=0;
    let time=0;
    onMount(async()=>{ 
         leaflet= await import('leaflet');
        map=leaflet.map('map').setView([0,0],1);
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        const updateMarker=async()=>{
            const response = await fetch('http://api.open-notify.org/iss-now.json');
            const issLocation = await response.json();
           // const { latitude, longitude } = issLocation.iss_position;
            const latitude=issLocation.iss_position.latitude;
            const longitude=issLocation.iss_position.longitude;
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

            speed=Math.pow(Math.pow((longitude-longitude1),2)+Math.pow((latitude-latitude1),2),0.5)/6;
            longitude1= longitude;
            latitude1= latitude;
        };

        updateMarker();
        const interval = setInterval(updateMarker,6000);
        return ()=>{
            clearInterval(interval);
        };
    });
    let sliderValue=50;
    let onSliderChange=()=>{console.log(sliderValue)};
    let onResetButtonClick=()=>{sliderValue=50};
    </script>
    
    <div id="map" style="height: 500px;"></div>

    <div class="slider-container">
        
        <input on:change={onSliderChange} class="slider" type="range" min="0" max="100" bind:value={sliderValue}>
        <button class="button" on:click={onResetButtonClick}>reset</button>
    </div>

    <div>
        speed: {speed}m/s
        long: {longitude1}
        lat: {latitude1}
        {speed2}
    </div>
  
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