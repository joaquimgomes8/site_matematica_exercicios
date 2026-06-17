// --- DOM Elements ---
const questionDisplay = document.getElementById('questionDisplay');
const answerInput = document.getElementById('answerInput');
const confirmBtn = document.getElementById('confirmBtn');
const playBtn = document.getElementById('playBtn');
const feedback = document.getElementById('feedback');
const correctCount = document.getElementById('correctCount');
const wrongCount = document.getElementById('wrongCount');
const inputArea = document.getElementById('inputArea');
const timerDisplay = document.getElementById('timerDisplay');
const scoreBoard = document.getElementById('scoreBoard');
const resultsPanel = document.getElementById('resultsPanel');

const diffEasy = document.getElementById('diffEasy');
const diffModerate = document.getElementById('diffModerate');
const diffHard = document.getElementById('diffHard');
const difficultySelector = document.getElementById('difficultySelector');
const diffLabel = document.getElementById('diffLabel');
const backBtn = document.getElementById('backBtn');
const backFromResultsBtn = document.getElementById('backFromResultsBtn');

const timerModeSelector = document.getElementById('timerModeSelector');
const minutesArea = document.getElementById('minutesArea');
const minutesInput = document.getElementById('minutesInput');

const resultDiff = document.getElementById('resultDiff');
const resultTime = document.getElementById('resultTime');
const resultCorrect = document.getElementById('resultCorrect');
const resultWrong = document.getElementById('resultWrong');
const resultTotal = document.getElementById('resultTotal');

// --- State ---
let currentAnswer = null;
let isPlaying = false;
let timerSeconds = 0;
let timerInterval = null;
let currentDifficulty = 'easy';
let gameOver = false;
let totalSecondsLimit = 0;    // countdown limit in seconds (0 = no limit)

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

// --- Utility ---
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

    if (totalSecondsLimit > 0) {
        // Countdown mode
        const remaining = totalSecondsLimit - timerSeconds;
        if (remaining <= 0) {
            timerDisplay.textContent = `⏱️ 00:00`;
            endGame();
            return;
        }
        timerDisplay.textContent = `⏱️ ${formatTime(remaining)}`;
        // Warning when less than 30 seconds
        if (remaining <= 30) {
            timerDisplay.classList.add('warning');
        } else {
            timerDisplay.classList.remove('warning');
        }
    } else {
        // No limit mode (count up)
        timerDisplay.textContent = `⏱️ ${formatTime(timerSeconds)}`;
    }
}

function startTimer() {
    stopTimer();
    timerSeconds = 0;

    if (totalSecondsLimit > 0) {
        timerDisplay.textContent = `⏱️ ${formatTime(totalSecondsLimit)}`;
        timerDisplay.classList.remove('warning');
    } else {
        timerDisplay.textContent = `⏱️ 00:00`;
    }

    timerDisplay.style.display = 'block';
    timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timerDisplay.classList.remove('warning');
}

// --- Difficulty selection ---
function setDifficulty(diff) {
    if (isPlaying || gameOver) return;
    currentDifficulty = diff;
    [diffEasy, diffModerate, diffHard].forEach(btn => btn.classList.remove('active'));
    document.getElementById(`diff${diff.charAt(0).toUpperCase() + diff.slice(1)}`).classList.add('active');
}

// --- Timer mode toggle ---
document.querySelectorAll('input[name="timerMode"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const isWithTimer = document.querySelector('input[name="timerMode"]:checked').value === 'withTimer';
        minutesArea.style.display = isWithTimer ? 'flex' : 'none';
    });
});

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

// --- Show game screen ---
function showGameScreen() {
    // Hide setup elements
    difficultySelector.style.display = 'none';
    timerModeSelector.style.display = 'none';
    minutesArea.style.display = 'none';
    resultsPanel.style.display = 'none';

    // Show game elements
    diffLabel.style.display = 'block';
    backBtn.style.display = 'block';
    inputArea.style.display = 'flex';
    scoreBoard.style.display = 'flex';
    playBtn.textContent = '🔄 Próxima';
    playBtn.style.display = 'inline-block';
}

