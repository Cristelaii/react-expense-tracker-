// ==============================
// Get HTML Elements
// ==============================

const transactionForm = document.getElementById("transactionForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expensesElement = document.getElementById("expenses");

const transactionList = document.getElementById("transactionList");
const categoryFilter = document.getElementById("categoryFilter");


// ==============================
// Load Saved Transactions
// ==============================

let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];


// ==============================
// Currency Formatter
// ==============================

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP"
    }).format(amount);
}


// ==============================
// Save to Local Storage
// ==============================

function saveTransactions() {
    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}


// ==============================
// Add Transaction
// ==============================

transactionForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;

    // Basic validation
    if (
        description === "" ||
        amount <= 0 ||
        date === ""
    ) {
        alert("Please enter valid transaction details.");
        return;
    }

    const transaction = {
        id: Date.now(),
        description: description,
        amount: amount,
        type: type,
        category: category,
        date: date
    };

    transactions.push(transaction);

    saveTransactions();
    updateApp();

    transactionForm.reset();

    // Return type to expense after reset
    typeInput.value = "expense";
});

// ==============================
// Edit Transaction
// ==============================

function editTransaction(id) {

    const transaction = transactions.find(function (transaction) {
        return transaction.id === id;
    });

    if (!transaction) {
        return;
    }

    // Put existing values back into the form
    descriptionInput.value = transaction.description;
    amountInput.value = transaction.amount;
    typeInput.value = transaction.type;
    categoryInput.value = transaction.category;
    dateInput.value = transaction.date;

    // Remove old transaction
    transactions = transactions.filter(function (transaction) {
        return transaction.id !== id;
    });

    saveTransactions();
    updateApp();

    // Move user back to the form
    transactionForm.scrollIntoView({
        behavior: "smooth"
    });

    descriptionInput.focus();
}
// ==============================
// Delete Transaction
// ==============================

function deleteTransaction(id) {
    transactions = transactions.filter(function (transaction) {
        return transaction.id !== id;
    });

    saveTransactions();
    updateApp();
}


// ==============================
// Calculate Summary
// ==============================

function updateSummary() {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(function (transaction) {

        if (transaction.type === "income") {
            totalIncome += transaction.amount;
        }

        if (transaction.type === "expense") {
            totalExpenses += transaction.amount;
        }
    });

    const balance = totalIncome - totalExpenses;

    balanceElement.textContent = formatCurrency(balance);
    incomeElement.textContent = formatCurrency(totalIncome);
    expensesElement.textContent = formatCurrency(totalExpenses);
}


// ==============================
// Display Transactions
// ==============================

function displayTransactions() {

    transactionList.innerHTML = "";

    const selectedCategory = categoryFilter.value;

    const filteredTransactions = transactions.filter(
        function (transaction) {

            if (selectedCategory === "all") {
                return true;
            }

            return transaction.category === selectedCategory;
        }
    );


    // No transactions
    if (filteredTransactions.length === 0) {

        transactionList.innerHTML = `
            <p id="emptyMessage">
                No transactions found.
            </p>
        `;

        return;
    }


    // Show newest transactions first
    const sortedTransactions = [...filteredTransactions].sort(
        function (a, b) {
            return new Date(b.date) - new Date(a.date);
        }
    );


    sortedTransactions.forEach(function (transaction) {

        const transactionItem = document.createElement("div");

        transactionItem.classList.add("transaction-item");


        // + for income
        // - for expense

        const sign =
            transaction.type === "income" ? "+" : "-";


        transactionItem.innerHTML = `
            <div class="transaction-info">

                <h4>${transaction.description}</h4>

                <p>
                    ${transaction.category}
                    •
                    ${transaction.date}
                </p>

            </div>

            <div class="transaction-actions">

                <span class="${transaction.type}">
                    ${sign}${formatCurrency(transaction.amount)}
                </span>

                <button
                    class="edit-btn"
                    onclick="editTransaction(${transaction.id})"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTransaction(${transaction.id})"
                >
                    Delete
                </button>

            </div>
        `;

        transactionList.appendChild(transactionItem);
    });
}


// ==============================
// Category Filter
// ==============================

categoryFilter.addEventListener("change", function () {
    displayTransactions();
});


// ==============================
// Update Entire App
// ==============================

function updateApp() {
    updateSummary();
    displayTransactions();
}


// ==============================
// Set Today's Date Automatically
// ==============================

function setTodayDate() {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    dateInput.value = `${year}-${month}-${day}`;
}


// ==============================
// Start Application
// ==============================

updateApp();
setTodayDate();

