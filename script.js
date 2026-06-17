const questionDisplay = document.getElementById('questionDisplay');
const answerInput = document.getElementById('answerInput');
const confirmBtn = document.getElementById('confirmBtn');
const playBtn = document.getElementById('playBtn');
const feedback = document.getElementById('feedback');
const correctCount = document.getElementById('correctCount');
const wrongCount = document.getElementById('wrongCount');
const inputArea = document.getElementById('inputArea');
const timerDisplay = document.getElementById('timerDisplay');

const diffEasy = document.getElementById('diffEasy');
const diffModerate = document.getElementById('diffModerate');
const diffHard = document.getElementById('diffHard');
const difficultySelector = document.getElementById('difficultySelector');
const diffLabel = document.getElementById('diffLabel');
const backBtn = document.getElementById('backBtn');

let currentAnswer = null;
let isPlaying = false;
let timerSeconds = 0;
let timerInterval = null;
let currentDifficulty = 'easy';

// --- Difficulty ranges ---
const DIFFICULTY = {
    easy: {
        add:       { a: [1, 50],   b: [1, 50]   },
        subtract:  { a: [10, 100], b: [1, 100]  },
        multiply:  { a: [2, 12],   b: [2, 12]   },
        divide:    { b: [2, 12],   ans: [1, 12]  },
        emoji: '🟢',
        label: 'Fácil'
    },
    moderate: {
        add:       { a: [10, 150], b: [10, 150] },
        subtract:  { a: [50, 300], b: [1, 300]  },
        multiply:  { a: [2, 20],   b: [2, 20]   },
        divide:    { b: [2, 20],   ans: [1, 20]  },
        emoji: '🟡',
        label: 'Moderado'
    },
    hard: {
        add:       { a: [50, 500], b: [50, 500] },
        subtract:  { a: [100, 999], b: [1, 999] },
        multiply:  { a: [5, 30],   b: [5, 30]   },
        divide:    { b: [5, 30],   ans: [1, 30]  },
        emoji: '🔴',
        label: 'Difícil'
    }
};

// --- Utility functions ---
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// --- Timer ---
function updateTimer() {
    timerSeconds++;
    timerDisplay.textContent = `⏱️ ${formatTime(timerSeconds)}`;
}

