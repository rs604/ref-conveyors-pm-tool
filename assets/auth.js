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
    // Signed in with Supabase Auth but no profile row yet — shouldn't
    // normally happen (signup.html creates both together), but don't
    // strand the user on a broken page.
    window.location.href = "signup.html";
    return null;
  }
  return { user: session.user, profile };
}

async function signOut() {
  await supabaseClient.auth.signOut();
  window.location.href = "index.html";
}

// Renders the shared topbar into #topbar-root. `active` is one of
// "dashboard" | "projects" | "purchase" | "my-tasks".
function renderTopbar(profile, active) {
  const root = document.getElementById("topbar-root");
  if (!root) return;
  const navItems = [
    { key: "dashboard", label: "Dashboard", href: "dashboard.html" },
    { key: "purchase", label: "Purchase", href: "purchase.html" },
    { key: "my-tasks", label: "My Tasks", href: "my-tasks.html" },
  ];
  const nav = navItems
    .map(
      (n) =>
        `<a class="nav-item${n.key === active ? " active" : ""}" href="${n.href}">${n.label}</a>`
    )
    .join("");
  root.innerHTML = `
    <header class="topbar">
      <div class="topbar-left">
        <div class="logo-mark">RC</div>
        <div>
          <div class="logo-title">Ref Conveyors</div>
          <div class="logo-sub">Project Tracker</div>
        </div>
      </div>
      <nav class="topbar-nav">${nav}</nav>
      <div class="topbar-right">
        <div class="user-chip">
          <div class="avatar">${escapeHtml(initialsFrom(profile.full_name))}</div>
          <div>
            <div class="user-name">${escapeHtml(profile.full_name)}</div>
            <div class="user-role">${escapeHtml(ROLE_LABELS[profile.role] || profile.role)}</div>
          </div>
        </div>
        <button class="btn-secondary" onclick="signOut()">Sign out</button>
      </div>
    </header>
  `;
}
