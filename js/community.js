// ==========================================================================
// 1. STATE MANAGEMENT & INITIAL SEED DATA
// ==========================================================================
const SEED_DISCUSSIONS = [
  {
    id: "dis-101",
    title: "Managing severe PCOS fatigue naturally",
    content: "Lately, my fatigue has been through the roof. Looking for any non-caffeine holistic remedies, supplements, or dietary changes that have genuinely worked for you guys.",
    tag: "PCOS",
    author: "Anonymous Sage",
    likes: 14,
    commentsList: [
      { author: "Wellness_Journey", text: "Spearmint tea helped me!", time: Date.now() - 1000*60*20 },
      { author: "JaneDoe", text: "I started taking Magnesium Glycinate at night, huge difference.", time: Date.now() - 1000*60*10 }
    ],
    createdAt: Date.now() - (1000 * 60 * 45) // 45 minutes ago
  },
  {
    id: "dis-102",
    title: "Gentle yoga flow recommendations for Day 1 cramps",
    content: "Just wanted to share that a short 15-minute child's pose and cat-cow sequence saved my lower back today. Highly recommend staying away from high impact during heavy flows!",
    tag: "Fitness",
    author: "Luna_Wellness",
    likes: 29,
    commentsList: [
      { author: "Sarah22", text: "I'll try this tonight! Thanks for the tip.", time: Date.now() - 1000*60*60*2 }
    ],
    createdAt: Date.now() - (1000 * 60 * 60 * 4) // 4 hours ago
  },
  {
    id: "dis-103",
    title: "Anxiety spikes right before ovulation phase",
    content: "Does anyone else notice their mental health dropping significantly during the luteal or ovulation window? Tracking it helps, but looking for some community reassurance.",
    tag: "Mental Health",
    author: "Aura99",
    likes: 22,
    commentsList: [
      { author: "Emma_W", text: "Yes! PMDD is so real. You're not alone ❤️", time: Date.now() - 1000*60*60*5 },
      { author: "PCOS_Warrior", text: "Tracking is step one, but being gentle with yourself is step two.", time: Date.now() - 1000*60*60*4 }
    ],
    createdAt: Date.now() - (1000 * 60 * 60 * 25) // ~1 day ago
  },
  {
    id: "dis-104",
    title: "Favorite iron-rich meals for heavy bleeders?",
    content: "I always feel so weak by day 3. Any quick, easy iron-rich recipes that don't take an hour to cook? I'm so tired during my period anyway.",
    tag: "Nutrition",
    author: "FoodieFem",
    likes: 45,
    commentsList: [
      { author: "LunaLove", text: "Spinach smoothie with some orange juice (vitamin C helps absorption).", time: Date.now() - 1000*60*30 }
    ],
    createdAt: Date.now() - (1000 * 60 * 60 * 2)
  },
  {
    id: "dis-105",
    title: "How to bring up painful sex with a new doctor?",
    content: "I've had horrible pain for years and my last doctor just said 'relax'. I have an appointment with a new gyno next week. How do I advocate for myself?",
    tag: "Question",
    author: "Brave_One",
    likes: 67,
    commentsList: [
      { author: "Dr_Ally", text: "Be explicit about how it affects your daily life. Use the phrase 'it is impacting my quality of life'.", time: Date.now() - 1000*60*60*12 }
    ],
    createdAt: Date.now() - (1000 * 60 * 60 * 15)
  },
  {
    id: "dis-106",
    title: "I actually love my period tracking app now",
    content: "Just a positive post. For years I felt so disconnected from my body, but tracking my cycle phases has made me feel so much more in tune with why I feel the way I do.",
    tag: "Story",
    author: "CycleSister",
    likes: 112,
    commentsList: [],
    createdAt: Date.now() - (1000 * 60 * 60 * 48)
  },
  {
    id: "dis-107",
    title: "Why does no one talk about period flu?",
    content: "Does anyone else feel like they have a full-blown cold the day before their period starts? Body aches, chills, fatigue... it's the worst and I feel like no one ever talks about it!",
    tag: "Periods",
    author: "RedTentGlow",
    likes: 85,
    commentsList: [
      { author: "Emma_W", text: "Yes! 'Period flu' is totally a thing, caused by the sudden drop in estrogen.", time: Date.now() - 1000*60*60*1 },
      { author: "JaneDoe", text: "I get this every single month. Ginger tea and a heating pad are my only survival tools.", time: Date.now() - 1000*60*30 }
    ],
    createdAt: Date.now() - (1000 * 60 * 60 * 6)
  },
  {
    id: "dis-108",
    title: "Anyone else get intensely emotional over tiny things?",
    content: "I literally cried today because my toast popped up too fast. The PMS hormones are no joke this cycle.",
    tag: "Periods",
    author: "FeelingItAll",
    likes: 120,
    commentsList: [
      { author: "PCOS_Warrior", text: "Cried at a dog commercial yesterday, right there with you 😂", time: Date.now() - 1000*60*60*3 }
    ],
    createdAt: Date.now() - (1000 * 60 * 60 * 8)
  }
];

