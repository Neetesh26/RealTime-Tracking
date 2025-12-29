const socket = io();
console.log("hey");

if(navigator.geolocation) {
    navigator.geolocation.watchPosition((position)=>{
        const {latitude, longitude} = position.coords;
        socket.emit('send-Location', {latitude, longitude});
    }, (error)=>{
        console.error("Error getting location:", error);
    },{
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
    }
);
}


const map = L.map("map").setView([0, 0], 13 );

// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
//     attribution: 'neetesh'
// })
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution: "Neetesh-map"
}).addTo(map);
    

const marker = {}

socket.on('receive-Location', (data)=>{
    console.log("Location received:", data);
    const {latitude, longitude, id} = data;
    map.setView([latitude, longitude], 10);
    if(marker[id]){
        marker[id].setLatLng([latitude, longitude]);
    }else{
        marker[id] = L.marker([latitude, longitude]).addTo(map);
    }
});
socket.on('client-disconnected', (id)=>{
    if(marker[id]){
        map.removeLayer(marker[id]);
        delete marker[id];
    }
})