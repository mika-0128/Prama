// ==========================================
// CORE STATE MANAGEMENT & USER LOG MATRICES
// ==========================================
// Local timezone-safe Date helpers
function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatLocalDate(dateObj) {
  if (!dateObj || isNaN(dateObj.getTime())) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

let currentSelectedDate = formatLocalDate(new Date());
let calendarDate = new Date();
let isPeriodEditMode = false;

// Pull state from client storage with clean initialization fallbacks
let periodDates = JSON.parse(localStorage.getItem('periodDates')) || [];
let dailyLogs = JSON.parse(localStorage.getItem('dailyLogs')) || {};

// Executed as soon as DOM tree parsing finishes safely
document.addEventListener("DOMContentLoaded", () => {
  renderCalendar();
  updatePredictionUI();
  renderDailyLogsForSelectedDate();
  setupEvents();
});

// ==========================================
// DECOUPLED FAULT-TOLERANT EVENT LISTENERS
// ==========================================
function setupEvents() {
  // Month Shift Navigation Buttons
  const prevMonth = document.getElementById("prevMonth");
  const nextMonth = document.getElementById("nextMonth");
  if (prevMonth) prevMonth.addEventListener("click", () => { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendar(); });
  if (nextMonth) nextMonth.addEventListener("click", () => { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendar(); });

  // Period Logging Toggle Actions
  const editPeriodsBtn = document.getElementById("editPeriodsBtn");
  if (editPeriodsBtn) editPeriodsBtn.addEventListener("click", togglePeriodEditMode);

  const editPeriodActionBtn = document.getElementById("editPeriodActionBtn");
  if (editPeriodActionBtn) editPeriodActionBtn.addEventListener("click", togglePeriodEditMode);

  // Bottom Sliding Sheet Interactivity Engine
  const addNotesBtn = document.getElementById("addNotesBtn");
  if (addNotesBtn) addNotesBtn.addEventListener("click", openSheet);

  const closeSheetBtn = document.getElementById("closeSheetBtn");
  if (closeSheetBtn) closeSheetBtn.addEventListener("click", closeSheet);

  const sheetOverlay = document.getElementById("sheetOverlay");
  if (sheetOverlay) sheetOverlay.addEventListener("click", closeSheet);

  const saveDailyLogBtn = document.getElementById("saveDailyLogBtn");
  if (saveDailyLogBtn) saveDailyLogBtn.addEventListener("click", saveDailyLog);

  // Dedicated Full-Screen Report Sub-Page Handlers
  const viewReportBtn = document.getElementById("viewReportBtn");
  if (viewReportBtn) viewReportBtn.addEventListener("click", openSummaryPageReport);

  const closeReportPageBtn = document.getElementById("closeReportPageBtn");
  if (closeReportPageBtn) {
    closeReportPageBtn.addEventListener("click", () => {
      const reportPage = document.getElementById("reportPageContainer");
      if (reportPage) reportPage.classList.remove("active");
    });
  }

  const downloadPdfBtn = document.getElementById("downloadPdfBtn");
  if (downloadPdfBtn) downloadPdfBtn.addEventListener("click", exportReportToPDF);

  // Multi-select & Single-select UI Chip Processing Rules
  document.querySelectorAll(".chip-group").forEach(group => {
    const isMulti = group.classList.contains("multi");
    group.querySelectorAll(".chip").forEach(chip => {
      chip.addEventListener("click", () => {
        if (isMulti) {
          chip.classList.toggle("active");
        } else {
          group.querySelectorAll(".chip").forEach(item => item.classList.remove("active"));
          chip.classList.add("active");
        }
      });
    });
  });
}

// ==========================================
// PREDICTION & MATHEMATICAL CYCLE CALCULATORS
// ==========================================
function calculateCycleMetrics() {
  if (periodDates.length === 0) return null;

  // Chronologically sort all recorded period days
  const sortedDates = [...periodDates].map(d => parseLocalDate(d)).sort((a, b) => a - b);
  
  // Isolate distinct cycle start marks (days separated by more than 14 days)
  const cycleStarts = [];
  if (sortedDates.length > 0) cycleStarts.push(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const diffTime = sortedDates[i] - sortedDates[i - 1];
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    if (diffDays > 14) {
      cycleStarts.push(sortedDates[i]);
    }
  }

  // Calculate historical baseline or fallback to default clinical values (28 days)
  let averageCycleLength = 28;
  if (cycleStarts.length > 1) {
    let totalDaysBetween = 0;
    for (let i = 1; i < cycleStarts.length; i++) {
      totalDaysBetween += (cycleStarts[i] - cycleStarts[i - 1]) / (1000 * 60 * 60 * 24);
    }
    averageCycleLength = Math.round(totalDaysBetween / (cycleStarts.length - 1));
  }

  // Pick the most recent tracking start marker to extrapolate forward projections
  const latestStart = cycleStarts[cycleStarts.length - 1];
  
  const nextPeriodDate = new Date(latestStart);
  nextPeriodDate.setDate(latestStart.getDate() + averageCycleLength);

  const ovulationDate = new Date(latestStart);
  ovulationDate.setDate(latestStart.getDate() + averageCycleLength - 14);

  const fertileStart = new Date(ovulationDate);
  fertileStart.setDate(ovulationDate.getDate() - 4);

  const fertileEnd = new Date(ovulationDate);
  fertileEnd.setDate(ovulationDate.getDate() + 1);

  return {
    averageCycleLength,
    latestStart,
    nextPeriod: nextPeriodDate,
    ovulation: ovulationDate,
    fertileStart,
    fertileEnd
  };
}

// ==========================================
// ADVANCED CALENDAR RENDERING LOOPS
// ==========================================
function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  const label = document.getElementById("currentMonth");
  if (!grid || !label) return;

  grid.innerHTML = "";
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  label.textContent = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; 
  const totalDays = new Date(year, month + 1, 0).getDate();
  const metrics = calculateCycleMetrics();

  // Draw empty offset cells for week grid matching
  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "empty-day";
    grid.appendChild(emptyCell);
  }

  // Build the individual day button nodes
  for (let day = 1; day <= totalDays; day++) {
    const btn = document.createElement("button");
    btn.className = "day";
    btn.textContent = day;

    const currentString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const checkDate = new Date(year, month, day);

    // Contextual coloring checks
    if (currentString === formatLocalDate(new Date())) btn.classList.add("today");
    if (currentString === currentSelectedDate) btn.classList.add("selected");
    if (periodDates.includes(currentString)) btn.classList.add("period");
    if (isPeriodEditMode) btn.classList.add("editable");

    // Dynamic coloring of predicted ranges if user has data logs loaded
    if (metrics) {
      const matchStr = formatLocalDate(checkDate);
      
      // Predict length of next period based on a standard 5-day cycle length
      const predEnd = new Date(metrics.nextPeriod);
      predEnd.setDate(metrics.nextPeriod.getDate() + 4);

      if (checkDate >= metrics.nextPeriod && checkDate <= predEnd && !periodDates.includes(matchStr)) {
        btn.classList.add("predicted-period");
      }
      if (matchStr === formatLocalDate(metrics.ovulation)) {
        btn.classList.add("ovulation");
      }
      if (checkDate >= metrics.fertileStart && checkDate <= metrics.fertileEnd) {
        btn.classList.add("fertile");
      }
    }

    btn.addEventListener("click", () => handleDateClick(currentString));
    grid.appendChild(btn);
  }
}

