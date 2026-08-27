// Ref Conveyors PM Tool — shared auth + layout helpers.
// Depends on assets/supabase-client.js being loaded first.

const ROLE_LABELS = {
  owner: "Owner",
  designer: "Designer",
  fabricator: "Fabricator",
  purchase_executive: "Purchase Executive",
  supervisor: "Supervisor",
};

function initialsFrom(name) {
  return (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  const day = String(d.getDate()).padStart(2, "0");
  // A fixed 3-letter list rather than toLocaleDateString's "short" month —
  // the en-GB locale renders September as "Sept" (4 letters), which breaks
  // the otherwise-uniform dd-mmm-yy format.
  const month = MONTH_ABBR[d.getMonth()];
  const year = String(d.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}

// Returns a YYYY-MM-DD string for a Date using its LOCAL calendar fields.
// Deliberately does not use toISOString() (that reads UTC fields, which
// silently shifts the date back a day for anyone in a timezone ahead of
// UTC — e.g. India, UTC+5:30 — exactly this app's users). Use this
// everywhere "today" or a computed date needs to become a plain date string.
function localDateStr(d) {
  d = d || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Redirects to login if not signed in. Returns { user, profile }.
// Call at the top of every protected page.
async function requireAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = "index.html";
    return null;
  }
  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error || !profile) {
    // A valid-looking session with no matching profile row — most likely
    // a stale/orphaned session left over from an account that no longer
    // exists (e.g. removed directly in the database) rather than a genuine
    // new user. Sign out first so the bad session doesn't keep coming back
    // and silently bouncing this device to signup.html on every visit.
    await supabaseClient.auth.signOut();
    window.location.href = "signup.html";
    return null;
  }
  return { user: session.user, profile };
}

async function signOut() {
  await supabaseClient.auth.signOut();
  window.location.href = "index.html";
}

const SIDEBAR_ICONS = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 3l9 6.5"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/></svg>`,
  "order-book": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h6"/></svg>`,
  purchase: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.8h8.6a2 2 0 0 0 2-1.6L21 8H6"/></svg>`,
  "my-tasks": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  employees: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  "roles-permissions": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
};

const SIDEBAR_NAV = [
  { key: "dashboard", label: "Dashboard", href: "dashboard.html", color: "ic-amber" },
  { key: "order-book", label: "Order Book", href: "order-book.html", color: "ic-blue" },
  { key: "purchase", label: "Purchase", href: "purchase.html", color: "ic-green" },
  { key: "my-tasks", label: "My Tasks", href: "my-tasks.html", color: "ic-teal" },
  { key: "employees", label: "Employees", href: "employees.html", color: "ic-amber" },
  { key: "roles-permissions", label: "Roles & Permissions", href: "roles-permissions.html", color: "ic-green" },
  { key: "settings", label: "Settings", href: "settings.html", color: "ic-blue" },
];

// Collapsible sidebar state — remembered per browser (localStorage), applies
// app-wide since every page renders through this one function.
const SIDEBAR_COLLAPSE_KEY = "sidebarCollapsed";

function isSidebarCollapsed() {
  try { return localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "1"; } catch (e) { return false; }
}

// Toggles the collapsed state in place (no re-render) so it's instant and
// doesn't disturb anything else on the page.
function setSidebarCollapsed(collapsed) {
  try { localStorage.setItem(SIDEBAR_COLLAPSE_KEY, collapsed ? "1" : "0"); } catch (e) { /* ignore */ }
  const root = document.getElementById("sidebar-root");
  const aside = root?.querySelector(".sidebar");
  if (!root || !aside) return;
  root.classList.toggle("collapsed", collapsed);
  aside.classList.toggle("collapsed", collapsed);
  const toggleBtn = aside.querySelector("#sidebar-toggle-btn");
  if (toggleBtn) {
    toggleBtn.innerHTML = collapsed ? "&#9656;" : "&#9666;";
    toggleBtn.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
    toggleBtn.title = collapsed ? "Expand sidebar" : "Collapse sidebar";
  }
}

// Renders the left sidebar into #sidebar-root. `active` is one of the
// SIDEBAR_NAV keys. Deliberately synchronous and called BEFORE requireAuth()
// resolves — the sidebar's content doesn't depend on the profile fetch, and
// calling it immediately (rather than after an async round-trip to Supabase)
// is what keeps it from flashing empty (or in the wrong collapsed/expanded
// state) on every page navigation.
function renderSidebar(active) {
  const sidebarRoot = document.getElementById("sidebar-root");
  if (!sidebarRoot) return;
  const collapsed = isSidebarCollapsed();
  const nav = SIDEBAR_NAV.map((n) => `
    <a class="sidebar-item${n.key === active ? " active" : ""}" href="${n.href}" title="${escapeHtml(n.label)}">
      <span class="${n.color}">${SIDEBAR_ICONS[n.key]}</span>
      <span>${n.label}</span>
    </a>`).join("");
  sidebarRoot.innerHTML = `
    <aside class="sidebar${collapsed ? " collapsed" : ""}">
      <button type="button" class="sidebar-toggle" id="sidebar-toggle-btn" title="${collapsed ? "Expand sidebar" : "Collapse sidebar"}" aria-label="${collapsed ? "Expand sidebar" : "Collapse sidebar"}">${collapsed ? "&#9656;" : "&#9666;"}</button>
      <div class="sidebar-logo">
        <div class="sidebar-logo-title">REF</div>
        <div class="sidebar-logo-sub">PM Tracker</div>
      </div>
      <nav class="sidebar-nav">${nav}</nav>
      <div class="sidebar-footer">Ref Conveyors &amp; Fabricators</div>
    </aside>`;
  sidebarRoot.classList.toggle("collapsed", collapsed);
  sidebarRoot.querySelector("#sidebar-toggle-btn").addEventListener("click", () => {
    setSidebarCollapsed(!isSidebarCollapsed());
  });
}

// Renders the user chip + log out button into #header-user-root. Called
// once requireAuth() has resolved, since it needs the profile.
function renderHeaderUser(profile) {
  const headerRoot = document.getElementById("header-user-root");
  if (!headerRoot) return;
  headerRoot.innerHTML = `
    <div class="ph-user">
      <div class="user-chip">
        <div class="avatar">${escapeHtml(initialsFrom(profile.full_name))}</div>
        <div>
          <div class="user-name">${escapeHtml(profile.full_name)}</div>
          <div class="user-role">${escapeHtml(ROLE_LABELS[profile.role] || profile.role)}</div>
        </div>
      </div>
      <button class="btn-secondary" onclick="signOut()">Log out</button>
    </div>`;
}
