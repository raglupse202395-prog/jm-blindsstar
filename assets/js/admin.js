const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value;

    if (user === "admin" && pass === "123456789") {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        loadInquiries();
        loadOrders();
    } else {
        document.getElementById("loginMessage").style.display = "block";
    }
});

function logout() {
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("loginPage").style.display = "flex";
}

function showSection(id, el) {
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    document.querySelectorAll(".menu-item").forEach(m => m.classList.remove("active"));
    if(el) el.classList.add("active");
    document.getElementById("pageTitle").textContent = id.replace("Section", "");
}

async function loadInquiries() {
    try {
        const res = await fetch('/api/inquiries');
        const data = await res.json();
        const tbody = document.querySelector("#inquiriesTable tbody");
        tbody.innerHTML = data.map(i => `<tr><td>${new Date(i.date).toLocaleDateString()}</td><td>${i.name}</td><td>${i.phone}</td><td>${i.product}</td><td>${i.message}</td></tr>`).join('');
    } catch(e) { console.log("Error loading inquiries"); }
}

async function loadOrders() {
    try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        const tbody = document.getElementById("ordersTable");
        tbody.innerHTML = data.map(o => `
            <tr>
                <td>#ORD-${o.id}</td>
                <td>${o.customername || o.customerName}</td>
                <td>${o.product}</td>
                <td>₱${Number(o.amount).toLocaleString()}</td>
                <td><span class="status ${o.status.toLowerCase()}">${o.status}</span></td>
                <td>${o.status !== 'Cancelled' ? `<button class="btn btn-danger" onclick="cancelOrder(${o.id})">Cancel</button>` : '-'}</td>
            </tr>
        `).join('');
    } catch(e) { console.log("Error loading orders"); }
}

async function cancelOrder(id) {
    if(confirm("Cancel this order?")) {
        await fetch(`/api/orders/${id}/cancel`, { method: 'PUT' });
        loadOrders();
    }
}

function openModal() { document.getElementById("orderModal").style.display = "flex"; }

async function addOrder() {
    const customerName = document.getElementById("orderCustomer").value;
    const product = document.getElementById("orderProduct").value;
    const quantity = document.getElementById("orderQuantity").value;
    const amount = document.getElementById("orderAmount").value;

    await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, product, quantity, amount })
    });
    document.getElementById("orderModal").style.display = "none";
    loadOrders();
}

async function generateReport(type) {
    const res = await fetch('/api/orders');
    const data = await res.json();
    document.getElementById("reportOutputCard").style.display = "block";
    
    if(type === 'sales') {
        let total = data.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + Number(o.amount), 0);
        document.getElementById("reportOutputTitle").innerText = "Sales Report";
        document.getElementById("reportOutputContent").innerHTML = `<h3>Total Revenue: ₱${total.toLocaleString()}</h3>`;
    } else {
        document.getElementById("reportOutputTitle").innerText = "Order Report";
        document.getElementById("reportOutputContent").innerHTML = `<h3>Total Orders: ${data.length}</h3>`;
    }
}