// Read from LocalStorage or inject baseline data
let discussions = JSON.parse(localStorage.getItem('prama_discussions')) || SEED_DISCUSSIONS;

// Force inject the new dummy posts if they aren't loaded in the browser yet
if (!discussions.find(d => d.id === 'dis-107')) {
  discussions = SEED_DISCUSSIONS;
  localStorage.setItem('prama_discussions', JSON.stringify(discussions));
}

let userLikes = JSON.parse(localStorage.getItem('prama_user_likes')) || [];
let userBookmarks = JSON.parse(localStorage.getItem('prama_user_bookmarks')) || [];
let userNotifications = JSON.parse(localStorage.getItem('prama_notifications')) || [
  { text: "Welcome to the Prama Community! Join the discussion.", time: Date.now() - 60000 }
];

// Operational UI State variables
let activeFilterCategory = "All";
let searchFilterQuery = "";
let selectedFormTag = "Question"; 
let currentSort = "Newest"; // "Newest", "Top Liked", "Top Discussed"

const syncStorageState = () => {
  localStorage.setItem('prama_discussions', JSON.stringify(discussions));
  localStorage.setItem('prama_user_likes', JSON.stringify(userLikes));
  localStorage.setItem('prama_user_bookmarks', JSON.stringify(userBookmarks));
  localStorage.setItem('prama_notifications', JSON.stringify(userNotifications));
  updateNotificationBadge();
};

function updateNotificationBadge() {
  const notifBtn = document.querySelector('.notification-btn');
  if (!notifBtn) return;
  let badge = notifBtn.querySelector('.notif-badge');
  if (userNotifications.length > 0) {
    if (!badge) {
      notifBtn.innerHTML = `<i class="fa-regular fa-bell"></i><div class="notif-badge" style="position:absolute; top:6px; right:8px; width:8px; height:8px; background:#ef8ea0; border-radius:50%;"></div>`;
      notifBtn.style.position = 'relative';
    }
  } else {
    if (badge) badge.remove();
  }
}

