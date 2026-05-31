const currentLang = localStorage.getItem('lang') || 'en';

const translations = {
  en: {
    title: "Quiz App",
    subtitle: "20 Questions",
    submit: "Submit",
    retry: "Retry",
    showAnswer: "Show Answer",
    scoreText: "You scored {score} out of {total}!",
    incorrectTitle: "Incorrect Answers:",
    questionLabel: "Question:",
    yourAnswerLabel: "Your Answer:",
    correctAnswerLabel: "Correct Answer:",
    quizData: [
      {
        question: "What is the capital of France?",
        options: ["Paris", "London", "Berlin", "Madrid"],
        answer: "Paris",
      },
      {
        question: "What is the largest planet in our solar system?",
        options: ["Mars", "Saturn", "Jupiter", "Neptune"],
        answer: "Jupiter",
      },
      {
        question: "Which country won the FIFA World Cup in 2018?",
        options: ["Brazil", "Germany", "France", "Argentina"],
        answer: "France",
      },
      {
        question: "What is the tallest mountain in the world?",
        options: ["Mount Everest", "K2", "Kangchenjunga", "Makalu"],
        answer: "Mount Everest",
      },
      {
        question: "Which is the largest ocean on Earth?",
        options: ["Pacific Ocean", "Indian Ocean", "Atlantic Ocean", "Arctic Ocean"],
        answer: "Pacific Ocean",
      },
      {
        question: "What is the chemical symbol for gold?",
        options: ["Au", "Ag", "Cu", "Fe"],
        answer: "Au",
      },
      {
        question: "Who painted the Mona Lisa?",
        options: ["Pablo Picasso", "Vincent van Gogh", "Leonardo da Vinci", "Michelangelo"],
        answer: "Leonardo da Vinci",
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Mars", "Venus", "Mercury", "Uranus"],
        answer: "Mars",
      },
      {
        question: "What is the largest species of shark?",
        options: ["Great White Shark", "Whale Shark", "Tiger Shark", "Hammerhead Shark"],
        answer: "Whale Shark",
      },
      {
        question: "Which animal is known as the King of the Jungle?",
        options: ["Lion", "Tiger", "Elephant", "Giraffe"],
        answer: "Lion",
      },
      {
        question: "What is the capital of Japan?",
        options: ["Tokyo", "Kyoto", "Osaka", "Nagoya"],
        answer: "Tokyo",
      },
      {
        question: "Which element has the atomic number 1?",
        options: ["Helium", "Oxygen", "Hydrogen", "Carbon"],
        answer: "Hydrogen",
      },
      {
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Leo Tolstoy"],
        answer: "William Shakespeare",
      },
      {
        question: "What is the smallest country in the world?",
        options: ["Monaco", "San Marino", "Liechtenstein", "Vatican City"],
        answer: "Vatican City",
      },
      {
        question: "Which planet is known for its rings?",
        options: ["Venus", "Saturn", "Jupiter", "Neptune"],
        answer: "Saturn",
      },
      {
        question: "Who discovered penicillin?",
        options: ["Marie Curie", "Alexander Fleming", "Louis Pasteur", "Isaac Newton"],
        answer: "Alexander Fleming",
      },
      {
        question: "Which continent is the Sahara Desert located on?",
        options: ["Asia", "Africa", "Australia", "Europe"],
        answer: "Africa",
      },
      {
        question: "What is the main ingredient in guacamole?",
        options: ["Tomato", "Avocado", "Onion", "Pepper"],
        answer: "Avocado",
      },
      {
        question: "Which country is known as the Land of the Rising Sun?",
        options: ["China", "South Korea", "Thailand", "Japan"],
        answer: "Japan",
      }
    ]
  },
  zh: {
    title: "知识问答",
    subtitle: "20道题目",
    submit: "提交",
    retry: "再试一次",
    showAnswer: "查看答案",
    scoreText: "你的得分是 {score} / {total}！",
    incorrectTitle: "错误题目：",
    questionLabel: "问题：",
    yourAnswerLabel: "你的答案：",
    correctAnswerLabel: "正确答案：",
    quizData: [
      {
        question: "法国的首都是哪里？",
        options: ["巴黎", "伦敦", "柏林", "马德里"],
        answer: "巴黎",
      },
      {
        question: "太阳系中最大的行星是哪一颗？",
        options: ["火星", "土星", "木星", "海王星"],
        answer: "木星",
      },
      {
        question: "哪个国家赢得了2018年FIFA世界杯？",
        options: ["巴西", "德国", "法国", "阿根廷"],
        answer: "法国",
      },
      {
        question: "世界上最高的山峰是哪座？",
        options: ["珠穆朗玛峰", "乔戈里峰", "干城章嘉峰", "马卡鲁峰"],
        answer: "珠穆朗玛峰",
      },
      {
        question: "地球上最大的海洋是哪个？",
        options: ["太平洋", "印度洋", "大西洋", "北冰洋"],
        answer: "太平洋",
      },
      {
        question: "金的化学符号是什么？",
        options: ["Au", "Ag", "Cu", "Fe"],
        answer: "Au",
      },
      {
        question: "谁画了《蒙娜丽莎》？",
        options: ["毕加索", "凡高", "达芬奇", "米开朗基罗"],
        answer: "达芬奇",
      },
      {
        question: "哪颗行星被称为红色星球？",
        options: ["火星", "金星", "水星", "天王星"],
        answer: "火星",
      },
      {
        question: "最大的鲨鱼物种是什么？",
        options: ["大白鲨", "鲸鲨", "虎鲨", "双髻鲨"],
        answer: "鲸鲨",
      },
      {
        question: "哪种动物被称为森林之王？",
        options: ["狮子", "老虎", "大象", "长颈鹿"],
        answer: "狮子",
      },
      {
        question: "日本的首都是哪里？",
        options: ["东京", "京都", "大阪", "名古屋"],
        answer: "东京",
      },
      {
        question: "原子序数为1的元素是什么？",
        options: ["氦", "氧", "氢", "碳"],
        answer: "氢",
      },
      {
        question: "谁写了《罗密欧与朱丽叶》？",
        options: ["查尔斯·狄更斯", "威廉·莎士比亚", "马克·吐温", "列夫·托尔斯泰"],
        answer: "威廉·莎士比亚",
      },
      {
        question: "世界上最小的国家是哪个？",
        options: ["摩纳哥", "圣马力诺", "列支敦士登", "梵蒂冈"],
        answer: "梵蒂冈",
      },
      {
        question: "哪颗行星以其环而闻名？",
        options: ["金星", "土星", "木星", "海王星"],
        answer: "土星",
      },
      {
        question: "谁发现了青霉素？",
        options: ["居里夫人", "亚历山大·弗莱明", "路易·巴斯德", "艾萨克·牛顿"],
        answer: "亚历山大·弗莱明",
      },
      {
        question: "撒哈拉沙漠位于哪个大洲？",
        options: ["亚洲", "非洲", "大洋洲", "欧洲"],
        answer: "非洲",
      },
      {
        question: "鳄梨酱的主要成分是什么？",
        options: ["番茄", "鳄梨", "洋葱", "辣椒"],
        answer: "鳄梨",
      },
      {
        question: "哪个国家被称为日出之国？",
        options: ["中国", "韩国", "泰国", "日本"],
        answer: "日本",
      }
    ]
  }
};