function handleDateClick(dateString) {
  currentSelectedDate = dateString;
  if (isPeriodEditMode) {
    if (periodDates.includes(dateString)) {
      periodDates = periodDates.filter(d => d !== dateString);
      // Synchronize daily log flow to "None" if period date is removed
      if (dailyLogs[dateString]) {
        dailyLogs[dateString].flow = "None";
        localStorage.setItem('dailyLogs', JSON.stringify(dailyLogs));
      }
    } else {
      periodDates.push(dateString);
      // Synchronize daily log flow to "Medium" if period date is added and no flow exists
      if (!dailyLogs[dateString]) {
        dailyLogs[dateString] = {};
      }
      if (!dailyLogs[dateString].flow || dailyLogs[dateString].flow === "None") {
        dailyLogs[dateString].flow = "Medium";
      }
      localStorage.setItem('dailyLogs', JSON.stringify(dailyLogs));
    }
    localStorage.setItem('periodDates', JSON.stringify(periodDates));
    updatePredictionUI();
    renderCalendar();
    renderDailyLogsForSelectedDate();
  } else {
    renderCalendar();
    renderDailyLogsForSelectedDate();
  }
}

function togglePeriodEditMode() {
  isPeriodEditMode = !isPeriodEditMode;
  const btn = document.getElementById("editPeriodsBtn");
  const txt = document.getElementById("editModeText");
  if (btn) btn.classList.toggle("active", isPeriodEditMode);
  if (txt) txt.textContent = isPeriodEditMode ? "Tapping calendar dates will toggle period markers." : "Tap a date to view daily log";
  renderCalendar();
}

