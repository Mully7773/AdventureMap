"use strict";

const form = document.querySelector(".form");
const inputType = document.querySelector(".form-input--type");
const inputDuration = document.querySelector(".form-input--duration");
const days = document.querySelector(".days");
const hours = document.querySelector(".hours");
const minutes = document.querySelector(".minutes");
const selectedDate = document.querySelector(".form-input--date");
const inputActivity = document.querySelector(".form-input--activity");
const inputCost = document.querySelector(".form-input--cost");
const adventureContainer = document.querySelector(".adventures");
const liContainer = document.querySelector(".adventure");
const closeButton = document.querySelector(".close-button");
const closeButtonContainer = document.querySelector(".close-button-container");
const clearAll = document.querySelector(".clear-all");
const header = document.querySelector(".sidebar-header");

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
class Adventure {
  date = new Date();
  id = uuidv4(); // Unique ID

  constructor(coords, activity, cost, day, hour, minute, selectedDate) {
    this.coords = coords; //Must be an array for leaflet: [lat, lng]
    this.activity = activity; //string
    this.cost = cost; // number
    this.day = day;
    this.hour = hour;
    this.minute = minute;

    this.selectedDate = selectedDate;
  }

  //In order to use it in popup content
  _setDate() {
    this.currentDate = `${months[new Date(this.selectedDate).getMonth()]} ${
      new Date(this.selectedDate).getDate() + 1
    }, ${new Date(this.selectedDate).getFullYear()}`;
  }
  _setDescription() {
    this.description = `${this.activity[0].toUpperCase()}${this.activity.slice(
      1
    )} ${
      this.type === "solo"
        ? "by myself"
        : this.type === "family"
        ? "with family"
        : "with friend(s)"
    } on
     ${months[new Date(this.selectedDate).getMonth()]} ${
      new Date(this.selectedDate).getDate() + 1
    }, ${new Date(this.selectedDate).getFullYear()}`;
  }
}
// ${months[this.date.getMonth()]} ${this.date.getDate()}
class Solo extends Adventure {
  type = "solo";
  constructor(coords, activity, cost, day, hour, minute, selectedDate) {
    super(coords, activity, cost, day, hour, minute, selectedDate);
    this._setDescription();
    this._setDate();
  }
}

class Family extends Adventure {
  type = "family";
  constructor(coords, activity, cost, day, hour, minute, selectedDate) {
    super(coords, activity, cost, day, hour, minute, selectedDate);
    this._setDescription();
    this._setDate();
  }
}

class Friends extends Adventure {
  type = "friends";
  constructor(coords, activity, cost, day, hour, minute, selectedDate) {
    super(coords, activity, cost, day, hour, minute, selectedDate);
    this._setDescription();
    this._setDate();
  }
}

//Test data:
// const solo1 = new Solo([34, 52], "Bowling", 77, 120);
// const family1 = new Family([34, 52.5], "Camping", 200, 500);
// const friends1 = new Friends([34, 53], "Arcade", 85, 300);

// console.log(solo1, family1, friends1);

