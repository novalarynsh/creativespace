const studioData = [
  {
    id: "podcast",
    name: "Podcast Studio",
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=900&q=80",
    capacity: 6,
    facilities: ["Boom Mic", "Soundproof", "Lighting Kit", "Editing Desk"],
    type: "Audio"
  },
  {
    id: "photography",
    name: "Photography Studio",
    image: "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?auto=format&fit=crop&w=900&q=80",
    capacity: 8,
    facilities: ["Backdrop Set", "Reflector", "Tripod", "Studio Lighting"],
    type: "Visual"
  },
  {
    id: "video",
    name: "Video Recording Room",
    image: "https://images.unsplash.com/photo-1594394489098-74ac04c0fc2e?auto=format&fit=crop&w=900&q=80",
    capacity: 10,
    facilities: ["Camera Rig", "Teleprompter", "Green Screen", "Live Monitor"],
    type: "Video"
  },
  {
    id: "editing",
    name: "Editing Room",
    image: "https://plus.unsplash.com/premium_photo-1723525544980-de204e737c90?auto=format&fit=crop&w=900&q=80",
    capacity: 4,
    facilities: ["Dual Monitors", "Color Calibrated", "Fast Wi-Fi", "Audio Mixer"],
    type: "Post-Production"
  }
];

const STORAGE_KEYS = {
  bookings: "creativespace-bookings",
  theme: "creativespace-theme"
};

let bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.bookings) || "[]");

const elements = {
  todayLabel: document.getElementById("todayLabel"),
  availableToday: document.getElementById("availableToday"),
  occupancyRate: document.getElementById("occupancyRate"),
  topStudio: document.getElementById("topStudio"),
  totalBookings: document.getElementById("totalBookings"),
  occupancyCircle: document.getElementById("occupancyCircle"),
  occupancyBadge: document.getElementById("occupancyBadge"),
  usageBars: document.getElementById("usageBars"),
  activityList: document.getElementById("activityList"),
  searchInput: document.getElementById("searchInput"),
  statusFilter: document.getElementById("statusFilter"),
  studioGrid: document.getElementById("studioGrid"),
  studioModal: document.getElementById("studioModal"),
  modalBody: document.getElementById("modalBody"),
  closeModal: document.getElementById("closeModal"),
  bookingModal: document.getElementById("bookingModal"),
  closeBookingModal: document.getElementById("closeBookingModal"),
  bookingForm: document.getElementById("bookingForm"),
  studioSelect: document.getElementById("studioSelect"),
  bookingDate: document.getElementById("bookingDate"),
  startTime: document.getElementById("startTime"),
  duration: document.getElementById("duration"),
  participantCount: document.getElementById("participantCount"),
  notes: document.getElementById("notes"),
  capacityMessage: document.getElementById("capacityMessage"),
  summaryTitle: document.getElementById("summaryTitle"),
  summaryDetails: document.getElementById("summaryDetails"),
  summaryFacilities: document.getElementById("summaryFacilities"),
  toast: document.getElementById("toast"),
  themeToggle: document.getElementById("themeToggle"),
  previewCatalog: document.getElementById("previewCatalog"),
  heroBookedCount: document.getElementById("heroBookedCount")
};

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function formatDateTime(dateString, timeString) {
  return `${formatDate(dateString)} · ${timeString}`;
}

function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

function getTimeInMinutes(time) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function isSameDay(dateA, dateB) {
  return dateA === dateB;
}

function getStudioById(id) {
  return studioData.find((studio) => studio.id === id);
}

function updateLocalStorage() {
  localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookings));
}

function getBookingStatus(studioId, date = getTodayISO()) {
  return bookings.some(
    (booking) => booking.studioId === studioId && isSameDay(booking.date, date)
  )
    ? "booked"
    : "available";
}

function isTimeOverlap(booking, date, startTime, duration) {
  const bookingStart = getTimeInMinutes(booking.startTime);
  const bookingEnd = bookingStart + booking.duration * 60;
  const newStart = getTimeInMinutes(startTime);
  const newEnd = newStart + duration * 60;

  return (
    isSameDay(booking.date, date) &&
    newStart < bookingEnd &&
    newEnd > bookingStart
  );
}

function getUsageCount(studioId) {
  return bookings.filter((booking) => booking.studioId === studioId).length;
}

