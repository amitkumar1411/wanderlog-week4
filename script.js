// Wanderlog Week 3: localStorage CRUD + photo uploads + public profile support.

const STORAGE_KEY = "wanderlogTrips";
const PROFILE_KEY = "wanderlogProfile";
const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // Keep Base64 storage reasonably safe for localStorage.

const menuButton = document.getElementById("menuButton");
const mainNav = document.getElementById("mainNav");
const tripForm = document.getElementById("tripForm");
const formHeading = document.getElementById("formHeading");
const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const formStatus = document.getElementById("formStatus");
const destinationGrid = document.getElementById("destinationGrid");
const emptyState = document.getElementById("emptyState");
const tripCount = document.getElementById("tripCount");

const titleInput = document.getElementById("title");
const destinationInput = document.getElementById("destination");
const dateInput = document.getElementById("date");
const notesInput = document.getElementById("notes");
const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("photoPreview");
const photoPreviewImage = document.getElementById("photoPreviewImage");
const photoPlaceholder = document.getElementById("photoPlaceholder");
const photoHelp = document.getElementById("photoHelp");

const titleError = document.getElementById("titleError");
const destinationError = document.getElementById("destinationError");
const dateError = document.getElementById("dateError");
const photoError = document.getElementById("photoError");

const detailModal = document.getElementById("detailModal");
const detailModalContent = document.getElementById("detailModalContent");
const closeDetailButton = document.getElementById("closeDetailButton");

const profileForm = document.getElementById("profileForm");
const profileNameInput = document.getElementById("profileName");
const profileBioInput = document.getElementById("profileBio");
const profileStatus = document.getElementById("profileStatus");
const profileLink = document.getElementById("profileLink");

let editingTripId = null;
let pendingPhotoData = "";
let lastFocusedElement = null;

// Consistent trip model used throughout the application.
// { id, title, destination, date, notes, coverImageUrl }

function createId() {
    return window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getTrips() {
    try {
        const savedTrips = localStorage.getItem(STORAGE_KEY);
        if (!savedTrips) return [];

        const parsedTrips = JSON.parse(savedTrips);
        return Array.isArray(parsedTrips)
            ? parsedTrips.map(normalizeTrip)
            : [];
    } catch (error) {
        console.error("Unable to read trips from localStorage:", error);
        return [];
    }
}

function normalizeTrip(trip) {
    return {
        id: trip.id || createId(),
        title: trip.title || "Untitled trip",
        destination: trip.destination || "Unknown destination",
        date: trip.date || "",
        notes: trip.notes || "",
        coverImageUrl: trip.coverImageUrl || ""
    };
}

function saveTrips(trips) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
        return true;
    } catch (error) {
        console.error("Unable to save trips to localStorage:", error);
        formStatus.textContent = "The photo may be too large for browser storage. Try a smaller image.";
        return false;
    }
}

function createTrip(data) {
    return {
        id: createId(),
        title: data.title,
        destination: data.destination,
        date: data.date,
        notes: data.notes,
        coverImageUrl: data.coverImageUrl || ""
    };
}

function escapeHTML(value = "") {
    return String(value).replace(/[&<>'"]/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#039;",
        '"': "&quot;"
    })[character]);
}

function formatDate(dateString) {
    if (!dateString) return "Date not specified";

    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function getInitials(title) {
    const initials = String(title)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();

    return initials || "WL";
}

function getDefaultProfile() {
    return {
        name: "Your Name",
        bio: "A curious traveller collecting places, stories and small moments."
    };
}

function getProfile() {
    try {
        const savedProfile = localStorage.getItem(PROFILE_KEY);
        if (!savedProfile) return getDefaultProfile();

        const parsed = JSON.parse(savedProfile);
        return {
            name: String(parsed.name || getDefaultProfile().name).trim(),
            bio: String(parsed.bio || getDefaultProfile().bio).trim()
        };
    } catch (error) {
        console.error("Unable to read profile from localStorage:", error);
        return getDefaultProfile();
    }
}

function saveProfile(profile) {
    try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        return true;
    } catch (error) {
        console.error("Unable to save profile:", error);
        return false;
    }
}

function slugify(value) {
    return String(value)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "wanderer";
}

