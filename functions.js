// Game logic for strike-based target game

document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('gameboard');
    const target = document.getElementById('target');
    const strikeCounter = document.getElementById('strike-counter');
    const message = document.getElementById('message');
    const replayBtn = document.getElementById('replay');

    let strikes = 0;
    let timerId = null;

    function updateStrikes() {
        strikeCounter.textContent = `Strikes: ${strikes}`;
    }

    function randomPosition() {
        const maxX = board.clientWidth - target.offsetWidth;
        const maxY = board.clientHeight - target.offsetHeight;
        const x = Math.floor(Math.random() * maxX);
        const y = Math.floor(Math.random() * maxY);
        target.style.left = `${x}px`;
        target.style.top = `${y}px`;
    }

    function showTarget() {
        target.classList.remove('hidden');
        randomPosition();
        timerId = setTimeout(missedTarget, 1000);
    }

    function missedTarget() {
        strikes += 1;
        updateStrikes();
        if (strikes >= 3) {
            endGame();
        } else {
            showTarget();
        }
    }

    function endGame() {
        clearTimeout(timerId);
        target.classList.add('hidden');
        message.classList.remove('hidden');
        message.textContent = 'End Game';
        replayBtn.classList.remove('hidden');
    }

    function startGame() {
        strikes = 0;
        updateStrikes();
        message.classList.add('hidden');
        replayBtn.classList.add('hidden');
        showTarget();
    }

    target.addEventListener('click', () => {
        clearTimeout(timerId);
        showTarget();
    });

    replayBtn.addEventListener('click', startGame);

    startGame();
});

