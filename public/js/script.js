const socket = io();

// Initialize map
const map = L.map("map").setView([0, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© Neetesh Tracker",
}).addTo(map);

// Markers
const markers = {};
let myMarker = null;

let lastSent = 0;
let isFirstLocation = true;

// GPS tracking
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const now = Date.now();

      // Send first location immediately
      if (!isFirstLocation && now - lastSent < 2000) return;

      lastSent = now;
      isFirstLocation = false;

      const { latitude, longitude } = position.coords;

      if (myMarker) {
        myMarker.setLatLng([latitude, longitude]);
      } else {
        myMarker = L.marker([latitude, longitude]).addTo(map);
        map.setView([latitude, longitude], 15);
      }

      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error("Geolocation error:", error.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    }
  );
}

// Receive existing users
socket.on("existing-users", (users) => {
  for (const id in users) {
    const { latitude, longitude } = users[id];
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }
});

// Receive live updates
socket.on("receive-location", ({ id, latitude, longitude }) => {
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }
});

// Remove disconnected user
socket.on("client-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
