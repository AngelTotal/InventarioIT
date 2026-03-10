/**
 * Inventario IT - Bootstrap 5 Edition
 */

// Global Theme Functions Exposed for HTML onclick
window.appToggleDarkMode = function () {
    console.log("Toggling Dark Mode with circle transition...");
    const shutter = document.getElementById('theme-shutter');
    if (shutter) {
        shutter.classList.add('active');
        setTimeout(() => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
            window.appUpdateThemeUI(isDark);

            // Retract shutter after theme switch
            setTimeout(() => {
                shutter.classList.remove('active');
            }, 150);
        }, 100); // Middle of animation
    } else {
        // Fallback if shutter element doesn't exist
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
        window.appUpdateThemeUI(isDark);
    }
};

window.appUpdateThemeUI = function (isDark) {
    console.log("Updating UI Theme, isDark:", isDark);
    const btn = document.getElementById('theme-toggle');
    const loginThemeBtn = document.getElementById('login-theme-toggle');
    const sidebarLogo = document.getElementById('sidebar-logo');
    const loginLogo = document.getElementById('login-logo');

    // Update main toggle (sidebar)
    if (btn) {
        const icon = btn.querySelector('i');
        const span = document.getElementById('theme-text');
        if (isDark) {
            // Currently Dark -> Offer "Modo Claro" (Sun Icon)
            if (icon) icon.className = 'bi bi-sun me-2';
            if (span) span.textContent = 'Modo Claro';
        } else {
            // Currently Light -> Offer "Modo Oscuro" (Moon Icon)
            if (icon) icon.className = 'bi bi-moon-stars me-2';
            if (span) span.textContent = 'Modo Oscuro';
        }
    }

    // Update login toggle (corner)
    if (loginThemeBtn) {
        const icon = loginThemeBtn.querySelector('i');
        if (isDark) {
            if (icon) icon.className = 'bi bi-moon-stars fs-4';
        } else {
            if (icon) icon.className = 'bi bi-sun fs-4';
        }
    }

    // Logo adjustments
    if (sidebarLogo) sidebarLogo.src = 'images/01-TG Logo Blanco.png';
    if (loginLogo) {
        loginLogo.src = isDark ? 'images/01-TG Logo Blanco.png' : 'images/02-TG-Logo.png';
    }
};

const CONFIG = {
    apiUrl: 'backend/api',
    mockFallback: true
};

// Application State
const state = {
    user: null,
    currentView: 'dashboard',
    allData: [],
    data: {
        inventory: [],
        peripherals: [],
        assignments: [],
        licenses: [],
        network: [],
        enterprise_networks: [],
        users: [],
        emails: [],
        office_emails: [],
        inks: [],
        toner: [],
        printers: [],
        microsoft_emails: [],
        cellphones: [],
        account_management: [],
        correos_outlook: [],
        stats: null,
        tutorials: [],
        notes: []
    },
    lastFetch: {},
    editingId: null,
    deleteInfo: null,
    sort: { column: null, direction: 'asc' },
    sessionTimeout: 10 * 60 * 1000, // 10 minutes in ms
    lastActivity: Date.now(),
    subViews: {
        'inventory': 'inventory',
        'emails': 'microsoft_emails',
        'network': 'network',
        'licenses': 'licenses_cred',
        'printers': 'printers'
    },
    calendar: {
        currentDate: new Date(),
        selectedDate: new Date(),
        reminders: [] // Array from DB
    },
    // UX Improvements State
    recentSearches: JSON.parse(localStorage.getItem('recentSearches') || '[]'),
    formDrafts: JSON.parse(localStorage.getItem('formDrafts') || '{}'),
    highlightQuery: '',
    activePrinterId: null,
    modalStack: [], // Management for overlapping modals
    columnVisibility: JSON.parse(localStorage.getItem('colVisibility') || '{}'),
    activeContextItem: null
};

/**
 * Enhanced Modal Manager to handle stacking and z-index automatically
 */
const ModalManager = {
    show(modalId) {
        const el = document.getElementById(modalId);
        if (!el) return;

        // Cleanup: remove if already in stack to avoid duplicates
        state.modalStack = state.modalStack.filter(id => id !== modalId);

        const bsModal = bootstrap.Modal.getOrCreateInstance(el);

        // Stacking logic - High baseZ to be above aside (1040) and drawers (1060)
        const baseZ = 5000;
        const offset = state.modalStack.length * 50;

        el.style.zIndex = baseZ + offset + 10;

        bsModal.show();
        state.modalStack.push(modalId);

        // Adjust backdrop z-index after Bootstrap creates it
        setTimeout(() => {
            // Find the backdrop that belongs to this modal (usually the last one added)
            const backdrops = document.querySelectorAll('.modal-backdrop:not(.stacked)');
            if (backdrops.length > 0) {
                const latest = backdrops[backdrops.length - 1];
                latest.style.zIndex = baseZ + offset + 5;
                latest.classList.add('stacked');
            }
        }, 100);
    },

    hide(modalId) {
        const el = document.getElementById(modalId);
        if (!el) return;
        const bsModal = bootstrap.Modal.getInstance(el);
        if (bsModal) bsModal.hide();
        state.modalStack = state.modalStack.filter(id => id !== modalId);
    }
};

// --- Calendar Functions (Hoisted) ---
window.initMiniCalendar = function () {
    console.log("Initializing Mini Calendar...");
    const grid = document.getElementById('mini-calendar-grid');
    const monthDisplay = document.getElementById('mini-calendar-month-display');
    if (!monthDisplay) return;

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    monthDisplay.textContent = `${monthNames[month]} ${year}`;

    if (grid) renderCalendarGrid(grid, year, month, true);
};

window.fetchCalendarReminders = async function () {
    try {
        const res = await fetch(`${CONFIG.apiUrl}/calendar.php`);
        if (res.ok) {
            state.calendar.reminders = await res.json();
            if (document.getElementById('mini-calendar-grid')) initMiniCalendar();
            if (state.currentView === 'dashboard') updateDashboardStats();
        }
    } catch (e) { console.error("Error fetching reminders", e); }
};

window.migrateLocalReminders = async function () {
    const local = JSON.parse(localStorage.getItem('inventory_reminders') || '{}');
    const entries = Object.entries(local);
    if (entries.length === 0) return;

    console.log("Migrando recordatorios locales a la base de datos...");
    for (const [date, texts] of entries) {
        for (const text of texts) {
            await fetch(`${CONFIG.apiUrl}/calendar.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_date: date,
                    title: text,
                    description: ''
                })
            });
        }
    }
    localStorage.removeItem('inventory_reminders');
    await window.fetchCalendarReminders();
};

window.expandCalendar = function (preYear = null, preMonth = null, preDay = null) {
    if (preYear !== null && preMonth !== null && preDay !== null) {
        state.calendar.currentDate = new Date(preYear, preMonth, preDay);
        state.calendar.selectedDate = new Date(preYear, preMonth, preDay);
    } else {
        state.calendar.currentDate = new Date();
        state.calendar.selectedDate = new Date();
    }
    const modalEl = document.getElementById('calendarModal');
    if (modalEl) {
        let modal = bootstrap.Modal.getInstance(modalEl);
        if (!modal) modal = new bootstrap.Modal(modalEl);
        ModalManager.show('calendarModal');
        setTimeout(() => {
            renderFullCalendar();
            renderRemindersPanel();
        }, 150);
    }
};

window.changeMonth = function (offset) {
    state.calendar.currentDate.setMonth(state.calendar.currentDate.getMonth() + offset);
    renderFullCalendar();
};

function renderFullCalendar() {
    const grid = document.getElementById('full-calendar-grid');
    const monthDisplay = document.getElementById('full-calendar-month');
    if (!grid || !monthDisplay) return;

    const date = state.calendar.currentDate;
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    monthDisplay.textContent = `${monthNames[month]} ${year}`;

    renderCalendarGrid(grid, year, month, false);
}

function renderCalendarGrid(container, year, month, isMini) {
    if (!container) return;
    container.innerHTML = '';

    const firstDayObj = new Date(year, month, 1);
    const firstDay = firstDayObj.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startOffset = firstDay;

    for (let i = 0; i < startOffset; i++) {
        const empty = document.createElement('div');
        empty.className = isMini ? 'mini-calendar-day empty' : 'full-calendar-day empty';
        container.appendChild(empty);
    }

    const today = new Date();
    const isCurrentMonth = (today.getFullYear() === year && today.getMonth() === month);

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const reminders = state.calendar.reminders.filter(r => r.event_date === dateStr);
        const hasEvent = reminders.length > 0;
        const isToday = (isCurrentMonth && today.getDate() === day);

        const sel = state.calendar.selectedDate;
        const isSelected = (!isMini && sel &&
            sel.getDate() === day &&
            sel.getMonth() === month &&
            sel.getFullYear() === year);

        const cell = document.createElement('div');

        if (isMini) {
            cell.className = `mini-calendar-day ${isToday ? 'today' : ''}`;
            cell.onclick = () => window.expandCalendar(year, month, day);
            let content = `<span>${day}</span>`;
            if (hasEvent) {
                const isHoliday = reminders.some(r =>
                    (r.description || '').toLowerCase().includes('feriado') ||
                    (r.description || '').toLowerCase().includes('no laboral')
                );
                const badgeClass = isHoliday ? 'reminder-badge holiday' : 'reminder-badge';
                content += `<span class="${badgeClass}">${reminders.length}</span>`;
            }
            cell.innerHTML = content;
            cell.title = hasEvent ? `${reminders.length} recordatorios` : 'Clic para agregar recordatorio';
        } else {
            cell.className = `full-calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`;
            cell.onclick = () => window.selectDate(year, month, day);

            const num = document.createElement('div');
            num.className = 'day-number';
            num.textContent = day;
            cell.appendChild(num);

            if (hasEvent) {
                const dots = document.createElement('div');
                dots.className = 'day-event-dots';
                reminders.slice(0, 5).forEach(r => {
                    const isHoliday = (r.description || '').toLowerCase().includes('feriado') ||
                        (r.description || '').toLowerCase().includes('no laboral');
                    const dot = document.createElement('div');
                    dot.className = isHoliday ? 'event-dot holiday' : 'event-dot';
                    dots.appendChild(dot);
                });
                cell.appendChild(dots);
            }
        }
        container.appendChild(cell);
    }
}

window.selectDate = function (year, month, day) {
    state.calendar.selectedDate = new Date(year, month, day);
    renderFullCalendar();
    renderRemindersPanel();
};

function renderRemindersPanel() {
    const list = document.getElementById('reminders-list');
    const dateDisplay = document.getElementById('selected-date-display');
    const date = state.calendar.selectedDate;
    if (!date || !list) return;

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = date.toLocaleDateString('es-MX', options);

    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const reminders = state.calendar.reminders.filter(r => r.event_date === dateStr);
    list.innerHTML = '';

    if (reminders.length === 0) {
        list.innerHTML = '<div class="text-muted small text-center italic mt-4 opacity-50">No hay recordatorios para este día</div>';
        return;
    }

    reminders.forEach((r) => {
        const isHoliday = (r.description || '').toLowerCase().includes('feriado') ||
            (r.description || '').toLowerCase().includes('no laboral');
        const item = document.createElement('div');
        item.className = `reminder-item animate-fade-in ${isHoliday ? 'holiday-item' : ''}`;

        item.innerHTML = `
            <div class="d-flex flex-column">
                <span class="small fw-bold ${isHoliday ? 'text-danger' : 'text-dark'} text-break me-2">${r.title}</span>
                ${isHoliday ? '<span class="x-small fw-bold text-danger mt-1"><i class="bi bi-calendar-x me-1"></i>No laboral</span>' : ''}
            </div>
            <button class="btn btn-sm text-danger p-0" onclick="window.deleteReminder(${r.id})" title="Borrar">
                <i class="bi bi-trash"></i>
            </button>
        `;
        list.appendChild(item);
    });
}

window.addReminder = async function () {
    const input = document.getElementById('reminder-input');
    const date = state.calendar.selectedDate;
    if (!input || !date || !input.value.trim()) return;

    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    try {
        const res = await fetch(`${CONFIG.apiUrl}/calendar.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event_date: dateStr,
                title: input.value.trim(),
                description: ''
            })
        });
        if (res.ok) {
            input.value = '';
            await window.fetchCalendarReminders();
            renderRemindersPanel();
            renderFullCalendar();
            showToast('Éxito', 'Recordatorio añadido', 'success');
        } else {
            showToast('Error', 'No se pudo añadir el recordatorio', 'danger');
        }
    } catch (e) {
        console.error("Error adding reminder", e);
        showToast('Error', 'Error de red al añadir recordatorio', 'danger');
    }
};


window.deleteReminder = async function (id) {
    try {
        const res = await fetch(`${CONFIG.apiUrl}/calendar.php?id=${id}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            await window.fetchCalendarReminders();
            renderRemindersPanel();
            renderFullCalendar();
            showToast('Borrado', 'Recordatorio eliminado', 'warning');
        } else {
            showToast('Error', 'No se pudo eliminar el recordatorio', 'danger');
        }
    } catch (e) {
        console.error("Error deleting reminder", e);
        showToast('Error', 'Error de red al eliminar recordatorio', 'danger');
    }
}


/* --- UX CORE FUNCTIONS --- */

window.showToast = function (title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
        'success': 'bi-check-circle-fill',
        'error': 'bi-exclamation-triangle-fill',
        'warning': 'bi-exclamation-circle-fill',
        'info': 'bi-info-circle-fill'
    };

    const toast = document.createElement('div');
    toast.className = `toast-custom ${type}`;
    toast.innerHTML = `
        <i class="bi ${icons[type]}"></i>
        <div class="toast-content">
            <span class="toast-title">${title}</span>
            <span class="toast-message">${message}</span>
        </div>
    `;

    container.appendChild(toast);

    // Auto-remove
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
};

window.renderSkeletons = function (container, type = 'table', count = 5) {
    if (!container) return;
    let html = '';

    if (type === 'table') {
        html = `<div class="p-4">`;
        for (let i = 0; i < count; i++) {
            html += `<div class="skeleton skeleton-row animate-fade-in" style="animation-delay: ${i * 0.1}s"></div>`;
        }
        html += `</div>`;
    } else if (type === 'cards') {
        html = `<div class="row g-4 p-4">`;
        for (let i = 0; i < count; i++) {
            html += `<div class="col-md-4"><div class="skeleton skeleton-card animate-fade-in" style="animation-delay: ${i * 0.1}s"></div></div>`;
        }
        html += `</div>`;
    }

    container.innerHTML = html;
};

window.highlightText = function (text, query) {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return String(text).replace(regex, '<mark class="highlight">$1</mark>');
};

// Guardar borradores de formularios automáticamente
window.saveFormDraft = function (view, formData) {
    state.formDrafts[view] = formData;
    localStorage.setItem('formDrafts', JSON.stringify(state.formDrafts));
};

window.clearFormDraft = function (view) {
    delete state.formDrafts[view];
    localStorage.setItem('formDrafts', JSON.stringify(state.formDrafts));
};

// DOM Elements Holder
const elements = {};

// --- Initialization ---

async function init() {
    console.log("Initializing App...");

    // Safety check for localStorage
    try {
        const savedUser = localStorage.getItem('user');
        if (savedUser && savedUser !== "undefined") {
            state.user = JSON.parse(savedUser);
        }
    } catch (e) {
        console.error("Error parsing user from localStorage", e);
        localStorage.removeItem('user');
    }

    // Map DOM Elements inside init to ensure they exist
    const elIds = [
        'login-screen', 'app-screen', 'login-form', 'login-error', 'content-area',
        'view-title', 'logout-btn', 'user-name', 'user-role-sidebar', 'user-role-menu', 'user-avatar',
        'nav-users', 'mainModal', 'deleteModal', 'viewModal', 'modal-form',
        'form-fields', 'search-input', 'search-container', 'sidebar-toggle',
        'view-modal-title', 'view-details-content', 'btn-edit-from-view', 'mainModalLabel',
        'delete-item-name', 'btn-confirm-delete', 'theme-toggle', 'login-theme-toggle', 'supportModal', 'pdfModal', 'pdf-frame',
        'user-name-menu', 'user-avatar-sidebar', 'sidebar-logo', 'login-logo',
        'confirmModal', 'confirm-modal-title', 'confirm-modal-body', 'btn-confirm-ok', 'btn-confirm-cancel',
        'searchModal', 'search-modal-results-body', 'search-results-count', 'search-query-display',
        'modal-search-input', 'search-modal-results-container', 'search-modal-empty',
        'inventoryModal', 'inventory-modal-title', 'inventory-modal-content', 'btn-back-to-search',
        'btn-delete-from-view', 'btn-scan-qr', 'btn-save-maintenance-modal'
    ];

    elIds.forEach(id => {
        elements[id] = document.getElementById(id);
        if (!elements[id]) console.warn(`Element with ID "${id}" not found.`);
    });

    elements.navItems = document.querySelectorAll('.nav-link[data-view]');
    elements.sidebar = document.querySelector('aside');

    // Initialize Bootstrap Modals safely
    if (typeof bootstrap !== 'undefined') {
        if (elements.mainModal) elements.bsMainModal = new bootstrap.Modal(elements.mainModal);
        if (elements.deleteModal) elements.bsDeleteModal = new bootstrap.Modal(elements.deleteModal);
        if (elements.viewModal) elements.bsViewModal = new bootstrap.Modal(elements.viewModal);
        if (elements.supportModal) elements.bsSupportModal = new bootstrap.Modal(elements.supportModal);
        if (elements.pdfModal) elements.bsPdfModal = new bootstrap.Modal(elements.pdfModal);
        if (elements.confirmModal) elements.bsConfirmModal = new bootstrap.Modal(elements.confirmModal);
        if (elements.searchModal) elements.bsSearchModal = new bootstrap.Modal(elements.searchModal);
        if (elements.inventoryModal) elements.bsInventoryModal = new bootstrap.Modal(elements.inventoryModal);
    } else {
        console.error("Bootstrap JS not loaded!");
    }

    if (state.user) {
        checkSessionStatus();
        await showApp();
        startSessionMonitor();
    } else {
        showLogin();
    }

    initTheme();
    setupEventListeners();
    setupModalStackListeners();

    // --- Deep Linking Logic ---
    // Check if there is an 'item' parameter in the URL (e.g., ?item=inventory,123)
    const urlParams = new URLSearchParams(window.location.search);
    const itemLink = urlParams.get('item');
    if (itemLink && state.user) {
        const [view, id] = itemLink.split(',');
        if (view && id) {
            setTimeout(() => window.gotoGlobalResult(view, id), 1000);
            // Clean URL after opening
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
}

function setupModalStackListeners() {
    const modals = [
        'mainModal', 'deleteModal', 'viewModal', 'supportModal',
        'pdfModal', 'confirmModal', 'searchModal', 'calendarModal',
        'patternModal', 'inventoryModal'
    ];

    modals.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('hidden.bs.modal', () => {
                state.modalStack = state.modalStack.filter(mId => mId !== id);
                // Remove stacked class from any remaining backdrops
                setTimeout(() => {
                    if (state.modalStack.length === 0) {
                        document.querySelectorAll('.modal-backdrop').forEach(b => b.classList.remove('stacked'));
                    }
                }, 100);
            });

            // Focus management on show
            el.addEventListener('shown.bs.modal', () => {
                if (id === 'searchModal') {
                    const input = document.getElementById('modal-search-input');
                    if (input) {
                        input.focus();
                        // Support for some browsers/edge cases
                        setTimeout(() => input.focus(), 50);
                    }
                } else if (id === 'mainModal') {
                    const firstInput = el.querySelector('input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])');
                    if (firstInput) firstInput.focus();

                    // 4. RESTORE DRAFT & LIVE VALIDATION
                    const form = elements['modal-form'];
                    if (form) {
                        const modalView = form.dataset.view || state.currentView;
                        // Restore draft if not editing existing
                        if (!state.editingId && state.formDrafts[modalView]) {
                            const draft = state.formDrafts[modalView];
                            let restoredCount = 0;
                            Object.keys(draft).forEach(key => {
                                const input = form.querySelector(`[name="${key}"]`);
                                if (input && !input.value && draft[key]) {
                                    input.value = draft[key];
                                    restoredCount++;
                                }
                            });
                            if (restoredCount > 0) {
                                showToast('Borrador recuperado', 'Se han restaurado los datos previos', 'info');
                            }
                        }

                        // Attach listeners for saving and validation
                        form.querySelectorAll('input, select, textarea').forEach(input => {
                            input.addEventListener('input', () => {
                                // Save draft
                                const formData = {};
                                new FormData(form).forEach((val, key) => formData[key] = val);
                                if (!state.editingId) window.saveFormDraft(modalView, formData);

                                // Live Validation
                                if (input.hasAttribute('required') && !input.value.trim()) {
                                    input.classList.add('is-invalid-custom');
                                    input.classList.remove('is-valid-custom');
                                } else {
                                    input.classList.remove('is-invalid-custom');
                                    input.classList.add('is-valid-custom');
                                }
                            });
                        });
                    }
                }

            });
        }
    });
}

/**
 * Checks if the session has expired and resets the timer if not.
 */
function checkSessionStatus() {
    const lastSessionActivity = localStorage.getItem('lastActivity');
    if (lastSessionActivity) {
        const inactiveTime = Date.now() - parseInt(lastSessionActivity);
        if (inactiveTime > state.sessionTimeout) {
            console.warn("Session expired due to inactivity.");
            handleLogout();
            return false;
        }
    }
    updateActivity();
    return true;
}

function updateActivity() {
    state.lastActivity = Date.now();
    localStorage.setItem('lastActivity', state.lastActivity.toString());
}

function startSessionMonitor() {
    // Check every 30 seconds
    setInterval(() => {
        if (state.user) {
            checkSessionStatus();
        }
    }, 30000);

    // List of events to track activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, updateActivity, { passive: true });
    });
}

function setupEventListeners() {
    if (elements['login-form']) {
        elements['login-form'].addEventListener('submit', handleLogin);
    }

    if (elements['logout-btn']) {
        elements['logout-btn'].addEventListener('click', handleLogout);
    }

    if (elements['modal-form']) {
        elements['modal-form'].addEventListener('submit', handleSave);
    }

    // Mobile Overlay & Sidebar Toggle
    const mobileOverlay = document.createElement('div');
    mobileOverlay.className = 'mobile-overlay';
    document.body.appendChild(mobileOverlay);

    if (elements['sidebar-toggle']) {
        elements['sidebar-toggle'].addEventListener('click', () => {
            if (window.innerWidth < 992) {
                elements.sidebar.classList.toggle('mobile-open');
                mobileOverlay.classList.toggle('show');
            } else {
                elements.sidebar.classList.toggle('collapsed');
            }
        });
    }

    mobileOverlay.addEventListener('click', () => {
        elements.sidebar.classList.remove('mobile-open');
        mobileOverlay.classList.remove('show');
    });

    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const view = item.getAttribute('data-view');
            if (view) {
                e.preventDefault();
                switchView(view);
                if (window.innerWidth < 992) {
                    elements.sidebar.classList.remove('mobile-open');
                    mobileOverlay.classList.remove('show');
                }
            }
        });
    });

    if (elements['search-input']) {
        let searchTimeout;
        elements['search-input'].addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => handleSearch(e.target.value), 300);
        });
    }

    if (elements['btn-confirm-delete']) {
        elements['btn-confirm-delete'].onclick = confirmRealDelete;
    }

    const btnSupportAction = document.getElementById('btn-support-action');
    if (btnSupportAction) {
        btnSupportAction.onclick = () => {
            if (elements.bsSupportModal) elements.bsSupportModal.hide();
            const action = btnSupportAction.dataset.action;
            if (action) switchView(action);
        };
    }

    if (elements['theme-toggle']) {
        elements['theme-toggle'].addEventListener('click', window.appToggleDarkMode);
    }

    if (elements['login-theme-toggle']) {
        elements['login-theme-toggle'].addEventListener('click', window.appToggleDarkMode);
    }

    // Global Switch Confirmation toggle - CAPTURING to run BEFORE element listeners
    document.addEventListener('change', async (e) => {
        const target = e.target;
        if (target && target.classList.contains('form-check-input') && target.type === 'checkbox') {
            // Prevent infinite loop when we re-dispatch
            if (e.skipConfirm) return;

            // Check if this is part of the Outlook Email modal which should NOT confirm
            const view = elements['modal-form'] ? elements['modal-form'].dataset.view : '';
            if (view === 'correos_outlook') return; // Bypass for email settings

            // STOP other listeners (like visibility logic) from running with unconfirmed state
            e.stopImmediatePropagation();

            const desiredState = target.checked;
            const originalState = !desiredState;
            target.checked = originalState; // Revert immediately to await modal

            const row = target.closest('.form-check');
            const labelEl = row ? row.querySelector('label') : null;
            const labelText = labelEl ? labelEl.innerText.trim() : 'este interruptor';

            const confirmed = await window.showConfirm(
                '¿Confirmar Acción?',
                `¿Estás seguro de que deseas cambiar el estado de "${labelText}"?`
            );

            if (confirmed) {
                target.checked = desiredState;
                // Manually re-dispatch the event so local listeners (like App Lock logic) finally run
                const confirmedEvent = new Event('change', { bubbles: true });
                confirmedEvent.skipConfirm = true;
                target.dispatchEvent(confirmedEvent);
            }
        }
    }, true);

    // QR SCANNER TRIGGER
    if (elements['btn-scan-qr']) {
        elements['btn-scan-qr'].onclick = () => window.initScanner();
    }

    if (elements['btn-save-maintenance-modal']) {
        elements['btn-save-maintenance-modal'].onclick = () => window.saveMaintenanceFromModal();
    }

    const qrFileInput = document.getElementById('qr-file-input');
    if (qrFileInput) {
        qrFileInput.onchange = e => {
            const file = e.target.files[0];
            if (file) window.handleQRFile(file);
        };
    }
}

// --- Keyboard Shortcuts (Power-User Mode) ---
document.addEventListener('keydown', async (e) => {
    // 1. ESCAPE: High Priority (Always works unless in full-screen video or something)
    if (e.key === 'Escape') {
        // Close side drawer if open
        const drawer = document.getElementById('side-drawer');
        if (drawer && drawer.classList.contains('show')) {
            window.toggleDrawer(false);
            return;
        }

        // Close latest modal in stack
        if (typeof state !== 'undefined' && state.modalStack && state.modalStack.length > 0) {
            const latestId = state.modalStack[state.modalStack.length - 1];
            if (typeof ModalManager !== 'undefined') {
                ModalManager.hide(latestId);
            } else {
                // Fallback direct bootstrap hide
                const modalEl = document.getElementById(latestId);
                if (modalEl) {
                    const inst = bootstrap.Modal.getInstance(modalEl);
                    if (inst) inst.hide();
                }
            }
            return;
        }

        // Close Search Modal if open
        if (elements.bsSearchModal && document.getElementById('searchModal').classList.contains('show')) {
            elements.bsSearchModal.hide();
            return;
        }
    }

    // 2. CTRL + S (SAVE FORM): Works when a modal is open
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        const modalForm = document.getElementById('modal-form');
        const mainModal = document.getElementById('mainModal');
        if (mainModal && mainModal.classList.contains('show') && modalForm) {
            e.preventDefault();
            // Trigger the same logic as the submit button
            handleSave({ preventDefault: () => { }, target: modalForm });
            return;
        }
    }

    // Don't trigger navigation shortcuts if user is typing in an input
    const activeEl = document.activeElement;
    const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
    if (isInput) return;

    // /: Focus Search (Global Search or Sidebar Search)
    if (e.key === '/') {
        e.preventDefault();
        const search = document.getElementById('search-input') || document.getElementById('dashboard-global-search');
        if (search) {
            search.focus();
            search.classList.add('pulse-search');
            setTimeout(() => search.classList.remove('pulse-search'), 600);
        }
    }

    // Alt + N: Create New Record
    if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        const btnAdd = document.getElementById('btn-add-item') ||
            document.getElementById('btn-add-tutorial') ||
            document.getElementById('btn-upload-file') ||
            document.getElementById('btn-add-credential');

        if (btnAdd && !btnAdd.classList.contains('d-none')) {
            btnAdd.click();
        } else {
            const subView = state.subViews[state.currentView] || state.currentView;
            if (typeof window.openModal === 'function') {
                window.openModal(subView);
            }
        }
    }
});

// --- Aesthetic Confirm Helper ---
window.showConfirm = function (title, body) {
    return new Promise((resolve) => {
        if (!elements.bsConfirmModal) {
            // Fallback if not initialized
            resolve(confirm(body));
            return;
        }

        elements['confirm-modal-title'].textContent = title;
        elements['confirm-modal-body'].textContent = body;

        const okBtn = elements['btn-confirm-ok'];
        const cancelBtn = elements['btn-confirm-cancel'];

        const onOk = () => {
            elements.bsConfirmModal.hide();
            cleanup();
            resolve(true);
        };
        const onCancel = () => {
            elements.bsConfirmModal.hide();
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            okBtn.removeEventListener('click', onOk);
            cancelBtn.removeEventListener('click', onCancel);
        };

        okBtn.addEventListener('click', onOk);
        cancelBtn.addEventListener('click', onCancel);

        ModalManager.show('confirmModal');
    });
};

// --- Theme Management ---
function initTheme() {
    const isDark = localStorage.getItem('darkMode') === 'enabled';
    if (isDark) {
        document.body.classList.add('dark-mode');
    }
    window.appUpdateThemeUI(isDark);
}

// --- Moved up to global scope ---

// --- Authentication ---

async function handleLogin(e) {
    e.preventDefault();
    console.log("Handle Login called");

    const btn = e.target.querySelector('button[type="submit"]');
    if (!btn) return;

    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Cargando...';
    btn.disabled = true;

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (elements['login-error']) elements['login-error'].classList.add('d-none');

    try {
        const response = await fetch(`${CONFIG.apiUrl}/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.user) {
                loginSuccess(data.user);
                return;
            }
        } else if (response.status !== 401) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error del servidor (${response.status})`);
        }

        // Fallback Mock
        if (CONFIG.mockFallback && username === 'admin' && password === 'admin') {
            loginSuccess({
                name: "Administrador TI",
                role: "admin",
                avatar: "https://ui-avatars.com/api/?name=Admin+TI&background=3b82f6&color=fff"
            });
            return;
        }

        throw new Error('Usuario o contraseña incorrectos');
    } catch (err) {
        if (elements['login-error']) {
            elements['login-error'].textContent = err.message;
            elements['login-error'].classList.remove('d-none');
        }
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function loginSuccess(user) {
    state.user = user;
    localStorage.setItem('user', JSON.stringify(user));
    updateActivity();
    showApp();
    startSessionMonitor();
}

function handleLogout() {
    state.user = null;
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    showLogin();
    // Refresh to clear intervals and listeners
    window.location.reload();
}

// --- Navigation ---

function showLogin() {
    if (elements['login-screen']) elements['login-screen'].classList.remove('d-none');
    if (elements['app-screen']) elements['app-screen'].classList.add('d-none');
}

async function showApp() {
    if (elements['login-screen']) elements['login-screen'].classList.add('d-none');
    if (elements['app-screen']) elements['app-screen'].classList.remove('d-none');

    if (elements['user-name']) elements['user-name'].textContent = state.user.name;
    if (elements['user-name-menu']) elements['user-name-menu'].textContent = state.user.name;

    const roleText = state.user.role === 'admin' ? 'Administrador' : 'Consulta';
    if (elements['user-role-sidebar']) elements['user-role-sidebar'].textContent = roleText;
    if (elements['user-role-menu']) elements['user-role-menu'].textContent = roleText;

    if (elements['user-avatar']) elements['user-avatar'].src = state.user.avatar;

    // Handle Initials for Sidebar
    if (elements['user-avatar-sidebar']) {
        const names = (state.user.name || "Usuario TI").split(" ");
        const initials = names.length > 1 ? (names[0][0] + names[1][0]).toUpperCase() : names[0].substring(0, 2).toUpperCase();
        elements['user-avatar-sidebar'].textContent = initials;
    }

    if (elements['nav-users']) {
        elements['nav-users'].classList.toggle('d-none', state.user.role !== 'admin');
    }
    // Sync calendar with DB
    await window.migrateLocalReminders();
    await window.fetchCalendarReminders();

    await switchView('dashboard');
}

async function switchView(view) {
    const sortDefaults = {
        'inventory': 'zone', 'peripherals': 'name', 'assignments': 'employee_name',
        'emails': 'start_date', 'office_emails': 'start_date', 'microsoft_emails': 'start_date',
        'licenses': 'type', 'network': 'device_type', 'enterprise_networks': 'device_type',
        'tutorials': 'title', 'users': 'fullname', 'correos_outlook': 'correo', 'account_management': 'email', 'notes': 'title'
    };
    state.sort = { column: sortDefaults[view] || 'id', direction: 'asc' };
    state.currentView = view;

    // Determine sub-label for breadcrumbs
    let subLabel = null;
    if (state.subViews[view]) {
        const labels = {
            'office_emails': 'Office', 'microsoft_emails': 'Microsoft 365', 'emails': 'Reenvíos',
            'enterprise_networks': 'WiFi', 'network': 'Red',
            'licenses_lic': 'Licencias', 'licenses_cred': 'Credenciales',
            'correos_outlook': 'Outlook', 'account_management': 'Cuentas',
            'printers': 'Impresoras', 'inks': 'Tintas', 'toner': 'Tóner',
            'inventory': 'Laptos/PC', 'cellphones': 'Celulares'
        };
        subLabel = labels[state.subViews[view]];
    }
    updateBreadcrumbs(view, subLabel);

    elements.navItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-view') === view);
    });

    const titles = {
        'dashboard': 'Panel de Control', 'inventory': 'Gestión de Equipos',
        'peripherals': 'Accesorios y Periféricos', 'assignments': 'Asignaciones de Equipo',
        'emails': 'Control de Correos', 'office_emails': 'Control de Correos (Office)',
        'microsoft_emails': 'Control de Correos (Microsoft 365)',
        'licenses': 'Control de Licencias',
        'network': 'Gestión de Redes', 'enterprise_networks': 'Gestión de Redes (WiFi)',
        'tutorials': 'Biblioteca de Tutoriales',
        'printers': 'Control de impresoras',
        'account_management': 'Cuentas de Acceso y Gestión',
        'users': 'Gestión de Usuarios', 'ftp': 'Gestor de Archivos FTP', 'notes': 'Notas del Equipo',
        'results': 'Resultados de Búsqueda', 'search': 'Resultados de Búsqueda'
    };

    if (elements['view-title']) elements['view-title'].textContent = titles[view] || 'IT Inventory';
    if (elements['search-container']) {
        elements['search-container'].classList.toggle('d-none', view === 'dashboard');
    }

    // Limpiar el campo de búsqueda al cambiar de vista
    if (elements['search-input']) {
        elements['search-input'].value = '';
    }

    // For dashboard, we await data before rendering to avoid "0" flicker
    if (view === 'dashboard') {
        await fetchData(view);
    }

    renderView(view);

    if (view !== 'dashboard') {
        await fetchData(view);
    }
}

function updateBreadcrumbs(view, subViewLabel = null) {
    const container = document.getElementById('breadcrumb-container');
    if (!container) return;
    const ol = container.querySelector('ol');
    if (!ol) return;

    const views = {
        'dashboard': { label: 'Inicio' },
        'inventory': { label: 'Equipos' },
        'peripherals': { label: 'Periféricos' },
        'printers': { label: 'Impresoras' },
        'emails': { label: 'Correos' },
        'office_emails': { label: 'Correos (Office)' },
        'microsoft_emails': { label: 'Correos (365)' },
        'licenses': { label: 'Credenciales' },
        'network': { label: 'Red' },
        'enterprise_networks': { label: 'WiFi' },
        'tutorials': { label: 'Tutoriales' },
        'ftp': { label: 'Archivos' },
        'notes': { label: 'Notas' }
    };

    if (view === 'dashboard') {
        container.classList.add('d-none');
        return;
    }

    container.classList.remove('d-none');
    const main = views[view] || { label: view };

    let html = `<li class="breadcrumb-item"><a href="#" onclick="switchView('dashboard')">Inicio</a></li>`;

    if (subViewLabel) {
        html += `<li class="breadcrumb-item"><a href="#" onclick="switchView('${view}')">${main.label}</a></li>`;
        html += `<li class="breadcrumb-item active" aria-current="page">${subViewLabel}</li>`;
    } else {
        html += `<li class="breadcrumb-item active" aria-current="page">${main.label}</li>`;
    }

    ol.innerHTML = html;
}

// ... (Rest of functions like renderView, fetchData, renderTable follow same safe pattern)

function syncAllData(view) {
    if (view === 'inventory') {
        state.allData = (state.data.inventory || []).filter(i =>
            (i.category !== 'Impresora' && i.category !== 'Periférico' && i.category !== 'Accesorio')
        );
    } else if (view === 'peripherals') {
        state.allData = state.data.peripherals || [];
    } else if (view === 'printers') {
        state.allData = state.data.printers || [];
    } else {
        state.allData = state.data[view] || [];
    }
}

window.quickUpdateStatus = async (view, id, field, newValue) => {
    // 1. Find the current item data in state
    let list = [];
    if (view === 'inventory') list = state.data.inventory;
    else if (view === 'peripherals') list = state.data.peripherals;
    else if (view === 'printers') list = state.data.printers;
    else if (view === 'inks') list = state.data.inks;
    else if (view === 'toner') list = state.data.toner;
    else if (view === 'cellphones') list = state.data.cellphones;
    else if (view === 'emails' || view === 'office_emails' || view === 'microsoft_emails') list = state.data[view];
    else if (view === 'licenses' || view === 'licenses_cred') list = state.data.licenses;
    else list = state.data[view];

    const originalItem = list ? list.find(x => x.id == id) : null;
    if (!originalItem) return;

    // 2. Clone it and update specifically the field
    const payload = { ...originalItem, [field]: newValue };

    // 3. Re-use same logic as handleSave for endpoint determination
    const endp = (view === 'licenses_cred' || view === 'licenses_lic' ? 'licenses.php' :
        (view === 'inks' ? 'inks.php' :
            (view === 'toner' ? 'toner.php' : `${view}.php`)));

    const url = `${CONFIG.apiUrl}/${endp}?id=${id}`;

    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            showToast('Actualizado', `Estado cambiado a ${newValue}`, 'success');
            await fetchData(view);
        } else {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || 'No se pudo actualizar el estado');
        }
    } catch (e) {
        showToast('Error', e.message, 'danger');
    }
};

async function renderView(view) {
    if (!elements['content-area']) return;

    // Smooth transition using Skeletons instead of a spinner
    if (view === 'dashboard') {
        renderSkeletons(elements['content-area'], 'cards', 3);
    } else {
        renderSkeletons(elements['content-area'], 'table', 8);
    }

    const tplId =
        view === 'dashboard' ? 'tpl-dashboard' :
            (view === 'tutorials' ? 'tpl-tutorials' :
                (view === 'ftp' ? 'tpl-ftp' :
                    (view === 'emails' || view === 'office_emails' || view === 'microsoft_emails' ? 'tpl-emails-view' :
                        (view === 'network' || view === 'enterprise_networks' ? 'tpl-network-view' :
                            (view === 'printers' || view === 'inks' || view === 'toner' ? 'tpl-printers-view' :
                                (view === 'inventory' || view === 'cellphones' ? 'tpl-inventory' :
                                    (view === 'peripherals' ? 'tpl-peripherals-view' :
                                        (view === 'licenses' || view === 'licenses_cred' ? 'tpl-licenses-view' :
                                            (view === 'notes' ? 'tpl-notes-view' : 'tpl-table-view')))))))));

    const tpl = document.getElementById(tplId);
    if (!tpl) {
        elements['content-area'].innerHTML = '<div class="alert alert-danger">Template non found: ' + tplId + '</div>';
        return;
    }

    elements['content-area'].innerHTML = '';
    elements['content-area'].appendChild(tpl.content.cloneNode(true));

    if (view === 'dashboard') {
        updateDashboardStats();
        renderNotesDashboard();
        initMiniCalendar();
    }
    if (view === 'emails' || view === 'office_emails' || view === 'microsoft_emails') renderEmailsArea();
    if (view === 'network' || view === 'enterprise_networks') renderNetworkArea();
    if (view === 'licenses' || view === 'licenses_cred') renderLicensesArea();
    if (view === 'printers' || view === 'inks' || view === 'toner') renderPrintersArea();
    if (view === 'inventory' || view === 'cellphones') renderInventoryArea();
    if (view === 'peripherals') renderPeripheralsArea();

    // Default card titles for generic view
    if (view === 'inventory' || view === 'peripherals' || view === 'users') {
        const titles = { 'inventory': 'Computadoras', 'peripherals': 'Accesorios', 'users': 'Usuarios' };
        const descs = {
            'inventory': 'Inventario detallado de equipos de cómputo, laptops y estaciones de trabajo.',
            'peripherals': 'Control de accesorios de TI como teclados, mouse, diademas y monitores.',
            'users': 'Administración de usuarios autorizados para acceder al sistema de inventario.'
        };
        const titleEl = document.getElementById('single-table-title');
        const descEl = document.getElementById('single-table-desc');
        if (titleEl) titleEl.textContent = titles[view] || 'Registros';
        if (descEl) descEl.textContent = descs[view] || 'Gestión completa de datos registrados.';

        // Dynamic button color for generic view
        const btnAdd = document.getElementById('btn-add-item');
        if (btnAdd) {
            const btnThemes = { 'inventory': 'btn-premium-primary', 'peripherals': 'btn-premium-warning', 'users': 'btn-premium-primary' };
            btnAdd.className = `btn ${btnThemes[view] || 'btn-premium-primary'} d-flex align-items-center fw-bold px-4 py-2`;
        }
    }

    const isAdmin = state.user.role === 'admin';

    if (view === 'tutorials') {
        const btnAdd = document.getElementById('btn-add-tutorial');
        if (btnAdd) {
            if (isAdmin) btnAdd.onclick = () => openModal(view);
            else btnAdd.classList.add('d-none');
        }
    } else if (view === 'ftp') {
        const btnUpload = document.getElementById('btn-upload-file');
        if (btnUpload) {
            if (isAdmin) btnUpload.onclick = () => openUploadModal();
            else btnUpload.classList.add('d-none');
        }
    } else if (view === 'licenses') {
        const btnAddCred = document.getElementById('btn-add-credential');
        const btnAddLic = document.getElementById('btn-add-license');
        if (!isAdmin) {
            if (btnAddCred) btnAddCred.classList.add('d-none');
            if (btnAddLic) btnAddLic.classList.add('d-none');
        }
    } else if (view !== 'dashboard') {
        const btnAdd = document.getElementById('btn-add-item');
        if (btnAdd) {
            if (isAdmin) btnAdd.onclick = () => openModal(view);
            else btnAdd.classList.add('d-none');
        }
        const btnExp = document.getElementById('btn-export');
        if (btnExp) {
            btnExp.innerHTML = '<i class="bi bi-file-earmark-excel me-2"></i> Excel';
            btnExp.onclick = () => window.exportToExcel(view);
        }
    }
}

async function fetchData(view) {
    const endpoints = {
        'dashboard': 'stats.php', 'inventory': 'inventory.php', 'peripherals': 'peripherals.php',
        'printers': 'printers.php', 'licenses': 'licenses.php', 'network': 'network.php',
        'tutorials': 'tutorials.php', 'users': 'users.php', 'emails': 'emails.php', 'inks': 'inks.php',
        'toner': 'toner.php',
        'cellphones': 'cellphones.php',
        'account_management': 'account_management.php',
        'microsoft_emails': 'microsoft_emails.php',
        'office_emails': 'office_emails.php',
        'enterprise_networks': 'enterprise_networks.php',
        'correos_outlook': 'correos_outlook.php',
        'notes': 'notes.php'
    };

    try {
        const ep = endpoints[view];

        // Handle FTP view separately
        // Handle FTP view separately
        if (view === 'ftp') {
            try {
                const response = await fetch(`${CONFIG.apiUrl}/ftp.php`);
                if (response.ok) {
                    const files = await response.json();
                    state.data.ftp = files;
                    state.allData = files;
                    await renderFTPFiles(files);
                }
            } catch (e) { console.error("FTP Fetch error", e); }
            return;
        }

        if (!ep) return;

        const response = await fetch(`${CONFIG.apiUrl}/${ep}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        let data = await response.json();

        // Standardize data format (some APIs might return { data: [...] } or { registros: [...] })
        if (data && !Array.isArray(data)) {
            data = data.data || data.registros || data.accounts || data.items || data;
        }

        const targetView = (view === 'licenses_cred' ? 'licenses' : view);
        if (view === 'dashboard') {
            state.data.stats = data;
            // For dashboard, we need background data for the charts/counters
            // We fetch them in parallel to be efficient
            const epList = [
                { key: 'inventory', url: 'inventory.php' },
                { key: 'peripherals', url: 'peripherals.php' },
                { key: 'licenses', url: 'licenses.php' },
                { key: 'cellphones', url: 'cellphones.php' },
                { key: 'tutorials', url: 'tutorials.php' },
                { key: 'toner', url: 'toner.php' },
                { key: 'emails', url: 'emails.php' },
                { key: 'printers', url: 'printers.php' },
                { key: 'notes', url: 'notes.php' },
                { key: 'account_management', url: 'account_management.php' },
                { key: 'correos_outlook', url: 'correos_outlook.php' },
                { key: 'microsoft_emails', url: 'microsoft_emails.php' },
                { key: 'office_emails', url: 'office_emails.php' }
            ];

            await Promise.all(epList.map(async (item) => {
                try {
                    const res = await fetch(`${CONFIG.apiUrl}/${item.url}`);
                    if (res.ok) {
                        let d = await res.json();
                        state.data[item.key] = (d && !Array.isArray(d)) ? (d.data || d.registros || d.accounts || d.items || d) : d;
                    }
                } catch (e) {
                    console.error(`Error fetching background data for ${item.key}:`, e);
                }
            }));
        } else {
            state.data[targetView] = data;
        }

        if (view === 'inventory') {
            const resCel = await fetch(`${CONFIG.apiUrl}/cellphones.php`);
            if (resCel.ok) {
                let d = await resCel.json();
                state.data.cellphones = (d && !Array.isArray(d)) ? (d.data || d.registros || d.accounts || d.items || d) : d;
            }
        }

        if (view === 'emails' || view === 'office_emails' || view === 'microsoft_emails') {
            const resOffice = await fetch(`${CONFIG.apiUrl}/office_emails.php`);
            if (resOffice.ok) {
                let d = await resOffice.json();
                state.data.office_emails = (d && !Array.isArray(d)) ? (d.data || d.registros || d.accounts || d.items || d) : d;
            }
            const resMS = await fetch(`${CONFIG.apiUrl}/microsoft_emails.php`);
            if (resMS.ok) {
                let d = await resMS.json();
                state.data.microsoft_emails = (d && !Array.isArray(d)) ? (d.data || d.registros || d.accounts || d.items || d) : d;
            }
        }

        if (view === 'network' || view === 'enterprise_networks') {
            const resEnt = await fetch(`${CONFIG.apiUrl}/enterprise_networks.php`);
            if (resEnt.ok) {
                let d = await resEnt.json();
                state.data.enterprise_networks = (d && !Array.isArray(d)) ? (d.data || d.registros || d.accounts || d.items || d) : d;
            }
        }

        if (view === 'licenses' || view === 'licenses_cred' || view === 'correos_outlook' || view === 'account_management') {
            const deps = [
                { key: 'account_management', url: 'account_management.php' },
                { key: 'correos_outlook', url: 'correos_outlook.php' }
            ];
            await Promise.all(deps.map(async (d) => {
                try {
                    const r = await fetch(`${CONFIG.apiUrl}/${d.url}`);
                    if (r.ok) {
                        let data = await r.json();
                        state.data[d.key] = (data && !Array.isArray(data)) ? (data.data || data.registros || data.accounts || data.items || data) : data;
                    }
                } catch (e) { console.error(`Error fetching ${d.key}`, e); }
            }));
        }

        if (view === 'printers') {
            const resInks = await fetch(`${CONFIG.apiUrl}/inks.php`);
            if (resInks.ok) {
                let d = await resInks.ok ? await resInks.json() : [];
                state.data.inks = (d && !Array.isArray(d)) ? (d.data || d.registros || d.accounts || d.items || d) : d;
            }

            const resToner = await fetch(`${CONFIG.apiUrl}/toner.php`);
            if (resToner.ok) {
                let d = await resToner.json();
                state.data.toner = (d && !Array.isArray(d)) ? (d.data || d.registros || d.accounts || d.items || d) : d;
            }
        }

        syncAllData(view);

        if (view === 'dashboard') {
            updateDashboardStats();
            renderNotesDashboard();
            initMiniCalendar();
        }
        else if (view === 'tutorials') renderTutorials();
        else if (view === 'emails' || view === 'office_emails' || view === 'microsoft_emails') renderEmailsArea();
        else if (view === 'network' || view === 'enterprise_networks') renderNetworkArea();
        else if (view === 'licenses' || view === 'licenses_cred' || view === 'correos_outlook' || view === 'account_management') renderLicensesArea();
        else if (view === 'printers') renderPrintersArea();
        else if (view === 'inventory') renderInventoryArea();
        else if (view === 'peripherals') renderPeripheralsArea();
        else if (view === 'notes') renderNotesArea();
        else renderTable(view);

    } catch (err) {
        console.error("Fetch error", err);
    }
}

