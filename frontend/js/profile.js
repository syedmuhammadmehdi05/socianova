let profileUser = null;

function getUserIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function initProfilePage() {
    requireAuth();

    const userId = getUserIdFromURL();
    if (!userId) {
        showToast("No user selected", "error");
        return;
    }

    await loadProfile(userId);
    await loadUserPosts(userId);
}

async function loadProfile(userId) {
    try {
        const res = await API.getUserProfile(userId);

        const user = res.user;
        profileUser = user;

        const current = getCurrentUser();
        const isOwn = current._id === userId;

        const el = document.getElementById("profileHeader");

        let isFollowing = user.followers?.some(
            follower => follower._id === current._id
        );

        el.innerHTML = `
            <div class="profile-card-inner">

                <div class="profile-card-left">
                    <div class="avatar-large">
                        ${user.username[0].toUpperCase()}
                    </div>
                    <div class="profile-identity">
                        <h2>${user.username}</h2>
                        <p class="profile-name">${user.name || ""}</p>
                        <p class="profile-bio">${user.bio || ""}</p>
                    </div>
                </div>

                ${!isOwn ? `
                <div class="profile-card-right">
                    <button id="profileFollowBtn" class="${isFollowing ? "following" : ""}">
                        ${isFollowing ? "Following" : "Follow"}
                    </button>
                </div>
                ` : ""}

            </div>

            <div class="stats">
                <span>${user.followers.length} Followers</span>
                <span>${user.following.length} Following</span>
            </div>
        `;

        // ── Follow toggle (no page reload) ────────────────────────────────
        const followBtn = document.getElementById("profileFollowBtn");

        followBtn?.addEventListener("click", async () => {
            followBtn.disabled = true;

            try {
                await API.followUser(userId);

                isFollowing = !isFollowing;

                followBtn.textContent = isFollowing ? "Following" : "Follow";
                followBtn.classList.toggle("following", isFollowing);

                // Update follower count instantly
                const statsSpans = el.querySelectorAll(".stats span");
                statsSpans.forEach(span => {
                    if (span.textContent.includes("Followers")) {
                        const count = parseInt(span.textContent) || 0;
                        span.textContent = `${count + (isFollowing ? 1 : -1)} Followers`;
                    }
                });

            } catch (err) {
                showToast(err.message, "error");
            } finally {
                followBtn.disabled = false;
            }
        });

    } catch (err) {
        console.error(err);
        showToast(err.message, "error");
    }
}

async function loadUserPosts(userId) {
    const container = document.getElementById("profilePosts");

    try {
        const res = await API.getUserPosts(userId);

        const posts = res.posts || [];

        if (!posts.length) {
            container.innerHTML = `
                <div class="empty-feed">
                    This user hasn't posted anything yet.
                </div>
            `;
            return;
        }

        container.innerHTML = posts
            .map((post) => `
                <article class="post-card">
                    <p class="post-content">${post.content}</p>
                    <div class="post-footer">
                        ❤️ ${post.likes.length}
                        &nbsp;&nbsp;
                        💬 ${post.comments.length}
                    </div>
                </article>
            `)
            .join("");

    } catch (err) {
        showToast?.(err.message, "error");
    }
}

document.addEventListener("DOMContentLoaded", initProfilePage);