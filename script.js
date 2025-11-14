document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT SELECTION ---
    const splashScreen = document.getElementById('splash-screen');
    const cardWrapper = document.getElementById('card-wrapper');
    const music = document.getElementById('birthday-music');
    const popSound = document.getElementById('pop-sound');
    const closeButton = document.getElementById('close-card-btn');
    const celebrationContainer = document.getElementById('final-celebration');
    const scoreCounter = document.getElementById('score-counter');

    const pages = [
        document.getElementById('page-1'),
        document.getElementById('page-2'),
        document.getElementById('page-3'),
        document.getElementById('page-4'),
        document.getElementById('page-5')
    ];
    
    let currentPageIndex = 0;

    // --- CONFIGURATION ---
    const SPLASH_DURATION = 1000;
    const FLIP_DURATION = 500;
    const BALLOON_COLORS = ['#ff4d4d', '#1e90ff', '#ff9ff3', '#ffe66d', '#8a2be2', '#00ced1', '#ff69b4'];
    const NUM_BALLOONS_AT_ONCE = 15;
    const BALLOON_SPAWN_INTERVAL = 300;
    const TOTAL_PAGES = pages.length;
    const SCATTER_ANGLE = 36;
    const FINAL_POP_COUNT_MESSAGE = "It's your birthday! Blast all the balloons!";
    const WELCOME_CELEBRATION_MESSAGE = "Happy Birthday Mimansa Dixit!";

    // --- CELEBRATION STATE VARIABLES ---
    let activeBalloons = new Set();
    let blastedBalloonsCount = 0;
    let maxBalloonsToPopBeforeText = 15; 
    let balloonInterval;


    // --- UTILITY FUNCTIONS ---
    function updateScoreDisplay() {
        if(scoreCounter) {
            scoreCounter.textContent = `Balloons Blasted: ${blastedBalloonsCount}`;
        }
    }

    function playMusic() {
        music.volume = 0.6;
        music.play().catch(error => {
            console.warn("Autoplay prevented:", error);
        });
    }

    function playPopSound() {
        popSound.currentTime = 0;
        popSound.play().catch(error => console.warn("Pop sound failed:", error));
    }


    // --- CARD FLOW FUNCTIONS ---
    function revealCard() {
        splashScreen.removeEventListener('click', startSequence);
        splashScreen.classList.add('hidden');
        
        setTimeout(() => {
            splashScreen.style.display = 'none';
            cardWrapper.classList.remove('hidden');
            addPageFlipListeners();
        }, 500); 
    }

    function startSequence() {
        playMusic();
        setTimeout(revealCard, SPLASH_DURATION);
    }


    // --- PAGE FLIPPING LOGIC ---
    function flipPage() {
        const currentPageElement = pages[currentPageIndex];
        
        if (currentPageElement && currentPageIndex < TOTAL_PAGES) {
            
            currentPageElement.classList.add('is-flipped');
            
            setTimeout(() => { 
                
                currentPageIndex++;
                
                currentPageElement.classList.remove('active-page');
                
                const nextPageElement = pages[currentPageIndex];
                if (nextPageElement) {
                    nextPageElement.classList.add('active-page');
                }

                if (currentPageIndex === TOTAL_PAGES) {
                    removePageFlipListeners();
                }

            }, FLIP_DURATION); 
        }
    }

    function addPageFlipListeners() {
        pages.forEach(page => {
            if (!page.classList.contains('is-flipped')) {
                page.addEventListener('click', flipPage, { once: true });
            }
        });
    }

    function removePageFlipListeners() {
        pages.forEach(page => {
            page.removeEventListener('click', flipPage);
        });
    }


    // --- FINAL CELEBRATION LOGIC ---

    function createBalloon() {
        if (activeBalloons.size >= NUM_BALLOONS_AT_ONCE) return;

        const balloon = document.createElement('div');
        balloon.classList.add('balloon');
        const balloonId = `balloon-${Date.now()}-${Math.random()}`;
        balloon.dataset.id = balloonId;

        // 1. Pop on Click
        balloon.addEventListener('click', () => blastBalloon(balloon)); 

        const randomX = Math.random() * (window.innerWidth - 60);
        const randomColor = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
        
        balloon.style.left = `${randomX}px`;
        balloon.style.backgroundColor = randomColor;

        const randomDuration = Math.random() * 4 + 8; // Slower rise time
        balloon.style.animationDuration = `${randomDuration}s`;
        
        celebrationContainer.appendChild(balloon);
        activeBalloons.add(balloonId);

        // 2. Pop when animation ends (reaches top)
        balloon.addEventListener('animationend', () => {
            if (activeBalloons.has(balloonId)) { 
                // Calls the full blast function (sound + scatter)
                blastBalloon(balloon); 
            }
        }, { once: true });
    }

    function blastBalloon(balloon) {
        if (!balloon || !balloon.dataset.id || !activeBalloons.has(balloon.dataset.id)) return;
        
        playPopSound();
        activeBalloons.delete(balloon.dataset.id);
        
        blastedBalloonsCount++; 
        updateScoreDisplay();

        if (blastedBalloonsCount === 1) { 
            displayInstructionalMessage(FINAL_POP_COUNT_MESSAGE);
            // Hide the instruction message upon first pop
            setTimeout(hideInstructionalMessage, 50); 
        }

        const rect = balloon.getBoundingClientRect();
        const blastX = rect.left + rect.width / 2;
        const blastY = rect.top + rect.height / 2;

        for (let i = 0; i < 10; i++) { 
            revealPicture(blastX, blastY, i);
        }

        if(balloon.parentElement) celebrationContainer.removeChild(balloon);

        if (blastedBalloonsCount >= maxBalloonsToPopBeforeText && !document.querySelector('.birthday-text-group')) {
            clearInterval(balloonInterval);
            animateBirthdayText();
            setTimeout(() => {
                startBalloonLoop();
            }, 6000); 
        } else {
            createBalloon(); 
        }
    }

    function displayInstructionalMessage(message) {
        const wrapper = document.createElement('div');
        wrapper.id = 'blast-message-wrapper';

        const heart = document.createElement('div');
        heart.classList.add('heart-icon');

        const msg = document.createElement('div');
        msg.id = 'blast-message';
        msg.textContent = message;
        
        wrapper.appendChild(heart);
        wrapper.appendChild(msg);
        celebrationContainer.appendChild(wrapper);

        // Message stays fixed, and is hidden by the blastBalloon function
    }
    
    function hideInstructionalMessage() {
        const wrapper = document.getElementById('blast-message-wrapper');
        if (wrapper) {
            wrapper.style.opacity = '0';
            setTimeout(() => {
                 if (wrapper.parentElement) celebrationContainer.removeChild(wrapper);
            }, 1000);
        }
    }

    function revealPicture(x, y, index) {
        const pic = document.createElement('img');
        
        pic.src = `assets/${index + 1}.jpg`; 
        
        pic.classList.add('scatter-pic');
        pic.style.left = `${x}px`;
        pic.style.top = `${y}px`;
        
        celebrationContainer.appendChild(pic);

        const scatterDistance = 300;
        
        const angle = (index * SCATTER_ANGLE) * (Math.PI / 180); 
        const endX = x + scatterDistance * Math.cos(angle);
        const endY = y + scatterDistance * Math.sin(angle);
        
        pic.style.transition = 'transform 1.5s ease-out, opacity 1.5s ease-out';
        setTimeout(() => {
            pic.style.transform = `translate(${endX - x}px, ${endY - y}px) scale(0.5) rotate(${Math.random() * 360}deg)`;
            pic.style.opacity = '0';
        }, 50);

        setTimeout(() => {
            if(pic.parentElement === celebrationContainer) celebrationContainer.removeChild(pic);
        }, 1600);
    }

    const birthdayPhrases = [
        "Happy Birthday!",
        "Happy Birthday Babe",
        "Happy Birthday Mimansa",
        "Happy 24th Birthday!"
    ];

    function animateBirthdayText() {
        const textGroup = document.createElement('div');
        textGroup.classList.add('birthday-text-group');
        celebrationContainer.appendChild(textGroup);

        birthdayPhrases.forEach((phrase, index) => {
            const span = document.createElement('span');
            span.textContent = phrase;
            span.classList.add('birthday-text');
            span.style.animationDelay = `${index * 0.8}s`; 
            textGroup.appendChild(span);
        });

        setTimeout(() => {
            if (textGroup.parentElement) celebrationContainer.removeChild(textGroup);
        }, 5000 + birthdayPhrases.length * 800); 
    }

    function displayWelcomeHeader() {
        const welcomeHeader = document.createElement('h1');
        welcomeHeader.textContent = WELCOME_CELEBRATION_MESSAGE;
        
        // Final Welcome Header in Pink
        welcomeHeader.style.cssText = `
            position: fixed; top: 10px; left: 50%; transform: translateX(-50%); 
            color: var(--pink-secondary); 
            text-shadow: 2px 2px 4px black; z-index: 400;
        `;
        celebrationContainer.appendChild(welcomeHeader);
    }

    function startBalloonLoop() {
        if (balloonInterval) clearInterval(balloonInterval); 
        for (let i = 0; i < NUM_BALLOONS_AT_ONCE; i++) {
            createBalloon();
        }
        balloonInterval = setInterval(createBalloon, BALLOON_SPAWN_INTERVAL);
    }


    function startCelebration() {
        cardWrapper.style.display = 'none';
        celebrationContainer.style.pointerEvents = 'auto';
        displayWelcomeHeader(); 
        updateScoreDisplay(); 
        startBalloonLoop();
    }


    // --- INITIALIZATION ---
    splashScreen.addEventListener('click', startSequence, { once: true });
    closeButton.addEventListener('click', startCelebration);
});
