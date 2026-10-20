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
   CLOSE MODAL & ESC KEY
========================= */
window.addEventListener("click", function(event) {
    const modal = document.getElementById("orderModal");
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeModal();
    }
});