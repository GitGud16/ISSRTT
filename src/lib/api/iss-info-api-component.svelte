<script>
    import { onMount } from 'svelte';
    
        
    
    let map;
    let leaflet;
    let issMarker;
   
    let time=0;
    onMount(async()=>{ 
         leaflet= await import('leaflet');
        map=leaflet.map('map').setView([0,0],1);
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        const updateMarker=async()=>{
            const response = await fetch('http://api.open-notify.org/iss-now.json');
            const issLocation = await response.json();
            const { latitude, longitude } = issLocation.iss_position;
            
            if(issMarker) {
                issMarker.setLatLng([latitude, longitude]);
            }else{
                issMarker= leaflet.marker([latitude, longitude]).addTo(map).bindPopup('ISS Current Location').openPopup();
            }
            map.setView([latitude, longitude], 4);
            time++;
            console.log(time+' minutes passed')
        };

        updateMarker();
        const interval = setInterval(updateMarker,5000);
        return ()=>{
            clearInterval(interval);
        };
    });
    
    
    </script>
    
    <div id="map" style="height: 500px;"></div>
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