let cart = [];
let products = JSON.parse(localStorage.getItem('products')) || [];

// Initialize POS
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    document.getElementById('searchInput').addEventListener('input', filterProducts);
});

function loadProducts() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'col';
        card.innerHTML = `
            <div class="card bg-dark text-light h-100">
                <div class="card-body">
                    <h6>${product.name}</h6>
                    <small>${product.category}</small>
                    <div class="mt-2 d-flex justify-content-between align-items-center">
                        <span>₱${product.price.toFixed(2)}</span>
                        <button class="btn btn-sm btn-primary add-to-cart" 
                                data-id="${product.id}">
                            <i class="bi bi-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    // Add event listeners to new buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => addToCart(btn.dataset.id));
    });
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
    );
    
    // Re-render filtered products
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    filtered.forEach(product => {
        grid.innerHTML += `
            <div class="col">
                <div class="card bg-dark text-light h-100">
                    <div class="card-body">
                        <h6>${product.name}</h6>
                        <small>${product.category}</small>
                        <div class="mt-2 d-flex justify-content-between align-items-center">
                            <span>₱${product.price.toFixed(2)}</span>
                            <button class="btn btn-sm btn-primary add-to-cart" 
                                    data-id="${product.id}">
                                <i class="bi bi-cart-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    // Reattach event listeners
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => addToCart(btn.dataset.id));
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id == productId);
    const existing = cart.find(i => i.id == productId);

    if(existing) {
        existing.qty++;
    } else {
        cart.push({...product, qty: 1});
    }
    
    updateCartDisplay();
}

function updateCartDisplay() {
    const tbody = document.getElementById('cartItems');
    const subtotalElement = document.getElementById('subtotal');
    let subtotal = 0;
    
    tbody.innerHTML = '';
    cart.forEach(item => {
        subtotal += item.price * item.qty;
        tbody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>₱${item.price.toFixed(2)}</td>
                <td>
                    <div class="input-group input-group-sm">
                        <button class="btn btn-outline-secondary" 
                                onclick="updateQty(${item.id}, -1)">
                            -
                        </button>
                        <input type="number" class="form-control text-center" 
                               value="${item.qty}" min="1" 
                               onchange="updateQty(${item.id}, 0, this.value)">
                        <button class="btn btn-outline-secondary" 
                                onclick="updateQty(${item.id}, 1)">
                            +
                        </button>
                    </div>
                </td>
                <td>₱${(item.price * item.qty).toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-danger" 
                            onclick="removeFromCart(${item.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    subtotalElement.textContent = subtotal.toFixed(2);
}

function updateQty(productId, delta, newVal) {
    const item = cart.find(i => i.id == productId);
    if(newVal) item.qty = parseInt(newVal);
    else item.qty = Math.max(1, item.qty + delta);
    updateCartDisplay();
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.id != productId);
    updateCartDisplay();
}

function clearCart() {
    cart = [];
    updateCartDisplay();
}

function processPayment() {
    if(cart.length === 0) return alert('Cart is empty');
    
    const modalContent = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Process Payment</h5>
                    <button type="button" class="btn-close btn-close-white" 
                            data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>Total Amount: ₱<span id="totalAmount">${document.getElementById('subtotal').textContent}</span></p>
                    <div class="mb-3">
                        <label>Payment Type</label>
                        <select class="form-select" id="paymentType" required>
                            <option value="cash">Cash</option>
                            <option value="gcash">GCash</option>
                            <option value="card">Credit Card</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label>Amount Received</label>
                        <input type="number" step="0.01" 
                               class="form-control" id="amountReceived" required>
                    </div>
                    <p>Change: ₱<span id="changeAmount">0.00</span></p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" 
                            data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" 
                            onclick="completePayment()">Complete Payment</button>
                </div>
            </div>
        </div>
    `;
    
    const modal = document.getElementById('paymentModal');
    modal.innerHTML = modalContent;
    new bootstrap.Modal(modal).show();
    
    // Real-time change calculation
    document.getElementById('amountReceived').addEventListener('input', e => {
        const received = parseFloat(e.target.value) || 0;
        const total = parseFloat(document.getElementById('totalAmount').textContent);
        document.getElementById('changeAmount').textContent = 
            Math.max(0, (received - total)).toFixed(2);
    });
}

function completePayment() {
    const amountInput = document.getElementById('amountReceived');
    const paymentType = document.getElementById('paymentType').value;
    const amountReceived = parseFloat(amountInput.value);
    const total = parseFloat(document.getElementById('totalAmount').textContent);

    if(!amountReceived || amountReceived < total) {
        alert('Please enter a valid amount equal to or greater than the total');
        amountInput.focus();
        return;
    }

    // Create transaction record
    const transaction = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        items: cart.map(i => ({ 
            id: i.id, 
            name: i.name, 
            price: i.price,
            quantity: i.qty 
        })),
        total: total,
        paymentType: paymentType,
        amountReceived: amountReceived,
        change: amountReceived - total,
        cashier: JSON.parse(localStorage.getItem('currentUser')).username
    };

    // Update inventory
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if(product) product.stock = Math.max(0, product.stock - item.qty);
    });

    // Save data
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('products', JSON.stringify(products));

    // Generate and print receipt
    generateReceipt(transaction);

    // Reset system
    cart = [];
    updateCartDisplay();
    bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
}

function generateReceipt(transaction) {
    const receiptContent = `
        <div class="receipt">
            <h3 class="text-center">Vape Shop</h3>
            <p class="text-center">Receipt #${transaction.id}</p>
            <p class="text-center">${new Date(transaction.timestamp).toLocaleString()}</p>
            <hr>
            
            ${transaction.items.map(item => `
                <div class="receipt-item">
                    <span>${item.name}</span>
                    <span>${item.quantity}x ₱${item.price.toFixed(2)}</span>
                    <span>₱${(item.quantity * item.price).toFixed(2)}</span>
                </div>
            `).join('')}
            
            <hr>
            <div class="receipt-total">
                <span>Total:</span>
                <span>₱${transaction.total.toFixed(2)}</span>
            </div>
            <div class="receipt-payment">
                <span>Payment Method:</span>
                <span>${transaction.paymentType.toUpperCase()}</span>
            </div>
            <div class="receipt-payment">
                <span>Amount Received:</span>
                <span>₱${transaction.amountReceived.toFixed(2)}</span>
            </div>
            <div class="receipt-payment">
                <span>Change:</span>
                <span>₱${transaction.change.toFixed(2)}</span>
            </div>
            <hr>
            <p class="text-center">Thank you for your purchase!</p>
            <p class="text-center">Cashier: ${transaction.cashier}</p>
        </div>
        <style>
            .receipt { max-width: 300px; margin: 0 auto; padding: 20px; font-family: monospace; }
            .receipt-item { display: flex; justify-content: space-between; margin: 5px 0; }
            .receipt-total { display: flex; justify-content: space-between; margin-top: 10px; font-weight: bold; }
            .receipt-payment { display: flex; justify-content: space-between; margin: 5px 0; }
            hr { border-top: 1px dashed #000; }
        </style>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.print();
    setTimeout(() => printWindow.close(), 1000);
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}