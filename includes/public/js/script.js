'use strict';

// Global configuration object
let config;
let apis = [];

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });

// custom select variables
const select = document.querySelector("[data-select]");
const selectValue = document.querySelector("[data-selecct-value]");

// Utility function to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// Handle category selection (used by both dropdown and filter buttons)
function handleCategorySelection(selectedValue, element) {
  // Update select value display with capitalized text
  selectValue.innerText = selectedValue === 'all' ? 'Select category' : capitalizeFirstLetter(selectedValue);

  // Apply filter to items
  const filterItems = document.querySelectorAll("[data-filter-item]");
  filterItems.forEach(item => {
    if (selectedValue === "all" || item.dataset.category === selectedValue.toLowerCase()) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Update active state of filter buttons
  const filterButtons = document.querySelectorAll("[data-filter-btn]");
  filterButtons.forEach(btn => {
    btn.classList.toggle("active", btn.textContent.toLowerCase() === selectedValue.toLowerCase());
  });

  // Close dropdown if it's open
  if (select.classList.contains("active")) {
    elementToggleFunc(select);
  }
}

// Toggle dropdown when clicking the select button
select.addEventListener("click", function (e) {
  elementToggleFunc(this);
});

function setupCategoryFilter(apis) {
  // Get unique categories and capitalize them
  const categories = ['All', ...new Set(apis.map(api => capitalizeFirstLetter(api.category)))];
  const categoryFilter = document.getElementById('category-filter');
  const categorySelect = document.getElementById('category-select');

  // Clear existing items (except "All")
  while (categoryFilter.children.length > 1) {
    categoryFilter.removeChild(categoryFilter.lastChild);
  }
  while (categorySelect.children.length > 1) {
    categorySelect.removeChild(categorySelect.lastChild);
  }

  // Add category items
  categories.forEach((category, index) => {
    if (index > 0) { // Skip 'All' as it's already added
      // Add filter button
      const filterItem = document.createElement('li');
      filterItem.className = 'filter-item';
      const filterBtn = document.createElement('button');
      filterBtn.setAttribute('data-filter-btn', '');
      filterBtn.textContent = category;
      filterBtn.addEventListener('click', function() {
        handleCategorySelection(this.textContent.toLowerCase(), this);
      });
      filterItem.appendChild(filterBtn);
      categoryFilter.appendChild(filterItem);

      // Add select item
      const selectItem = document.createElement('li');
      selectItem.className = 'select-item';
      const selectBtn = document.createElement('button');
      selectBtn.setAttribute('data-select-item', '');
      selectBtn.textContent = category;
      selectBtn.addEventListener('click', function() {
        handleCategorySelection(this.textContent.toLowerCase(), this);
      });
      selectItem.appendChild(selectBtn);
      categorySelect.appendChild(selectItem);
    }
  });

  // Add click handler to "All" button
  const allFilterBtn = categoryFilter.querySelector("[data-filter-btn]");
  allFilterBtn.addEventListener('click', function() {
    handleCategorySelection('all', this);
  });

  // Add click handler to "All" select item
  const allSelectItem = categorySelect.querySelector("[data-select-item]");
  allSelectItem.addEventListener('click', function() {
    handleCategorySelection('all', this);
  });
}

// Display APIs with capitalized categories
function displayAPIs(apis) {
  const apiList = document.getElementById('api-list');
  apiList.innerHTML = '';

  apis.forEach(api => {
    const listItem = document.createElement('li');
    listItem.className = 'project-item active';
    listItem.setAttribute('data-filter-item', '');
    listItem.setAttribute('data-category', api.category.toLowerCase());

    listItem.innerHTML = `
  <h3 class="project-title">${api.name}</h3>
  <p class="project-category">${api.description}</p>
  <p class="project-method">${api.method.toUpperCase()}</p>
  <button class="try-button" onclick="tryAPI('${api.link[0]}')">Try it out</button>
`;
    apiList.appendChild(listItem);
  });
}

// page navigation
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

navigationLinks.forEach((link, index) => {
  link.addEventListener("click", function () {
    pages.forEach((page, pageIndex) => {
      if (index === pageIndex) {
        page.classList.add("active");
        link.classList.add("active");
        window.scrollTo(0, 0);
      } else {
        page.classList.remove("active");
        navigationLinks[pageIndex].classList.remove("active");
      }
    });
  });
});

// Function to try API
function tryAPI(apiLink) {
  // Navigate to the API without showing the loader
  window.location.href = `/api${apiLink}`;
}

// Functions for loading and displaying content
function showLoader() {
  document.getElementById('loader').style.display = 'flex';
  document.getElementById('content').classList.remove('visible');
}

function hideLoader() {
  document.getElementById('loader').style.display = 'none';
  document.getElementById('content').classList.add('visible');
}

async function fetchConfig() {
  try {
    showLoader();
    const response = await fetch('/config');
    config = await response.json();
    updateUIWithConfig();
    await fetchAPIList();
  } catch (error) {
    console.error('Error fetching config:', error);
  } finally {
    hideLoader();
  }
}

function updateUIWithConfig() {
  document.getElementById('page-title').textContent = config.name;
  document.getElementById('api-name').textContent = config.name;
  document.getElementById('api-description').textContent = config.description;
  document.getElementById('email-link').textContent = config.email;
  document.getElementById('email-link').href = `mailto:${config.email}`;
  document.getElementById('phone-link').textContent = config.number;
  document.getElementById('phone-link').href = `tel:${config.number}`;
  document.getElementById('birthday').textContent = config.birthday2;
  document.getElementById('birthday').setAttribute('datetime', config.birthday);
  document.getElementById('location').textContent = config.location;
  document.getElementById('facebook-link').href = config.facebook;
  document.getElementById('github-link').href = config.github;
  document.getElementById('twitter-link').href = config.twitter;
  document.getElementById('linkedin-link').href = config.linkedin;
  document.getElementById('about-title').textContent = `About ${config.name2}`;
  document.getElementById('about-text-1').textContent = `Welcome to ${config.name2}, a powerful and flexible REST API service designed to meet your data needs. Our API provides easy access to a wide range of endpoints, allowing you to integrate diverse functionalities into your applications seamlessly.`;
  document.getElementById('about-text-2').textContent = `Whether you're building web applications, mobile apps, or data-driven services, ${config.name2} offers robust solutions to enhance your development process. Explore our endpoints to discover how we can help you create more efficient and feature-rich applications.`;
}

async function updateAPIStatistics() {
  try {
    // Get total number of endpoints
    const totalEndpoints = apis.length;
    
    // Get unique categories
    const uniqueCategories = [...new Set(apis.map(api => api.category))];
    const totalCategories = uniqueCategories.length;
    
    // Update the statistics in the UI
    document.getElementById('total-endpoints').textContent = `${totalEndpoints} Available Endpoints`;
    document.getElementById('total-categories').textContent = `${totalCategories} Different Categories`;
  } catch (error) {
    console.error('Error updating API statistics:', error);
    document.getElementById('total-endpoints').textContent = 'Error loading data';
    document.getElementById('total-categories').textContent = 'Error loading data';
  }
}

async function fetchAPIList() {
  try {
    const response = await fetch('/api-list');
    apis = await response.json();
    displayAPIs(apis);
    setupCategoryFilter(apis);
    updateAPIStatistics(); // Add this line to update the statistics
  } catch (error) {
    console.error('Error fetching API list:', error);
  }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  fetchConfig();
  // Check if this is the main page
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    // Show loader on initial page load
    showLoader();
  } else {
    // Hide loader and show content immediately on other pages
    hideLoader();
  }
});