function renderEmailsArea() {
    let active = state.subViews['emails'];
    // If current view is a sub-view, respect it
    if (state.currentView === 'office_emails' || state.currentView === 'microsoft_emails') {
        active = state.currentView;
        state.subViews['emails'] = active;
    }
    updateNavCardUI('emails', active);
    renderSubTableContainer('emails', active, 'emails-table-container');
}

function renderNetworkArea() {
    const active = state.subViews['network'];
    updateNavCardUI('network', active);
    renderSubTableContainer('network', active, 'network-table-container');
}

function renderLicensesArea() {
    let active = state.subViews['licenses'];
    if (state.currentView === 'correos_outlook') {
        active = 'correos_outlook';
        state.subViews['licenses'] = active;
    }
    updateNavCardUI('licenses', active);
    renderSubTableContainer('licenses', active, 'licenses-table-container');
}

function renderPrintersArea() {
    const active = state.subViews['printers'];
    updateNavCardUI('printers', active);
    renderSubTableContainer('printers', active, 'printers-table-container');
}

function renderInventoryArea() {
    const active = state.subViews['inventory'];
    updateNavCardUI('inventory', active);
    renderSubTableContainer('inventory', active, 'inventory-table-container');
}

function renderPeripheralsArea() {
    if (!state.subViews['peripherals']) state.subViews['peripherals'] = 'peripherals';
    const active = state.subViews['peripherals'];
    renderSubTableContainer('peripherals', active, 'peripherals-table-container');
}

function renderNotesArea() {
    const data = state.data.notes || [];
    const container = document.getElementById('notes-selection-actions');
    if (container) container.classList.add('d-none');
    renderTable('notes', data, 'table-body-notes', 'table-head-notes');
}

window.toggleAllNotes = function (master) {
    const checkboxes = document.querySelectorAll('.note-checkbox');
    checkboxes.forEach(cb => cb.checked = master.checked);
    window.toggleNoteSelection();
};

window.toggleNoteSelection = function () {
    const checkboxes = document.querySelectorAll('.note-checkbox:checked');
    const container = document.getElementById('notes-selection-actions');
    const countEl = document.getElementById('notes-selected-count');

    if (container && countEl) {
        if (checkboxes.length > 0) {
            container.classList.remove('d-none');
            countEl.textContent = `${checkboxes.length} seleccionadas`;
        } else {
            container.classList.add('d-none');
        }
    }
};

window.deleteSelectedNotes = function () {
    const checkboxes = document.querySelectorAll('.note-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => cb.getAttribute('data-id'));

    if (ids.length === 0) return;

    state.deleteInfo = { view: 'notes', id: ids.join(','), name: `${ids.length} notas seleccionadas` };
    const nameEl = document.getElementById('delete-item-name');
    if (nameEl) nameEl.textContent = state.deleteInfo.name;
    ModalManager.show('deleteModal');
};

function renderSubTableContainer(mainView, subView, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Build the table structure inside the container
    const labels = {
        'emails': 'Correos Reenviados', 'office_emails': 'Correos Windows', 'microsoft_emails': 'Office 365',
        'network': 'Dispositivos de Red', 'enterprise_networks': 'Red Empresarial',
        'licenses_cred': 'Credenciales de Acceso', 'correos_outlook': 'Correos de Outlook', 'licenses': 'Credenciales / Licencias',
        'printers': 'Inventario de Impresoras', 'inks': 'Inventario de Tintas', 'toner': 'Control de Tóner',
        'inventory': 'Computadoras', 'cellphones': 'Celulares', 'peripherals': 'Accesorios y Periféricos'
    };

    const dataKey = (subView === 'licenses_cred') ? 'licenses' : subView;
    let data = state.data[dataKey] || [];

    // Filtering for licenses if needed
    if (subView === 'licenses_cred') data = data.filter(x => String(x.type).toLowerCase().includes('creden'));
    if (subView === 'licenses') data = data.filter(x => String(x.type).toLowerCase().includes('licenc'));
    if (subView === 'inventory') data = state.data.inventory || [];
    if (subView === 'printers') data = state.data.printers || [];

    const themeMap = {
        'inventory': 'btn-premium-primary',
        'peripherals': 'btn-premium-warning',
        'cellphones': 'btn-premium-success',
        'printers': 'btn-premium-primary',
        'inks': 'btn-premium-info',
        'toner': 'btn-premium-warning',
        'licenses': 'btn-premium-success',
        'licenses_cred': 'btn-premium-primary',
        'correos_outlook': 'btn-premium-info',
        'emails': 'btn-premium-primary',
        'office_emails': 'btn-premium-info',
        'microsoft_emails': 'btn-premium-success',
        'network': 'btn-premium-primary',
        'enterprise_networks': 'btn-premium-info',
        'users': 'btn-premium-primary'
    };
    const btnTheme = themeMap[subView] || 'btn-premium-primary';

    const activeCols = getTableColumns(subView).map(c => c.key);
    const fields = getFieldsForView(subView).filter(f => f.showInTable !== false);
    const colPicker = `
        <div class="position-relative d-inline-block">
            <style>
                .mini-switch {
                    position: relative;
                    display: inline-block;
                    width: 34px !important;
                    height: 20px !important;
                    margin: 0 !important;
                }
                .mini-switch input {
                    opacity: 0 !important;
                    width: 0 !important;
                    height: 0 !important;
                }
                .mini-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-color: #cbd5e1;
                    transition: .3s;
                    border-radius: 20px;
                }
                .mini-slider:before {
                    position: absolute;
                    content: "";
                    height: 14px;
                    width: 14px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .3s;
                    border-radius: 50%;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
                }
                .mini-switch input:checked + .mini-slider {
                    background-color: #10b981 !important;
                }
                .mini-switch input:checked + .mini-slider:before {
                    transform: translateX(14px) !important;
                }
                .custom-col-picker-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 8px;
                    background-color: #ffffff !important;
                    border: 1px solid #cbd5e1 !important;
                    box-shadow: 0 12px 30px rgba(0,0,0,0.15) !important;
                    border-radius: 12px !important;
                    padding: 12px !important;
                    z-index: 999999 !important;
                    min-width: 250px !important;
                    display: none;
                }
                .custom-col-picker-menu.show {
                    display: block;
                }
                body.dark-mode .custom-col-picker-menu {
                    background-color: #1e293b !important;
                    border-color: #334155 !important;
                }
                body.dark-mode .custom-col-picker-menu .text-dark {
                    color: #f8fafc !important;
                }
            </style>
            <button class="btn btn-outline-secondary btn-sm fw-bold px-3 d-flex align-items-center rounded-pill" onclick="document.getElementById('customColMenu-${subView}').classList.toggle('show'); event.stopPropagation();" title="Columnas">
                <i class="bi bi-layout-three-columns me-md-1"></i> <span class="d-none d-md-inline">Columnas</span>
            </button>
            <div id="customColMenu-${subView}" class="custom-col-picker-menu" onclick="event.stopPropagation();">
                <h6 class="px-0 mb-2 text-dark fw-bold border-bottom pb-2">Mostrar Columnas</h6>
                <div class="col-picker-list" style="max-height: 300px; overflow-y: auto;">
                ${fields.map(f => `
                    <div class="d-flex align-items-center justify-content-between py-2 border-bottom border-light">
                        <span class="small fw-semibold text-secondary">${f.label}</span>
                        <label class="mini-switch">
                            <input type="checkbox" 
                                   ${(activeCols.includes(f.name) ? state.columnVisibility[subView]?.[f.name] !== false : state.columnVisibility[subView]?.[f.name] === true) ? 'checked' : ''}
                                   onchange="window.toggleColumn('${subView}', '${f.name}', this.checked)">
                            <span class="mini-slider"></span>
                        </label>
                    </div>
                `).join('')}
                </div>
            </div>
        </div>`;

    container.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 animate-fade-in">
            <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center" style="position: relative; z-index: 1050;">
                <h5 class="fw-bold m-0 text-dark">${labels[subView] || 'Tabla'}</h5>
                <div class="d-flex gap-2">
                    ${colPicker}
                    ${state.user.role === 'admin' ? `
                        <button class="btn ${btnTheme} btn-sm fw-bold px-3 d-flex align-items-center btn-responsive-mobile" onclick="window.openModal('${subView}')">
                            <i class="bi bi-plus-lg me-md-2"></i> <span class="btn-text">Nuevo Registro</span>
                        </button>
                    ` : ''}
                    <button class="btn btn-outline-primary btn-sm fw-bold px-3 d-flex align-items-center btn-responsive-mobile" onclick="window.exportToExcel('${subView}')">
                        <i class="bi bi-file-earmark-excel me-md-1"></i> <span class="btn-text">Excel</span>
                    </button>
                </div>
            </div>
            <div class="card-body p-0" style="position: relative; z-index: 1;">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr id="table-head-${subView}"></tr>
                        </thead>
                        <tbody id="table-body-${subView}"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Global listener for closing our custom menu, add it only once
    if (!window.colPickerListened) {
        document.addEventListener('click', function (e) {
            const menus = document.querySelectorAll('.custom-col-picker-menu.show');
            menus.forEach(menu => {
                if (!menu.contains(e.target) && (!menu.previousElementSibling || !menu.previousElementSibling.contains(e.target))) {
                    menu.classList.remove('show');
                }
            });
        });
        window.colPickerListened = true;
    }

    renderTable(subView, data, `table-body-${subView}`, `table-head-${subView}`);
}

window.switchSubView = function (mainView, subView) {
    state.subViews[mainView] = subView;
    updateNavCardUI(mainView, subView);

    const subViewLabels = {
        'office_emails': 'Office', 'microsoft_emails': 'Microsoft 365', 'emails': 'Reenvíos',
        'enterprise_networks': 'WiFi', 'network': 'Red',
        'licenses_lic': 'Licencias', 'licenses_cred': 'Credenciales',
        'correos_outlook': 'Outlook', 'account_management': 'Cuentas',
        'printers': 'Impresoras', 'inks': 'Tintas', 'toner': 'Tóner',
        'inventory': 'Laptos/PC', 'cellphones': 'Celulares'
    };
    updateBreadcrumbs(mainView, subViewLabels[subView]);

    // Limpiar el campo de búsqueda al cambiar de sub-vista
    if (elements['search-input']) {
        elements['search-input'].value = '';
    }

    // Re-render the area
    if (mainView === 'emails') renderEmailsArea();
    if (mainView === 'network') renderNetworkArea();
    if (mainView === 'licenses') renderLicensesArea();
    if (mainView === 'printers') renderPrintersArea();
    if (mainView === 'inventory') renderInventoryArea();
};

function updateNavCardUI(mainView, subView) {
    const cardsContainer = document.getElementById(`${mainView}-cards`);
    if (!cardsContainer) return;

    const cards = cardsContainer.querySelectorAll('.section-nav-card');
    cards.forEach(card => {
        const onClickAttr = card.getAttribute('onclick') || '';
        // Use regex to find the exact subView name as the last argument in the switchSubView call
        // Matches: '${subView}')
        const regex = new RegExp(`'${subView}'\\s*\\)`);
        if (regex.test(onClickAttr)) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

function renderTutorials(data = null) {
    const container = document.getElementById('tutorials-container');
    if (!container) return;

    const tutorials = data || state.data.tutorials || [];
    if (tutorials.length === 0) {
        container.innerHTML = '<div class="col-12 text-center p-5 text-muted">No hay tutoriales disponibles.</div>';
        return;
    }

    const themes = [
        { color: 'primary', premium: 'premium-primary', icon: 'text-primary', btn: 'btn-premium-primary' },
        { color: 'info', premium: 'premium-info', icon: 'text-info', btn: 'btn-premium-info' },
        { color: 'success', premium: 'premium-success', icon: 'text-success', btn: 'btn-premium-success' },
        { color: 'warning', premium: 'premium-warning', icon: 'text-warning', btn: 'btn-premium-warning' },
        { color: 'danger', premium: 'premium-danger', icon: 'text-danger', btn: 'btn-premium-danger' },
        { color: 'eng-blue-light', premium: 'premium-engineering-blue', icon: 'text-eng-blue', btn: 'btn-premium-engineering-blue' }
    ];

    container.innerHTML = tutorials.map((item) => {
        const theme = themes[Math.floor(Math.random() * themes.length)];
        const bgClass = theme.color.includes('eng') ? theme.color : `bg-${theme.color} bg-opacity-10`;

        return `
        <div class="col">
            <div class="card h-100 border-0 shadow-sm rounded-4 tutorial-card animate-fade-in kpi-card-v2 ${theme.premium}" onclick="window.viewItem('tutorials', ${item.id})">
                <div class="card-body p-4 text-center d-flex flex-column cursor-pointer">
                    <div class="${bgClass} p-3 rounded-circle d-inline-block mb-3 mx-auto">
                        <i class="bi bi-file-earmark-pdf ${theme.icon} fs-2"></i>
                    </div>
                    <h6 class="fw-bold mb-2">${item.title}</h6>
                    <p class="text-muted small mb-4 flex-grow-1 text-truncate-4">${item.description || 'Sin descripción'}</p>
                    <div class="d-flex gap-2" onclick="event.stopPropagation()">
                        <button class="btn ${theme.btn} w-100 rounded-pill fw-bold" onclick="window.viewPdf('${item.file_url}')">
                            <i class="bi bi-eye me-2"></i>Ver PDF
                        </button>
                        ${state.user.role === 'admin' ? `
                                <button class="btn btn-outline-danger rounded-pill" onclick="window.deleteItem('tutorials', ${item.id})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            ` : ''}
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    // --- Add Drag & Drop Support to FTP View ---
    const dropArea = document.getElementById('content-area'); // Main area for global drag-drop in FTP
    if (dropArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        dropArea.addEventListener('dragover', () => {
            dropArea.classList.add('drag-over-active');
            // Show a visual overlay if it doesn't exist
            let overlay = document.getElementById('ftp-drop-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'ftp-drop-overlay';
                overlay.className = 'ftp-drop-overlay animate-fade-in';
                overlay.innerHTML = '<div class="text-center text-white"><i class="bi bi-cloud-arrow-up display-1"></i><h3 class="fw-bold mt-4">Suelta para subir archivos</h3></div>';
                dropArea.appendChild(overlay);
            }
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.remove('drag-over-active');
                const overlay = document.getElementById('ftp-drop-overlay');
                if (overlay) overlay.remove();
            }, false);
        });

        dropArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileUpload(files[0]);
            }
        });
    }
}

async function handleFileUpload(file) {
    const formData = new FormData();
    formData.append('file', file);

    const toast = showToast('Subiendo...', `Subiendo ${file.name} `, 'info');

    try {
        const response = await fetch(`${CONFIG.apiUrl}/ftp.php`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            showToast('Éxito', 'Archivo subido correctamente', 'success');
            fetchData('ftp'); // Refresh list
        } else {
            showToast('Error', 'Error al subir el archivo', 'danger');
        }
    } catch (err) {
        console.error("Upload error", err);
        showToast('Error', 'Error de red al subir', 'danger');
    }
}


// --- HELPER WRAPPERS AND NEW FEATURES (11-15) ---

// 12. Toggle Column Visibility
window.toggleColumn = (view, colName, isVisible) => {
    if (!state.columnVisibility[view]) state.columnVisibility[view] = {};
    state.columnVisibility[view][colName] = isVisible;
    localStorage.setItem('colVisibility', JSON.stringify(state.columnVisibility));

    // UI Update -> Re-render entire table to inject any new columns 
    if (typeof handleSearch === 'function') handleSearch();
};

// 14. Context Menu Handlers
window.showContextMenu = (e, view, item) => {
    state.activeContextItem = { view, item };
    const menu = document.getElementById('context-menu');
    if (!menu) return;

    menu.style.display = 'block';
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;

    // Ensure it doesn't go off screen
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) menu.style.left = `${e.clientX - rect.width}px`;
    if (rect.bottom > window.innerHeight) menu.style.top = `${e.clientY - rect.height}px`;

    // Global listener to close
    const close = () => {
        menu.style.display = 'none';
        document.removeEventListener('click', close);
    };
    setTimeout(() => document.addEventListener('click', close), 10);
};

