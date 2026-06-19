const sideEffects = [
  {
    id:"irregular-periods",
    title:"Irregular Periods",
    category:"Cycle",
    icon:"fa-calendar-days",
    desc:"Periods that are delayed, skipped, or unpredictable."
  },
  {
    id:"acne-oily-skin",
    title:"Acne & Oily Skin",
    category:"Skin",
    icon:"fa-face-smile",
    desc:"Hormonal changes may trigger acne or oily skin."
  },
  {
    id:"hair-fall",
    title:"Hair Fall & Thinning",
    category:"Hair",
    icon:"fa-scissors",
    desc:"Increased hair fall or thinning of scalp hair."
  },
  {
    id:"weight-gain",
    title:"Weight Gain & Difficulty Losing Weight",
    category:"Metabolic",
    icon:"fa-weight-scale",
    desc:"Unexplained weight gain or slow metabolism."
  },
  {
    id:"excess-hair-growth",
    title:"Excess Hair Growth",
    category:"Hair",
    icon:"fa-user",
    desc:"Unwanted hair growth on face, chin, chest, or body."
  },
  {
    id:"mood-swings",
    title:"Mood Swings & Anxiety",
    category:"Mood",
    icon:"fa-brain",
    desc:"Emotional ups and downs, irritability, or anxiety."
  },
  {
    id:"fatigue",
    title:"Fatigue & Low Energy",
    category:"Metabolic",
    icon:"fa-battery-quarter",
    desc:"Feeling tired even after enough rest."
  },
  {
    id:"fertility-concerns",
    title:"Fertility Concerns",
    category:"Cycle",
    icon:"fa-heart",
    desc:"Difficulty conceiving due to irregular ovulation."
  }
];

const list = document.getElementById("effectsList");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const chips = document.querySelectorAll(".chip");
const resultCount = document.getElementById("resultCount");

let selectedCategory = "All";

function renderList(){
  let filtered = [...sideEffects];

  const searchValue = searchInput.value.toLowerCase();

  if(searchValue){
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(searchValue) ||
      item.category.toLowerCase().includes(searchValue)
    );
  }

  if(selectedCategory !== "All"){
    filtered = filtered.filter(item => item.category === selectedCategory);
  }

  if(sortSelect.value === "az"){
    filtered.sort((a,b) => a.title.localeCompare(b.title));
  }

  if(sortSelect.value === "category"){
    filtered.sort((a,b) => a.category.localeCompare(b.category));
  }

  resultCount.textContent = `${filtered.length} results`;

  list.innerHTML = "";

  filtered.forEach(item => {
    const card = document.createElement("a");

    card.href = `side-effect-detail.html?id=${item.id}`;
    card.className = "effect-card";

    card.innerHTML = `
      <div class="effect-icon">
        <i class="fa-solid ${item.icon}"></i>
      </div>

      <div class="effect-info">
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
        <span class="category-tag">${item.category}</span>
      </div>

      <i class="fa-solid fa-chevron-right arrow"></i>
    `;

    list.appendChild(card);
  });
}

searchInput.addEventListener("input", renderList);
sortSelect.addEventListener("change", renderList);

chips.forEach(chip => {
  chip.addEventListener("click", () => {
    chips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");

    selectedCategory = chip.dataset.category;

    renderList();
  });
});

renderList();

// Modal Logic
const infoPopupBtn = document.getElementById("infoPopupBtn");
const infoModalOverlay = document.getElementById("infoModalOverlay");
const closeInfoModal = document.getElementById("closeInfoModal");

if(infoPopupBtn && infoModalOverlay && closeInfoModal) {
  function openModal() {
    infoModalOverlay.style.display = "flex";
    // trigger reflow for transition
    void infoModalOverlay.offsetWidth;
    infoModalOverlay.style.opacity = "1";
    infoModalOverlay.querySelector('.info-modal-content').style.transform = "scale(1)";
  }

  function closeModal() {
    infoModalOverlay.style.opacity = "0";
    infoModalOverlay.querySelector('.info-modal-content').style.transform = "scale(0.9)";
    setTimeout(() => {
      infoModalOverlay.style.display = "none";
    }, 300);
  }

  infoPopupBtn.addEventListener("click", openModal);
  closeInfoModal.addEventListener("click", closeModal);
  
  // Close if clicked outside
  infoModalOverlay.addEventListener("click", (e) => {
    if(e.target === infoModalOverlay) {
      closeModal();
    }
  });
}