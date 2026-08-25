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

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
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
  "new-job": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M12 12v6M9 15h6"/></svg>`,
  purchase: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.8h8.6a2 2 0 0 0 2-1.6L21 8H6"/></svg>`,
  "my-tasks": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
};

const SIDEBAR_NAV = [
  { key: "dashboard", label: "Dashboard", href: "dashboard.html", color: "ic-amber" },
  { key: "new-job", label: "New Project", href: "new-job.html", color: "ic-blue" },
  { key: "purchase", label: "Purchase", href: "purchase.html", color: "ic-green" },
  { key: "my-tasks", label: "My Tasks", href: "my-tasks.html", color: "ic-teal" },
];

// Renders the left sidebar into #sidebar-root and the user chip + log out
// button into #header-user-root. `active` is one of the SIDEBAR_NAV keys.
function renderShell(profile, active) {
  const sidebarRoot = document.getElementById("sidebar-root");
  if (sidebarRoot) {
    const nav = SIDEBAR_NAV.map((n) => `
      <a class="sidebar-item${n.key === active ? " active" : ""}" href="${n.href}">
        <span class="${n.color}">${SIDEBAR_ICONS[n.key]}</span>
        <span>${n.label}</span>
      </a>`).join("");
    sidebarRoot.innerHTML = `
      <aside class="sidebar">
        <div class="sidebar-logo">
          <div class="sidebar-logo-title">REF</div>
          <div class="sidebar-logo-sub">PM Tracker</div>
        </div>
        <nav class="sidebar-nav">${nav}</nav>
        <div class="sidebar-footer">Ref Conveyors &amp; Fabricators</div>
      </aside>`;
  }

  const headerRoot = document.getElementById("header-user-root");
  if (headerRoot) {
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
}
