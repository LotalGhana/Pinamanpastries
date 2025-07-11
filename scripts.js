// Toast notification (optional later)
function showToast(message) {
  alert(message); // You can replace with animated toast later
}

// Track cart count across pages
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const el = document.getElementById("cart-count");
  if (el) el.textContent = total;
}

// Load on all pages
window.onload = () => {
  updateCartCount();
};