function startTimer() {
    stopTimer();
    timerSeconds = 0;
    timerDisplay.textContent = `⏱️ 00:00`;
    timerDisplay.style.display = 'block';
    timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// --- Difficulty selection ---
function setDifficulty(diff) {
    if (isPlaying) return;

    currentDifficulty = diff;

    [diffEasy, diffModerate, diffHard].forEach(btn => btn.classList.remove('active'));
    document.getElementById(`diff${diff.charAt(0).toUpperCase() + diff.slice(1)}`).classList.add('active');
}

// --- Question generation ---
function generateQuestion() {
    const ops = ['+', '-', '×', '÷'];
    const op = ops[getRandomInt(0, 3)];
    const cfg = DIFFICULTY[currentDifficulty];

    let a, b, answer;
    let questionText;

    switch (op) {
        case '+': {
            const ra = cfg.add.a, rb = cfg.add.b;
            a = getRandomInt(ra[0], ra[1]);
            b = getRandomInt(rb[0], rb[1]);
            answer = a + b;
            questionText = `${a} + ${b} = ?`;
            break;
        }
        case '-': {
            const ra = cfg.subtract.a, rb = cfg.subtract.b;
            a = getRandomInt(ra[0], ra[1]);
            b = getRandomInt(rb[0], Math.min(rb[1], a));
            answer = a - b;
            questionText = `${a} - ${b} = ?`;
            break;
        }
        case '×': {
            const ra = cfg.multiply.a, rb = cfg.multiply.b;
            a = getRandomInt(ra[0], ra[1]);
            b = getRandomInt(rb[0], rb[1]);
            answer = a * b;
            questionText = `${a} × ${b} = ?`;
            break;
        }
        case '÷': {
            const rb = cfg.divide.b, rans = cfg.divide.ans;
            b = getRandomInt(rb[0], rb[1]);
            answer = getRandomInt(rans[0], rans[1]);
            a = b * answer;
            questionText = `${a} ÷ ${b} = ?`;
            break;
        }
    }

    currentAnswer = answer;
    questionDisplay.textContent = questionText;
    questionDisplay.classList.add('active');
    return answer;
}

// --- Game state ---
function resetGame() {
    isPlaying = false;
    currentAnswer = null;
    stopTimer();
    timerSeconds = 0;
    timerDisplay.textContent = `⏱️ 00:00`;
    timerDisplay.style.display = 'none';
    difficultySelector.style.display = 'flex';
    diffLabel.style.display = 'none';
    questionDisplay.textContent = 'Clique em "JOGAR" para começar!';
    questionDisplay.classList.remove('active');
    inputArea.style.display = 'none';
    answerInput.value = '';
    feedback.textContent = '';
    feedback.className = 'feedback';
    playBtn.textContent = '🎮 JOGAR';
    correctCount.textContent = '0';
    wrongCount.textContent = '0';
}

function startGame() {
    isPlaying = true;

    // Hide difficulty selector, show label with selected difficulty
    difficultySelector.style.display = 'none';
    const cfg = DIFFICULTY[currentDifficulty];
    diffLabel.textContent = `${cfg.emoji} ${cfg.label}`;
    diffLabel.className = `diff-label ${currentDifficulty}`;
    diffLabel.style.display = 'block';

    backBtn.style.display = 'block';
    startTimer();
    inputArea.style.display = 'flex';
    playBtn.textContent = '🔄 Próxima';
    feedback.textContent = '';
    feedback.className = 'feedback';
    answerInput.value = '';
    generateQuestion();
    answerInput.focus();
}

function goBack() {
    if (!isPlaying) return;
    stopTimer();
    isPlaying = false;
    currentAnswer = null;
    timerSeconds = 0;
    timerDisplay.textContent = '⏱️ 00:00';
    timerDisplay.style.display = 'none';
    diffLabel.style.display = 'none';
    backBtn.style.display = 'none';
    difficultySelector.style.display = 'flex';
    questionDisplay.textContent = 'Clique em "JOGAR" para começar!';
    questionDisplay.classList.remove('active');
    inputArea.style.display = 'none';
    answerInput.value = '';
    feedback.textContent = '';
    feedback.className = 'feedback';
    playBtn.textContent = '🎮 JOGAR';
    correctCount.textContent = '0';
    wrongCount.textContent = '0';
}

function checkAnswer() {
    const userAnswer = parseFloat(answerInput.value);

    if (isNaN(userAnswer)) {
        feedback.textContent = 'Digite um número válido!';
        feedback.className = 'feedback wrong';
        return;
    }

    if (userAnswer === currentAnswer) {
        feedback.textContent = '✅ Correto! Muito bem!';
        feedback.className = 'feedback correct';
        correctCount.textContent = parseInt(correctCount.textContent) + 1;
    } else {
        feedback.textContent = `❌ Errado! A resposta correta era ${currentAnswer}`;
        feedback.className = 'feedback wrong';
        wrongCount.textContent = parseInt(wrongCount.textContent) + 1;
    }

    setTimeout(() => {
        generateQuestion();
        answerInput.value = '';
        feedback.textContent = '';
        feedback.className = 'feedback';
        answerInput.focus();
    }, 1500);
}

// --- Event Listeners ---
diffEasy.addEventListener('click', () => setDifficulty('easy'));
diffModerate.addEventListener('click', () => setDifficulty('moderate'));
diffHard.addEventListener('click', () => setDifficulty('hard'));

backBtn.addEventListener('click', goBack);

playBtn.addEventListener('click', () => {
    if (isPlaying) {
        generateQuestion();
        answerInput.value = '';
        feedback.textContent = '';
        feedback.className = 'feedback';
        answerInput.focus();
    } else {
        startGame();
    }
});

confirmBtn.addEventListener('click', checkAnswer);

answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

// Initialize
resetGame();