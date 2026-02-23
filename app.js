const PRODUCTS_URL = "products.json";
const RATE_URL = "rate.json";

const grid = document.getElementById("product-grid");
const rateStatus = document.getElementById("rate-status");
const errorMessage = document.getElementById("error-message");
const modal = document.getElementById("product-modal");
const modalImage = document.getElementById("modal-image");
const modalTitle = document.getElementById("modal-title");
const modalPrice = document.getElementById("modal-price");
const modalDescription = document.getElementById("modal-description");
const modalUsd = document.getElementById("modal-usd");

const formatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

function formatArs(value) {
  return formatter.format(Math.round(value));
}

function setError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

function clearError() {
  errorMessage.textContent = "";
  errorMessage.classList.add("hidden");
}

function createCard(product, rate) {
  const card = document.createElement("article");
  card.className = "card";
  card.tabIndex = 0;
  card.setAttribute("role", "button");

  const img = document.createElement("img");
  img.className = "card-image";
  img.src = product.images[0] || "";
  img.alt = product.title;
  img.loading = "lazy";

  const title = document.createElement("h3");
  title.className = "card-title";
  title.textContent = product.title;

  const price = document.createElement("p");
  price.className = "card-price";
  price.textContent = formatArs(product.price_usd * rate.final_rate);

  const usd = document.createElement("p");
  usd.className = "card-usd";
  usd.textContent = `USD ${product.price_usd.toFixed(2)}`;

  card.append(img, title, price, usd);
  card.addEventListener("click", () => openModal(product, rate));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openModal(product, rate);
    }
  });

  return card;
}

function openModal(product, rate) {
  modalImage.src = product.images[0] || "";
  modalImage.alt = product.title;
  modalTitle.textContent = product.title;
  modalPrice.textContent = formatArs(product.price_usd * rate.final_rate);
  modalDescription.textContent = product.description;
  modalUsd.textContent = `USD ${product.price_usd.toFixed(2)} · Actualizado ${formatDate(rate.updated_at)}`;

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function formatDate(isoDate) {
  if (!isoDate) return "sin fecha";
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function bindModalEvents() {
  modal.addEventListener("click", (event) => {
    const shouldClose = event.target.matches("[data-close='true']");
    if (shouldClose) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });
}

async function loadCatalog() {
  try {
    clearError();
    const [productsResponse, rateResponse] = await Promise.all([
      fetch(PRODUCTS_URL),
      fetch(RATE_URL),
    ]);

    if (!productsResponse.ok) {
      throw new Error("No se pudo cargar products.json");
    }

    if (!rateResponse.ok) {
      throw new Error("No se pudo cargar rate.json");
    }

    const products = await productsResponse.json();
    const rate = await rateResponse.json();

    rateStatus.textContent = `Tipo de cambio aplicado: ${formatArs(rate.final_rate)} · ${formatDate(rate.updated_at)}`;
    grid.innerHTML = "";

    products.forEach((product) => {
      grid.appendChild(createCard(product, rate));
    });
  } catch (error) {
    rateStatus.textContent = "No se pudo obtener el precio.";
    setError("Hubo un problema cargando el catálogo. Reintentá más tarde.");
    console.error(error);
  }
}

bindModalEvents();
loadCatalog();
