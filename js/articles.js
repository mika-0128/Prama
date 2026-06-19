/*
====================================
PRAMA DASHBOARD ROUTING ENGINE
====================================
*/

const ARTICLES_DATABASE = [
  { id: "art-101", title: "The Cortisol Connection: Stress and Your Cycle", summary: "Discover how high daily stress levels and elevated cortisol can physically pause ovulation, lengthen your luteal phase, and completely throw off cycle predictability.", duration: "4 min read", author: "Prama Clinical Team", category: "HORMONES" },
  { id: "art-102", title: "Understanding PCOS: Beyond the Cysts", summary: "Polycystic Ovary Syndrome is often misunderstood. Learn about the metabolic roots of PCOS, insulin resistance, and why you might not actually have cysts at all.", duration: "6 min read", author: "Dr. Sarah Jenkins", category: "CONDITIONS" },
  { id: "art-103", title: "Endometriosis vs. Normal Cramps", summary: "Is your period pain normal, or could it be Endometriosis? A deep dive into the pain scale, secondary symptoms, and when it's time to demand a laparoscopy.", duration: "5 min read", author: "Dr. Elena Rostova", category: "PAIN MANAGEMENT" },
  { id: "art-104", title: "Nutrition for the Luteal Phase", summary: "As progesterone peaks, your body requires more calories and specific micronutrients. A guide to seed cycling, magnesium-rich foods, and curbing sugar cravings naturally.", duration: "3 min read", author: "Nutritionist Maya Lin", category: "NUTRITION" },
  { id: "art-105", title: "The Truth About Hormonal Birth Control", summary: "From the pill to the IUD: How hormonal contraceptives actually work to suppress ovulation, and what to expect during the transition when you decide to stop.", duration: "7 min read", author: "Prama Clinical Team", category: "CONTRACEPTION" }
];

const MYTHS_ROTATION = [
  { myth: "Severe, crippling period pain is normal and something you just have to deal with.", fact: "Mild cramping is normal. Debilitating pain points to underlying concerns like Endometriosis or Adenomyosis." },
  { myth: "It is biologically impossible to get pregnant while on your period.", fact: "Sperm can live inside fertile channels for up to 5 days. Early ovulation means pregnancy is possible." },
  { myth: "You must have cysts on your ovaries to be diagnosed with PCOS.", fact: "PCOS is a metabolic and endocrine syndrome. You can be diagnosed with high androgens and irregular periods alone." },
  { myth: "Your menstrual cycle is strictly 28 days long, and you ovulate exactly on day 14.", fact: "Only 10-15% of women have exactly a 28-day cycle. Healthy cycles can range from 21 to 35 days." }
];

let currentMythIndex = 0;
let showingSavedOnly = false;

document.addEventListener("DOMContentLoaded", () => {
  renderMythsEngine();
  renderArticlesFeed();
  initializeActionListeners();
});

function renderArticlesFeed() {
  const container = document.getElementById("articleList");
  if(!container) return;
  
  let articlesToShow = ARTICLES_DATABASE;
  
  if (showingSavedOnly) {
    const savedArticles = JSON.parse(localStorage.getItem('prama_saved_articles')) || [];
    articlesToShow = ARTICLES_DATABASE.filter(art => savedArticles.includes(art.id));
    
    if (articlesToShow.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color:#777; padding: 40px 20px;">
           <i class="fa-regular fa-bookmark" style="font-size: 32px; margin-bottom: 12px; color: #ef8ea0;"></i>
           <p style="font-size: 14px; margin: 0;">You haven't saved any articles yet.</p>
        </div>`;
      return;
    }
  }

  container.innerHTML = articlesToShow.map(art => `
    <div class="article-feed-card" data-id="${art.id}">
      <div class="art-badge">${art.category || "TRENDING ARTICLE"}</div>
      <h4>${art.title}</h4>
      <p>${art.summary}</p>
      <div class="art-footer-meta"><span>By ${art.author}</span><span><i class="fa-regular fa-clock"></i> ${art.duration}</span></div>
    </div>
  `).join('');
}

function renderMythsEngine() {
  const container = document.getElementById("mythContainer");
  if (!container) return;
  updateSingleMythCard(container);

  setInterval(() => {
    container.style.opacity = 0; 
    setTimeout(() => {
      currentMythIndex = (currentMythIndex + 1) % MYTHS_ROTATION.length;
      updateSingleMythCard(container);
      container.style.opacity = 1; 
    }, 300);
  }, 5000);
}

function updateSingleMythCard(container) {
  const item = MYTHS_ROTATION[currentMythIndex];
  container.innerHTML = `
    <div class="myth-flipper">
      <div class="myth-flipper-inner">
        <div class="myth-front">
          <div class="lbl-m">MYTH <i class="fa-solid fa-circle-xmark"></i></div>
          <p>"${item.myth}"</p>
          <span class="hint-t">Tap to see clinical fact</span>
        </div>
        <div class="myth-back">
          <div class="lbl-f">FACT <i class="fa-solid fa-circle-check"></i></div>
          <p>${item.fact}</p>
        </div>
      </div>
    </div>
  `;
  container.querySelector('.myth-flipper').addEventListener('click', function() { this.classList.toggle('flipped'); });
}

function initializeActionListeners() {
  // Route Grid Boxes out to info-detail.html page parameters
  document.querySelectorAll(".info-box").forEach(box => {
    box.addEventListener("click", () => {
      const key = box.getAttribute("data-info");
      window.location.href = `info-detail.html?topic=${key}`;
    });
  });

  // Route Articles out to article-read.html page parameters
  const articleList = document.getElementById("articleList");
  if(articleList) {
    articleList.addEventListener("click", (e) => {
      const card = e.target.closest(".article-feed-card");
      if (!card) return;
      const id = card.getAttribute("data-id");
      window.location.href = `article-read.html?id=${id}`;
    });
  }

  // Saved Filter Button Logic
  const savedFilterBtn = document.getElementById("savedFilterBtn");
  if (savedFilterBtn) {
    savedFilterBtn.addEventListener("click", () => {
      showingSavedOnly = !showingSavedOnly;
      
      const icon = savedFilterBtn.querySelector('i');
      const infoSection = document.querySelector('.info-hub-section');
      const mythSection = document.querySelector('.myth-section');
      const articleHeader = document.querySelector('.article-section .section-header h3');

      if (showingSavedOnly) {
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        savedFilterBtn.style.color = '#ef8ea0';
        
        if (infoSection) infoSection.style.display = 'none';
        if (mythSection) mythSection.style.display = 'none';
        if (articleHeader) articleHeader.textContent = 'Saved Articles';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
        savedFilterBtn.style.color = '';
        
        if (infoSection) infoSection.style.display = 'block';
        if (mythSection) mythSection.style.display = 'block';
        if (articleHeader) articleHeader.textContent = 'Recent Articles & Reading';
      }
      
      renderArticlesFeed();
    });
  }
}

// Live Search Field logic mapping targeting the reference boxes
const searchInput = document.getElementById("articleSearch");
if(searchInput) {
  searchInput.addEventListener("input", (e) => {
    const text = e.target.value.toLowerCase().trim();
    document.querySelectorAll(".info-box").forEach(box => {
      const title = box.querySelector("span").innerText.toLowerCase();
      box.style.display = title.includes(text) ? "flex" : "none";
    });
  });
}