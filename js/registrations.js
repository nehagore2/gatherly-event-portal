/* My registrations page: read registrations and create downloadable calendar reminders. */
document.addEventListener("DOMContentLoaded", () => {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
    const toast = $("#toast");
    let toastTimer;
    const eventData = {
        "city-music-night": { title: "City Music Night", date: "2026-11-07", price: 799, location: "Riverside Amphitheatre", time: "6:00 PM", image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=500&q=80" },
        "sunday-food-market": { title: "Sunday Food Market", date: "2026-10-25", price: 250, location: "Central Garden", time: "11:00 AM", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80" },
        "pottery-for-beginners": { title: "Pottery for Beginners", date: "2026-10-29", price: 650, location: "Studio Klay", time: "3:00 PM", image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=500&q=80" },
        "open-air-cinema": { title: "Open-Air Cinema", date: "2026-11-01", price: 399, location: "Botanical Garden", time: "7:00 PM", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80" },
        "independent-art-walk": { title: "Independent Art Walk", date: "2026-11-05", price: 299, location: "Old City Arts District", time: "4:30 PM", image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=500&q=80" },
        "sunrise-trail-walk": { title: "Sunrise Trail Walk", date: "2026-11-08", price: 549, location: "Vetal Tekdi Trail", time: "6:00 AM", image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=500&q=80" }
    };
    const money = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;
    const dateText = (date) => new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    const pad = (number) => String(number).padStart(2, "0");
    function formatCalendar(date) { return `${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`; }
    function to24Hour(time) {
        const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return "10:00";
        let hour = Number(match[1]); const minute = match[2]; const period = match[3].toUpperCase();
        if (period === "PM" && hour !== 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;
        return `${pad(hour)}:${minute}`;
    }
    function read() {
        try { const items = JSON.parse(localStorage.getItem("gatherlyEventRegistrations") || "[]"); return Array.isArray(items) ? items : []; }
        catch { return []; }
    }
    function save(items) { localStorage.setItem("gatherlyEventRegistrations", JSON.stringify(items)); }
    function notify(message) {
        toast.textContent = message; toast.classList.add("show"); window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
    }
    $("#todayLabel").textContent = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    function render() {
        const registrations = read();
        const today = new Date().toISOString().slice(0,10);
        const upcoming = registrations.filter((r) => r.eventDate >= today);
        $("#registeredCount").textContent = registrations.length;
        $("#upcomingCount").textContent = upcoming.length;
        $("#reminderCount").textContent = registrations.filter((r) => r.reminderSet).length;
        $("#navCount").textContent = registrations.length;
        const list = $("#registeredList");
        if (!registrations.length) {
            list.innerHTML = `<div class="empty-registrations"><span>▦</span><div><strong>No registrations yet</strong><p>Browse events and register to see your event details here.</p></div><a href="index.html#browse">Browse events →</a></div>`;
            return;
        }
        list.innerHTML = registrations.slice().reverse().map((r) => {
            const event = eventData[r.eventId]; if (!event) return "";
            return `<article class="registered-item"><img src="${event.image}" alt=""><div><h3>${event.title}</h3><p>${dateText(event.date)} · ${event.time} · ${r.attendees} ${r.attendees === 1 ? "attendee" : "attendees"}</p><div class="registration-code">${r.confirmation} · ${money(r.total)}</div></div><div class="registered-item-actions"><button class="reminder-button" data-action="reminder" data-code="${r.confirmation}" type="button">${r.reminderSet ? "Download again" : "Add reminder"}</button><button class="cancel-button" data-action="cancel" data-code="${r.confirmation}" type="button">Cancel</button></div></article>`;
        }).join("");
    }
    $("#registeredList").addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]"); if (!button) return;
        const registrations = read(); const index = registrations.findIndex((r) => r.confirmation === button.dataset.code);
        if (index < 0) return;
        if (button.dataset.action === "cancel") {
            if (!window.confirm(`Cancel registration for ${registrations[index].eventTitle}?`)) return;
            registrations.splice(index,1); save(registrations); render(); notify("Registration cancelled."); return;
        }
        const r = registrations[index]; const item = eventData[r.eventId];
        const start = new Date(`${item.date}T${to24Hour(item.time)}:00`);
        const end = new Date(start.getTime() + 60*60*1000);
        const content = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Gatherly//Event Reminder//EN","BEGIN:VEVENT",
            `UID:${r.confirmation}@gatherly.local`,`DTSTAMP:${formatCalendar(new Date())}`,`DTSTART:${formatCalendar(start)}`,
            `DTEND:${formatCalendar(end)}`,`SUMMARY:${item.title}`,`LOCATION:${item.location}`,
            `DESCRIPTION:Gatherly registration ${r.confirmation}`,"BEGIN:VALARM","TRIGGER:-PT1H","ACTION:DISPLAY",
            `DESCRIPTION:Reminder: ${item.title}`,"END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n");
        const url = URL.createObjectURL(new Blob([content], {type:"text/calendar;charset=utf-8"}));
        const a = document.createElement("a"); a.href = url; a.download = `${item.title.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-reminder.ics`;
        document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
        r.reminderSet = true; save(registrations); render(); notify("Calendar reminder downloaded. Open it to add it to your calendar.");
    });
    const menuButton = $("#mobileMenuButton"); const navigation = $("#navigation");
    menuButton.addEventListener("click", () => { const open = navigation.classList.toggle("open"); menuButton.setAttribute("aria-expanded",String(open)); });
    $$(".nav-link", navigation).forEach((link) => link.addEventListener("click", () => { navigation.classList.remove("open"); menuButton.setAttribute("aria-expanded","false"); }));
    render();
});