class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #adventures = [];

  constructor() {
    //Get user position
    this._findPosition();

    //Get data from local storage
    this._getLocalStorage();

    //Create new adventure
    form.addEventListener("submit", this._submitAdventure.bind(this));
    //Move to popup functionality
    adventureContainer.addEventListener("click", this._moveToPopup.bind(this));

    clearAll.addEventListener("click", this.reset);

    document.addEventListener("click", this._deleteAdventure.bind(this));
  }

  _findPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._renderMap.bind(this),
        function () {
          alert("Could not get your position");
        }
      );
  }

  _renderMap(position) {
    console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    //   console.log(latitude, longitude);
    const coords = [latitude, longitude];

    this.#map = L.map("map", {
      zoomControl: false,
    }).setView(coords, this.#mapZoomLevel);

    L.control.zoom({ position: "bottomright" }).addTo(this.#map);

    const basemaps = {
      Default: L.tileLayer(
        "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        {
          attribution:
            '&copy; <a href="https://about.google/brand-resource-center/products-and-services/geo-guidelines/#google-maps" target="_blank">Google Maps</a> contributors',
          maxZoom: 20,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
        }
      ),
      OpenStreetMaps: L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }
      ),
      Satellite: L.tileLayer(
        "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        {
          attribution:
            '&copy; <a href="https://about.google/brand-resource-center/products-and-services/geo-guidelines/#google-maps" target="_blank">Google Maps</a> contributors',
          maxZoom: 20,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
        }
      ),
      Topography: L.tileLayer.wms("http://ows.mundialis.de/services/service?", {
        attribution:
          '&copy; <a href="https://www.mundialis.de/en/" target="_blank">Mundialis</a> contributors',
        layers: "TOPO-WMS",
      }),
    };

    const layerControl = L.control.layers(basemaps);
    layerControl.addTo(this.#map);
    basemaps.Default.addTo(this.#map);

    this.#map.on("click", this._renderForm.bind(this));

    //(For local storage) - Must render markers here because we cannot render the marker as soon as the page loads because the map hasn't finished rendering yet
    this.#adventures.forEach((advent) => {
      this._renderAdventureMarker(advent);
    });
  }

  _renderForm(mapE) {
    // console.log("hello");
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputActivity.focus();
  }

  _hideForm() {
    //Empty inputs
    inputActivity.value =
      inputCost.value =
      days.value =
      hours.value =
      minutes.value =
      selectedDate.value =
        "";
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);
  }

  _submitAdventure(e) {
    e.preventDefault();

    // Get data from form
    const type = inputType.value;
    const activity = inputActivity.value;
    const cost = +inputCost.value;
    const day = +days.value;
    const hour = +hours.value;
    const minute = +minutes.value;
    const myDate = selectedDate.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let adventure;

    // Data validation
    if (type === "solo" || type === "family" || type === "friends") {
      if (!activity.trim() || activity.length > 10) {
        alert(
          "Please input an activity less than 10 characters. Brevity is the soul of wit!"
        );
        return false;
      }
      if (!Number.isFinite(cost) || cost < 0)
        return alert(
          "Please input a positive number or zero in the money field"
        );

      if (
        !Number.isFinite(day) ||
        !Number.isFinite(hour) ||
        !Number.isFinite(minute) ||
        (day == 0) & (hour == 0) & (minute == 0)
      ) {
        return alert(
          "Please enter a single number in at least one of the days (d), hours (h), or minutes (m) fields"
        );
      }
    }

    // If activity is solo, create solo object
    if (type === "solo") {
      adventure = new Solo(
        [lat, lng],
        activity,
        cost,
        day,
        hour,
        minute,
        myDate
      );
    }
    // If activity is family, create family object
    if (type === "family") {
      adventure = new Family(
        [lat, lng],
        activity,
        cost,
        day,
        hour,
        minute,
        myDate
      );
    }

    // If activity is friend, create friend object
    if (type === "friends") {
      adventure = new Friends(
        [lat, lng],
        activity,
        cost,
        day,
        hour,
        minute,
        myDate
      );
    }

    //Add new activity to adventure array
    this.#adventures.push(adventure);
    console.log(adventure);

    //Render marker on map
    this._renderAdventureMarker(adventure);
    //Render activity on list
    this._renderAdventure(adventure);

    //Clear inputs
    this._hideForm();

    //Save to local storage
    this._setLocalStorage();
  }

  _renderAdventureMarker(adventure) {
    let myMarker = L.marker(adventure.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          minWidth: 100,
          maxWidth: 250,
          autoClose: false,
          closeOnClick: false,
          className: `${adventure.type}-popup`,
        })
      )
      .setPopupContent(
        `${
          adventure.type === "solo"
            ? "🕺"
            : adventure.type === "family"
            ? "👨‍👩‍👧‍👦"
            : "👫"
        } ${adventure.activity[0].toUpperCase()}${adventure.activity.slice(
          1
        )} - 
        ${adventure.currentDate}`
      )
      .openPopup();
    if (adventure.type === "solo") {
      myMarker._icon.classList.add("color-change-solo");
    }
    if (adventure.type === "family") {
      myMarker._icon.classList.add("color-change-family");
    }
    if (adventure.type === "friends") {
      myMarker._icon.classList.add("color-change-friends");
    }
  }

  _renderAdventure(adventure) {
    clearAll.classList.remove("hidden");
    const html = `<li class="adventure adventure--${adventure.type}" data-id="${
      adventure.id
    }">
    <div class="button-container">
   
    <button id="close-button">&#10006</button>
    </div>
   
    <h2 class="adventure-name">${adventure.description}</h2>
    <div class="adventure-details">
      <span class="adventure-icon">${
        adventure.type === "solo"
          ? "🕺"
          : adventure.type === "family"
          ? "👨‍👩‍👧‍👦"
          : "👫"
      }</span>
      <span class="adventure-value">${adventure.type[0].toUpperCase()}${adventure.type.slice(
      1
    )}</span>
      <span></span>
    </div>

    <div class="adventure-details">
      <span class="adventure-icon">⛳</span>
      <span class="adventure-value">${adventure.activity[0].toUpperCase()}${adventure.activity.slice(
      1
    )}
      </span>
      <span></span>
    </div>

    <div class="adventure-details">
      <span class="adventure-icon">💲</span>
      <span class="adventure-value">${adventure.cost}</span>
      <span class="adventure-unit"></span>
    </div>

    <div class="adventure-details">
      <span class="adventure-icon">⌚</span>
      <span class="adventure-value">${adventure.day}</span>
      <span class="adventure-unit day-unit">day</span>
      <span class="adventure-value">${adventure.hour}</span>
      <span class="adventure-unit hour-unit">hr</span>
      <span class="adventure-value">${adventure.minute}</span>
      <span class="adventure-unit minute-unit">min</span>
    </div>
  </li>`;

    form.insertAdjacentHTML("afterend", html);
  }

  _moveToPopup(e) {
    const adventureEl = e.target.closest(".adventure");
    // console.log(adventureEl);

    if (!adventureEl) return;

    const adventure = this.#adventures.find(
      (advent) => advent.id === adventureEl.dataset.id
    );
    // console.log(adventure);

    this.#map.setView(adventure.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  _deleteAdventure(e) {
    const adventureData = JSON.parse(localStorage.getItem("adventures"));
    // if (!adventureData) return;
    if (e.target && e.target.id == "close-button") {
      if (confirm("Are you sure you wish to delete this adventure?")) {
        const adventureEl = e.target.closest(".adventure");

        // if (!adventureEl) return;
        const adventure = this.#adventures.find(
          (advent) => advent.id === adventureEl.dataset.id
        );
        console.log(adventure.id);

        const filteredData = adventureData.filter(
          (advent) => advent.id !== adventureEl.dataset.id
        );

        localStorage.setItem("adventures", JSON.stringify(filteredData));

        adventureEl.classList.add("hidden");
      }
      location.reload();
    }
  }

  _setLocalStorage() {
    localStorage.setItem("adventures", JSON.stringify(this.#adventures));
  }

  _getLocalStorage() {
    const adventureData = JSON.parse(localStorage.getItem("adventures"));
    console.log(adventureData);

    if (!adventureData) return;

    this.#adventures = adventureData;

    this.#adventures.forEach((advent) => {
      this._renderAdventure(advent);
    });
  }

  reset() {
    if (confirm("Are you sure you wish to delete all of your adventures?")) {
      localStorage.removeItem("adventures");
      location.reload();
    }
  }
}

console.log(closeButton);

const app = new App();