// Bind context menu actions
document.addEventListener('DOMContentLoaded', () => {
    const ctxEdit = document.getElementById('ctx-edit');
    const ctxView = document.getElementById('ctx-view');
    const ctxDelete = document.getElementById('ctx-delete');
    const ctxDuplicate = document.getElementById('ctx-duplicate');

    if (ctxEdit) ctxEdit.onclick = () => {
        const { view, item } = state.activeContextItem;
        window.editItem(view, item.id);
    };
    if (ctxView) ctxView.onclick = () => {
        const { view, item } = state.activeContextItem;
        window.viewItem(view, item.id);
    };
    if (ctxDelete) ctxDelete.onclick = () => {
        const { view, item } = state.activeContextItem;
        window.deleteItem(view, item.id);
    };
    if (ctxDuplicate) ctxDuplicate.onclick = () => {
        const { view, item } = state.activeContextItem;
        window.openModal(view); // Open empty
        // Pre-fill fields after a tiny delay
        setTimeout(() => {
            const fields = getFieldsForView(view);
            fields.forEach(f => {
                const input = document.getElementById(`f-${f.name}`);
                if (input && item[f.name] && f.name !== 'id' && f.name !== 'serial' && f.name !== 'admin_pass') {
                    if (f.type === 'checkbox' || f.type === 'switch') input.checked = !!item[f.name];
                    else input.value = item[f.name];
                }
            });
            showToast('Duplicando', 'Se ha copiado la mayoría de los campos (excepto ID y datos únicos)', 'info');
        }, 300);
    };
});

function updateDashboardStats() {
    const stats = state.data.stats;
    if (!stats) return;

    // Real-time metrics from the current state (populated by inventory.php)
    const inventory = state.data.inventory || [];

    // Categorization counts based on the 'format' field in the DB (with fallback)
    const laptops = inventory.filter(i => {
        if (i.format && i.format.trim() !== '') return i.format === 'Laptop / Notebook';
        return String(i.category).toLowerCase().includes('laptop') || String(i.name).toLowerCase().includes('laptop');
    }).length;

    const desktops = inventory.filter(i => {
        if (i.format && i.format.trim() !== '') return ['Desktop / PC de escritorio', 'All-in-One (AIO)', 'Mini PC'].includes(i.format);
        return (String(i.category).toLowerCase().includes('compu') || String(i.category).toLowerCase().includes('desktop')) && !String(i.name).toLowerCase().includes('laptop');
    }).length;
    const printersCount = (state.data.printers || []).length;
    const cellphones = (state.data.cellphones || []).length;
    const peripherals = (state.data.peripherals || []).length;

    // Status counts for Health Chart
    const statusCounts = {
        excelente: inventory.filter(i => i.status === 'Excelente' || i.status === 'Nuevo').length,
        bueno: inventory.filter(i => i.status === 'Disponible' || i.status === 'Bueno' || i.status === 'En Uso').length,
        atencion: inventory.filter(i => i.status === 'En Reparación' || i.status === 'Regular').length,
        baja: inventory.filter(i => i.status === 'Baja' || i.status === 'Dañado').length
    };

    // 11. DYNAMIC WELCOME MESSAGE
    const welcomeEl = document.getElementById('welcome-msg');
    if (welcomeEl && state.user) {
        const hour = new Date().getHours();
        let greeting = "Buenos días";
        if (hour >= 12 && hour < 19) greeting = "Buenas tardes";
        if (hour >= 19 || hour < 5) greeting = "Buenas noches";
        welcomeEl.textContent = `${greeting}, ${state.user.name || state.user.full_name || state.user.username || 'Usuario'}`;
    }
    initGlobalSearch();

    const setStat = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setStat('stat-devices', inventory.length);
    setStat('stat-printers', stats.printers_count || 0);
    const licensesCount = (state.data.licenses || []).filter(l => String(l.type).toLowerCase() === 'licencia').length;
    setStat('stat-licenses', licensesCount);
    setStat('stat-tutorials', (state.data.tutorials || []).length);

    // Populate Dynamic Alerts
    const alertCenter = document.getElementById('dashboard-alerts');
    if (alertCenter) {
        let alertHtml = '';

        // 1. Calendar Reminders for Today
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const todayReminders = state.calendar.reminders.filter(r => r.event_date === dateStr);

        todayReminders.forEach(rem => {
            alertHtml += `
                <div class="alert-item d-flex align-items-start p-3 rounded-3 bg-primary bg-opacity-10 mb-3" onclick="window.expandCalendar()">
                    <div class="alert-icon text-primary me-3 fs-4 mt-1"><i class="bi bi-calendar-event"></i></div>
                    <div>
                        <h6 class="fw-bold mb-1 text-primary small">Recordatorio Hoy</h6>
                        <p class="x-small text-muted mb-0">${rem.title}</p>
                    </div>
                </div>`;
        });

        // 2. Expiring Licenses (Next 15 days)
        const expiringLic = (state.data.licenses || []).filter(l => {
            if (!l.expiration_date) return false;
            const diff = (new Date(l.expiration_date) - new Date()) / (1000 * 60 * 60 * 24);
            return diff > 0 && diff < 15; // User requirement: 15 days
        });

        expiringLic.slice(0, 3).forEach(lic => {
            alertHtml += `
                <div class="alert-item d-flex align-items-start p-3 rounded-3 bg-warning bg-opacity-10 mb-3" onclick="window.switchView('licenses')">
                    <div class="alert-icon text-warning me-3 fs-4 mt-1"><i class="bi bi-shield-exclamation"></i></div>
                    <div>
                        <h6 class="fw-bold mb-1 text-warning small">Licencia por Vencer</h6>
                        <p class="x-small text-muted mb-0">${lic.name} expira en ${Math.ceil((new Date(lic.expiration_date) - new Date()) / (1000 * 60 * 60 * 24))} días.</p>
                    </div>
                </div>`;
        });

        // 3. Damaged Equipment (Dañados)
        const damagedItems = inventory.filter(i => i.status === 'Dañado' || i.status === 'Fuera de Servicio');

        damagedItems.slice(0, 3).forEach(item => {
            alertHtml += `
                <div class="alert-item d-flex align-items-start p-3 rounded-3 bg-danger bg-opacity-20 mb-3" onclick="window.viewItem('inventory', ${item.id})">
                    <div class="alert-icon text-danger me-3 fs-4 mt-1"><i class="bi bi-exclamation-octagon-fill"></i></div>
                    <div>
                        <h6 class="fw-bold mb-1 text-danger small">Equipo Dañado</h6>
                        <p class="x-small text-muted mb-0">${item.name} (${item.brand}) está marcado como Dañado.</p>
                    </div>
                </div>`;
        });

        // 4. Low Toner/Ink (Less than 2 units)
        const lowInk = (state.data.inks || []).filter(ink => parseInt(ink.quantity) < 2);
        const lowToner = (state.data.toner || []).filter(t => parseInt(t.quantity) < 2);

        lowToner.slice(0, 2).forEach(t => {
            alertHtml += `
                <div class="alert-item d-flex align-items-start p-3 rounded-3 border border-danger border-opacity-25 bg-danger bg-opacity-10 mb-3" onclick="window.switchView('printers'); window.switchSubView('printers', 'toner');">
                    <div class="alert-icon text-danger me-3 fs-4 mt-1"><i class="bi bi-moisture"></i></div>
                    <div>
                        <h6 class="fw-bold mb-1 text-danger small">Tóner Agotándose</h6>
                        <p class="x-small text-muted mb-0">${t.brand} ${t.model} - Stock Crítico: ${t.quantity} un.</p>
                    </div>
                </div>`;
        });

        lowInk.slice(0, 2).forEach(ink => {
            alertHtml += `
                <div class="alert-item d-flex align-items-start p-3 rounded-3 border border-danger border-opacity-25 bg-danger bg-opacity-10 mb-3" onclick="window.switchView('printers'); window.switchSubView('printers', 'inks');">
                    <div class="alert-icon text-danger me-3 fs-4 mt-1"><i class="bi bi-droplet-half"></i></div>
                    <div>
                        <h6 class="fw-bold mb-1 text-danger small">Tinta Baja</h6>
                        <p class="x-small text-muted mb-0">${ink.brand} ${ink.model} (${ink.color}) - Quedan: ${ink.quantity}</p>
                    </div>
                </div>`;
        });

        // 5. Email Backups Expiration (Today)
        const emailBackups = state.data.emails || [];
        const expiringBackups = emailBackups.filter(b => {
            if (!b.end_date || b.is_archived == 1) return false;
            return b.end_date === dateStr;
        });

        expiringBackups.forEach(backup => {
            alertHtml += `
                <div class="alert-item d-flex align-items-start p-3 rounded-3 bg-danger bg-opacity-10 mb-3" onclick="window.switchView('emails')">
                    <div class="alert-icon text-danger me-3 fs-4 mt-1"><i class="bi bi-envelope-exclamation-fill"></i></div>
                    <div>
                        <h6 class="fw-bold mb-1 text-danger small">Vencimiento de Respaldo</h6>
                        <p class="x-small text-muted mb-0">Respaldo de ${backup.original_name} vence hoy.</p>
                    </div>
                </div>`;
        });

        // 6. Microsoft 365 / Office Renewal Alerts (Next 30 days)
        const msAccounts = state.data.microsoft_emails || [];
        const ofAccounts = state.data.office_emails || [];
        const allCloudAccounts = [...msAccounts, ...ofAccounts];

        const expiringCloud = allCloudAccounts.filter(acc => {
            if (!acc || !acc.renewal_date) return false;
            const diff = (new Date(acc.renewal_date) - new Date()) / (1000 * 60 * 60 * 24);
            return diff > 0 && diff < 30;
        });

        expiringCloud.slice(0, 3).forEach(acc => {
            alertHtml += `
                <div class="alert-item d-flex align-items-start p-3 rounded-3 bg-info bg-opacity-10 mb-3" onclick="window.switchView('emails')">
                    <div class="alert-icon text-info me-3 fs-4 mt-1"><i class="bi bi-cloud-arrow-up-fill"></i></div>
                    <div>
                        <h6 class="fw-bold mb-1 text-info small">Renovación Cloud Próxima</h6>
                        <p class="x-small text-muted mb-0">${acc.email || acc.original_email} vence el ${new Date(acc.renewal_date).toLocaleDateString()}.</p>
                    </div>
                </div>`;
        });

        if (alertHtml === '') {
            alertHtml = `
                <div id="no-alerts" class="text-center py-5">
                    <div class="mb-4 text-success opacity-25">
                        <i class="bi bi-shield-check display-1"></i>
                    </div>
                    <h6 class="fw-bold text-success mb-1">Todo bajo control</h6>
                    <p class="text-muted small mb-0 px-4">No se detectaron problemas críticos en el inventario.</p>
                </div>`;
        }
        alertCenter.innerHTML = alertHtml;
    }

    // Initialize Charts with Real Data
    initEnterpriseCharts({
        categories: [laptops, desktops, printersCount, cellphones, peripherals],
        health: [statusCounts.excelente, statusCounts.bueno, statusCounts.atencion, statusCounts.baja]
    });

    // Initialize Calendar Widget
    if (typeof initMiniCalendar === 'function') initMiniCalendar();

    // Render Notes Dashboard
    renderNotesDashboard();
}

window.renderNotesDashboard = function () {
    const list = document.getElementById('notes-dashboard-list');
    if (!list) return;

    const notes = state.data.notes || [];
    if (notes.length === 0) {
        list.innerHTML = '<div class="p-5 text-center text-muted x-small">No hay notas registradas.</div>';
        return;
    }

    list.innerHTML = notes.slice(0, 5).map(note => `
        <div class="list-group-item list-group-item-action border-0 px-4 py-3 border-bottom d-flex justify-content-between align-items-center" 
             onclick="event.stopPropagation(); window.viewItem('notes', ${note.id})">
            <div>
                <div class="fw-bold text-dark small mb-1">${note.title}</div>
                <div class="text-muted x-small opacity-75">${new Date(note.created_at).toLocaleDateString('es-MX')}</div>
            </div>
            <i class="bi bi-chevron-right text-muted x-small"></i>
        </div>
    `).join('');
};

window.expandNotes = function () {
    window.switchView('notes');
};

// Global Refresh for Dashboard Button
window.refreshDashboard = async function () {
    const btn = event.currentTarget;
    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-arrow-clockwise spin me-1"></i> Actualizando...';
    btn.disabled = true;

    await fetchData('dashboard');

    btn.innerHTML = originalHtml;
    btn.disabled = false;
};

