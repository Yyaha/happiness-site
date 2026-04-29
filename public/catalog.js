let activeCategory = "all";

const categoryNames = {
  all: "Все товары",
  cleaning: "Очищение",
  recovery: "Восстановление и омоложение",
  care: "Ежедневный уход",
  family: "Товары для семьи"
};

async function loadProducts() {
  const res = await fetch("/products");
  const products = await res.json();

  setupFilters(products);
  renderProducts(products);
}

function setupFilters(products) {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;

      document.querySelectorAll(".filter-btn").forEach((b) => {
        b.classList.remove("active-filter");
      });

      btn.classList.add("active-filter");
      renderProducts(products);
    });
  });

  const searchInput = document.getElementById("catalogSearchInput");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderProducts(products);
    });
  }
}

function renderProducts(products) {
  const grid = document.getElementById("catalogGrid");
  const searchInput = document.getElementById("catalogSearchInput");

  const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : "";

  const filtered = products.filter((p) => {
    const categoryMatch =
      activeCategory === "all" || p.category === activeCategory;

    const searchText = `
      ${p.name || ""}
      ${p.code || ""}
      ${p.note || ""}
      ${categoryNames[p.category] || ""}
    `.toLowerCase();

    return categoryMatch && searchText.includes(searchValue);
  });

  grid.innerHTML = "";

  filtered.forEach((p) => {
    grid.innerHTML += `
      <article class="product-card">
        <div class="product-card__image">
          <img src="${p.image}" alt="${p.name}">
        </div>

        <div class="product-card__body">
          <span class="product-card__label">${categoryNames[p.category] || p.category}</span>

          <h3>${p.name}</h3>

          <div class="product-card__meta">
            <div><b>Код:</b> ${p.code || "—"}</div>
            <div><b>SV:</b> ${p.sv || "—"}</div>
            <div><b>Описание:</b> ${p.note || "—"}</div>
          </div>

          <div class="product-card__bottom">
            <strong>${Number(p.price).toLocaleString("ru-RU")} ₸</strong>
            <button onclick="orderProduct('${p.name}')">Заказать</button>
          </div>
        </div>
      </article>
    `;
  });

  if (!filtered.length) {
    grid.innerHTML = `<p class="empty-text">Товары не найдены</p>`;
  }
}

function orderProduct(name) {
  const text = encodeURIComponent("Здравствуйте! Хочу заказать: " + name);
  window.open("https://wa.me/87762704482?text=" + text, "_blank");
}

loadProducts();