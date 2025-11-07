// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.shark-container');
    const gameOverEl = document.getElementById('gameOver');
    if (!container) {
        console.error('Shark container not found');
        return;
    }

    const sharkCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 sharks

    for (let i = 0; i < sharkCount; i++) {
        const img = document.createElement('img');
        img.src = 'https://upload.wikimedia.org/wikipedia/commons/5/56/Great_white_shark.jpg';
        img.alt = 'Realistic shark';
        img.className = 'shark';
        container.appendChild(img);
    }

    console.log(`Loaded ${sharkCount} shark(s)`);

    // Simulate a game over condition after loading the sharks
    if (gameOverEl) {
        setTimeout(() => {
            gameOverEl.style.display = 'block';
        }, 2000);
    }
});