function initEnterpriseCharts(data) {
    if (typeof Chart === 'undefined') return;

    // 1. Horizontal Bar Chart: Asset Categories
    const barCtx = document.getElementById('inventoryBarChart');
    if (barCtx) {
        // Destroy existing chart if it exists to avoid overlaps on refresh
        const existingChart = Chart.getChart(barCtx);
        if (existingChart) existingChart.destroy();

        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Laptops', 'Desktops', 'Impresoras', 'Celulares', 'Periféricos'],
                datasets: [{
                    label: 'Cantidad',
                    data: data.categories,
                    backgroundColor: ['#CC0000', '#6c757d', '#0d6efd', '#28a745', '#ffcc00'],
                    borderRadius: 6,
                    barThickness: 20
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#888', beginAtZero: true, stepSize: 1 } },
                    y: { grid: { display: false }, ticks: { color: '#888' } }
                }
            }
        });
    }

    // 2. Donut Chart: Inventory Health
    const healthCtx = document.getElementById('healthDonutChart');
    if (healthCtx) {
        const existingChart = Chart.getChart(healthCtx);
        if (existingChart) existingChart.destroy();

        new Chart(healthCtx, {
            type: 'doughnut',
            data: {
                labels: ['Excelente', 'Bueno', 'Atención', 'Fuera de Servicio'],
                datasets: [{
                    data: data.health,
                    backgroundColor: ['#28a745', '#6c757d', '#ffcc00', '#CC0000'],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                cutout: '72%',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }
}

function renderTable(view, filteredData = null, targetBodyId = 'table-body', targetHeadId = 'table-head-row') {
    let tbody = document.getElementById(targetBodyId);
    let thead = document.getElementById(targetHeadId);

    // Make table responsive to cards on mobile
    const tableEl = tbody?.closest('table');
    if (tableEl) {
        tableEl.classList.add('responsive-table-cards');
    }

    // Debug: ver todos los tbody y thead en el DOM
    // const allTbody = Array.from(document.querySelectorAll('tbody')).map(el => el.id);

    // Robustez: Si tenemos tbody pero no thead, intentar buscarlo en la misma tabla
    if (tbody && !thead) {
        const table = tbody.closest('table');
        if (table) {
            thead = table.querySelector('thead tr') || table.querySelector('thead');
        }
    }

    if (!tbody || !thead) {
        console.warn(`renderTable: Missing elements. Tbody: ${!!tbody} (${targetBodyId}), Thead: ${!!thead} (${targetHeadId})`);
        return;
    }

    let data = filteredData || state.allData || [];

    if (state.sort.column) {
        data.sort((a, b) => {
            let valA = a[state.sort.column] ?? '';
            let valB = b[state.sort.column] ?? '';

            if (state.sort.column === 'ip_address') {
                const comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
                return state.sort.direction === 'asc' ? comparison : -comparison;
            }

            if (!isNaN(valA) && !isNaN(valB) && valA !== '' && valB !== '') {
                valA = Number(valA);
                valB = Number(valB);
            } else {
                valA = String(valA).toLowerCase();
                valB = String(valB).toLowerCase();
            }

            if (valA < valB) return state.sort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return state.sort.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center p-5 text-muted small">No hay datos disponibles</td></tr>';
        return;
    }

    // Ensure generic containers are hidden if not in generic view to avoid overlap/odd transitions
    const gc = document.getElementById('generic-cards-container');
    const gtc = document.querySelector('.card-table-premium');
    if (gc && gtc) {
        const isGeneric = (view === 'assignments' || view === 'users' || state.currentView === 'users' || state.currentView === 'assignments' || !['inventory', 'emails', 'network', 'licenses', 'printers', 'peripherals', 'notes', 'tutorials', 'ftp', 'dashboard'].includes(state.currentView));
        if (isGeneric) {
            gc.classList.remove('d-none');
            gtc.classList.remove('d-none');
        } else {
            // If we are in a sub-table-container, we don't want the generic cards visible
            gc.classList.add('d-none');
            gtc.classList.add('d-none');
        }
    }


    if (view === 'notes') {
        const thID = document.createElement('th');
        thID.style.width = '60px';
        thID.textContent = '# ID';
        thead.appendChild(thID);
    }

    const columns = getTableColumns(view);
    columns.forEach(col => {
        // Idea 12: Column Visibility
        const isVisible = (state.columnVisibility[view]?.[col.key] !== false);
        const th = document.createElement('th');
        th.className = `cursor-pointer user-select-none hover-bg-light align-middle ${isVisible ? '' : 'd-none'}`;
        th.dataset.col = col.key;

        const labelDiv = document.createElement('div');
        let icon = (state.sort.column === col.key) ?
            (state.sort.direction === 'asc' ? ' <i class="bi bi-arrow-up-short text-primary"></i>' : ' <i class="bi bi-arrow-down-short text-primary"></i>')
            : ' <i class="bi bi-arrow-down-up text-muted opacity-25"></i>';
        labelDiv.innerHTML = `${col.label}${icon}`;
        labelDiv.onclick = () => {
            state.sort.direction = (state.sort.column === col.key && state.sort.direction === 'asc') ? 'desc' : 'asc';
            state.sort.column = col.key;
            renderTable(view, data, targetBodyId, targetHeadId);
        };
        th.appendChild(labelDiv);
        thead.appendChild(th);
    });

    const thActions = document.createElement('th');
    thActions.textContent = state.user.role === 'admin' ? 'Acciones' : 'Ver';
    thActions.className = 'text-end';
    thead.appendChild(thActions);

    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = 'cursor-pointer hover-bg-light';
        tr.onclick = () => window.viewItem(view, item.id);

        // Idea 14: Context Menu
        tr.oncontextmenu = (e) => {
            e.preventDefault();
            window.showContextMenu(e, view, item);
        };

        if (view === 'notes') {
            const tdID = document.createElement('td');
            tdID.className = 'py-2 px-3';
            tdID.setAttribute('data-label', 'ID');
            tdID.innerHTML = `<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2">#${item.id}</span>`;
            tr.appendChild(tdID);
        }

        columns.forEach(col => {
            const isVisible = (state.columnVisibility[view]?.[col.key] !== false);
            const td = document.createElement('td');
            td.className = `py-2 px-3 ${isVisible ? '' : 'd-none'}`;
            td.dataset.col = col.key;
            td.setAttribute('data-label', col.label);
            let val = item[col.key] ?? '-';

            const fieldMeta = getFieldsForView(view).find(f => f.name === col.key);

            if (fieldMeta && (fieldMeta.type === 'switch' || fieldMeta.type === 'checkbox')) {
                const isChecked = (val == 1 || val === true || val === '1' || val === 'true');
                td.innerHTML = isChecked
                    ? '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 fw-bold">Sí</span>'
                    : '<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 fw-bold">No</span>';
            } else if (col.key === 'status' || col.key === 'estatus') {
                if (view === 'inks') {
                    const qty = parseInt(item.quantity) || 0;
                    if (qty <= 0) val = 'Agotado';
                    else if (qty === 1) val = 'Stock bajo';
                    else val = 'Disponible';
                }

                const statusMap = {
                    'ENTREGADO': 'status-done', 'ACTIVA': 'status-done', 'NUEVO': 'status-done', 'OK': 'status-done', 'ACTIVO': 'status-done', 'ASIGNADO': 'status-done',
                    'DISPONIBLE': 'status-done',
                    'PENDIENTE': 'status-working', 'USADO': 'status-working', 'REVISIÓN': 'status-working', 'REPARACIÓN': 'status-default', 'REPARACION': 'status-default',
                    'STOCK BAJO': 'status-working',
                    'BAJA': 'status-stuck', 'DAÑADO': 'status-stuck', 'VENCIDA': 'status-stuck', 'AGOTADO': 'status-stuck',
                    'HEREDABLE': 'status-info',
                    'COMPLETO': 'status-done', '3/4': 'status-info', '1/2': 'status-working', '1/4': 'status-working', 'NO HAY': 'status-stuck'
                };
                let statusClass = 'status-default';
                const s = String(val).toUpperCase();
                for (let k in statusMap) if (s.includes(k)) { statusClass = statusMap[k]; break; }

                // Actionable Status Badge if Admin
                if (state.user.role === 'admin' && (col.key === 'status' || col.key === 'estatus')) {
                    const fields = getFieldsForView(view);
                    const fieldMeta = fields.find(f => f.name === col.key);
                    if (fieldMeta && fieldMeta.options) {
                        const menuId = `status-menu-${view}-${item.id}`;
                        let optionsHtml = fieldMeta.options.map(opt => `
                            <li><a class="dropdown-item dropdown-item-status" href="#" onclick="event.stopPropagation(); window.quickUpdateStatus('${view}', ${item.id}, '${col.key}', '${opt}')">${opt}</a></li>
                        `).join('');

                        td.innerHTML = `
                            <div class="dropdown">
                                <span class="monday-status-cell ${statusClass} status-dropdown-trigger" data-bs-toggle="dropdown" aria-expanded="false">
                                    ${val}
                                </span>
                                <ul class="dropdown-menu shadow-lg border-0 rounded-3" id="${menuId}">
                                    <li class="dropdown-header small text-uppercase fw-bold opacity-50">Cambiar estado</li>
                                    ${optionsHtml}
                                </ul>
                            </div>
                        `;
                    } else {
                        td.innerHTML = `<span class="monday-status-cell ${statusClass}">${val}</span>`;
                    }
                } else {
                    td.innerHTML = `<span class="monday-status-cell ${statusClass}">${val}</span>`;
                }

            } else if (col.key === 'tintas' && view === 'printers') {
                if (item.supply_type === 'Tinta') {
                    let ids = [];
                    try { ids = JSON.parse(item.linked_inks || '[]'); } catch (e) { }
                    if (ids.length > 0) {
                        td.innerHTML = `<button class="btn btn-premium-info py-1 px-3 fw-bold rounded-pill shadow-sm" style="font-size: 0.85rem;" onclick="event.stopPropagation(); window.showPrinterInks(${item.id})"><i class="bi bi-droplet-half me-1"></i>Tintas (${ids.length})</button>`;
                    } else {
                        td.innerHTML = `<span class="text-muted small">No vinculadas</span>`;
                    }
                } else if (item.supply_type === 'Tóner') {
                    let ids = [];
                    try { ids = JSON.parse(item.linked_toner || '[]'); } catch (e) { }
                    if (ids.length > 0) {
                        td.innerHTML = `<button class="btn btn-premium-warning py-1 px-3 fw-bold rounded-pill text-dark shadow-sm" style="font-size: 0.85rem;" onclick="event.stopPropagation(); window.showPrinterToner(${item.id})"><i class="bi bi-box-seam me-1"></i>Tóner (${ids.length})</button>`;
                    } else {
                        td.innerHTML = `<span class="badge bg-secondary bg-opacity-10 text-dark border fw-bold">${item.ink_type || 'Tóner'}</span>`;
                    }
                } else {
                    td.textContent = '-';
                }
            } else if (col.key === 'is_archived') {
                const checked = (val == 1 || val === true);
                td.innerHTML = `<span class="monday-status-cell ${checked ? 'status-stuck' : 'status-default'}">${checked ? 'DESHECHO' : 'PENDIENTE'}</span>`;

            } else if (col.key === 'is_done') {
                const checked = (val == 1 || val === true);
                td.innerHTML = `<span class="monday-status-cell ${checked ? 'status-done' : 'status-working'}">${checked ? 'HECHO' : 'PENDIENTE'}</span>`;

            } else {
                const str = String(val);
                // No truncar si es un correo o vista microsoft_emails para ver "registro completo"
                if (col.key === 'email' || col.key === 'correo' || view === 'microsoft_emails' || str.length <= 40) {
                    td.textContent = str;
                } else {
                    td.textContent = str.substring(0, 40) + '...';
                }
            }
            tr.appendChild(td);
        });

        const tdActions = document.createElement('td');
        tdActions.className = 'text-end py-2 px-3';

        let actionButtons = '';
        if ((view === 'toner' || view === 'inks') && state.user.role === 'admin') {
            const updateFn = view === 'toner' ? 'updateTonerQuantity' : 'updateInkQuantity';
            actionButtons += `<button class="btn-icon-sm text-success" onclick="event.stopPropagation(); window.${updateFn}(${item.id}, 1)" title="Aumentar"><i class="bi bi-plus-circle"></i></button>`;
            actionButtons += `<button class="btn-icon-sm text-warning" onclick="event.stopPropagation(); window.${updateFn}(${item.id}, -1)" title="Disminuir"><i class="bi bi-dash-circle"></i></button>`;
        }

        if (item.link || item.admin_url) {
            const externalLink = item.link || item.admin_url;
            actionButtons += `<button class="btn-icon-sm text-primary" onclick="event.stopPropagation(); window.open('${externalLink}', '_blank')" title="Abrir Link"><i class="bi bi-box-arrow-up-right"></i></button>`;
        }

        if (state.user.role === 'admin') {
            actionButtons += `<button class="btn-icon-sm text-info" onclick="event.stopPropagation(); window.editItem('${view}', ${item.id})" title="Editar"><i class="bi bi-pencil"></i></button>`;
            actionButtons += `<button class="btn-icon-sm text-danger" onclick="event.stopPropagation(); window.deleteItem('${view}', ${item.id})" title="Eliminar"><i class="bi bi-trash"></i></button>`;
        } else {
            actionButtons += `<button class="btn-icon-sm text-primary" onclick="event.stopPropagation(); window.viewItem('${view}', ${item.id})" title="Ver Detalles"><i class="bi bi-eye"></i></button>`;
        }

        tdActions.innerHTML = `<div class="d-flex gap-2 justify-content-end">${actionButtons}</div>`;
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
    });
}

// --- Search Functionality ---
// Consolidated handleSearch at the end of the file.


function getTableColumns(view) {
    const cols = {
        'inventory': [{ key: 'name', label: 'Producto' }, { key: 'assigned_user', label: 'Usuario' }, { key: 'processor', label: 'Procesador' }, { key: 'status', label: 'Estado' }, { key: 'zone', label: 'Zona' }],
        'peripherals': [{ key: 'name', label: 'Artículo' }, { key: 'brand', label: 'Marca' }, { key: 'quantity', label: 'Cant' }, { key: 'assigned_to', label: 'Asignado' }, { key: 'status', label: 'Estado' }],
        'printers': [{ key: 'name', label: 'Impresora' }, { key: 'brand', label: 'Marca' }, { key: 'model', label: 'Modelo' }, { key: 'tintas', label: 'Carga' }, { key: 'ip_address', label: 'Cod/IP' }, { key: 'status', label: 'Estado' }],
        'inks': [{ key: 'brand', label: 'Marca' }, { key: 'type', label: 'Tipo' }, { key: 'color', label: 'Color' }, { key: 'quantity', label: 'Cant' }, { key: 'status', label: 'Estado' }],
        'toner': [{ key: 'brand', label: 'Marca' }, { key: 'model', label: 'Modelo' }, { key: 'quantity', label: 'Cant' }, { key: 'status', label: 'Estado' }],
        'licenses': [{ key: 'type', label: 'Tipo' }, { key: 'name', label: 'Servicio' }, { key: 'key_value', label: 'Usuario' }, { key: 'expiration_date', label: 'Vencim.' }, { key: 'status', label: 'Estado' }],
        'licenses_cred': [{ key: 'type', label: 'Tipo' }, { key: 'name', label: 'Servicio' }, { key: 'key_value', label: 'Usuario' }, { key: 'link', label: 'Link' }, { key: 'status', label: 'Estado' }],
        'network': [{ key: 'device_name', label: 'Nombre' }, { key: 'device_type', label: 'Tipo' }, { key: 'ip_address', label: 'IP' }, { key: 'location', label: 'Área' }],
        'enterprise_networks': [{ key: 'ssid', label: 'Red (SSID)' }, { key: 'details', label: 'Detalles/Tel' }, { key: 'location', label: 'Ubicación' }],
        'users': [{ key: 'full_name', label: 'Nombre' }, { key: 'username', label: 'Usuario' }, { key: 'role', label: 'Rol' }],
        'emails': [
            { key: 'is_done', label: 'Hecho' },
            { key: 'is_archived', label: 'Deshecho' },
            { key: 'original_name', label: 'Origen' },
            { key: 'original_email', label: 'Correo Origen' },
            { key: 'backup_name', label: 'Respaldo' },
            { key: 'backup_email', label: 'Correo Respaldo' },
            { key: 'start_date', label: 'Fecha Inicio' },
            { key: 'end_date', label: 'Fecha de Finalización' }
        ],
        'cellphones': [
            { key: 'employee', label: 'Empleado' },
            { key: 'model', label: 'Modelo' },
            { key: 'area', label: 'Área' },
            { key: 'phone_number', label: 'Teléfono' },
            { key: 'email', label: 'Correo' }
        ],
        'office_emails': [{ key: 'email', label: 'Correo' }, { key: 'status', label: 'Estatus' }, { key: 'renewal_date', label: 'Renovación' }],
        'microsoft_emails': [{ key: 'email', label: 'Correo' }, { key: 'status', label: 'Estatus' }, { key: 'activation_date', label: 'Activación' }, { key: 'renewal_date', label: 'Renovación' }],
        'tutorials': [{ key: 'title', label: 'Título' }, { key: 'description', label: 'Descripción' }],
        'account_management': [{ key: 'email', label: 'Cuenta' }, { key: 'account_type', label: 'Tipo' }, { key: 'status', label: 'Estatus' }, { key: 'assigned_to', label: 'Asignado' }],
        'correos_outlook': [
            { key: 'correo', label: 'Correo' },
            { key: 'comentarios', label: 'Comentarios' }
        ],
        'notes': [{ key: 'title', label: 'Título' }, { key: 'created_at', label: 'Fecha' }]
    };
    let c = cols[view] ? [...cols[view]] : [];

    // Inject any extra fields the user has explicitly enabled from the column visibility menu
    const fields = getFieldsForView(view);
    if (fields && fields.length > 0) {
        fields.forEach(f => {
            if (f.showInTable !== false) {
                const existing = c.find(col => col.key === f.name);
                if (!existing && state.columnVisibility && state.columnVisibility[view] && state.columnVisibility[view][f.name] === true) {
                    c.push({ key: f.name, label: f.label });
                }
            }
        });
    }

    if (state.user?.role !== 'admin') return c.filter(x => x.key !== 'id');
    return c;
}

function openModal(view, item = null) {
    state.editingId = item ? item.id : null;
    if (elements['modal-form']) elements['modal-form'].dataset.view = view;

    const title = item ? 'Editar ' : 'Nuevo ';
    const viewLabels = {
        'inventory': 'Equipo', 'peripherals': 'Accesorio', 'assignments': 'Asignación',
        'licenses': 'Credencial/Licencia', 'network': 'Dispositivo Red', 'tutorials': 'Tutorial',
        'users': 'Usuario', 'emails': 'Respaldo Correo', 'office_emails': 'Correo Office',
        'enterprise_networks': 'Red Empresarial',
        'account_management': 'Cuenta de Acceso',
        'correos_outlook': 'Correo de Outlook',
        'notes': 'Nota'
    };

    if (elements['mainModalLabel']) elements['mainModalLabel'].textContent = title + (viewLabels[view] || 'Registro');
    if (elements['form-fields']) {
        elements['form-fields'].innerHTML = '';
        const fields = getFieldsForView(view);
        fields.forEach(f => {
            const wrap = document.createElement('div');
            // Use 3 columns for desktop, 2 for tablet, 1 for mobile to match details view
            wrap.className = f.type === 'textarea' ? 'col-12' : 'col-12 col-md-6 col-lg-4';

            if (f.type === 'hr') {
                wrap.className = 'col-12 mt-4 mb-2';
                wrap.innerHTML = `
                    <div class="d-flex align-items-center gap-2 border-bottom border-danger border-opacity-25 pb-1">
                        <i class="bi ${f.icon || 'bi-circle-fill'} text-danger" style="font-size: 0.9rem;"></i>
                        <span class="text-uppercase fw-bold small text-muted ls-1">${f.label}</span>
                    </div>`;
                elements['form-fields'].appendChild(wrap);
                return;
            }

            const val = item ? (item[f.name] ?? '') : '';
            let ctrl = '';
            const id = `f-${f.name}`;

            // Idea 13: Auto-Suggest logic...
            let listAttr = "";
            let datalistHTML = "";
            const suggestFields = ['brand', 'model', 'area', 'location', 'assigned_to', 'status'];
            if (suggestFields.includes(f.name)) {
                const allItems = state.data[view] || [];
                const uniqueValues = [...new Set(allItems.map(x => x[f.name]).filter(v => v && v !== '-'))];
                if (uniqueValues.length > 0) {
                    const listId = `dl-${view}-${f.name}`;
                    datalistHTML = `<datalist id="${listId}">${uniqueValues.map(v => `<option value="${v}">`).join('')}</datalist>`;
                    listAttr = `list="${listId}"`;
                }
            }

            if (f.type === 'select') {
                const selectIcon = '<i class="bi bi-list-columns-reverse ms-2 text-danger small"></i>';
                ctrl = `<div class="d-flex align-items-center">${selectIcon}<select class="form-select flex-grow-1" name="${f.name}" id="${id}">${(f.options || []).map(o => `<option value="${o}" ${o == val ? 'selected' : ''}>${o}</option>`).join('')}</select></div>`;
            } else if (f.type === 'textarea') {
                ctrl = `<textarea class="form-control" name="${f.name}" id="${id}" rows="3" placeholder="${f.placeholder || 'Escribe aquí'}">${val}</textarea>`;
            } else if (f.type === 'checkbox' || f.type === 'switch') {
                const isSwitch = f.type === 'switch';
                ctrl = `
                    <div class="edit-card-v2 h-100 p-3">
                        <div class="edit-card-icon"><i class="bi ${f.icon || 'bi-app-indicator'}"></i></div>
                        <div class="edit-card-content flex-row align-items-center justify-content-between">
                            <label class="form-label fw-bold text-muted mb-0 me-2" for="${id}">${f.label}</label>
                            <div class="form-check ${isSwitch ? 'form-switch' : ''} mb-0">
                                <input class="form-check-input" type="checkbox" name="${f.name}" id="${id}" ${val == 1 ? 'checked' : ''}>
                            </div>
                        </div>
                    </div>`;
                wrap.id = `wrap-${f.name}`;
                wrap.innerHTML = ctrl;
                elements['form-fields'].appendChild(wrap);
                return;
            } else if (f.type === 'file') {
                const fileName = val ? (val.split('/').pop() || val) : 'Ningún archivo seleccionado';
                ctrl = `
                    <div class="d-flex align-items-center gap-3 p-1 rounded">
                        <label for="${id}" class="btn btn-light border btn-sm fw-bold text-dark mb-0 py-0 px-2" style="font-size:0.75rem;">
                            <i class="bi bi-folder2-open me-1"></i>Elegir
                        </label>
                        <input type="file" class="d-none" name="${f.name}" id="${id}" onchange="document.getElementById('${id}-namdisplay').textContent = this.files[0]?.name || 'Ningún archivo seleccionado'">
                        <span id="${id}-namdisplay" class="text-muted small text-truncate fw-bold" style="max-width: 150px;">${fileName}</span>
                    </div>`;
            } else if (f.type === 'pattern') {
                ctrl = `
                    <div class="d-flex align-items-center gap-2">
                        <input type="hidden" name="${f.name}" id="${id}" value="${val}">
                        <button type="button" class="btn btn-outline-primary btn-sm fw-bold w-100 py-0 px-2" style="font-size:0.75rem;" id="btn-pattern-${f.name}" onclick="window.launchPatternSelector('${id}')">
                            <i class="bi bi-grid-3x3-gap me-1"></i> ${val ? 'Cambiar' : 'Configurar'}
                        </button>
                        <div id="${id}-preview" class="small text-primary fw-bold">${val ? '✓' : ''}</div>
                    </div>`;
            } else if (f.type === 'hidden') {
                ctrl = `<input type="hidden" name="${f.name}" id="${id}" value="${val}">`;
                wrap.classList.add('d-none');
            } else {
                ctrl = `<input type="${f.type || 'text'}" class="form-control" name="${f.name}" id="${id}" value="${val}" ${listAttr} placeholder="${f.placeholder || 'Escribe aquí'}" autocomplete="off">${datalistHTML}`;
            }

            wrap.id = `wrap-${f.name}`;

            // Function to update card appearance based on content
            const checkCardStatus = (input, card) => {
                const hasVal = input.value && input.value.trim() !== '' && input.value !== '-';
                if (hasVal) {
                    card.classList.add('has-content');
                    card.classList.remove('is-empty');
                } else {
                    card.classList.add('is-empty');
                    card.classList.remove('has-content');
                }
            };

            if (f.type === 'hidden') {
                wrap.innerHTML = ctrl;
            } else {
                wrap.innerHTML = `
                    <div class="edit-card-v2">
                        <div class="edit-card-icon"><i class="bi ${f.icon || 'bi-circle-fill'}"></i></div>
                        <div class="edit-card-content">
                            <label class="form-label" for="${id}">${f.label}</label>
                            ${ctrl}
                        </div>
                    </div>`;

                // Logic to update status on the fly
                const input = wrap.querySelector('input, select, textarea');
                const card = wrap.querySelector('.edit-card-v2');
                if (input && card) {
                    checkCardStatus(input, card);
                    input.addEventListener('input', () => checkCardStatus(input, card));
                    input.addEventListener('change', () => checkCardStatus(input, card));
                }
            }

            elements['form-fields'].appendChild(wrap);
        });

        const btnBack = document.getElementById('btn-back-to-details');
        if (btnBack) {
            if (item) {
                btnBack.classList.remove('d-none');
                btnBack.innerHTML = '<i class="bi bi-arrow-left-circle me-2"></i>Regresar a Detalles';
                btnBack.onclick = () => {
                    ModalManager.hide('mainModal');
                    setTimeout(() => window.viewItem(view, item.id), 350);
                };
            } else {
                btnBack.classList.add('d-none');
            }
        }
        // Dynamic logic for Licenses/Credentials
        if (view === 'licenses' || view === 'licenses_cred') {
            const typeSelect = document.getElementById('f-type');
            const expWrap = document.getElementById('wrap-expiration_date');
            if (typeSelect && expWrap) {
                const updateExp = () => {
                    expWrap.style.display = typeSelect.value === 'Credencial' ? 'none' : 'block';
                };
                typeSelect.onchange = updateExp;
                updateExp();
            }
            if (view === 'licenses_cred' && typeSelect) {
                typeSelect.value = 'Credencial';
            }
        }

        // Dynamic logic for Printers (Ink/Toner & IP Switch)
        if (view === 'printers') {
            const supplySelect = document.getElementById('f-supply_type');
            const inkWrap = document.getElementById('wrap-ink_type');
            const isNetworkSwitch = document.getElementById('f-is_network');
            const ipWrap = document.getElementById('wrap-ip_address');

            if (supplySelect && inkWrap) {
                const updateInk = () => {
                    const val = supplySelect.value;
                    const linkedInksWrap = document.getElementById('wrap-linked_inks_dynamic');
                    const linkedTonerWrap = document.getElementById('wrap-linked_toner_dynamic');

                    if (val === 'Tinta') {
                        inkWrap.style.display = 'none';
                        if (linkedTonerWrap) linkedTonerWrap.style.display = 'none';
                        if (!linkedInksWrap) {
                            const dynWrap = document.createElement('div');
                            dynWrap.className = 'col-12 mt-2 p-3 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-25';
                            dynWrap.id = 'wrap-linked_inks_dynamic';
                            dynWrap.innerHTML = `
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h6 class="fw-bold m-0 text-primary"><i class="bi bi-link-45deg me-2"></i>Vincular Tintas</h6>
                                    <div class="d-flex align-items-center gap-2">
                                        <span class="small fw-bold text-muted">¿Cuántas?</span>
                                        <input type="number" id="f-ink_count" class="form-control form-control-sm" style="width: 60px;" min="0" max="6">
                                    </div>
                                </div>
                                <div id="ink-selection-container" class="row g-2"></div>
                            `;
                            inkWrap.parentNode.insertBefore(dynWrap, inkWrap.nextSibling);

                            const countInput = document.getElementById('f-ink_count');
                            countInput.onchange = () => updatePrinterSupplyInputs('ink', countInput.value, []);

                            if (item && item.linked_inks) {
                                try {
                                    const ids = JSON.parse(item.linked_inks);
                                    countInput.value = ids.length;
                                    updatePrinterSupplyInputs('ink', ids.length, ids);
                                } catch (e) { console.error("Error parsing linked_inks", e); }
                            }
                        } else {
                            linkedInksWrap.style.display = 'block';
                        }
                    } else if (val === 'Tóner') {
                        inkWrap.style.display = 'none';
                        if (linkedInksWrap) linkedInksWrap.style.display = 'none';
                        if (!linkedTonerWrap) {
                            const dynWrap = document.createElement('div');
                            dynWrap.className = 'col-12 mt-2 p-3 rounded-4 bg-warning bg-opacity-10 border border-warning border-opacity-25';
                            dynWrap.id = 'wrap-linked_toner_dynamic';
                            dynWrap.innerHTML = `
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h6 class="fw-bold m-0 text-warning"><i class="bi bi-link-45deg me-2"></i>Vincular Tóner</h6>
                                    <div class="d-flex align-items-center gap-2">
                                        <span class="small fw-bold text-muted">¿Cuántos?</span>
                                        <input type="number" id="f-toner_count" class="form-control form-control-sm" style="width: 60px;" min="0" max="6">
                                    </div>
                                </div>
                                <div id="toner-selection-container" class="row g-2"></div>
                            `;
                            inkWrap.parentNode.insertBefore(dynWrap, inkWrap.nextSibling);

                            const countInput = document.getElementById('f-toner_count');
                            countInput.onchange = () => updatePrinterSupplyInputs('toner', countInput.value, []);

                            if (item && item.linked_toner) {
                                try {
                                    const ids = JSON.parse(item.linked_toner);
                                    countInput.value = ids.length;
                                    updatePrinterSupplyInputs('toner', ids.length, ids);
                                } catch (e) { console.error("Error parsing linked_toner", e); }
                            }
                        } else {
                            linkedTonerWrap.style.display = 'block';
                        }
                    } else {
                        inkWrap.style.display = 'none';
                        if (linkedInksWrap) linkedInksWrap.style.display = 'none';
                        if (linkedTonerWrap) linkedTonerWrap.style.display = 'none';
                    }
                };
                supplySelect.onchange = updateInk;
                updateInk();
            }

            if (isNetworkSwitch && ipWrap) {
                const updateIP = () => {
                    ipWrap.style.display = isNetworkSwitch.checked ? 'block' : 'none';
                };
                isNetworkSwitch.onchange = updateIP;
                updateIP();
            }
        }
        // Dynamic logic for App Lock (Cellphones)
        if (view === 'cellphones') {
            const lockSwitch = document.getElementById('f-has_app_lock');
            const patternWrap = document.getElementById('wrap-app_lock_pattern');
            const passWrap = document.getElementById('wrap-app_lock_password');
            const ansWrap = document.getElementById('wrap-app_lock_answer');

            if (lockSwitch && patternWrap && passWrap && ansWrap) {
                const updateLock = () => {
                    const show = lockSwitch.checked;
                    patternWrap.style.display = show ? 'block' : 'none';
                    passWrap.style.display = show ? 'block' : 'none';
                    ansWrap.style.display = show ? 'block' : 'none';
                };
                lockSwitch.onchange = updateLock;
                updateLock();
            }
        }
        // Dynamic logic for Email Backups (Auto-date)
        if (view === 'emails') {
            const doneSwitch = document.getElementById('f-is_done');
            const startDate = document.getElementById('f-start_date');
            if (doneSwitch && startDate) {
                doneSwitch.addEventListener('change', () => {
                    if (doneSwitch.checked && !startDate.value) {
                        const today = new Date().toISOString().split('T')[0];
                        startDate.value = today;
                    }
                });
            }
        }
        if (elements.bsMainModal) ModalManager.show('mainModal');
    }
}

window.openModal = openModal;

async function handleSave(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-save');
    if (btn) btn.disabled = true;

    const actualView = e.target.dataset.view || state.currentView;
    console.log("Saving for view:", actualView);

    const isTutorial = (actualView === 'tutorials');
    const formData = new FormData(e.target);
    let payload = isTutorial ? formData : {};

    if (!isTutorial) {
        const fields = getFieldsForView(actualView);
        fields.forEach(f => {
            const input = document.getElementById(`f-${f.name}`);
            if (input) {
                if (f.type === 'checkbox' || f.type === 'switch') payload[f.name] = input.checked ? 1 : 0;
                else payload[f.name] = input.value;
            }
        });
        if (actualView === 'inventory') payload.category = 'Equipo';
        if (actualView === 'peripherals') payload.category = 'Periférico';
        if (actualView === 'printers') {
            payload.category = 'Impresora';
            payload.has_printer = 1;

            // Collect linked inks if supply type is Tinta
            if (payload.supply_type === 'Tinta') {
                const pickers = document.querySelectorAll('.ink-link-picker');
                const ids = Array.from(pickers).map(p => p.value).filter(id => id !== '');
                payload.linked_inks = JSON.stringify(ids);
            }
            // Collect linked toners if supply type is Tóner
            if (payload.supply_type === 'Tóner') {
                const pickers = document.querySelectorAll('.toner-link-picker');
                const ids = Array.from(pickers).map(p => p.value).filter(id => id !== '');
                payload.linked_toner = JSON.stringify(ids);
            }
        }
    }

    const endp = (actualView === 'licenses_cred' ? 'licenses.php' :
        (actualView === 'inks' ? 'inks.php' : `${actualView}.php`));
    const url = state.editingId ? `${CONFIG.apiUrl}/${endp}?id=${state.editingId}` : `${CONFIG.apiUrl}/${endp}`;

    try {
        const res = await fetch(url, {
            method: (isTutorial || !state.editingId) ? 'POST' : 'PUT',
            ...(isTutorial ? { body: payload } : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        });
        if (res.ok) {
            delete state.lastFetch[state.currentView];
            delete state.lastFetch[actualView];
            if (elements.bsMainModal) elements.bsMainModal.hide();

            // Success feedback
            showToast('Éxito', 'El registro se ha guardado correctamente', 'success');
            clearFormDraft(actualView);

            // If we saved a sub-view, we might need to refresh the current main view
            await fetchData(state.currentView);
            if (actualView !== state.currentView) {
                await fetchData(actualView);
            }
        } else {
            const data = await res.json().catch(() => ({}));
            showToast('Error', data.message || 'No se pudo guardar el registro', 'danger');
        }
    } catch (err) {
        console.error("Save Error:", err);
        showToast('Error', 'Error de red: ' + err.message, 'danger');
    }
    finally { if (btn) btn.disabled = false; }
}


window.deleteItem = (view, id) => {
    state.deleteInfo = { view, id };

    // Explicitly find the item in the correct data list
    let list = [];
    if (view === 'office_emails') list = state.data.office_emails;
    else if (view === 'microsoft_emails') list = state.data.microsoft_emails;
    else if (view === 'enterprise_networks') list = state.data.enterprise_networks;
    else if (view === 'network') list = state.data.network;
    else if (view === 'inventory') list = state.data.inventory;
    else if (view === 'peripherals') list = state.data.peripherals || [];
    else if (view === 'tutorials') list = state.data.tutorials;
    else if (view === 'licenses_cred' || view === 'licenses') list = state.data.licenses;
    else if (view === 'inks') list = state.data.inks;
    else if (view === 'toner') list = state.data.toner;
    else if (view === 'printers') list = state.data.printers;
    else if (view === 'cellphones') list = state.data.cellphones;
    else if (view === 'emails') list = state.data.emails;
    else if (view === 'account_management') list = state.data.account_management;
    else if (view === 'correos_outlook') list = state.data.correos_outlook;
    else if (view === 'notes') list = state.data.notes;
    else list = state.allData;

    const item = list.find(x => x.id == id);

    // ── Visual summary card ───────────────────────────────────────────────────
    const viewMeta = {
        inventory: { label: 'Equipo de Cómputo', icon: 'bi-pc-display' },
        cellphones: { label: 'Equipo Celular', icon: 'bi-phone-fill' },
        peripherals: { label: 'Periférico', icon: 'bi-mouse-fill' },
        printers: { label: 'Impresora', icon: 'bi-printer-fill' },
        inks: { label: 'Tinta', icon: 'bi-droplet-half' },
        toner: { label: 'Tóner', icon: 'bi-box-seam-fill' },
        emails: { label: 'Correo Reenviado', icon: 'bi-envelope-fill' },
        office_emails: { label: 'Correo Office', icon: 'bi-microsoft' },
        microsoft_emails: { label: 'Cuenta Microsoft 365', icon: 'bi-microsoft' },
        network: { label: 'Dispositivo de Red', icon: 'bi-router-fill' },
        enterprise_networks: { label: 'Red Empresarial', icon: 'bi-wifi' },
        licenses: { label: 'Licencia', icon: 'bi-key-fill' },
        licenses_cred: { label: 'Credencial', icon: 'bi-person-badge-fill' },
        account_management: { label: 'Cuenta de Acceso', icon: 'bi-person-workspace' },
        correos_outlook: { label: 'Correo Outlook', icon: 'bi-envelope-at-fill' },
        tutorials: { label: 'Tutorial', icon: 'bi-file-earmark-pdf-fill' },
        notes: { label: 'Nota', icon: 'bi-journal-text' },
    };

    const meta = viewMeta[view] || { label: 'Registro', icon: 'bi-file-earmark' };

    // Primary name shown prominently
    const nameEl = document.getElementById('delete-item-name');
    if (nameEl) nameEl.textContent = item?.name || item?.ssid || item?.email || item?.correo
        || item?.full_name || item?.title || item?.original_name || 'este registro';

    // Secondary contextual detail
    const detailEl = document.getElementById('delete-item-detail');
    if (detailEl) {
        let detail = '';
        if (item) {
            if (view === 'inventory') detail = [item.format, item.assigned_user].filter(Boolean).join(' · ');
            else if (view === 'cellphones') detail = [item.area, item.phone_number].filter(Boolean).join(' · ');
            else if (view === 'printers') detail = [item.brand, item.model, item.zone].filter(Boolean).join(' · ');
            else if (view === 'peripherals') detail = [item.brand, item.status].filter(Boolean).join(' · ');
            else if (view === 'inks') detail = [item.brand, item.model, item.color].filter(Boolean).join(' · ');
            else if (view === 'toner') detail = [item.brand, item.model].filter(Boolean).join(' · ');
            else if (view === 'network') detail = [item.device_type, item.ip_address].filter(Boolean).join(' · ');
            else if (view === 'enterprise_networks') detail = [item.location].filter(Boolean).join(' · ');
            else if (view === 'emails') detail = item.original_email || '';
            else if (view === 'office_emails' || view === 'microsoft_emails') detail = item.status || '';
            else if (view === 'licenses' || view === 'licenses_cred') detail = [item.type, item.status].filter(Boolean).join(' · ');
            else if (view === 'correos_outlook') detail = item.estatus || '';
            else if (view === 'account_management') detail = [item.account_type, item.assigned_to].filter(Boolean).join(' · ');
            else if (view === 'notes') detail = item.content ? item.content.substring(0, 60) + (item.content.length > 60 ? '…' : '') : '';
        }
        detailEl.textContent = detail;
        detailEl.style.display = detail ? '' : 'none';
    }

    // Icon
    const iconEl = document.getElementById('delete-record-icon');
    if (iconEl) iconEl.innerHTML = `<i class="bi ${meta.icon}"></i>`;

    // Type label
    const typeEl = document.getElementById('delete-record-type');
    if (typeEl) typeEl.textContent = meta.label;

    if (elements.bsDeleteModal) ModalManager.show('deleteModal');
};


async function confirmRealDelete() {
    const { view, id } = state.deleteInfo;
    const endp = (view === 'licenses_cred' ? 'licenses.php' :
        (view === 'inks' ? 'inks.php' : `${view}.php`));
    try {
        const res = await fetch(`${CONFIG.apiUrl}/${endp}?id=${id}`, { method: 'DELETE' });
        const data = await res.json().catch(() => ({}));

        if (res.ok) {
            if (elements.bsDeleteModal) elements.bsDeleteModal.hide();
            await fetchData(view);
            // Refresh dashboard if we are on it
            if (state.currentView === 'dashboard') {
                updateDashboardStats();
                renderNotesDashboard();
            }
            showToast('Borrado', data.message || 'El registro ha sido eliminado', 'warning');
        } else {
            throw new Error(data.message || 'No se pudo eliminar el registro');
        }
    } catch (e) {
        console.error("Delete Error:", e);
        showToast('Error', e.message, 'danger');
    }
}


window.editItem = (view, id) => {
    let list = [];
    if (view === 'office_emails') list = state.data.office_emails;
    else if (view === 'microsoft_emails') list = state.data.microsoft_emails;
    else if (view === 'enterprise_networks') list = state.data.enterprise_networks;
    else if (view === 'network') list = state.data.network;
    else if (view === 'inventory') list = state.data.inventory || [];
    else if (view === 'peripherals') list = state.data.peripherals || [];
    else if (view === 'tutorials') list = state.data.tutorials;
    else if (view === 'licenses_cred' || view === 'licenses') list = state.data.licenses;
    else if (view === 'inks') list = state.data.inks;
    else if (view === 'toner') list = state.data.toner;
    else if (view === 'printers') list = state.data.printers;
    else if (view === 'cellphones') list = state.data.cellphones;
    else if (view === 'emails') list = state.data.emails;
    else if (view === 'account_management') list = state.data.account_management;
    else if (view === 'correos_outlook') list = state.data.correos_outlook;
    else if (view === 'notes') list = state.data.notes;
    else list = state.allData;

    const item = list.find(x => x.id == id);
    if (item) openModal(view, item);
};

window.updateTonerQuantity = async (id, delta) => {
    const list = state.data.toner || [];
    const item = list.find(x => x.id == id);
    if (!item) return;

    const newQty = Math.max(0, parseInt(item.quantity) + delta);
    if (newQty === parseInt(item.quantity)) return;

    const payload = { ...item, quantity: newQty };

    try {
        const res = await fetch(`${CONFIG.apiUrl}/toner.php?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            if (state.currentView === 'printers' && state.activePrinterId) {
                // Refresh data for toner and inks but keep printers state
                const rT = await fetch(`${CONFIG.apiUrl}/toner.php`);
                if (rT.ok) state.data.toner = await rT.json();
                window.showPrinterToner(state.activePrinterId);
            } else {
                await fetchData(state.currentView);
            }
            showToast('Éxito', 'Cantidad de tóner actualizada', 'success');
        } else {
            console.error("Failed to update quantity");
            showToast('Error', 'No se pudo actualizar la cantidad de tóner', 'danger');
        }
    } catch (err) {
        console.error("Error updating quantity:", err);
        showToast('Error', 'Error de red al actualizar tóner', 'danger');
    }
};

window.updateInkQuantity = async (id, delta) => {
    const list = state.data.inks || [];
    const item = list.find(x => x.id == id);
    if (!item) return;

    const newQty = Math.max(0, parseInt(item.quantity) + delta);
    if (newQty === parseInt(item.quantity)) return;

    const payload = { ...item, quantity: newQty };

    try {
        const res = await fetch(`${CONFIG.apiUrl}/inks.php?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            if (state.currentView === 'printers' && state.activePrinterId) {
                // Refresh data for inks and printers
                const rI = await fetch(`${CONFIG.apiUrl}/inks.php`);
                if (rI.ok) state.data.inks = await rI.json();
                window.showPrinterInks(state.activePrinterId);
            } else {
                await fetchData(state.currentView);
            }
            showToast('Éxito', 'Cantidad de tinta actualizada', 'success');
        } else {
            console.error("Failed to update quantity");
            showToast('Error', 'No se pudo actualizar la cantidad de tinta', 'danger');
        }
    } catch (err) {
        console.error("Error updating quantity:", err);
        showToast('Error', 'Error de red al actualizar tinta', 'danger');
    }
};

// --- Pattern Visualization Helpers ---
// --- Pattern Visualization Helpers ---
function generatePatternSVG(nodeStr, size = 80) {
    if (!nodeStr) return '';
    const nodes = nodeStr.split('-').map(Number);
    const padding = size * 0.2;
    const step = (size - 2 * padding) / 2;
    const s = size / 80; // Scale factor

    const getCoords = (n) => {
        const r = Math.floor((n - 1) / 3);
        const c = (n - 1) % 3;
        return { x: padding + c * step, y: padding + r * step };
    };

    const getRadius = (isActive) => isActive ? (size / 12) : (size / 26);

    let elementsSVG = '';

    // Draw lines as arrows
    if (nodes.length > 1) {
        nodes.forEach((n, i) => {
            if (i < nodes.length - 1) {
                const p1 = getCoords(n);
                const p2 = getCoords(nodes[i + 1]);

                const r1 = getRadius(true); // Always active
                const r2 = getRadius(true);

                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);

                // Arrow styling
                const arrowLength = 8 * s;
                const arrowWidth = 4 * s;

                // Effective start and end points (touching the circles)
                const startX = p1.x + Math.cos(angle) * r1;
                const startY = p1.y + Math.sin(angle) * r1;

                // End point for the line (stopping before arrowhead)
                const endLineX = p2.x - Math.cos(angle) * (r2 + arrowLength - 1 * s); // slightly overlap arrowhead
                const endLineY = p2.y - Math.sin(angle) * (r2 + arrowLength - 1 * s);

                // Arrow tip (touching the target circle)
                const tipX = p2.x - Math.cos(angle) * r2;
                const tipY = p2.y - Math.sin(angle) * r2;

                // LAYER 1: Border (White)
                // Line Border
                elementsSVG += `<line x1="${startX}" y1="${startY}" x2="${endLineX}" y2="${endLineY}" stroke="#FFFFFF" stroke-width="${4.5 * s}" stroke-linecap="round" />`;
                // Arrowhead Border
                const deg = angle * 180 / Math.PI;
                elementsSVG += `<path d="M 0,0 L -${arrowLength},-${arrowWidth} L -${arrowLength},${arrowWidth} z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="${1.5 * s}" stroke-linejoin="round" transform="translate(${tipX}, ${tipY}) rotate(${deg})" />`;

                // LAYER 2: Inner (Red)
                // Line Inner
                elementsSVG += `<line x1="${startX}" y1="${startY}" x2="${endLineX}" y2="${endLineY}" stroke="#CC0000" stroke-width="${2.5 * s}" stroke-linecap="round" />`;
                // Arrowhead Inner
                elementsSVG += `<path d="M 0,0 L -${arrowLength},-${arrowWidth} L -${arrowLength},${arrowWidth} z" fill="#CC0000" transform="translate(${tipX}, ${tipY}) rotate(${deg})" />`;
            }
        });
    }

    // Draw dots
    const dotsSVG = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
        const { x, y } = getCoords(i);
        const index = nodes.indexOf(i);
        const isActive = index !== -1;

        let el = `<circle cx="${x}" cy="${y}" r="${getRadius(isActive)}" fill="${isActive ? '#CC0000' : '#444'}" />`;

        // Add keypad number (1-9) inside active dots
        if (isActive) {
            const fontSize = size / 8;
            el += `<text x="${x}" y="${y + (fontSize / 2.8)}" text-anchor="middle" fill="#FFFFFF" font-size="${fontSize}px" font-family="Arial, sans-serif" font-weight="bold">${i}</text>`;
        }
        return el;
    }).join('');

    return `<svg width="100%" height="100%" viewBox="0 0 ${size} ${size}">${elementsSVG}${dotsSVG}</svg>`;
}

window.expandPattern = (nodeStr) => {
    const existing = document.getElementById('pattern-expand-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'pattern-expand-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.9);z-index:99999;display:flex;justify-content:center;align-items:center;backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s ease;';

    // Size for large view
    const largeSize = Math.min(window.innerWidth - 40, 400);

    overlay.innerHTML = `
        <div style="position:relative; width: ${largeSize}px; display:flex; flex-direction:column; align-items:center; transform:scale(0.8); transition:transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            <div style="width: ${largeSize}px; height: ${largeSize}px; background: #212529; border-radius: 24px; padding: 24px; box-shadow: 0 10px 60px rgba(220,53,69,0.4); border: 1px solid rgba(255,255,255,0.1);">
                ${generatePatternSVG(nodeStr, largeSize)}
            </div>
            <div class="mt-4 text-center">
                 <div class="text-white fw-bold mb-2" style="font-size:1.5rem; letter-spacing:1px;">Patrón de Desbloqueo</div>
                 <div class="badge bg-secondary fs-5 px-4 py-2 rounded-pill font-monospace shadow-sm" style="letter-spacing:2px; border:1px solid rgba(255,255,255,0.2);">${nodeStr}</div>
            </div>
            <button class="btn btn-outline-light rounded-circle position-absolute" style="top:-60px; right:0; width:50px; height:50px; font-size:24px; border-width:2px;" onclick="document.getElementById('pattern-expand-overlay').classList.remove('active'); setTimeout(() => document.getElementById('pattern-expand-overlay').remove(), 300);"><i class="bi bi-x"></i></button>
        </div>
    `;

    // Close on click outside
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            overlay.firstChild.style.transform = 'scale(0.8)';
            setTimeout(() => overlay.remove(), 300);
        }
    };

    document.body.appendChild(overlay);

    // Animation trigger
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        overlay.classList.add('active'); // For potential CSS hooks
        overlay.querySelector('div').style.transform = 'scale(1)';
    });
};

