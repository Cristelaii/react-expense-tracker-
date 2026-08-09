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


// Keeps track of transaction being edited
let editingTransactionId = null;


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

    const submitButton =
        transactionForm.querySelector(
            'button[type="submit"]'
        );

    submitButton.textContent = "Add Transaction";
});


// ==============================
// Edit Transaction
// ==============================

function editTransaction(id) {

    // Find transaction
    const transaction = transactions.find(
        function (transaction) {

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

    const submitButton =
        transactionForm.querySelector(
            'button[type="submit"]'
        );

    submitButton.textContent =
        "Update Transaction";


    // Scroll back to form

    transactionForm.scrollIntoView({
        behavior: "smooth"
    });


    // Put cursor inside description

    descriptionInput.focus();
}


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


    // ==========================
    // Filter Transactions
    // ==========================

    const filteredTransactions =
        transactions.filter(
            function (transaction) {

                if (
                    selectedCategory === "all"
                ) {

                    return true;
                }


                return (
                    transaction.category ===
                    selectedCategory
                );
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
// Category Filter
// ==============================

categoryFilter.addEventListener(
    "change",
    function () {

        displayTransactions();
    }
);


// ==============================
// Update Entire Application
// ==============================

function updateApp() {

    updateSummary();

    displayTransactions();
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

updateApp();

setTodayDate();
