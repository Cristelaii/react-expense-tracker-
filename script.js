// ==============================
// Get HTML Elements
// ==============================
const searchInput = document.getElementById("searchInput");
const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEditButton");
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
const chartMonth = document.getElementById("chartMonth");
const expenseChartCanvas =
    document.getElementById("expenseChart");

let expenseChart = null;


// ==============================
// Load Saved Transactions
// ==============================

let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];


// Keeps track of transaction being edited
let editingTransactionId = null;


// ==============================
// Currency Formatter
// ==============================
function setCurrentMonth() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    chartMonth.value = `${year}-${month}`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP"
    }).format(amount);
}


// ==============================
// Save Transactions
// ==============================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}


// ==============================
// Add / Update Transaction
// ==============================

transactionForm.addEventListener("submit", function (event) {

    event.preventDefault();


    // Get form values

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;


    // ==========================
    // Validation
    // ==========================

    if (
        description === "" ||
        amount <= 0 ||
        date === ""
    ) {

        alert("Please enter valid transaction details.");

        return;
    }


    // ==========================
    // UPDATE TRANSACTION
    // ==========================

    if (editingTransactionId !== null) {

        const transaction = transactions.find(
            function (transaction) {

                return (
                    transaction.id === editingTransactionId
                );
            }
        );


        if (transaction) {

            transaction.description = description;
            transaction.amount = amount;
            transaction.type = type;
            transaction.category = category;
            transaction.date = date;
        }


        // Finished editing
        editingTransactionId = null;
    }


    // ==========================
    // ADD NEW TRANSACTION
    // ==========================

    else {

        const transaction = {

            id: Date.now(),

            description: description,

            amount: amount,

            type: type,

            category: category,

            date: date
        };


        transactions.push(transaction);
    }


    // ==========================
    // Save Changes
    // ==========================

    saveTransactions();


    // Refresh dashboard
    updateApp();


    // Clear form
    transactionForm.reset();


    // Return type to expense
    typeInput.value = "expense";


    // Return date to today
    setTodayDate();


    // Return button to Add mode

    submitButton.textContent = "Add Transaction";
    cancelEditButton.style.display = "none";

    }); // ← THIS WAS MISSING


    // ==============================
    // Edit Transaction
    // ==============================

    function editTransaction(id) {

    // Find transaction
    const transaction = transactions.find(function (transaction) {

            return transaction.id === id;
        }
    );


    // Stop if transaction doesn't exist
    if (!transaction) {
        return;
    }


    // Remember which transaction
    // is currently being edited

    editingTransactionId = id;


    // Fill form with existing data

    descriptionInput.value =
        transaction.description;

    amountInput.value =
        transaction.amount;

    typeInput.value =
        transaction.type;

    categoryInput.value =
        transaction.category;

    dateInput.value =
        transaction.date;


    // Change button text

    submitButton.textContent = "Update Transaction";
    cancelEditButton.style.display = "block";

    
    // Scroll back to form

    transactionForm.scrollIntoView({
        behavior: "smooth"
    });


    // Put cursor inside description

    descriptionInput.focus();
}
    // ==============================
    // Cancel Edit
    // ==============================

    cancelEditButton.addEventListener("click", function () {

        editingTransactionId = null;

        transactionForm.reset();

        typeInput.value = "expense";

        setTodayDate();

        submitButton.textContent = "Add Transaction";

        cancelEditButton.style.display = "none";
    });



// ==============================
// Delete Transaction
// ==============================

function deleteTransaction(id) {

    transactions = transactions.filter(
        function (transaction) {

            return transaction.id !== id;
        }
    );


    saveTransactions();

    updateApp();
}


// ==============================
// Calculate Summary
// ==============================

function updateSummary() {

    let totalIncome = 0;

    let totalExpenses = 0;


    transactions.forEach(
        function (transaction) {

            if (transaction.type === "income") {

                totalIncome +=
                    transaction.amount;
            }


            if (transaction.type === "expense") {

                totalExpenses +=
                    transaction.amount;
            }
        }
    );


    // Calculate balance

    const balance =
        totalIncome - totalExpenses;


    // Update dashboard

    balanceElement.textContent =
        formatCurrency(balance);

    incomeElement.textContent =
        formatCurrency(totalIncome);

    expensesElement.textContent =
        formatCurrency(totalExpenses);
}


// ==============================
// Display Transactions
// ==============================