window.viewItem = (view, id) => {
    // Attempt to find in specific list, otherwise check related lists for grouped views
    let list = [];
    if (view === 'office_emails') list = state.data.office_emails || [];
    else if (view === 'microsoft_emails') list = state.data.microsoft_emails || [];
    else if (view === 'emails') {
        // Search in all email datasets for the general email view
        list = [...(state.data.emails || []), ...(state.data.office_emails || []), ...(state.data.microsoft_emails || [])];
    }
    else if (view === 'enterprise_networks') list = state.data.enterprise_networks || [];
    else if (view === 'network') {
        list = [...(state.data.network || []), ...(state.data.enterprise_networks || [])];
    }
    else if (view === 'tutorials') list = state.data.tutorials || [];
    else if (view === 'licenses_cred' || view === 'licenses') list = state.data.licenses || [];
    else if (view === 'inks') list = state.data.inks || [];
    else if (view === 'toner') list = state.data.toner || [];
    else if (view === 'cellphones') list = state.data.cellphones || [];
    else if (view === 'peripherals') list = state.data.peripherals || [];
    else if (view === 'printers') list = state.data.printers || [];
    else if (view === 'account_management') list = state.data.account_management || [];
    else if (view === 'correos_outlook') list = state.data.correos_outlook || [];
    else if (view === 'inventory') list = state.data.inventory || [];
    else if (view === 'notes') list = state.data.notes || [];
    else list = state.allData || [];

    let item = list.find(x => String(x.id) === String(id));

    // Fallback: search ALL datasets if not found in primary view (crucial for search results)
    if (!item) {
        const allPossibleLists = [
            ...(state.data.inventory || []), ...(state.data.peripherals || []),
            ...(state.data.licenses || []), ...(state.data.emails || []),
            ...(state.data.office_emails || []), ...(state.data.microsoft_emails || []),
            ...(state.data.network || []), ...(state.data.enterprise_networks || []),
            ...(state.data.printers || []), ...(state.data.account_management || []),
            ...(state.data.cellphones || []), ...(state.data.tutorials || []),
            ...(state.data.inks || []), ...(state.data.toner || []),
            ...(state.data.correos_outlook || []), ...(state.data.notes || [])
        ];
        item = allPossibleLists.find(x => String(x.id) === String(id));
    }

    if (!item) {
        console.error(`Item with ID ${id} not found in any dataset for view ${view}`);
        return;
    }
    if (!item) return;

    if (elements['view-modal-title']) {
        let title = item.employee || item.name || item.ssid || item.email || item.correo || item.full_name || item.title || item.original_name || item.original_email || '#' + item.id;
        if (view === 'notes') title = item.title || title;
        elements['view-modal-title'].textContent = `Detalles: ${title}`;
    }

    // --- Timestamps logic (Updated to be more discrete and adjacent to title) ---
    const timestampContainer = document.getElementById('view-modal-timestamps');
    if (timestampContainer) {
        timestampContainer.innerHTML = '';
        const formatDate = (dateStr) => {
            if (!dateStr || dateStr === '0000-00-00 00:00:00') return '-';
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
            return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
        };

        const regDate = formatDate(item.created_at);
        const modDate = (item.updated_at && item.updated_at !== item.created_at) ? formatDate(item.updated_at) : 'No modificado';

        timestampContainer.innerHTML = `
            <div style="font-size: 0.7rem; opacity: 0.7;">
                <span class="text-danger fw-bold">Creado:</span>
                <span class="text-danger">${regDate}</span>
            </div>
            <div style="font-size: 0.7rem; opacity: 0.7;">
                <span class="text-danger fw-bold">Modificado:</span>
                <span class="text-danger">${modDate}</span>
            </div>
        `;
    }

    if (elements['view-details-content']) {
        const physicalAssets = ['inventory', 'cellphones', 'peripherals', 'printers'];
        const isPhysical = physicalAssets.includes(view);

        const currentIndex = list.findIndex(x => String(x.id) === String(id));
        const prevItem = currentIndex > 0 ? list[currentIndex - 1] : null;
        const nextItem = currentIndex < list.length - 1 ? list[currentIndex + 1] : null;

        elements['view-details-content'].innerHTML = `
            ${isPhysical ? `
                <div class="modal-tabs-nav shadow-sm border border-danger border-opacity-10">
                    <button class="modal-tab-btn active" id="btn-tab-info" onclick="window.switchViewPage('info')">
                        <i class="bi bi-info-circle-fill"></i> Información
                    </button>
                    <button class="modal-tab-btn" id="btn-tab-tools" onclick="window.switchViewPage('tools')">
                        <i class="bi bi-tools"></i> Control y Bitácora
                    </button>
                </div>
                ${prevItem ? `
                    <div class="floating-nav-btn prev shadow" onclick="window.viewItem('${view}', '${prevItem.id}', window.currentViewPage)" title="Anterior">
                        <i class="bi bi-arrow-left-short"></i>
                    </div>
                ` : ''}
                ${nextItem ? `
                    <div class="floating-nav-btn next shadow" onclick="window.viewItem('${view}', '${nextItem.id}', window.currentViewPage)" title="Siguiente">
                        <i class="bi bi-arrow-right-short"></i>
                    </div>
                ` : ''}
            ` : ''}
            <div id="view-page-info" class="view-page"></div>
            <div id="view-page-tools" class="view-page d-none"></div>
        `;

        const targetPage = window.lastViewedPage || 'info';
        window.currentViewPage = 'info'; // Default reset for the logic below

        window.switchViewPage = (page) => {
            window.currentViewPage = page;
            window.lastViewedPage = page;
            const info = document.getElementById('view-page-info');
            const tools = document.getElementById('view-page-tools');
            const btnInfo = document.getElementById('btn-tab-info');
            const btnTools = document.getElementById('btn-tab-tools');

            if (page === 'info') {
                info?.classList.remove('d-none');
                tools?.classList.add('d-none');
                btnInfo?.classList.add('active');
                btnTools?.classList.remove('active');
            } else {
                info?.classList.add('d-none');
                tools?.classList.remove('d-none');
                btnInfo?.classList.remove('active');
                btnTools?.classList.add('active');

                // Refresh QR and logs
                window.loadMaintenanceLogs(item.id, view);
                if (typeof QRCode !== 'undefined') {
                    const qrEl = document.getElementById('qr-code-details');
                    if (qrEl && !qrEl.hasChildNodes()) {
                        window.generateQR("qr-code-details", `ID:${item.id}|FOLIO:${item.code || 'N/A'}|TYPE:${view}`);
                    }
                }
            }
        };

        // If we were on tools, restore it
        if (targetPage === 'tools') {
            setTimeout(() => window.switchViewPage('tools'), 10);
        }

        const fields = getFieldsForView(view);

        // ── Helpers ──────────────────────────────────────────────────────────────
        const hl = (text) => {
            const q = state.highlightQuery;
            if (!q || !text || typeof text !== 'string') return text;
            return text.replace(new RegExp(`(${q})`, 'gi'), '<mark class="bg-warning text-dark rounded px-1">$1</mark>');
        };
        const fv = (name) => {
            const raw = item[name];
            return (raw !== null && raw !== undefined && raw !== '') ? String(raw) : '-';
        };
        const card = (label, value, icon = '', span = 'col-12 col-sm-6 col-lg-4') => `
            <div class="${span}">
                <div class="detail-card-v2">
                    ${icon ? `<div class="detail-card-icon">${icon}</div>` : ''}
                    <div class="detail-card-body">
                        <div class="detail-card-label">${label}</div>
                        <div class="detail-card-value">${value || '-'}</div>
                    </div>
                </div>
            </div>`;
        const cardFull = (label, value, icon = '') => card(label, value, icon, 'col-12');
        const cardHalf = (label, value, icon = '') => card(label, value, icon, 'col-12 col-md-6');
        const cardThird = (label, value, icon = '') => card(label, value, icon, 'col-12 col-sm-6 col-lg-4');
        const sectionHeader = (title, icon = '') => `
            <div class="col-12 mt-3 mb-1">
                <div class="d-flex align-items-center gap-2 border-bottom border-danger border-opacity-25 pb-1">
                    ${icon ? `<i class="bi ${icon} text-danger fs-6"></i>` : ''}
                    <span class="text-uppercase fw-bold small text-muted ls-1">${title}</span>
                </div>
            </div>`;
        const boolBadge = (val) => val == 1
            ? '<span class="badge rounded-pill px-3 py-2" style="background:#d1fae5;color:#065f46;font-size:0.75rem;"><i class="bi bi-check-circle-fill me-1"></i>Sí</span>'
            : '<span class="badge rounded-pill px-3 py-2" style="background:#f1f5f9;color:#94a3b8;font-size:0.75rem;"><i class="bi bi-x-circle me-1"></i>No</span>';
        const statusBadge = (val, map = {}) => {
            if (!val || val === '-') return '-';
            const cfg = map[val] || { bg: '#f1f5f9', color: '#64748b' };
            return `<span class="badge rounded-pill px-3 py-2" style="background:${cfg.bg};color:${cfg.color};font-size:0.75rem;">${val}</span>`;
        };
        const append = (html, target = 'info') => {
            const containerId = target === 'info' ? 'view-page-info' : 'view-page-tools';
            const container = document.getElementById(containerId);
            if (!container) return;
            const tmp = document.createElement('div');
            tmp.className = 'row g-3';
            tmp.innerHTML = html;
            container.appendChild(tmp);
        };

        // ── Add inline styles for detail-card-v2 ────────────────────────────────
        if (!document.getElementById('detail-card-v2-style')) {
            const st = document.createElement('style');
            st.id = 'detail-card-v2-style';
            st.textContent = `
                .detail-card-v2 {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 10px 14px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    min-height: 62px;
                }
                body.dark-mode .detail-card-v2 {
                    background: rgba(255,255,255,0.04);
                    border-color: rgba(255,255,255,0.08);
                }
                .detail-card-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: rgba(204,0,0,0.08);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.9rem;
                    color: #cc0000;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                .detail-card-body { flex: 1; min-width: 0; }
                .detail-card-label {
                    font-size: 0.65rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #94a3b8;
                    margin-bottom: 3px;
                }
                .detail-card-value {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #1e293b;
                    word-break: break-word;
                }
                body.dark-mode .detail-card-value { color: #f1f5f9; }
                .detail-software-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 0.78rem;
                    font-weight: 600;
                }
                .detail-software-pill.on { background:#d1fae5; color:#065f46; }
                .detail-software-pill.off { background:#f1f5f9; color:#94a3b8; text-decoration:line-through; }
                .detail-section-banner {
                    background: linear-gradient(135deg, #cc0000 0%, #991111 100%);
                    border-radius: 12px;
                    padding: 14px 18px;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 4px;
                }
                .modal-tabs-nav {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 24px;
                    background: #f1f5f9;
                    padding: 6px;
                    border-radius: 50px;
                    width: fit-content;
                    margin-left: auto;
                    margin-right: auto;
                }
                body.dark-mode .modal-tabs-nav { background: rgba(255,255,255,0.05); }
                .modal-tab-btn {
                    border: none;
                    background: transparent;
                    padding: 8px 24px;
                    border-radius: 40px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #64748b;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .modal-tab-btn.active {
                    background: #cc0000;
                    color: white;
                    box-shadow: 0 4px 12px rgba(204, 0, 0, 0.2);
                }
                .view-page { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
                .view-page.d-none { display: none !important; opacity: 0; transform: translateX(20px); }

                /* Floating Navigation Buttons */
                .floating-nav-btn {
                    position: fixed;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 60px;
                    height: 60px;
                    background: #cc0000;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 25px rgba(204, 0, 0, 0.4);
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    z-index: 1055;
                    border: 4px solid white;
                }
                .floating-nav-btn:hover {
                    transform: translateY(-50%) scale(1.15);
                    background: #e60000;
                }
                .floating-nav-btn.prev { left: 40px; }
                .floating-nav-btn.next { right: 40px; }
                .floating-nav-btn i { font-size: 2rem; }
                
                @media (max-width: 768px) {
                    .floating-nav-btn {
                        width: 50px;
                        height: 50px;
                        border-width: 3px;
                    }
                    .floating-nav-btn.prev { left: 10px; }
                    .floating-nav-btn.next { right: 10px; }
                    .floating-nav-btn i { font-size: 1.5rem; }
                }
            `;
            document.head.appendChild(st);
        }

        // ════════════════════════════════════════════════════════════════════════
        //  INVENTORY ─ Equipos de Cómputo
        // ════════════════════════════════════════════════════════════════════════
        if (view === 'inventory') {
            const invStatus = { 'ENTREGADO': { bg: '#d1fae5', color: '#065f46' }, 'DISPONIBLE': { bg: '#dbeafe', color: '#1e40af' }, 'PENDIENTE': { bg: '#fef9c3', color: '#854d0e' }, 'BAJA': { bg: '#fee2e2', color: '#991b1b' }, 'HEREDABLE': { bg: '#f3e8ff', color: '#6b21a8' } };
            append(`
                ${sectionHeader('Identificación del Equipo', 'bi-laptop')}
                ${cardThird(hl('Formato'), hl(fv('format')), '<i class="bi bi-layout-text-sidebar-reverse"></i>')}
                ${cardThird(hl('Nombre / Modelo'), hl(fv('name')), '<i class="bi bi-pc-display"></i>')}
                ${cardThird(hl('Folio'), hl(fv('code')), '<i class="bi bi-hash"></i>')}
                ${cardThird(hl('Serie'), hl(fv('serial')), '<i class="bi bi-upc-scan"></i>')}
                ${cardThird(hl('Marca'), hl(fv('brand')), '<i class="bi bi-award"></i>')}
                ${cardThird('Estado', statusBadge(fv('status'), invStatus), '<i class="bi bi-activity"></i>')}

                ${sectionHeader('Asignación', 'bi-person')}
                ${cardThird(hl('Empleado / Usuario'), hl(fv('assigned_user')), '<i class="bi bi-person-fill"></i>')}
                ${cardThird(hl('Zona / Área'), hl(fv('zone')), '<i class="bi bi-geo-alt"></i>')}
                ${cardThird(hl('Fecha de Entrega'), hl(fv('delivery_date')), '<i class="bi bi-calendar-check"></i>')}

                ${sectionHeader('Especificaciones Técnicas', 'bi-cpu')}
                ${cardThird(hl('Procesador'), hl(fv('processor')), '<i class="bi bi-cpu-fill"></i>')}
                ${cardThird(hl('RAM'), hl(fv('ram')), '<i class="bi bi-memory"></i>')}
                ${cardThird(hl('Disco / Almacenamiento'), hl(fv('storage')), '<i class="bi bi-device-hdd"></i>')}
                ${cardThird(hl('Sistema Operativo'), hl(fv('os')), '<i class="bi bi-windows"></i>')}

                <div class="col-12 mt-1">
                    <div class="detail-card-v2" style="flex-wrap:wrap;">
                        <div class="w-100 detail-card-label mb-2"><i class="bi bi-box-seam me-1 text-danger"></i> SOFTWARE E INSTALACIONES</div>
                        <div class="d-flex flex-wrap gap-2 w-100">
                            ${['has_office', 'has_reader', 'has_winrar', 'has_server', 'has_printer'].map(n => {
                const f2 = fields.find(x => x.name === n); if (!f2) return '';
                const on = item[n] == 1;
                return `<span class="detail-software-pill ${on ? 'on' : 'off'}"><i class="bi ${on ? 'bi-check-circle-fill' : 'bi-x-circle'}"></i>${f2.label}</span>`;
            }).join('')}
                        </div>
                    </div>
                </div>
                ${fv('comments') !== '-' ? cardFull(hl('Notas'), hl(fv('comments')), '<i class="bi bi-chat-text"></i>') : ''}
            `);

            // ════════════════════════════════════════════════════════════════════════
            //  CELLPHONES ─ Equipos Móviles
            // ════════════════════════════════════════════════════════════════════════
        } else if (view === 'cellphones') {
            const hasLock = item.has_app_lock == 1;
            const patternVal = fv('app_lock_pattern');
            const patternHtml = (hasLock && patternVal !== '-' && patternVal !== '')
                ? (() => {
                    const svg = generatePatternSVG(patternVal, 80);
                    return `<div class="d-flex align-items-center gap-3 py-1" onclick="expandPattern('${patternVal}')" role="button" title="Clic para ampliar">
                        <div class="bg-dark rounded-3 p-2 shadow-sm" style="width:80px;height:80px;">${svg}</div>
                        <div><div class="fw-bold small text-danger mb-1"><i class="bi bi-shield-lock-fill me-1"></i>Patrón guardado</div>
                        <span class="badge bg-secondary rounded-pill px-3">Toca para ampliar</span></div></div>`;
                })()
                : boolBadge(0);

            append(`
                ${sectionHeader('Datos del Empleado', 'bi-person-vcard')}
                ${cardHalf(hl('Empleado'), hl(fv('employee')), '<i class="bi bi-person-fill"></i>')}
                ${cardHalf(hl('Área'), hl(fv('area')), '<i class="bi bi-building"></i>')}

                ${sectionHeader('Datos del Equipo', 'bi-phone')}
                ${cardHalf(hl('Modelo / Nombre'), hl(fv('model')), '<i class="bi bi-phone-fill"></i>')}
                ${cardHalf(hl('Número de Teléfono'), hl(fv('phone_number')), '<i class="bi bi-telephone-fill"></i>')}

                ${sectionHeader('Acceso y Seguridad', 'bi-key')}
                ${cardHalf(hl('Correo Electrónico'), hl(fv('email')), '<i class="bi bi-envelope-fill"></i>')}
                ${cardHalf(hl('Cuenta de Recuperación'), hl(fv('recovery_account')), '<i class="bi bi-arrow-counterclockwise"></i>')}
                ${cardHalf(hl('Contraseña'), hl(fv('password')), '<i class="bi bi-lock-fill"></i>')}
                ${cardHalf(hl('Contraseña Actualizada'), hl(fv('updated_password')), '<i class="bi bi-lock-fill"></i>')}
                ${cardHalf(hl('Fecha de Nacimiento'), hl(fv('birth_date')), '<i class="bi bi-cake2-fill"></i>')}

                ${hasLock ? `
                    ${sectionHeader('App Lock', 'bi-shield-lock')}
                    <div class="col-12 col-md-6">${card('Patrón de Bloqueo', patternHtml, '<i class="bi bi-grid-3x3-gap-fill"></i>', '')}</div>
                    ${cardHalf(hl('Pass Bloqueo Apps (Texto)'), hl(fv('app_lock_password')), '<i class="bi bi-type-h3"></i>')}
                    ${fv('app_lock_answer') !== '-' ? cardFull(hl('Respuesta de Seguridad'), hl(fv('app_lock_answer')), '<i class="bi bi-question-circle-fill"></i>') : ''}
                ` : ''}

                ${fv('comments') !== '-' ? `${sectionHeader('Comentarios')}${cardFull('', hl(fv('comments')))}` : ''}
            `);

            // ════════════════════════════════════════════════════════════════════════
            //  PRINTERS ─ Impresoras
            // ════════════════════════════════════════════════════════════════════════
        } else if (view === 'printers') {
            const prStatus = { 'Activo': { bg: '#d1fae5', color: '#065f46' }, 'En Reparación': { bg: '#fef9c3', color: '#854d0e' }, 'Baja': { bg: '#fee2e2', color: '#991b1b' } };
            append(`
                ${sectionHeader('Identificación', 'bi-printer')}
                ${cardThird(hl('Nombre'), hl(fv('name')), '<i class="bi bi-printer-fill"></i>')}
                ${cardThird(hl('Marca'), hl(fv('brand')), '<i class="bi bi-award"></i>')}
                ${cardThird(hl('Modelo'), hl(fv('model')), '<i class="bi bi-tag-fill"></i>')}
                ${cardThird(hl('Código / Folio'), hl(fv('code')), '<i class="bi bi-hash"></i>')}
                ${cardThird(hl('Serie'), hl(fv('serial')), '<i class="bi bi-upc-scan"></i>')}
                ${cardThird('Estado', statusBadge(fv('status'), prStatus), '<i class="bi bi-activity"></i>')}

                ${sectionHeader('Ubicación y Asignación', 'bi-geo-alt')}
                ${cardHalf(hl('Área / Ubicación'), hl(fv('zone')), '<i class="bi bi-geo-alt-fill"></i>')}
                ${cardHalf(hl('Conexión por IP'), boolBadge(item.is_network), '<i class="bi bi-router-fill"></i>')}
                ${item.is_network == 1 ? cardHalf(hl('Dirección IP'), hl(fv('ip_address')), '<i class="bi bi-ethernet"></i>') : ''}
                ${cardFull(hl('Asignado a'), hl(fv('assigned_to')), '<i class="bi bi-people-fill"></i>')}

                ${sectionHeader('Consumibles', 'bi-droplet')}
                ${cardHalf(hl('¿Qué utiliza?'), hl(fv('supply_type')), '<i class="bi bi-box-seam"></i>')}

                ${fv('comments') !== '-' ? `${sectionHeader('Notas')}${cardFull('', hl(fv('comments')))}` : ''}
            `);

            // ════════════════════════════════════════════════════════════════════════
            //  NETWORK ─ Dispositivos de Red
            // ════════════════════════════════════════════════════════════════════════
        } else if (view === 'network') {
            append(`
                ${sectionHeader('Información del Dispositivo', 'bi-router')}
                ${cardThird(hl('Nombre'), hl(fv('device_name')), '<i class="bi bi-router-fill"></i>')}
                ${cardThird(hl('Tipo'), hl(fv('device_type')), '<i class="bi bi-hdd-network-fill"></i>')}
                ${cardThird(hl('Área / Ubicación'), hl(fv('location')), '<i class="bi bi-geo-alt-fill"></i>')}
                ${sectionHeader('Configuración de Red', 'bi-ethernet')}
                ${cardHalf(hl('Dirección IP'), hl(fv('ip_address')), '<i class="bi bi-ethernet"></i>')}
                ${cardHalf(hl('Dirección MAC'), hl(fv('mac_address')), '<i class="bi bi-cpu"></i>')}
                ${fv('comments') !== '-' ? `${sectionHeader('Notas')}${cardFull('', hl(fv('comments')))}` : ''}
            `);

        } else if (view === 'enterprise_networks') {
            append(`
                ${sectionHeader('Datos de Red', 'bi-wifi')}
                ${cardHalf(hl('Red (SSID)'), hl(fv('ssid')), '<i class="bi bi-wifi"></i>')}
                ${cardHalf(hl('Contraseña'), hl(fv('password')), '<i class="bi bi-lock-fill"></i>')}
                ${cardHalf(hl('Ubicación'), hl(fv('location')), '<i class="bi bi-geo-alt-fill"></i>')}
                ${fv('details') !== '-' ? cardFull(hl('Detalles / Teléfono'), hl(fv('details')), '<i class="bi bi-telephone-fill"></i>') : ''}
                ${fv('comments') !== '-' ? `${sectionHeader('Notas')}${cardFull('', hl(fv('comments')))}` : ''}
            `);

            // ════════════════════════════════════════════════════════════════════════
            //  EMAILS ─ Reenvíos, Office, Microsoft 365
            // ════════════════════════════════════════════════════════════════════════
        } else if (view === 'emails') {
            const emailStatus = { 1: { bg: '#d1fae5', color: '#065f46' }, 0: { bg: '#fef9c3', color: '#854d0e' } };
            append(`
                ${sectionHeader('Correo Original', 'bi-envelope')}
                ${cardHalf(hl('Nombre'), hl(fv('original_name')), '<i class="bi bi-person-fill"></i>')}
                ${cardHalf(hl('Correo'), hl(fv('original_email')), '<i class="bi bi-envelope-fill"></i>')}
                ${sectionHeader('Correo de Respaldo', 'bi-envelope-arrow-up')}
                ${cardHalf(hl('Nombre Respaldo'), hl(fv('backup_name')), '<i class="bi bi-person-lines-fill"></i>')}
                ${cardHalf(hl('Correo Respaldo'), hl(fv('backup_email')), '<i class="bi bi-envelope-check-fill"></i>')}
                ${sectionHeader('Vigencia y Estado', 'bi-calendar')}
                ${cardThird(hl('Inicio'), hl(fv('start_date')), '<i class="bi bi-calendar-event"></i>')}
                ${cardThird(hl('Vencimiento'), hl(fv('end_date')), '<i class="bi bi-calendar-x"></i>')}
                ${cardThird('¿Completado?', boolBadge(item.is_done), '<i class="bi bi-check-circle"></i>')}
                ${fv('comments') !== '-' ? `${sectionHeader('Notas')}${cardFull('', hl(fv('comments')))}` : ''}
            `);

        } else if (view === 'office_emails') {
            const ofStatus = { 'ACTIVA': { bg: '#d1fae5', color: '#065f46' }, 'PERDIDA': { bg: '#fee2e2', color: '#991b1b' }, 'SUSPENDIDA': { bg: '#fef9c3', color: '#854d0e' } };
            append(`
                ${sectionHeader('Correo de Office', 'bi-microsoft')}
                ${cardHalf(hl('Correo'), hl(fv('email')), '<i class="bi bi-envelope-fill"></i>')}
                ${cardHalf(hl('Password'), hl(fv('password')), '<i class="bi bi-lock-fill"></i>')}
                ${cardThird('Estado', statusBadge(fv('status'), ofStatus), '<i class="bi bi-activity"></i>')}
                ${cardThird(hl('Activación'), hl(fv('activation_date')), '<i class="bi bi-calendar-check"></i>')}
                ${cardThird(hl('Renovación'), hl(fv('renewal_date')), '<i class="bi bi-calendar-plus"></i>')}
                ${fv('comments') !== '-' ? `${sectionHeader('Notas')}${cardFull('', hl(fv('comments')))}` : ''}
            `);

        } else if (view === 'microsoft_emails') {
            const msStatus = { 'ACTIVA': { bg: '#d1fae5', color: '#065f46' }, 'PERDIDA': { bg: '#fee2e2', color: '#991b1b' }, 'SUSPENDIDA': { bg: '#fef9c3', color: '#854d0e' } };
            const adminUrl = fv('admin_url');
            const adminLink = (adminUrl !== '-' && adminUrl !== '')
                ? `<a href="${adminUrl}" target="_blank" class="text-primary fw-bold text-decoration-none"><i class="bi bi-box-arrow-up-right me-1"></i>${hl(adminUrl)}</a>`
                : '-';
            append(`
                ${sectionHeader('Cuenta Microsoft 365', 'bi-microsoft')}
                ${cardHalf(hl('Correo Office 365'), hl(fv('email')), '<i class="bi bi-envelope-at-fill"></i>')}
                ${cardHalf(hl('Contraseña'), hl(fv('password')), '<i class="bi bi-lock-fill"></i>')}
                ${cardThird('Estado', statusBadge(fv('status'), msStatus), '<i class="bi bi-activity"></i>')}
                ${cardThird(hl('Fecha Activación'), hl(fv('activation_date')), '<i class="bi bi-calendar-check"></i>')}
                ${cardThird(hl('Fecha Renovación'), hl(fv('renewal_date')), '<i class="bi bi-calendar-plus"></i>')}
                ${sectionHeader('Administración', 'bi-gear')}
                ${cardHalf(hl('Cuenta Administrador'), hl(fv('admin_account')), '<i class="bi bi-person-gear"></i>')}
                ${cardHalf('URL Administración', adminLink, '<i class="bi bi-link-45deg"></i>')}
                ${fv('comments') !== '-' ? `${sectionHeader('Notas')}${cardFull('', hl(fv('comments')))}` : ''}
            `);

            // ════════════════════════════════════════════════════════════════════════
            //  LICENSES ─ Licencias / Credenciales
            // ════════════════════════════════════════════════════════════════════════
        } else if (view === 'licenses' || view === 'licenses_cred') {
            const licStatus = { 'Activa': { bg: '#d1fae5', color: '#065f46' }, 'Vencida': { bg: '#fee2e2', color: '#991b1b' }, 'Baja': { bg: '#f1f5f9', color: '#64748b' } };
            const licLink = fv('link');
            const licLinkHtml = (licLink !== '-' && licLink !== '')
                ? `<a href="${licLink}" target="_blank" class="text-primary fw-bold text-decoration-none"><i class="bi bi-box-arrow-up-right me-1"></i>${hl(licLink)}</a>`
                : '-';
            append(`
                ${sectionHeader('Información de la Licencia', 'bi-key')}
                ${cardThird(hl('Tipo'), hl(fv('type')), '<i class="bi bi-tags-fill"></i>')}
                ${cardThird(hl('Servicio / Nombre'), hl(fv('name')), '<i class="bi bi-box-seam"></i>')}
                ${cardThird('Estado', statusBadge(fv('status'), licStatus), '<i class="bi bi-activity"></i>')}
                ${sectionHeader('Credenciales', 'bi-lock')}
                ${cardHalf(hl('Usuario / Key'), hl(fv('key_value')), '<i class="bi bi-person-badge-fill"></i>')}
                ${cardHalf(hl('Password'), hl(fv('password')), '<i class="bi bi-lock-fill"></i>')}
                ${cardHalf('Link de Acceso', licLinkHtml, '<i class="bi bi-link-45deg"></i>')}
                ${cardHalf(hl('Vencimiento'), hl(fv('expiration_date')), '<i class="bi bi-calendar-x"></i>')}
                ${fv('comments') !== '-' ? `${sectionHeader('Notas')}${cardFull('', hl(fv('comments')))}` : ''}
            `);

            // ════════════════════════════════════════════════════════════════════════
            //  PERIPHERALS ─ Periféricos
            // ════════════════════════════════════════════════════════════════════════
        } else if (view === 'peripherals') {
            const perStatus = { 'Nuevo': { bg: '#d1fae5', color: '#065f46' }, 'Usado': { bg: '#dbeafe', color: '#1e40af' }, 'Asignado': { bg: '#fef9c3', color: '#854d0e' }, 'Dañado': { bg: '#fee2e2', color: '#991b1b' }, 'Baja': { bg: '#f1f5f9', color: '#64748b' } };
            append(`
                ${sectionHeader('Artículo', 'bi-mouse')}
                ${cardThird(hl('Nombre'), hl(fv('name')), '<i class="bi bi-box-seam-fill"></i>')}
                ${cardThird(hl('Marca'), hl(fv('brand')), '<i class="bi bi-award"></i>')}
                ${cardThird(hl('Folio'), hl(fv('code')), '<i class="bi bi-hash"></i>')}
                ${cardThird(hl('Cantidad'), hl(fv('quantity')), '<i class="bi bi-123"></i>')}
                ${cardThird('Estado', statusBadge(fv('status'), perStatus), '<i class="bi bi-activity"></i>')}
                ${fv('assigned_to') !== '-' ? cardFull(hl('Asignado a'), hl(fv('assigned_to')), '<i class="bi bi-people-fill"></i>') : ''}
                ${fv('comments') !== '-' ? `${sectionHeader('Notas')}${cardFull('', hl(fv('comments')))}` : ''}
            `);

            // ════════════════════════════════════════════════════════════════════════
            //  INKS / TONER ─ Consumibles
            // ════════════════════════════════════════════════════════════════════════
        } else if (view === 'inks') {
            const inkStatus = { 'Disponible': { bg: '#d1fae5', color: '#065f46' }, 'Stock bajo': { bg: '#fef9c3', color: '#854d0e' }, 'Agotado': { bg: '#fee2e2', color: '#991b1b' } };
            append(`
                ${sectionHeader('Tinta', 'bi-droplet')}
                ${cardThird(hl('Marca'), hl(fv('brand')), '<i class="bi bi-award"></i>')}
                ${cardThird(hl('Modelo'), hl(fv('model')), '<i class="bi bi-tag-fill"></i>')}
                ${cardThird(hl('Color'), hl(fv('color')), '<i class="bi bi-palette-fill"></i>')}
                ${cardThird(hl('Tipo'), hl(fv('type')), '<i class="bi bi-droplet-half"></i>')}
                ${cardThird(hl('Capacidad'), hl(fv('capacity')), '<i class="bi bi-rulers"></i>')}
                ${cardThird(hl('Cantidad'), hl(fv('quantity')), '<i class="bi bi-123"></i>')}
                ${cardThird('Estado', statusBadge(fv('status'), inkStatus), '<i class="bi bi-activity"></i>')}
                ${cardThird(hl('Fecha Compra'), hl(fv('purchase_date')), '<i class="bi bi-cart-check"></i>')}
                ${cardThird(hl('Fecha Caducidad'), hl(fv('expiry_date')), '<i class="bi bi-calendar-x"></i>')}
                ${fv('comments') !== '-' ? `${sectionHeader('Observaciones')}${cardFull('', hl(fv('comments')))}` : ''}
            `);

        } else if (view === 'toner') {
            const torStatus = { 'NUEVO': { bg: '#d1fae5', color: '#065f46' }, 'USADO': { bg: '#f1f5f9', color: '#64748b' } };
            append(`
                ${sectionHeader('Tóner', 'bi-box-seam')}
                ${cardThird(hl('Marca'), hl(fv('brand')), '<i class="bi bi-award"></i>')}
                ${cardThird(hl('Modelo'), hl(fv('model')), '<i class="bi bi-tag-fill"></i>')}
                ${cardThird(hl('Cantidad'), hl(fv('quantity')), '<i class="bi bi-123"></i>')}
                ${cardThird('Estado', statusBadge(fv('status'), torStatus), '<i class="bi bi-activity"></i>')}
                ${fv('comentarios') !== '-' ? `${sectionHeader('Comentarios')}${cardFull('', hl(fv('comentarios')))}` : ''}
            `);

            // ════════════════════════════════════════════════════════════════════════
            //  ACCOUNT MANAGEMENT ─ Cuentas
            // ════════════════════════════════════════════════════════════════════════
        } else if (view === 'account_management') {
            const accStatus = { 'Activo': { bg: '#d1fae5', color: '#065f46' }, 'Suspendido': { bg: '#fef9c3', color: '#854d0e' }, 'Baja': { bg: '#fee2e2', color: '#991b1b' } };
            append(`
                ${sectionHeader('Información de la Cuenta', 'bi-person-workspace')}
                ${cardHalf(hl('Correo / Cuenta'), hl(fv('email')), '<i class="bi bi-envelope-at-fill"></i>')}
                ${cardHalf(hl('Tipo de Cuenta'), hl(fv('account_type')), '<i class="bi bi-tags-fill"></i>')}
                ${cardHalf(hl('Responsable'), hl(fv('assigned_to')), '<i class="bi bi-person-fill"></i>')}
                ${cardHalf('Estado', statusBadge(fv('status'), accStatus), '<i class="bi bi-activity"></i>')}
                ${cardHalf(hl('Password'), hl(fv('password')), '<i class="bi bi-lock-fill"></i>')}
                ${fv('comments') !== '-' ? `${sectionHeader('Comentarios')}${cardFull('', hl(fv('comments')))}` : ''}
            `);

            // ════════════════════════════════════════════════════════════════════════
            //  CORREOS OUTLOOK ─ Config. de Correo
            // ════════════════════════════════════════════════════════════════════════
        } else if (view === 'correos_outlook') {
            const outStatus = { 'ACTIVA': { bg: '#d1fae5', color: '#065f46' }, 'BAJA': { bg: '#fee2e2', color: '#991b1b' } };
            append(`
                ${sectionHeader('Cuenta de Correo', 'bi-envelope-at')}
                ${cardHalf(hl('Correo'), hl(fv('correo')), '<i class="bi bi-envelope-fill"></i>')}
                ${cardHalf(hl('Contraseña'), hl(fv('contraseña')), '<i class="bi bi-lock-fill"></i>')}
                ${cardThird('Estado', statusBadge(fv('estatus'), outStatus), '<i class="bi bi-activity"></i>')}

                ${sectionHeader('Servidor de Entrada (POP3 / IMAP)', 'bi-cloud-download')}
                ${cardThird(hl('Servidor Entrada'), hl(fv('servidor_entrada')), '<i class="bi bi-server"></i>')}
                ${cardThird(hl('Puerto'), hl(fv('puerto_entrada')), '<i class="bi bi-plug-fill"></i>')}
                ${cardThird('SSL/TLS', boolBadge(item.ssl_entrada), '<i class="bi bi-shield-lock-fill"></i>')}

                ${sectionHeader('Servidor de Salida (SMTP)', 'bi-cloud-upload')}
                ${cardThird(hl('Servidor Salida'), hl(fv('servidor_salida')), '<i class="bi bi-server"></i>')}
                ${cardThird(hl('Puerto'), hl(fv('puerto_salida')), '<i class="bi bi-plug-fill"></i>')}
                ${cardThird(hl('Cifrado'), hl(fv('cifrado_salida')), '<i class="bi bi-shield-fill"></i>')}

                ${fv('comentarios') !== '-' ? `${sectionHeader('Comentarios')}${cardFull('', hl(fv('comentarios')))}` : ''}
            `);

            // ════════════════════════════════════════════════════════════════════════
            //  NOTES ─ Notas
            // ════════════════════════════════════════════════════════════════════════
        } else if (view === 'notes') {
            append(`
                ${sectionHeader('Nota', 'bi-journal-text')}
                ${cardFull(hl('Título'), hl(fv('title')), '<i class="bi bi-type-h1"></i>')}
                <div class="col-12">
                    <div class="detail-card-v2" style="min-height:100px;align-items:flex-start;">
                        <div class="detail-card-icon"><i class="bi bi-card-text"></i></div>
                        <div class="detail-card-body">
                            <div class="detail-card-label">Contenido</div>
                            <div class="detail-card-value" style="white-space:pre-wrap;">${hl(fv('content'))}</div>
                        </div>
                    </div>
                </div>
            `);

            // ════════════════════════════════════════════════════════════════════════
            //  GENERIC FALLBACK ─ anything else
            // ════════════════════════════════════════════════════════════════════════
        } else {
            let html = '';
            fields.forEach(f => {
                if (f.type === 'file' || f.type === 'hr' || f.type === 'hidden') return;
                if (view === 'users' && f.name === 'password') return;
                if (!Number(item.has_app_lock) && (f.name === 'app_lock_pattern' || f.name === 'app_lock_password' || f.name === 'app_lock_answer')) return;

                let v = item[f.name] ?? '-';
                if (f.type === 'switch' || f.type === 'checkbox') {
                    v = boolBadge(v);
                } else if ((f.name === 'link' || f.name === 'admin_url') && v !== '-' && v !== '') {
                    v = `<a href="${v}" target="_blank" class="text-primary fw-bold text-decoration-none"><i class="bi bi-box-arrow-up-right me-1"></i>${hl(String(v))}</a>`;
                } else {
                    v = hl(String(v));
                }
                const isWide = f.type === 'textarea' || ['description', 'comments', 'assigned_to', 'details', 'content'].includes(f.name);
                const icon = `<i class="bi bi-circle-fill" style="font-size:0.5rem;"></i>`;
                html += card(f.label, v, icon, isWide ? 'col-12' : 'col-12 col-md-6');
            });
            append(html);
        }
        if (view === 'printers') {
            let inkIds = [];
            let tonerIds = [];
            try {
                if (item.linked_inks) inkIds = JSON.parse(item.linked_inks);
                if (item.linked_toner) tonerIds = JSON.parse(item.linked_toner);
            } catch (e) { }

            if (inkIds.length > 0) {
                const inkCol = `
                    <div class="card bg-premium-info bg-opacity-10 border-info border-opacity-25 rounded-4 shadow-sm overflow-hidden animate-fade-in mt-3">
                        <div class="card-body p-3 d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center gap-3">
                                <div class="bg-info bg-opacity-25 text-info rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                                    <i class="bi bi-droplet-half fs-4"></i>
                                </div>
                                <div>
                                    <h6 class="mb-0 fw-bold text-dark">Tintas Vinculadas</h6>
                                    <p class="small text-muted mb-0">${inkIds.length} cargadores registrados</p>
                                </div>
                            </div>
                            <button class="btn btn-premium-info fw-bold rounded-pill px-4" onclick="window.showPrinterInks(${item.id})">
                                <i class="bi bi-eye me-1"></i>Ver Inventario
                            </button>
                        </div>
                    </div>`;
                append(inkCol, 'info');
            }
            if (tonerIds.length > 0) {
                const tonerCol = `
                    <div class="card bg-premium-warning bg-opacity-10 border-warning border-opacity-25 rounded-4 shadow-sm overflow-hidden animate-fade-in mt-2">
                        <div class="card-body p-3 d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center gap-3">
                                <div class="bg-warning bg-opacity-25 text-warning rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                                    <i class="bi bi-box-seam fs-4"></i>
                                </div>
                                <div>
                                    <h6 class="mb-0 fw-bold text-dark">Tóner Vinculado</h6>
                                    <p class="small text-muted mb-0">${tonerIds.length} unidades registradas</p>
                                </div>
                            </div>
                            <button class="btn btn-premium-warning text-dark fw-bold rounded-pill px-4" onclick="window.showPrinterToner(${item.id})">
                                <i class="bi bi-eye me-1"></i>Ver Inventario
                            </button>
                        </div>
                    </div>`;
                append(tonerCol, 'info');
            }
        }

        if (view === 'tutorials' && item.file_url) {
            const pdfBtn = `
                <div class="col-12 mt-3">
                    <button class="btn btn-primary btn-lg w-100 rounded-pill fw-bold shadow-sm" onclick="window.viewPdf('${item.file_url}')">
                        <i class="bi bi-file-earmark-pdf me-2"></i>Visualizar Tutorial (PDF)
                    </button>
                </div>`;
            append(pdfBtn, 'info');
        }

        if (isPhysical) {
            const toolsHtml = `
                    ${sectionHeader('Herramientas y Control de Activo', 'bi-shield-check')}
                    <div class="col-12 mt-1">
                        <div class="row g-3">
                            <div class="col-md-7">
                                <div class="card bg-premium-danger premium-danger h-100 p-4 border-0 shadow-sm d-flex flex-column justify-content-center align-items-center text-center" 
                                     onclick="window.generateResponsivaById('${view}', '${item.id}')" role="button" style="min-height:220px;">
                                    <div class="bg-danger bg-opacity-10 text-danger rounded-circle p-3 mb-3">
                                        <i class="bi bi-file-earmark-pdf fs-1"></i>
                                    </div>
                                    <h5 class="fw-bold mb-1">Generar Responsiva</h5>
                                    <p class="small text-muted mb-0">PDF legal listo para firma</p>
                                </div>
                            </div>
                            <div class="col-md-5">
                                <div class="card h-100 p-3 border-secondary border-opacity-10 shadow-sm d-flex flex-column align-items-center justify-content-center text-center">
                                    <span class="small fw-bold text-uppercase opacity-50 mb-3"><i class="bi bi-qr-code me-2"></i>QR de Activo</span>
                                    <div id="qr-code-details" class="qr-container bg-white p-2 rounded-3 border"></div>
                                    <span class="x-small text-muted mt-3">Escanea para acceso rápido</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    ${sectionHeader('Bitácora de Mantenimiento', 'bi-wrench-adjustable')}
                    <div class="col-12 mt-1 mb-4">
                        <div id="maintenance-history"></div>
                        ${state.user.role === 'admin' ? `
                            <button class="btn btn-premium-danger btn-sm rounded-pill mt-3 fw-bold px-4 w-100 py-2 shadow-sm" onclick="window.addMaintenanceEntry(${item.id}, '${view}')">
                                <i class="bi bi-plus-circle me-1"></i>Añadir Registro Manual
                            </button>
                        ` : ''}
                    </div>
                `;
            append(toolsHtml, 'tools');

            setTimeout(() => {
                if (typeof QRCode !== 'undefined') {
                    window.generateQR("qr-code-details", `ID:${item.id}|FOLIO:${item.code || 'N/A'}|TYPE:${view}`);
                }
                window.loadMaintenanceLogs(item.id, view);
            }, 100);
        }
    }

    if (elements['btn-edit-from-view']) {
        if (state.user.role === 'admin') {
            elements['btn-edit-from-view'].classList.remove('d-none');
            elements['btn-edit-from-view'].onclick = () => {
                window.toggleDrawer(false);
                ModalManager.hide('viewModal');
                setTimeout(() => window.editItem(view, id), 350);
            };
        } else {
            elements['btn-edit-from-view'].classList.add('d-none');
        }
    }

    // --- Conditional UI: Side Drawer vs Modal ---
    // User requested to use Side Drawer ONLY for the Dashboard context.
    // Everything else (Inventory, Notes section, etc.) uses standard Modals.
    const useDrawer = (state.currentView === 'dashboard');

    const drawerTitle = document.getElementById('drawer-title');
    const drawerContent = document.getElementById('drawer-content');

    if (useDrawer && drawerTitle && drawerContent) {
        drawerTitle.textContent = (elements['view-modal-title'] ? elements['view-modal-title'].textContent : 'Detalles');
        drawerContent.innerHTML = '';

        const ts = document.getElementById('view-modal-timestamps');
        if (ts) {
            const tsClone = ts.cloneNode(true);
            tsClone.className = 'd-flex gap-2 mb-4 border-bottom pb-3 overflow-auto';
            drawerContent.appendChild(tsClone);
        }

        const detailsClone = elements['view-details-content'] ? elements['view-details-content'].cloneNode(true) : null;
        if (detailsClone) {
            detailsClone.id = 'drawer-details-content';
            drawerContent.appendChild(detailsClone);
        }

        const footerActions = document.createElement('div');
        footerActions.className = 'mt-5 d-flex justify-content-center gap-2 flex-wrap';

        if (state.user.role === 'admin') {
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-premium-primary py-2 px-3 fw-bold rounded-pill shadow-sm btn-responsive-mobile';
            editBtn.innerHTML = '<i class="bi bi-pencil me-md-2"></i><span class="btn-text">Editar</span>';
            editBtn.onclick = () => {
                window.toggleDrawer(false);
                setTimeout(() => window.editItem(view, id), 350);
            };
            footerActions.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-outline-danger py-2 px-3 fw-bold rounded-pill btn-responsive-mobile';
            deleteBtn.innerHTML = '<i class="bi bi-trash me-md-2"></i><span class="btn-text">Eliminar</span>';
            deleteBtn.onclick = () => {
                window.toggleDrawer(false);
                setTimeout(() => window.deleteItem(view, id), 350);
            };
            footerActions.appendChild(deleteBtn);
        }

        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn btn-outline-secondary py-2 px-3 fw-bold rounded-pill btn-responsive-mobile';
        closeBtn.innerHTML = '<i class="bi bi-x-lg d-md-none"></i><span class="btn-text">Cerrar</span>';
        closeBtn.onclick = () => window.toggleDrawer(false);
        footerActions.appendChild(closeBtn);

        drawerContent.appendChild(footerActions);
        window.toggleDrawer(true);
    } else {
        if (elements.bsViewModal) {
            if (elements['btn-delete-from-view']) {
                if (state.user.role === 'admin') {
                    elements['btn-delete-from-view'].classList.remove('d-none');
                    elements['btn-delete-from-view'].onclick = () => {
                        ModalManager.hide('viewModal');
                        setTimeout(() => window.deleteItem(view, id), 350);
                    };
                } else {
                    elements['btn-delete-from-view'].classList.add('d-none');
                }
            }

            // Restore Back button logic for Modals
            if (elements['btn-back-to-search']) {
                if (state.modalStack.includes('searchModal')) {
                    elements['btn-back-to-search'].classList.remove('d-none');
                    elements['btn-back-to-search'].onclick = () => ModalManager.hide('viewModal');
                } else {
                    elements['btn-back-to-search'].classList.add('d-none');
                }
            }
            ModalManager.show('viewModal');
        }
    }
};

