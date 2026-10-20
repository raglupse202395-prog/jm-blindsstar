const loginForm = document.getElementById("loginForm");
let editAdminRow = null; // Tracks if we are editing or adding

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value;

    if (user === "admin" && pass === "123456789") {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        loadInquiries();
        loadOrders();
        loadCustomers();
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
    } catch(e) { console.log(e); }
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
    } catch(e) { console.log(e); }
}

async function loadCustomers() {
    try {
        const res = await fetch('/api/customers');
        const data = await res.json();
        const tbody = document.querySelector("#customersTable tbody");
        tbody.innerHTML = data.map(c => `<tr><td>#C-${c.id}</td><td>${c.name}</td><td>${c.email}</td><td>${c.phone}</td></tr>`).join('');
    } catch(e) { console.log(e); }
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
        let total = data.filter(o => o.status !== 'Cancelled').reduce((s, o) => Number(s) + Number(o.amount), 0);
        document.getElementById("reportOutputTitle").innerText = "Sales Report";
        document.getElementById("reportOutputContent").innerHTML = `<h3>Total Revenue: ₱${total.toLocaleString()}</h3>`;
    } else {
        document.getElementById("reportOutputTitle").innerText = "Order Report";
        document.getElementById("reportOutputContent").innerHTML = `<h3>Total Orders: ${data.length}</h3>`;
    }
}

/* =========================
   ADMIN MANAGEMENT LOGIC
========================= */
function openAdminModal() {
    editAdminRow = null;
    document.getElementById("adminModalTitle").innerText = "Add New Admin";
    document.getElementById("adminUsername").value = "";
    document.getElementById("adminPassword").value = "";
    document.getElementById("adminModal").style.display = "flex";
}

function editAdmin(btn) {
    editAdminRow = btn.closest("tr");
    document.getElementById("adminModalTitle").innerText = "Edit Admin";
    document.getElementById("adminUsername").value = editAdminRow.cells[1].innerText;
    document.getElementById("adminPassword").value = ""; // Leave blank to reset
    document.getElementById("adminRole").value = editAdminRow.cells[2].innerText;
    document.getElementById("adminModal").style.display = "flex";
}

function saveAdmin() {
    const user = document.getElementById("adminUsername").value;
    const pass = document.getElementById("adminPassword").value;
    const role = document.getElementById("adminRole").value;

    if(!user || !pass) return alert("Please fill in all fields.");

    if(editAdminRow) {
        // Update existing row
        editAdminRow.cells[1].innerText = user;
        editAdminRow.cells[2].innerText = role;
    } else {
        // Add new row
        const tbody = document.querySelector("#adminTable tbody");
        const newRow = tbody.insertRow();
        newRow.innerHTML = `
            <td>ADM-0${tbody.rows.length + 1}</td>
            <td>${user}</td>
            <td>${role}</td>
            <td>
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;" onclick="editAdmin(this)">Edit</button>
                <button class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;" onclick="deleteAdmin(this)">Delete</button>
            </td>
        `;
    }
    document.getElementById("adminModal").style.display = "none";
}

function deleteAdmin(btn) {
    if(confirm("Delete this admin?")) {
        btn.closest("tr").remove();
    }
}