function getProfileUrl() {
    return `profile.html?user=${encodeURIComponent(slugify(getProfile().name))}`;
}

function updateProfileLink() {
    if (!profileLink) return;
    const url = getProfileUrl();
    profileLink.href = url;
    profileLink.textContent = url;
}

function createImageMarkup(trip, className = "trip-card-image") {
    if (!trip.coverImageUrl) {
        return `<div class="${className} image-placeholder"><span>${escapeHTML(getInitials(trip.title))}</span><small>No cover photo</small></div>`;
    }

    return `
        <div class="${className} image-frame">
            <img src="${escapeHTML(trip.coverImageUrl)}" alt="Cover photo for ${escapeHTML(trip.title)}" loading="lazy">
            <div class="image-fallback hidden">${escapeHTML(getInitials(trip.title))}<small>Photo unavailable</small></div>
        </div>
    `;
}

function bindImageFallbacks(container) {
    container.querySelectorAll(".image-frame img").forEach((image) => {
        image.addEventListener("error", () => {
            image.classList.add("hidden");
            const fallback = image.parentElement.querySelector(".image-fallback");
            fallback?.classList.remove("hidden");
        }, { once: true });
    });
}

function renderTrips() {
    const trips = getTrips();

    destinationGrid.innerHTML = "";
    tripCount.textContent = `${trips.length} ${trips.length === 1 ? "trip" : "trips"}`;

    if (trips.length === 0) {
        destinationGrid.classList.add("hidden");
        emptyState.classList.remove("hidden");
        return;
    }

    destinationGrid.classList.remove("hidden");
    emptyState.classList.add("hidden");

    trips.forEach((trip, index) => {
        const card = document.createElement("article");
        card.className = "destination-card trip-card";
        card.innerHTML = `
            ${createImageMarkup(trip)}
            <div class="trip-card-body">
                <div class="trip-card-top">
                    <div class="destination-icon">${String(index + 1).padStart(2, "0")}</div>
                    <div class="trip-actions">
                        <button type="button" class="icon-button view-button" data-action="view" data-id="${escapeHTML(trip.id)}">View</button>
                        <button type="button" class="icon-button edit-button" data-action="edit" data-id="${escapeHTML(trip.id)}">Edit</button>
                        <button type="button" class="icon-button delete-button" data-action="delete" data-id="${escapeHTML(trip.id)}">Delete</button>
                    </div>
                </div>
                <h3>${escapeHTML(trip.title)}</h3>
                <p class="trip-destination">${escapeHTML(trip.destination)}</p>
                <p class="trip-date">${escapeHTML(formatDate(trip.date))}</p>
                ${trip.notes ? `<p class="trip-notes">${escapeHTML(trip.notes)}</p>` : ""}
            </div>
        `;

        destinationGrid.appendChild(card);
    });

    bindImageFallbacks(destinationGrid);
}

function clearErrors() {
    titleError.textContent = "";
    destinationError.textContent = "";
    dateError.textContent = "";
    photoError.textContent = "";
    [titleInput, destinationInput, dateInput, photoInput].forEach((input) => input.classList.remove("input-error"));
}

function validateForm() {
    clearErrors();
    let isValid = true;

    if (!titleInput.value.trim()) {
        titleError.textContent = "Trip title is required.";
        titleInput.classList.add("input-error");
        isValid = false;
    }

    if (!destinationInput.value.trim()) {
        destinationError.textContent = "Destination is required.";
        destinationInput.classList.add("input-error");
        isValid = false;
    }

    if (!dateInput.value) {
        dateError.textContent = "Date is required.";
        dateInput.classList.add("input-error");
        isValid = false;
    }

    const file = photoInput.files[0];
    if (file) {
        if (!file.type.startsWith("image/")) {
            photoError.textContent = "Please choose a valid image file.";
            photoInput.classList.add("input-error");
            isValid = false;
        } else if (file.size > MAX_IMAGE_SIZE) {
            photoError.textContent = "Please choose an image smaller than 4 MB.";
            photoInput.classList.add("input-error");
            isValid = false;
        }
    }

    return isValid;
}

