"use strict";

import { products } from "./data.js";

let currentFilters = {
  category: "all",
  searchTerm: "",
  priceRange: "all",
  sortBy: "default",
};

let visibleProductsCount = 12;
const PRODUCTS_PER_LOAD = 12;

const displayOriginalPrice = (product) => {
  if (product.originalPrice) {
    return `<span class="product-card__price__former">
              <small><s>$${product.originalPrice.toFixed(2)}</s></small>
            </span>`;
  }
  return "";
};

const renderProduct = (product) => {
  return `<li>
    <article class="product-card">
      <img
        class="product-card__image"
        src="${product.image}"
        alt="${product.name} image"
        height="300"
        width="300"
      />
      ${product.onSale ? '<span class="product-card__label">Sale</span>' : ""}
      <h4 class="product-card__heading">${product.name}</h4>
      <p class="product-card__subheading">
        ${product.availability}
      </p>
      <p class="product-card__price">
        $${product.price.toFixed(2)}
        ${displayOriginalPrice(product)}
      </p>
      ${product.onSale ? '<p class="product-card__ad"><sup>Get 20% Off in App</sup></p>' : ""}
    </article>
  </li>`;
};

const filterProducts = () => {
  let filtered = [...products];

  if (currentFilters.category !== "all") {
    filtered = filtered.filter(
      (product) => product.category === currentFilters.category,
    );
  }

  if (currentFilters.searchTerm) {
    const searchLower = currentFilters.searchTerm.toLowerCase();
    filtered = filtered.filter((product) =>
      product.name.toLowerCase().includes(searchLower),
    );
  }

  if (currentFilters.priceRange !== "all") {
    const maxPrice = parseFloat(currentFilters.priceRange);
    filtered = filtered.filter((product) => product.price <= maxPrice);
  }

  switch (currentFilters.sortBy) {
    case "price-low":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "name-asc":
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "best":
      break;
    default:
      break;
  }

  return filtered;
};

const renderProducts = () => {
  const productsDOM = document.querySelector(".product-cards > ul");
  const loadMoreBtn = document.querySelector(".product-cards > button");

  const filteredProducts = filterProducts();
  const productsToShow = filteredProducts.slice(0, visibleProductsCount);

  const renderedProductsHTML = productsToShow
    .map((product) => renderProduct(product))
    .join("");

  productsDOM.innerHTML = renderedProductsHTML;

  if (filteredProducts.length > visibleProductsCount) {
    loadMoreBtn.style.display = "block";
  } else {
    loadMoreBtn.style.display = "none";
  }
};

const setupEventListeners = () => {
  const searchInput = document.querySelector("#form__search");
  const searchClearBtn = searchInput.closest("div").querySelector("button");

  searchInput.addEventListener("input", (e) => {
    currentFilters.searchTerm = e.target.value;
    visibleProductsCount = PRODUCTS_PER_LOAD;
    renderProducts();
  });

  searchClearBtn.addEventListener("click", (e) => {
    e.preventDefault();
    searchInput.value = "";
    currentFilters.searchTerm = "";
    visibleProductsCount = PRODUCTS_PER_LOAD;
    renderProducts();
  });

  const priceSelect = document.querySelector("#form__filter-price");
  const priceClearBtn = priceSelect.closest("div").querySelector("button");

  priceSelect.addEventListener("change", (e) => {
    currentFilters.priceRange = e.target.value;
    visibleProductsCount = PRODUCTS_PER_LOAD;
    renderProducts();
  });

  priceClearBtn.addEventListener("click", (e) => {
    e.preventDefault();
    priceSelect.value = "all";
    currentFilters.priceRange = "all";
    visibleProductsCount = PRODUCTS_PER_LOAD;
    renderProducts();
  });

  const sortSelect = document.querySelector("#form__sort");
  const sortClearBtn = sortSelect.closest("div").querySelector("button");

  sortSelect.addEventListener("change", (e) => {
    currentFilters.sortBy = e.target.value;
    renderProducts();
  });

  sortClearBtn.addEventListener("click", (e) => {
    e.preventDefault();
    sortSelect.value = "default";
    currentFilters.sortBy = "default";
    renderProducts();
  });

  const categoryButtons = document.querySelectorAll(
    ".menu-form__filters nav button",
  );

  categoryButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const categories = ["beverages", "food", "coffee-beans"];
      currentFilters.category = categories[index] || "all";
      visibleProductsCount = PRODUCTS_PER_LOAD;
      renderProducts();
    });
  });

  const loadMoreBtn = document.querySelector(".product-cards > button");
  loadMoreBtn.addEventListener("click", () => {
    visibleProductsCount += PRODUCTS_PER_LOAD;
    renderProducts();
  });
};

const setupPriceFilter = () => {
  const priceSelect = document.querySelector("#form__filter-price");
  priceSelect.innerHTML = `
    <option value="all">All Prices</option>
    <option value="10">Under $10</option>
    <option value="15">Under $15</option>
    <option value="20">Under $20</option>
    <option value="30">Under $30</option>
  `;
};

const setupSortFilter = () => {
  const sortSelect = document.querySelector("#form__sort");
  sortSelect.innerHTML = `
    <option value="default">Default</option>
    <option value="best">Best Selling</option>
    <option value="price-low">Price: Low to High</option>
    <option value="price-high">Price: High to Low</option>
    <option value="name-asc">Name: A to Z</option>
    <option value="name-desc">Name: Z to A</option>
  `;
};

const init = () => {
  setupPriceFilter();
  setupSortFilter();
  setupEventListeners();
  renderProducts();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
