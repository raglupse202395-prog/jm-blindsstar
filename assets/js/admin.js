const loginForm = document.getElementById("loginForm");
let editAdminRow = null; 

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

/* =========================
   LOAD DATA TABLES
========================= */
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

/* =========================
   REPORT GENERATOR (THE FIX)
========================= */
async function generateReport(type) {
    // Show the output box
    const outputCard = document.getElementById("reportOutputCard");
    const title = document.getElementById("reportOutputTitle");
    const content = document.getElementById("reportOutputContent");
    outputCard.style.display = "block";

    // Scroll to the output box so the user sees it
    outputCard.scrollIntoView({ behavior: 'smooth' });

    try {
        if (type === 'sales' || type === 'financial') {
            title.innerText = type === 'sales' ? "Sales Report" : "Financial Summary";
            const res = await fetch('/api/orders');
            const data = await res.json();
            
            // Calculate total revenue, ignoring cancelled orders
            let total = data.filter(o => o.status !== 'Cancelled').reduce((s, o) => Number(s) + Number(o.amount), 0);
            
            content.innerHTML = `
                <h3 style="color: var(--navy); margin-bottom: 10px;">Total Revenue: ₱${total.toLocaleString()}</h3>
                <p><b>Total Orders:</b> ${data.length}</p>
                <p><b>Valid (Non-Cancelled) Orders:</b> ${data.filter(o => o.status !== 'Cancelled').length}</p>
            `;
        } 
        else if (type === 'inventory' || type === 'product') {
            title.innerText = type === 'inventory' ? "Inventory Status" : "Product Sales";
            
            // Static mock data since we don't have a specific inventory DB table yet
            content.innerHTML = `
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <tr style="background: var(--navy); color: white;">
                        <th style="padding: 10px; text-align: left;">Product Name</th>
                        <th style="padding: 10px; text-align: center;">Stock Level</th>
                        <th style="padding: 10px; text-align: center;">Status</th>
                    </tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;">Roller Blinds</td><td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">45</td><td style="padding: 10px; text-align: center; color: green; border-bottom: 1px solid #ddd;">In Stock</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;">Fabric Curtains</td><td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">8</td><td style="padding: 10px; text-align: center; color: orange; border-bottom: 1px solid #ddd;">Low Stock</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;">Vertical Blinds</td><td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">0</td><td style="padding: 10px; text-align: center; color: red; border-bottom: 1px solid #ddd;">Out of Stock</td></tr>
                </table>
            `;
        }
        else if (type === 'customer') {
            title.innerText = "Customer Report";
            const res = await fetch('/api/customers');
            const data = await res.json();
            
            content.innerHTML = `
                <h3 style="color: var(--navy); margin-bottom: 10px;">Total Customers: ${data.length}</h3>
                <p>List of registered customers:</p>
                <ul style="margin-top: 10px; margin-left: 20px;">
                    ${data.map(c => `<li>${c.name} - ${c.email}</li>`).join('')}
                </ul>
            `;
        }
        else if (type === 'order') {
            title.innerText = "Order Status Report";
            const res = await fetch('/api/orders');
            const data = await res.json();
            
            let pending = data.filter(o => o.status === 'Pending').length;
            let cancelled = data.filter(o => o.status === 'Cancelled').length;
            let completed = data.filter(o => o.status === 'Completed').length;
            
            content.innerHTML = `
                <h3 style="color: var(--navy); margin-bottom: 10px;">Total Orders: ${data.length}</h3>
                <p><b style="color: orange;">Pending:</b> ${pending}</p>
                <p><b style="color: green;">Completed:</b> ${completed}</p>
                <p><b style="color: red;">Cancelled:</b> ${cancelled}</p>
            `;
        }
    } catch (err) {
        content.innerHTML = `<p style="color: red;">Error loading data. Make sure the server is running.</p>`;
    }
}

/* =========================
   ADD ORDER & ADMIN MODALS
========================= */
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
    document.getElementById("adminPassword").value = ""; 
    document.getElementById("adminRole").value = editAdminRow.cells[2].innerText;
    document.getElementById("adminModal").style.display = "flex";
}

function saveAdmin() {
    const user = document.getElementById("adminUsername").value;
    const pass = document.getElementById("adminPassword").value;
    const role = document.getElementById("adminRole").value;

    if(!user || !pass) return alert("Please fill in all fields.");

    if(editAdminRow) {
        editAdminRow.cells[1].innerText = user;
        editAdminRow.cells[2].innerText = role;
    } else {
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