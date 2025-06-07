// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.shark-container');
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
});
