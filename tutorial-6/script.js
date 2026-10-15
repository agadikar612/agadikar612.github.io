/*
  Local Plate — W6 Async/Await and APIs
  Concepts demonstrated:
  - fetch() + async/await
  - try/catch/finally error and loading-state management
  - forEach(): populate the cuisine filter
  - filter(): search, cuisine, and vegetarian filters
  - map(): render restaurant cards
  - find(): locate a featured restaurant for the page count/featured content
*/

"use strict";

const DATA_URL = "restaurants.json";

const statusEl = document.querySelector("#status");
const errorPanel = document.querySelector("#error-panel");
const errorMessage = document.querySelector("#error-message");
const controlsEl = document.querySelector("#controls");
const gridEl = document.querySelector("#restaurant-grid");
const emptyStateEl = document.querySelector("#empty-state");
const resultsCountEl = document.querySelector("#results-count");
const resultsTitleEl = document.querySelector("#results-title");
const heroCountEl = document.querySelector("#hero-count");
const searchInput = document.querySelector("#search-input");
const cuisineFilter = document.querySelector("#cuisine-filter");
const vegetarianFilter = document.querySelector("#vegetarian-filter");
const retryBtn = document.querySelector("#retry-btn");
const refreshBtn = document.querySelector("#refresh-btn");
const clearFiltersBtn = document.querySelector("#clear-filters-btn");

let allRestaurants = [];

const foodIcons = {
  American: "🍔",
  Indian: "🍛",
  Korean: "🍚",
  Healthy: "🥗",
  Italian: "🍝",
  Japanese: "🍣",
  Mexican: "🌮",
  Vietnamese: "🍜",
  Bakery: "🥐"
};

function setLoading(isLoading) {
  statusEl.hidden = !isLoading;
  errorPanel.hidden = true;
  statusEl.classList.toggle("status-loading", isLoading);
  gridEl.setAttribute("aria-busy", String(isLoading));
  refreshBtn.disabled = isLoading;
  retryBtn.disabled = isLoading;

  if (isLoading) {
    statusEl.innerHTML = '<span class="spinner" aria-hidden="true"></span><span>Loading restaurant data…</span>';
    controlsEl.hidden = true;
  }
}

function showError(message) {
  statusEl.hidden = true;
  errorPanel.hidden = false;
  errorMessage.textContent = message;
  controlsEl.hidden = true;
  gridEl.innerHTML = "";
  gridEl.setAttribute("aria-busy", "false");
  resultsCountEl.textContent = "Data unavailable";
  resultsTitleEl.textContent = "Restaurants are taking a break";
  emptyStateEl.hidden = true;
}

function populateCuisineFilter(restaurants) {
  const selectedCuisine = cuisineFilter.value;

  // forEach(): collect unique cuisine names from the fetched JSON data.
  const cuisines = [];
  restaurants.forEach((restaurant) => {
    if (!cuisines.includes(restaurant.cuisine)) {
      cuisines.push(restaurant.cuisine);
    }
  });

  cuisines.sort((a, b) => a.localeCompare(b));
  cuisineFilter.innerHTML = '<option value="all">All cuisines</option>';

  cuisines.forEach((cuisine) => {
    const option = document.createElement("option");
    option.value = cuisine;
    option.textContent = cuisine;
    cuisineFilter.appendChild(option);
  });

  cuisineFilter.value = cuisines.includes(selectedCuisine) ? selectedCuisine : "all";
}

