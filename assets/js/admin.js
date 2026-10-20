/* =========================
   LOGIN & AUTHENTICATION
========================= */
const LOGIN_USERNAME = "admin";
const LOGIN_PASSWORD = "123456789";

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("loginMessage");

    if (username === LOGIN_USERNAME && password === LOGIN_PASSWORD) {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        message.style.display = "none";
        showNotification("Welcome to JM Blindsstar Dashboard!");
        
        // Load the inquiries as soon as we log in
        loadInquiries(); 
    } else {
        message.style.display = "block";
    }
});

function logout() {
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("loginPage").style.display = "flex";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("loginMessage").style.display = "none";
}

/* =========================
   NAVIGATION & UI
========================= */
function showSection(sectionId, element) {
    const sections = document.querySelectorAll(".section");
    sections.forEach(function(section) { section.classList.remove("active"); });
    document.getElementById(sectionId).classList.add("active");

    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach(function(item) { item.classList.remove("active"); });
    if (element) { element.classList.add("active"); }

    const titles = {
        dashboardSection: "Dashboard",
        inquiriesSection: "Customer Inquiries",
        customersSection: "Customers",
        ordersSection: "Orders",
        salesSection: "Sales",
        reportsSection: "Reports",
        settingsSection: "Settings"
    };
    document.getElementById("pageTitle").textContent = titles[sectionId];
    document.getElementById("sidebar").classList.remove("open");
}

function showSectionById(sectionId) {
    const menuItems = document.querySelectorAll(".menu-item");
    let targetItem = null;
    menuItems.forEach(function(item) {
        if (item.getAttribute("onclick") && item.getAttribute("onclick").includes(sectionId)) {
            targetItem = item;
        }
    });
    showSection(sectionId, targetItem);
}

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
}

