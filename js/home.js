/*
===================================================
PRAMA HOME MODULE MANAGEMENT ENGINE (SYNCHRONIZED)
===================================================
*/

document.addEventListener("DOMContentLoaded", () => {
  updateDate();
  renderHomeCycleInsights();
  renderHomeCycleOverview();
  renderPersonalInsights();
  setupSearchEngine(); // Active real-time app dashboard search controller
});

// Updates structural greeting block timestamp strings
function updateDate() {
  const todayDate = document.getElementById("todayDate");
  if (!todayDate) return;

  todayDate.textContent = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}

// Local timezone-safe Date helpers
function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Global state hooks aligned directly with the tracking database module
const periodDates = JSON.parse(localStorage.getItem("periodDates")) || [];

// Maps individual timestamp data points into isolated cycle clusters
function getCycleStarts(dates) {
  if (!dates.length) return [];
  // Parse and sort chronologically
  const sorted = [...dates].map(d => parseLocalDate(d)).sort((a, b) => a - b);
  const starts = [];

  if (sorted.length > 0) starts.push(sorted[0]);

  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.round((sorted[i] - sorted[i - 1]) / (1000 * 60 * 60 * 24));
    // If the gap between two tracked days is greater than 14 days, it indicates a new cycle start
    if (diff > 14) {
      starts.push(sorted[i]);
    }
  }
  return starts;
}

// Measures exact day variances between mapped metrics milestones
function calculateCycleLengths(starts) {
  const lengths = [];
  for (let i = 1; i < starts.length; i++) {
    const prev = new Date(starts[i - 1]);
    const curr = new Date(starts[i]);
    lengths.push(Math.round((curr - prev) / (1000 * 60 * 60 * 24)));
  }
  return lengths;
}

// Tallies sequential tracking marks to output active period lengths
function calculateLastPeriodLength(dates) {
  if (!dates.length) return null;
  const sorted = [...dates].map(d => parseLocalDate(d)).sort((a, b) => a - b);

  // Find the last tracked day and work backwards to count consecutive entries
  let count = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    const diff = Math.round((sorted[i] - sorted[i - 1]) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

// Builds UI data fields and historic mini bar graph visual trackers
function renderHomeCycleInsights() {
  const avgEl = document.getElementById("homeAverageCycle");
  const periodEl = document.getElementById("homePeriodLength");
  const statusEl = document.getElementById("homeCycleStatus");
  const chart = document.getElementById("cycleMiniChart");

  if (!avgEl || !periodEl || !statusEl || !chart) return;

  const starts = getCycleStarts(periodDates);
  const cycles = calculateCycleLengths(starts);
  const lastPeriod = calculateLastPeriodLength(periodDates);

  if (!periodDates.length) {
    avgEl.textContent = "No Data";
    periodEl.textContent = "No Data";
    statusEl.textContent = "Start tracking";
    chart.innerHTML = "";
    return;
  }

  // Calculate moving cycle average length baseline
  if (cycles.length) {
    const avg = Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length);
    avgEl.textContent = `${avg} days`;
    statusEl.textContent = (avg >= 21 && avg <= 35) ? "Usually Regular" : "May Be Irregular";
  } else {
    avgEl.textContent = "28 days (Est.)";
    statusEl.textContent = "Calibrating baseline...";
  }

  periodEl.textContent = lastPeriod ? `${lastPeriod} days` : "No Data";

  if (cycles.length === 0) {
    chart.innerHTML = `<p class="chart-empty">Log multi-month cycles to see chart</p>`;
    return;
  }

  // Generate responsive bars limited to last 5 logs for aesthetic scaling
  chart.innerHTML = cycles.slice(-5).map(cycle => {
    const height = Math.min(Math.max(cycle * 2.2, 15), 85);
    return `<div class="chart-bar" style="height:${height}px" title="${cycle} days"></div>`;
  }).join("");
}

// Processes historical points to compute status tracking phase metrics
function renderHomeCycleOverview() {
  const phaseEl = document.getElementById("cyclePhase");
  const predictionEl = document.getElementById("cyclePrediction");
  const badgeEl = document.getElementById("cycleDayBadge");

  if (!phaseEl || !predictionEl || !badgeEl) return;

  if (!periodDates.length) {
    phaseEl.textContent = "No Data Yet";
    predictionEl.textContent = "Start tracking to see predictions";
    badgeEl.textContent = "--";
    return;
  }

  const starts = getCycleStarts(periodDates);
  if (!starts.length) return;

  const lastStart = new Date(starts[starts.length - 1]);
  const today = new Date();

  // Set accurate time baselines to drop residual device runtime hour values
  today.setHours(0, 0, 0, 0);
  lastStart.setHours(0, 0, 0, 0);

  const cycleDay = Math.floor((today - lastStart) / (1000 * 60 * 60 * 24)) + 1;

  if (cycleDay < 1) {
    phaseEl.textContent = "Cycle Initialized";
    predictionEl.textContent = "Waiting for data progression...";
    badgeEl.textContent = "Day 1";
    return;
  }

  let phase = "";
  let info = "";

  // Dynamic clinical cycle framework assignment blocks
  if (cycleDay <= 5) {
    phase = "Menstrual Phase";
    info = "Period currently active";
  } else if (cycleDay <= 13) {
    phase = "Follicular Phase";
    info = "Body preparing for ovulation";
  } else if (cycleDay <= 16) {
    phase = "Ovulation Window";
    info = "Peak fertility tier reached";
  } else if (cycleDay <= 35) {
    phase = "Luteal Phase";
    info = "Cycle ending window approaches";
  } else {
    phase = "Delayed Phase";
    info = "Cycle variation exceeds typical windows";
  }

  phaseEl.textContent = phase;
  predictionEl.textContent = info;
  badgeEl.textContent = `Day ${cycleDay}`;
}

// Evaluates historical health vectors to assemble advice updates
function renderPersonalInsights() {
  const title = document.getElementById("personalInsightTitle");
  const text = document.getElementById("personalInsightText");
  if (!title || !text) return;

  if (!periodDates.length) {
    title.textContent = "Let's Get Started";
    text.textContent = "Log your first period to start uncovering personalized insights about your body.";
    return;
  }

  const starts = getCycleStarts(periodDates);
  const cycles = calculateCycleLengths(starts);
  const lastPeriod = calculateLastPeriodLength(periodDates);

  if (!cycles.length) {
    title.textContent = "Keep Tracking!";
    text.textContent = "Log another period to establish your baseline and start seeing your unique cycle trends.";
    return;
  }

  const average = Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length);

  if (average < 21) {
    title.textContent = "Shorter Cycle Notice";
    text.textContent = `Your cycle currently averages ${average} days, which is a bit shorter than typical. If this is unusual for you, consider mentioning it to your doctor.`;
  } else if (average > 35) {
    title.textContent = "Longer Cycle Notice";
    text.textContent = `Your cycle is averaging ${average} days. Occasional longer gaps are perfectly normal, but continuous tracking will help you spot any unusual patterns.`;
  } else {
    title.textContent = "Everything Looks Steady";
    text.textContent = `Great tracking! Your cycle is averaging a healthy ${average} days, and your last period lasted for ${lastPeriod || '--'} days.`;
  }
}