// ── Fuzzy search helper (bigram similarity, tolerates typos) ──────────────────
function fuzzyMatch(text, query) {
    if (!text || !query) return false;
    const t = String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const q = String(query).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (t.includes(q)) return true;           // exact substring = always match
    if (q.length < 3) return t.includes(q);   // short queries: exact only

    // Bigram similarity
    const bigrams = (s) => {
        const bg = new Set();
        for (let i = 0; i < s.length - 1; i++) bg.add(s[i] + s[i + 1]);
        return bg;
    };
    const tBg = bigrams(t);
    const qBg = bigrams(q);
    let common = 0;
    qBg.forEach(b => { if (tBg.has(b)) common++; });
    const similarity = (2 * common) / (tBg.size + qBg.size);
    return similarity >= 0.45;   // ~45% bigram overlap threshold
}

function fuzzyFilter(dataArray, query) {
    if (!query) return dataArray;
    return dataArray.filter(item =>
        Object.values(item).some(v => fuzzyMatch(v, query))
    );
}

function handleSearch(query) {
    const q = (query || (elements['search-input'] ? elements['search-input'].value : '')).toLowerCase().trim();
    state.highlightQuery = q; // Set the highlight query
    const currentView = state.currentView;

    // Default configuration
    let targetBodyId = 'table-body';
    let targetHeadId = 'table-head-row';
    let dataToSearch = state.allData || [];
    let searchView = currentView;

    // Special logic for views with sub-tabs
    if (currentView === 'emails') {
        const active = state.subViews['emails'];
        searchView = active;
        targetBodyId = `table-body-${active}`;
        targetHeadId = `table-head-${active}`;
        dataToSearch = state.data[active] || [];
    } else if (currentView === 'network') {
        const active = state.subViews['network'];
        searchView = active;
        targetBodyId = `table-body-${active}`;
        targetHeadId = `table-head-${active}`;
        dataToSearch = state.data[active] || [];
    } else if (currentView === 'inventory') {
        const active = state.subViews['inventory'];
        searchView = active;
        targetBodyId = `table-body-${active}`;
        targetHeadId = `table-head-${active}`;
        dataToSearch = state.data[active] || [];
    } else if (currentView === 'printers') {
        const active = state.subViews['printers'];
        searchView = active;
        targetBodyId = `table-body-${active}`;
        targetHeadId = `table-head-${active}`;
        if (active === 'printers') {
            dataToSearch = state.data.printers || [];
        } else if (active === 'inks') {
            dataToSearch = state.data.inks || [];
        } else {
            dataToSearch = state.data.toner || [];
        }
    } else if (currentView === 'licenses') {
        const active = state.subViews['licenses'];
        searchView = active;
        targetBodyId = `table-body-${active}`;
        targetHeadId = `table-head-${active}`;

        if (active === 'correos_outlook') {
            dataToSearch = state.data.correos_outlook || [];
        } else if (active === 'account_management') {
            dataToSearch = state.data.account_management || [];
        } else {
            const isCred = active === 'licenses_cred';
            dataToSearch = (state.data.licenses || []).filter(x =>
                isCred ? String(x.type).toLowerCase().includes('creden') : String(x.type).toLowerCase().includes('licenc')
            );
        }
    } else if (currentView === 'peripherals') {
        const active = state.subViews['peripherals'] || 'peripherals';
        searchView = active;
        targetBodyId = `table-body-${active}`;
        targetHeadId = `table-head-${active}`;
        dataToSearch = state.data.peripherals || [];
    } else if (currentView === 'tutorials') {
        // Tutorials use cards, not renderTable
        const filtered = fuzzyFilter(state.data.tutorials || [], q);
        renderTutorials(filtered, q); // Pass query for highlighting
        return;
    } else if (currentView === 'ftp') {
        const filtered = (state.data.ftp || []).filter(f =>
            fuzzyMatch(f.name, q) || fuzzyMatch(f.displayName, q)
        );
        renderFTPFiles(filtered, q); // Pass query for highlighting
        return;
    }

    if (!q) {
        state.highlightQuery = null; // Clear highlight query if search is empty
        renderTable(searchView, dataToSearch, targetBodyId, targetHeadId);
        return;
    }

    const filtered = fuzzyFilter(dataToSearch, q);

    renderTable(searchView, filtered, targetBodyId, targetHeadId, q); // Pass query for highlighting
}

function getFieldsForView(view) {
    const fields = {
        'inventory': [
            { name: 'hdr1', type: 'hr', label: 'Identificación del Equipo', icon: 'bi-laptop' },
            { name: 'format', label: 'Formato', type: 'select', options: ['Laptop / Notebook', 'All-in-One (AIO)', 'Desktop / PC de escritorio', 'Mini PC'], icon: 'bi-layout-text-sidebar-reverse' },
            { name: 'name', label: 'Nombre Equipo', icon: 'bi-pc-display' },
            { name: 'code', label: 'Folio', icon: 'bi-hash' },
            { name: 'serial', label: 'Serie', icon: 'bi-upc-scan' },
            { name: 'brand', label: 'Marca', icon: 'bi-award' },
            { name: 'status', label: 'Status', type: 'select', options: ['ENTREGADO', 'PENDIENTE', 'DISPONIBLE', 'BAJA', 'HEREDABLE'], icon: 'bi-activity' },

            { name: 'hdr2', type: 'hr', label: 'Asignación', icon: 'bi-person' },
            { name: 'assigned_user', label: 'Usuario', icon: 'bi-person-fill' },
            { name: 'zone', label: 'Zona', icon: 'bi-geo-alt' },
            { name: 'delivery_date', label: 'Entrega', type: 'date', icon: 'bi-calendar-check' },

            { name: 'hdr3', type: 'hr', label: 'Especificaciones Técnicas', icon: 'bi-cpu' },
            { name: 'processor', label: 'Procesador', icon: 'bi-cpu-fill' },
            { name: 'ram', label: 'RAM', icon: 'bi-memory' },
            { name: 'storage', label: 'Disco', icon: 'bi-device-hdd' },
            { name: 'os', label: 'Windows', icon: 'bi-windows' },

            { name: 'hdr4', type: 'hr', label: 'Software e Instalaciones', icon: 'bi-box-seam' },
            { name: 'has_office', label: 'Office', type: 'switch', icon: 'bi-microsoft' },
            { name: 'has_reader', label: 'Reader', type: 'switch', icon: 'bi-file-earmark-pdf' },
            { name: 'has_winrar', label: 'WinRAR', type: 'switch', icon: 'bi-file-zip' },
            { name: 'has_server', label: 'Servidor', type: 'switch', icon: 'bi-hdd-network' },
            { name: 'has_printer', label: 'Impresora', type: 'switch', icon: 'bi-printer' },

            { name: 'hdr5', type: 'hr', label: 'Notas Finales', icon: 'bi-chat-left-text' },
            { name: 'comments', label: 'Notas', type: 'textarea', icon: 'bi-journal-text' }
        ],
        'peripherals': [
            { name: 'hdr1', type: 'hr', label: 'Información del Artículo', icon: 'bi-box-seam' },
            { name: 'name', label: 'Nombre Artículo', icon: 'bi-tag-fill' },
            { name: 'brand', label: 'Marca', icon: 'bi-award' },
            { name: 'quantity', label: 'Cantidad', type: 'number', icon: 'bi-123' },
            { name: 'code', label: 'Folio', icon: 'bi-hash' },
            { name: 'status', label: 'Estado', type: 'select', options: ['Nuevo', 'Usado', 'Asignado', 'Dañado', 'Baja'], icon: 'bi-activity' },
            { name: 'hdr2', type: 'hr', label: 'Asignación y Notas', icon: 'bi-person-lines-fill' },
            { name: 'assigned_to', label: 'Asignado a', type: 'textarea', icon: 'bi-person-fill' },
            { name: 'comments', label: 'Notas', type: 'textarea', icon: 'bi-journal-text' }
        ],
        'assignments': [
            { name: 'hdr1', type: 'hr', label: 'Detalles de la Asignación', icon: 'bi-clipboard-check' },
            { name: 'employee_name', label: 'Empleado', icon: 'bi-person-badge-fill' },
            { name: 'asset_id', label: 'ID Activo', icon: 'bi-id-card' },
            { name: 'department', label: 'Departamento', icon: 'bi-building' },
            { name: 'date_assigned', label: 'Fecha', type: 'date', icon: 'bi-calendar-event' },
            { name: 'comments', label: 'Notas', type: 'textarea', icon: 'bi-journal-text' }
        ],
        'licenses': [
            { name: 'hdr1', type: 'hr', label: 'Datos del Servicio', icon: 'bi-key-fill' },
            { name: 'type', label: 'Tipo', type: 'select', options: ['Licencia', 'Credencial'], icon: 'bi-tags' },
            { name: 'name', label: 'Servicio', icon: 'bi-box-seam' },
            { name: 'status', label: 'Status', type: 'select', options: ['Activa', 'Vencida', 'Baja'], icon: 'bi-activity' },
            { name: 'hdr2', type: 'hr', label: 'Credenciales y Acceso', icon: 'bi-lock-fill' },
            { name: 'key_value', label: 'Usuario/Key', icon: 'bi-person-badge' },
            { name: 'password', label: 'Password', icon: 'bi-lock' },
            { name: 'link', label: 'Link Acceso', icon: 'bi-link-45deg' },
            { name: 'expiration_date', label: 'Vencimiento', type: 'date', icon: 'bi-calendar-x' },
            { name: 'comments', label: 'Notas', type: 'textarea', icon: 'bi-journal-text' }
        ],
        'printers': [
            { name: 'hdr1', type: 'hr', label: 'Información de la Impresora', icon: 'bi-printer-fill' },
            { name: 'name', label: 'Nombre Impresora', icon: 'bi-tag' },
            { name: 'brand', label: 'Marca', icon: 'bi-award' },
            { name: 'model', label: 'Modelo', icon: 'bi-cpu' },
            { name: 'code', label: 'Código/Folio', icon: 'bi-hash' },
            { name: 'serial', label: 'Serie', icon: 'bi-upc-scan' },
            { name: 'status', label: 'Estado', type: 'select', options: ['Activo', 'En Reparación', 'Baja'], icon: 'bi-activity' },
            { name: 'hdr2', type: 'hr', label: 'Conectividad y Ubicación', icon: 'bi-broadcast-pin' },
            { name: 'zone', label: 'Área/Ubicación', icon: 'bi-geo-alt' },
            { name: 'is_network', label: '¿Es conexión por IP?', type: 'switch', icon: 'bi-globe' },
            { name: 'ip_address', label: 'Dirección IP', icon: 'bi-hdd-network' },
            { name: 'hdr3', type: 'hr', label: 'Insumos y Carga', icon: 'bi-droplet-half' },
            { name: 'supply_type', label: '¿Qué utiliza?', type: 'select', options: ['Seleccionar...', 'Tinta', 'Tóner'], icon: 'bi-basket2' },
            { name: 'ink_type', label: 'Modelo de Carga', icon: 'bi-palette' },
            { name: 'assigned_to', label: 'Asignado a', type: 'textarea', icon: 'bi-person-hearts' },
            { name: 'comments', label: 'Notas', type: 'textarea', icon: 'bi-journal-text' }
        ],
        'inks': [
            { name: 'hdr1', type: 'hr', label: 'Detalles del Cartucho/Bote', icon: 'bi-droplet' },
            { name: 'brand', label: 'Marca', icon: 'bi-award' }, { name: 'model', label: 'Modelo', icon: 'bi-tag' }, { name: 'color', label: 'Color', icon: 'bi-palette' },
            { name: 'type', label: 'Tipo', icon: 'bi-box' }, { name: 'capacity', label: 'Capacidad', icon: 'bi-moisture' }, { name: 'quantity', label: 'Cantidad', type: 'number', icon: 'bi-123' },
            { name: 'hdr2', type: 'hr', label: 'Vigencia y Estado', icon: 'bi-calendar-check' },
            { name: 'purchase_date', label: 'Fecha Compra', type: 'date', icon: 'bi-cart-check' }, { name: 'expiry_date', label: 'Fecha Caducidad', type: 'date', icon: 'bi-calendar-x' },
            { name: 'status', label: 'Estado', type: 'select', options: ['Disponible', 'Stock bajo', 'Agotado'], icon: 'bi-activity' },
            { name: 'comments', label: 'Observaciones', type: 'textarea', icon: 'bi-journal-text' }
        ],
        'toner': [
            { name: 'hdr1', type: 'hr', label: 'Información del Tóner', icon: 'bi-box-seam' },
            { name: 'brand', label: 'Marca', icon: 'bi-award' },
            { name: 'model', label: 'Modelo', icon: 'bi-tag' },
            { name: 'quantity', label: 'Cantidad', type: 'number', icon: 'bi-123' },
            { name: 'status', label: 'Estado', type: 'select', options: ['NUEVO', 'USADO'], icon: 'bi-activity' },
            { name: 'comentarios', label: 'Comentarios', type: 'textarea', icon: 'bi-journal-text' }
        ],
        'network': [
            { name: 'hdr1', type: 'hr', label: 'Información del Dispositivo', icon: 'bi-router' },
            { name: 'device_name', label: 'Nombre', icon: 'bi-tag' }, { name: 'device_type', label: 'Tipo', icon: 'bi-cpu' },
            { name: 'ip_address', label: 'IP', icon: 'bi-hdd-network' }, { name: 'location', label: 'Área', icon: 'bi-geo-alt' },
            { name: 'mac_address', label: 'MAC', icon: 'bi-ethernet' }, { name: 'comments', label: 'Notas', type: 'textarea', icon: 'bi-journal-text' }
        ],
        'enterprise_networks': [
            { name: 'hdr1', type: 'hr', label: 'Acceso a Red', icon: 'bi-wifi' },
            { name: 'ssid', label: 'Red (SSID)', icon: 'bi-broadcast' }, { name: 'password', label: 'Contraseña', icon: 'bi-lock' },
            { name: 'location', label: 'Ubicación', icon: 'bi-geo' }, { name: 'details', label: 'Detalles/Teléfono', type: 'textarea', icon: 'bi-telephone' },
            { name: 'comments', label: 'Notas', type: 'textarea', icon: 'bi-journal-text' }
        ],
        'users': [
            { name: 'hdr1', type: 'hr', label: 'Datos del Usuario', icon: 'bi-person-circle' },
            { name: 'full_name', label: 'Nombre', icon: 'bi-person' }, { name: 'username', label: 'Usuario', icon: 'bi-person-badge' },
            { name: 'password', label: 'Pass', type: 'password', icon: 'bi-lock' }, { name: 'role', label: 'Rol', type: 'select', options: ['admin', 'consulta'], icon: 'bi-shield-lock' },
            { name: 'comments', label: 'Notas', type: 'textarea', icon: 'bi-journal-text' }
        ],
        'emails': [
            { name: 'original_name', label: 'Persona Original' },
            { name: 'original_email', label: 'Correo', type: 'email' },
            { name: 'backup_name', label: 'Respaldo Persona' },
            { name: 'backup_email', label: 'Correo Respaldo', type: 'email' },
            { name: 'start_date', label: 'Inicio', type: 'date' },
            { name: 'end_date', label: 'Vencimiento', type: 'date' },
            { name: 'is_done', label: 'Hecho', type: 'switch' },
            { name: 'is_archived', label: 'Deshecho', type: 'switch' },
            { name: 'comments', label: 'Notas', type: 'textarea' }
        ],
        'office_emails': [{ name: 'email', label: 'Correo Office', type: 'email' }, { name: 'password', label: 'Password' }, { name: 'status', label: 'Estado', type: 'select', options: ['ACTIVA', 'PERDIDA', 'SUSPENDIDA'] }, { name: 'activation_date', label: 'Activación', type: 'date' }, { name: 'renewal_date', label: 'Renovación', type: 'date' }, { name: 'comments', label: 'Notas', type: 'textarea' }],
        'microsoft_emails': [
            { name: 'email', label: 'Correo Office 365', type: 'email' },
            { name: 'password', label: 'Contraseña' },
            { name: 'status', label: 'Estado', type: 'select', options: ['ACTIVA', 'PERDIDA', 'SUSPENDIDA'] },
            { name: 'activation_date', label: 'Fecha de Activación', type: 'date' },
            { name: 'renewal_date', label: 'Fecha de Renovación', type: 'date' },
            { name: 'admin_url', label: 'URL Administración' },
            { name: 'admin_account', label: 'Cuenta Administrador' },
            { name: 'comments', label: 'Notas', type: 'textarea' }
        ],
        'cellphones': [
            { name: 'hdr1', type: 'hr', label: 'Identificación y Asignación', icon: 'bi-phone' },
            { name: 'employee', label: 'Empleado', icon: 'bi-person-fill' },
            { name: 'model', label: 'Modelo / Nombre Equipo', icon: 'bi-device-ssd' },
            { name: 'area', label: 'Área', icon: 'bi-building' },
            { name: 'phone_number', label: 'Número de Teléfono', icon: 'bi-telephone-fill' },

            { name: 'hdr2', type: 'hr', label: 'Cuentas y Seguridad', icon: 'bi-shield-lock' },
            { name: 'email', label: 'Correo Electrónico', type: 'email', icon: 'bi-envelope-fill' },
            { name: 'recovery_account', label: 'Cuenta de Recuperación', icon: 'bi-envelope-heart' },
            { name: 'password', label: 'Contraseña', icon: 'bi-lock-fill' },
            { name: 'updated_password', label: 'Contraseña Actualizada', icon: 'bi-key' },
            { name: 'birth_date', label: 'Fecha de Nacimiento', icon: 'bi-calendar-event' },

            { name: 'hdr3', type: 'hr', label: 'Bloqueo de Aplicaciones', icon: 'bi-app-indicator' },
            { name: 'has_app_lock', label: '¿App Lock?', type: 'switch', icon: 'bi-lock' },
            { name: 'app_lock_pattern', label: 'Patrón de Bloqueo', type: 'pattern', icon: 'bi-grid-3x3-gap' },
            { name: 'app_lock_password', label: 'Pass Bloqueo Apps (Texto)', icon: 'bi-alphabet-uppercase' },
            { name: 'app_lock_answer', label: 'Respuesta Seguridad', type: 'textarea', icon: 'bi-patch-question' },
            { name: 'comments', label: 'Comentarios', type: 'textarea', icon: 'bi-journal-text' }
        ],
        'tutorials': [{ name: 'title', label: 'Título' }, { name: 'description', label: 'Descripción', type: 'textarea' }, { name: 'pdf_file', label: 'Archivo PDF', type: 'file' }, { name: 'comments', label: 'Notas', type: 'textarea' }],
        'account_management': [
            { name: 'email', label: 'Correo / Cuenta', type: 'email' },
            { name: 'account_type', label: 'Tipo de Cuenta', type: 'select', options: ['Microsoft 365', 'Gmail', 'Hospedaje', 'Personal'] },
            { name: 'assigned_to', label: 'Responsable / Asignado' },
            { name: 'status', label: 'Estatus', type: 'select', options: ['Activo', 'Suspendido', 'Baja'] },
            { name: 'password', label: 'Password' },
            { name: 'comments', label: 'Comentarios / Notas', type: 'textarea' }
        ],
        'correos_outlook': [
            { name: 'correo', label: 'Correo', type: 'email' },
            { name: 'contraseña', label: 'Contraseña' },
            { name: 'estatus', label: 'Estado', type: 'select', options: ['ACTIVA', 'BAJA'] },
            { name: 'hr1', type: 'hr', label: 'Servidor de Entrada' },
            { name: 'servidor_entrada', label: 'Nombre del Servidor', placeholder: 'mail.totalground.com' },
            { name: 'puerto_entrada', label: 'Puerto', placeholder: '995' },
            { name: 'ssl_entrada', label: 'Cifrado de SSL/TLS', type: 'switch' },
            { name: 'hr2', type: 'hr', label: 'Servidor de Salida' },
            { name: 'servidor_salida', label: 'Nombre del Servidor', placeholder: 'mail.totalground.com' },
            { name: 'puerto_salida', label: 'Puerto', placeholder: '465' },
            { name: 'cifrado_salida', label: 'Método de Cifrado', type: 'select', options: ['SSL/TLS', 'STARTTLS', 'Autom.'] },
            { name: 'comentarios', label: 'Comentarios', type: 'textarea' }
        ],
        'notes': [
            { name: 'title', label: 'Título de la Nota', placeholder: 'Ej: Recordatorio mantenimiento' },
            { name: 'content', label: 'Contenido / Detalle', type: 'textarea', placeholder: 'Escribe aquí los detalles...' }
        ]
    };

    if (view === 'licenses_cred') {
        return fields['licenses'].filter(f => f.name !== 'expiration_date');
    }
    return fields[view] || [];
}