// ==========================================
// PREDICTION PANEL UI INJECTION PORTS
// ==========================================
function updatePredictionUI() {
  const metrics = calculateCycleMetrics();
  
  const cycleLengthEl = document.getElementById("cycleLength");
  const nextPeriodEl = document.getElementById("nextPeriod");
  const ovulationDateEl = document.getElementById("ovulationDate");
  const fertileWindowEl = document.getElementById("fertileWindow");
  const cycleStatusEl = document.getElementById("cycleStatus");
  const daysLeftEl = document.getElementById("daysLeft");
  const cycleSubtextEl = document.getElementById("cycleSubtext");
  const progressCircle = document.querySelector(".cycle-progress");
  const insightTextEl = document.getElementById("insightText");

  if (!metrics) {
    if (cycleLengthEl) cycleLengthEl.textContent = "--";
    if (nextPeriodEl) nextPeriodEl.textContent = "No Data";
    if (ovulationDateEl) ovulationDateEl.textContent = "No Data";
    if (fertileWindowEl) fertileWindowEl.textContent = "No Data";
    if (cycleStatusEl) cycleStatusEl.textContent = "No Data Yet";
    if (daysLeftEl) daysLeftEl.textContent = "--";
    if (progressCircle) progressCircle.style.setProperty("--progress", "0deg");
    return;
  }

  // Update Overview Row Metrics Text
  if (cycleLengthEl) cycleLengthEl.textContent = `${metrics.averageCycleLength} Days`;
  if (nextPeriodEl) nextPeriodEl.textContent = metrics.nextPeriod.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (ovulationDateEl) ovulationDateEl.textContent = metrics.ovulation.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  const fStartStr = metrics.fertileStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const fEndStr = metrics.fertileEnd.toLocaleDateString('en-US', { day: 'numeric' });
  if (fertileWindowEl) fertileWindowEl.textContent = `${fStartStr} - ${fEndStr}`;

  // Process biological calculation states
  const today = new Date();
  today.setHours(0,0,0,0);
  const targetPeriod = new Date(metrics.nextPeriod);
  targetPeriod.setHours(0,0,0,0);

  const diffTime = targetPeriod - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeftEl) daysLeftEl.textContent = diffDays > 0 ? diffDays : "0";

  // Phase assessment logic loop
  if (diffDays <= 0 && diffDays >= -5) {
    if (cycleStatusEl) cycleStatusEl.textContent = "Period Phase";
    if (cycleSubtextEl) cycleSubtextEl.textContent = "Keep resting and tracking your comfort indicators.";
    if (progressCircle) progressCircle.style.setProperty("--progress", "360deg");
    if (insightTextEl) insightTextEl.textContent = "Your period has arrived. Focus on hydration and tracking symptoms like flow and cramps inside the sliding logs panel.";
  } else {
    if (cycleStatusEl) cycleStatusEl.textContent = "Follicular Phase";
    if (cycleSubtextEl) cycleSubtextEl.textContent = "Your cycle is progressing. Energy level patterns usually increase.";
    
    // Dynamic radial angle adjustment formula calculation
    const remainingDaysClamped = Math.max(0, Math.min(diffDays, metrics.averageCycleLength));
    const progressAngle = Math.min(360, ((metrics.averageCycleLength - remainingDaysClamped) / metrics.averageCycleLength) * 360);
    if (progressCircle) progressCircle.style.setProperty("--progress", `${progressAngle}deg`);
    
    if (insightTextEl) insightTextEl.textContent = `Your next period is predicted to begin in ${diffDays} days. Your fertile window peak falls around ${metrics.ovulation.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`;
  }
}

// ==========================================
// DAILY SELECTION DATA PERSISTENCE MODALS
// ==========================================
function openSheet() {
  const sheet = document.getElementById("dailySheet");
  const overlay = document.getElementById("sheetOverlay");
  const title = document.getElementById("sheetDateText");
  
  if (sheet && overlay) {
    if (title) title.textContent = parseLocalDate(currentSelectedDate).toLocaleDateString('en-US', { dateStyle: 'long' });
    
    const log = dailyLogs[currentSelectedDate] || {};
    document.querySelectorAll(".chip-group").forEach(group => {
      const field = group.dataset.field;
      const values = Array.isArray(log[field]) ? log[field] : [log[field]];
      group.querySelectorAll(".chip").forEach(chip => {
        chip.classList.toggle("active", values.includes(chip.dataset.value));
      });
    });

    if (document.getElementById("weightInput")) document.getElementById("weightInput").value = log.weight || "";
    if (document.getElementById("noteInput")) document.getElementById("noteInput").value = log.note || "";

    sheet.classList.add("active");
    overlay.classList.add("active");
  }
}