function displayTransactions() {

    // Clear transaction list

    transactionList.innerHTML = "";


    // Get selected category

    const selectedCategory =
        categoryFilter.value;
    const searchText = searchInput.value
    .trim()
    .toLowerCase();


    // ==========================
    // Filter Transactions
    // ==========================

    const filteredTransactions = transactions.filter(
    function (transaction) {

        const matchesCategory =
            selectedCategory === "all" ||
            transaction.category === selectedCategory;

        const matchesSearch =
            transaction.description
                .toLowerCase()
                .includes(searchText);

        return matchesCategory && matchesSearch;
    }
);
    

    // ==========================
    // Empty List
    // ==========================

    if (filteredTransactions.length === 0) {

        transactionList.innerHTML = `
            <p id="emptyMessage">
                No transactions found.
            </p>
        `;

        return;
    }


    // ==========================
    // Sort Newest First
    // ==========================

    const sortedTransactions =
        [...filteredTransactions].sort(
            function (a, b) {

                return (
                    new Date(b.date) -
                    new Date(a.date)
                );
            }
        );


    // ==========================
    // Create Transaction Cards
    // ==========================

    sortedTransactions.forEach(
        function (transaction) {

            const transactionItem =
                document.createElement("div");


            transactionItem.classList.add(
                "transaction-item"
            );


            // Income = +
            // Expense = -

            const sign =
                transaction.type === "income"
                    ? "+"
                    : "-";


            transactionItem.innerHTML = `

                <div class="transaction-info">

                    <h4>
                        ${transaction.description}
                    </h4>

                    <p>
                        ${transaction.category}
                        •
                        ${transaction.date}
                    </p>

                </div>


                <div class="transaction-actions">

                    <span class="${transaction.type}">

                        ${sign}${formatCurrency(
                            transaction.amount
                        )}

                    </span>


                    <button
                        class="edit-btn"
                        onclick="editTransaction(
                            ${transaction.id}
                        )"
                    >
                        Edit
                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteTransaction(
                            ${transaction.id}
                        )"
                    >
                        Delete
                    </button>

                </div>
            `;


            transactionList.appendChild(
                transactionItem
            );
        }
    );
}



// ==============================
// Search Transactions
// ==============================

searchInput.addEventListener("input", function () {
    displayTransactions();
});


// ==============================
// Category Filter
// ==============================

categoryFilter.addEventListener("change", function () {
    displayTransactions();
});

// ==============================
// Update Entire Application
// ==============================

function updateApp() {
    updateSummary();
    displayTransactions();
    updateExpenseChart();
}

// ==============================
// Expense Chart
// ==============================

function updateExpenseChart() {

    const selectedMonth = chartMonth.value;

    const categoryTotals = {
        Food: 0,
        Transportation: 0,
        Bills: 0,
        Shopping: 0,
        Other: 0
    };


    // Find expenses for selected month
    transactions.forEach(function (transaction) {

        const transactionMonth =
            transaction.date.slice(0, 7);

        if (
            transaction.type === "expense" &&
            transactionMonth === selectedMonth
        ) {

            if (categoryTotals[transaction.category] !== undefined) {
                categoryTotals[transaction.category] +=
                    transaction.amount;
            }
        }
    });

            chartMonth.addEventListener("change", function () {
            updateExpenseChart();
        });


    const labels = Object.keys(categoryTotals);

    const data = Object.values(categoryTotals);


    // Destroy previous chart before creating new one
    if (expenseChart) {
        expenseChart.destroy();
    }


    expenseChart = new Chart(expenseChartCanvas, {

        type: "doughnut",

        data: {

            labels: labels,

            datasets: [{
                label: "Expenses",
                data: data,
                borderWidth: 2
            }]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    position: "bottom"
                },

                tooltip: {

                    callbacks: {

                        label: function (context) {

                            return (
                                context.label +
                                ": " +
                                formatCurrency(context.raw)
                            );
                        }
                    }
                }
            }
        }
    });
}

// ==============================
// Set Today's Date
// ==============================

function setTodayDate() {

    const today = new Date();


    const year =
        today.getFullYear();


    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");


    const day = String(
        today.getDate()
    ).padStart(2, "0");


    dateInput.value =
        `${year}-${month}-${day}`;
}


// ==============================
// Start Application
// ==============================

setCurrentMonth();
updateApp();
setTodayDate();
