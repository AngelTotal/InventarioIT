/**
 * IT Inventory - Vanilla JS Application
 * Logic for routing, authentication and data management.
 */

const CONFIG = {
    apiUrl: 'http://localhost/IT Inventory/backend/api',
    mockFallback: true // Allow using mock data if API is not reachable
};

// Application State
const state = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    currentView: 'dashboard',
    data: {
        inventory: [],
        assignments: [],
        licenses: [],
        network: [],
        users: [],
        stats: {}
    }
};

// DOM Elements
const elements = {
    loginScreen: document.getElementById('login-screen'),
    appScreen: document.getElementById('app-screen'),
    loginForm: document.getElementById('login-form'),
    loginError: document.getElementById('login-error'),
    contentArea: document.getElementById('content-area'),
    viewTitle: document.getElementById('view-title'),
    navItems: document.querySelectorAll('.nav-item'),
    logoutBtn: document.getElementById('logout-btn'),
    userName: document.getElementById('user-name'),
    userRole: document.getElementById('user-role'),
    userAvatar: document.getElementById('user-avatar'),
    navUsers: document.getElementById('nav-users')
};

// --- Initialization ---

function init() {
    if (state.user) {
        showApp();
    } else {
        showLogin();
    }

    setupEventListeners();
}

function setupEventListeners() {
    // Login Submission
    elements.loginForm.addEventListener('submit', handleLogin);

    // Sidebar Navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.getAttribute('data-view');
            switchView(view);
        });
    });

    // Logout
    elements.logoutBtn.addEventListener('click', handleLogout);
}

// --- Authentication ---

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    elements.loginError.classList.add('hidden');

    try {
        // Attempt API Login
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
        }

        // Fallback Mock Login (Hardcoded for convenience as requested)
        if (CONFIG.mockFallback && username === 'admin' && password === 'admin') {
            const mockUser = {
                name: "Administrador TI",
                role: "admin",
                avatar: "https://ui-avatars.com/api/?name=Admin+TI&background=3b82f6&color=fff"
            };
            loginSuccess(mockUser);
            return;
        }

        throw new Error('Invalid credentials');

    } catch (err) {
        console.error("Login attempt failed:", err);
        elements.loginError.textContent = "Credenciales incorrectas o servidor no disponible.";
        elements.loginError.classList.remove('hidden');
    }
}

function loginSuccess(user) {
    state.user = user;
    localStorage.setItem('user', JSON.stringify(user));
    showApp();
}

function handleLogout() {
    state.user = null;
    localStorage.removeItem('user');
    showLogin();
}

// --- Navigation & View Rendering ---

function showLogin() {
    elements.loginScreen.classList.remove('hidden');
    elements.appScreen.classList.add('hidden');
}

function showApp() {
    elements.loginScreen.classList.add('hidden');
    elements.appScreen.classList.remove('hidden');

    // Update Profile
    elements.userName.textContent = state.user.name;
    elements.userRole.textContent = state.user.role === 'admin' ? 'Administrador' : 'Consulta';
    elements.userAvatar.src = state.user.avatar;

    // Permissions
    if (state.user.role !== 'admin') {
        elements.navUsers.classList.add('hidden');
    } else {
        elements.navUsers.classList.remove('hidden');
    }

    switchView('dashboard');
}

