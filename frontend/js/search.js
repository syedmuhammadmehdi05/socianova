let timeout = null;

function initSearchPage() {
    requireAuth();

    const input = document.getElementById("searchInput");

    input.addEventListener("input", (e) => {
        clearTimeout(timeout);

        const query = e.target.value.trim();

        if (!query) {
            document.getElementById("searchResults").innerHTML = "";
            return;
        }

        timeout = setTimeout(() => {
            searchUsers(query);
        }, 300);
    });
}

// ─── Search Users ─────────────────────────────────────────────
async function searchUsers(query) {
    const container = document.getElementById("searchResults");

    try {
        const res = await API.searchUsers(query);

        const users = res.users || res || [];

        if (!users.length) {
            container.innerHTML = `<p class="empty-search">No users found for "<strong>${query}</strong>"</p>`;
            return;
        }

        container.innerHTML = users.map(renderUserCard).join("");

    } catch (err) {
        showToast?.(err.message, "error");
    }
}

// ─── Render User Card (username + name only, click to profile) ──
function renderUserCard(user) {
    return `
    <div class="user-card" onclick="openProfile('${user._id}')">
      <div class="user-card-avatar">
        ${user.username?.[0]?.toUpperCase() || "U"}
      </div>
      <div class="user-card-info">
        <span class="user-card-name">${user.username}</span>
        ${user.name ? `<span class="user-card-sub">${user.name}</span>` : ""}
      </div>
      <svg class="user-card-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M7 4l6 6-6 6"/>
      </svg>
    </div>
    `;
}

// ─── Navigation Helper ─────────────────────────────────────────
function openProfile(id) {
    window.location.href = `profile.html?id=${id}`;
}