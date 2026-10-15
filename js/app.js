/* Event browser page interactions. Registration is handled on register.html. */
document.addEventListener("DOMContentLoaded", () => {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
    const rows = $$(".event-row");
    const searchInput = $("#searchInput");
    const categoryFilter = $("#categoryFilter");
    const dateFilter = $("#dateFilter");
    const sortFilter = $("#sortFilter");
    const eventDialog = $("#eventDialog");
    const toast = $("#toast");
    let toastTimeout;

    const eventData = Object.fromEntries(rows.map((row) => [row.dataset.id, {
        id: row.dataset.id, title: row.dataset.title, category: row.dataset.category,
        date: row.dataset.date, price: Number(row.dataset.price), location: row.dataset.location,
        image: $(".event-thumb", row).src, description: $(".event-description", row).textContent,
        time: $(".event-details", row).children[2].textContent.replace("◷ ", "")
    }]));
    const money = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;
    const dateText = (date) => new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    $("#todayLabel").textContent = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

    function getRegistrations() {
        try { const data = JSON.parse(localStorage.getItem("gatherlyEventRegistrations") || "[]"); return Array.isArray(data) ? data : []; }
        catch { return []; }
    }
    $("#navCount").textContent = getRegistrations().length;

    function notify(message) {
        toast.textContent = message; toast.classList.add("show");
        window.clearTimeout(toastTimeout);
        toastTimeout = window.setTimeout(() => toast.classList.remove("show"), 2500);
    }

    function applyFilters() {
        const query = searchInput.value.trim().toLowerCase();
        const category = categoryFilter.value;
        const date = dateFilter.value;
        const visibleRows = rows.filter((row) => {
            const visible = (!query || row.dataset.title.toLowerCase().includes(query) || row.dataset.location.toLowerCase().includes(query))
                && (category === "all" || row.dataset.category === category)
                && (!date || row.dataset.date === date);
            row.hidden = !visible;
            return visible;
        });
        visibleRows.sort((a, b) => {
            if (sortFilter.value === "price-low") return Number(a.dataset.price) - Number(b.dataset.price);
            if (sortFilter.value === "price-high") return Number(b.dataset.price) - Number(a.dataset.price);
            if (sortFilter.value === "name") return a.dataset.title.localeCompare(b.dataset.title);
            return a.dataset.date.localeCompare(b.dataset.date);
        });
        visibleRows.forEach((row) => $("#eventList").appendChild(row));
        $("#resultsCount").textContent = `Showing ${visibleRows.length} ${visibleRows.length === 1 ? "event" : "events"}`;
        $("#emptyState").hidden = visibleRows.length > 0;
    }
    [searchInput, categoryFilter, dateFilter, sortFilter].forEach((control) => {
        control.addEventListener("input", applyFilters); control.addEventListener("change", applyFilters);
    });
    function resetFilters() {
        searchInput.value = ""; categoryFilter.value = "all"; dateFilter.value = ""; sortFilter.value = "date"; applyFilters();
    }
    $("#resetFilters").addEventListener("click", resetFilters);
    $("#emptyReset").addEventListener("click", resetFilters);

    function showEventDetails(event) {
        $("#dialogContent").innerHTML = `
            <img class="dialog-event-image" src="${event.image}" alt="">
            <span class="category-tag">${event.category}</span><h2>${event.title}</h2><p>${event.description}</p>
            <div class="dialog-info"><div><small>Event date</small><strong>${dateText(event.date)}</strong></div><div><small>Start time</small><strong>${event.time}</strong></div><div><small>Location</small><strong>${event.location}</strong></div><div><small>Category</small><strong>${event.category}</strong></div></div>
            <div class="dialog-bottom"><div><small>Ticket price</small><strong>${money(event.price)}</strong></div><a class="button button-primary" href="register.html?id=${encodeURIComponent(event.id)}">Register for event →</a></div>`;
        eventDialog.showModal();
    }
    rows.forEach((row) => {
        const event = eventData[row.dataset.id];
        $(".register-button", row).addEventListener("click", () => { window.location.href = `register.html?id=${encodeURIComponent(event.id)}`; });
        $(".details-button", row).addEventListener("click", () => showEventDetails(event));
        $(".event-thumb", row).addEventListener("click", () => showEventDetails(event));
        $(".event-thumb", row).style.cursor = "pointer";
    });

    const menuButton = $("#mobileMenuButton");
    const navigation = $("#navigation");
    menuButton.addEventListener("click", () => {
        const open = navigation.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", String(open));
        menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$(".nav-link", navigation).forEach((link) => link.addEventListener("click", () => {
        navigation.classList.remove("open"); menuButton.setAttribute("aria-expanded", "false");
    }));
    applyFilters();
});