/* =========================
   CUSTOMER INQUIRIES
========================= */
function loadInquiries() {
    const inquiries = JSON.parse(localStorage.getItem("jm_inquiries")) || [];
    const tbody = document.querySelector("#inquiriesTable tbody");
    const badge = document.getElementById("inquiryBadge");

    // Update the red notification badge
    if (inquiries.length > 0) {
        badge.style.display = "inline-block";
        badge.textContent = inquiries.length;
    } else {
        badge.style.display = "none";
    }

    // Clear current table
    tbody.innerHTML = "";

    if (inquiries.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>No new inquiries yet.</td></tr>";
        return;
    }

    // Loop through saved inquiries and add them to the table
    inquiries.reverse().forEach(function(inquiry) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${inquiry.date}</td>
            <td><b>${inquiry.name}</b></td>
            <td>${inquiry.phone}<br><small>${inquiry.email}</small></td>
            <td>${inquiry.product}</td>
            <td>${inquiry.message}</td>
        `;
        tbody.appendChild(row);
    });
}

function clearInquiries() {
    if(confirm("Are you sure you want to clear all inquiries?")) {
        localStorage.removeItem("jm_inquiries");
        loadInquiries();
        showNotification("Inquiries cleared.");
    }
}

/* =========================
   ORDERS MODAL
========================= */
function openModal() {
    document.getElementById("orderModal").classList.add("show");
}
function closeModal() {
    document.getElementById("orderModal").classList.remove("show");
}

function addOrder() {
    const customer = document.getElementById("orderCustomer").value.trim();
    const product = document.getElementById("orderProduct").value;
    const quantity = document.getElementById("orderQuantity").value;
    const amount = document.getElementById("orderAmount").value;

    if (customer === "" || quantity === "" || amount === "") {
        alert("Please complete all order fields.");
        return;
    }

    const orderTable = document.getElementById("ordersTable");
    const newRow = orderTable.insertRow(0);
    const orderNumber = "#ORD-" + String(orderTable.rows.length + 12).padStart(4, "0");
    const today = new Date().toISOString().split("T")[0];

    newRow.innerHTML = `
        <td>${orderNumber}</td>
        <td>${customer}</td>
        <td>${product}</td>
        <td>${quantity}</td>
        <td>₱${Number(amount).toLocaleString()}</td>
        <td>${today}</td>
        <td><span class="status pending">Pending</span></td>
    `;

    closeModal();
    document.getElementById("orderCustomer").value = "";
    document.getElementById("orderQuantity").value = "1";
    document.getElementById("orderAmount").value = "";
    showNotification("New order added successfully!");
}

/* =========================
   ADMIN MANAGEMENT
========================= */
let editMode = false;
let editingRow = null;

function openAdminModal() {
    editMode = false;
    document.getElementById("adminModalTitle").textContent = "Add New Admin";
    document.getElementById("newAdminUsername").value = "";
    document.getElementById("newAdminRole").value = "Staff";
    document.getElementById("adminModal").classList.add("show");
}

function closeAdminModal() {
    document.getElementById("adminModal").classList.remove("show");
}

function saveAdmin() {
    const username = document.getElementById("newAdminUsername").value.trim();
    const role = document.getElementById("newAdminRole").value;

    if (username === "") {
        alert("Username cannot be empty.");
        return;
    }

    if (editMode && editingRow) {
        editingRow.cells[1].innerText = username;
        editingRow.cells[2].innerText = role;
        showNotification("Admin updated successfully!");
    } else {
        const table = document.getElementById("adminTable").getElementsByTagName('tbody')[0];
        const newRow = table.insertRow();
        const adminId = "ADM-" + String(table.rows.length + 1).padStart(2, "0");
        newRow.innerHTML = `
            <td>${adminId}</td>
            <td>${username}</td>
            <td>${role}</td>
            <td>
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;" onclick="editAdmin('${username}', this)">Edit</button>
                <button class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;" onclick="deleteAdmin(this)">Delete</button>
            </td>
        `;
        showNotification("New admin added successfully!");
    }
    closeAdminModal();
}

function editAdmin(username, btnElement) {
    let row;
    if (btnElement) {
        row = btnElement.closest('tr');
    } else {
        // Find row by searching for the username (used for hardcoded rows)
        const rows = document.querySelectorAll("#adminTable tbody tr");
        rows.forEach(r => {
            if(r.cells[1].innerText === username) row = r;
        });
    }
    if (!row) return;

    editMode = true;
    editingRow = row;
    document.getElementById("adminModalTitle").textContent = "Edit Admin";
    document.getElementById("newAdminUsername").value = row.cells[1].innerText;
    document.getElementById("newAdminRole").value = row.cells[2].innerText;
    document.getElementById("adminModal").classList.add("show");
}

function deleteAdmin(btnElement) {
    if (confirm("Are you sure you want to delete this admin?")) {
        btnElement.closest('tr').remove();
        showNotification("Admin removed.");
    }
}

/* =========================
   UTILITIES (SEARCH, SETTINGS, NOTIFICATION)
========================= */
function searchTable(inputId, tableId) {
    const filter = document.getElementById(inputId).value.toLowerCase();
    const rows = document.getElementById(tableId).getElementsByTagName("tr");
    for (let i = 1; i < rows.length; i++) {
        const text = rows[i].textContent.toLowerCase();
        rows[i].style.display = text.includes(filter) ? "" : "none";
    }
}

function saveSettings() {
    const name = document.getElementById("businessName").value;
    if (name.trim() === "") {
        alert("Business name cannot be empty.");
        return;
    }
    showNotification("Business settings saved successfully!");
}

function generateReport(type) {
    showNotification(type + " report is ready.");
}

function showNotification(message) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.classList.add("show");
    setTimeout(function() {
        notification.classList.remove("show");
    }, 3000);
}

/* =========================
   CLOSE MODALS & ESC KEY
========================= */
window.addEventListener("click", function(event) {
    if (event.target === document.getElementById("orderModal")) closeModal();
    if (event.target === document.getElementById("adminModal")) closeAdminModal();
});

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeModal();
        closeAdminModal();
    }
});