// --- Pattern Locker Logic ---
let patternState = {
    nodes: [],
    targetId: null
};

window.launchPatternSelector = (targetId) => {
    console.log("Launching pattern selector for:", targetId);
    patternState.targetId = targetId;
    patternState.nodes = [];

    // Clear previous UI state
    const dots = document.querySelectorAll('.pattern-dot');
    console.log("Found pattern dots:", dots.length);
    dots.forEach(dot => {
        dot.classList.remove('active');
        // Force display check
        if (getComputedStyle(dot).display === 'none') {
            console.warn("Dot is hidden by CSS!", dot.dataset.index);
        }
    });

    const canvas = document.getElementById('pattern-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    ModalManager.show('patternModal');

    // Setup listeners if first time
    if (!window.patternListenersActive) {
        dots.forEach(dot => {
            dot.onclick = () => {
                const idx = dot.dataset.index;
                if (!patternState.nodes.includes(idx)) {
                    patternState.nodes.push(idx);
                    dot.classList.add('active');
                    drawPattern();
                }
            };
        });
        window.patternListenersActive = true;
    }

    // Forced reflow
    setTimeout(() => {
        const modalEl = document.getElementById('patternModal');
        if (modalEl) modalEl.style.display = 'block';
        console.log("Forced reflow on pattern modal");
    }, 100);
};

function drawPattern() {
    const canvas = document.getElementById('pattern-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (patternState.nodes.length < 1) return;

    ctx.beginPath();
    ctx.strokeStyle = '#ff0000'; // Pure bright red
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Add glow effect for "Premium" look and visibility
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff0000';

    patternState.nodes.forEach((nodeIdx, i) => {
        const dot = document.querySelector(`.pattern-dot[data-index="${nodeIdx}"]`);
        if (!dot) return;

        // Use offset coordinates relative to the pattern-grid/container
        const x = dot.offsetLeft + (dot.offsetWidth / 2);
        const y = dot.offsetTop + (dot.offsetHeight / 2);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();
    ctx.shadowBlur = 0; // Reset glow
}

window.resetPattern = () => {
    patternState.nodes = [];
    document.querySelectorAll('.pattern-dot').forEach(dot => dot.classList.remove('active'));
    const canvas = document.getElementById('pattern-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

window.savePattern = () => {
    if (patternState.nodes.length === 0) {
        showToast('Advertencia', 'Por favor dibuja un patrón primero', 'warning');
        return;
    }

    const patternStr = patternState.nodes.join('-');
    const input = document.getElementById(patternState.targetId);
    if (input) {
        input.value = patternStr;
        const preview = document.getElementById(`${patternState.targetId}-preview`);
        if (preview) preview.textContent = 'âœ“ Configurado';
        const btn = document.getElementById(`btn-pattern-app_lock_pattern`);
        if (btn) btn.textContent = 'Cambiar Patrón';
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById('patternModal'));
    modal.hide();
    showToast('Éxito', 'Patrón guardado correctamente', 'success');
};

window.viewPdf = (url) => {
    if (elements['pdf-frame']) {
        elements['pdf-frame'].src = url;
        // Trigger a tiny delay to ensure the iframe starts loading before showing modal
        setTimeout(() => {
            ModalManager.show('pdfModal');
        }, 50);
    }
};

window.toggleFullScreenPdf = () => {
    const frame = document.getElementById('pdf-frame');
    if (!frame) return;
    try {
        if (frame.requestFullscreen) {
            frame.requestFullscreen();
        } else if (frame.webkitRequestFullscreen) {
            frame.webkitRequestFullscreen();
        } else if (frame.msRequestFullscreen) {
            frame.msRequestFullscreen();
        }
    } catch (e) {
        console.error("Fullscreen error", e);
        showToast('Info', 'No se pudo activar pantalla completa en este navegador', 'info');
    }
};

window.handleSupport = async (type) => {
    if (elements.bsSupportModal) elements.bsSupportModal.show();
};

// --- FTP Functions ---

async function renderFTPFiles(filesList = null, highlightQuery = null) {
    const tbody = document.getElementById('ftp-files-list');
    if (!tbody) return;

    // --- Drag & Drop Support ---
    const dropArea = tbody.closest('.card') || tbody;
    if (dropArea && !dropArea.dataset.dragInit) {
        dropArea.dataset.dragInit = 'true';
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, (e) => {
                e.preventDefault(); e.stopPropagation();
            }, false);
        });
        dropArea.addEventListener('dragover', () => { if (dropArea.classList) dropArea.classList.add('premium-drag-over'); });
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => { if (dropArea.classList) dropArea.classList.remove('premium-drag-over'); });
        });
        dropArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const fInput = document.getElementById('file-input');
                if (fInput) {
                    const dt = new DataTransfer();
                    dt.items.add(files[0]);
                    fInput.files = dt.files;
                    if (typeof openUploadModal === 'function') openUploadModal();
                }
            }
        });
    }

    let files = filesList;

    if (!files) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center p-4"><div class="spinner-border spinner-border-sm text-primary"></div> Cargando archivos...</td></tr>';
        try {
            const response = await fetch(`${CONFIG.apiUrl}/ftp.php`);
            if (!response.ok) throw new Error('Error al cargar archivos');
            files = await response.json();
            state.data.ftp = files;
            state.allData = files;
        } catch (err) {
            console.error('Error loading FTP files:', err);
            tbody.innerHTML = '<tr><td colspan="4" class="text-center p-4 text-danger">Error al cargar archivos</td></tr>';
            return;
        }
    }

    if (files.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center p-5 text-muted">No hay archivos en el directorio FTP</td></tr>';
        return;
    }

    const highlightText = (text, query) => {
        if (!query || !text || typeof text !== 'string') return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark class="bg-warning text-dark rounded px-1">$1</mark>');
    };

    tbody.innerHTML = files.map(file => {
        const icon = getFileIcon(file.name);
        const displayName = file.displayName || file.name;
        const hasCustomName = file.displayName && file.displayName !== file.name;

        return `
                <tr class="hover-bg-light">
                    <td>
                        <div class="d-flex align-items-center">
                            <i class="bi ${icon} me-2 fs-5 text-primary"></i>
                            <div>
                                <div class="fw-bold">${highlightText(displayName, highlightQuery)}</div>
                                ${hasCustomName ? `<small class="text-muted"><i class="bi bi-file-earmark me-1"></i>${highlightText(file.name, highlightQuery)}</small>` : ''}
                                ${file.comments ? `<div class="small text-muted mt-1 italic"><i>Note: ${highlightText(file.comments, highlightQuery)}</i></div>` : ''}
                            </div>
                        </div>
                    </td>
                    <td>${highlightText(formatFileSize(file.size), highlightQuery)}</td>
                    <td>${highlightText(file.date, highlightQuery)}</td>
                    <td class="text-end">
                        <div class="d-flex gap-2 justify-content-end">
                            <a href="${file.url}" download class="btn btn-sm btn-outline-success">
                                <i class="bi bi-download me-1"></i>Descargar
                            </a>
                            ${state.user.role === 'admin' ? `
                                <button class="btn btn-sm btn-outline-info" onclick="editFileName('${file.name.replace(/'/g, "\\'")}', '${displayName.replace(/'/g, "\\'")}', '${(file.comments || '').replace(/'/g, "\\'")}')" title="Editar detalles">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteFTPFile('${file.name.replace(/'/g, "\\'")}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
    }).join('');
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        'pdf': 'bi-file-earmark-pdf-fill',
        'doc': 'bi-file-earmark-word-fill',
        'docx': 'bi-file-earmark-word-fill',
        'xls': 'bi-file-earmark-excel-fill',
        'xlsx': 'bi-file-earmark-excel-fill',
        'ppt': 'bi-file-earmark-ppt-fill',
        'pptx': 'bi-file-earmark-ppt-fill',
        'zip': 'bi-file-earmark-zip-fill',
        'rar': 'bi-file-earmark-zip-fill',
        'jpg': 'bi-file-earmark-image-fill',
        'jpeg': 'bi-file-earmark-image-fill',
        'png': 'bi-file-earmark-image-fill',
        'gif': 'bi-file-earmark-image-fill',
        'txt': 'bi-file-earmark-text-fill',
        'mp4': 'bi-file-earmark-play-fill',
        'avi': 'bi-file-earmark-play-fill',
        'mp3': 'bi-file-earmark-music-fill'
    };
    return icons[ext] || 'bi-file-earmark-fill';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function openUploadModal() {
    const uploadModal = document.getElementById('uploadModal');
    if (uploadModal) {
        const bsUploadModal = new bootstrap.Modal(uploadModal);
        bsUploadModal.show();

        // Setup form handler
        const form = document.getElementById('upload-form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                await handleFileUpload(e);
                bsUploadModal.hide();
            };
        }
    }
}

async function handleFileUpload(e) {
    const btn = document.getElementById('btn-upload');
    if (!btn) return;

    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Subiendo...';
    btn.disabled = true;

    try {
        const formData = new FormData(e.target);
        const response = await fetch(`${CONFIG.apiUrl}/ftp.php`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Error al subir archivo');

        const result = await response.json();

        if (result.success) {
            // Refresh file list
            await renderFTPFiles();

            // Reset form
            e.target.reset();

            // Show success message
            showToast('Éxito', 'Archivo subido exitosamente', 'success');
        } else {
            throw new Error(result.message || 'Error al subir archivo');
        }
    } catch (err) {
        console.error('Upload error:', err);
        showToast('Error', 'Error al subir archivo: ' + err.message, 'danger');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function deleteFTPFile(filename) {
    // Create a custom confirmation modal
    const deleteModal = document.createElement('div');
    deleteModal.className = 'modal fade';
    deleteModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg">
                <div class="modal-body p-5 text-center">
                    <div class="mb-4">
                        <div class="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                            <i class="bi bi-trash text-danger" style="font-size: 2.5rem;"></i>
                        </div>
                    </div>
                    <h4 class="fw-bold mb-3">¿Eliminar archivo?</h4>
                    <p class="text-muted mb-1">Estás a punto de eliminar:</p>
                    <p class="fw-bold text-dark mb-4"><i class="bi bi-file-earmark me-2"></i>${filename}</p>
                    <p class="text-muted small">Esta acción no se puede deshacer.</p>
                    <div class="d-flex gap-3 justify-content-center mt-4">
                        <button type="button" class="btn btn-light px-4 fw-bold" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-danger px-4 fw-bold" id="confirm-delete-ftp">
                            <i class="bi bi-trash me-2"></i>Sí, Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(deleteModal);
    const bsModal = new bootstrap.Modal(deleteModal);
    bsModal.show();

    // Handle confirmation
    document.getElementById('confirm-delete-ftp').onclick = async () => {
        bsModal.hide();

        try {
            const response = await fetch(`${CONFIG.apiUrl}/ftp.php?file=${encodeURIComponent(filename)}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Error al eliminar archivo');

            const result = await response.json();

            if (result.success) {
                await renderFTPFiles();
                showToast('Éxito', 'Archivo eliminado exitosamente', 'success');
            } else {
                throw new Error(result.message || 'Error al eliminar archivo');
            }
        } catch (err) {
            console.error('Delete error:', err);
            showToast('Error', 'Error al eliminar archivo: ' + err.message, 'danger');
        } finally {
            // Clean up modal
            deleteModal.addEventListener('hidden.bs.modal', () => {
                deleteModal.remove();
            });
        }
    };

    // Clean up on cancel
    deleteModal.addEventListener('hidden.bs.modal', () => {
        deleteModal.remove();
    });
}

// Toast notification function
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();

    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

// Edit file name (alias)
async function editFileName(filename, currentDisplayName, currentComments) {
    // Create edit modal
    const editModal = document.createElement('div');
    editModal.className = 'modal fade';
    editModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-primary text-white py-3">
                    <h5 class="modal-title fw-bold">Editar Nombre del Archivo</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="form-label small fw-bold text-muted">Archivo original:</label>
                        <div class="p-2 bg-light rounded">
                            <i class="bi bi-file-earmark me-2"></i>
                            <code>${filename}</code>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Nombre personalizado:</label>
                        <input type="text" class="form-control" id="edit-display-name" value="${currentDisplayName}" placeholder="Ingresa un nombre más descriptivo">
                        <div class="form-text">Este nombre se mostrará en lugar del nombre original</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Notas/Comentarios:</label>
                        <textarea class="form-control" id="edit-comments" rows="3" placeholder="Agrega notas sobre este archivo...">${currentComments || ''}</textarea>
                    </div>
                </div>
                <div class="modal-footer bg-light p-3">
                    <button type="button" class="btn btn-secondary px-4 fw-bold" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary px-4 fw-bold" id="btn-save-name">
                        <i class="bi bi-check-lg me-2"></i>Guardar Detalles
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(editModal);
    const bsModal = new bootstrap.Modal(editModal);
    bsModal.show();

    // Focus on input
    editModal.addEventListener('shown.bs.modal', () => {
        const input = document.getElementById('edit-display-name');
        if (input) {
            input.focus();
            input.select();
        }
    });

    // Handle save
    document.getElementById('btn-save-name').onclick = async () => {
        const newDisplayName = document.getElementById('edit-display-name').value.trim();

        if (!newDisplayName) {
            showToast('Por favor ingresa un nombre', 'danger');
            return;
        }

        bsModal.hide();

        try {
            const response = await fetch(`${CONFIG.apiUrl}/ftp.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: filename,
                    displayName: document.getElementById('edit-display-name').value.trim(),
                    comments: document.getElementById('edit-comments').value.trim()
                })
            });

            if (!response.ok) throw new Error('Error al actualizar nombre');

            const result = await response.json();

            if (result.success) {
                await renderFTPFiles();
                showToast('Nombre actualizado exitosamente', 'success');
            } else {
                throw new Error(result.message || 'Error al actualizar nombre');
            }
        } catch (err) {
            console.error('Edit name error:', err);
            showToast('Error al actualizar nombre: ' + err.message, 'danger');
        } finally {
            editModal.addEventListener('hidden.bs.modal', () => {
                editModal.remove();
            });
        }
    };

    // Clean up on cancel
    editModal.addEventListener('hidden.bs.modal', () => {
        editModal.remove();
    });
}

async function exportToExcel(viewName = null) {
    const view = viewName || state.currentView;
    const dataKey = (view === 'licenses_cred') ? 'licenses' : view;
    let data = state.data[dataKey] || [];

    // Filtering logic to match visible data
    if (view === 'licenses_cred') data = data.filter(x => String(x.type).toLowerCase().includes('creden'));
    if (view === 'licenses') data = data.filter(x => String(x.type).toLowerCase().includes('licenc'));
    if (view === 'printers') data = state.data.printers || [];
    if (view === 'inventory') data = state.data.inventory || [];
    if (view === 'peripherals') data = state.data.peripherals || [];

    if (data.length === 0) {
        showToast('No hay datos para exportar', 'warning');
        return;
    }

    const toast = showToast('Generando reporte premium...', 'info');

    try {
        const Excel = window.ExcelJS;
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet(view.toUpperCase());

        // 1. Add Logo (TG Logo)
        try {
            const response = await fetch('images/02-TG-Logo.png');
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const imageId = workbook.addImage({
                buffer: arrayBuffer,
                extension: 'png',
            });
            worksheet.addImage(imageId, {
                tl: { col: 0, row: 0 },
                ext: { width: 180, height: 45 }
            });
        } catch (e) { console.error("Logo not found for Excel", e); }

        // 2. Main Red Header Title
        const labels = {
            'emails': 'RELACIÓN DE CORREOS REENVIADOS', 'office_emails': 'RELACIÓN DE CORREOS WINDOWS',
            'microsoft_emails': 'RELACIÓN DE CUENTAS OFFICE 365', 'network': 'INVENTARIO DE DISPOSITIVOS DE RED',
            'enterprise_networks': 'RELACIÓN DE REDES EMPRESARIALES', 'licenses': 'CONTROL DE LICENCIAS DE SOFTWARE',
            'licenses_cred': 'RELACIÓN DE CREDENCIALES DE ACCESO', 'printers': 'INVENTARIO DE IMPRESORAS',
            'inks': 'INVENTARIO DE TINTAS Y TÓNERS', 'inventory': 'RELACIÓN DE EQUIPOS DE CÓMPUTO',
            'cellphones': 'RELACIÓN DE EQUIPOS CELULARES'
        };

        const fields = getFieldsForView(view);
        const colCount = fields.length;

        // Space for logo
        worksheet.addRow([]);
        worksheet.addRow([]);

        // Main Title Row
        const titleRow = worksheet.addRow([labels[view] || `REPORTE DE ${view.toUpperCase()}`]);
        titleRow.font = { name: 'Segoe UI', family: 4, size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
        titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.mergeCells(titleRow.number, 1, titleRow.number, colCount);

        // Red background for title
        titleRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFCC0000' } // Engineering Red
            };
        });

        worksheet.addRow([]); // Gap

        // 3. Table Headers
        const headerRow = worksheet.addRow(fields.map(f => f.label.toUpperCase()));
        headerRow.font = { name: 'Segoe UI', bold: true, color: { argb: 'FF333333' } };
        headerRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
            cell.border = {
                top: { style: 'thin' }, left: { style: 'thin' },
                bottom: { style: 'medium' }, right: { style: 'thin' }
            };
            cell.alignment = { horizontal: 'center' };
        });

        // 4. Add Data Rows
        data.forEach(item => {
            const rowValues = fields.map(f => {
                let val = item[f.name] ?? '';
                if (f.type === 'checkbox') return val == 1 ? 'SÍ' : 'NO';
                return val;
            });
            const row = worksheet.addRow(rowValues);
            row.font = { name: 'Segoe UI', size: 10 };
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                };
                cell.alignment = { vertical: 'middle' };
            });
        });

        // Adjust Column Widths
        worksheet.columns.forEach((col, i) => {
            let maxLen = 15;
            if (fields[i]) maxLen = Math.max(maxLen, fields[i].label.length + 5);
            col.width = maxLen;
        });

        // Generate and Download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${view}_reporte_totalground_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Reporte generado exitosamente', 'success');

    } catch (err) {
        console.error("Excel generation error", err);
        showToast('Error al generar Excel: ' + err.message, 'danger');
    }
}

window.exportToCSV = exportToExcel;
window.exportTable = exportToExcel;
window.editFileName = editFileName;
window.deleteFTPFile = deleteFTPFile;

function updatePrinterSupplyInputs(type, count, existingIds = []) {
    const containerId = type === 'ink' ? 'ink-selection-container' : 'toner-selection-container';
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const items = type === 'ink' ? (state.data.inks || []) : (state.data.toner || []);

    for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        div.className = 'col-md-6 mb-2';

        const itemLabel = type === 'ink' ? 'Tinta' : 'Tóner';
        let optionsHtml = `<option value="">Seleccionar ${itemLabel}...</option>`;
        items.forEach(item => {
            const label = type === 'ink' ? `${item.brand} ${item.type} (${item.color})` : `${item.brand} ${item.model}`;
            optionsHtml += `<option value="${item.id}" ${existingIds[i] == item.id ? 'selected' : ''}>${label}</option>`;
        });

        const pickerClass = type === 'ink' ? 'ink-link-picker' : 'toner-link-picker';

        div.innerHTML = `
            <label class="small text-muted fw-bold d-block mb-1">${itemLabel} #${i + 1}</label>
            <select class="form-select form-select-sm ${pickerClass}" data-index="${i}">
                ${optionsHtml}
            </select>
        `;
        container.appendChild(div);
    }
}


window.showPrinterInks = async (printerId) => {
    if ((state.data.inks || []).length === 0) {
        await fetchData('inks');
    }
    const printer = (state.data.printers || []).find(p => p.id == printerId);
    if (!printer || !printer.linked_inks) return;

    let inkIds = [];
    try { inkIds = JSON.parse(printer.linked_inks); } catch (e) { return; }

    const linkedInks = (state.data.inks || []).filter(ink => inkIds.includes(String(ink.id)));

    state.activePrinterId = printerId;
    if (elements['inventory-modal-title']) elements['inventory-modal-title'].textContent = `Tintas: ${printer.name}`;
    if (elements['btn-edit-from-view']) elements['btn-edit-from-view'].classList.add('d-none');

    if (elements['inventory-modal-content']) {
        elements['inventory-modal-content'].innerHTML = `
            <div class="col-12 p-2 animate-fade-in">
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th class="small fw-bold py-3 px-4">Marca / Modelo</th>
                                    <th class="small fw-bold">Tipo</th>
                                    <th class="small fw-bold">Color</th>
                                    <th class="small fw-bold">Cant.</th>
                                    <th class="small fw-bold">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${linkedInks.map(ink => `
                                    <tr>
                                        <td class="px-4 py-3">
                                            <div class="fw-bold text-dark">${ink.brand}</div>
                                            <div class="x-small text-muted">${ink.model}</div>
                                        </td>
                                        <td>
                                            <span class="badge bg-dark text-white px-2 py-1" style="font-family: monospace;">${ink.type}</span>
                                        </td>
                                        <td>
                                            ${(() => {
                const c = String(ink.color).toLowerCase();
                let style = 'background-color: #f8f9fa; color: #333; border: 1px solid #ddd;';
                if (c.includes('cyan')) style = 'background-color: #00cef3; color: white;';
                else if (c.includes('magenta')) style = 'background-color: #e3007e; color: white;';
                else if (c.includes('yellow') || c.includes('amarillo')) style = 'background-color: #ffef00; color: #333;';
                else if (c.includes('black') || c.includes('negro')) style = 'background-color: #000; color: white;';
                return `<span class="badge px-3 py-1 shadow-sm" style="${style}">${ink.color}</span>`;
            })()}
                                        </td>
                                        <td>
                                            <div class="d-flex align-items-center gap-2">
                                                <button class="btn btn-sm btn-outline-danger p-0 rounded-circle d-flex align-items-center justify-content-center" style="width: 28px; height: 28px; transition: all 0.2s;" 
                                                    onclick="event.stopPropagation(); window.updateInkQuantity(${ink.id}, -1)">
                                                    <i class="bi bi-dash"></i>
                                                </button>
                                                <div class="fw-bold fs-5 px-2 ${ink.quantity <= 1 ? 'text-danger' : 'text-primary'}" style="min-width: 30px; text-align: center;">
                                                    ${ink.quantity}
                                                </div>
                                                <button class="btn btn-sm btn-outline-success p-0 rounded-circle d-flex align-items-center justify-content-center" style="width: 28px; height: 28px; transition: all 0.2s;" 
                                                    onclick="event.stopPropagation(); window.updateInkQuantity(${ink.id}, 1)">
                                                    <i class="bi bi-plus"></i>
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            ${(() => {
                const qty = parseInt(ink.quantity) || 0;
                let stLabel = 'Disponible';
                let stClass = 'bg-success text-white';
                if (qty <= 0) { stLabel = 'Agotado'; stClass = 'bg-danger text-white'; }
                else if (qty === 1) { stLabel = 'Stock bajo'; stClass = 'bg-warning text-dark'; }
                return `<span class="badge ${stClass} px-3 py-1 fw-bold shadow-sm">${stLabel}</span>`;
            })()}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="mt-4 p-3 bg-secondary bg-opacity-10 rounded-4 text-center">
                    <p class="small text-muted mb-0"><i class="bi bi-info-circle me-2"></i>Esta tabla muestra únicamente los insumos vinculados a este dispositivo.</p>
                </div>
            </div>
        `;
    }
    if (elements.bsInventoryModal) ModalManager.show('inventoryModal');
};

window.showPrinterToner = async (printerId) => {
    if ((state.data.toner || []).length === 0) {
        await fetchData('toner');
    }
    const printer = (state.data.printers || []).find(p => p.id == printerId);
    if (!printer || !printer.linked_toner) return;

    let tonerIds = [];
    try { tonerIds = JSON.parse(printer.linked_toner); } catch (e) { return; }

    const linkedToner = (state.data.toner || []).filter(t => tonerIds.includes(String(t.id)));

    state.activePrinterId = printerId;
    if (elements['inventory-modal-title']) elements['inventory-modal-title'].textContent = `Tóner: ${printer.name}`;
    if (elements['btn-edit-from-view']) elements['btn-edit-from-view'].classList.add('d-none');

    if (elements['inventory-modal-content']) {
        elements['inventory-modal-content'].innerHTML = `
            <div class="col-12 p-2 animate-fade-in">
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th class="small fw-bold py-3 px-4">Marca / Modelo</th>
                                    <th class="small fw-bold">Cant.</th>
                                    <th class="small fw-bold">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${linkedToner.map(t => `
                                    <tr>
                                        <td class="px-4 py-3">
                                            <div class="fw-bold text-dark">${t.brand}</div>
                                            <div class="x-small text-muted">${t.model}</div>
                                        </td>
                                        <td>
                                            <div class="d-flex align-items-center gap-2">
                                                <button class="btn btn-sm btn-outline-danger p-0 rounded-circle d-flex align-items-center justify-content-center" style="width: 28px; height: 28px; transition: all 0.2s;" 
                                                    onclick="event.stopPropagation(); window.updateTonerQuantity(${t.id}, -1)">
                                                    <i class="bi bi-dash"></i>
                                                </button>
                                                <div class="fw-bold fs-5 px-2 ${t.quantity <= 1 ? 'text-danger' : 'text-primary'}" style="min-width: 30px; text-align: center;">
                                                    ${t.quantity}
                                                </div>
                                                <button class="btn btn-sm btn-outline-success p-0 rounded-circle d-flex align-items-center justify-content-center" style="width: 28px; height: 28px; transition: all 0.2s;" 
                                                    onclick="event.stopPropagation(); window.updateTonerQuantity(${t.id}, 1)">
                                                    <i class="bi bi-plus"></i>
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            ${(() => {
                const qty = parseInt(t.quantity) || 0;
                let stLabel = 'Disponible';
                let stClass = 'bg-success text-white';
                if (qty <= 0) { stLabel = 'Agotado'; stClass = 'bg-danger text-white'; }
                else if (qty === 1) { stLabel = 'Stock bajo'; stClass = 'bg-warning text-dark'; }
                return `<span class="badge ${stClass} px-3 py-1 fw-bold shadow-sm">${stLabel}</span>`;
            })()}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="mt-4 p-3 bg-secondary bg-opacity-10 rounded-4 text-center">
                    <p class="small text-muted mb-0"><i class="bi bi-info-circle me-2"></i>Esta tabla muestra únicamente los insumos vinculados a este dispositivo.</p>
                </div>
            </div>
        `;
    }
    if (elements.bsInventoryModal) ModalManager.show('inventoryModal');
};

function initGlobalSearch() {
    const searchInput = document.getElementById('dashboard-global-search');
    const resultsDiv = document.getElementById('global-search-results');
    const clearBtn = document.getElementById('btn-clear-global-search');

    if (!searchInput || !resultsDiv) return;

    // Focus/Click triggers the modal immediately
    const triggerModal = () => {
        const query = searchInput.value.trim();
        openGlobalSearchResultsModal(query);
        // Clear original input to keep it as a clean trigger
        searchInput.value = '';
        if (clearBtn) clearBtn.classList.add('d-none');
    };

    searchInput.addEventListener('focus', triggerModal);
    searchInput.addEventListener('click', triggerModal);

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            triggerModal();
        }
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            resultsDiv.classList.add('d-none');
            clearBtn.classList.add('d-none');
            searchInput.focus();
        });
    }

    // Hide results when clicking outside
    document.addEventListener('click', (e) => {
        if (!document.getElementById('global-search-container').contains(e.target)) {
            resultsDiv.classList.add('d-none');
        }
    });
}

