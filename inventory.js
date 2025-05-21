// Initialize products from localStorage or default data
let products = JSON.parse(localStorage.getItem('products')) || [
    {
        id: 1,
        name: "Pod Kit",
        price: 850.00,
        stock: 50,
        category: "Hardware"
    },
    {
        id: 2,
        name: "Salt Nic",
        price: 300.00,
        stock: 100,
        category: "E-liquid"
    },
    {
        id: 3,
        name: "Coil",
        price: 200.00,
        stock: 75,
        category: "Accessories"
    },
    {
        id: 4,
        name: "Disposable Vape",
        price: 350.00,
        stock: 60,
        category: "Disposables"
    }
];

// Initialize if empty
if(!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify(products));
}

let editingIndex = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    setupEventListeners();
});

function setupEventListeners() {
    // Form submission
    document.getElementById('productForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveProduct(e);
    });
}

function refreshProducts() {
    products = JSON.parse(localStorage.getItem('products')) || [];
}

function loadInventory() {
    refreshProducts();
    const tbody = document.getElementById('inventoryList');
    tbody.innerHTML = '';
    
    products.forEach((product, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>₱${product.price.toFixed(2)}</td>
                <td class="${product.stock < 10 ? 'text-danger' : ''}">
                    ${product.stock}
                </td>
                <td>
                    <button class="btn btn-sm btn-primary me-2" 
                            onclick="editProduct(${index})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" 
                            onclick="deleteProduct(${index})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function saveProduct(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const product = {
        id: editingIndex !== null ? products[editingIndex].id : products.length + 1,
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock'))
    };

    if(editingIndex !== null) {
        products[editingIndex] = product;
        editingIndex = null;
    } else {
        products.push(product);
    }

    localStorage.setItem('products', JSON.stringify(products));
    loadInventory();
    form.reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
    if(modal) modal.hide();
}

function editProduct(index) {
    refreshProducts();
    editingIndex = index;
    
    if(index < 0 || index >= products.length) {
        alert('Invalid product selection');
        return;
    }

    const product = products[index];
    const form = document.getElementById('productForm');
    
    form.name.value = product.name;
    form.category.value = product.category;
    form.price.value = product.price;
    form.stock.value = product.stock;
    
    document.getElementById('modalTitle').textContent = "Edit Product";
    new bootstrap.Modal(document.getElementById('productModal')).show();
}

function deleteProduct(index) {
    if(confirm('Are you sure you want to delete this product?')) {
        refreshProducts();
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
        loadInventory();
    }
}
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Make functions available globally
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;