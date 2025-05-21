let salesChart = null;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('reportFilter').addEventListener('submit', generateReport);
});

function generateReport(e) {
    e.preventDefault();
    const type = document.getElementById('reportType').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Filter transactions
    const filteredTransactions = transactions.filter(t => {
        const transDate = new Date(t.timestamp);
        return transDate >= new Date(startDate) && transDate <= new Date(endDate);
    });
    
    updateSalesChart(filteredTransactions);
    updateInventoryReport(products, filteredTransactions);
}

function updateSalesChart(transactions) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    // Destroy existing chart
    if(salesChart) salesChart.destroy();
    
    // Group by date
    const salesData = transactions.reduce((acc, t) => {
        const date = new Date(t.timestamp).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + t.total;
        return acc;
    }, {});

    salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(salesData),
            datasets: [{
                label: 'Sales (₱)',
                data: Object.values(salesData),
                backgroundColor: '#64ffda33',
                borderColor: '#64ffda',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { ticks: { color: '#ccd6f6' }},
                y: { 
                    ticks: { color: '#ccd6f6' },
                    beginAtZero: true
                }
            }
        }
    });
}

function updateInventoryReport(products, transactions) {
    const productSales = transactions.reduce((acc, t) => {
        t.items.forEach(item => {
            acc[item.id] = (acc[item.id] || 0) + item.quantity;
        });
        return acc;
    }, {});

    const tbody = document.getElementById('inventoryReport');
    tbody.innerHTML = products.map(p => `
        <tr>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>${p.stock}</td>
            <td>${productSales[p.id] || 0}</td>
            <td class="${p.stock < 10 ? 'text-danger' : 'text-success'}">
                ${p.stock < 10 ? 'Yes' : 'No'}
            </td>
        </tr>
    `).join('');
}