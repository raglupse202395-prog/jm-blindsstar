/* =========================
   LOGIN
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
    } else {
        message.style.display = "block";
    }
});

/* =========================
   LOGOUT
========================= */
function logout() {
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("loginPage").style.display = "flex";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("loginMessage").style.display = "none";
}

/* =========================
   SHOW SECTION
========================= */
function showSection(sectionId, element) {
    const sections = document.querySelectorAll(".section");
    sections.forEach(function(section) {
        section.classList.remove("active");
    });
    document.getElementById(sectionId).classList.add("active");

    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach(function(item) {
        item.classList.remove("active");
    });
    if (element) {
        element.classList.add("active");
    }

    const titles = {
        dashboardSection: "Dashboard",
        customersSection: "Customers",
        ordersSection: "Orders",
        salesSection: "Sales",
        reportsSection: "Reports",
        settingsSection: "Settings"
    };
    document.getElementById("pageTitle").textContent = titles[sectionId];

    /* Close mobile sidebar */
    document.getElementById("sidebar").classList.remove("open");
}

/* =========================
   SHOW SECTION BY ID
========================= */
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

/* =========================
   MOBILE SIDEBAR
========================= */
function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
}

/* =========================
   ORDER MODAL
========================= */
function openModal() {
    document.getElementById("orderModal").classList.add("show");
}

function closeModal() {
    document.getElementById("orderModal").classList.remove("show");
}

/* =========================
   ADD ORDER
========================= */
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
        <td>
            <span class="status pending">
                Pending
            </span>
        </td>
    `;

    closeModal();
    document.getElementById("orderCustomer").value = "";
    document.getElementById("orderQuantity").value = "1";
    document.getElementById("orderAmount").value = "";
    showNotification("New order added successfully!");
}

/* =========================
   ADMIN MANAGEMENT MODAL
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
        // Update existing row
        editingRow.cells[1].innerText = username;
        editingRow.cells[2].innerText = role;
        showNotification("Admin updated successfully!");
    } else {
        // Add new row
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
    // If called from the hardcoded HTML button, we find the row manually
    let row;
    if (btnElement) {
        row = btnElement.closest('tr');
    } else {
        // This handles the hardcoded row in HTML
        row = document.querySelector(`#adminTable tbody tr td:nth-child(2):contains('${username}')`).parentElement;
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
        const row = btnElement.closest('tr');
        row.remove();
        showNotification("Admin removed.");
    }
}

/* =========================
   SEARCH TABLE
========================= */
function searchTable(inputId, tableId) {
    const input = document.getElementById(inputId);
    const filter = input.value.toLowerCase();
    const table = document.getElementById(tableId);
    const rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) {
        const text = rows[i].textContent.toLowerCase();
        if (text.includes(filter)) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}

/* =========================
   SETTINGS
========================= */
function saveSettings() {
    const name = document.getElementById("businessName").value;
    if (name.trim() === "") {
        alert("Business name cannot be empty.");
        return;
    }
    showNotification("Business settings saved successfully!");
}

/* =========================
   REPORTS
========================= */
function generateReport(type) {
    showNotification(type + " report is ready.");
}

/* =========================
   NOTIFICATION
========================= */
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
    const orderModal = document.getElementById("orderModal");
    const adminModal = document.getElementById("adminModal");
    
    if (event.target === orderModal) closeModal();
    if (event.target === adminModal) closeAdminModal();
});

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeModal();
        closeAdminModal();
    }
});