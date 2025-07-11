// ✅ Firebase Initialization (placed at top of scripts.js)
const firebaseConfig = {
  apiKey: "AIzaSyAcEH9FhuXWVkLfixJKd6n9PBmX0ighxzc",
  authDomain: "pinamanpastries.firebaseapp.com",
  projectId: "pinamanpastries",
  storageBucket: "pinamanpastries.firebasestorage.app",
  messagingSenderId: "639575297353",
  appId: "1:639575297353:web:285be2a07a7718d650de98"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // ✅ Make Firestore instance available

// ✅ Toast notification
function showToast(message) {
  alert(message); // You can replace this with a nice toast UI later
}

// ✅ Update cart count in navbar
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const el = document.getElementById("cart-count");
  if (el) el.textContent = total;
}

// ✅ On page load
window.onload = function () {
  if (window.location.pathname.includes("cart.html")) {
    displayCart();
  }
  updateCartCount();
};

// ✅ Add to Cart
function addToCart(itemName, price) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find(item => item.itemName === itemName);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ itemName, price, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showToast(`${itemName} added to cart!`);
}

// ✅ Display Cart
function displayCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cart-items");
  const totalBox = document.getElementById("total");
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

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="cart-info">
        <strong>${item.itemName}</strong><br>
        GH₵ ${item.price} × ${item.quantity} = GH₵ ${itemTotal.toFixed(2)}
      </div>
      <div class="qty-controls">
        <button onclick="decreaseQty(${index})">−</button>
        <span>${item.quantity}</span>
        <button onclick="increaseQty(${index})">+</button>
        <button onclick="removeItem(${index})">🗑️</button>
      </div>
    `;
    container.appendChild(div);
  });

  totalBox.textContent = `Total: GH₵ ${total.toFixed(2)}`;
}

// ✅ Increase Qty
function increaseQty(index) {
  const cart = JSON.parse(localStorage.getItem("cart"));
  cart[index].quantity += 1;
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
  updateCartCount();
}

// ✅ Decrease Qty
function decreaseQty(index) {
  const cart = JSON.parse(localStorage.getItem("cart"));
  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
  } else {
    cart.splice(index, 1);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
  updateCartCount();
}

// ✅ Remove Item
function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem("cart"));
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
  updateCartCount();
}

// ✅ Generate Order ID
function generateOrderID() {
  return "PP-" + Math.floor(Math.random() * 1000000);
}

// ✅ Handle Checkout Form Submission
document.getElementById("order-form")?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = this.name.value.trim();
  const phone = this.phone.value.trim();
  const location = this.location.value.trim();
  const notes = this.notes.value.trim();
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (!name || !phone || !location || cart.length === 0) {
    alert("Please fill out all fields and ensure your cart is not empty.");
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

    document.getElementById("order-form").style.display = "none";
    document.getElementById("order-success").style.display = "block";
    document.getElementById("order-id").textContent = orderID;
  } catch (err) {
    console.error("Error saving order:", err);
    alert("Failed to submit order. Please try again.");
  }
});
