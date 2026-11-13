
const products = [
    {
        id: 1,
        name: "Wireless Earbuds",
        category: "Tech",
        price: 1999,
        oldPrice: 2999,
        tag: "BESTSELLER",
        image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600"
    },
    {
        id: 2,
        name: "Smart Watch",
        category: "Tech",
        price: 2999,
        oldPrice: 3999,
        tag: "TRENDING",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
    },
    {
        id: 3,
        name: "Running Shoes",
        category: "Style",
        price: 1499,
        oldPrice: 2199,
        tag: "NEW",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"
    },
    {
        id: 4,
        name: "Backpack",
        category: "Everyday",
        price: 1299,
        oldPrice: 1899,
        tag: "POPULAR",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"
    },
    {
        id: 5,
        name: "Headphones",
        category: "Tech",
        price: 2499,
        oldPrice: 3499,
        tag: "SALE",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
    },
    {
        id: 6,
        name: "Sunglasses",
        category: "Style",
        price: 899,
        oldPrice: 1299,
        tag: "SUMMER PICK",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600"
    },
    {
        id: 7,
        name: "Water Bottle",
        category: "Everyday",
        price: 599,
        oldPrice: 799,
        tag: "ECO PICK",
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600"
    },
    {
        id: 8,
        name: "Desk Lamp",
        category: "Everyday",
        price: 1799,
        oldPrice: 2399,
        tag: "DESIGN PICK",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600"
    }
];

const $ = selector => document.querySelector(selector);

const money = amount =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);

let cart = loadCart();
let activeCategory = "All";
let searchTerm = "";
let sortMode = "featured";
let toastTimer;

function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem("shopeasy-cart") || "[]");

        if (!Array.isArray(saved)) return [];

        return saved.filter(item =>
            products.some(p => p.id === item.id) &&
            Number.isInteger(item.qty) &&
            item.qty > 0
        );
    } catch {
        return [];
    }
}

function saveCart() {
    localStorage.setItem("shopeasy-cart", JSON.stringify(cart));
}

function getProduct(id) {
    return products.find(product => product.id === id);
}

function cartQuantity() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

function cartTotal() {
    return cart.reduce((sum, item) =>
        sum + getProduct(item.id).price * item.qty, 0
    );
}

// DISPLAY PRODUCTS

function renderProducts() {
    let filtered = products.filter(product => {
        const categoryMatch =
            activeCategory === "All" ||
            product.category === activeCategory;

        const searchMatch =
            product.name.toLowerCase().includes(searchTerm);

        return categoryMatch && searchMatch;
    });

    if (sortMode === "low") {
        filtered.sort((a, b) => a.price - b.price);
    }

    if (sortMode === "high") {
        filtered.sort((a, b) => b.price - a.price);
    }

    if (sortMode === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    $("#resultCount").textContent = `${filtered.length} Products`;

    $("#emptyResults").classList.toggle(
        "hidden",
        filtered.length !== 0
    );

    $("#productGrid").innerHTML = filtered.map(product => `
        <article class="product-card">
            <div class="product-image">
                <img src="${product.image}"
                     alt="${product.name}"
                     loading="lazy"
                     onerror="this.src='https://placehold.co/600x500/f1edff/6544d8?text=ShopEasy'">
                <span class="product-tag">${product.tag}</span>
            </div>

            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3>${product.name}</h3>

                <div class="price-row">
                    <span class="price">${money(product.price)}</span>
                    <span class="old-price">${money(product.oldPrice)}</span>
                </div>

                <button class="add-button" data-add="${product.id}">
                    + Add to Cart
                </button>
            </div>
        </article>
    `).join("");
}

// ADD TO CART

function addToCart(id) {
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id, qty: 1 });
    }

    saveCart();
    renderCart();

    showToast(`${getProduct(id).name} added to cart!`);
}

// CART DISPLAY

