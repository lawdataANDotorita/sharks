document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('gameArea');
    const levelDisplay = document.getElementById('level');
    const tileSize = 40;
    let level = 1;
    let strikes = 0;
    let player;
    let sharks = [];
    let sharkCount = 2;
    const MAX_SHARKS = 3;
    let gameOver = false;
    let animationId;

    const strikeDisplay = document.getElementById('strikes');
    const replayButton = document.getElementById('replay');
    const gameOverText = document.getElementById('gameOver');

    function createPlayer(height, width) {
        player = document.createElement('div');
        player.classList.add('player');
        player.style.left = (width / 2 - 15) + 'px';
        player.style.top = (height - tileSize) + 'px';
        gameArea.appendChild(player);
    }

    function createShark(top, speed) {
        const shark = document.createElement('div');
        shark.classList.add('shark');
        shark.style.top = top + 'px';
        shark.style.left = Math.random() * (gameArea.clientWidth - 50) + 'px';
        shark.dataset.speed = speed;
        shark.dataset.direction = Math.random() > 0.5 ? 1 : -1;
        gameArea.appendChild(shark);
        sharks.push(shark);
    }

    function startLevel() {
        gameArea.innerHTML = '';
        sharks = [];
        const width = 400;
        const height = 300 + level * 40;
        gameArea.style.width = width + 'px';
        gameArea.style.height = height + 'px';
        levelDisplay.textContent = level;
        createPlayer(height, width);
        const rows = level + 1;
        for (let i = 0; i < sharkCount; i++) {
            const row = Math.floor(Math.random() * rows);
            const top = tileSize + row * tileSize;
            createShark(top, 1 + level * 0.5);
        }
    }

    function updateStrikes() {
        strikeDisplay.textContent = strikes;
    }

    function handleStrike() {
        strikes++;
        updateStrikes();
        if (strikes >= 3) {
            gameOver = true;
            replayButton.style.display = 'block';
            gameOverText.style.display = 'block';
        } else {
            startLevel();
        }
    }

    function movePlayer(dx, dy) {
        const newLeft = Math.max(0, Math.min(gameArea.clientWidth - 30, player.offsetLeft + dx));
        const newTop = Math.max(0, Math.min(gameArea.clientHeight - 30, player.offsetTop + dy));
        player.style.left = newLeft + 'px';
        player.style.top = newTop + 'px';
        if (newTop <= 0) {
            level++;
            levelDisplay.textContent = level;
            if (sharkCount < MAX_SHARKS) {
                sharkCount++;
                const rows = level + 1;
                const row = Math.floor(Math.random() * rows);
                const top = tileSize + row * tileSize;
                createShark(top, 1 + level * 0.5);
            }
            player.style.left = (gameArea.clientWidth / 2 - 15) + 'px';
            player.style.top = (gameArea.clientHeight - tileSize) + 'px';
        }
    }

    function isColliding(a, b) {
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return !(ar.right < br.left || ar.left > br.right || ar.bottom < br.top || ar.top > br.bottom);
    }

    function animate() {
        if (gameOver) return;
        sharks.forEach(shark => {
            const speed = parseFloat(shark.dataset.speed);
            let left = shark.offsetLeft + speed * parseFloat(shark.dataset.direction);
            if (left > gameArea.clientWidth) {
                left = -50;
            }
            if (left < -50) {
                left = gameArea.clientWidth;
            }
            shark.style.left = left + 'px';
            if (!gameOver && isColliding(player, shark)) {
                handleStrike();
            }
        });
        if (!gameOver) {
            animationId = requestAnimationFrame(animate);
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') movePlayer(0, -tileSize / 2);
        if (e.key === 'ArrowDown') movePlayer(0, tileSize / 2);
        if (e.key === 'ArrowLeft') movePlayer(-tileSize / 2, 0);
        if (e.key === 'ArrowRight') movePlayer(tileSize / 2, 0);
    });

    replayButton.addEventListener('click', () => {
        strikes = 0;
        updateStrikes();
        level = 1;
        sharkCount = 2;
        gameOver = false;
        gameOverText.style.display = 'none';
        replayButton.style.display = 'none';
        startLevel();
        animationId = requestAnimationFrame(animate);
    });

    startLevel();
    updateStrikes();
    animationId = requestAnimationFrame(animate);
});
