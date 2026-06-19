// ============================
// PRAMA WELCOME PAGE LOGIC
// ============================

// Quiz button → go to quiz page
const quizBtn = document.querySelector(".quiz-btn");

// Skip button → can go anywhere (home/dashboard/quiz directly)
const skipBtn = document.querySelector(".skip-btn");

// ----------------------------
// START QUIZ
// ----------------------------
if (quizBtn) {
  quizBtn.addEventListener("click", () => {
    window.location.href = "quiz.html";
  });
}

// ----------------------------
// SKIP FLOW
// ----------------------------
if (skipBtn) {
  skipBtn.addEventListener("click", () => {
    // OPTION 1: go directly to quiz anyway (recommended)
    window.location.href = "quiz.html";

    // OPTION 2 (if you want later):
    // window.location.href = "home.html";
  });
}