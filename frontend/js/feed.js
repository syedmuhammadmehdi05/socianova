// ─── SociaNova Feed ──────────────────────────────────────────────────────────

let currentUser = null;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function avatar(name = "?") {
  return name[0].toUpperCase();
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Render a single post card ───────────────────────────────────────────────
function renderPost(post) {
  const isOwn =
    currentUser &&
    (post.user?._id === currentUser._id || post.user?.id === currentUser._id);

  const liked =
    currentUser &&
    post.likes &&
    post.likes.some(
      (id) => id === currentUser._id || id === currentUser.id
    );

  const card = document.createElement("article");
  card.className = "post-card";
  card.dataset.id = post._id || post.id;

  card.innerHTML = `
    <div class="post-header">
      <div class="avatar">${avatar(post.user?.username || "U")}</div>
      <div class="post-meta">
        <span class="post-username">${post.user?.username || "Unknown"}</span>
        <span class="post-time">${timeAgo(post.createdAt)}</span>
      </div>
      ${isOwn
      ? `
    <div class="post-owner-actions">
      <button class="btn-edit-post" data-pid="${post._id || post.id}">
        Edit
      </button>

      <button class="btn-delete-post" data-pid="${post._id || post.id}">
        Delete
      </button>
    </div>
  `
      : ""
    }
      ${!isOwn
      ? `<button class="btn-follow" data-uid="${post.user?._id || post.user?.id
      }">Follow</button>`
      : ""
    }
    </div>

    <p class="post-content">${escapeHtml(post.content)}</p>

    <div class="post-actions">
      <button class="btn-like ${liked ? "liked" : ""}" data-pid="${post._id || post.id
    }">
        <svg viewBox="0 0 24 24" fill="${liked ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span class="like-count">${(post.likes || []).length}</span>
      </button>
    </div>

    <div class="comments-section">
      ${(post.comments || [])
      .map(
        (c) => `
        <div class="comment">
          <span class="comment-author">${c.user?.username || "User"}</span>
          <span class="comment-text">${escapeHtml(c.text)}</span>
        </div>`
      )
      .join("")}
    </div>

    <div class="comment-box">
      <input
        class="comment-input"
        type="text"
        placeholder="Add a comment…"
        maxlength="280"
        data-pid="${post._id || post.id}"
      />
      <button class="btn-comment" data-pid="${post._id || post.id}">Post</button>
    </div>
  `;

  // ─── Like (FIXED: rely on backend response) ───────────────────────────────
  card.querySelector(".btn-like")?.addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;

    try {
      const updated = await API.likePost(post._id || post.id);

      const isLiked = updated.isLiked ?? true;

      btn.classList.toggle("liked", isLiked);
      btn.querySelector("svg").setAttribute(
        "fill",
        isLiked ? "currentColor" : "none"
      );

      btn.querySelector(".like-count").textContent =
        updated.likes?.length ?? (parseInt(btn.querySelector(".like-count").textContent) + (isLiked ? 1 : -1));

    } catch (err) {
      showToast(err.message, "error");
    } finally {
      btn.disabled = false;
    }
  });

  // ─── Comment ─────────────────────────────────────────────────────────────
  const submitComment = async (pid, input) => {
    const text = input.value.trim();
    if (!text) return;

    input.disabled = true;

    try {
      await API.commentPost(pid, text);

      input.value = "";

      const section = card.querySelector(".comments-section");
      const newComment = document.createElement("div");
      newComment.className = "comment";
      newComment.innerHTML = `
        <span class="comment-author">${currentUser?.username || "You"}</span>
        <span class="comment-text">${escapeHtml(text)}</span>
      `;

      section.appendChild(newComment);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      input.disabled = false;
      input.focus();
    }
  };

  card.querySelector(".btn-comment")?.addEventListener("click", () => {
    const input = card.querySelector(".comment-input");
    submitComment(post._id || post.id, input);
  });

  card.querySelector(".comment-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      submitComment(post._id || post.id, e.currentTarget);
    }
  });

  // ─── Follow (FIXED: toggle UI state) ──────────────────────────────────────
  card.querySelector(".btn-follow")?.addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    const uid = btn.dataset.uid;

    btn.disabled = true;

    try {
      await API.followUser(uid);

      const isFollowing = btn.classList.toggle("following");
      btn.textContent = isFollowing ? "Following" : "Follow";

    } catch (err) {
      showToast(err.message, "error");
    } finally {
      btn.disabled = false;
    }
  });

  card.querySelector(".btn-delete-post")?.addEventListener("click", async () => {
    if (!confirm("Delete this post?")) return;

    try {
      await API.deletePost(post._id || post.id);

      card.remove();

      showToast("Post deleted", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  card.querySelector(".btn-edit-post")?.addEventListener("click", async () => {
    const newContent = prompt("Edit your post:", post.content);

    if (!newContent || newContent.trim() === post.content) return;

    try {
      const updated = await API.editPost(post._id || post.id, newContent.trim());

      // update UI instantly
      card.querySelector(".post-content").textContent = updated.content;

      showToast("Post updated");
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  return card;
}

// ─── Load Feed ───────────────────────────────────────────────────────────────
async function loadFeed() {
  const feed = document.getElementById("feed");

  feed.innerHTML = `<div class="feed-loading"><span></span><span></span><span></span></div>`;

  try {
    const posts = await API.getPosts();

    feed.innerHTML = "";

    if (!posts.length) {
      feed.innerHTML = `<p class="empty-feed">No posts yet. Be the first to share something.</p>`;
      return;
    }

    posts.forEach((p) => feed.appendChild(renderPost(p)));
  } catch (err) {
    feed.innerHTML = `<p class="feed-error">Couldn't load posts. <button onclick="loadFeed()">Retry</button></p>`;
  }
}

