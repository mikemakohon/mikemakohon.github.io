"use strict";

import { ProductsAPI } from "./api.js";

const API_URL = "https://698ed778aded595c2532fa07.mockapi.io/api/v1/products";
const api = new ProductsAPI(API_URL);

let allProducts = [];
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

const getSortParams = (sortBy) => {
  const sortMapping = {
    default: { sortBy: "id", order: "asc" },
    best: { sortBy: "id", order: "asc" },
    "price-low": { sortBy: "price", order: "asc" },
    "price-high": { sortBy: "price", order: "desc" },
    "name-asc": { sortBy: "name", order: "asc" },
    "name-desc": { sortBy: "name", order: "desc" },
  };

  return sortMapping[sortBy] || sortMapping["default"];
};

const loadProducts = async () => {
  try {
    const apiFilters = {};

    if (currentFilters.category !== "all") {
      apiFilters.category = currentFilters.category;
    }

    const sortParams = getSortParams(currentFilters.sortBy);
    apiFilters.sortBy = sortParams.sortBy;
    apiFilters.order = sortParams.order;

    let products = await api.getAll(apiFilters);

    const clientFilters = {};

    if (currentFilters.searchTerm) {
      clientFilters.search = currentFilters.searchTerm;
    }

    if (currentFilters.priceRange !== "all") {
      clientFilters.maxPrice = currentFilters.priceRange;
    }

    products = api.applyClientFilters(products, clientFilters);

    allProducts = products;
    visibleProductsCount = PRODUCTS_PER_LOAD;
    renderProducts();
  } catch (error) {
    console.error("Error loading products:", error);
  }
};

const renderProducts = () => {
  const productsDOM = document.querySelector(".product-cards > ul");
  const loadMoreBtn = document.querySelector(".product-cards > button");

  const productsToShow = allProducts.slice(0, visibleProductsCount);

  if (productsToShow.length === 0) {
    productsDOM.innerHTML =
      '<li style="grid-column: 1/-1; text-align: center; padding: 2rem;"><p>No products found matching your filters.</p></li>';
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
    return;
  }

  const renderedProductsHTML = productsToShow
    .map((product) => renderProduct(product))
    .join("");

  productsDOM.innerHTML = renderedProductsHTML;

  if (loadMoreBtn) {
    if (allProducts.length > visibleProductsCount) {
      loadMoreBtn.style.display = "block";
    } else {
      loadMoreBtn.style.display = "none";
    }
  }
};

const setupEventListeners = () => {
  const searchInput = document.getElementById("form__search");
  const searchClearBtn = searchInput?.closest("div")?.querySelector("button");

  if (searchInput) {
    searchInput.addEventListener("input", async (e) => {
      currentFilters.searchTerm = e.target.value;
      await loadProducts();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (searchInput) searchInput.value = "";
      currentFilters.searchTerm = "";
      await loadProducts();
    });
  }

  const priceSelect = document.getElementById("form__filter-price");
  const priceClearBtn = priceSelect?.closest("div")?.querySelector("button");

  if (priceSelect) {
    priceSelect.addEventListener("change", async (e) => {
      currentFilters.priceRange = e.target.value;
      await loadProducts();
    });
  }

  if (priceClearBtn) {
    priceClearBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (priceSelect) priceSelect.value = "all";
      currentFilters.priceRange = "all";
      await loadProducts();
    });
  }

  const sortSelect = document.getElementById("form__sort");
  const sortClearBtn = sortSelect?.closest("div")?.querySelector("button");

  if (sortSelect) {
    sortSelect.addEventListener("change", async (e) => {
      currentFilters.sortBy = e.target.value;
      await loadProducts();
    });
  }

  if (sortClearBtn) {
    sortClearBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (sortSelect) sortSelect.value = "default";
      currentFilters.sortBy = "default";
      await loadProducts();
    });
  }

  const categoryButtons = document.querySelectorAll(
    ".menu-form__filters nav button",
  );

  categoryButtons.forEach((button, index) => {
    button.addEventListener("click", async () => {
      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const categories = ["beverages", "food", "coffee-beans"];
      currentFilters.category = categories[index] || "all";

      await loadProducts();
    });
  });

  const loadMoreBtn = document.querySelector(".product-cards > button");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      visibleProductsCount += PRODUCTS_PER_LOAD;
      renderProducts();
    });
  }
};

const setupPriceFilter = () => {
  const priceSelect = document.getElementById("form__filter-price");
  if (priceSelect) {
    priceSelect.innerHTML = `
      <option value="all">All Prices</option>
      <option value="10">Under $10</option>
      <option value="15">Under $15</option>
      <option value="20">Under $20</option>
      <option value="30">Under $30</option>
    `;
  }
};

const setupSortFilter = () => {
  const sortSelect = document.getElementById("form__sort");
  if (sortSelect) {
    sortSelect.innerHTML = `
      <option value="default">Default</option>
      <option value="best">Best Selling</option>
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
      <option value="name-asc">Name: A to Z</option>
      <option value="name-desc">Name: Z to A</option>
    `;
  }
};

const init = async () => {
  setupPriceFilter();
  setupSortFilter();
  setupEventListeners();
  await loadProducts();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
