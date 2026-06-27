// ─── SociaNova Auth ──────────────────────────────────────────────────────────

// Get token from storage
function getToken() {
  return localStorage.getItem("sn_token");
}

// Save session (token + user)
function saveSession(token, user) {
  localStorage.setItem("sn_token", token);
  localStorage.setItem("sn_user", JSON.stringify(user));
}

// Clear session (logout)
function clearSession() {
  localStorage.removeItem("sn_token");
  localStorage.removeItem("sn_user");
}

// Get current user from storage
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("sn_user"));
  } catch {
    return null;
  }
}

// Redirect if NOT logged in
function requireAuth() {
  if (!getToken()) {
    window.location.href = "index.html";
  }
}

// Redirect if already logged in
function redirectIfLoggedIn() {
  if (getToken()) {
    window.location.href = "feed.html";
  }
}

// ─── Login Page ──────────────────────────────────────────────────────────────
function initLoginPage() {
  redirectIfLoggedIn();

  const form = document.getElementById("login-form");
  const errEl = document.getElementById("form-error");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errEl.textContent = "";

    const email = form.email.value.trim();
    const password = form.password.value;

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Signing in…";

    try {
      const data = await API.login(email, password);

      saveSession(data.token, data.user);

      window.location.href = "feed.html";
    } catch (err) {
      errEl.textContent = err.message || "Login failed";
      btn.disabled = false;
      btn.textContent = "Sign in";
    }
  });
}

// ─── Register Page ───────────────────────────────────────────────────────────
function initRegisterPage() {
  redirectIfLoggedIn();

  const form = document.getElementById("register-form");
  const errEl = document.getElementById("form-error");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errEl.textContent = "";

    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;

    if (password.length < 6) {
      errEl.textContent = "Password must be at least 6 characters.";
      return;
    }

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Creating account…";

    try {
      await API.register(username, email, password);

      window.location.href = "index.html?registered=1";
    } catch (err) {
      errEl.textContent = err.message || "Registration failed";
      btn.disabled = false;
      btn.textContent = "Create account";
    }
  });
}

// ─── Auto Init (IMPORTANT) ───────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("login-form")) {
    initLoginPage();
  }

  if (document.getElementById("register-form")) {
    initRegisterPage();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("login-form")) {
    initLoginPage();
  }

  if (document.getElementById("register-form")) {
    initRegisterPage();
  }
});

// ─── Expose Functions Globally ──────────────────────────────────────────────
window.getToken = getToken;
window.getCurrentUser = getCurrentUser;
window.saveSession = saveSession;
window.clearSession = clearSession;
window.requireAuth = requireAuth;
window.redirectIfLoggedIn = redirectIfLoggedIn;