// ─── Create Post ─────────────────────────────────────────────────────────────
function initComposer() {
  const form = document.getElementById("composer-form");
  const textarea = document.getElementById("post-content");
  const counter = document.getElementById("char-count");
  const MAX = 280;

  textarea.addEventListener("input", () => {
    const left = MAX - textarea.value.length;
    counter.textContent = left;
    counter.classList.toggle("warning", left < 40);
    counter.classList.toggle("danger", left < 10);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const content = textarea.value.trim();
    if (!content) return;

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Posting…";

    try {
      const post = await API.createPost(content);

      textarea.value = "";
      counter.textContent = MAX;

      const feed = document.getElementById("feed");

      const emptyEl = feed.querySelector(".empty-feed");
      if (emptyEl) emptyEl.remove();

      const card = renderPost(post);
      feed.prepend(card);

    } catch (err) {
      showToast(err.message, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Post";
    }
  });
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function showToast(msg, type = "info") {
  const t = document.createElement("div");
  t.className = `toast toast-${type}`;
  t.textContent = msg;

  document.body.appendChild(t);

  requestAnimationFrame(() => t.classList.add("toast-show"));

  setTimeout(() => {
    t.classList.remove("toast-show");
    t.addEventListener("transitionend", () => t.remove());
  }, 3000);
}

// ─── Escape HTML ─────────────────────────────────────────────────────────────
function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Init (FIXED - IMPORTANT) ────────────────────────────────────────────────
async function initFeedPage() {
  requireAuth();

  currentUser = getCurrentUser();

  const avatarEl = document.getElementById("composer-avatar");
  if (avatarEl && currentUser) {
    avatarEl.textContent = currentUser.username.charAt(0).toUpperCase();
  }

  const usernameEl = document.getElementById("nav-username");
  if (usernameEl && currentUser) {
    usernameEl.textContent = currentUser.username;
  }

  document.getElementById("btn-logout")?.addEventListener("click", () => {
    clearSession();
    window.location.href = "index.html";
  });

  initComposer();
  await loadFeed();
}

// AUTO START (CRITICAL FIX)
document.addEventListener("DOMContentLoaded", initFeedPage);

window.getToken = getToken;
window.getCurrentUser = getCurrentUser;
window.saveSession = saveSession;
window.clearSession = clearSession;
window.requireAuth = requireAuth;
window.redirectIfLoggedIn = redirectIfLoggedIn;