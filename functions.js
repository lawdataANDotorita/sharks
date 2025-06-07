document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('gameArea');
    const levelDisplay = document.getElementById('level');
    const tileSize = 40;
    let level = 1;
    let strikes = 0;
    let player;
    let sharks = [];
    // Start the game with a single shark on screen
    const INITIAL_SHARKS = 1;
    const MAX_SHARKS_PER_ROW = 3;
    const MAX_TOTAL_SHARKS = 50;
    let sharksPerRow = {};
    let gameOver = false;
    let animationId;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    let backgroundInterval;

    const strikeDisplay = document.getElementById('strikes');
    const replayButton = document.getElementById('replay');
    const gameOverText = document.getElementById('gameOver');
    const muteButton = document.getElementById('mute');
    let muted = false;
    muteButton.textContent = '🔊';

    function playTone(freq, dur, type="sine", volume=0.5) {
        if (muted) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(volume, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
    }

    function stepSound() {
        playTone(440, 0.1, 'square', 0.2);
    }

    function successSound() {
        playTone(880, 0.3, 'triangle', 0.3);
    }

    function collisionSound() {
        playTone(60, 0.6, 'sawtooth', 0.4);
    }

    function startBackgroundMusic() {
        const pattern = [60, 65, 70, 75, 80, 85];
        let idx = 0;
        backgroundInterval = setInterval(() => {
            if (gameOver) {
                clearInterval(backgroundInterval);
                backgroundInterval = null;
                return;
            }
            playTone(pattern[idx], 0.4, 'sawtooth', 0.05);
            idx = (idx + 1) % pattern.length;
        }, 600);
    }

    function createPlayer(height, width) {
        player = document.createElement('div');
        player.classList.add('player');
        player.style.left = (width / 2 - 15) + 'px';
        player.style.top = (height - tileSize) + 'px';
        gameArea.appendChild(player);
    }

    function createShark(row, top, speed) {
        const shark = document.createElement('div');
        shark.classList.add('shark');
        shark.style.top = top + 'px';
        shark.style.left = Math.random() * (gameArea.clientWidth - 50) + 'px';
        shark.dataset.speed = speed;
        shark.dataset.direction = Math.random() > 0.5 ? 1 : -1;
        // Flip the shark image when moving left to right
        if (parseFloat(shark.dataset.direction) > 0) {
            shark.style.transform = 'scaleX(-1)';
        } else {
            shark.style.transform = 'scaleX(1)';
        }
        shark.dataset.row = row;
        gameArea.appendChild(shark);
        sharks.push(shark);
        sharksPerRow[row] = (sharksPerRow[row] || 0) + 1;
    }

    function getAvailableRow(rows) {
        const available = [];
        for (let r = 0; r < rows; r++) {
            if ((sharksPerRow[r] || 0) < MAX_SHARKS_PER_ROW) {
                available.push(r);
            }
        }
        if (available.length === 0) return null;
        return available[Math.floor(Math.random() * available.length)];
    }

    function startLevel() {
        gameArea.innerHTML = '';
        sharks = [];
        sharksPerRow = {};
        const width = 400;
        const height = 300 + level * 40;
        gameArea.style.width = width + 'px';
        gameArea.style.height = height + 'px';
        levelDisplay.textContent = level;
        createPlayer(height, width);
        const rows = level + 1;
        for (let i = 0; i < INITIAL_SHARKS; i++) {
            const row = getAvailableRow(rows);
            if (row === null) break;
            const top = tileSize + row * tileSize;
            createShark(row, top, 1 + level * 0.5);
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
            player.style.left = (gameArea.clientWidth / 2 - 15) + 'px';
            player.style.top = (gameArea.clientHeight - tileSize) + 'px';
        }
    }

    function movePlayer(dx, dy) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        if (!backgroundInterval) startBackgroundMusic();
        const curLeft = player.offsetLeft;
        const curTop = player.offsetTop;
        const newLeft = Math.max(0, Math.min(gameArea.clientWidth - 30, player.offsetLeft + dx));
        const newTop = Math.max(0, Math.min(gameArea.clientHeight - 30, player.offsetTop + dy));
        const moved = newLeft !== curLeft || newTop !== curTop;
        player.style.left = newLeft + 'px';
        player.style.top = newTop + 'px';
        if (moved) stepSound();
        if (newTop <= 0) {
            successSound();
            level++;
            levelDisplay.textContent = level;
            if (sharks.length < MAX_TOTAL_SHARKS) {
                const rows = level + 1;
                const row = getAvailableRow(rows);
                if (row !== null) {
                    const top = tileSize + row * tileSize;
                    createShark(row, top, 1 + level * 0.5);
                }
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
                collisionSound();
                handleStrike();
            }
        });
        if (!gameOver) {
            animationId = requestAnimationFrame(animate);
        }
    }

    document.addEventListener('keydown', (e) => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        if (!backgroundInterval) startBackgroundMusic();
        if (e.key === 'ArrowUp') movePlayer(0, -tileSize / 2);
        if (e.key === 'ArrowDown') movePlayer(0, tileSize / 2);
        if (e.key === 'ArrowLeft') movePlayer(-tileSize / 2, 0);
        if (e.key === 'ArrowRight') movePlayer(tileSize / 2, 0);
    });

    replayButton.addEventListener('click', () => {
        strikes = 0;
        updateStrikes();
        level = 1;
        sharksPerRow = {};
        sharks = [];
        gameOver = false;
        gameOverText.style.display = 'none';
        replayButton.style.display = 'none';
        startLevel();
        if (!backgroundInterval) startBackgroundMusic();
        animationId = requestAnimationFrame(animate);
    });

    muteButton.addEventListener('click', () => {
        muted = !muted;
        muteButton.textContent = muted ? '🔇' : '🔊';
        if (!muted && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    });

    startLevel();
    updateStrikes();
    animationId = requestAnimationFrame(animate);
});
