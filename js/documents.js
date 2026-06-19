document.addEventListener("DOMContentLoaded", () => {
  // Navigation elements
  const modeButtons = document.querySelectorAll(".mode-btn");
  const vaultSection = document.getElementById("vaultSection");
  const simplifySection = document.getElementById("simplifySection");

  // Vault elements
  const fileInput = document.getElementById("fileInput");
  const fileName = document.getElementById("fileName");
  const saveFileBtn = document.getElementById("saveFileBtn");
  const savedList = document.getElementById("savedList");
  const savedEmpty = document.getElementById("savedEmpty");
  const savedCount = document.getElementById("savedCount");
  const searchFilesInput = document.getElementById("searchFiles");
  const sortFilesSelect = document.getElementById("sortFiles");

  // Simplify Report elements
  const reportType = document.getElementById("reportType");
  const dynamicFields = document.getElementById("dynamicFields");
  const explainBtn = document.getElementById("explainBtn");
  const resultText = document.getElementById("resultText");
  const resultCard = document.getElementById("resultCard");

  // Lightbox Modal components
  const imageModal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");
  const modalClose = document.getElementById("modalClose");
  const prevImage = document.getElementById("prevImage");
  const nextImage = document.getElementById("nextImage");

  // Runtime RAM Cache array (IndexedDB synchronization source)
  let savedFiles = [];
  let currentImageIndex = 0;
  let db = null;

  // ------------------------------------------------------------------------
  // INDEXEDDB ENGINE INITIALIZATION (Infinite Storage Configuration)
  // ------------------------------------------------------------------------
  const dbRequest = indexedDB.open("PramaDocVaultDB", 1);

  dbRequest.onupgradeneeded = (e) => {
    let database = e.target.result;
    if (!database.objectStoreNames.contains("medical_documents")) {
      database.createObjectStore("medical_documents", { keyPath: "id" });
    }
  };

  dbRequest.onsuccess = (e) => {
    db = e.target.result;
    loadFilesFromDatabase(); // Load all items on app boot
  };

  dbRequest.onerror = () => {
    console.error("IndexedDB blocked or failed initialization. Falling back to RAM profile.");
  };

  function loadFilesFromDatabase() {
    if (!db) return;
    const transaction = db.transaction("medical_documents", "readonly");
    const store = transaction.objectStore("medical_documents");
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
      savedFiles = getAllRequest.result || [];
      renderSavedFiles();
    };
  }

  // ------------------------------------------------------------------------
  // WORKSPACE WORKFLOW SWITCHER
  // ------------------------------------------------------------------------
  modeButtons.forEach(button => {
    button.addEventListener("click", () => {
      modeButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      if (button.dataset.mode === "vault") {
        vaultSection.classList.add("active-section");
        simplifySection.classList.remove("active-section");
      } else {
        simplifySection.classList.add("active-section");
        vaultSection.classList.remove("active-section");
      }
    });
  });

  // File Selector Input Monitor
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      fileName.textContent = fileInput.files[0].name;
    } else {
      fileName.textContent = "No file selected";
    }
  });

  // ------------------------------------------------------------------------
  // UPGRADED WRITE ROUTINE (Blob Processing To Database Store)
  // ------------------------------------------------------------------------
  saveFileBtn.addEventListener("click", () => {
    const uploadedFile = fileInput.files[0];
    const fileType = document.getElementById("fileType").value;
    const dateTaken = document.getElementById("dateTaken").value;
    const relatedDates = document.getElementById("relatedDates").value;
    const tags = document.getElementById("customTags").value;

    if (!uploadedFile) { return alert("Please choose a file first."); }
    if (!fileType) { return alert("Please select a file type."); }
    if (!dateTaken) { return alert("Please select the date taken."); }

    // Read file payload safely
    const reader = new FileReader();
    reader.onload = function(e) {
      const fileData = {
        id: `file_${Date.now()}`,
        name: uploadedFile.name,
        type: fileType,
        date: dateTaken,
        relatedDates: relatedDates,
        tags: tags,
        url: e.target.result, // Data URL handles both large images and PDF payloads safely in IDB
        isImage: uploadedFile.type.startsWith("image/")
      };

      // Write Transaction to IndexedDB Object Store
      if (db) {
        const transaction = db.transaction("medical_documents", "readwrite");
        const store = transaction.objectStore("medical_documents");
        const addRequest = store.add(fileData);

        addRequest.onsuccess = () => {
          savedFiles.push(fileData);
          renderSavedFiles();
          resetFormFields();
        };
        addRequest.onerror = () => alert("Storage write rejected. Database transaction limit encountered.");
      } else {
        // Fallback context validation
        savedFiles.push(fileData);
        renderSavedFiles();
        resetFormFields();
      }
    };
    reader.readAsDataURL(uploadedFile);
  });

  function resetFormFields() {
    fileInput.value = "";
    fileName.textContent = "No file selected";
    document.getElementById("fileType").value = "";
    document.getElementById("dateTaken").value = "";
    document.getElementById("relatedDates").value = "";
    document.getElementById("customTags").value = "";
  }

  // ------------------------------------------------------------------------
  // DYNAMIC ICON FACTORY ENGINE
  // ------------------------------------------------------------------------
  function getMedicalIconClass(fileType) {
    switch (fileType) {
      case "Doctor Sheet": return "fa-solid fa-file-invoice";
      case "Blood Test": return "fa-solid fa-droplet";
      case "Scan": return "fa-solid fa-xray";
      case "Prescription": return "fa-solid fa-pills";
      default: return "fa-solid fa-file-medical";
    }
  }

  // ------------------------------------------------------------------------
  // RENDER VEHICLE & PIPELINE WITH OPTION DROPDOWNS
  // ------------------------------------------------------------------------
  function renderSavedFiles() {
    savedList.innerHTML = "";
    
    let filtered = [...savedFiles];
    const searchValue = searchFilesInput.value.toLowerCase();

    if (searchValue) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchValue) ||
        file.type.toLowerCase().includes(searchValue) ||
        file.tags.toLowerCase().includes(searchValue)
      );
    }

    const sortValue = sortFilesSelect.value;
    if (sortValue === "newest") { filtered.reverse(); }
    else if (sortValue === "type") { filtered.sort((a, b) => a.type.localeCompare(b.type)); }

    savedCount.textContent = `${filtered.length} records`;
    savedEmpty.style.display = filtered.length ? "none" : "block";

    filtered.forEach(file => {
      const card = document.createElement("div");
      card.className = "file-card";

      const tagsArray = file.tags ? file.tags.split(",").map(t => t.trim()) : [];
      const iconClass = getMedicalIconClass(file.type);

      card.innerHTML = `
        <div class="file-preview">
          ${file.isImage 
            ? `<img src="${file.url}" alt="${file.name}" class="preview-img-trigger" data-id="${file.id}">`
            : `<i class="${iconClass} generic-doc-icon"></i>`
          }
        </div>
        <div class="file-info">
          <div class="file-info-header">
            <h4>${file.name}</h4>
            <div class="menu-container">
              <button class="menu-trigger-btn" title="Options">
                <i class="fa-solid fa-ellipsis-vertical"></i>
              </button>
              <div class="menu-dropdown">
                <a class="menu-item download" href="${file.url}" download="${file.name}">
                  <i class="fa-solid fa-arrow-down-to-line"></i> Download
                </a>
                <button class="menu-item delete delete-file-btn" data-id="${file.id}">
                  <i class="fa-solid fa-trash-can"></i> Delete
                </button>
              </div>
            </div>
          </div>
          <div class="file-tags">
            <span class="tag-type"><i class="${iconClass}" style="font-size:9px; margin-right:3px;"></i>${file.type}</span>
            <span>${file.date}</span>
            ${tagsArray.map(tag => `<span>${tag}</span>`).join("")}
          </div>
        </div>
      `;
      savedList.appendChild(card);
    });

    attachGalleryActionHooks();
  }

  function attachGalleryActionHooks() {
    // Dropdown Menu Toggle Trigger Engine
    document.querySelectorAll(".menu-trigger-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        // Close any other open dropdowns first
        document.querySelectorAll(".menu-container").forEach(container => {
          if (container !== btn.parentElement) container.classList.remove("active");
        });
        btn.parentElement.classList.toggle("active");
      });
    });

    // Eraser Pipeline Interface Trigger
    document.querySelectorAll(".delete-file-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = btn.getAttribute("data-id");
        if (confirm("Permanently erase this document item from internal security database records?")) {
          if (db) {
            const transaction = db.transaction("medical_documents", "readwrite");
            const store = transaction.objectStore("medical_documents");
            const deleteRequest = store.delete(targetId);

            deleteRequest.onsuccess = () => {
              savedFiles = savedFiles.filter(item => item.id !== targetId);
              renderSavedFiles();
            };
          } else {
            savedFiles = savedFiles.filter(item => item.id !== targetId);
            renderSavedFiles();
          }
        }
      });
    });

    // Lightbox triggers
    document.querySelectorAll(".preview-img-trigger").forEach(img => {
      img.addEventListener("click", () => {
        const targetId = img.getAttribute("data-id");
        const imagesOnly = savedFiles.filter(f => f.isImage);
        currentImageIndex = imagesOnly.findIndex(f => f.id === targetId);
        
        if (currentImageIndex !== -1) {
          modalImage.src = imagesOnly[currentImageIndex].url;
          imageModal.classList.add("open");
        }
      });
    });
  }

  // Auto-close menu if clicking anywhere outside on the workspace
  document.addEventListener("click", () => {
    document.querySelectorAll(".menu-container").forEach(container => {
      container.classList.remove("active");
    });
  });

  searchFilesInput.addEventListener("input", renderSavedFiles);
  sortFilesSelect.addEventListener("change", renderSavedFiles);

  // ------------------------------------------------------------------------
  // DYNAMIC REPORT CLINICAL SIMPLIFIER SIMULATOR ENGINE
  // ------------------------------------------------------------------------
  reportType.addEventListener("change", () => {
    const type = reportType.value;
    dynamicFields.innerHTML = "";

    if (type === "blood") {
      dynamicFields.innerHTML = `
        <label>Hemoglobin Level (g/dL)</label>
        <input type="number" step="0.1" id="hemoglobin" placeholder="Normal: 12.0 - 15.5">
        <label>White Blood Cells Count (WBC)</label>
        <input type="number" id="wbc" placeholder="Normal: 4,000 - 11,000">
        <label>Red Blood Cells (RBC)</label>
        <input type="number" step="0.01" id="rbc" placeholder="Normal: 4.0 - 5.2">
      `;
    } else if (type === "scan") {
      dynamicFields.innerHTML = `
        <label>Endometrial Lining Thickness (mm)</label>
        <input type="number" step="0.1" id="lining" placeholder="Example: 8">
        <label>Ovary Pattern / Follicle Notes</label>
        <input type="text" id="scanNotes" placeholder="Example: string of pearls, fluid, normal">
      `;
    } else if (type === "doctor") {
      dynamicFields.innerHTML = `
        <label>Primary Diagnosis or Symptoms Highlighted</label>
        <input type="text" id="doctorNotes" placeholder="Example: Irregular periods, pelvic pain">
      `;
    }
  });

  explainBtn.addEventListener("click", () => {
    const type = reportType.value;
    const cycleTiming = document.getElementById("cycleTiming").value;

    if (!type) { return alert("Please select a report type first."); }

    // Visual Loading State
    const originalBtnText = explainBtn.innerHTML;
    explainBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Analyzing Report...`;
    explainBtn.disabled = true;
    resultCard.style.display = "none";

    // Simulate AI Processing Time
    setTimeout(() => {
      explainBtn.innerHTML = originalBtnText;
      explainBtn.disabled = false;

      let timingInsight = "";

      if (cycleTiming === "period") timingInsight = "During your period, estrogen and progesterone are at their lowest. It is normal for energy levels to dip and inflammation markers to be slightly elevated.";
      else if (cycleTiming === "follicular") timingInsight = "In your follicular phase, rising estrogen should naturally boost your energy and improve insulin sensitivity.";
      else if (cycleTiming === "ovulation") timingInsight = "Around ovulation, LH and FSH peak. You might notice changes in discharge and a slight spike in basal body temperature.";
      else if (cycleTiming === "luteal") timingInsight = "During the luteal phase, progesterone peaks. This is when PMS symptoms, fatigue, and water retention often occur. Blood tests might show different baselines here.";

      let analysisContent = "";

      if (type === "blood") {
        const hb = parseFloat(document.getElementById("hemoglobin")?.value || 0);
        const wbc = parseInt(document.getElementById("wbc")?.value || 0);
        const rbc = parseFloat(document.getElementById("rbc")?.value || 0);

        analysisContent += `<div style="margin-bottom: 12px; color: #1d4f80; font-size: 15px;"><strong>Biomarker Breakdown:</strong></div>`;
        
        if (hb) {
          const hbStatus = hb < 12.0 ? "Low" : (hb > 15.5 ? "High" : "Optimal");
          const hbColor = hb < 12.0 ? "#ef8ea0" : (hb > 15.5 ? "#f5a623" : "#4caf50");
          analysisContent += `
            <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 10px; font-size: 13.5px; line-height: 1.5;">
              <strong>Hemoglobin (${hb} g/dL):</strong> <span style="color: ${hbColor}; font-weight: 600;">${hbStatus}</span><br>
              <span style="color: #555;">This carries oxygen in your blood. ${hbStatus === 'Low' ? 'A low level can explain fatigue, dizziness, or heavy periods. You might need to boost iron intake.' : 'Your levels are healthy.'}</span>
            </div>`;
        }
        
        if (wbc) {
          const wbcStatus = wbc < 4000 ? "Low" : (wbc > 11000 ? "High" : "Optimal");
          const wbcColor = wbc < 4000 ? "#ef8ea0" : (wbc > 11000 ? "#ef8ea0" : "#4caf50");
          analysisContent += `
            <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 10px; font-size: 13.5px; line-height: 1.5;">
              <strong>White Blood Cells (${wbc}):</strong> <span style="color: ${wbcColor}; font-weight: 600;">${wbcStatus}</span><br>
              <span style="color: #555;">These are your immune defenders. ${wbcStatus === 'High' ? 'A high count might indicate your body is fighting off an infection or experiencing inflammation.' : 'Your immune count looks normal.'}</span>
            </div>`;
        }

        if (rbc) {
          const rbcStatus = rbc < 4.0 ? "Low" : (rbc > 5.2 ? "High" : "Optimal");
          const rbcColor = rbc < 4.0 ? "#ef8ea0" : (rbc > 5.2 ? "#f5a623" : "#4caf50");
          analysisContent += `
            <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 10px; font-size: 13.5px; line-height: 1.5;">
              <strong>Red Blood Cells (${rbc}):</strong> <span style="color: ${rbcColor}; font-weight: 600;">${rbcStatus}</span><br>
              <span style="color: #555;">Responsible for oxygen delivery. ${rbcStatus === 'Low' ? 'Lower levels often correlate with anemia.' : 'Your counts are within the expected range.'}</span>
            </div>`;
        }

        if (!hb && !wbc && !rbc) {
          analysisContent = `<p style="font-size: 13.5px; color: #555;">Please enter specific biomarker values above to receive a personalized analysis.</p>`;
        }
      } 
      else if (type === "scan") {
        const thickness = parseFloat(document.getElementById("lining")?.value || 0);
        const notes = (document.getElementById("scanNotes")?.value || "").toLowerCase();

        analysisContent += `<div style="margin-bottom: 12px; color: #1d4f80; font-size: 15px;"><strong>Ultrasound Analysis:</strong></div>`;

        if (thickness) {
          let thickStatus = "Normal";
          if (cycleTiming === "period" && thickness > 4) thickStatus = "Thick for phase";
          if (thickness > 14) thickStatus = "Significantly Thick";
          
          analysisContent += `
            <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 10px; font-size: 13.5px; line-height: 1.5;">
              <strong>Endometrial Lining (${thickness}mm):</strong> <span style="color: #c084fc; font-weight: 600;">${thickStatus}</span><br>
              <span style="color: #555;">The lining of your uterus sheds during your period and grows throughout your cycle. ${thickStatus.includes("Thick") ? 'A thicker lining might warrant a follow-up, especially if you experience heavy bleeding.' : 'This thickness appears appropriate for standard cycle fluctuations.'}</span>
            </div>`;
        }

        if (notes) {
          let insight = "Your notes mention standard observations.";
          if (notes.includes("pearl") || notes.includes("multiple") || notes.includes("follicle") || notes.includes("cyst")) {
            insight = "<strong><i class='fa-solid fa-triangle-exclamation' style='color:#ef8ea0'></i> PCOS Indicator Found:</strong> The mention of 'string of pearls' or multiple follicles/cysts on the ovaries is a classic sign often associated with Polycystic Ovary Syndrome (PCOS). This happens when follicles don't release eggs properly.";
          } else if (notes.includes("fluid")) {
            insight = "Free fluid can sometimes be seen normally after ovulation, or it might indicate a ruptured cyst.";
          }
          analysisContent += `
            <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 10px; font-size: 13.5px; line-height: 1.5;">
              <strong>Clinical Notes Insight:</strong><br>
              <span style="color: #555;">${insight}</span>
            </div>`;
        }

        if (!thickness && !notes) {
          analysisContent = `<p style="font-size: 13.5px; color: #555;">Please provide measurements or scan notes to generate an analysis.</p>`;
        }
      } 
      else if (type === "doctor") {
        const docVal = document.getElementById("doctorNotes")?.value || "";
        if (docVal) {
          analysisContent += `
            <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 10px; font-size: 13.5px; line-height: 1.5;">
              <strong>Action Plan Simplified:</strong><br>
              <span style="color: #555;">Based on your notes: <em>"${docVal}"</em>. <br><br>The primary focus should be logging these specific symptoms daily. Bring a symptom diary to your next appointment. If you were prescribed medication, ensure you understand its interaction with your cycle phase.</span>
            </div>`;
        } else {
          analysisContent = `<p style="font-size: 13.5px; color: #555;">Insert doctor's notes or target phrases to extract a simplified action plan.</p>`;
        }
      }

      resultText.innerHTML = `
        ${analysisContent}
        ${timingInsight ? `<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 13.5px; color: #444; line-height: 1.5;"><strong><i class="fa-regular fa-calendar-check" style="color: #ef8ea0; margin-right: 4px;"></i> Cycle Context:</strong> <br>${timingInsight}</div>` : ""}
      `;
      resultCard.style.display = "block";
    }, 300); // 300ms micro-delay for quick transition
  });

  // Lightbox controllers
  modalClose.addEventListener("click", () => imageModal.classList.remove("open"));
  
  nextImage.addEventListener("click", () => {
    const imagesOnly = savedFiles.filter(f => f.isImage);
    if (!imagesOnly.length) return;
    currentImageIndex = (currentImageIndex + 1) % imagesOnly.length;
    modalImage.src = imagesOnly[currentImageIndex].url;
  });

  prevImage.addEventListener("click", () => {
    const imagesOnly = savedFiles.filter(f => f.isImage);
    if (!imagesOnly.length) return;
    currentImageIndex = (currentImageIndex - 1 + imagesOnly.length) % imagesOnly.length;
    modalImage.src = imagesOnly[currentImageIndex].url;
  });
});