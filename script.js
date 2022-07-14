"use strict";

const form = document.querySelector(".form");
const inputType = document.querySelector(".form-input--type");
const inputDuration = document.querySelector(".form-input--duration");
const inputActivity = document.querySelector(".form-input--activity");
const inputCost = document.querySelector(".form-input--cost");
const adventureContainer = document.querySelector(".adventures");

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
        form.classList.remove("hidden");
        inputActivity.focus();
        // console.log(mapEvent);
        // const { lat, lng } = mapEvent.latlng;
        // L.marker([lat, lng])
        //   .addTo(map)
        //   .bindPopup(
        //     L.popup({
        //       minWidth: 100,
        //       maxWidth: 250,
        //       autoClose: false,
        //       closeOnClick: false,
        //       className: `solo-popup`,
        //     })
        //   )
        //   .setPopupContent("Adventure!")
        //   .openPopup();
      });
    },
    function () {
      alert("Could not get your position");
    }
  );
