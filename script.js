document.addEventListener('DOMContentLoaded', () => {
    displayProducts(products);
    updateCartCount();
    setupPaymentMethodListener();
});

const products = [
    { id: 1, name: 'BREAKER BK1', brand: 'breaker', price: 1200, image: 'https://www.breaker-shoes.com/wp-content/uploads/2025/09/BK-1231RED_%E0%B8%82%E0%B9%89%E0%B8%B2%E0%B8%87.jpg', tag: 'ใหม่' },
    { id: 2, name: 'Nike Lunargato II', brand: 'nike', price: 2500, image: 'https://www.messisport.com/50701-large_default/n8242-nike-lunargato-ii-blackvolt.jpg', tag: 'ฮิต' },
    { id: 3, name: 'PAN VIGOR X', brand: 'pan', price: 1800, image: 'https://img.lazcdn.com/g/p/3895931036138c7a5e23bb1f0045acbd.jpg_720x720q80.jpg', tag: 'ลดราคา' },
    { id: 4, name: 'JOMA TOP FLEX', brand: 'joma', price: 2800, image: 'https://www.joma-sport.com/dw/image/v2/BFRV_PRD/on/demandware.static/-/Sites-joma-masterCatalog/default/dw348a8f35/images/medium/TOPW2482IN_10.jpg?sw=900&sh=900&sm=fit' },
    { id: 5, name: 'Breaker Real', brand: 'breaker', price: 1350, image: 'https://www.breaker-shoes.com/wp-content/uploads/2024/03/BK-0917PK-WH_%E0%B8%84%E0%B8%B9%E0%B9%88Years-of-the-Dragon-600x600.webp', tag: 'เพิ่มสต็อก' },
    { id: 6, name: 'NIKE Tiempo Legend 10 Academy IC', brand: 'nike', price: 3200, image: 'https://www.supersports.co.th/cdn/shop/files/NI083SH888EJTH-0.jpg?v=1744099882', tag: 'ฮิต' },
    { id: 7, name: 'PAN WAVE II', brand: 'pan', price: 1600, image: 'https://down-th.img.susercontent.com/file/th-11134207-7ras8-m24tp3cmjqa1ba' },
    { id: 8, name: 'JOMA MUNDIAL', brand: 'joma', price: 2650, image: 'https://down-th.img.susercontent.com/file/th-11134207-7r991-lyylxbq9gi9tc4' },
];

let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = localStorage.getItem('currentUser') || null;

if (currentUser) {
    document.getElementById('userNameDisplay').textContent = currentUser;
    document.getElementById('userSection').style.display = 'block';
    document.getElementById('loginSection').style.display = 'none';
}

// ========== Product Display ==========
function displayProducts(productsToDisplay) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';
    productsToDisplay.forEach(product => {
        const productCard = `
            <div class="product-card" data-brand="${product.brand}">
                ${product.tag ? `<div class="product-tag tag-${product.tag}">${product.tag}</div>` : ''}
                <img src="${product.image}" alt="${product.name}">
                <p class="product-id">รหัสสินค้า: ${String(product.id).padStart(4, '0')}</p>
                <h3>${product.name}</h3>
                <p class="product-price">ราคา: ฿${product.price.toLocaleString()}</p>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">เพิ่มลงตะกร้า</button>
            </div>
        `;
        productsGrid.innerHTML += productCard;
    });
}

function filterProducts(brand) {
    const filteredProducts = brand === 'all' ? products : products.filter(p => p.brand === brand);
    displayProducts(filteredProducts);

    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.filter-btn[onclick="filterProducts('${brand}')"]`).classList.add('active');
}

// ========== Modal Management ==========
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        if (modalId === 'cartModal') {
            updateCartDisplay();
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

// ========== User Authentication ==========
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    currentUser = username;
    localStorage.setItem('currentUser', username);

    document.getElementById('userNameDisplay').textContent = username;
    document.getElementById('userSection').style.display = 'block';
    document.getElementById('loginSection').style.display = 'none';

    closeModal('loginModal');
    showNotification(`ยินดีต้อนรับ, ${username}!`);
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');

    document.getElementById('userSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
    showNotification('คุณได้ออกจากระบบแล้ว');
}

// ========== Cart Management ==========
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cartItems.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cartItems.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartCount();
    showNotification(`เพิ่ม '${product.name}' ลงในตะกร้าแล้ว`);
}

function updateCartDisplay() {
    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotalDisplay = document.getElementById('cartTotalDisplay');
    cartItemsList.innerHTML = '';
    let total = 0;

    if (cartItems.length === 0) {
        cartItemsList.innerHTML = '<p>ตะกร้าของคุณว่างเปล่า</p>';
    } else {
        cartItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <span>${item.name} (x${item.quantity})</span>
                <span>฿${(item.price * item.quantity).toLocaleString()}</span>
                <button onclick="removeFromCart(${item.id})">ลบ</button>
            `;
            cartItemsList.appendChild(itemElement);
            total += item.price * item.quantity;
        });
    }
    cartTotalDisplay.textContent = `฿${total.toLocaleString()}`;
}

