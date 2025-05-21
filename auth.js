const users = [
    { username: 'owner', password: 'admin123', role: 'owner' },
    { username: 'staff', password: 'staff123', role: 'staff' }
];

document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.querySelector('#loginForm input[type="text"]').value;
    const password = document.querySelector('#loginForm input[type="password"]').value;

    const user = users.find(u => u.username === username && u.password === password);
    
    if(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid credentials');
    }
});

// Role-based access control
const protectedPages = ['dashboard.html', 'pos.html', 'inventory.html', 'suppliers.html', 'reports.html'];
if(protectedPages.includes(window.location.pathname.split('/').pop())) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if(!user) window.location.href = 'index.html';
    
    if(user.role === 'staff') {
        document.querySelectorAll('.owner-only').forEach(el => el.remove());
    }
}