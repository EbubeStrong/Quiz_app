// Script for Progress Bar
const progressBar = document.querySelector(".progress-bar"),
  progressText = document.querySelector(".progress-text");

const progress = (value, totalTime) => {
  const percentage = (value / totalTime) * 100;
  progressBar.style.width = `${percentage}%`;
  progressText.innerHTML = `${value}`;
};

let questions = [],
  time = 30,
  score = 0,
  currentQuestion = 0,
  timer;

const startBtn = document.querySelector(".start"),
  numQuestions = document.querySelector("#num-questions"),
  category = document.querySelector("#category"),
  difficulty = document.querySelector("#difficulty"),
  timePerQuestion = document.querySelector("#time"),
  quiz = document.querySelector(".quiz"),
  startScreen = document.querySelector(".start-screen"),
  submitBtn = document.querySelector(".submit"),
  nextBtn = document.querySelector(".next");

// Start Quiz Function
const startQuiz = () => {
  const num = numQuestions.value || 5;
  const cat = category.value !== "any" ? `&category=${category.value}` : "";
  const diff =
    difficulty.value !== "any" ? `&difficulty=${difficulty.value}` : "";
  time = parseInt(timePerQuestion.value, 10) || 30;

  const url = `https://opentdb.com/api.php?amount=${num}${cat}${diff}&type=multiple`;

  console.log("Fetching from:", url);

  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      console.log("API Response:", data);

      if (data.response_code !== 0) {
        throw new Error(`API returned response_code ${data.response_code}`);
      }

      if (!data.results || data.results.length === 0) {
        throw new Error("No questions found. Try changing the settings.");
      }

      questions = data.results;
      console.log("Fetched Questions:", questions);

      startScreen.classList.add("hide");
      quiz.classList.remove("hide");

      currentQuestion = 0; // Ensure we start from the first question
      showQuestion(questions[currentQuestion]);
    })
    .catch((error) => {
      console.error("Error fetching quiz data:", error);
      alert(error.message);
    });
};

startBtn.addEventListener("click", startQuiz);

const showQuestion = (question) => {
  const questionText = document.querySelector(".question"),
    answersWrapper = document.querySelector(".answer-wrapper"),
    questionNumber = document.querySelector(".number");

  questionText.innerHTML = question.question;

  const answers = [
    ...question.incorrect_answers,
    question.correct_answer.toString(),
  ];

  answers.sort(() => Math.random() - 0.5);
  answersWrapper.innerHTML = "";

  answers.forEach((answer) => {
    answersWrapper.innerHTML += `<div class="answer">
            <span class="text">${answer}</span>
            <span class="checkbox">
              <span class="icon">✓</span>
            </span>
          </div>`;
  });

  questionNumber.innerHTML = `
    Question <span class="current">${
      currentQuestion + 1
    }</span><span class="total">/${questions.length}</span>
  `;

  // Event listeners for answer selection
  const answersDiv = document.querySelectorAll(".answer");
  answersDiv.forEach((answer) => {
    answer.addEventListener("click", () => {
      if (!answer.classList.contains("checked")) {
        answersDiv.forEach((a) => a.classList.remove("selected"));
        answer.classList.add("selected");

        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });

  // Start timer
  time = parseInt(timePerQuestion.value, 10) || 30;
  startTimer(time);
};

const startTimer = (time) => {
  clearInterval(timer); // Clear any existing timer
  let countdown = time;

  timer = setInterval(() => {
    if (countdown > 0) {
      progress(countdown, time);
      countdown--;
    } else {
      clearInterval(timer);
    }
  }, 1000);
};
