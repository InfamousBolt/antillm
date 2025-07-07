const cocoSsd = require('@tensorflow-models/coco-ssd');
const tf = require('@tensorflow/tfjs');


let win;

window.addEventListener('DOMContentLoaded', () => {
  win = require('@electron/remote').getCurrentWindow();
  attachWindowListeners();
  updateState();
});

function attachWindowListeners() {
  win.on('maximize', updateState);
  win.on('unmaximize', updateState);
  win.on('enter-full-screen', updateState);
  win.on('leave-full-screen', updateState);
}

const video = document.createElement('video');
video.autoplay = true;
video.width = 640;
video.height = 480;
document.body.appendChild(video);

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("Camera access denied:", err);
  });
let detectionCount = 0;

cocoSsd.load().then(model => {
  setInterval(() => {
    model.detect(video).then(predictions => {
      const phoneDetected = predictions.some(p => p.class === 'cell phone' && p.score > 0.3);
      if (phoneDetected) {
        detectionCount++;
        if (detectionCount >= 2) {
          alert("⚠️ Mobile device detected. Please remove it from the frame.");
        }
      } else {
        detectionCount = 0;
      }
    });
  }, 1500); // check every 1.5 seconds
});




const realQuestion = "What is the time complexity of binary search?";
const distractors = [
  "What’s the capital of Peru?",
  "Who painted the Mona Lisa?",
  "How many moons does Saturn have?",
  "Explain recursion with a diagram.",
  "Name one advantage of linked lists.",
  "What is 8 x 7?",
  "Which layer handles IP routing?",
];

function obfuscateText(text, isDistractor = false) {
  const emojiMap = { a: "🅰️", o: "⭕", i: "ℹ️", s: "$", l: "🧍" };
  const homoglyphs = { e: "е", o: "ο", a: "а", c: "ϲ", y: "у" };
  const digitSub = { e: "3", o: "0", s: "5", t: "7" };

  return text.split("").map(char => {
    const lower = char.toLowerCase();
    if (isDistractor && Math.random() < 0.1 && emojiMap[lower]) return emojiMap[lower];
    if (Math.random() < 0.05 && homoglyphs[lower]) return homoglyphs[lower];
    if (Math.random() < 0.05 && digitSub[lower]) return digitSub[lower];
    if (Math.random() < 0.1) return char + "\u200B"; // zero-width space
    return char;
  }).join("");
}

function renderQuizBlock() {
  const root = document.getElementById("quiz-root");

  const block = document.createElement("div");
  block.className = "moving-block";

  const content = [
    ...distractors.sort(() => 0.5 - Math.random()).slice(0, 3).map(q => ({ text: q, type: "distractor" })),
    { text: realQuestion, type: "real" },
    ...distractors.sort(() => 0.5 - Math.random()).slice(0, 3).map(q => ({ text: q, type: "distractor" })),
  ];

  content.forEach(item => {
    const span = document.createElement("span");
    span.className = item.type === "real" ? "real-question" : "distractor";
    span.innerText = obfuscateText(item.text, item.type !== "real");
    block.appendChild(span);
    block.appendChild(document.createTextNode(" "));
  });

  root.appendChild(block);
}

function updateState() {
    const isFull = win.isFullScreen() || win.isMaximized();
  
    const startScreen = document.getElementById('start-screen');
    const instructions = document.querySelector('.instructions');
    const quizRoot = document.getElementById('quiz-root');
  
    if (isFull) {
      document.getElementById('alert-message').style.display = 'none';
      startScreen.style.display = 'flex';
      console.log("Full");
    } else {
      document.getElementById('alert-message').style.display = 'block';
      startScreen.style.display = 'none';
      instructions.style.display = 'none';
      quizRoot.innerHTML = '';
    }
  }
  
  
  document.getElementById("start-btn").addEventListener("click", () => {
    document.getElementById("start-screen").style.display = "none";
    document.querySelector(".instructions").style.display = "block";
    renderQuizBlock();
  });
