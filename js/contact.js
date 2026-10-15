/* Contact page form validation and demo acknowledgement. */
document.addEventListener("DOMContentLoaded", () => {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
    $("#todayLabel").textContent = new Date().toLocaleDateString("en-IN", {weekday:"short",day:"numeric",month:"short",year:"numeric"});
    try { $("#navCount").textContent = JSON.parse(localStorage.getItem("gatherlyEventRegistrations") || "[]").length; } catch { $("#navCount").textContent = "0"; }
    const menuButton = $("#mobileMenuButton"); const navigation = $("#navigation");
    menuButton.addEventListener("click", () => { const open = navigation.classList.toggle("open"); menuButton.setAttribute("aria-expanded",String(open)); });
    $$(".nav-link",navigation).forEach((link) => link.addEventListener("click", () => { navigation.classList.remove("open"); menuButton.setAttribute("aria-expanded","false"); }));

    const form = $("#contactForm");
    function validate(input) {
        let message = "";
        if (input.required && !input.value.trim()) message = "This field is required.";
        else if (input.type === "email" && !input.checkValidity()) message = "Enter a valid email address.";
        else if (input.minLength > 0 && input.value.trim().length < input.minLength) message = `Please enter at least ${input.minLength} characters.`;
        const error = $(".error-text",input.parentElement);
        if (error) error.textContent = message;
        input.classList.toggle("invalid",Boolean(message));
        return !message;
    }
    $$("input[required], select[required], textarea[required]",form).forEach((input) => {
        input.addEventListener("blur",() => validate(input));
        input.addEventListener("input",() => { if(input.classList.contains("invalid")) validate(input); });
        input.addEventListener("change",() => { if(input.classList.contains("invalid")) validate(input); });
    });
    form.addEventListener("submit",(event) => {
        event.preventDefault();
        const fields = $$("input[required], select[required], textarea[required]",form);
        const valid = fields.map(validate).every(Boolean);
        if (!valid) { $(".invalid",form)?.focus(); return; }
        $("#contactSuccessText").textContent = `Thank you, ${$("#contactName").value.trim()}. Your message has been prepared successfully in this demo. No email was sent.`;
        form.hidden = true;
        $("#contactSuccess").hidden = false;
    });
    $("#sendAnother").addEventListener("click",() => {
        form.reset(); form.hidden = false; $("#contactSuccess").hidden = true;
        $$(".error-text",form).forEach((error) => error.textContent = "");
        $$(".invalid",form).forEach((input) => input.classList.remove("invalid"));
    });
});