const t = translations[currentLang] || translations.en;
const quizData = t.quizData;

const quizContainer = document.getElementById("quiz");
const resultContainer = document.getElementById("result");
const submitButton = document.getElementById("submit");
const retryButton = document.getElementById("retry");
const showAnswerButton = document.getElementById("showAnswer");
const titleEl = document.querySelector('h1');
const subtitleEl = document.querySelector('h4');

// Localization UI
titleEl.textContent = t.title;
subtitleEl.textContent = t.subtitle;
submitButton.textContent = t.submit;
retryButton.textContent = t.retry;
showAnswerButton.textContent = t.showAnswer;

let currentQuestion = 0;
let score = 0;
let incorrectAnswers = [];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function displayQuestion() {
  const questionData = quizData[currentQuestion];

  const questionElement = document.createElement("div");
  questionElement.className = "question";
  questionElement.innerHTML = `${currentQuestion + 1}. ${questionData.question}`;

  const optionsElement = document.createElement("div");
  optionsElement.className = "options";

  const shuffledOptions = [...questionData.options];
  shuffleArray(shuffledOptions);

  for (let i = 0; i < shuffledOptions.length; i++) {
    const option = document.createElement("label");
    option.className = "option";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "quiz";
    radio.value = shuffledOptions[i];

    const optionText = document.createTextNode(shuffledOptions[i]);

    option.appendChild(radio);
    option.appendChild(optionText);
    optionsElement.appendChild(option);
  }

  quizContainer.innerHTML = "";
  quizContainer.appendChild(questionElement);
  quizContainer.appendChild(optionsElement);
}

function checkAnswer() {
  const selectedOption = document.querySelector('input[name="quiz"]:checked');
  if (selectedOption) {
    const answer = selectedOption.value;
    if (answer === quizData[currentQuestion].answer) {
      score++;
    } else {
      incorrectAnswers.push({
        question: quizData[currentQuestion].question,
        incorrectAnswer: answer,
        correctAnswer: quizData[currentQuestion].answer,
      });
    }
    currentQuestion++;
    selectedOption.checked = false;
    if (currentQuestion < quizData.length) {
      displayQuestion();
    } else {
      displayResult();
    }
  }
}

function displayResult() {
  quizContainer.style.display = "none";
  submitButton.style.display = "none";
  retryButton.style.display = "inline-block";
  showAnswerButton.style.display = "inline-block";
  resultContainer.innerHTML = t.scoreText.replace('{score}', score).replace('{total}', quizData.length);
}

function retryQuiz() {
  currentQuestion = 0;
  score = 0;
  incorrectAnswers = [];
  quizContainer.style.display = "block";
  submitButton.style.display = "inline-block";
  retryButton.style.display = "none";
  showAnswerButton.style.display = "none";
  resultContainer.innerHTML = "";
  displayQuestion();
}

function showAnswer() {
  quizContainer.style.display = "none";
  submitButton.style.display = "none";
  retryButton.style.display = "inline-block";
  showAnswerButton.style.display = "none";

  let incorrectAnswersHtml = "";
  for (let i = 0; i < incorrectAnswers.length; i++) {
    incorrectAnswersHtml += `
        <div class="answer-item">
          <p><strong>${t.questionLabel}</strong> ${incorrectAnswers[i].question}</p>
          <p><strong>${t.yourAnswerLabel}</strong> <span class="wrong">${incorrectAnswers[i].incorrectAnswer}</span></p>
          <p><strong>${t.correctAnswerLabel}</strong> <span class="correct">${incorrectAnswers[i].correctAnswer}</span></p>
        </div>
      `;
  }

  resultContainer.innerHTML = `
      <p class="final-score">${t.scoreText.replace('{score}', score).replace('{total}', quizData.length)}</p>
      <h3>${t.incorrectTitle}</h3>
      <div class="incorrect-list">${incorrectAnswersHtml}</div>
    `;
}

submitButton.addEventListener("click", checkAnswer);
retryButton.addEventListener("click", retryQuiz);
showAnswerButton.addEventListener("click", showAnswer);

displayQuestion();
