/* =========================
   LOGIN & AUTHENTICATION
========================= */
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("loginMessage");

    if (username === "admin" && password === "123456789") {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        message.style.display = "none";
        showNotification("Connected to Database!");
        
        loadInquiries();
        loadOrders();
        loadCustomers();
    } else {
        message.style.display = "block";
    }
});

function logout() {
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("loginPage").style.display = "flex";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
}

/* =========================
   NAVIGATION & UI
========================= */
function showSection(sectionId, element) {
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.getElementById(sectionId).classList.add("active");

    document.querySelectorAll(".menu-item").forEach(item => item.classList.remove("active"));
    if (element) element.classList.add("active");

    const titles = {
        dashboardSection: "Dashboard", inquiriesSection: "Customer Inquiries",
        customersSection: "Customers", ordersSection: "Orders",
        salesSection: "Sales", reportsSection: "Reports", settingsSection: "Settings"
    };
    document.getElementById("pageTitle").textContent = titles[sectionId];
    document.getElementById("sidebar").classList.remove("open");
}

function toggleSidebar() { document.getElementById("sidebar").classList.toggle("open"); }

/* =========================
   REAL DATA FETCHING
========================= */
async function loadInquiries() {
    const res = await fetch('/api/inquiries');
    const data = await res.json();
    const tbody = document.querySelector("#inquiriesTable tbody");
    const badge = document.getElementById("inquiryBadge");
    
    if (data.length > 0) { badge.style.display = "inline-block"; badge.textContent = data.length; } 
    else { badge.style.display = "none"; }
    
    tbody.innerHTML = data.length === 0 ? "<tr><td colspan='5' style='text-align:center;'>No inquiries yet.</td></tr>" : "";
    data.forEach(i => {
        tbody.innerHTML += `
            <tr>
                <td>${new Date(i.date).toLocaleDateString()}</td>
                <td><b>${i.name}</b></td>
                <td>${i.phone}<br><small>${i.email}</small></td>
                <td>${i.product}</td>
                <td>${i.message}</td>
            </tr>
        `;
    });
}

async function loadOrders() {
    const res = await fetch('/api/orders');
    const data = await res.json();
    const tbody = document.getElementById("ordersTable");
    tbody.innerHTML = "";
    
    data.forEach(o => {
        let actionBtn = "-";
        if (o.status !== 'Cancelled' && o.status !== 'Completed') {
            actionBtn = `<button class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;" onclick="cancelOrder(${o.id})">Cancel</button>`;
        }

        tbody.innerHTML += `
            <tr>
                <td>#ORD-${o.id.toString().padStart(4, '0')}</td>
                <td>${o.customername || o.customerName}</td>
                <td>${o.product}</td>
                <td>${o.quantity}</td>
                <td>₱${Number(o.amount).toLocaleString()}</td>
                <td>${new Date(o.date).toLocaleDateString()}</td>
                <td><span class="status ${o.status.toLowerCase()}">${o.status}</span></td>
                <td>${actionBtn}</td>
            </tr>
        `;
    });
}

async function loadCustomers() {
    const res = await fetch('/api/customers');
    const data = await res.json();
    const tbody = document.querySelector("#customersTable tbody");
    tbody.innerHTML = data.length === 0 ? "<tr><td colspan='6' style='text-align:center;'>No customers yet.</td></tr>" : "";
    data.forEach(c => {
        tbody.innerHTML += `
            <tr>
                <td>#C-${c.id}</td>
                <td>${c.name}</td>
                <td>${c.email}</td>
                <td>${c.phone}</td>
                <td>${c.address}</td>
                <td><span class="status active">${c.status}</span></td>
            </tr>
        `;
    });
}

/* =========================
   ACTIONS (ADD & CANCEL)
========================= */
function openModal() { document.getElementById("orderModal").classList.add("show"); }
function closeModal() { document.getElementById("orderModal").classList.remove("show"); }

async function addOrder() {
    const customer = document.getElementById("orderCustomer").value.trim();
    const product = document.getElementById("orderProduct").value;
    const quantity = document.getElementById("orderQuantity").value;
    const amount = document.getElementById("orderAmount").value;

    if (!customer || !quantity || !amount) return alert("Please fill all fields.");

    await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: customer, product, quantity, amount })
    });

    closeModal();
    showNotification("Order saved to database!");
    loadOrders(); 
}

async function cancelOrder(orderId) {
    if (confirm("Are you sure you want to cancel this order?")) {
        try {
            const response = await fetch(`/api/orders/${orderId}/cancel`, {
                method: 'PUT'
            });
            
            if (response.ok) {
                showNotification("Order cancelled successfully.");
                loadOrders(); 
            } else {
                alert("Failed to cancel order.");
            }
        } catch (error) {
            console.error(error);
            alert("Error connecting to server.");
        }
    }
}

/* =========================
   REPORTS GENERATOR
========================= */
async function generateReport(type) {
    const outputCard = document.getElementById("reportOutputCard");
    const title = document.getElementById("reportOutputTitle");
    const content = document.getElementById("reportOutputContent");
    
    let html = "";
    let reportName = "";

    if (type === 'sales') {
        reportName = "Sales Report";
        const res = await fetch('/api/orders');
        const orders = await res.json();
        let validOrders = orders.filter(o => o.status !== 'Cancelled');
        let total = validOrders.reduce((sum, o) => sum + Number(o.amount), 0);
        
        html = `<h3 style="color: var(--navy);">Total Revenue: ₱${total.toLocaleString()}</h3><p><b>Total Valid Orders:</b> ${validOrders.length}</p>`;
    } 
    else if (type === 'inventory') {
        reportName = "Inventory Status";
        html = `
            <table style="width:100%; border-collapse:collapse;">
                <tr style="background:var(--navy); color:white;"><th>Product</th><th>Stock</th><th>Status</th></tr>
                <tr><td>Roller Blinds</td><td>45</td><td style="color:green;">In Stock</td></tr>
                <tr><td>Fabric Curtains</td><td>8</td><td style="color:orange;">Low Stock</td></tr>
                <tr><td>Vertical Blinds</td><td>0</td><td style="color:red;">Out of Stock</td></tr>
            </table>`;
    }
    else if (type === 'customer') {
        reportName = "Customer Report";
        const res = await fetch('/api/customers');
        const customers = await res.json();
        html = `<h3 style="color: var(--navy);">Total Customers: ${customers.length}</h3>`;
    }
    else if (type === 'order') {
        reportName = "Order Status";
        const res = await fetch('/api/orders');
        const orders = await res.json();
        let pending = orders.filter(o => o.status === 'Pending').length;
        let cancelled = orders.filter(o => o.status === 'Cancelled').length;
        html = `
            <h3 style="color: var(--navy);">Pending Orders: ${pending}</h3>
            <h3 style="color: var(--red);">Cancelled Orders: ${cancelled}</h3>
            <h3 style="color: var(--navy);">Total Orders: ${orders.length}</h3>`;
    }

    title.innerText = reportName;
    content.innerHTML = html;
    outputCard.style.display = "block";
}

function closeReport() { document.getElementById("reportOutputCard").style.display = "none"; }
function printReport() { window.print(); }

function showNotification(msg) {
    const n = document.getElementById("notification");
    n.textContent = msg;
    n.classList.add("show");
    setTimeout(() => n.classList.remove("show"), 3000);
}