// --- Show setup screen ---
function showSetupScreen() {
    // Show setup elements
    difficultySelector.style.display = 'flex';
    timerModeSelector.style.display = 'flex';
    const isWithTimer = document.querySelector('input[name="timerMode"]:checked').value === 'withTimer';
    minutesArea.style.display = isWithTimer ? 'flex' : 'none';

    // Hide game/results elements
    diffLabel.style.display = 'none';
    timerDisplay.style.display = 'none';
    inputArea.style.display = 'none';
    feedback.textContent = '';
    feedback.className = 'feedback';
    scoreBoard.style.display = 'flex';
    resultsPanel.style.display = 'none';
    backBtn.style.display = 'none';
    playBtn.textContent = '🎮 JOGAR';
    playBtn.style.display = 'inline-block';

    stopTimer();
    timerSeconds = 0;
    timerDisplay.textContent = '⏱️ 00:00';
    questionDisplay.textContent = 'Clique em "JOGAR" para começar!';
    questionDisplay.classList.remove('active');
    answerInput.value = '';
    correctCount.textContent = '0';
    wrongCount.textContent = '0';

    isPlaying = false;
    gameOver = false;
    currentAnswer = null;
}

// --- Start game ---
function startGame() {
    gameOver = false;
    isPlaying = true;

    // Determine timer mode
    const timerMode = document.querySelector('input[name="timerMode"]:checked').value;
    if (timerMode === 'withTimer') {
        const minutes = parseInt(minutesInput.value) || 2;
        if (minutes < 1) minutesInput.value = 1;
        if (minutes > 60) minutesInput.value = 60;
        totalSecondsLimit = (parseInt(minutesInput.value) || 2) * 60;
    } else {
        totalSecondsLimit = 0; // no limit
    }

    const cfg = DIFFICULTY[currentDifficulty];
    diffLabel.textContent = `${cfg.emoji} ${cfg.label}`;
    diffLabel.className = `diff-label ${currentDifficulty}`;
    diffLabel.style.display = 'block';

    showGameScreen();
    startTimer();
    feedback.textContent = '';
    feedback.className = 'feedback';
    answerInput.value = '';
    generateQuestion();
    answerInput.focus();
}

// --- End game (timer finished) ---
function endGame() {
    stopTimer();
    isPlaying = false;
    gameOver = true;
    currentAnswer = null;

    // Hide game elements
    timerDisplay.style.display = 'none';
    inputArea.style.display = 'none';
    playBtn.style.display = 'none';
    backBtn.style.display = 'none';
    scoreBoard.style.display = 'none';
    feedback.textContent = '';
    feedback.className = 'feedback';
    diffLabel.style.display = 'none';

    // Show results
    const correct = parseInt(correctCount.textContent);
    const wrong = parseInt(wrongCount.textContent);
    const total = correct + wrong;

    const cfg = DIFFICULTY[currentDifficulty];
    resultDiff.textContent = `${cfg.emoji} ${cfg.label}`;
    resultTime.textContent = formatTime(totalSecondsLimit);
    resultCorrect.textContent = correct;
    resultWrong.textContent = wrong;
    resultTotal.textContent = total;

    resultsPanel.style.display = 'block';
    questionDisplay.textContent = '⏰ Tempo esgotado!';
    questionDisplay.classList.remove('active');
}

// --- Go back to setup ---
function goBack() {
    if (!isPlaying && !gameOver) return;
    showSetupScreen();
}

// --- Check answer ---
function checkAnswer() {
    if (!isPlaying || gameOver) return;

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
        if (!isPlaying || gameOver) return;
        generateQuestion();
        answerInput.value = '';
        feedback.textContent = '';
        feedback.className = 'feedback';
        answerInput.focus();
    }, 1200);
}

// --- Event Listeners ---
diffEasy.addEventListener('click', () => setDifficulty('easy'));
diffModerate.addEventListener('click', () => setDifficulty('moderate'));
diffHard.addEventListener('click', () => setDifficulty('hard'));

backBtn.addEventListener('click', goBack);
backFromResultsBtn.addEventListener('click', goBack);

playBtn.addEventListener('click', () => {
    if (isPlaying && !gameOver) {
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

// --- Initialize ---
showSetupScreen();