function getTopStudio() {
  if (bookings.length === 0) return null;
  const counts = studioData
    .map((studio) => ({
      ...studio,
      count: getUsageCount(studio.id)
    }))
    .sort((a, b) => b.count - a.count);
  return counts[0];
}

function getDashboardData() {
  const today = getTodayISO();
  const todayBookings = bookings.filter((booking) => booking.date === today);
  const occupiedStudios = new Set(todayBookings.map((booking) => booking.studioId)).size;
  const occupancyRate = Math.round((occupiedStudios / studioData.length) * 100);
  const availableToday = studioData.length - occupiedStudios;
  const totalBookings = bookings.length;
  const top = getTopStudio();

  return {
    today,
    todayBookings,
    occupiedStudios,
    occupancyRate,
    availableToday,
    totalBookings,
    top
  };
}

function updateDashboard() {
  if (!elements.todayLabel || !elements.availableToday) return;

  const data = getDashboardData();
  const usageValues = studioData.map((studio) => getUsageCount(studio.id));
  const maxUsage = Math.max(...usageValues, 1);

  elements.todayLabel.textContent = formatDate(data.today);
  elements.availableToday.textContent = data.availableToday;
  elements.occupancyRate.textContent = `${data.occupancyRate}%`;
  elements.topStudio.textContent = data.top ? data.top.name : "—";
  elements.totalBookings.textContent = data.totalBookings;
  elements.occupancyBadge.textContent = `${data.occupancyRate}% occupied`;
  elements.occupancyCircle.textContent = `${data.occupancyRate}%`;

  const ring = document.querySelector(".progress-ring");
  if (ring) {
    const progress = (data.occupancyRate / 100) * 360;
    ring.style.background = `conic-gradient(var(--primary) 0deg, var(--primary) ${progress}deg, var(--surface-3) ${progress}deg)`;
  }

  if (elements.usageBars) {
    elements.usageBars.innerHTML = "";
    studioData.forEach((studio) => {
      const count = getUsageCount(studio.id);
      const barHeight = maxUsage === 0 ? 0 : (count / maxUsage) * 100;
      const group = document.createElement("div");
      group.className = "usage-bar-group";
      group.innerHTML = `
        <div class="bar-track">
          <div class="bar-fill" style="height: ${barHeight}%"></div>
        </div>
        <div class="bar-label">${studio.name.split(" ")[0]}</div>
      `;
      elements.usageBars.appendChild(group);
    });
  }

  if (elements.activityList) {
    elements.activityList.innerHTML = "";
    [...bookings]
      .sort((a, b) => new Date(`${b.date}T${b.startTime}`) - new Date(`${a.date}T${a.startTime}`))
      .slice(0, 5)
      .forEach((booking) => {
        const studio = getStudioById(booking.studioId);
        const item = document.createElement("div");
        item.className = "activity-item";
        item.innerHTML = `
          <div class="activity-text">
            <strong>${booking.userName}</strong>
            <span>${studio ? studio.name : "Studio"} · ${booking.participants} guests</span>
          </div>
          <span class="activity-time">${formatDateTime(booking.date, booking.startTime)}</span>
        `;
        elements.activityList.appendChild(item);
      });
  }

  if (elements.heroBookedCount) {
    elements.heroBookedCount.textContent = String(getDashboardData().todayBookings.length);
  }
}

function getStatusLabel(studioId) {
  return getBookingStatus(studioId) === "available" ? "Available" : "Booked";
}

function renderLandingPreview() {
  if (!elements.previewCatalog) return;
  elements.previewCatalog.innerHTML = "";
  studioData.slice(0, 3).forEach((studio) => {
    const status = getStatusLabel(studio.id);
    const card = document.createElement("article");
    card.className = "preview-card";
    card.innerHTML = `
      <img src="${studio.image}" alt="${studio.name}" />
      <div>
        <div class="studio-meta">
          <h3>${studio.name}</h3>
          <span class="status-pill">${status}</span>
        </div>
        <p>${studio.capacity} participants · ${studio.type}</p>
        <a href="views/component/catalog.html" class="preview-link">View catalog</a>
      </div>
    `;
    elements.previewCatalog.appendChild(card);
  });
}

