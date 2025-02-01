const startContainer = document.querySelector(".start_btn"),
  quizButton = document.querySelector(".start_btn button"),
  infoBox = document.querySelector(".info_box"),
  exitBtn = document.querySelector(".exit"),
  continueBtn = document.querySelector(".continue"),
  selectContainer = document.querySelector(".container");

infoBox.classList.add("hide");
selectContainer.classList.add("hide");

quizButton.addEventListener("click", () => {
  startContainer.classList.add("hide");
  infoBox.classList.remove("hide");
});

exitBtn.addEventListener("click", () => {
  infoBox.classList.add("hide");
  startContainer.classList.remove("hide");
});

continueBtn.addEventListener("click", () => {
  infoBox.classList.add("hide");
  startContainer.classList.add("hide");
  selectContainer.classList.remove("hide");
});

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
  startScreen = document.querySelector(".start-screen"),
  difficulty = document.querySelector("#difficulty"),
  timePerQuestion = document.querySelector("#time"),
  quiz = document.querySelector(".quiz"),
  submitBtn = document.querySelector(".submit"),
  nextBtn = document.querySelector(".next");

// Prevent Reload or Exit
window.addEventListener("beforeunload", (event) => {
  event.preventDefault();
});

// Save progress in sessionStorage when quiz starts
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

      sessionStorage.setItem("quizStarted", "true");

      startScreen.classList.add("hide");
      quiz.classList.remove("hide");

      currentQuestion = 0;
      showQuestion(questions[currentQuestion]);
    })
    .catch((error) => {
      console.error("Error fetching quiz data:", error);
      alert(error.message);
    });
};


if (startBtn) {
  startBtn.addEventListener("click", startQuiz);
}

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

  questionNumber.innerHTML = `Question <span class="current">${
    currentQuestion + 1
  }</span><span class="total">/${questions.length}</span>`;

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

  time = parseInt(timePerQuestion.value, 10) || 30;
  startTimer(time);
};

const startTimer = (time) => {
  clearInterval(timer);
  let countdown = time;

  timer = setInterval(() => {
    if (countdown >= 0) {
      progress(countdown, time);
      countdown--;
    } else {
      checkAnswer();
    }
  }, 1000);
};

submitBtn.addEventListener("click", () => {
  const selectedAnswer = document.querySelector(".answer.selected");
  if (!selectedAnswer) {
    alert("Please select an answer before submitting.");
    return;
  }
  checkAnswer();
});

const checkAnswer = () => {
  clearInterval(timer);

  const selectedAnswer = document.querySelector(".answer.selected");

  if (selectedAnswer) {
    const answer = selectedAnswer.querySelector(".text");

    if (
      answer.textContent.trim() === questions[currentQuestion].correct_answer
    ) {
      score++;
      selectedAnswer.classList.add("correct");
    } else {
      document.querySelectorAll(".answer").forEach((answer) => {
        if (
          answer.querySelector(".text").innerHTML ===
          questions[currentQuestion].correct_answer
        ) {
          answer.classList.add("correct");
        }
        selectedAnswer.classList.add("wrong");
      });
    }
  } else {
    document.querySelectorAll(".answer").forEach((answer) => {
      if (
        answer.querySelector(".text").innerHTML ===
        questions[currentQuestion].correct_answer
      ) {
        answer.classList.add("correct");
      }
    });
  }

  document
    .querySelectorAll(".answer")
    .forEach((answer) => answer.classList.add("checked"));

  submitBtn.style.display = "none";
  nextBtn.style.display = "block";
};

nextBtn.addEventListener("click", () => {
  nextQuestion();
  nextBtn.style.display = "none";
  submitBtn.style.display = "block";

  if (submitBtn) submitBtn.disabled = true;
});

const nextQuestion = () => {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    showQuestion(questions[currentQuestion]);
  } else {
    showScore();
    nextBtn.style.display = "none";
    submitBtn.style.display = "none";
  }
};

const endScore = document.querySelector(".end-screen"),
  finalScore = document.querySelector(".final-score"),
  totalScore = document.querySelector(".total-score");

const showScore = () => {
  endScore.classList.remove("hide");
  quiz.classList.add("hide");
  finalScore.innerHTML = score;
  totalScore.innerHTML = `/${questions.length}`;
};

const restartBtn = document.querySelector(".restart");
restartBtn.addEventListener("click", () => {
  sessionStorage.removeItem("quizStarted");
  endScore.classList.add("hide");
  startContainer.classList.add("hide");
  infoBox.classList.add("hide");
  selectContainer.classList.remove("hide");
  startScreen.classList.remove("hide");
});

const exitQuiz = document.querySelector(".btn.exit");
exitQuiz.addEventListener("click", () => {
  window.location.reload();
});
