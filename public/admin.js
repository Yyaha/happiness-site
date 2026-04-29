const form = document.getElementById("productForm");
const statusText = document.getElementById("adminStatus");
const list = document.getElementById("adminProductsList");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

let productsCache = [];

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const productId = document.getElementById("productId").value;
  const formData = new FormData(form);

  statusText.textContent = productId ? "Сохраняем изменения..." : "Добавляем товар...";

  const url = productId ? "/products/" + productId : "/add-product";
  const method = productId ? "PUT" : "POST";

  const res = await fetch(url, {
    method: method,
    body: formData
  });

  const data = await res.json();

  if (data.success) {
    statusText.textContent = productId ? "Товар обновлён!" : "Товар добавлен!";
    resetForm();
    loadAdminProducts();
  } else {
    statusText.textContent = "Ошибка: " + data.error;
  }
});

async function loadAdminProducts() {
  const res = await fetch("/products");
  const products = await res.json();

  productsCache = products;
  list.innerHTML = "";

  products.forEach((product) => {
    list.innerHTML += `
      <div class="admin-product-card">
        <img src="${product.image}" alt="${product.name}">

        <div>
          <h3>${product.name}</h3>
          <p><b>Код:</b> ${product.code || "—"}</p>
          <p><b>Цена:</b> ${Number(product.price).toLocaleString("ru-RU")} ₸</p>
          <p><b>SV:</b> ${product.sv || "—"}</p>
          <p><b>Категория:</b> ${getCategoryName(product.category)}</p>
          <p><b>Описание:</b> ${product.note || "—"}</p>
        </div>

        <div class="admin-actions">
          <button class="edit-btn" onclick="editProduct(${product.id})">Редактировать</button>
          <button class="delete-btn" onclick="deleteProduct(${product.id})">Удалить</button>
        </div>
      </div>
    `;
  });
}

function editProduct(id) {
  const product = productsCache.find((p) => p.id === id);
  if (!product) return;

  document.getElementById("productId").value = product.id;
  document.getElementById("name").value = product.name || "";
  document.getElementById("code").value = product.code || "";
  document.getElementById("price").value = product.price || "";
  document.getElementById("sv").value = product.sv || "";
  document.getElementById("category").value = product.category || "cleaning";
  document.getElementById("note").value = product.note || "";

  submitBtn.textContent = "Сохранить изменения";
  cancelEditBtn.style.display = "block";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

cancelEditBtn.addEventListener("click", resetForm);

function resetForm() {
  form.reset();
  document.getElementById("productId").value = "";
  submitBtn.textContent = "Добавить товар";
  cancelEditBtn.style.display = "none";
}

async function deleteProduct(id) {
  const confirmDelete = confirm("Удалить товар?");
  if (!confirmDelete) return;

  const res = await fetch("/products/" + id, {
    method: "DELETE"
  });

  const data = await res.json();

  if (data.success) {
    loadAdminProducts();
  } else {
    alert("Ошибка удаления");
  }
}

function getCategoryName(category) {
  const names = {
    cleaning: "Очищение",
    recovery: "Восстановление и омоложение",
    care: "Ежедневный уход",
    family: "Товары для семьи"
  };

  return names[category] || category;
}

loadAdminProducts();