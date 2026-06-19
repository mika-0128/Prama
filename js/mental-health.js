/*
====================================
PRAMA MENTAL HEALTH WELLNESS ENGINE
====================================
*/

const AFFIRMATIONS_DB = {
  "anxious": "Anxiety is a highly natural biological response to fluctuating hormones and external stressors. You do not need to 'fix' this immediately. Your feelings are valid. Take a slow, gentle breath.",
  "fatigued": "Over 60% of people with menstrual conditions experience this exact level of persistent fatigue. Your body is using massive energy right now. Rest isn't lazy; it is critical physiological work today.",
  "pain": "Severe discomfort is exhausting. It is okay if your productivity drops today. Your boundaries are valid. Do not hesitate to step back and rest completely.",
  "calm": "Feeling numb or low is a completely valid emotional state when dealing with chronic hormonal shifts. There is no pressure to be perfectly happy. Be gentle with yourself today."
};

// Global index storage pointer for dealing with deletions safely inside custom sheets
let pendingDeleteIndex = null;

document.addEventListener("DOMContentLoaded", () => {
  setupMoodListeners();
  setupBreathingTracker();
  setupDiaryStorageEngine();
  createNativeAppElements(); // Injects the custom Toast and Sheet elements into the DOM
});

// Create dynamic HTML containers for App UI modals to avoid manual HTML copy-pasting
function createNativeAppElements() {
  // 1. Toast Notification Container
  if (!document.getElementById('appToast')) {
    const toast = document.createElement('div');
    toast.id = 'appToast';
    toast.className = 'app-toast';
    document.body.appendChild(toast);
  }

  // 2. Action Sheet Bottom Modal Container
  if (!document.getElementById('appActionSheet')) {
    const sheet = document.createElement('div');
    sheet.id = 'appActionSheet';
    sheet.className = 'app-action-sheet-backdrop';
    sheet.innerHTML = `
      <div class="app-action-sheet">
        <div class="sheet-handle"></div>
        <h4 class="sheet-title">Delete Diary Entry?</h4>
        <p class="sheet-subtitle">This action is permanent and cannot be undone.</p>
        <button id="confirmDeleteBtn" class="sheet-btn delete-confirm">Delete Entry</button>
        <button id="cancelDeleteBtn" class="sheet-btn delete-cancel">Cancel</button>
      </div>
    `;
    document.body.appendChild(sheet);

    // Bind inside Actions
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteSheet);
    document.getElementById('confirmDeleteBtn').addEventListener('click', executeDeleteAction);
  }
}

// Show native style feedback toast notification banner
function showAppToast(message) {
  const toast = document.getElementById('appToast');
  if (!toast) return;
  toast.innerText = message;
  toast.classList.add('visible');
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 2800);
}

// Open bottom layout tray menu panel
function openDeleteSheet(index) {
  pendingDeleteIndex = index;
  const sheet = document.getElementById('appActionSheet');
  if (sheet) sheet.classList.add('visible');
}

function closeDeleteSheet() {
  pendingDeleteIndex = null;
  const sheet = document.getElementById('appActionSheet');
  if (sheet) sheet.classList.remove('visible');
}

function executeDeleteAction() {
  if (pendingDeleteIndex !== null) {
    const logs = JSON.parse(localStorage.getItem("prama_diary") || "[]");
    logs.splice(pendingDeleteIndex, 1);
    localStorage.setItem("prama_diary", JSON.stringify(logs));
    
    // Global call reload loop hook targeting active tracker instance inside view
    if (typeof window.refreshDiaryDisplay === 'function') {
      window.refreshDiaryDisplay();
    }
    showAppToast("Entry removed securely.");
  }
  closeDeleteSheet();
}

