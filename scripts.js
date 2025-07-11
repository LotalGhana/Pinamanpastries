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

function showToast(message) {
  alert(message); // Replace with animation later if needed
}


