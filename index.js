document.addEventListener("DOMContentLoaded", function () {
  showPromo();
});

function showPromo() {
  function loadingText() {
    const loadingText = document.createElement("h2");
    loadingText.classList.add("loading-text");

    let valueText = "Loading...";
    let i = 0;

    function showText() {
      if (i < valueText.length) {
        loadingText.textContent += valueText.charAt(i);
        i++;
        setTimeout(showText, 100);
      }
    }
    showText();
    document.body.appendChild(loadingText);
  }

  loadingText();
  document.body.style.backgroundImage = "url(./bg-anim.gif)";

  function changeBackground() {
    document.body.style.backgroundImage = "";
    document.body.innerHTML = "";
    createCryptoTracker(); // Create the interface after clearing the DOM
  }

  setTimeout(changeBackground, 2500);
}

function createCryptoTracker() {
  const container = document.createElement("div");
  container.className = "container";

  gsap.from(container, { opacity: 0, y: -50, duration: 2, delay: 0.5 });

  const title = document.createElement("h1");
  title.textContent = "Crypto Tracker";
  container.appendChild(title);

  const searchBox = document.createElement("div");
  searchBox.className = "search-box";

  const inputBox = document.createElement("div");
  inputBox.id = "inputBox";

  const input = document.createElement("input");
  input.type = "text";
  input.id = "input";
  input.placeholder = "Enter cryptocurrency name or symbol...";
  inputBox.appendChild(input);

  const placeholderText = input.getAttribute("placeholder");

  gsap.from(input, {
    x: -30,
    duration: 1.5,
    opacity: 0,
    scale: 0.8,
  });

  function animatePlaceholder() {
    input.setAttribute("placeholder", "");

    gsap.to(input, {
      delay: 1,
      duration: 2,
      ease: "none",
      placeholder: placeholderText,
      onUpdate: function () {
        input.setAttribute(
          "placeholder",
          this.vars.placeholder.substr(
            0,
            Math.ceil(this.progress() * placeholderText.length)
          )
        );
      },
    });
  }

  animatePlaceholder();

  const dropdown = document.createElement("div");
  dropdown.id = "dropdown";
  inputBox.appendChild(dropdown);

  searchBox.appendChild(inputBox);

  const button = document.createElement("button");
  button.id = "button";
  button.textContent = "Get Info";
  searchBox.appendChild(button);

  gsap.from(button, {
    x: -30,
    duration: 1.5,
    opacity: 0,
    scale: 0.8,
  });

  container.appendChild(searchBox);

  const cryptoInfo = document.createElement("div");
  cryptoInfo.className = "crypto-info";

  function createInfoItem(labelText, id) {
    const infoItem = document.createElement("div");
    infoItem.className = "info-item";

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = labelText;
    infoItem.appendChild(label);

    const value = document.createElement("span");
    value.className = "value";
    value.id = id;
    infoItem.appendChild(value);

    return infoItem;
  }

  cryptoInfo.appendChild(createInfoItem("Name:", "name"));
  cryptoInfo.appendChild(createInfoItem("Price (USD):", "price"));
  cryptoInfo.appendChild(createInfoItem("Symbol:", "symbol"));
  cryptoInfo.appendChild(createInfoItem("24h Change:", "changes"));
  cryptoInfo.appendChild(createInfoItem("Max Price (All Time):", "maxPrice"));
  cryptoInfo.appendChild(
    createInfoItem("Recommended Start Selling Price:", "recommendedPrice")
  );

  container.appendChild(cryptoInfo);

  document.body.appendChild(container);

  const inputElem = document.querySelector("#input");
  const buttonElem = document.querySelector("#button");

  if (inputElem && buttonElem) {
    inputElem.addEventListener("input", showResult);
    buttonElem.addEventListener("click", showInfo);
  } else {
    console.error("Input or Button element not found");
  }

  // Call showInfo with default value after elements are created
  showInfo("bitcoin");
}

let assets = [];
const assetsUrl = "https://api.coincap.io/v2/assets";

async function fetchAssets() {
  try {
    const response = await fetch(assetsUrl);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch assets");
    }
    assets = result.data; // Save the list of all currencies
  } catch (error) {
    console.error("Error:", error);
  }
}

async function showResult() {
  const input = document.querySelector("#input");
  const dropdown = document.querySelector("#dropdown");
  const inputValue = input.value.toLowerCase();
  dropdown.innerHTML = ""; // Clear current dropdown content

  if (!inputValue) {
    dropdown.style.display = "none";
    return;
  }

  if (assets.length === 0) {
    await fetchAssets();
  }

  const filteredArr = assets.filter(
    (item) =>
      item.name.toLowerCase().includes(inputValue) ||
      item.symbol.toLowerCase().includes(inputValue)
  );

  if (filteredArr.length > 0) {
    filteredArr.forEach((item) => {
      const div = document.createElement("div");
      div.textContent = `${item.name} (${item.symbol})`;
      div.addEventListener("click", () => {
        gsap.to(div, { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1 });
        input.value = item.name;
        dropdown.style.display = "none";
        showInfo(item.id); // Show info when an item from the dropdown is clicked
      });
      dropdown.appendChild(div);
    });

    dropdown.style.display = "block"; // Show dropdown
  } else {
    dropdown.style.display = "none"; // Hide dropdown if no matches found
  }
}

