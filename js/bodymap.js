document.addEventListener("DOMContentLoaded", () => {
  const points = document.querySelectorAll(".map-point");
  const indicatorCards = document.querySelectorAll(".indicator-card");
  const panel = document.getElementById("infoPanel");
  const closePanel = document.getElementById("closePanel");
  
  const panelIcon = document.getElementById("panelIcon");
  const panelTitle = document.getElementById("panelTitle");
  const panelRole = document.getElementById("panelRole");
  const panelIssue = document.getElementById("panelIssue");
  
  const blockOneHeader = document.getElementById("blockOneHeader");
  const blockTwoHeader = document.getElementById("blockTwoHeader");

  // SEARCH DOM ELEMENTS
  const dbSearch = document.getElementById("dbSearch");
  const clearSearch = document.getElementById("clearSearch");
  const searchMetrics = document.getElementById("searchMetrics");

  // INFO MODAL DOM ELEMENTS
  const infoBtn = document.querySelector(".info-btn");
  const infoModal = document.getElementById("infoModal");
  const closeModal = document.getElementById("closeModal");

  // CENTRAL CLINICAL LEDGER FOR BIOMARKER TOPICS
  const topicDatabase = {
    "fluid-color": {
      title: "Menstrual Fluid Color Meanings",
      icon: '<i class="fa-solid fa-droplet"></i>',
      bgClass: "linear-gradient(135deg, #ef4f7a, #f6b7c4)",
      h1: "Oxidation & Velocity Science",
      desc1: "The color variation of menstrual fluid (ranging from bright pink or deep red to dark brown or black) is determined by speed and chemical oxidation. Dark red, brown, or black fluid simply means the blood took longer to pass out of the uterus, giving the iron within the cells more time to oxidize in contact with oxygen.",
      h2: "Normal Phase Transitions",
      desc2: "Bright red indicates a swift flow rate, commonly seen on peak flow days. Pinkish fluid typically appears at the very beginning or end of your period, showing that fresh blood has mixed with clear, hydrating cervical mucus secretions."
    },
    "mucus-discharge": {
      title: "Cervical Discharge Function",
      icon: '<i class="fa-solid fa-water"></i>',
      bgClass: "linear-gradient(135deg, #1d4f80, #3b82f6)",
      h1: "The Biological Filter",
      desc1: "Cervical discharge is produced by small crypts inside the cervix and alters its physical composition daily based on changing hormone levels. It acts as a selective barrier, protecting the reproductive system from bacteria or assisting fertility during your peak window.",
      h2: "Estrogen Textural Evolution",
      desc2: "Following your period, low estrogen levels cause dry days. As estrogen rises during the follicular phase, discharge shifts from thick and sticky to a creamy texture. Right before ovulation, it peaks into a stretchy, clear, 'raw egg-white' consistency designed to nourish and guide sperm cells."
    },
    "cramp-mechanics": {
      title: "The Physiology of Cramps",
      icon: '<i class="fa-solid fa-bolt-lightning"></i>',
      bgClass: "linear-gradient(135deg, #d92e63, #ef8ea0)",
      h1: "Prostaglandin Muscular Channels",
      desc1: "Menstrual cramping (dysmenorrhea) is driven by the physical release of natural lipids called Prostaglandins as the uterine lining prepares to shed. These compounds signal the myometrium (the muscular wall of the uterus) to contract, helping detach and expel the tissue.",
      h2: "Inflammatory Pressure Dynamics",
      desc2: "Higher levels of prostaglandins cause stronger, faster contractions. These intense contractions can briefly squeeze adjacent blood vessels, reducing oxygen delivery to the local muscle tissue, which the brain interprets as cramps. This is a normal muscular process, not a disease."
    },
    "bbt-shift": {
      title: "Basal Body Temperature (BBT)",
      icon: '<i class="fa-solid fa-temperature-half"></i>',
      bgClass: "linear-gradient(135deg, #1d4f80, #60a5fa)",
      h1: "Thermal Progesterone Tracking",
      desc1: "Basal Body Temperature is your body's baseline resting temperature measured immediately upon waking. In the first half of the cycle, estrogen keeps your basal temperature in a lower range. Within 24 hours after an egg is successfully released, your temperature shifts upward.",
      h2: "Metabolic Progesterone Spike",
      desc2: "This distinct shift (a rise of about 0.3°C to 0.5°C) is caused by progesterone produced by the corpus luteum, which acts on your brain's internal thermostat. Tracking a sustained thermal rise across three consecutive days helps visually confirm that ovulation occurred."
    },
    "cervix-position": {
      title: "Cervical Structural Positions",
      icon: '<i class="fa-solid fa-up-down-left-right"></i>',
      bgClass: "linear-gradient(135deg, #ef4f7a, #ff7e9d)",
      h1: "Anatomical Architecture Shift",
      desc1: "The cervix physically shifts its height, firmness, and opening diameter throughout the month. During non-fertile windows, the cervix sits low in the vaginal canal, feels firm to the touch (similar to the tip of a nose), and remains tightly closed to protect the uterus.",
      h2: "The Fertile State (SHOW)",
      desc2: "As ovulation approaches, rising estrogen levels cause the cervix to soften (feeling like your lips), rise higher up into the canal, and open slightly. This fertile state is often remembered by the acronym SHOW: Soft, High, Open, and Wet."
    },
    "digestive-bloat": {
      title: "Cyclic Digestion & Bloating",
      icon: '<i class="fa-solid fa-stomach"></i>',
      bgClass: "linear-gradient(135deg, #d92e63, #f6b7c4)",
      h1: "Smooth Muscle Deceleration",
      desc1: "Pre-period abdominal bloating is often directly related to the muscle-relaxing effects of progesterone. While progesterone relaxes the uterus to prevent premature contractions, it also relaxes smooth muscle tissue throughout your digestive tract, slowing down gut motility.",
      h2: "Gas Retention & Reset Dynamics",
      desc2: "As digestion slows, food moves through the digestive tract less rapidly, which can lead to increased natural gas accumulation, water retention, and a feeling of fullness. When hormone levels drop right before your flow starts, gut motility typically returns to its baseline rate."
    },
    "blood-clots": {
      title: "Menstrual Coagulation & Clots",
      icon: '<i class="fa-solid fa-cloud-showers-heavy"></i>',
      bgClass: "linear-gradient(135deg, #8b0000, #d92e63)",
      h1: "Anti-Coagulant Saturation",
      desc1: "During heavy flow periods, your body releases anti-coagulants to thin the blood. When the flow rate is too rapid, these plasma elements become saturated, causing the blood to clump into gel-like masses or clots.",
      h2: "The Size Threshold Matrix",
      desc2: "Clots smaller than a quarter (2.5 cm) that are dark red/purple are normal, representing shedding tissue. Clots consistently larger than a quarter can point to hormonal dominance profiles or structural variations."
    }
  };

  // ==========================================================================
  // REAL-TIME SEARCH LOGIC ENGINE
  // ==========================================================================
  dbSearch.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (query === "") {
      resetSearchUX();
      return;
    }

    clearSearch.style.display = "block";
    let totalMatchesCount = 0;

    // Evaluate Hotspots
    points.forEach(point => {
      const titleText = point.dataset.title.toLowerCase();
      const roleText = point.dataset.role.toLowerCase();
      const issueText = point.dataset.issue.toLowerCase();

      if (titleText.includes(query) || roleText.includes(query) || issueText.includes(query)) {
        point.classList.add("search-match");
        point.classList.remove("search-fade");
        totalMatchesCount++;
      } else {
        point.classList.remove("search-match");
        point.classList.add("search-fade");
      }
    });

    // Evaluate Cards
    indicatorCards.forEach(card => {
      const topicKey = card.getAttribute("data-topic");
      const cardTitle = card.querySelector("h4").textContent.toLowerCase();
      const dbEntry = topicDatabase[topicKey];

      let matchInDatabase = false;
      if (dbEntry) {
        if (dbEntry.title.toLowerCase().includes(query) || 
            dbEntry.h1.toLowerCase().includes(query) || 
            dbEntry.desc1.toLowerCase().includes(query) || 
            dbEntry.h2.toLowerCase().includes(query) || 
            dbEntry.desc2.toLowerCase().includes(query)) {
          matchInDatabase = true;
        }
      }

      if (cardTitle.includes(query) || matchInDatabase) {
        card.classList.add("search-match");
        card.classList.remove("search-fade");
        totalMatchesCount++;
      } else {
        card.classList.remove("search-match");
        card.classList.add("search-fade");
      }
    });

    if (totalMatchesCount > 0) {
      searchMetrics.textContent = `Found across ${totalMatchesCount} biological sectors. Tap a highlighted element to view.`;
    } else {
      searchMetrics.textContent = "No mechanical matches found for this term.";
    }

    if (panel.classList.contains("open")) {
      highlightActivePanelText(query);
    }
  });

  function highlightActivePanelText(word) {
    const targets = [panelTitle, panelRole, panelIssue, blockOneHeader, blockTwoHeader];
    targets.forEach(element => {
      let rawText = element.textContent.replace(/<\/?mark[^>]*>/g, "");
      element.innerHTML = rawText; 

      if (word && word.length > 0) {
        const regex = new RegExp(`(${escapeRegExp(word)})`, "gi");
        element.innerHTML = rawText.replace(regex, '<mark class="encyclopedia-highlight">$1</mark>');
      }
    });
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function resetSearchUX() {
    dbSearch.value = "";
    clearSearch.style.display = "none";
    searchMetrics.textContent = "";
    points.forEach(p => p.classList.remove("search-match", "search-fade"));
    indicatorCards.forEach(c => c.classList.remove("search-match", "search-fade"));
    highlightActivePanelText("");
  }

  clearSearch.addEventListener("click", resetSearchUX);

  // ==========================================================================
  // HYDRATION AND ROUTING HANDLERS
  // ==========================================================================
  points.forEach(point => {
    point.addEventListener("click", () => {
      clearActiveStates();
      point.classList.add("active");

      panelIcon.style.background = "linear-gradient(135deg,#ef8ea0,#f7c4cf)";
      panelIcon.innerHTML = '<i class="fa-solid fa-heart-pulse"></i>';
      
      blockOneHeader.textContent = "Primary Biological Purpose";
      blockTwoHeader.textContent = "Hormonal Interaction";

      panelTitle.textContent = point.dataset.title;
      panelRole.textContent = point.dataset.role;
      panelIssue.textContent = point.dataset.issue;

      panel.classList.add("open");
      
      if (dbSearch.value.trim() !== "") {
        highlightActivePanelText(dbSearch.value.trim());
      }
    });
  });

  indicatorCards.forEach(card => {
    card.addEventListener("click", () => {
      clearActiveStates();
      card.classList.add("active");

      const topicKey = card.getAttribute("data-topic");
      const data = topicDatabase[topicKey];

      if (data) {
        panelIcon.style.background = data.bgClass;
        panelIcon.innerHTML = data.icon;
        
        panelTitle.textContent = data.title;
        blockOneHeader.textContent = data.h1;
        panelRole.textContent = data.desc1;
        
        blockTwoHeader.textContent = data.h2;
        panelIssue.textContent = data.desc2;

        panel.classList.add("open");

        if (dbSearch.value.trim() !== "") {
          highlightActivePanelText(dbSearch.value.trim());
        }
      }
    });
  });

  function clearActiveStates() {
    points.forEach(item => item.classList.remove("active"));
  }

  closePanel.addEventListener("click", () => {
    panel.classList.remove("open");
    clearActiveStates();
    highlightActivePanelText("");
  });

  // ==========================================================================
  // INFO MANUAL MODAL PIPELINE
  // ==========================================================================
  infoBtn.addEventListener("click", () => {
    infoModal.classList.add("modal-open");
  });

  closeModal.addEventListener("click", () => {
    infoModal.classList.remove("modal-open");
  });

  infoModal.addEventListener("click", (e) => {
    if (e.target === infoModal) {
      infoModal.classList.remove("modal-open");
    }
  });
});