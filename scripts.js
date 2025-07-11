// Contact form handler
document.getElementById('contact-form')?.addEventListener('submit', function (e) {
  e.preventDefault();
  alert('Thanks! We’ll contact you soon.');
  this.reset();
});

// Cart functions
function addToCart(itemName, price) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(item => item.itemName === itemName);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ itemName, price, quantity: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  showToast(`${itemName} added to cart!`);
}

function displayCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const container = document.getElementById('cart-items');
  const totalBox = document.getElementById('total');
  if (!container || !totalBox) return;

  container.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    totalBox.textContent = '';
    return;
  }

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <p><strong>${item.itemName}</strong><br>GH₵ ${item.price} x ${item.quantity} = GH₵ ${itemTotal}</p>
      <div class="qty-controls">
        <button onclick="decreaseQty(${index})">−</button>
        <span>${item.quantity}</span>
        <button onclick="increaseQty(${index})">+</button>
        <button onclick="removeItem(${index})">🗑️</button>
      </div>
    `;
    container.appendChild(div);
  });

  totalBox.textContent = `Total: GH₵ ${total}`;
}

function increaseQty(index) {
  const cart = JSON.parse(localStorage.getItem('cart'));
  cart[index].quantity += 1;
  localStorage.setItem('cart', JSON.stringify(cart));
  displayCart();
}

function decreaseQty(index) {
  const cart = JSON.parse(localStorage.getItem('cart'));
  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
  } else {
    cart.splice(index, 1);
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  displayCart();
}

function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem('cart'));
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  displayCart();
}

function checkout() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) {
    alert('Your cart is empty.');
    return;
  }

  let message = "I'd like to order:\n";
  let total = 0;
  cart.forEach(item => {
    const subtotal = item.price * item.quantity;
    message += `- ${item.itemName} x ${item.quantity}: GH₵ ${subtotal}\n`;
    total += subtotal;
  });
  message += `Total: GH₵ ${total}`;

  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/233XXXXXXXXX?text=${encoded}`, '_blank'); // Replace number
  localStorage.removeItem('cart');
  updateCartCount();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const el = document.getElementById("cart-count");
  if (el) el.textContent = total;
}

// Run cart functions on load
window.onload = () => {
  if (typeof displayCart === "function") displayCart();
  updateCartCount();
};

// Generate unique order ID
function generateOrderID() {
  return 'PP-' + Math.floor(Math.random() * 1000000);
}

// ✅ Submit Checkout Form (Firebase)
document.getElementById("order-form")?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = this.name.value.trim();
  const phone = this.phone.value.trim();
  const location = this.location.value.trim();
  const notes = this.notes.value.trim();
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (!name || !phone || !location || cart.length === 0) {
    alert("Please complete the form and ensure cart is not empty.");
    return;
  }

  const orderID = generateOrderID();
  const orderData = {
    orderID,
    name,
    phone,
    location,
    notes,
    items: cart,
    status: "Received",
    createdAt: new Date().toISOString()
  };

  try {
    await db.collection("orders").doc(orderID).set(orderData);
    localStorage.removeItem("cart");
    updateCartCount();

    this.style.display = "none";
    document.getElementById("order-success").style.display = "block";
    document.getElementById("order-id").textContent = orderID;
  } catch (err) {
    console.error("Order submission failed:", err);
    alert("Something went wrong. Please try again.");
  }
});

// ✅ Track Order (Firebase)
document.getElementById("track-form")?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const orderID = document.getElementById("track-id").value.trim();
  const result = document.getElementById("status-result");
  if (!result || !orderID) return;

  try {
    const doc = await db.collection("orders").doc(orderID).get();

    if (!doc.exists) {
      result.innerHTML = `<p style="color:red;">❌ Order ID not found.</p>`;
      return;
    }

    const order = doc.data();
    result.innerHTML = `
      <h3>Status: ${order.status}</h3>
      <p><strong>Name:</strong> ${order.name}</p>
      <p><strong>Phone:</strong> ${order.phone}</p>
      <p><strong>Address:</strong> ${order.location}</p>
      <p><strong>Items:</strong><br>${order.items.map(i => `🍰 ${i.itemName} × ${i.quantity}`).join("<br>")}</p>
      <p><strong>Ordered:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
    `;
  } catch (err) {
    console.error("Error fetching order:", err);
    result.innerHTML = `<p style="color:red;">Something went wrong. Try again.</p>`;
  }
});
