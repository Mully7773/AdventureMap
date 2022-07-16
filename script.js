"use strict";

const form = document.querySelector(".form");
const inputType = document.querySelector(".form-input--type");
const inputDuration = document.querySelector(".form-input--duration");
const inputActivity = document.querySelector(".form-input--activity");
const inputCost = document.querySelector(".form-input--cost");
const adventureContainer = document.querySelector(".adventures");

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
    // Bowling by myself on July 16
    // ${this.type[0].toUpperCase()}${this.type.slice(1)}

    this.description = `${this.activity[0].toUpperCase()}${this.activity.slice(
      1
    )} ${
      this.type === "solo"
        ? "by myself"
        : this.type === "family"
        ? "with family"
        : "with friend(s)"
    }
on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
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
  #mapEvent;
  #adventures = [];

  constructor() {
    this._findPosition();

    form.addEventListener("submit", this._submitAdventure.bind(this));
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

    this.#map = L.map("map", { zoomControl: false }).setView(coords, 13);

    L.control.zoom({ position: "topright" }).addTo(this.#map);

    L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
    }).addTo(this.#map);

    this.#map.on("click", this._renderForm.bind(this));
  }

  _renderForm(mapE) {
    console.log("hello");
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputActivity.focus();
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
      if (!activity.trim()) {
        alert("Please input your fun activity");
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
    inputActivity.value = inputCost.value = inputDuration.value = "";
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
      .setPopupContent("Adventure!")
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
}

const app = new App();
