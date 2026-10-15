/* Dedicated event registration page. */
document.addEventListener("DOMContentLoaded", () => {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("id") || "city-music-night";
    const events = {
        "city-music-night": { id:"city-music-night", title:"City Music Night", category:"Music", date:"2026-11-07", price:799, location:"Riverside Amphitheatre", time:"6:00 PM", image:"https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=500&q=80" },
        "sunday-food-market": { id:"sunday-food-market", title:"Sunday Food Market", category:"Food & drink", date:"2026-10-25", price:250, location:"Central Garden", time:"11:00 AM", image:"https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80" },
        "pottery-for-beginners": { id:"pottery-for-beginners", title:"Pottery for Beginners", category:"Workshop", date:"2026-10-29", price:650, location:"Studio Klay", time:"3:00 PM", image:"https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=500&q=80" },
        "open-air-cinema": { id:"open-air-cinema", title:"Open-Air Cinema", category:"Outdoor", date:"2026-11-01", price:399, location:"Botanical Garden", time:"7:00 PM", image:"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80" },
        "independent-art-walk": { id:"independent-art-walk", title:"Independent Art Walk", category:"Art & culture", date:"2026-11-05", price:299, location:"Old City Arts District", time:"4:30 PM", image:"https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=500&q=80" },
        "sunrise-trail-walk": { id:"sunrise-trail-walk", title:"Sunrise Trail Walk", category:"Outdoor", date:"2026-11-08", price:549, location:"Vetal Tekdi Trail", time:"6:00 AM", image:"https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=500&q=80" }
    };
    const item = events[eventId] || events["city-music-night"];
    const money = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;
    const dateText = (date) => new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {weekday:"short",day:"numeric",month:"short",year:"numeric"});
    $("#todayLabel").textContent = new Date().toLocaleDateString("en-IN", {weekday:"short",day:"numeric",month:"short",year:"numeric"});
    $("#navCount").textContent = getRegistrations().length;
    $("#selectedEventId").value = item.id;
    $("#previewImage").src = item.image; $("#previewImage").alt = item.title;
    $("#previewCategory").textContent = item.category; $("#previewTitle").textContent = item.title;
    $("#previewDetails").textContent = `${dateText(item.date)} · ${item.time} · ${item.location}`;
    $("#previewPrice").textContent = money(item.price);
    $("#registrationSubtitle").textContent = `Complete the form to register for ${item.title}.`;
    $("#registrationDate").value = item.date;
    $("#registrationDate").min = new Date().toISOString().slice(0,10);

    function getRegistrations() {
        try { const data = JSON.parse(localStorage.getItem("gatherlyEventRegistrations") || "[]"); return Array.isArray(data) ? data : []; }
        catch { return []; }
    }
    function updateTotal() { $("#estimatedTotal").textContent = money(item.price * Number($("#attendees").value)); }
    $("#attendees").addEventListener("change", updateTotal); updateTotal();
    const rules = [["firstName","First name"],["lastName","Last name"],["email","Email address"],["registrationDate","Registration date"]];
    function validate(input) {
        let message = "";
        if (input.required && !input.value.trim()) message = "This field is required.";
        else if (input.type === "email" && !input.checkValidity()) message = "Enter a valid email address.";
        else if (input.minLength > 0 && input.value.trim().length < input.minLength) message = `Enter at least ${input.minLength} characters.`;
        else if (input.id === "registrationDate" && input.value < new Date().toISOString().slice(0,10)) message = "Choose today or a future date.";
        const error = $(".error-text", input.parentElement);
        if (error) error.textContent = message;
        input.classList.toggle("invalid", Boolean(message));
        return !message;
    }
    rules.forEach(([id]) => {
        const input = $("#"+id);
        input.addEventListener("blur", () => validate(input));
        input.addEventListener("input", () => { if (input.classList.contains("invalid")) validate(input); });
    });
    $("#consent").addEventListener("change", () => { $("#consentError").textContent = $("#consent").checked ? "" : "Please confirm before submitting."; });

    $("#registrationForm").addEventListener("submit", (event) => {
        event.preventDefault();
        let valid = true;
        rules.forEach(([id]) => { if (!validate($("#"+id))) valid = false; });
        if (!$("#consent").checked) { $("#consentError").textContent = "Please confirm before submitting."; valid = false; }
        else $("#consentError").textContent = "";
        if (!valid) { $(".invalid")?.focus(); return; }
        const registration = {
            confirmation:"GT-"+Math.random().toString(36).slice(2,8).toUpperCase(),
            eventId:item.id,eventTitle:item.title,eventDate:item.date,registrationDate:$("#registrationDate").value,
            firstName:$("#firstName").value.trim(),lastName:$("#lastName").value.trim(),email:$("#email").value.trim(),
            phone:$("#phone").value.trim(),attendees:Number($("#attendees").value),total:item.price*Number($("#attendees").value),
            createdAt:new Date().toISOString(),reminderSet:false
        };
        try {
            const registrations = getRegistrations(); registrations.push(registration);
            localStorage.setItem("gatherlyEventRegistrations",JSON.stringify(registrations));
        } catch {
            window.alert("The browser could not save this registration. Please check storage settings."); return;
        }
        $("#registrationForm").hidden = true;
        $("#registrationSuccess").hidden = false;
        $("#successCopy").textContent = `${registration.firstName}, you're registered for ${item.title} on ${dateText(item.date)}. Your details are saved in this browser.`;
        $("#confirmationCode").textContent = `CONFIRMATION NUMBER: ${registration.confirmation}`;
    });
    const menuButton = $("#mobileMenuButton"); const navigation = $("#navigation");
    menuButton.addEventListener("click", () => { const open = navigation.classList.toggle("open"); menuButton.setAttribute("aria-expanded",String(open)); });
    $$(".nav-link",navigation).forEach((link) => link.addEventListener("click", () => { navigation.classList.remove("open"); menuButton.setAttribute("aria-expanded","false"); }));
});