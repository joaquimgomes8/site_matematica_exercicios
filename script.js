const questionDisplay = document.getElementById('questionDisplay');
const answerInput = document.getElementById('answerInput');
const confirmBtn = document.getElementById('confirmBtn');
const playBtn = document.getElementById('playBtn');
const feedback = document.getElementById('feedback');
const correctCount = document.getElementById('correctCount');
const wrongCount = document.getElementById('wrongCount');
const inputArea = document.getElementById('inputArea');

let currentAnswer = null;
let isPlaying = false;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
    const operations = ['+', '-', '×', '÷'];
    const op = operations[getRandomInt(0, 3)];

    let a, b, answer;
    let questionText;

    switch (op) {
        case '+':
            a = getRandomInt(1, 50);
            b = getRandomInt(1, 50);
            answer = a + b;
            questionText = `${a} + ${b} = ?`;
            break;
        case '-':
            a = getRandomInt(10, 100);
            b = getRandomInt(1, a); // ensure non-negative result
            answer = a - b;
            questionText = `${a} - ${b} = ?`;
            break;
        case '×':
            a = getRandomInt(2, 12);
            b = getRandomInt(2, 12);
            answer = a * b;
            questionText = `${a} × ${b} = ?`;
            break;
        case '÷':
            b = getRandomInt(2, 12);
            answer = getRandomInt(1, 12);
            a = b * answer; // ensure exact division
            questionText = `${a} ÷ ${b} = ?`;
            break;
    }

    currentAnswer = answer;
    questionDisplay.textContent = questionText;
    questionDisplay.classList.add('active');
    return answer;
}

function resetGame() {
    isPlaying = false;
    currentAnswer = null;
    questionDisplay.textContent = 'Clique em "JOGAR" para começar!';
    questionDisplay.classList.remove('active');
    inputArea.style.display = 'none';
    answerInput.value = '';
    feedback.textContent = '';
    feedback.className = 'feedback';
    playBtn.textContent = '🎮 JOGAR';
}

function startGame() {
    isPlaying = true;
    inputArea.style.display = 'flex';
    playBtn.textContent = '🔄 Próxima';
    feedback.textContent = '';
    feedback.className = 'feedback';
    answerInput.value = '';
    generateQuestion();
    answerInput.focus();
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

    // Auto-advance to next question after a short delay
    setTimeout(() => {
        generateQuestion();
        answerInput.value = '';
        feedback.textContent = '';
        feedback.className = 'feedback';
        answerInput.focus();
    }, 1500);
}

// Event Listeners
playBtn.addEventListener('click', () => {
    if (isPlaying) {
        // "Próxima" button: just generate a new question
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