// Mood Picker Logic
function setupMoodListeners() {
  const container = document.getElementById("moodPickerContainer");
  const outputBox = document.getElementById("affirmationDisplayBox");
  const dynamicStat = document.getElementById("dynamicStat");
  const statText = document.getElementById("statText");
  
  if (!container || !outputBox) return;

  const STATS_DB = {
    "anxious": "You are not alone. 70% of our community feels this exact uncertainty today.",
    "fatigued": "Over 60% of people with menstrual conditions report this persistent exhaustion.",
    "pain": "You belong here. 75% of users experience significant emotional and physical pain drops.",
    "calm": "Your feelings are valid. 65% of people report feeling numb or low during these shifts."
  };

  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".mood-btn");
    if (!btn) return;

    document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const selectedMood = btn.getAttribute("data-mood");
    outputBox.innerHTML = `<b>PRAMA Truth:</b> ${AFFIRMATIONS_DB[selectedMood]}`;
    
    // Show validating community statistic
    statText.innerText = STATS_DB[selectedMood];
    dynamicStat.style.display = "block";
  });
}

// Visual Breathing Pacer Controller (Box-Breathing System)
function setupBreathingTracker() {
  const btn = document.getElementById("breathingPacerBtn");
  if (!btn) return;

  let animationInterval = null;
  let breathStep = 0;
  const routineSteps = ["Inhale (4s) ", "Hold Breath (4s) ", "Exhale (4s) ", "Hold Breath (4s) "];

  btn.addEventListener("click", () => {
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
      btn.innerText = "Start Box Breath";
      btn.removeAttribute("data-step");
      breathStep = 0;
      return;
    }

    btn.innerText = routineSteps[breathStep];
    btn.setAttribute("data-step", "inhale");

    animationInterval = setInterval(() => {
      breathStep = (breathStep + 1) % 4;
      btn.innerText = routineSteps[breathStep];
      
      if (breathStep === 0) btn.setAttribute("data-step", "inhale");
      if (breathStep === 1) btn.setAttribute("data-step", "hold1");
      if (breathStep === 2) btn.setAttribute("data-step", "exhale");
      if (breathStep === 3) btn.setAttribute("data-step", "hold2");
    }, 4000);
  });
}

// LOCAL STORAGE DIARY ENGINE
function setupDiaryStorageEngine() {
  const input = document.getElementById("diaryInput");
  const saveBtn = document.getElementById("saveDiaryBtn");
  const container = document.getElementById("diaryHistoryContainer");

  if (!input || !saveBtn || !container) return;

  const displayLogs = () => {
    const logs = JSON.parse(localStorage.getItem("prama_diary") || "[]");
    
    if (logs.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 30px; color: #aaa; font-size: 13px;">
          <i class="fa-solid fa-feather" style="font-size: 24px; margin-bottom: 8px; color: #ef8ea0; opacity: 0.5;"></i>
          <p>Your diary is empty. Pour your thoughts out safely above.</p>
        </div>`;
      return;
    }

    container.innerHTML = logs.map((entry, index) => `
      <div class="history-item-card" style="position: relative;">
        <div class="history-date">${entry.date}</div>
        <p class="history-text">${entry.text}</p>
        <button onclick="openDeleteSheet(${index})" style="position: absolute; top: 14px; right: 16px; background: none; border: none; color: #ccaeb3; cursor: pointer; font-size: 12px;" title="Delete entry">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `).join('');
  };

  // Click handler to process and record logs
  saveBtn.addEventListener("click", () => {
    const textVal = input.value.trim();
    if (!textVal) {
      showAppToast("Please write something before logging.");
      return;
    }

    const logs = JSON.parse(localStorage.getItem("prama_diary") || "[]");
    
    logs.unshift({
      date: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      text: textVal
    });

    localStorage.setItem("prama_diary", JSON.stringify(logs));
    input.value = ""; 
    displayLogs();    
    showAppToast("Entry logged successfully");
  });

  // Assign internal handler variable context link to window to keep global event row scoped neatly
  window.refreshDiaryDisplay = displayLogs;
  window.openDeleteSheet = openDeleteSheet;

  displayLogs();
}