function showDropdown() {
  const dropdown = document.querySelector("#dropdown");
  if (dropdown.innerHTML.trim() !== "") {
    dropdown.style.display = "block";
  }
}

function hideDropdownOnClickOutside(event) {
  const input = document.querySelector("#input");
  const dropdown = document.querySelector("#dropdown");
  if (!input.contains(event.target) && !dropdown.contains(event.target)) {
    dropdown.style.display = "none";
  }
}

// Initialize elements and events
document.addEventListener("click", hideDropdownOnClickOutside);

async function showInfo(defaultId = "bitcoin") {
  const input = document.querySelector("#input");

  if (!input) {
    console.error("Input element not found");
    return;
  }

  const searchValue = input.value.trim().toLowerCase() || defaultId;

  if (assets.length === 0) {
    await fetchAssets();
  }

  const asset = assets.find(
    (a) =>
      a.id.toLowerCase() === searchValue ||
      a.symbol.toLowerCase() === searchValue ||
      a.name.toLowerCase() === searchValue
  );

  if (!asset) {
    document.querySelector("#name").textContent = "Asset not found";
    document.querySelector("#price").textContent = "";
    document
      .querySelector("#price")
      .style.setProperty("--trend-image", 'url("")');
    document.querySelector("#symbol").textContent = "";
    document.querySelector("#changes").textContent = "";
    document
      .querySelector("#changes")
      .style.setProperty("--trend-image", 'url("")');
    document.querySelector("#maxPrice").textContent = "";
    document.querySelector("#recommendedPrice").textContent = "";
    return;
  }

  try {
    const url = `${assetsUrl}/${asset.id}`;
    const serResult = await fetch(url);
    const result = await serResult.json();
    if (!serResult.ok) {
      throw new Error(result.error || "Failed to fetch asset details");
    }

    const name = document.querySelector("#name");
    const price = document.querySelector("#price");
    const symbol = document.querySelector("#symbol");
    const changes = document.querySelector("#changes");

    changes.classList.remove("animated-border-red", "animated-border-green");
    price.classList.remove("animated-border-red", "animated-border-green");

    name.textContent = result.data.name;
    price.textContent = `$${parseFloat(result.data.priceUsd).toFixed(2)}`;
    symbol.textContent = result.data.symbol;

    let changePercent = parseFloat(result.data.changePercent24Hr).toFixed(2);
    changes.textContent = `${changePercent}%` || "N/A";

    setTimeout(() => {
      if (changePercent < 0) {
        changes.style.setProperty("--trend-image", 'url("trend-down.png")');
        price.style.setProperty("--trend-image", 'url("trend-down.png")');
        changes.classList.add("animated-border-red");
        price.classList.add("animated-border-red");
      } else {
        changes.style.setProperty("--trend-image", 'url("trend-up.png")');
        price.style.setProperty("--trend-image", 'url("trend-up.png")');
        changes.classList.add("animated-border-green");
        price.classList.add("animated-border-green");
      }
    }, 100);

    maxPrice(result.data.id);
  } catch (error) {
    console.error("Error:", error);
    document.querySelector("#name").textContent = "Error";
    document.querySelector("#price").textContent = "";
    document.querySelector("#symbol").textContent = "";
    document.querySelector("#changes").textContent = "";
    document.querySelector("#maxPrice").textContent = "";
  }
}

async function maxPrice(id) {
  const endDate = new Date().toISOString(); // Current date
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 10); // Date 10 years ago
  const startDateISO = startDate.toISOString();

  const startUnix = new Date(startDateISO).getTime();
  const endUnix = new Date(endDate).getTime();

  const response = await fetch(
    `https://api.coincap.io/v2/assets/${id}/history?interval=d1&start=${startUnix}&end=${endUnix}`
  );
  const result = await response.json();

  const prices = result.data.map((entry) => entry.priceUsd);
  const maxPrice = Math.max(...prices);

  const maxPriceEver = document.querySelector("#maxPrice");
  const recommendedPrice = document.querySelector("#recommendedPrice");

  // Set max price
  let priceRes = parseFloat(maxPrice).toFixed(2);
  if (maxPriceEver) {
    maxPriceEver.textContent = `$${priceRes}`;

    // Force style recalculation
    maxPriceEver.classList.remove("animated-border-red");
    void maxPriceEver.offsetWidth; // This access forces a style recalculation

    setInterval(() => maxPriceEver.classList.add("animated-border-red"), 4000);
  }

  // Set recommended price
  let recommendedPriceValue = (parseFloat(maxPrice) * 0.75).toFixed(2);
  if (recommendedPrice) {
    recommendedPrice.textContent = `$${recommendedPriceValue}`;
  }
}
