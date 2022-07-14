"use strict";

if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(
    function (position) {
      console.log(position);
      const { latitude, longitude } = position.coords;
      //   console.log(latitude, longitude);
      const coords = [latitude, longitude];

      const map = L.map("map", { zoomControl: false }).setView(coords, 13);

      L.control.zoom({ position: "topright" }).addTo(map);

      L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      }).addTo(map);

      map.on("click", function (mapEvent) {
        console.log(mapEvent);
        const { lat, lng } = mapEvent.latlng;

        L.marker([lat, lng]).addTo(map).bindPopup("Adventure!").openPopup();
      });
    },
    function () {
      alert("Could not get your position");
    }
  );