function closeSheet() {
  if (document.getElementById("dailySheet")) document.getElementById("dailySheet").classList.remove("active");
  if (document.getElementById("sheetOverlay")) document.getElementById("sheetOverlay").classList.remove("active");
}

function saveDailyLog() {
  let log = dailyLogs[currentSelectedDate] || {};
  
  document.querySelectorAll(".chip-group").forEach(group => {
    const field = group.dataset.field;
    if (group.classList.contains("multi")) {
      let activeChips = [];
      group.querySelectorAll(".chip.active").forEach(c => activeChips.push(c.dataset.value));
      log[field] = activeChips;
    } else {
      const activeChip = group.querySelector(".chip.active");
      log[field] = activeChip ? activeChip.dataset.value : "";
    }
  });

  log.weight = document.getElementById("weightInput") ? document.getElementById("weightInput").value : "";
  log.note = document.getElementById("noteInput") ? document.getElementById("noteInput").value : "";

  // Dynamic flow synchronization:
  if (log.flow && log.flow !== "None" && log.flow !== "") {
    if (!periodDates.includes(currentSelectedDate)) {
      periodDates.push(currentSelectedDate);
    }
  } else if (log.flow === "None" || log.flow === "") {
    periodDates = periodDates.filter(d => d !== currentSelectedDate);
  }
  localStorage.setItem('periodDates', JSON.stringify(periodDates));

  dailyLogs[currentSelectedDate] = log;
  localStorage.setItem('dailyLogs', JSON.stringify(dailyLogs));
  
  closeSheet();
  renderDailyLogsForSelectedDate();
  updatePredictionUI();
  renderCalendar();
}