function removeFromCart(productId) {
    cartItems = cartItems.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    updateCartCount();
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cartItems));
}

// ========== Checkout and Payment System ==========

/**
 * เริ่มกระบวนการชำระเงิน
 */
function proceedToCheckout() {
    if (!currentUser) {
        showNotification('กรุณาเข้าสู่ระบบก่อนทำการชำระเงิน', 'error');
        closeModal('cartModal');
        openModal('loginModal');
        return;
    }

    if (cartItems.length === 0) {
        showNotification('ตะกร้าของคุณว่างเปล่า', 'error');
        return;
    }

    populateCheckoutSummary();
    closeModal('cartModal');
    openModal('paymentModal');
}

/**
 * แสดงข้อมูลสรุปการสั่งซื้อในหน้าชำระเงิน
 */
function populateCheckoutSummary() {
    const checkoutItemsList = document.getElementById('checkoutItemsList');
    const checkoutTotalDisplay = document.getElementById('checkoutTotalDisplay');
    checkoutItemsList.innerHTML = '';
    let total = 0;

    cartItems.forEach(item => {
        const itemElement = `
            <div class="checkout-item">
                <span>${item.name} (x${item.quantity})</span>
                <span>฿${(item.price * item.quantity).toLocaleString()}</span>
            </div>
        `;
        checkoutItemsList.innerHTML += itemElement;
        total += item.price * item.quantity;
    });

    checkoutTotalDisplay.textContent = `฿${total.toLocaleString()}`;
}

/**
 * จัดการการเลือกวิธีการชำระเงิน
 */
function setupPaymentMethodListener() {
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const transferInfo = document.getElementById('transferInfo');

    paymentOptions.forEach(option => {
        option.addEventListener('change', (event) => {
            if (event.target.value === 'transfer') {
                transferInfo.style.display = 'block';
            } else {
                transferInfo.style.display = 'none';
            }
        });
    });
}

/**
 * จัดการการยืนยันคำสั่งซื้อ
 */
function handlePayment(event) {
    event.preventDefault(); // ป้องกันการรีโหลดหน้า

    // ดึงข้อมูลจากฟอร์ม (เผื่อใช้ในอนาคต เช่น ส่งไปหลังบ้าน)
    const customerName = document.getElementById('customerName').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    console.log('Order Confirmed:', {
        customerName,
        customerAddress,
        customerPhone,
        paymentMethod,
        items: cartItems
    });

    // แสดงข้อความขอบคุณ
    showNotification('สั่งซื้อสำเร็จ! ขอบคุณที่ใช้บริการครับ');

    // ล้างตะกร้า
    cartItems = [];
    saveCart();

    // อัปเดต UI
    updateCartCount();
    updateCartDisplay(); // เพื่อให้ตะกร้าใน modal แสดงว่าว่างเปล่า

    // ปิด modal และรีเซ็ตฟอร์ม
    closeModal('paymentModal');
    document.getElementById('checkoutForm').reset();
    document.getElementById('transferInfo').style.display = 'none'; // ซ่อนข้อมูลการโอนเงิน
}


// ========== Notification System ==========
function showNotification(message, type = 'success') {
    const notificationArea = document.getElementById('notificationArea');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notificationArea.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notificationArea.removeChild(notification);
        }, 500);
    }, 3000);
}

// Initial setup
filterProducts('all');
updateCartCount();
if (currentUser) {
    document.getElementById('userNameDisplay').textContent = currentUser;
    document.getElementById('userSection').style.display = 'block';
    document.getElementById('loginSection').style.display = 'none';
}
setupPaymentMethodListener();