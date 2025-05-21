let orders = JSON.parse(localStorage.getItem('orders')) || [];
let products = JSON.parse(localStorage.getItem('products')) || [];

// Initialize if empty
if (!localStorage.getItem('orders')) {
    localStorage.setItem('orders', JSON.stringify([]));
}

document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    loadProductOptions();
    checkUserRole();
});

function checkUserRole() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user.role !== 'owner') {
        document.getElementById('orderModal').remove();
        document.querySelector('[data-bs-target="#orderModal"]').remove();
    }
}

function loadProductOptions() {
    const select = document.getElementById('productSelect');
    select.innerHTML = products.map(p => 
        `<option value="${p.id}">${p.name} (${p.category})</option>`
    ).join('');
}

function loadOrders() {
    orders = JSON.parse(localStorage.getItem('orders')) || [];
    const tbody = document.getElementById('ordersList');
    tbody.innerHTML = orders.map((order, index) => `
        <tr>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>${order.supplier}</td>
            <td>${order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}</td>
            <td>
                <span class="badge ${order.status === 'delivered' ? 'bg-success' : 'bg-warning'}">
                    ${order.status}
                </span>
            </td>
            <td>
                ${order.status === 'pending' ? `
                <button class="btn btn-sm btn-success" onclick="markDelivered(${index})">
                    Mark Delivered
                </button>` : ''}
            </td>
        </tr>
    `).join('');
}

function saveOrder(e) {
    e.preventDefault();
    const form = e.target;
    const productId = parseInt(form.querySelector('#productSelect').value);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        alert('Selected product not found!');
        return;
    }

    const newOrder = {
        id: orders.length + 1,
        date: new Date().toISOString(),
        supplier: form.querySelector('input').value,
        items: [{
            productId,
            productName: product.name,
            quantity: parseInt(form.querySelector('input[type="number"]').value)
        }],
        status: 'pending'
    };
    
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    loadOrders();
    form.reset();
    bootstrap.Modal.getInstance(document.getElementById('orderModal')).hide();
}

function markDelivered(index) {
    const order = orders[index];
    order.status = 'delivered';
    
    // Update inventory
    order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            product.stock += item.quantity;
        }
    });
    
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('products', JSON.stringify(products));
    loadOrders();
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
// Make functions globally accessible
window.markDelivered = markDelivered;
window.saveOrder = saveOrder;