function renderStudioCards() {
  if (!elements.studioGrid || !elements.searchInput || !elements.statusFilter) return;

  const query = elements.searchInput.value.trim().toLowerCase();
  const status = elements.statusFilter.value;

  const filtered = studioData.filter((studio) => {
    const matchesQuery =
      studio.name.toLowerCase().includes(query) ||
      studio.facilities.some((facility) => facility.toLowerCase().includes(query));
    const currentStatus = getStatusLabel(studio.id);
    const matchesStatus = status === "all" || currentStatus.toLowerCase() === status;
    return matchesQuery && matchesStatus;
  });

  elements.studioGrid.innerHTML = "";
  filtered.forEach((studio) => {
    const currentStatus = getStatusLabel(studio.id);
    const card = document.createElement("article");
    card.className = "studio-card";
    card.innerHTML = `
      <img src="${studio.image}" alt="${studio.name}" />
      <div class="studio-body">
        <div class="studio-meta">
          <h3>${studio.name}</h3>
          <span class="status-pill">${currentStatus}</span>
        </div>
        <div class="capacity-row">
          <span>👥</span>
          <span>${studio.capacity} participants</span>
        </div>
        <div class="facilities">
          ${studio.facilities.map((facility) => `<span>${facility}</span>`).join("")}
        </div>
        <div class="card-actions">
          <button class="secondary-btn" type="button" data-action="details" data-id="${studio.id}">View Details</button>
          <button class="primary-btn" type="button" data-action="book" data-id="${studio.id}">Book Now</button>
        </div>
      </div>
    `;
    elements.studioGrid.appendChild(card);
  });
}

function updateBookingSummary() {
  if (!elements.studioSelect || !elements.summaryTitle) return;
  const selectedStudioId = elements.studioSelect.value;
  if (!selectedStudioId) {
    elements.summaryTitle.textContent = "Choose a space";
    elements.summaryDetails.textContent = "No studio selected yet.";
    elements.summaryFacilities.innerHTML = "";
    return;
  }

  const studio = getStudioById(selectedStudioId);
  elements.summaryTitle.textContent = studio.name;
  elements.summaryDetails.textContent = `${studio.capacity} participants · ${studio.type}`;
  elements.summaryFacilities.innerHTML = studio.facilities.map((facility) => `<li>${facility}</li>`).join("");
}

function updateCapacityMessage() {
  if (!elements.capacityMessage || !elements.participantCount) return;
  const selectedStudioId = elements.studioSelect.value;
  if (!selectedStudioId) {
    elements.capacityMessage.textContent = "Please select a studio";
    return;
  }

  const studio = getStudioById(selectedStudioId);
  elements.capacityMessage.textContent = `Maximum participants: ${studio.capacity}`;
  elements.participantCount.max = studio.capacity;
}

function openBookingModal(studioId) {
  if (!elements.bookingModal || !elements.studioSelect) return;
  const studio = getStudioById(studioId);
  if (!studio) return;
  elements.studioSelect.value = studio.id;
  elements.bookingDate.value = getTodayISO();
  elements.startTime.value = "09:00";
  elements.duration.value = 2;
  elements.participantCount.value = "";
  elements.notes.value = "";
  updateBookingSummary();
  updateCapacityMessage();
  elements.bookingModal.classList.add("open");
}

function closeBookingModal() {
  if (elements.bookingModal) {
    elements.bookingModal.classList.remove("open");
  }
}

function openModal(studioId) {
  if (!elements.studioModal || !elements.modalBody) return;
  const studio = getStudioById(studioId);
  if (!studio) return;
  elements.modalBody.innerHTML = `
    <img src="${studio.image}" alt="${studio.name}" style="border-radius:18px; margin-bottom: 16px; height: 260px; object-fit: cover;" />
    <h2>${studio.name}</h2>
    <p style="color: var(--muted); margin-top: 8px;">${studio.capacity} participants · ${studio.type}</p>
    <div class="facilities" style="margin: 16px 0;">
      ${studio.facilities.map((facility) => `<span>${facility}</span>`).join("")}
    </div>
    <p style="line-height: 1.6;">A premium creative space designed for creators who need calm, flexible lighting, and professional setup for production sessions.</p>
  `;
  elements.studioModal.classList.add("open");
}

function showToast(message) {
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 3000);
}

function initializeTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark-theme");
  }
  if (elements.themeToggle) {
    elements.themeToggle.querySelector(".toggle-icon").textContent =
      document.documentElement.classList.contains("dark-theme") ? "☀️" : "🌙";
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark-theme");
  localStorage.setItem(STORAGE_KEYS.theme, isDark ? "dark" : "light");
  if (elements.themeToggle) {
    elements.themeToggle.querySelector(".toggle-icon").textContent = isDark ? "☀️" : "🌙";
  }
}

