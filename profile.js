// Wanderlog Week 3: read-only public profile route.

const STORAGE_KEY = "wanderlogTrips";
const PROFILE_KEY = "wanderlogProfile";

const loading = document.getElementById("profileLoading");
const shell = document.getElementById("profileShell");
const notFound = document.getElementById("profileNotFound");
const profileName = document.getElementById("profileName");
const profileBio = document.getElementById("profileBio");
const profileAvatar = document.getElementById("profileAvatar");
const profileMeta = document.getElementById("profileMeta");
const profileTripGrid = document.getElementById("profileTripGrid");
const profileTripCount = document.getElementById("profileTripCount");
const profileEmptyState = document.getElementById("profileEmptyState");

document.getElementById("year").textContent = new Date().getFullYear();

function escapeHTML(value = "") {
    return String(value).replace(/[&<>'"]/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#039;",
        '"': "&quot;"
    })[character]);
}

function slugify(value) {
    return String(value)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "wanderer";
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

function getInitials(value) {
    return String(value)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase() || "WL";
}

function getProfile() {
    try {
        const parsed = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
        if (!parsed?.name) return null;
        return {
            name: String(parsed.name).trim(),
            bio: String(parsed.bio || "").trim()
        };
    } catch (error) {
        console.error("Unable to read profile:", error);
        return null;
    }
}

function getTrips() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (!Array.isArray(parsed)) return [];
        return parsed.map((trip) => ({
            id: trip.id || "",
            title: trip.title || "Untitled trip",
            destination: trip.destination || "Unknown destination",
            date: trip.date || "",
            notes: trip.notes || "",
            coverImageUrl: trip.coverImageUrl || ""
        }));
    } catch (error) {
        console.error("Unable to read trips:", error);
        return [];
    }
}

function imageMarkup(trip) {
    if (!trip.coverImageUrl) {
        return `<div class="profile-trip-image image-placeholder"><span>${escapeHTML(getInitials(trip.title))}</span><small>No cover photo</small></div>`;
    }

    return `
        <div class="profile-trip-image image-frame">
            <img src="${escapeHTML(trip.coverImageUrl)}" alt="Cover photo for ${escapeHTML(trip.title)}">
            <div class="image-fallback hidden">${escapeHTML(getInitials(trip.title))}<small>Photo unavailable</small></div>
        </div>
    `;
}

function bindImageFallbacks() {
    profileTripGrid.querySelectorAll(".image-frame img").forEach((image) => {
        image.addEventListener("error", () => {
            image.classList.add("hidden");
            image.parentElement.querySelector(".image-fallback")?.classList.remove("hidden");
        }, { once: true });
    });
}

function renderProfile(profile, trips) {
    profileName.textContent = profile.name;
    profileBio.textContent = profile.bio || "A curious traveller collecting places, stories and small moments.";
    profileAvatar.textContent = getInitials(profile.name);
    profileMeta.textContent = `${trips.length} ${trips.length === 1 ? "trip" : "trips"} in this journal`;
    profileTripCount.textContent = `${trips.length} ${trips.length === 1 ? "trip" : "trips"}`;

    if (!trips.length) {
        profileTripGrid.classList.add("hidden");
        profileEmptyState.classList.remove("hidden");
        return;
    }

    profileTripGrid.classList.remove("hidden");
    profileEmptyState.classList.add("hidden");
    profileTripGrid.innerHTML = trips.map((trip, index) => `
        <article class="destination-card profile-trip-card">
            ${imageMarkup(trip)}
            <div class="profile-trip-body">
                <div class="destination-icon">${String(index + 1).padStart(2, "0")}</div>
                <h3>${escapeHTML(trip.title)}</h3>
                <p class="trip-destination">${escapeHTML(trip.destination)}</p>
                <p class="trip-date">${escapeHTML(formatDate(trip.date))}</p>
                ${trip.notes ? `<p class="trip-notes">${escapeHTML(trip.notes)}</p>` : ""}
            </div>
        </article>
    `).join("");

    bindImageFallbacks();
}

function showNotFound() {
    loading.classList.add("hidden");
    shell.classList.add("hidden");
    notFound.classList.remove("hidden");
}

function init() {
    // Keep a tiny delay so the loading state is visible even on fast localStorage reads.
    const params = new URLSearchParams(window.location.search);
    const requestedUser = params.get("user");
    const profile = getProfile();

    if (!profile || !requestedUser || requestedUser !== slugify(profile.name)) {
        showNotFound();
        return;
    }

    const trips = getTrips();
    renderProfile(profile, trips);
    loading.classList.add("hidden");
    shell.classList.remove("hidden");
}

init();
