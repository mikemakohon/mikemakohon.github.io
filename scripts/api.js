"use strict";

export class ProductsAPI {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async fetch(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  buildQueryString(params) {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value);
      }
    });

    return queryParams.toString();
  }

  async getAll(filters = {}) {
    const queryString = this.buildQueryString(filters);
    const url = `${this.baseURL}${queryString ? "?" + queryString : ""}`;

    return await this.fetch(url);
  }

  async getById(id) {
    const url = `${this.baseURL}/${id}`;

    return await this.fetch(url);
  }

  async create(productData) {
    const url = this.baseURL;

    return await this.fetch(url, {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  async update(id, productData) {
    const url = `${this.baseURL}/${id}`;

    return await this.fetch(url, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  }

  async delete(id) {
    const url = `${this.baseURL}/${id}`;

    return await this.fetch(url, {
      method: "DELETE",
    });
  }

  filterBySearch(products, searchTerm) {
    if (!searchTerm) return products;

    const searchLower = searchTerm.toLowerCase();
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchLower),
    );
  }

  filterByPrice(products, maxPrice) {
    if (!maxPrice || maxPrice === "all") return products;

    return products.filter((product) => product.price <= parseFloat(maxPrice));
  }

  applyClientFilters(products, filters = {}) {
    let filtered = [...products];

    if (filters.search) {
      filtered = this.filterBySearch(filtered, filters.search);
    }

    if (filters.maxPrice) {
      filtered = this.filterByPrice(filtered, filters.maxPrice);
    }

    return filtered;
  }
}