async function switchView(view) {
    state.currentView = view;

    // Update active nav item
    elements.navItems.forEach(item => {
        if (item.getAttribute('data-view') === view) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update Title
    const titles = {
        'dashboard': 'Panel de Control',
        'inventory': 'Inventario de Activos',
        'assignments': 'Asignaciones de Equipo',
        'licenses': 'Control de Licencias',
        'network': 'Dispositivos de Red',
        'users': 'Gestión de Usuarios'
    };
    elements.viewTitle.textContent = titles[view] || 'IT Inventory';

    // Render Content
    renderView(view);

    // Fetch data for the view
    await fetchData(view);
}

async function renderView(view) {
    elements.contentArea.innerHTML = '<div class="loader">Cargando...</div>';

    if (view === 'dashboard') {
        const tpl = document.getElementById('tpl-dashboard');
        elements.contentArea.innerHTML = '';
        elements.contentArea.appendChild(tpl.content.cloneNode(true));
        updateDashboardStats();
    } else {
        const tpl = document.getElementById('tpl-table-view');
        elements.contentArea.innerHTML = '';
        elements.contentArea.appendChild(tpl.content.cloneNode(true));
        renderTable(view);
    }
}

// --- Data Management ---

async function fetchData(view) {
    const endpoints = {
        'dashboard': 'stats.php',
        'inventory': 'inventory.php',
        'assignments': 'assignments.php',
        'licenses': 'licenses.php',
        'network': 'network.php',
        'users': 'users.php'
    };

    const endpoint = endpoints[view];
    if (!endpoint) return;

    try {
        const response = await fetch(`${CONFIG.apiUrl}/${endpoint}`);
        if (!response.ok) throw new Error('Fetch failed');
        const data = await response.json();

        state.data[view] = data;

        if (view === 'dashboard') {
            state.data.stats = data;
            updateDashboardStats();
        } else {
            renderTable(view);
        }
    } catch (err) {
        console.warn(`Could not fetch data for ${view}, using local/empty store.`, err);
    }
}

function updateDashboardStats() {
    const stats = state.data.stats;
    if (!stats) return;

    const elDevices = document.getElementById('stat-devices');
    const elAssignments = document.getElementById('stat-assignments');
    const elLicenses = document.getElementById('stat-licenses');
    const elNetwork = document.getElementById('stat-network');

    if (elDevices) elDevices.textContent = stats.inventory_count || 0;
    if (elAssignments) elAssignments.textContent = stats.assignments_count || 0;
    if (elLicenses) elLicenses.textContent = stats.licenses_count || 0;
    if (elNetwork) elNetwork.textContent = stats.network_count || 0;
}

function renderTable(view) {
    const tbody = document.getElementById('table-body');
    const thead = document.getElementById('table-head-row');
    if (!tbody || !thead) return;

    const data = state.data[view] || [];

    // Clear
    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;">No hay datos disponibles</td></tr>';
        return;
    }

    // Define Columns based on view
    let columns = [];
    if (view === 'inventory') {
        columns = [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nombre' },
            { key: 'type', label: 'Tipo' },
            { key: 'brand', label: 'Marca' },
            { key: 'serial_number', label: 'S/N' },
            { key: 'status', label: 'Estado' }
        ];
    } else if (view === 'assignments') {
        columns = [
            { key: 'id', label: 'ID' },
            { key: 'employee_name', label: 'Empleado' },
            { key: 'asset_name', label: 'Activo' },
            { key: 'assignment_date', label: 'Fecha' },
            { key: 'location', label: 'Ubicación' }
        ];
    } else if (view === 'licenses') {
        columns = [
            { key: 'software', label: 'Software' },
            { key: 'key', label: 'Licencia' },
            { key: 'expiration', label: 'Expira' },
            { key: 'status', label: 'Estado' }
        ];
    } else if (view === 'network') {
        columns = [
            { key: 'device_name', label: 'Dispositivo' },
            { key: 'ip_address', label: 'IP' },
            { key: 'mac_address', label: 'MAC' },
            { key: 'location', label: 'Lugar' }
        ];
    } else if (view === 'users') {
        columns = [
            { key: 'fullname', label: 'Nombre' },
            { key: 'username', label: 'Usuario' },
            { key: 'role', label: 'Rol' }
        ];
    }

    // Render Headers
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col.label;
        thead.appendChild(th);
    });
    const thActions = document.createElement('th');
    thActions.textContent = 'Acciones';
    thead.appendChild(thActions);

    // Render Rows
    data.forEach(item => {
        const tr = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            td.textContent = item[col.key] || '-';
            tr.appendChild(td);
        });

        // Actions
        const tdActions = document.createElement('td');
        tdActions.innerHTML = `
            <div style="display:flex; gap:8px;">
                <button class="btn-icon-sm" onclick="alert('Editar ID: ${item.id}')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
            </div>
        `;
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
    });
}

// Start app
init();
