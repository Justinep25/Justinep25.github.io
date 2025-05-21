document.addEventListener('DOMContentLoaded', () => {
    // Load user role
    const user = JSON.parse(localStorage.getItem('currentUser'));
    document.getElementById('userRole').textContent = `Logged in as: ${user.role}`;

    // Load dashboard data
    updateDashboard();
    initializeSalesChart();
});

function updateDashboard() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    // Update stats
    document.getElementById('totalProducts').textContent = products.length;
    
    const todaySales = transactions
        .filter(t => new Date(t.timestamp).toDateString() === new Date().toDateString())
        .reduce((sum, t) => sum + t.total, 0);
    document.getElementById('dailySales').textContent = `₱${todaySales.toFixed(2)}`;
    
    const lowStockCount = products.filter(p => p.stock < 10).length;
    document.getElementById('lowStockCount').textContent = lowStockCount;
    
    // Update low stock alerts
    const alertsContainer = document.getElementById('stockAlerts');
    alertsContainer.innerHTML = products
        .filter(p => p.stock < 10)
        .map(p => `
            <div class="stock-alert">
                <strong>${p.name}</strong> (${p.stock} remaining)
                <div class="text-muted">${p.category}</div>
            </div>
        `).join('') || '<div class="text-center">No low stock items</div>';
    
    // Recent transactions
    const recentTransactions = transactions.slice(-5).reverse();
    document.getElementById('recentTransactions').innerHTML = recentTransactions
        .map(t => `
            <tr>
                <td>${new Date(t.timestamp).toLocaleTimeString()}</td>
                <td>${t.items.map(i => i.name).join(', ')}</td>
                <td>₱${t.total.toFixed(2)}</td>
                <td>${t.cashier}</td>
            </tr>
        `).join('');
}

function initializeSalesChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    // Prepare 7-day data
    const dates = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const salesData = dates.map(date => 
        transactions
            .filter(t => t.date === date)
            .reduce((sum, t) => sum + t.total, 0)
    );

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Daily Sales (₱)',
                data: salesData,
                borderColor: '#64ffda',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#ccd6f6'
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#ccd6f6' },
                    grid: { color: '#1f4068' }
                },
                y: {
                    ticks: { color: '#ccd6f6' },
                    grid: { color: '#1f4068' }
                }
            }
        }
    });
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}