function createRestaurantCard(restaurant) {
  const article = document.createElement("article");
  article.className = "restaurant-card";

  const art = document.createElement("div");
  art.className = "card-art";
  art.setAttribute("aria-hidden", "true");

  if (restaurant.featured) {
    const tag = document.createElement("span");
    tag.className = "featured-tag";
    tag.textContent = "LOCAL FAVORITE";
    art.appendChild(tag);
  }

  const emoji = document.createElement("span");
  emoji.className = "food-emoji";
  emoji.textContent = foodIcons[restaurant.cuisine] || "🍽️";
  art.appendChild(emoji);

  const body = document.createElement("div");
  body.className = "card-body";

  const titleRow = document.createElement("div");
  titleRow.className = "card-title-row";

  const title = document.createElement("h4");
  title.textContent = restaurant.name;

  const rating = document.createElement("span");
  rating.className = "rating";
  rating.textContent = `★ ${Number(restaurant.rating).toFixed(1)}`;
  rating.setAttribute("aria-label", `Rating ${Number(restaurant.rating).toFixed(1)} out of 5`);

  titleRow.append(title, rating);

  const meta = document.createElement("div");
  meta.className = "card-meta";
  [restaurant.cuisine, restaurant.price].forEach((label) => {
    const pill = document.createElement("span");
    pill.className = "pill";
    pill.textContent = label;
    meta.appendChild(pill);
  });

  const description = document.createElement("p");
  description.className = "card-description";
  description.textContent = restaurant.description;

  const footer = document.createElement("div");
  footer.className = "card-footer";

  const address = document.createElement("span");
  address.textContent = `⌖ ${restaurant.address}`;

  const veg = document.createElement("span");
  veg.className = restaurant.vegetarianOptions ? "veg-label" : "";
  veg.textContent = restaurant.vegetarianOptions ? "✓ Veg options" : "Menu";

  footer.append(address, veg);
  body.append(titleRow, meta, description, footer);
  article.append(art, body);
  return article;
}

function renderRestaurants() {
  const query = searchInput.value.trim().toLowerCase();
  const cuisine = cuisineFilter.value;
  const vegetarianOnly = vegetarianFilter.checked;

  // filter(): narrow the fetched data according to all selected controls.
  const filteredRestaurants = allRestaurants.filter((restaurant) => {
    const matchesSearch = [
      restaurant.name,
      restaurant.cuisine,
      restaurant.address,
      restaurant.description
    ].some((value) => String(value).toLowerCase().includes(query));

    const matchesCuisine = cuisine === "all" || restaurant.cuisine === cuisine;
    const matchesVegetarian = !vegetarianOnly || restaurant.vegetarianOptions;

    return matchesSearch && matchesCuisine && matchesVegetarian;
  });

  // map(): turn filtered restaurant objects into reusable card elements.
  const cards = filteredRestaurants.map(createRestaurantCard);
  gridEl.replaceChildren(...cards);
  gridEl.setAttribute("aria-busy", "false");

  resultsCountEl.textContent = `${filteredRestaurants.length} ${filteredRestaurants.length === 1 ? "place" : "places"}`;
  resultsTitleEl.textContent = query || cuisine !== "all" || vegetarianOnly ? "Your matches" : "Popular nearby";
  emptyStateEl.hidden = filteredRestaurants.length !== 0;
}

async function loadRestaurants() {
  setLoading(true);
  gridEl.innerHTML = "";
  emptyStateEl.hidden = true;
  resultsCountEl.textContent = "Loading…";

  try {
    // fetch() requests the JSON file; await waits for each asynchronous step.
    const response = await fetch(DATA_URL, { cache: "no-store" });

    // fetch does not reject automatically for HTTP errors such as 404.
    if (!response.ok) {
      throw new Error(`The server responded with status ${response.status}.`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("The restaurant file has an unexpected format.");
    }

    allRestaurants = data;
    populateCuisineFilter(allRestaurants);

    // find(): identify one featured restaurant as a simple data lookup example.
    const featuredRestaurant = allRestaurants.find((restaurant) => restaurant.featured);
    heroCountEl.textContent = String(allRestaurants.length);

    statusEl.hidden = false;
    statusEl.innerHTML = `<span aria-hidden="true">✓</span><span>Fresh list loaded${featuredRestaurant ? ` — featuring ${featuredRestaurant.name}` : ""}.</span>`;
    controlsEl.hidden = false;
    renderRestaurants();
  } catch (error) {
    console.error("Restaurant data could not be loaded:", error);
    showError("Please check your connection and make sure restaurants.json is published beside this page, then try again.");
  } finally {
    refreshBtn.disabled = false;
    retryBtn.disabled = false;
    gridEl.setAttribute("aria-busy", "false");
  }
}

searchInput.addEventListener("input", renderRestaurants);
cuisineFilter.addEventListener("change", renderRestaurants);
vegetarianFilter.addEventListener("change", renderRestaurants);
retryBtn.addEventListener("click", loadRestaurants);
refreshBtn.addEventListener("click", loadRestaurants);

clearFiltersBtn.addEventListener("click", () => {
  searchInput.value = "";
  cuisineFilter.value = "all";
  vegetarianFilter.checked = false;
  renderRestaurants();
});

loadRestaurants();