function renderDailyLogsForSelectedDate() {
  const title = document.getElementById("selectedDateTitle");
  const sub = document.getElementById("selectedDateSubtitle");
  const display = document.getElementById("selectedDateLogs");
  if (!title || !display) return;

  title.textContent = parseLocalDate(currentSelectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const log = dailyLogs[currentSelectedDate];

  if (!log || Object.keys(log).length === 0) {
    if (sub) sub.textContent = "No log entry saved";
    display.innerHTML = `<div class="empty-log"><i class="fa-solid fa-calendar-days"></i><p>No logged inputs on this day.</p></div>`;
    return;
  }

  if (sub) sub.textContent = "Daily overview details";
  display.innerHTML = "";

  Object.entries(log).forEach(([key, val]) => {
    if (!val || (Array.isArray(val) && val.length === 0)) return;
    const row = document.createElement("div");
    row.className = "log-item";
    row.innerHTML = `
      <div class="log-left"><i class="fa-solid fa-circle-dot"></i><span>${key.toUpperCase()}</span></div>
      <div class="log-right"><span>${Array.isArray(val) ? val.join(", ") : val}</span></div>
    `;
    display.appendChild(row);
  });
}

// ==========================================
// 3-MONTH ANALYTICS COMPILATION & EXPORT
// ==========================================
function openSummaryPageReport() {
  const logKeys = Object.keys(dailyLogs);
  const today = new Date();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(today.getDate() - 90);

  // Align dates to midnight for consistent comparisons
  const ninetyDaysAgoMidnight = new Date(ninetyDaysAgo);
  ninetyDaysAgoMidnight.setHours(0, 0, 0, 0);
  const todayMidnight = new Date(today);
  todayMidnight.setHours(23, 59, 59, 999);

  const activeLogsInQuarter = logKeys.filter(key => {
    const logDate = parseLocalDate(key);
    return logDate >= ninetyDaysAgoMidnight && logDate <= todayMidnight;
  });

  const metrics = calculateCycleMetrics();
  const baselineCycle = metrics ? metrics.averageCycleLength : 28;

  document.getElementById("reportGeneratedDate").textContent = new Date().toLocaleDateString();
  document.getElementById("repAvgCycle").textContent = `${baselineCycle} Days`;
  document.getElementById("repPeriodDays").textContent = `${periodDates.filter(d => {
    const pDate = parseLocalDate(d);
    return pDate >= ninetyDaysAgoMidnight && pDate <= todayMidnight;
  }).length} Days`;
  document.getElementById("repTotalLogs").textContent = activeLogsInQuarter.length;

  let symptomMatrixCounts = {};
  let moodMatrixCounts = {};
  let runningWeightSum = 0;
  let weightsLoggedCount = 0;
  let totalSexCount = 0;
  let pillTakenCount = 0;
  let pillMissedCount = 0;

  activeLogsInQuarter.forEach(key => {
    const log = dailyLogs[key];

    if (log.symptoms && Array.isArray(log.symptoms)) {
      log.symptoms.forEach(sym => { symptomMatrixCounts[sym] = (symptomMatrixCounts[sym] || 0) + 1; });
    }
    if (log.mood) moodMatrixCounts[log.mood] = (moodMatrixCounts[log.mood] || 0) + 1;
    if (log.weight && !isNaN(parseFloat(log.weight))) {
      runningWeightSum += parseFloat(log.weight);
      weightsLoggedCount++;
    }
    if (log.sex === "Yes") totalSexCount++;
    if (log.pills === "Taken") pillTakenCount++;
    if (log.pills === "Missed") pillMissedCount++;
  });

  document.getElementById("repAvgWeight").textContent = weightsLoggedCount > 0 ? `${(runningWeightSum / weightsLoggedCount).toFixed(1)} kg` : "--";
  document.getElementById("repSexDays").textContent = `${totalSexCount} Days`;
  document.getElementById("repPillCount").textContent = (pillTakenCount + pillMissedCount) > 0 ? `Taken: ${pillTakenCount} | Missed: ${pillMissedCount}` : "No Logs";

  buildHistogramList("repSymptomList", symptomMatrixCounts, activeLogsInQuarter.length);
  buildHistogramList("repMoodList", moodMatrixCounts, activeLogsInQuarter.length);

  document.getElementById("reportPageContainer").classList.add("active");
}

function buildHistogramList(containerId, dataMap, maxPossible) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  const items = Object.entries(dataMap).sort((a, b) => b[1] - a[1]);
  if (items.length === 0) {
    container.innerHTML = `<p style="font-size:12px; color:#888; padding: 4px 0;">No active logs tracked inside this window.</p>`;
    return;
  }

  items.slice(0, 4).forEach(([name, count]) => {
    const percentage = maxPossible > 0 ? Math.round((count / maxPossible) * 100) : 0;
    const row = document.createElement("div");
    row.className = "symptom-row-item";
    row.innerHTML = `
      <div class="symptom-meta-info"><span>${name}</span><strong>${count} times (${percentage}%)</strong></div>
      <div class="bar-bg-container"><div class="bar-fill-progress" style="width: ${Math.max(8, percentage)}%;"></div></div>
    `;
    container.appendChild(row);
  });
}

function exportReportToPDF() {
  const element = document.getElementById("pdfPrintCanvas");
  if (!element) return;

  const configurationOptions = {
    margin:       12,
    filename:     `Prama_3Month_Summary_${formatLocalDate(new Date())}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(configurationOptions).from(element).save();
}

// Real-time synchronization across multiple browser tabs/windows
window.addEventListener("storage", (e) => {
  if (e.key === "periodDates" || e.key === "dailyLogs") {
    periodDates = JSON.parse(localStorage.getItem("periodDates")) || [];
    dailyLogs = JSON.parse(localStorage.getItem("dailyLogs")) || {};
    renderCalendar();
    updatePredictionUI();
    renderDailyLogsForSelectedDate();
    
    // If the daily log sliding sheet is currently active, refresh its contents in real-time
    const sheet = document.getElementById("dailySheet");
    if (sheet && sheet.classList.contains("active")) {
      const log = dailyLogs[currentSelectedDate] || {};
      document.querySelectorAll(".chip-group").forEach(group => {
        const field = group.dataset.field;
        const values = Array.isArray(log[field]) ? log[field] : [log[field]];
        group.querySelectorAll(".chip").forEach(chip => {
          chip.classList.toggle("active", values.includes(chip.dataset.value));
        });
      });
      if (document.getElementById("weightInput")) document.getElementById("weightInput").value = log.weight || "";
      if (document.getElementById("noteInput")) document.getElementById("noteInput").value = log.note || "";
    }
  }
});