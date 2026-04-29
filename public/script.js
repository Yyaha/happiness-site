const WHATSAPP_NUMBER = "87762704482";

const categoryNames = {
  cleaning: "Очищение",
  recovery: "Восстановление и омоложение",
  care: "Ежедневный уход",
  family: "Товары для семьи"
};

async function loadHomeProducts() {
  const res = await fetch("/products");
  const products = await res.json();

  fillProductSelect(products);
  renderPreviewProducts(products);
}

function formatPrice(price) {
  return Number(price).toLocaleString("ru-RU") + " ₸";
}

function renderPreviewProducts(products) {
  const previewGrid = document.getElementById("previewGrid");
  if (!previewGrid) return;

  previewGrid.innerHTML = "";

  products.slice(0, 6).forEach((p) => {
    previewGrid.innerHTML += `
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
            <strong>${formatPrice(p.price)}</strong>
            <button onclick="selectProduct('${p.name}')">Заказать</button>
          </div>
        </div>
      </article>
    `;
  });
}

function fillProductSelect(products) {
  const productInput = document.getElementById("productInput");
  if (!productInput) return;

  productInput.innerHTML = `<option value="">Выберите товар</option>`;

  products.forEach((p) => {
    productInput.innerHTML += `
      <option value="${p.name}">${p.name} — ${formatPrice(p.price)}</option>
    `;
  });
}

function selectProduct(name) {
  const productInput = document.getElementById("productInput");
  const orderSection = document.getElementById("order");

  if (productInput) productInput.value = name;
  if (orderSection) orderSection.scrollIntoView({ behavior: "smooth" });
}

const orderForm = document.getElementById("orderForm");

if (orderForm) {
  orderForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const product = document.getElementById("productInput").value;
    const quantity = document.getElementById("quantity").value;
    const city = document.getElementById("city").value;
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const method = document.querySelector('input[name="contactMethod"]:checked').value;

    const text = encodeURIComponent(
      `Здравствуйте! Хочу оформить заказ HAPPINESS:%0A` +
      `Товар: ${product}%0A` +
      `Количество: ${quantity}%0A` +
      `Город: ${city}%0A` +
      `Имя: ${name}%0A` +
      `Телефон: ${phone}%0A` +
      `Способ связи: ${method}%0A` +
      `Адрес/комментарий: ${address}`
    );

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  });
}

const burgerBtn = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (burgerBtn && mobileMenu) {
  burgerBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");
  });
}

document.querySelectorAll(".section-reveal").forEach((item) => {
  item.classList.add("visible");
});

loadHomeProducts();