// IN-APP FULL SCREEN SEARCH OVERLAY ENGINE
function setupSearchEngine() {
  const searchTriggerBtn = document.querySelector(".search-btn");
  const overlay = document.getElementById("searchOverlay");
  const closeBtn = document.getElementById("closeSearchBtn");
  const input = document.getElementById("searchInput");
  const cards = document.querySelectorAll(".dashboard-card");
  const feedback = document.getElementById("searchFeedback");

  if (!searchTriggerBtn || !overlay || !closeBtn || !input) return;

  // Open overlay and fire keyboard focus
  searchTriggerBtn.addEventListener("click", () => {
    overlay.classList.add("active");
    setTimeout(() => input.focus(), 150);
  });

  // Reset and slide away search layer panels cleanly
  const closeSearch = () => {
    overlay.classList.remove("active");
    input.value = "";
    cards.forEach(card => card.style.display = "flex");
    if (feedback) feedback.style.display = "none";
  };

  closeBtn.addEventListener("click", closeSearch);

  // Live query card checking loops
  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    let hiddenCardsCount = 0;

    cards.forEach(card => {
      const title = card.querySelector("h4").textContent.toLowerCase();
      const description = card.querySelector("span").textContent.toLowerCase();

      if (title.includes(query) || description.includes(query)) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
        hiddenCardsCount++;
      }
    });

    // Provide localized text response feedback markers depending on grid outputs
    if (feedback) {
      if (query.length > 0 && hiddenCardsCount === cards.length) {
        feedback.innerText = `No tools match "${input.value}"`;
        feedback.style.display = "block";
      } else if (query.length > 0) {
        feedback.innerText = "Filtering active tools dashboard...";
        feedback.style.display = "block";
      } else {
        feedback.style.display = "none";
      }
    }
  });
}

// Real-time synchronization across multiple browser tabs/windows
window.addEventListener("storage", (e) => {
  if (e.key === "periodDates") {
    // Reload period dates
    periodDates.length = 0;
    const freshDates = JSON.parse(localStorage.getItem("periodDates")) || [];
    periodDates.push(...freshDates);
    renderHomeCycleInsights();
    renderHomeCycleOverview();
    renderPersonalInsights();
  }
});