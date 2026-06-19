document.addEventListener("DOMContentLoaded", () => {

  let currentQuestion = 0;

  let quizSession = {
    answers: {},
    startedAt: Date.now()
  };

  const questions = [
    {
      type: "options",
      question: "How often do you feel tired during the day?",
      options: ["Never", "Sometimes", "Often", "Always"]
    },
    {
      type: "options",
      question: "Do you experience irregular periods?",
      options: ["Yes", "No", "Sometimes"]
    },
    {
      type: "options",
      question: "How is your energy level?",
      options: ["High", "Medium", "Low"]
    },
    {
      type: "date",
      question: "When is your birthday?"
    }
  ];

  // ELEMENTS (SAFE CHECK)
  const questionEl = document.getElementById("question");
  const optionsEl = document.getElementById("options");
  const birthdayWrapper = document.getElementById("birthday-wrapper");
  const birthdayInput = document.getElementById("birthday-input");
  const progressText = document.getElementById("progress-text");
  const progressFill = document.getElementById("progress-fill");
  const nextBtn = document.getElementById("next-btn");
  const skipBtn = document.querySelector(".skip-btn");

  if (!questionEl || !optionsEl || !nextBtn || !skipBtn) {
    console.error("Missing HTML elements");
    return;
  }

  function showQuestion() {

    const q = questions[currentQuestion];

    questionEl.textContent = q.question;

    optionsEl.innerHTML = "";
    birthdayWrapper.style.display = "none";

    // OPTIONS
    if (q.type === "options") {

      q.options.forEach((opt) => {

        const div = document.createElement("div");
        div.className = "option";

        div.innerHTML = `
          <div class="option-icon">
            <i class="fa-solid fa-circle-check"></i>
          </div>

          <span>${opt}</span>

          <div class="check">
            <i class="fa-solid fa-check"></i>
          </div>
        `;

        div.onclick = () => {

          quizSession.answers[currentQuestion] = opt;

          document.querySelectorAll(".option")
            .forEach(o => o.classList.remove("selected"));

          div.classList.add("selected");
        };

        optionsEl.appendChild(div);
      });
    }

    // DATE
    if (q.type === "date") {
      birthdayWrapper.style.display = "block";

      birthdayInput.onchange = () => {
        quizSession.answers[currentQuestion] = birthdayInput.value;
      };
    }

    // PROGRESS FIX
    progressText.textContent =
      `Question ${currentQuestion + 1} of ${questions.length}`;

    progressFill.style.width =
      ((currentQuestion + 1) / questions.length) * 100 + "%";
  }

  function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      showQuestion();
    } else {
      window.location.href = "home.html";
    }
  }

  function skipQuestion() {
    quizSession.answers[currentQuestion] = null;
    nextQuestion();
  }

  nextBtn.addEventListener("click", nextQuestion);
  skipBtn.addEventListener("click", skipQuestion);

  showQuestion();

});