// Compute relative time metrics
function calculateRelativeTime(unixTimestamp) {
  const timeDifference = Date.now() - unixTimestamp;
  const totalMinutes = Math.floor(timeDifference / 60000);
  const totalHours = Math.floor(totalMinutes / 60);

  if (totalMinutes < 1) return 'Just now';
  if (totalMinutes < 60) return `${totalMinutes}m ago`;
  if (totalHours < 24) return `${totalHours}h ago`;
  return new Date(unixTimestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ==========================================================================
// 2. MAIN CORE APPLICATION ENGINE (Runs after HTML finishes loading)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {

  // DOM Node Registrations
  const postsListContainer = document.getElementById('postsList');
  const communitySearchInput = document.getElementById('communitySearch');
  const globalRefreshBtn = document.querySelector('.refresh-btn');

  // Post Sheet controls
  const openPostSheetBtn = document.getElementById('openPostSheet');
  const closePostSheetBtn = document.getElementById('closePostSheet');
  const postSheetEl = document.getElementById('postSheet');
  const primaryOverlayEl = document.getElementById('sheetOverlay');
  const publishPostActionBtn = document.getElementById('publishPost');

  // Post Form inputs
  const inputPostTitle = document.getElementById('postTitle');
  const txtPostContent = document.getElementById('postContent');
  const formTagChips = document.querySelectorAll('.tag-chip');

  // Library Sheet controls
  const librarySheetEl = document.getElementById('librarySheet');
  const libraryOverlayEl = document.getElementById('libraryOverlay');
  const libraryTitleEl = document.getElementById('libraryTitle');
  const libraryContentEl = document.getElementById('libraryContent');
  const closeLibraryActionBtn = document.getElementById('closeLibrary');

  // Shortcuts
  const likedPostsBtn = document.getElementById('likedPostsBtn');
  const savedPostsBtn = document.getElementById('savedPostsBtn');

  // ------------------------------------------------------------------------
  // DRAW DASHBOARD DISCUSSIONS
  // ------------------------------------------------------------------------
  function renderDiscussionsDashboard() {
    if (!postsListContainer) return;
    postsListContainer.innerHTML = '';

    // Filter logic
    let processedFeed = discussions.filter(item => {
      const evaluatesCategory = (activeFilterCategory === "All") || (item.tag.toLowerCase() === activeFilterCategory.toLowerCase());
      const evaluatesSearch = item.title.toLowerCase().includes(searchFilterQuery.toLowerCase()) || 
                              item.content.toLowerCase().includes(searchFilterQuery.toLowerCase());
      return evaluatesCategory && evaluatesSearch;
    });

    // Sort logic
    if (currentSort === "Newest") {
      processedFeed.sort((x, y) => y.createdAt - x.createdAt);
    } else if (currentSort === "Top Liked") {
      processedFeed.sort((x, y) => y.likes - x.likes);
    } else if (currentSort === "Top Discussed") {
      processedFeed.sort((x, y) => {
        const xCount = x.commentsList ? x.commentsList.length : (x.comments || 0);
        const yCount = y.commentsList ? y.commentsList.length : (y.comments || 0);
        return yCount - xCount;
      });
    }

    if (processedFeed.length === 0) {
      postsListContainer.innerHTML = `
        <div class="empty-card">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 36px; color:#ef8ea0; margin-bottom:12px;"></i>
          <h4>No Matches Found</h4>
          <p>We couldn't find anything matching your filters or search query. Try broadening your terms.</p>
        </div>
      `;
      return;
    }

    // Build actual markup strings safely
    processedFeed.forEach(post => {
      const isLiked = userLikes.includes(post.id);
      const isSaved = userBookmarks.includes(post.id);
      const commentCount = post.commentsList ? post.commentsList.length : (post.comments || 0);

      const postCard = document.createElement('div');
      postCard.className = 'post-card';
      postCard.innerHTML = `
        <div class="post-top">
          <div class="post-user">
            <div class="post-avatar">
              <i class="fa-solid fa-user"></i>
            </div>
            <div>
              <h5 style="color: #1d4f80; font-weight: 600; margin: 0; text-align: left;">${post.author}</h5>
              <small style="color: #999; font-size:11px;">${calculateRelativeTime(post.createdAt)}</small>
            </div>
          </div>
        </div>
        <div style="margin-top: 12px; text-align: left;">
          <h4 class="post-title" style="margin-bottom: 6px;">${post.title}</h4>
          <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 10px;">${post.content}</p>
          <span class="post-tag">${post.tag}</span>
        </div>
        <div class="post-actions">
          <button class="like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
            <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            <span>${post.likes}</span>
          </button>
          <button class="comment-btn" data-post-id="${post.id}">
            <i class="fa-regular fa-comment"></i>
            <span>${commentCount}</span>
          </button>
          <button class="bookmark-btn ${isSaved ? 'bookmarked' : ''}" data-post-id="${post.id}">
            <i class="${isSaved ? 'fa-solid' : 'fa-bookmark'}"></i>
            <span>${isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
        
        <!-- Inline Comments Section -->
        <div class="comments-section" id="comments-${post.id}" style="display: none; margin-top: 15px; border-top: 1px solid #f0f0f0; padding-top: 12px; transition: all 0.3s ease;">
          <div class="comments-list" id="comments-list-${post.id}" style="max-height: 180px; overflow-y: auto; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;">
            ${renderCommentsHTML(post.commentsList)}
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="text" class="comment-input" id="comment-input-${post.id}" data-post-id="${post.id}" placeholder="Add a comment..." style="flex: 1; padding: 10px 14px; border: 1px solid #e0e0e0; border-radius: 20px; outline: none; font-size: 13px; background: #f9f9f9;">
            <button class="submit-comment-btn" data-post-id="${post.id}" style="background: #c084fc; color: white; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">
              <i class="fa-solid fa-paper-plane" style="font-size: 13px;"></i>
            </button>
          </div>
        </div>
      `;
      postsListContainer.appendChild(postCard);
    });

    attachPostActionListeners();
  }

  function renderCommentsHTML(commentsList) {
    if (!commentsList || commentsList.length === 0) {
      return `<div style="text-align: center; color: #999; font-size: 12px; padding: 10px 0;">Be the first to comment!</div>`;
    }
    return commentsList.map(c => `
      <div style="background: #f8f9fa; padding: 10px; border-radius: 12px; font-size: 13px; text-align: left;">
        <strong style="color: #1d4f80; font-size: 12px;">${c.author}</strong>
        <span style="color: #999; font-size: 10px; margin-left: 6px;">${calculateRelativeTime(c.time || Date.now())}</span>
        <p style="margin: 4px 0 0 0; color: #444; line-height: 1.4;">${c.text}</p>
      </div>
    `).join('');
  }

  // INTERACTION LISTENERS (LIKES & BOOKMARKS)
  function attachPostActionListeners() {
    document.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', (event) => {
        const activeBtn = event.currentTarget;
        const id = activeBtn.getAttribute('data-post-id');
        const index = discussions.findIndex(item => item.id === id);

        if (userLikes.includes(id)) {
          userLikes = userLikes.filter(storedId => storedId !== id);
          if (index !== -1) discussions[index].likes--;
        } else {
          userLikes.push(id);
          if (index !== -1) discussions[index].likes++;
        }
        syncStorageState();
        renderDiscussionsDashboard();
      });
    });

    document.querySelectorAll('.bookmark-btn').forEach(btn => {
      btn.addEventListener('click', (event) => {
        const activeBtn = event.currentTarget;
        const id = activeBtn.getAttribute('data-post-id');

        if (userBookmarks.includes(id)) {
          userBookmarks = userBookmarks.filter(storedId => storedId !== id);
        } else {
          userBookmarks.push(id);
        }
        syncStorageState();
        renderDiscussionsDashboard();
      });
    });

    document.querySelectorAll('.comment-btn').forEach(btn => {
      btn.addEventListener('click', (event) => {
        const id = event.currentTarget.getAttribute('data-post-id');
        const commentsSection = document.getElementById(`comments-${id}`);
        if (commentsSection.style.display === 'none') {
          commentsSection.style.display = 'block';
        } else {
          commentsSection.style.display = 'none';
        }
      });
    });

    // Helper to handle submitting a comment
    const submitComment = (id, inputEl) => {
      const text = inputEl.value.trim();
      if (!text) return;
      
      const index = discussions.findIndex(item => item.id === id);
      if (index !== -1) {
        if (!discussions[index].commentsList) discussions[index].commentsList = [];
        discussions[index].commentsList.push({
          author: "You",
          text: text,
          time: Date.now()
        });
        discussions[index].comments = discussions[index].commentsList.length;
        syncStorageState();
        
        const listEl = document.getElementById(`comments-list-${id}`);
        listEl.innerHTML = renderCommentsHTML(discussions[index].commentsList);
        inputEl.value = '';
        
        const commentBtnSpan = document.querySelector(`.comment-btn[data-post-id="${id}"] span`);
        if (commentBtnSpan) commentBtnSpan.textContent = discussions[index].commentsList.length;
        
        setTimeout(() => listEl.scrollTop = listEl.scrollHeight, 50);
      }
    };

    document.querySelectorAll('.submit-comment-btn').forEach(btn => {
      btn.addEventListener('click', (event) => {
        const id = event.currentTarget.getAttribute('data-post-id');
        const inputEl = document.getElementById(`comment-input-${id}`);
        submitComment(id, inputEl);
      });
    });

    document.querySelectorAll('.comment-input').forEach(input => {
      input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          const id = event.currentTarget.getAttribute('data-post-id');
          submitComment(id, event.currentTarget);
        }
      });
    });
  }

  // ------------------------------------------------------------------------
  // TOPIC CHIPS CATEGORY SELECTION & TEXT SEARCH
  // ------------------------------------------------------------------------
  const dynamicFilterButtons = document.querySelectorAll('.topics-scroll .topic-card, .quick-access-section .topic-card, .community-shortcuts button');

  dynamicFilterButtons.forEach(btn => {
    // Avoid short-circuiting dedicated standalone liked/saved logic modules
    if (btn.id === 'likedPostsBtn' || btn.id === 'savedPostsBtn') return;

    btn.addEventListener('click', (event) => {
      const selectedValue = event.target.textContent.trim();

      if (["Latest", "Trending", "Questions", "All"].includes(selectedValue)) {
        activeFilterCategory = "All";
      } else if (["Liked", "Saved"].includes(selectedValue)) {
        return; // Handled exclusively by layout overlay modules below
      } else {
        activeFilterCategory = selectedValue;
      }

      dynamicFilterButtons.forEach(element => {
        if (element.textContent.trim() === selectedValue) {
          element.classList.add('active');
        } else {
          element.classList.remove('active');
        }
      });

      renderDiscussionsDashboard();
    });
  });

  if (communitySearchInput) {
    communitySearchInput.addEventListener('input', (event) => {
      searchFilterQuery = event.target.value.trim();
      renderDiscussionsDashboard();
    });
  }

  // Toast Helper for Filters
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style = "position:fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 10px 20px; border-radius: 20px; font-size: 13px; z-index: 9999; opacity: 0; transition: opacity 0.3s;";
    document.body.appendChild(toast);
    setTimeout(() => toast.style.opacity = '1', 10);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  const filterBtn = document.querySelector('.filter-btn');
  if (filterBtn) {
    filterBtn.addEventListener('click', () => {
      if (currentSort === "Newest") currentSort = "Top Liked";
      else if (currentSort === "Top Liked") currentSort = "Top Discussed";
      else currentSort = "Newest";
      
      showToast(`Sorted by: ${currentSort}`);
      renderDiscussionsDashboard();
    });
  }

  if (globalRefreshBtn) {
    globalRefreshBtn.addEventListener('click', () => {
      renderDiscussionsDashboard();
      globalRefreshBtn.textContent = "Updated!";
      setTimeout(() => { globalRefreshBtn.textContent = "Refresh"; }, 1200);
    });
  }

  // ------------------------------------------------------------------------
  // OVERLAY BOTTOM SHEETS ARCHITECTURE (OPEN / CLOSE ENGINE)
  // ------------------------------------------------------------------------
  function setSheetVisibility(sheetElement, overlayElement, makeVisible = true) {
    if (!sheetElement || !overlayElement) return;
    if (makeVisible) {
      sheetElement.classList.add('active');
      overlayElement.classList.add('active');
      document.body.style.overflow = 'hidden'; 
    } else {
      sheetElement.classList.remove('active');
      overlayElement.classList.remove('active');
      document.body.style.overflow = ''; 
    }
  }

  // Create Post Open/Close Actions
  if (openPostSheetBtn && postSheetEl && primaryOverlayEl) {
    openPostSheetBtn.addEventListener('click', () => setSheetVisibility(postSheetEl, primaryOverlayEl, true));
    closePostSheetBtn.addEventListener('click', () => setSheetVisibility(postSheetEl, primaryOverlayEl, false));
    primaryOverlayEl.addEventListener('click', () => setSheetVisibility(postSheetEl, primaryOverlayEl, false));
  }

  // Selection loop inside the creation form tag deck
  formTagChips.forEach(chip => {
    chip.addEventListener('click', () => {
      formTagChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedFormTag = chip.textContent.trim();
    });
  });

  // Action Publish logic execution
  if (publishPostActionBtn) {
    publishPostActionBtn.addEventListener('click', () => {
      const cleanTitle = inputPostTitle.value.trim();
      const cleanContent = txtPostContent.value.trim();

      if (!cleanTitle || !cleanContent) {
        alert("Please enter both a title and context details to publish your thread successfully.");
        return;
      }

      const dynamicUserPost = {
        id: `dis-${Date.now()}`,
        title: cleanTitle,
        content: cleanContent,
        tag: selectedFormTag,
        author: "Anonymous Creator",
        likes: 0,
        comments: 0,
        createdAt: Date.now()
      };

      discussions.unshift(dynamicUserPost);
      syncStorageState();

      inputPostTitle.value = '';
      txtPostContent.value = '';
      
      setSheetVisibility(postSheetEl, primaryOverlayEl, false);
      renderDiscussionsDashboard();
    });
  }

  // ------------------------------------------------------------------------
  // RECOVERY ROUTINES FOR SAVED / LIKED VIEWS
  // ------------------------------------------------------------------------
  function populateAndOpenLibrarySheet(collectionType) {
    if (!libraryTitleEl || !libraryContentEl || !librarySheetEl || !libraryOverlayEl) return;
    
    if (collectionType === 'notifications') {
      libraryTitleEl.textContent = 'Notifications';
      libraryContentEl.innerHTML = '';
      if (userNotifications.length === 0) {
        libraryContentEl.innerHTML = `<div style="text-align: center; color:#777; padding: 40px 20px;"><p>No notifications yet.</p></div>`;
      } else {
        userNotifications.forEach(n => {
          const div = document.createElement('div');
          div.style = "padding: 14px 16px; border-bottom: 1px solid #eee; font-size: 13.5px; color: #333; text-align: left; line-height: 1.4;";
          div.innerHTML = `<strong style="color: #c084fc; font-size:16px; margin-right:4px;">•</strong> ${n.text} <div style="font-size:11px; color:#999; margin-top:6px;"><i class="fa-regular fa-clock"></i> ${calculateRelativeTime(n.time)}</div>`;
          libraryContentEl.appendChild(div);
        });
        
        // Mark as read visually
        const badge = document.querySelector('.notification-btn .notif-badge');
        if (badge) badge.remove();
      }
      setSheetVisibility(librarySheetEl, libraryOverlayEl, true);
      return;
    }
    
    libraryTitleEl.textContent = collectionType === 'liked' ? 'Liked Conversations' : 'Saved Discussions';
    libraryContentEl.innerHTML = '';

    const activeTrackingIDs = collectionType === 'liked' ? userLikes : userBookmarks;
    const filteredMatches = discussions.filter(post => activeTrackingIDs.includes(post.id));

    if (filteredMatches.length === 0) {
      libraryContentEl.innerHTML = `
        <div style="text-align: center; color:#777; padding: 40px 20px;">
           <i class="fa-regular fa-folder-open" style="font-size: 32px; margin-bottom: 12px; color: #ef8ea0;"></i>
           <p style="font-size: 14px; margin: 0;">This collection is currently empty.</p>
        </div>`;
    } else {
      filteredMatches.forEach(item => {
        const elementNode = document.createElement('div');
        elementNode.className = 'saved-post';
        elementNode.style.textAlign = 'left';
        elementNode.innerHTML = `
          <h4 style="margin-bottom: 4px;">${item.title}</h4>
          <span class="post-tag" style="margin-bottom:8px; display:inline-block;">${item.tag}</span>
          <p style="margin:0; font-size:13px; color:#555; line-height:1.5;">${item.content.substring(0, 110)}${item.content.length > 110 ? '...' : ''}</p>
        `;
        libraryContentEl.appendChild(elementNode);
      });
    }

    setSheetVisibility(librarySheetEl, libraryOverlayEl, true);
  }

  // Event handlers attached to dedicated shortcuts buttons
  if (likedPostsBtn) likedPostsBtn.addEventListener('click', () => populateAndOpenLibrarySheet('liked'));
  if (savedPostsBtn) savedPostsBtn.addEventListener('click', () => populateAndOpenLibrarySheet('saved'));
  
  const notifBtnMain = document.querySelector('.notification-btn');
  if (notifBtnMain) {
    notifBtnMain.addEventListener('click', () => {
      populateAndOpenLibrarySheet('notifications');
    });
  }

  // Trap matching actions from bottom contextual menu lists
  document.querySelectorAll('.quick-access-section .quick-filter').forEach(btn => {
    btn.addEventListener('click', (event) => {
      const contextName = event.target.textContent.trim().toLowerCase();
      if (contextName === 'saved') {
        populateAndOpenLibrarySheet('saved');
      }
    });
  });

  if (closeLibraryActionBtn && libraryOverlayEl) {
    closeLibraryActionBtn.addEventListener('click', () => setSheetVisibility(librarySheetEl, libraryOverlayEl, false));
    libraryOverlayEl.addEventListener('click', () => setSheetVisibility(librarySheetEl, libraryOverlayEl, false));
  }

  // ------------------------------------------------------------------------
  // SYSTEM BOOT INSTRUCTIONS & REAL-TIME SIMULATION
  // ------------------------------------------------------------------------
  renderDiscussionsDashboard();

  // Simulate real-time activity from other "users"
  const fakeComments = [
    "I totally agree with this!",
    "Thanks for sharing your experience.",
    "Sending hugs! You got this.",
    "I had the exact same thing happen to me last month.",
    "This is so relatable.",
    "Have you tried switching your routine? It helped me.",
    "You are not alone in this ❤️",
    "Wow, this is so helpful, thanks!",
    "I'll definitely bring this up with my doctor.",
    "Such a great point!"
  ];
  const fakeAuthors = ["Emma_W", "PCOS_Warrior", "LunaLove", "Sarah22", "Wellness_Journey", "JaneDoe"];

  setInterval(() => {
    if (discussions.length > 0) {
      const randomIndex = Math.floor(Math.random() * discussions.length);
      const post = discussions[randomIndex];
      
      if (Math.random() > 0.5) {
        post.likes++;
        const likeSpan = document.querySelector(`.like-btn[data-post-id="${post.id}"] span`);
        if (likeSpan && !likeSpan.parentElement.classList.contains('liked')) {
          likeSpan.textContent = post.likes;
        }
        
        if (post.author === "Anonymous Creator") {
          userNotifications.unshift({ text: `Someone liked your post "${post.title.substring(0, 15)}..."`, time: Date.now() });
        } else if (userBookmarks.includes(post.id)) {
          userNotifications.unshift({ text: `A post you saved ("${post.title.substring(0, 15)}...") got a new like!`, time: Date.now() });
        }
      } else {
        if (!post.commentsList) post.commentsList = [];
        const authorName = fakeAuthors[Math.floor(Math.random() * fakeAuthors.length)];
        const newComment = {
          author: authorName,
          text: fakeComments[Math.floor(Math.random() * fakeComments.length)],
          time: Date.now()
        };
        post.commentsList.push(newComment);
        post.comments = post.commentsList.length;
        
        const commentSpan = document.querySelector(`.comment-btn[data-post-id="${post.id}"] span`);
        if (commentSpan) commentSpan.textContent = post.comments;
        
        const commentsListEl = document.getElementById(`comments-list-${post.id}`);
        if (commentsListEl && commentsListEl.parentElement.style.display !== 'none') {
          commentsListEl.innerHTML = renderCommentsHTML(post.commentsList);
          commentsListEl.scrollTop = commentsListEl.scrollHeight;
        }
        
        if (post.author === "Anonymous Creator") {
          userNotifications.unshift({ text: `${authorName} commented on your post "${post.title.substring(0, 15)}..."`, time: Date.now() });
        } else if (userBookmarks.includes(post.id)) {
          userNotifications.unshift({ text: `${authorName} commented on a post you saved!`, time: Date.now() });
        }
      }
      syncStorageState();
    }
  }, 6000); // Every 6 seconds simulate some interaction
  
  // Initial Notification Badge Boot
  updateNotificationBadge();
});