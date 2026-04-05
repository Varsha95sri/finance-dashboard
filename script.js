// Mock Data
let transactions = [
  { id: 1, date: "2026-04-04", desc: "Salary Credit", category: "Salary", amount: 85000, type: "income" },
  { id: 2, date: "2026-04-03", desc: "Grocery Shopping", category: "Food", amount: 2450, type: "expense" },
  { id: 3, date: "2026-04-02", desc: "Freelance Payment", category: "Freelance", amount: 12000, type: "income" },
  { id: 4, date: "2026-04-01", desc: "Electricity Bill", category: "Utilities", amount: 1850, type: "expense" },
  { id: 5, date: "2026-03-31", desc: "Movie Tickets", category: "Entertainment", amount: 650, type: "expense" },
  { id: 6, date: "2026-03-30", desc: "Rent", category: "Rent", amount: 18000, type: "expense" },
];

let currentRole = "admin";
let editingId = null;

// Categories
const categories = ["Food", "Rent", "Utilities", "Salary", "Freelance", "Entertainment", "Transport", "Shopping"];

// Render Transactions
function renderTransactions(filteredTransactions = transactions) {
  const tbody = document.getElementById("transactions-body");
  tbody.innerHTML = "";

  filteredTransactions.forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.date}</td>
      <td>${t.desc}</td>
      <td>${t.category}</td>
      <td class="amount ${t.type === 'income' ? 'income-amount' : 'expense-amount'}">
        ${t.type === 'income' ? '+' : '-'} ₹${t.amount.toLocaleString('en-IN')}
      </td>
      <td><span class="type-badge ${t.type}">${t.type}</span></td>
      <td>
        ${currentRole === 'admin' ? `
          <button onclick="editTransaction(${t.id})" class="btn-edit">✏️</button>
          <button onclick="deleteTransaction(${t.id})" class="btn-delete">🗑️</button>
        ` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Update Summary
function updateSummary() {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  document.getElementById("total-balance").textContent = `₹${balance.toLocaleString('en-IN')}`;
  document.getElementById("total-income").textContent = `₹${income.toLocaleString('en-IN')}`;
  document.getElementById("total-expense").textContent = `₹${expense.toLocaleString('en-IN')}`;
}

// Simple Charts using Chart.js (CDN)
function loadCharts() {
  // Balance Trend (Mock)
  new Chart(document.getElementById("balanceChart"), {
    type: 'line',
    data: {
      labels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
      datasets: [{
        label: 'Balance',
        data: [45000, 68000, 92000, 78000, 105000, 124850],
        borderColor: '#3b82f6',
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)'
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  // Spending Pie
  new Chart(document.getElementById("spendingChart"), {
    type: 'doughnut',
    data: {
      labels: ["Food", "Rent", "Utilities", "Entertainment", "Others"],
      datasets: [{
        data: [28450, 18000, 8500, 3200, 15600],
        backgroundColor: ["#ef4444", "#3b82f6", "#eab308", "#8b5cf6", "#64748b"]
      }]
    },
    options: { responsive: true }
  });
}

// Modal Functions
function openModal(isEdit = false) {
  document.getElementById("modal").style.display = "flex";
  document.getElementById("modal-title").textContent = isEdit ? "Edit Transaction" : "Add New Transaction";
  
  // Populate categories
  const catSelect = document.getElementById("trans-category");
  catSelect.innerHTML = "";
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    catSelect.appendChild(opt);
  });
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("transaction-form").reset();
  editingId = null;
}

// Form Submit
document.getElementById("transaction-form").addEventListener("submit", function(e) {
  e.preventDefault();

  const newTrans = {
    id: editingId || Date.now(),
    date: document.getElementById("trans-date").value,
    desc: document.getElementById("trans-desc").value,
    category: document.getElementById("trans-category").value,
    amount: parseInt(document.getElementById("trans-amount").value),
    type: document.getElementById("trans-type").value
  };

  if (editingId) {
    const index = transactions.findIndex(t => t.id === editingId);
    transactions[index] = newTrans;
  } else {
    transactions.unshift(newTrans);
  }

  renderTransactions();
  updateSummary();
  closeModal();
});

function editTransaction(id) {
  if (currentRole !== "admin") return;
  const trans = transactions.find(t => t.id === id);
  if (!trans) return;

  editingId = id;
  openModal(true);

  document.getElementById("trans-date").value = trans.date;
  document.getElementById("trans-desc").value = trans.desc;
  document.getElementById("trans-category").value = trans.category;
  document.getElementById("trans-amount").value = trans.amount;
  document.getElementById("trans-type").value = trans.type;
}

function deleteTransaction(id) {
  if (currentRole !== "admin") return;
  if (confirm("Delete this transaction?")) {
    transactions = transactions.filter(t => t.id !== id);
    renderTransactions();
    updateSummary();
  }
}

// Role Change
document.getElementById("role-select").addEventListener("change", function() {
  currentRole = this.value;
  renderTransactions(); // re-render to show/hide action buttons
});

// Search & Filter
document.getElementById("search-input").addEventListener("input", function() {
  const term = this.value.toLowerCase();
  const filtered = transactions.filter(t => 
    t.desc.toLowerCase().includes(term) || 
    t.category.toLowerCase().includes(term)
  );
  renderTransactions(filtered);
});

document.getElementById("filter-category").addEventListener("change", function() {
  const cat = this.value;
  let filtered = transactions;
  if (cat !== "all") {
    filtered = transactions.filter(t => t.category === cat);
  }
  renderTransactions(filtered);
});

// Add Button
document.getElementById("add-btn").addEventListener("click", () => {
  if (currentRole === "admin") openModal();
  else alert("Only Admin can add transactions.");
});

// Cancel Button
document.getElementById("cancel-btn").addEventListener("click", closeModal);

// Initialize Everything
function init() {
  // Populate filter categories
  const filterSelect = document.getElementById("filter-category");
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    filterSelect.appendChild(opt);
  });

  renderTransactions();
  updateSummary();
  loadCharts();

  // Show modal on load for demo (optional)
  // openModal();
}

window.onload = init;