function validateForm() {
  const selectedStudioId = elements.studioSelect.value;
  const date = elements.bookingDate.value;
  const startTime = elements.startTime.value;
  const duration = Number(elements.duration.value);
  const participants = Number(elements.participantCount.value);

  if (
    !elements.bookingForm.userName.value.trim() ||
    !selectedStudioId ||
    !date ||
    !startTime ||
    !duration ||
    !participants
  ) {
    return "Please fill in all required fields.";
  }

  if (date < getTodayISO()) {
    return "Booking date cannot be before today.";
  }

  if (duration < 1 || duration > 12) {
    return "Duration must be between 1 and 12 hours.";
  }

  const studio = getStudioById(selectedStudioId);
  if (participants > studio.capacity) {
    return `Participants cannot exceed the studio capacity (${studio.capacity}).`;
  }

  const hasConflict = bookings.some(
    (booking) =>
      booking.studioId === selectedStudioId &&
      isTimeOverlap(booking, date, startTime, duration)
  );

  if (hasConflict) {
    return "The selected time overlaps with an existing booking.";
  }

  return "";
}

function initializeBookingOptions() {
  if (!elements.studioSelect) return;
  if (elements.studioSelect.options.length <= 1) {
    studioData.forEach((studio) => {
      const option = document.createElement("option");
      option.value = studio.id;
      option.textContent = studio.name;
      elements.studioSelect.appendChild(option);
    });
  }
  if (elements.bookingDate) elements.bookingDate.min = getTodayISO();
  if (elements.bookingDate) elements.bookingDate.value = getTodayISO();
  if (elements.startTime) elements.startTime.value = "09:00";
  if (elements.duration) elements.duration.value = 2;
}

function handleBookingSubmit(event) {
  event.preventDefault();
  const error = validateForm();
  if (error) {
    showToast(error);
    return;
  }

  const booking = {
    id: `booking-${Date.now()}`,
    userName: elements.bookingForm.userName.value.trim(),
    studioId: elements.studioSelect.value,
    date: elements.bookingDate.value,
    startTime: elements.startTime.value,
    duration: Number(elements.duration.value),
    participants: Number(elements.participantCount.value),
    notes: elements.notes.value.trim()
  };

  bookings.push(booking);
  updateLocalStorage();
  elements.bookingForm.reset();
  initializeBookingOptions();
  updateBookingSummary();
  updateCapacityMessage();
  updateDashboard();
  renderLandingPreview();
  renderStudioCards();
  closeBookingModal();
  showToast("Booking confirmed successfully!");
}

if (elements.themeToggle) {
  elements.themeToggle.addEventListener("click", toggleTheme);
}

if (elements.bookingForm) {
  elements.bookingForm.addEventListener("submit", handleBookingSubmit);
}

if (elements.studioSelect) {
  elements.studioSelect.addEventListener("change", () => {
    updateBookingSummary();
    updateCapacityMessage();
  });
}

if (elements.searchInput && elements.statusFilter) {
  elements.searchInput.addEventListener("input", renderStudioCards);
  elements.statusFilter.addEventListener("change", renderStudioCards);
}

if (elements.studioGrid) {
  elements.studioGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const studioId = button.dataset.id;
    if (button.dataset.action === "details") {
      openModal(studioId);
    } else if (button.dataset.action === "book") {
      openBookingModal(studioId);
    }
  });
}

if (elements.closeModal) {
  elements.closeModal.addEventListener("click", () => {
    elements.studioModal.classList.remove("open");
  });
}

if (elements.studioModal) {
  elements.studioModal.addEventListener("click", (event) => {
    if (event.target === elements.studioModal) {
      elements.studioModal.classList.remove("open");
    }
  });
}

if (elements.closeBookingModal) {
  elements.closeBookingModal.addEventListener("click", closeBookingModal);
}

if (elements.bookingModal) {
  elements.bookingModal.addEventListener("click", (event) => {
    if (event.target === elements.bookingModal) {
      closeBookingModal();
    }
  });
}

initializeTheme();
initializeBookingOptions();
updateBookingSummary();
updateCapacityMessage();
updateDashboard();
renderLandingPreview();
renderStudioCards();
