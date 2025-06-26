// Step 1: Define the quotes array
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", category: "Identity" }
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Step 2: Show a random quote
function showRandomQuote() {
  if (quotes.length === 0) return;

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p><strong>${quote.category}</strong>: "${quote.text}"</p>`;

  // Save last quote in session storage
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Step 3: Add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });
 saveQuotes(); // <-- Save to localStorage
    textInput.value = "";
    categoryInput.value = "";

    alert("Quote added successfully!");
    populateCategories(); // in case it's a new category
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// Step 4: Create and insert the Add Quote form
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";
  quoteInput.id = "newQuoteText";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.id = "newQuoteCategory";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// Step 5: Add event listener for the "Show New Quote" button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Step 6: Run on page load
window.onload = function () {
  showRandomQuote();
  createAddQuoteForm();
};

function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        throw new Error("Invalid file format");
      }
    } catch (err) {
      alert("Failed to import: " + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const dropdown = document.getElementById("categoryFilter");

  // Remember previous selection
  const lastSelected = localStorage.getItem("selectedCategory");

  dropdown.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    dropdown.appendChild(option);
  });

  if (lastSelected) {
    dropdown.value = lastSelected;
    filterQuotes(); // Reapply filter
  }
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory); // Persist selection

  let filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available for this category.</p>";
    return;
  }

  filtered.forEach(q => {
    const p = document.createElement("p");
    p.innerHTML = `<strong>${q.category}</strong>: "${q.text}"`;
    quoteDisplay.appendChild(p);
  });
}

window.onload = () => {
  populateCategories();
  filterQuotes(); // Apply last filter
};

async function fetchQuotesFromServer() {
  // Simulate a server API (could be replaced with actual backend endpoint)
  const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
  const serverData = await response.json();

  // Transform dummy server data to fit quote structure
  return serverData.map(post => ({
    text: post.title,
    category: 'Server'
  }));
}

async function syncWithServer() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    let newQuotesAdded = 0;

    serverQuotes.forEach(serverQuote => {
      const exists = quotes.some(
        localQuote => localQuote.text === serverQuote.text && localQuote.category === serverQuote.category
      );

      if (!exists) {
        quotes.push(serverQuote);
        newQuotesAdded++;
      }
    });

    if (newQuotesAdded > 0) {
      saveQuotes();
      populateCategories();
      filterQuotes(); // or showRandomQuote()
      showNotification(`${newQuotesAdded} new quote(s) synced from server`);
    }

  } catch (error) {
    console.error("Sync failed:", error);
    showNotification("Sync failed. Please try again.", true);
  }
}

function showNotification(message, isError = false) {
  const notif = document.getElementById("notification");
  notif.style.display = "block";
  notif.style.backgroundColor = isError ? "#f8d7da" : "#d1e7dd";
  notif.style.color = isError ? "#842029" : "#0f5132";
  notif.textContent = message;

  setTimeout(() => {
    notif.style.display = "none";
  }, 5000);
}

setInterval(syncWithServer, 30000); // sync every 30 seconds