function showPhotoPreview(dataUrl) {
    pendingPhotoData = dataUrl || "";

    if (!dataUrl) {
        photoPreview.classList.add("hidden");
        photoPlaceholder.classList.remove("hidden");
        return;
    }

    photoPreviewImage.src = dataUrl;
    photoPreviewImage.alt = `Preview for ${titleInput.value || "trip"}`;
    photoPreview.classList.remove("hidden");
    photoPlaceholder.classList.add("hidden");
}

function resetPhotoPreview() {
    pendingPhotoData = "";
    photoInput.value = "";
    photoPreviewImage.removeAttribute("src");
    photoPreview.classList.add("hidden");
    photoPlaceholder.classList.remove("hidden");
    photoHelp.textContent = "JPG, PNG, WEBP · up to 4 MB";
}

function resetForm() {
    tripForm.reset();
    clearErrors();
    resetPhotoPreview();
    editingTripId = null;
    formHeading.textContent = "Add a new trip";
    submitButton.textContent = "Save trip";
    cancelEditButton.classList.add("hidden");
    formStatus.textContent = "";
}

function startEdit(tripId) {
    const trip = getTrips().find((item) => item.id === tripId);
    if (!trip) return;

    editingTripId = trip.id;
    titleInput.value = trip.title || "";
    destinationInput.value = trip.destination || "";
    dateInput.value = trip.date || "";
    notesInput.value = trip.notes || "";
    photoInput.value = "";

    clearErrors();
    showPhotoPreview(trip.coverImageUrl || "");
    photoHelp.textContent = trip.coverImageUrl
        ? "Current cover photo shown above. Choose another image to replace it."
        : "JPG, PNG, WEBP · up to 4 MB";

    formHeading.textContent = "Edit your trip";
    submitButton.textContent = "Update trip";
    cancelEditButton.classList.remove("hidden");
    formStatus.textContent = "Editing this trip — make your changes and save.";

    document.getElementById("add-trip").scrollIntoView({ behavior: "smooth", block: "start" });
    titleInput.focus();
}

function openTripDetail(tripId) {
    const trip = getTrips().find((item) => item.id === tripId);
    if (!trip) return;

    detailModalContent.innerHTML = `
        <div class="detail-image-wrap">
            ${createImageMarkup(trip, "detail-image")}
        </div>
        <div class="detail-copy">
            <p class="eyebrow">TRIP DETAIL</p>
            <h2 id="detailModalTitle">${escapeHTML(trip.title)}</h2>
            <p class="detail-destination">${escapeHTML(trip.destination)}</p>
            <p class="trip-date">${escapeHTML(formatDate(trip.date))}</p>
            ${trip.notes ? `<div class="detail-notes"><h3>Notes</h3><p>${escapeHTML(trip.notes)}</p></div>` : ""}
        </div>
    `;

    bindImageFallbacks(detailModalContent);
    lastFocusedElement = document.activeElement;
    detailModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    closeDetailButton.focus();
}

function closeTripDetail() {
    detailModal.classList.add("hidden");
    document.body.classList.remove("modal-open");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus();
    }
}

function deleteTrip(tripId) {
    const trips = getTrips();
    const trip = trips.find((item) => item.id === tripId);
    if (!trip) return;

    const confirmed = window.confirm(`Delete “${trip.title}” from your journal? This cannot be undone.`);
    if (!confirmed) return;

    const updatedTrips = trips.filter((item) => item.id !== tripId);
    if (!saveTrips(updatedTrips)) return;

    if (editingTripId === tripId) resetForm();

    renderTrips();
    formStatus.textContent = "Trip deleted successfully.";
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Unable to read the selected image."));
        reader.readAsDataURL(file);
    });
}

photoInput.addEventListener("change", async () => {
    clearErrors();
    const file = photoInput.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        photoError.textContent = "Please choose a valid image file.";
        photoInput.classList.add("input-error");
        resetPhotoPreview();
        return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
        photoError.textContent = "Please choose an image smaller than 4 MB.";
        photoInput.classList.add("input-error");
        resetPhotoPreview();
        return;
    }

    photoHelp.textContent = "Reading image…";
    formStatus.textContent = "Preparing your photo…";

    try {
        const dataUrl = await readFileAsDataUrl(file);
        showPhotoPreview(dataUrl);
        photoHelp.textContent = "Photo ready — it will be stored locally with this trip.";
        formStatus.textContent = "Photo ready to save.";
    } catch (error) {
        console.error(error);
        photoError.textContent = "The image could not be read. Please try another file.";
        photoInput.classList.add("input-error");
        resetPhotoPreview();
    }
});

tripForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateForm()) {
        formStatus.textContent = "Please complete the required fields.";
        return;
    }

    const file = photoInput.files[0];
    let imageData = pendingPhotoData;
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = editingTripId ? "Updating…" : "Saving…";
    formStatus.textContent = "Saving your trip locally…";

    // If a new image was selected but preview has not completed yet, wait for FileReader.
    if (file && !imageData) {
        try {
            imageData = await readFileAsDataUrl(file);
        } catch (error) {
            formStatus.textContent = "The selected image could not be saved.";
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            return;
        }
    }

    const trips = getTrips();
    const existingTrip = editingTripId ? trips.find((trip) => trip.id === editingTripId) : null;

    const tripData = {
        title: titleInput.value.trim(),
        destination: destinationInput.value.trim(),
        date: dateInput.value,
        notes: notesInput.value.trim(),
        // Preserve the existing image during edit when no replacement is selected.
        coverImageUrl: imageData || existingTrip?.coverImageUrl || ""
    };

    if (editingTripId) {
        const tripIndex = trips.findIndex((trip) => trip.id === editingTripId);
        if (tripIndex === -1) {
            formStatus.textContent = "This trip could not be found. Please try again.";
            resetForm();
            renderTrips();
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            return;
        }

        trips[tripIndex] = {
            ...trips[tripIndex],
            ...tripData
        };

        if (!saveTrips(trips)) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            return;
        }

        resetForm();
        renderTrips();
        formStatus.textContent = "Trip updated successfully.";
        submitButton.disabled = false;
        return;
    }

    const newTrip = createTrip(tripData);
    trips.push(newTrip);

    if (!saveTrips(trips)) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        return;
    }

    resetForm();
    renderTrips();
    formStatus.textContent = "Trip saved successfully.";
    submitButton.disabled = false;
});

cancelEditButton.addEventListener("click", resetForm);

destinationGrid.addEventListener("click", (event) => {
    const actionButton = event.target.closest("button[data-action]");
    if (!actionButton) return;

    const { action, id } = actionButton.dataset;

    if (action === "view") openTripDetail(id);
    if (action === "edit") startEdit(id);
    if (action === "delete") deleteTrip(id);
});

closeDetailButton.addEventListener("click", closeTripDetail);
detailModal.addEventListener("click", (event) => {
    if (event.target === detailModal) closeTripDetail();
});

document.addEventListener("keydown", (event) => {
    if (detailModal.classList.contains("hidden")) return;

    if (event.key === "Escape") {
        closeTripDetail();
        return;
    }

    if (event.key === "Tab") {
        const focusable = detailModal.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
});

// Profile settings: saved locally and used by the public read-only profile page.
function loadProfileForm() {
    if (!profileForm) return;
    const profile = getProfile();
    profileNameInput.value = profile.name;
    profileBioInput.value = profile.bio;
    updateProfileLink();
}

profileForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = profileNameInput.value.trim();
    const bio = profileBioInput.value.trim();

    if (!name) {
        profileStatus.textContent = "Your name is required.";
        profileNameInput.focus();
        return;
    }

    if (!saveProfile({ name, bio })) {
        profileStatus.textContent = "Your profile could not be saved.";
        return;
    }

    profileStatus.textContent = "Profile saved successfully.";
    updateProfileLink();
});

// Mobile navigation.
menuButton.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("show");
    menuButton.setAttribute("aria-expanded", isOpen);
});

document.querySelectorAll(".nav a").forEach((link) => {
    link.addEventListener("click", () => {
        mainNav.classList.remove("show");
        menuButton.setAttribute("aria-expanded", "false");
    });
});

document.getElementById("year").textContent = new Date().getFullYear();

// Load persisted data immediately.
loadProfileForm();
renderTrips();