async function handleGlobalSearch(query) {
    const resultsDiv = document.getElementById('global-search-results');
    if (!resultsDiv) return;

    const sections = [
        { name: 'Equipos (Computadoras)', main: 'inventory', sub: 'inventory', keywords: ['equipo', 'computadora', 'laptop', 'pc', 'inventario'] },
        { name: 'Celulares', main: 'inventory', sub: 'cellphones', keywords: ['celular', 'telefono', 'movil'] },
        { name: 'Periféricos / Accesorios', main: 'peripherals', sub: 'peripherals', keywords: ['periferico', 'accesorio', 'mouse', 'teclado', 'monitor'] },
        { name: 'Inventario de Impresoras', main: 'printers', sub: 'printers', keywords: ['impresora', 'printer'] },
        { name: 'Control de Tintas', main: 'printers', sub: 'inks', keywords: ['tinta', 'ink'] },
        { name: 'Control de Tóner', main: 'printers', sub: 'toner', keywords: ['toner'] },
        { name: 'Correos / Backups', main: 'emails', sub: 'emails', keywords: ['correo', 'email', 'backup'] },
        { name: 'Licencias / Credenciales', main: 'licenses', sub: 'licenses', keywords: ['licencia', 'key', 'credencial', 'password'] },
        { name: 'Correos de Outlook', main: 'licenses', sub: 'correos_outlook', keywords: ['outlook', 'correo externo'] },
        { name: 'Red Empresarial (WiFi)', main: 'network', sub: 'enterprise_networks', keywords: ['wifi', 'red empresarial'] },
        { name: 'Red (Nodos/Equipos)', main: 'network', sub: 'network', keywords: ['nodo', 'router', 'switch', 'red info'] },
        { name: 'Tutoriales / Biblioteca', main: 'tutorials', sub: null, keywords: ['tutorial', 'biblioteca', 'pdf', 'manual'] },
        { name: 'Archivos FTP', main: 'ftp', sub: null, keywords: ['ftp', 'archivo', 'servidor'] }
    ];

    const matchedSections = sections.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.keywords.some(k => k.includes(query.toLowerCase()))
    ).map(s => ({
        source_view: 'section_shortcut',
        name: s.name,
        main: s.main,
        sub: s.sub,
        id: 0
    }));

    try {
        const response = await fetch(`${CONFIG.apiUrl}/global_search.php?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        const dbResults = await response.json();

        // Combine section shortcuts with DB results
        const finalResults = [...matchedSections, ...dbResults];
        displayGlobalSearchResults(finalResults);
    } catch (error) {
        console.error("Global Search Error:", error);
        if (matchedSections.length > 0) displayGlobalSearchResults(matchedSections);
    }
}

function displayGlobalSearchResults(results) {
    const resultsDiv = document.getElementById('global-search-results');
    if (!resultsDiv) return;

    if (results.length === 0) {
        resultsDiv.innerHTML = '<div class="p-3 text-center text-muted small">No se encontraron resultados</div>';
    } else {
        const sourceLabels = {
            'inventory': 'Inventario',
            'peripherals': 'Periférico',
            'printers': 'Impresora',
            'licenses': 'Licencia',
            'emails': 'Correo',
            'cellphones': 'Celular',
            'network': 'Red (Nodo)',
            'enterprise_networks': 'Red WiFi',
            'tutorials': 'Tutorial',
            'inks': 'Tintas',
            'toner': 'Tóner',
            'notes': 'Nota',
            'section_shortcut': 'Acceso Directo'
        };

        const sourceIcons = {
            'inventory': 'bi-laptop',
            'peripherals': 'bi-mouse',
            'printers': 'bi-printer',
            'licenses': 'bi-key',
            'emails': 'bi-envelope',
            'cellphones': 'bi-phone',
            'network': 'bi-router',
            'enterprise_networks': 'bi-wifi',
            'tutorials': 'bi-journal-bookmark',
            'inks': 'bi-droplet',
            'toner': 'bi-box-seam',
            'notes': 'bi-sticky',
            'account_management': 'bi-person-badge',
            'section_shortcut': 'bi-box-arrow-in-right'
        };

        const html = results.map(item => {
            if (item.source_view === 'section_shortcut') {
                const subParam = item.sub ? `'${item.sub}'` : 'null';
                return `
                    <div class="p-3 border-bottom hover-bg-light cursor-pointer d-flex align-items-center gap-3 bg-primary bg-opacity-10" 
                        onclick="window.navigateToSection('${item.main}', ${subParam});">
                        <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white" style="width: 40px; height: 40px; min-width: 40px;">
                            <i class="bi ${sourceIcons[item.source_view]}"></i>
                        </div>
                        <div class="flex-grow-1 overflow-hidden">
                            <div class="fw-bold text-primary">IR A: ${item.name}</div>
                            <div class="x-small text-muted">Módulo del sistema</div>
                        </div>
                        <i class="bi bi-arrow-right-short text-primary fs-4"></i>
                    </div>
                `;
            }

            let suppliesBadge = '';
            if (item.source_view === 'printers') {
                try {
                    const inks = item.linked_inks ? JSON.parse(item.linked_inks) : [];
                    const toner = item.linked_toner ? JSON.parse(item.linked_toner) : [];
                    if (inks.length > 0) suppliesBadge = `â€¢ <span class="text-info fw-bold"><i class="bi bi-droplet"></i> ${inks.length} Tintas</span>`;
                    else if (toner.length > 0) suppliesBadge = `â€¢ <span class="text-warning fw-bold" style="color: #d39e00 !important;"><i class="bi bi-box-seam"></i> ${toner.length} Tóner</span>`;
                } catch (e) { }
            }

            return `
                <div class="p-3 border-bottom hover-bg-light cursor-pointer d-flex align-items-center gap-3" 
                    onclick="gotoGlobalResult('${item.source_view}', ${item.id})">
                    <div class="rounded-circle bg-light d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; min-width: 40px;">
                        <i class="bi ${sourceIcons[item.source_view] || 'bi-search'} text-primary"></i>
                    </div>
                    <div class="flex-grow-1 overflow-hidden">
                        <div class="fw-bold text-dark text-truncate">${highlightText(item.name || 'Sin nombre', state.highlightQuery)}</div>
                        ${item.subtitle ? `<div class="text-danger fw-bold small text-uppercase" style="font-size: 0.75rem;">${highlightText(item.subtitle, state.highlightQuery)}</div>` : ''}
                        <div class="x-small text-muted d-flex gap-2 align-items-center flex-wrap">
                            <span>${sourceLabels[item.source_view] || item.source_view}</span>
                            ${item.extra ? `â€¢ <span class="bg-light px-1 rounded border">${highlightText(item.extra, state.highlightQuery)}</span>` : ''}
                            ${item.code ? `â€¢ <span>${highlightText(item.code, state.highlightQuery)}</span>` : ''}
                            ${item.assigned_to ? `â€¢ <span class="text-primary fw-bold">${highlightText(item.assigned_to, state.highlightQuery)}</span>` : ''}
                            ${suppliesBadge}
                        </div>
                    </div>

                    <i class="bi bi-chevron-right text-muted small"></i>
                </div>
            `;
        }).join('');

        // Add "See all" button at the bottom
        const seeAllHtml = `
            <div class="p-3 bg-light text-center cursor-pointer text-primary fw-bold small border-top" 
                onclick="openGlobalSearchResultsModal('${document.getElementById('dashboard-global-search').value.replace(/'/g, "\\'")}');">
                <i class="bi bi-plus-circle me-2"></i>Ver todos los resultados detallados
            </div>
        `;

        resultsDiv.innerHTML = html + (results.length >= 5 ? seeAllHtml : '');
    }
    resultsDiv.classList.remove('d-none');
}

window.openGlobalSearchResultsModal = async (query) => {
    state.highlightQuery = query; // Guardar para resaltar
    // Hide dropdown if open

    const resultsDiv = document.getElementById('global-search-results');
    if (resultsDiv) resultsDiv.classList.add('d-none');

    // Synchronize modal input with query only if they are meaningfully different
    if (elements['modal-search-input']) {
        const currentVal = elements['modal-search-input'].value;
        // Only update if current value (trimmed) is different from incoming query
        if (currentVal.trim() !== query.trim()) {
            elements['modal-search-input'].value = query;
        }
    }

    if (elements.bsSearchModal && !elements.searchModal.classList.contains('show')) {
        ModalManager.show('searchModal');
    }

    const container = elements['search-modal-results-container'];
    const emptyState = elements['search-modal-empty'];

    if (container) {
        container.innerHTML = `
            <div class="col-12 text-center p-5">
                <div class="spinner-border text-primary"></div>
                <p class="mt-2 text-muted">Buscando en todos los módulos...</p>
            </div>
        `;
    }
    if (emptyState) emptyState.classList.add('d-none');

    try {
        const response = await fetch(`${CONFIG.apiUrl}/global_search.php?q=${encodeURIComponent(query)}&limit=50`);
        if (!response.ok) throw new Error('Search failed');
        const results = await response.json();
        displayGlobalSearchResultsModal(results);
    } catch (error) {
        console.error("Global Search Error Modal:", error);
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center p-5 text-danger">
                    <i class="bi bi-exclamation-triangle fs-1 mb-3"></i>
                    <h5>Error en la búsqueda</h5>
                    <p class="small">No pudimos conectar con el servidor.</p>
                </div>
            `;
        }
    }

    // Add keyboard listener for the modal part
    if (!window.searchModalKeyHandlerAdded) {
        document.addEventListener('keydown', handleSearchModalKeydown);
        window.searchModalKeyHandlerAdded = true;
    }

    // Modal internal search input binding
    if (!window.modalSearchInputBound) {
        elements['modal-search-input'].addEventListener('input', (e) => {
            const rawValue = e.target.value; // Keep the actual typed value (with spaces)
            const query = rawValue.trim();

            if (query.length >= 2) {
                clearTimeout(window.modalSearchTimeout);
                window.modalSearchTimeout = setTimeout(() => {
                    // Execute search without re-triggering modal input update
                    openGlobalSearchResultsModal(query);
                }, 400); // Slightly longer debounce for better UX
            }
        });
        window.modalSearchInputBound = true;
    }

    state.selectedSearchResultIndex = -1;
};

function displayGlobalSearchResultsModal(results) {
    const container = elements['search-modal-results-container'];
    const countEl = elements['search-results-count'];
    const emptyState = elements['search-modal-empty'];

    if (!container) return;
    container.innerHTML = '';

    if (countEl) countEl.textContent = results.length;

    if (results.length === 0) {
        if (emptyState) emptyState.classList.remove('d-none');
        return;
    } else {
        if (emptyState) emptyState.classList.add('d-none');
    }

    const sourceLabels = {
        'inventory': 'Cómputo', 'peripherals': 'Periférico', 'printers': 'Impresora',
        'licenses': 'Licencia / Credencial', 'licenses_cred': 'Credencial',
        'emails': 'Correo / Backup', 'office_emails': 'Correo Office', 'microsoft_emails': 'Correo Microsoft 365',
        'cellphones': 'Celular', 'network': 'Red', 'enterprise_networks': 'WiFi', 'tutorials': 'Tutorial',
        'inks': 'Tintas', 'toner': 'Tóner', 'account_management': 'Cuenta de Acceso', 'notes': 'Notas'
    };

    container.innerHTML = results.map((item, index) => {
        const icon = getIconForSource(item.source_view);
        const label = sourceLabels[item.source_view] || item.source_view;

        // Determine status color if available
        let statusBadge = '';
        if (item.subtitle) {
            const lowSub = item.subtitle.toLowerCase();
            const colorClass = (lowSub.includes('activa') || lowSub.includes('bueno') || lowSub.includes('nuevo')) ? 'success' :
                (lowSub.includes('baja') || lowSub.includes('suspendido')) ? 'danger' : 'warning';
            statusBadge = `<span class="badge bg-${colorClass} bg-opacity-10 text-${colorClass} border border-${colorClass} border-opacity-25 px-2 py-1 x-small text-uppercase fw-bold">${item.subtitle}</span>`;
        }

        const safeId = String(item.id).replace(/'/g, "\\'");
        const safeView = String(item.source_view).replace(/'/g, "\\'");

        return `
        <div class="col">
            <div class="card h-100 rounded-3 search-result-card search-result-row p-2 shadow-sm border-0" 
                data-index="${index}" data-view="${safeView}" data-id="${safeId}" 
                onclick="window.updateSelectedSearchResult(${index}); window.gotoGlobalResultFromModal('${safeView}', '${safeId}')">
                <div class="d-flex align-items-start gap-2 gap-md-3">
                    <div class="search-card-icon bg-primary bg-opacity-10 text-primary flex-shrink-0">
                        <i class="bi ${icon} fs-5"></i>
                    </div>
                    <div class="flex-grow-1 min-width-0">
                        <div class="d-flex justify-content-between align-items-start mb-1 gap-2">
                            <h6 class="fw-bold text-dark mb-0 text-wrap">${item.name || 'Sin nombre'}</h6>
                            ${statusBadge}
                        </div>
                        <div class="badge bg-secondary bg-opacity-10 text-muted border border-secondary border-opacity-10 fw-semibold mb-2 text-wrap" style="font-size: 0.65rem; display: inline-block; max-width: 100%; overflow-wrap: anywhere; letter-spacing: 0.5px; border-radius: 6px;">${label} ${item.category ? ` â€¢ ${item.category}` : ''}</div>
                        
                        <div class="row g-2 mt-1">
                            ${item.code ? `<div class="col-12 col-sm-6"><div class="x-small text-muted">Código</div><div class="small fw-bold">${item.code}</div></div>` : ''}
                            ${item.serial ? `<div class="col-12 col-sm-6"><div class="x-small text-muted">Serie</div><div class="small fw-bold">${item.serial}</div></div>` : ''}
                            ${item.assigned_to ? `<div class="col-12"><div class="x-small text-muted">Asignado a / Notas</div><div class="small">${item.assigned_to}</div></div>` : ''}
                            ${item.extra ? `<div class="col-12"><div class="x-small text-muted">Detalles adicionales</div><div class="small text-primary fw-bold">${item.extra}</div></div>` : ''}
                            ${(() => {
                if (item.source_view !== 'printers') return '';
                try {
                    const inks = item.linked_inks ? JSON.parse(item.linked_inks) : [];
                    const toner = item.linked_toner ? JSON.parse(item.linked_toner) : [];
                    if (inks.length > 0) return `<div class="col-12 mt-1"><span class="badge bg-premium-info text-dark rounded-pill shadow-sm"><i class="bi bi-droplet me-1"></i>${inks.length} Tintas vinculadas</span></div>`;
                    if (toner.length > 0) return `<div class="col-12 mt-1"><span class="badge bg-premium-warning text-dark rounded-pill shadow-sm"><i class="bi bi-box-seam me-1"></i>${toner.length} Tóner vinculado</span></div>`;
                } catch (e) { }
                return '';
            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function getIconForSource(source) {
    const sourceIcons = {
        'inventory': 'bi-laptop', 'peripherals': 'bi-mouse', 'printers': 'bi-printer',
        'licenses': 'bi-key', 'licenses_cred': 'bi-pass', 'emails': 'bi-envelope',
        'office_emails': 'bi-envelope-at', 'microsoft_emails': 'bi-microsoft',
        'cellphones': 'bi-phone', 'network': 'bi-router', 'enterprise_networks': 'bi-wifi',
        'tutorials': 'bi-journal-bookmark', 'inks': 'bi-droplet', 'toner': 'bi-box-seam',
        'account_management': 'bi-person-badge', 'notes': 'bi-sticky'
    };
    return sourceIcons[source] || 'bi-search';
}

function handleSearchModalKeydown(e) {
    const modal = document.getElementById('searchModal');
    if (!modal || !modal.classList.contains('show')) return;

    const rows = document.querySelectorAll('.search-result-row');
    if (rows.length === 0) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        state.selectedSearchResultIndex = (state.selectedSearchResultIndex + 1) % rows.length;
        updateSelectedSearchResult(state.selectedSearchResultIndex);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        state.selectedSearchResultIndex = (state.selectedSearchResultIndex - 1 + rows.length) % rows.length;
        updateSelectedSearchResult(state.selectedSearchResultIndex);
    } else if (e.key === 'Enter' && state.selectedSearchResultIndex !== -1) {
        e.preventDefault();
        const selectedRow = rows[state.selectedSearchResultIndex];
        const view = selectedRow.dataset.view;
        const id = selectedRow.dataset.id;
        window.gotoGlobalResultFromModal(view, id);
    }
}

window.updateSelectedSearchResult = (index) => {
    state.selectedSearchResultIndex = index;
    const rows = document.querySelectorAll('.search-result-row');
    rows.forEach((row, i) => {
        if (i === index) {
            row.classList.add('selected');
            row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            row.classList.remove('selected');
        }
    });
};

window.gotoGlobalResultFromModal = (view, id) => {
    // Hide search modal when navigating to a result
    ModalManager.hide('searchModal');
    window.gotoGlobalResult(view, id);
};
window.navigateToSection = async (mainView, subView = null) => {
    if (subView) {
        state.subViews[mainView] = subView;
    }
    // Hide search modal if open
    ModalManager.hide('searchModal');
    await switchView(mainView);
    // Hide search results dropdown after navigation
    const resultsDiv = document.getElementById('global-search-results');
    if (resultsDiv) resultsDiv.classList.add('d-none');
};

window.gotoGlobalResult = async (view, id) => {
    const resultsDiv = document.getElementById('global-search-results');
    if (resultsDiv) resultsDiv.classList.add('d-none');

    const subToMain = {
        'cellphones': 'inventory', 'inventory': 'inventory',
        'microsoft_emails': 'emails', 'office_emails': 'emails', 'emails': 'emails',
        'network': 'network', 'enterprise_networks': 'network',
        'licenses_cred': 'licenses', 'licenses': 'licenses',
        'correos_outlook': 'licenses', 'account_management': 'licenses',
        'printers': 'printers', 'inks': 'printers', 'toner': 'printers'
    };

    const mainView = subToMain[view] || view;
    if (subToMain[view]) state.subViews[mainView] = view;

    await switchView(mainView);
    window.viewItem(view, id);
};

// ── Asset Tools: QR, Responsiva, Maintenance ────────────────────────────────

window.generateQR = function (containerId, text) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    // Transform simple text into a full URL for deep linking if it's not already a URL
    let qrValue = text;
    if (text.startsWith('ID:')) {
        const parts = text.split('|');
        const id = parts[0].split(':')[1];
        const view = parts[2].split(':')[1];
        qrValue = `${window.location.origin}${window.location.pathname}?item=${view},${id}`;
    }

    new QRCode(container, {
        text: qrValue,
        width: 140,
        height: 140,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
};

// ── QR SCANNER LOGIC ─────────────────────────────────────────────────────────
let html5QrCode = null;

window.initScanner = function () {
    const modalEl = document.getElementById('qrScannerModal');
    if (!modalEl) return;

    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();

    modalEl.addEventListener('shown.bs.modal', async function onShown() {
        modalEl.removeEventListener('shown.bs.modal', onShown);

        // Security check for camera access
        if (!window.isSecureContext && window.location.hostname !== 'localhost') {
            document.getElementById('qr-reader').innerHTML = `
                <div class="alert alert-warning m-3 p-3 small text-center">
                    <i class="bi bi-shield-lock-fill fs-2 d-block mb-2"></i>
                    <strong>Acceso de Cámara Bloqueado</strong><br>
                    Los navegadores requieren una conexión segura (HTTPS) para usar la cámara.<br><br>
                    <span class="badge bg-danger">Usa la opción de "Subir Foto" abajo</span>
                </div>
            `;
            showToast("Advertencia", "Cámara bloqueada por seguridad del navegador", "warning");
            return;
        }

        html5QrCode = new Html5Qrcode("qr-reader");
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
                window.handleScannedQR(decodedText);
            },
            (errorMessage) => {
                // scanning...
            }
        ).catch(err => {
            console.error("Scanner Error", err);
            document.getElementById('qr-reader').innerHTML = `
                <div class="p-4 text-center">
                    <i class="bi bi-camera-video-off fs-2 text-muted"></i>
                    <p class="mt-2 small">No se obtuvo permiso para la cámara o el dispositivo no tiene una disponible.</p>
                </div>
            `;
            showToast("Error", "No se pudo acceder a la cámara", "danger");
        });
    });

    modalEl.addEventListener('hidden.bs.modal', function onHide() {
        modalEl.removeEventListener('hidden.bs.modal', onHide);
        if (html5QrCode) {
            html5QrCode.stop().then(() => {
                html5QrCode = null;
                document.getElementById('qr-reader').innerHTML = '';
            }).catch(err => console.error("Error stopping scanner", err));
        }
    });
};

window.handleQRFile = function (file) {
    // Create temporary scanner instance for file
    const tempScanner = new Html5Qrcode("qr-reader");

    tempScanner.scanFile(file, true)
        .then(decodedText => {
            window.handleScannedQR(decodedText);
            tempScanner.clear();
        })
        .catch(err => {
            console.error("File Scan Error", err);
            showToast("Error", "No se detectó un código QR válido en la foto", "danger");
        });
};

window.handleScannedQR = function (data) {
    try {
        // Close modal
        const modalEl = document.getElementById('qrScannerModal');
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();

        // Vibration feedback if supported
        if (navigator.vibrate) navigator.vibrate(100);

        // Handle URL or raw link
        if (data.includes('?item=')) {
            const url = new URL(data);
            const item = url.searchParams.get('item');
            const [view, id] = item.split(',');
            window.gotoGlobalResult(view, id);
        } else if (data.includes('ID:')) {
            // Legacy/Plain text support
            const parts = data.split('|');
            const id = parts[0].split(':')[1];
            const view = parts[2].split(':')[1];
            window.gotoGlobalResult(view, id);
        } else {
            showToast("QR Detectado", "El código no es un activo válido: " + data, "info");
        }
    } catch (e) {
        showToast("Error", "Código no reconocido", "danger");
    }
};

window.generateResponsivaById = function (view, id) {
    let list = [];
    if (view === 'inventory') list = state.data.inventory;
    else if (view === 'cellphones') list = state.data.cellphones;
    else if (view === 'printers') list = state.data.printers;
    else if (view === 'peripherals') list = state.data.peripherals;

    const item = list.find(x => String(x.id) === String(id));
    if (item) {
        window.generateResponsiva(item, view);
    } else {
        showToast("Error", "No se encontró el equipo para generar el PDF", "danger");
    }
};

window.generateResponsiva = async function (item, view) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header Background
    doc.setFillColor(204, 0, 0);
    doc.rect(0, 0, 210, 40, 'F');

    // Logo (Drawn over the background)
    try {
        const logoImg = new Image();
        logoImg.src = 'images/01-TG Logo Blanco.png';
        await new Promise((resolve) => {
            logoImg.onload = resolve;
            logoImg.onerror = resolve; // Continue even if logo fails
        });
        if (logoImg.complete && logoImg.naturalWidth > 0) {
            doc.addImage(logoImg, 'PNG', 12, 5, 42, 33); // x, y, width, height
        }
    } catch (e) {
        console.warn("Logo could not be loaded into PDF", e);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("CARTA RESPONSIVA DE EQUIPO", 125, 25, { align: "center" });

    // Body Text
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const date = new Date().toLocaleDateString();
    doc.text(`Fecha: ${date}`, 160, 55);

    const userName = item.assigned_user || item.employee || item.assigned_to || 'EMPLEADO';
    const text = `Por medio de la presente, yo ${userName.toUpperCase()}, manifiesto que recibo de TOTAL GROUND, el equipo y/o accesorios que se detallan a continuación, los cuales quedan bajo mi resguardo para el desempeño de mis funciones laborales.`;

    const splitText = doc.splitTextToSize(text, 170);
    doc.text(splitText, 20, 70);

    // Asset Table Header
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 95, 170, 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("ESPECIFICACIONES DEL EQUIPO", 25, 101);

    // Details
    doc.setFont("helvetica", "normal");
    let y = 115;
    const drawRow = (label, value) => {
        doc.setFont("helvetica", "bold");
        doc.text(label + ":", 25, y);
        doc.setFont("helvetica", "normal");
        doc.text(String(value || 'N/A'), 70, y);
        y += 8;
    };

    drawRow("Producto", item.name || item.model || "Equipo");
    drawRow("Marca", item.brand || "-");
    drawRow("Modelo", item.model || "-");
    drawRow("Serie", item.serial || "-");
    drawRow("Folio Inv.", item.code || "-");

    if (view === 'inventory') {
        drawRow("Procesador", item.processor || "-");
        drawRow("RAM", item.ram || "-");
        drawRow("Disco", item.storage || "-");
    }

    // Legal Footer
    y = 180;
    doc.setFontSize(9);
    const legal = "Me comprometo a cuidar y dar el uso adecuado a las herramientas de trabajo proporcionadas, notificando de inmediato cualquier daño o extravío al departamento de TI. En caso de baja laboral, me comprometo a devolver el equipo en las mismas condiciones en que fue recibido.";
    const splitLegal = doc.splitTextToSize(legal, 170);
    doc.text(splitLegal, 20, y);

    // Signatures
    y = 230;
    doc.line(30, y, 90, y);
    doc.line(120, y, 180, y);
    doc.text("FIRMA DE RECIBIDO", 45, y + 5);
    doc.text(userName.toUpperCase(), 45, y + 10, { align: "center", maxWidth: 60 });
    doc.text("DEPARTAMENTO DE TI", 135, y + 5);

    doc.save(`Responsiva_${userName.replace(/\s+/g, '_')}.pdf`);
    showToast("Carta Responsiva generada con éxito");
};

window.loadMaintenanceLogs = async function (assetId, assetType) {
    const container = document.getElementById('maintenance-history');
    if (!container) return;

    container.innerHTML = '<div class="text-center p-4"><div class="spinner-border spinner-border-sm text-danger"></div></div>';

    try {
        const response = await fetch(`backend/api/maintenance.php?asset_id=${assetId}&asset_type=${assetType}`);
        const logs = await response.json();

        if (logs.length === 0) {
            container.innerHTML = `<div class="text-center p-4 text-muted"><i class="bi bi-info-circle me-1"></i>No hay registros de mantenimiento aún.</div>`;
            return;
        }

        let html = '<div class="maintenance-timeline">';
        logs.forEach(log => {
            html += `
                <div class="maintenance-item">
                    <div class="maintenance-card">
                        <div class="maintenance-date">${new Date(log.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                        <div class="fw-bold small text-dark mb-1">${log.description}</div>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                             <span class="small text-muted"><i class="bi bi-person me-1"></i>${log.technician || 'Soporte TI'}</span>
                             ${log.cost > 0 ? `<span class="badge bg-light text-success border border-success-subtle fw-bold">$${log.cost}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = '<div class="alert alert-danger small">Error al cargar bitácora.</div>';
    }
};

window.addMaintenanceEntry = function (assetId, assetType) {
    const modalId = 'maintenanceModal';
    const form = document.getElementById('maintenance-form');
    if (!form) return;

    form.reset();
    document.getElementById('maint-asset-id').value = assetId;
    document.getElementById('maint-asset-type').value = assetType;
    document.getElementById('maint-technician').value = state.user.full_name || '';

    ModalManager.show(modalId);
};

// Global for maintenance saving
window.saveMaintenanceFromModal = async function () {
    const assetId = document.getElementById('maint-asset-id').value;
    const assetType = document.getElementById('maint-asset-type').value;
    const desc = document.getElementById('maint-description').value;
    const tech = document.getElementById('maint-technician').value;
    const cost = document.getElementById('maint-cost').value;

    if (!desc) {
        showToast("Error", "La descripción es obligatoria", "error");
        return;
    }

    try {
        const response = await fetch('backend/api/maintenance.php', {
            method: 'POST',
            body: JSON.stringify({
                asset_id: assetId,
                asset_type: assetType,
                description: desc,
                technician: tech,
                cost: cost
            })
        });

        if (response.ok) {
            showToast("Éxito", "Registro guardado en bitácora", "success");
            ModalManager.hide('maintenanceModal');
            window.loadMaintenanceLogs(assetId, assetType);
        }
    } catch (e) {
        showToast("Error", "No se pudo guardar el registro", "error");
    }
};

window.onload = init;
// --- Side Drawer Global Control ---
window.toggleDrawer = function (show = null) {
    const drawer = document.getElementById('side-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (!drawer) return;
    const shouldShow = show !== null ? show : !drawer.classList.contains('show');
    if (shouldShow) {
        drawer.classList.add('show');
        if (backdrop) backdrop.classList.add('show');
        document.body.style.overflow = 'hidden';
    } else {
        drawer.classList.remove('show');
        if (backdrop) backdrop.classList.remove('show');
        document.body.style.overflow = '';
    }
};