"use strict";

const form = document.querySelector(".form");
const inputType = document.querySelector(".form-input--type");
const inputDuration = document.querySelector(".form-input--duration");
const inputActivity = document.querySelector(".form-input--activity");
const inputCost = document.querySelector(".form-input--cost");
const adventureContainer = document.querySelector(".adventures");

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

  constructor(coords, activity, cost, duration) {
    this.coords = coords; //Must be an array for leaflet: [lat, lng]
    this.activity = activity; //string
    this.cost = cost; // number
    this.duration = duration; // number in minutes
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
    } on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
}

class Solo extends Adventure {
  type = "solo";
  constructor(coords, activity, cost, duration) {
    super(coords, activity, cost, duration);
    this._setDescription();
  }
}

class Family extends Adventure {
  type = "family";
  constructor(coords, activity, cost, duration) {
    super(coords, activity, cost, duration);
    this._setDescription();
  }
}

class Friends extends Adventure {
  type = "friends";
  constructor(coords, activity, cost, duration) {
    super(coords, activity, cost, duration);
    this._setDescription();
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
    this._findPosition();
    form.addEventListener("submit", this._submitAdventure.bind(this));
    adventureContainer.addEventListener("click", this._moveToPopup.bind(this));
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

    this.#map = L.map("map", { zoomControl: false }).setView(
      coords,
      this.#mapZoomLevel
    );

    L.control.zoom({ position: "topright" }).addTo(this.#map);

    L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
    }).addTo(this.#map);

    // L.basemapsSwitcher(
    //   [
    //     {
    //       layer: L.tileLayer(
    //         "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    //         {
    //           attribution:
    //             '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    //         }
    //       ).addTo(this.#map), //DEFAULT MAP
    //       icon: "first",
    //       name: "Map one",
    //     },
    //     {
    //       layer: L.tileLayer(
    //         "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
    //         {
    //           attribution:
    //             '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    //         }
    //       ),
    //       icon: "second",
    //       name: "Map two",
    //     },
    //   ],
    //   { position: "bottomright" }
    // ).addTo(this.#map);

    // const googleSatellite = L.tileLayer(
    //   "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    //   {
    //     maxZoom: 20,
    //     subdomains: ["mt0", "mt1", "mt2", "mt3"],
    //   }
    // );

    this.#map.on("click", this._renderForm.bind(this));
  }

  _renderForm(mapE) {
    console.log("hello");
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputActivity.focus();
  }

  _hideForm() {
    //Empty inputs
    inputActivity.value = inputCost.value = inputDuration.value = "";
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);
  }

  _submitAdventure(e) {
    // console.log(mapEvent);
    e.preventDefault();

    // Get data from form
    const type = inputType.value;
    const activity = inputActivity.value;
    const cost = +inputCost.value;
    const duration = +inputDuration.value;
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
        return alert("Please input a positive number or zero");

      if (!Number.isFinite(duration) || duration <= 0) {
        return alert(
          "Please input the approximate number of minutes you spent having fun"
        );
      }
    }

    // If activity is solo, create solo object
    if (type === "solo") {
      adventure = new Solo([lat, lng], activity, cost, duration);
    }
    // If activity is family, create family object
    if (type === "family") {
      adventure = new Family([lat, lng], activity, cost, duration);
    }

    // If activity is friend, create friend object
    if (type === "friends") {
      adventure = new Friends([lat, lng], activity, cost, duration);
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
  }

  _renderAdventureMarker(adventure) {
    L.marker(adventure.coords)
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
        )} - ${months[adventure.date.getMonth()]} ${adventure.date.getDate()}`
      )
      .openPopup();
  }

  _renderAdventure(adventure) {
    const html = `<li class="adventure adventure--${adventure.type}" data-id="${
      adventure.id
    }">
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
      <span class="adventure-icon">🚶‍♂️</span>
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
      <span class="adventure-value">${adventure.duration}</span>
      <span class="adventure-unit">min</span>
    </div>
  </li>`;

    form.insertAdjacentHTML("afterend", html);
  }

  _moveToPopup(e) {
    const adventureEl = e.target.closest(".adventure");
    console.log(adventureEl);

    if (!adventureEl) return;

    const adventure = this.#adventures.find(
      (advent) => advent.id === adventureEl.dataset.id
    );
    console.log(adventure);

    this.#map.setView(adventure.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
}

const app = new App();