function renderCart() {
    $("#cartCount").textContent = cartQuantity();

    $("#cartSubtotal").textContent = money(cartTotal());
    $("#cartTotal").textContent =
        money(cartTotal() + (cartTotal() > 0 && cartTotal() < 999 ? 79 : 0));

    $("#shippingCost").textContent =
        cart.length === 0
            ? "₹0"
            : cartTotal() >= 999
                ? "FREE"
                : money(79);

    $("#cartItems").innerHTML = cart.length
        ? cart.map(item => {
            const product = getProduct(item.id);

            return `
                <div class="cart-line">
                    <img src="${product.image}" alt="${product.name}">

                    <div>
                        <h4>${product.name}</h4>
                        <div class="line-price">${money(product.price)}</div>

                        <div class="quantity">
                            <button data-qty="${product.id}" data-change="-1">−</button>
                            <span>${item.qty}</span>
                            <button data-qty="${product.id}" data-change="1">+</button>
                        </div>
                    </div>

                    <button class="remove-item" data-remove="${product.id}">
                        ×
                    </button>
                </div>
            `;
        }).join("")
        : `
            <div class="cart-empty">
                <h3>Your Cart is Empty!</h3>
                <p>Add something lovely to your cart.</p>
            </div>
        `;

    $("#shippingHint").textContent =
        cart.length === 0
            ? "Add items to get started."
            : cartTotal() >= 999
                ? "Great! You get free shipping."
                : `Add ${money(999 - cartTotal())} more for free shipping.`;

    $("#checkoutButton").disabled = cart.length === 0;
    $("#checkoutButton").style.opacity = cart.length ? "1" : ".5";
}

// QUANTITY MANAGEMENT

function changeQuantity(id, change) {
    const item = cart.find(item => item.id === id);

    if (!item) return;

    item.qty += change;

    if (item.qty <= 0) {
        cart = cart.filter(item => item.id !== id);
    }

    saveCart();
    renderCart();
}

function removeItem(id) {
    cart = cart.filter(item => item.id !== id);

    saveCart();
    renderCart();

    showToast("Product removed!");
}

// TOAST NOTIFICATION

function showToast(message) {
    const toast = $("#toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

// OPEN AND CLOSE CART

function openCart() {
    $("#overlay").classList.add("show");
    $("#cartDrawer").classList.add("open");
}

function closeCart() {
    $("#overlay").classList.remove("show");
    $("#cartDrawer").classList.remove("open");
}

// CHECKOUT MODAL

function openCheckout() {
    if (!cart.length) return;

    $("#checkoutLines").innerHTML = cart.map(item => {
        const product = getProduct(item.id);

        return `
            <div class="checkout-line">
                <span>${product.name} × ${item.qty}</span>
                <span>${money(product.price * item.qty)}</span>
            </div>
        `;
    }).join("");

    const total =
        cartTotal() +
        (cartTotal() > 0 && cartTotal() < 999 ? 79 : 0);

    $("#checkoutTotal").textContent = money(total);

    closeCart();
    $("#overlay").classList.add("show");
    $("#checkoutModal").classList.add("show");
}

function closeCheckout() {
    $("#checkoutModal").classList.remove("show");
    $("#overlay").classList.remove("show");
}

// FILTER PRODUCTS

function setCategory(category) {
    activeCategory = category;

    document.querySelectorAll(".filter-chip").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.category === category
        );
    });

    renderProducts();
}

// EVENT LISTENERS

$("#productGrid").addEventListener("click", event => {
    const button = event.target.closest("[data-add]");

    if (button) {
        addToCart(Number(button.dataset.add));
    }
});

$("#cartItems").addEventListener("click", event => {
    const quantityButton = event.target.closest("[data-qty]");
    const removeButton = event.target.closest("[data-remove]");

    if (quantityButton) {
        changeQuantity(
            Number(quantityButton.dataset.qty),
            Number(quantityButton.dataset.change)
        );
    }

    if (removeButton) {
        removeItem(Number(removeButton.dataset.remove));
    }
});

$("#categoryFilters").addEventListener("click", event => {
    const button = event.target.closest("[data-category]");

    if (button) {
        setCategory(button.dataset.category);
    }
});

$("#searchInput").addEventListener("input", event => {
    searchTerm = event.target.value.trim().toLowerCase();
    renderProducts();
});

$("#sortSelect").addEventListener("change", event => {
    sortMode = event.target.value;
    renderProducts();
});

$("#resetFilters").addEventListener("click", () => {
    searchTerm = "";
    $("#searchInput").value = "";
    setCategory("All");
});

$("#openCart").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#continueShopping").addEventListener("click", closeCart);

$("#overlay").addEventListener("click", () => {
    closeCart();
    closeCheckout();
});

$("#checkoutButton").addEventListener("click", openCheckout);
$("#closeCheckout").addEventListener("click", closeCheckout);

$("#backToCart").addEventListener("click", () => {
    closeCheckout();
    openCart();
});

// PLACE DEMO ORDER

$("#placeOrder").addEventListener("click", () => {
    if (!cart.length) return;

    cart = [];

    saveCart();
    renderCart();
    closeCheckout();

    showToast("Demo order placed successfully! ✨");
});

// ESC KEY

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeCart();
        closeCheckout();
    }
});

// CURRENT YEAR

$("#year").textContent = new Date().getFullYear();

// INITIALIZE WEBSITE

renderProducts();
renderCart();
