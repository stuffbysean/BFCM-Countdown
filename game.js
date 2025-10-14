// ===================================
// Black Friday Countdown Game
// ===================================

// ===================================
// Game State Management
// ===================================
const gameState = {
    countdown: {
        targetDate: null,
        interval: null
    },
    assessment: {
        currentQuestion: 0,
        answers: [],
        score: 0,
        difficulty: 'MEDIUM',
        checkedCount: 0
    },
    game: {
        isRunning: false,
        isPaused: false,
        score: 0,
        lives: 3,
        timeRemaining: 0,
        initialTimeRemaining: 0,
        interval: null,
        level: 1,
        maxLevel: 10,
        totalCatches: 0,
        totalMisses: 0,
        levelsCompleted: 0,
        catchesNeededPerLevel: 10,
        catchesThisLevel: 0,
        player: {
            x: 360,
            y: 570,
            width: 80,
            height: 20,
            speed: 8
        },
        fallingObjects: [],
        spawnTimer: 0,
        spawnInterval: 60,
        baseSpeed: 2,
        objectsPerSpawn: 1,
        messages: [],
        canvasWidth: 800,
        canvasHeight: 600,
        dismissButton: null
    },
    icons: {
        loaded: false,
        dropIcons: []
    },
    background: {
        loaded: false,
        image: null
    }
};

// ===================================
// DOM Elements
// ===================================
const elements = {
    // Countdown elements
    countdownSection: document.getElementById('countdownSection'),
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    readyButton: document.getElementById('readyButton'),

    // Assessment elements
    assessmentSection: document.getElementById('assessmentSection'),
    planningDateSlider: document.getElementById('planningDateSlider'),
    selectedDate: document.getElementById('selectedDate'),
    weeksAgo: document.getElementById('weeksAgo'),
    difficultyLevel: document.getElementById('difficultyLevel'),
    checklistContainer: document.getElementById('checklistContainer'),
    launchGameButton: document.getElementById('launchGameButton'),

    // Game elements
    gameSection: document.getElementById('gameSection'),
    gameCanvas: document.getElementById('gameCanvas'),
    gameDays: document.getElementById('gameDays'),
    gameHours: document.getElementById('gameHours'),
    gameMinutes: document.getElementById('gameMinutes'),
    level: document.getElementById('level'),
    score: document.getElementById('score'),
    lives: document.getElementById('lives'),
    startGame: document.getElementById('startGame'),
    pauseGame: document.getElementById('pauseGame'),
    restartGame: document.getElementById('restartGame'),
    homeButton: document.getElementById('homeButton'),

    // Results modal elements
    resultsModal: document.getElementById('resultsModal'),
    modalClose: document.getElementById('modalClose'),
    modalBackdrop: document.getElementById('modalBackdrop'),
    finalScore: document.getElementById('finalScore'),
    resultsMessage: document.getElementById('resultsMessage'),
    playAgain: document.getElementById('playAgain'),
    shareScore: document.getElementById('shareScore'),
    downloadScoreCard: document.getElementById('downloadScoreCard'),

    // Notification elements
    notificationContainer: document.getElementById('notificationContainer')
};

// ===================================
// Slack Messages - Progressive Urgency by Level
// ===================================
const slackMessages = {
    level1: [
        { sender: 'sarah-cmo', avatar: '👩‍💼', text: 'Morning team! Just checking in - are we all set for launch day?', urgent: false },
        { sender: 'mike-marketing', avatar: '📢', text: 'Email campaigns are scheduled and ready to go!', urgent: false },
        { sender: 'alex-ops', avatar: '⚙️', text: 'Server capacity looks good. Monitoring dashboards are up.', urgent: false }
    ],
    level2: [
        { sender: 'jen-customer-success', avatar: '💬', text: 'Customer support team is briefed and standing by!', urgent: false },
        { sender: 'david-logistics', avatar: '📦', text: 'Warehouse is prepped. Shipping carriers confirmed.', urgent: false },
        { sender: 'sarah-cmo', avatar: '👩‍💼', text: 'Traffic is starting to pick up. Keep an eye on things.', urgent: false }
    ],
    level3: [
        { sender: 'mike-marketing', avatar: '📢', text: 'First email blast just went out. Expecting traffic spike in 10 mins.', urgent: false },
        { sender: 'alex-ops', avatar: '⚙️', text: 'Seeing increased load. All systems nominal so far.', urgent: false },
        { sender: 'ceo', avatar: '👔', text: 'Great start everyone. Let\'s keep this momentum going!', urgent: false }
    ],
    level4: [
        { sender: 'sarah-cmo', avatar: '👩‍💼', text: 'Traffic is 2x our projections! This is incredible!', urgent: false },
        { sender: 'alex-ops', avatar: '⚙️', text: 'Scaling up additional servers. Response times still good.', urgent: false },
        { sender: 'jen-customer-success', avatar: '💬', text: 'Support tickets coming in faster. We\'re handling it!', urgent: false },
        { sender: 'ceo', avatar: '👔', text: 'Amazing numbers! Keep me posted on any issues.', urgent: false }
    ],
    level5: [
        { sender: 'alex-ops', avatar: '⚙️', text: 'Database queries slowing down. Investigating now.', urgent: true },
        { sender: 'mike-marketing', avatar: '📢', text: 'Why did our conversion rate just drop??', urgent: true },
        { sender: 'sarah-cmo', avatar: '👩‍💼', text: 'Are customers able to check out? Getting some complaints on social.', urgent: true },
        { sender: 'ceo', avatar: '👔', text: 'I need a status update ASAP. What\'s happening?', urgent: true }
    ],
    level6: [
        { sender: 'alex-ops', avatar: '⚙️', text: '🔥 Payment gateway is timing out! Working on it!', urgent: true },
        { sender: 'jen-customer-success', avatar: '💬', text: 'Support queue is EXPLODING. Customers can\'t complete purchases!', urgent: true },
        { sender: 'sarah-cmo', avatar: '👩‍💼', text: 'We\'re losing sales every second this is down!', urgent: true },
        { sender: 'ceo', avatar: '👔', text: 'THIS IS NOT ACCEPTABLE. Fix it NOW.', urgent: true },
        { sender: 'david-logistics', avatar: '📦', text: 'Orders stopped flowing to warehouse. What\'s going on??', urgent: true }
    ],
    level7: [
        { sender: 'alex-ops', avatar: '⚙️', text: '🔥🔥 CDN is failing! Images not loading!', urgent: true },
        { sender: 'mike-marketing', avatar: '📢', text: 'Our ads are driving traffic to a broken site! STOP THE BLEEDING!', urgent: true },
        { sender: 'jen-customer-success', avatar: '💬', text: '200+ support tickets in the last 5 minutes!!!', urgent: true },
        { sender: 'sarah-cmo', avatar: '👩‍💼', text: 'Social media is ROASTING us. This is a disaster!', urgent: true },
        { sender: 'ceo', avatar: '👔', text: '🚨 All hands on deck. I want every engineer in the war room NOW.', urgent: true }
    ],
    level8: [
        { sender: 'alex-ops', avatar: '⚙️', text: '💀 Cart abandonment is at 80%! Everything is on fire!', urgent: true },
        { sender: 'board-member', avatar: '💼', text: 'CEO just called me. What the hell is going on over there?!', urgent: true },
        { sender: 'mike-marketing', avatar: '📢', text: 'I\'m pausing ALL ad spend. We can\'t drive traffic to this mess!', urgent: true },
        { sender: 'jen-customer-success', avatar: '💬', text: 'I\'m getting death threats from customers! THIS IS INSANE!', urgent: true },
        { sender: 'ceo', avatar: '👔', text: '🔥 We\'re losing MILLIONS per hour! Someone better have answers!', urgent: true }
    ],
    level9: [
        { sender: 'alex-ops', avatar: '⚙️', text: '🆘 Multiple cascading failures! Trying emergency rollback!', urgent: true },
        { sender: 'sarah-cmo', avatar: '👩‍💼', text: 'Press is calling. Do we have a statement??', urgent: true },
        { sender: 'cfo', avatar: '💰', text: 'Revenue down 90% in last hour. This will affect quarterly earnings.', urgent: true },
        { sender: 'jen-customer-success', avatar: '💬', text: 'Customer retention team says we\'ll lose 30% of customers over this!', urgent: true },
        { sender: 'ceo', avatar: '👔', text: '💀 Board wants my head. Fix this or we\'re ALL getting fired!', urgent: true },
        { sender: 'board-member', avatar: '💼', text: 'Emergency board meeting in 1 hour. You better have this fixed.', urgent: true }
    ],
    level10: [
        { sender: 'alex-ops', avatar: '⚙️', text: '🔥🔥🔥 TOTAL SYSTEM COLLAPSE! MAYDAY MAYDAY!', urgent: true },
        { sender: 'ceo', avatar: '👔', text: '💀💀💀 THIS IS A COMPLETE DISASTER! EVERYTHING IS BROKEN!', urgent: true },
        { sender: 'mike-marketing', avatar: '📢', text: 'Competitors are tweeting about our meltdown! We\'re trending for all the wrong reasons!', urgent: true },
        { sender: 'sarah-cmo', avatar: '👩‍💼', text: 'Reuters, Bloomberg, TechCrunch all covering our failure! WHAT DO I TELL THEM?!', urgent: true },
        { sender: 'cfo', avatar: '💰', text: '💸 Stock dropped 40% in after-hours trading!', urgent: true },
        { sender: 'jen-customer-success', avatar: '💬', text: '1000+ support tickets! Team is crying! Someone bring coffee and tissues!', urgent: true },
        { sender: 'board-member', avatar: '💼', text: 'Start preparing resignation letters. This is unacceptable.', urgent: true }
    ]
};

// ===================================
// Notification Functions
// ===================================
function initializeNotifications() {
    // Clear any existing notifications
    elements.notificationContainer.innerHTML = '';

    // Don't show any messages initially - they start at level 2
}

function showNotification(msg) {
    // Add message to game messages queue (will be shown one at a time)
    gameState.game.messages.push({
        ...msg
    });
}

function sendNotification(level) {
    // Get messages for current level
    const levelKey = `level${level}`;
    const messages = slackMessages[levelKey]; // Keep same data structure

    if (!messages || messages.length === 0) return;

    // Pick a random message from this level
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

    // Add slight delay for realism (300-800ms)
    const delay = 300 + Math.random() * 500;
    setTimeout(() => {
        showNotification(randomMsg);
    }, delay);
}

function renderMessages(ctx) {
    // Only show active message (first in queue)
    if (gameState.game.messages.length === 0) return;

    const msg = gameState.game.messages[0];

    // Helper function to wrap text
    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let lineY = y;
        const lines = [];

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && i > 0) {
                lines.push(line);
                line = words[i] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        // Draw all lines
        lines.forEach((line, i) => {
            ctx.fillText(line, x, lineY + (i * lineHeight));
        });

        return lines.length; // Return number of lines for height calculation
    }

    // Calculate message dimensions - larger for better legibility
    const messageWidth = 500;
    const messagePadding = 30;
    const messageHeaderHeight = 50;

    // Measure text to determine height
    ctx.font = '18px Arial';
    const textMaxWidth = messageWidth - (messagePadding * 2);

    // Estimate lines needed
    const words = msg.text.split(' ');
    let testLine = '';
    let lineCount = 1;
    for (let i = 0; i < words.length; i++) {
        const test = testLine + words[i] + ' ';
        const metrics = ctx.measureText(test);
        if (metrics.width > textMaxWidth && i > 0) {
            lineCount++;
            testLine = words[i] + ' ';
        } else {
            testLine = test;
        }
    }

    const textHeight = lineCount * 26;
    const messageHeight = messageHeaderHeight + textHeight + 80; // Extra space for padding and button

    // Center position
    const x = (gameState.game.canvasWidth - messageWidth) / 2;
    const y = (gameState.game.canvasHeight - messageHeight) / 2;

    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, gameState.game.canvasWidth, gameState.game.canvasHeight);

    ctx.save();

    // Message background - higher contrast
    ctx.fillStyle = msg.urgent ? '#ff4444' : '#ffffff';
    ctx.fillRect(x, y, messageWidth, messageHeight);

    // Border - thick pixel art style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.strokeRect(x, y, messageWidth, messageHeight);

    // Header background
    ctx.fillStyle = msg.urgent ? '#cc0000' : '#1e1e1e';
    ctx.fillRect(x, y, messageWidth, messageHeaderHeight);

    // Avatar emoji
    ctx.font = '28px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(msg.avatar, x + messagePadding, y + 36);

    // Sender name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(msg.sender, x + messagePadding + 45, y + 32);

    // Message text (wrapped) - higher contrast
    ctx.font = '18px Arial';
    ctx.fillStyle = msg.urgent ? '#ffffff' : '#000000';
    ctx.textAlign = 'left';
    wrapText(ctx, msg.text, x + messagePadding, y + messageHeaderHeight + 30, textMaxWidth, 26);

    // Close button
    const buttonWidth = 140;
    const buttonHeight = 36;
    const buttonX = x + (messageWidth - buttonWidth) / 2;
    const buttonY = y + messageHeight - buttonHeight - 20;

    ctx.fillStyle = '#27ae60';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DISMISS', buttonX + buttonWidth / 2, buttonY + 24);

    // Store button coordinates for click detection
    gameState.game.dismissButton = {
        x: buttonX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight
    };

    ctx.restore();
}

// ===================================
// Icon Loading Functions
// ===================================
function preloadIcons() {
    const iconFiles = [
        'Calendar Icon.png',
        'Disco Ball Icon.png',
        'Money Icon.png',
        'Pixel Coin Icon.png',
        'Pixel Computer Icon.png',
        'Pixel Icons Mail.png',
        'Smile Emoticon Icon.png'
    ];

    let loadedCount = 0;

    iconFiles.forEach(filename => {
        const img = new Image();
        img.onload = () => {
            loadedCount++;
            if (loadedCount === iconFiles.length) {
                gameState.icons.loaded = true;
                console.log('All drop icons loaded successfully!');
            }
        };
        img.onerror = () => {
            console.error(`Failed to load icon: ${filename}`);
            loadedCount++;
            if (loadedCount === iconFiles.length) {
                gameState.icons.loaded = true;
            }
        };
        img.src = `assets/background/drop/${filename}`;
        gameState.icons.dropIcons.push(img);
    });
}

function preloadBackground() {
    const bgImg = new Image();
    bgImg.onload = () => {
        gameState.background.loaded = true;
        gameState.background.image = bgImg;
        console.log('Background image loaded successfully!');
    };
    bgImg.onerror = (error) => {
        console.error('Failed to load background image:', error);
        console.error('Attempted to load from: assets/background/background.png');
        gameState.background.loaded = false;
    };
    bgImg.src = 'assets/background/background.png';
    console.log('Started loading background image from: assets/background/background.png');
}

// ===================================
// Countdown Timer Functions
// ===================================
function initializeCountdown() {
    // Set target date to November 28, 2025 (Black Friday)
    // Using user's local browser time
    const blackFriday = new Date(2025, 10, 28, 0, 0, 0, 0); // Month is 0-indexed, so 10 = November

    gameState.countdown.targetDate = blackFriday;
    updateCountdown();
    gameState.countdown.interval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const now = new Date().getTime();
    const distance = gameState.countdown.targetDate - now;

    if (distance < 0) {
        clearInterval(gameState.countdown.interval);
        elements.days.textContent = '00';
        elements.hours.textContent = '00';
        elements.minutes.textContent = '00';
        elements.seconds.textContent = '00';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    elements.days.textContent = String(days).padStart(2, '0');
    elements.hours.textContent = String(hours).padStart(2, '0');
    elements.minutes.textContent = String(minutes).padStart(2, '0');
    elements.seconds.textContent = String(seconds).padStart(2, '0');
}

// ===================================
// Planning Assessment Functions
// ===================================
function initializePlanningAssessment() {
    // Initialize date slider
    updateDateDisplay();

    // Add event listeners
    elements.planningDateSlider.addEventListener('input', updateDateDisplay);

    // Add checkbox event listeners
    const checkboxes = document.querySelectorAll('input[name="prep-item"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculateDifficulty);
    });

    // Initial difficulty calculation
    calculateDifficulty();
}

function updateDateDisplay() {
    const weeksFromStart = parseInt(elements.planningDateSlider.value);
    const totalWeeks = 42; // From Jan 1 to Oct 14
    const weeksAgo = totalWeeks - weeksFromStart;

    // Calculate the date based on weeks from January 1, 2025
    const startDate = new Date(2025, 0, 1); // January 1, 2025
    const selectedDate = new Date(startDate);
    selectedDate.setDate(selectedDate.getDate() + (weeksFromStart * 7));

    // Format the date
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    const dateString = selectedDate.toLocaleDateString('en-US', options);

    elements.selectedDate.textContent = dateString;
    elements.weeksAgo.textContent = weeksAgo === 0 ? 'Today' : `${weeksAgo} week${weeksAgo !== 1 ? 's' : ''} ago`;

    // Recalculate difficulty
    calculateDifficulty();
}

function calculateDifficulty() {
    const weeksFromStart = parseInt(elements.planningDateSlider.value);
    const totalWeeks = 42;
    const weeksAgo = totalWeeks - weeksFromStart;

    // Count checked items
    const checkboxes = document.querySelectorAll('input[name="prep-item"]:checked');
    const checkedCount = checkboxes.length;

    // Calculate difficulty based on criteria
    let difficulty = 'MEDIUM';
    let difficultyClass = 'medium';

    // Started 6+ months ago (26+ weeks) + 8-10 checks = Easy
    if (weeksAgo >= 26 && checkedCount >= 8) {
        difficulty = 'EASY';
        difficultyClass = 'easy';
    }
    // Started 3-6 months (13-25 weeks) + 5-7 checks = Medium
    else if (weeksAgo >= 13 && weeksAgo < 26 && checkedCount >= 5 && checkedCount <= 7) {
        difficulty = 'MEDIUM';
        difficultyClass = 'medium';
    }
    // Started 1-3 months (4-12 weeks) + 3-4 checks = Hard
    else if (weeksAgo >= 4 && weeksAgo < 13 && checkedCount >= 3 && checkedCount <= 4) {
        difficulty = 'HARD';
        difficultyClass = 'hard';
    }
    // Started <1 month or <3 checks = Extreme
    else if (weeksAgo < 4 || checkedCount < 3) {
        difficulty = 'EXTREME';
        difficultyClass = 'extreme';
    }
    // Good progress but not enough time
    else if (weeksAgo < 13 && checkedCount >= 5) {
        difficulty = 'HARD';
        difficultyClass = 'hard';
    }
    // Lots of time but not enough progress
    else if (weeksAgo >= 26 && checkedCount < 8) {
        difficulty = 'MEDIUM';
        difficultyClass = 'medium';
    }

    // Store difficulty in game state
    gameState.assessment.difficulty = difficulty;

    // Update badge
    elements.difficultyLevel.className = `difficulty-badge ${difficultyClass}`;
    elements.difficultyLevel.querySelector('.difficulty-text').textContent = difficulty;
}

function launchGame() {
    // Store assessment data in game state
    const checkedCount = document.querySelectorAll('input[name="prep-item"]:checked').length;
    gameState.assessment.checkedCount = checkedCount;

    elements.assessmentSection.classList.add('hidden');
    elements.gameSection.classList.remove('hidden');
    elements.gameSection.scrollIntoView({ behavior: 'smooth' });
}

// ===================================
// Game Functions
// ===================================
function initializeGame() {
    const ctx = elements.gameCanvas.getContext('2d');

    // Calculate time remaining until Black Friday
    const now = new Date().getTime();
    const blackFriday = new Date(2025, 10, 28, 0, 0, 0, 0).getTime();
    const timeRemainingMS = blackFriday - now;
    const timeRemainingSeconds = Math.max(0, Math.floor(timeRemainingMS / 1000));

    gameState.game.score = 0;
    gameState.game.lives = 3;
    gameState.game.level = 1;
    gameState.game.timeRemaining = timeRemainingSeconds;
    gameState.game.initialTimeRemaining = timeRemainingSeconds;
    gameState.game.isRunning = false;
    gameState.game.isPaused = false;
    gameState.game.totalCatches = 0;
    gameState.game.totalMisses = 0;
    gameState.game.levelsCompleted = 0;
    gameState.game.catchesThisLevel = 0;
    gameState.game.fallingObjects = [];
    gameState.game.spawnTimer = 0;

    // Reset player position
    gameState.game.player.x = 360;
    gameState.game.player.y = 570;

    // Set difficulty-based speed and object count
    const difficulty = gameState.assessment.difficulty;
    if (difficulty === 'EASY') {
        gameState.game.baseSpeed = 1;
        gameState.game.spawnInterval = 120; // ~2 seconds between objects
        gameState.game.objectsPerSpawn = 1;
    } else if (difficulty === 'MEDIUM') {
        gameState.game.baseSpeed = 1.5;
        gameState.game.spawnInterval = 100; // ~1.7 seconds
        gameState.game.objectsPerSpawn = 1;
    } else if (difficulty === 'HARD') {
        gameState.game.baseSpeed = 2;
        gameState.game.spawnInterval = 90; // ~1.5 seconds
        gameState.game.objectsPerSpawn = 2; // 2 objects at once
    } else if (difficulty === 'EXTREME') {
        gameState.game.baseSpeed = 2.5;
        gameState.game.spawnInterval = 80; // ~1.3 seconds
        gameState.game.objectsPerSpawn = 3; // 3 objects at once!
    }

    // Clear messages on restart
    gameState.game.messages = [];

    updateGameUI();
    updateGameCountdown();

    // Draw initial game state
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 800, 600);

    // Draw centered "START GAME" button
    const buttonWidth = 300;
    const buttonHeight = 80;
    const buttonX = (800 - buttonWidth) / 2;
    const buttonY = (600 - buttonHeight) / 2;

    // Button background
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // Button border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // Button text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('START GAME', 400, 300);

    // Store button coordinates for click detection
    gameState.game.startButtonBounds = {
        x: buttonX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight
    };
}

function startGame() {
    if (gameState.game.isRunning) return;

    gameState.game.isRunning = true;
    gameState.game.isPaused = false;

    elements.startGame.disabled = true;
    elements.pauseGame.disabled = false;

    // Initialize notifications
    initializeNotifications();

    // Messages start at level 2
    // sendNotification will be called when player reaches level 2

    // Countdown now updates in gameLoop() instead of setInterval

    // Initialize game loop
    gameLoop();
}

function pauseGame() {
    if (!gameState.game.isRunning) return;

    gameState.game.isPaused = !gameState.game.isPaused;
    elements.pauseGame.textContent = gameState.game.isPaused ? 'Resume' : 'Pause';
}

function restartGame() {
    initializeGame();
    elements.startGame.disabled = false;
    elements.pauseGame.disabled = true;
    elements.pauseGame.textContent = 'Pause';
}

// updateGameTimer() removed - countdown now handled in gameLoop()

function updateGameCountdown() {
    const totalSeconds = gameState.game.timeRemaining;

    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);

    elements.gameDays.textContent = String(days).padStart(2, '0');
    elements.gameHours.textContent = String(hours).padStart(2, '0');
    elements.gameMinutes.textContent = String(minutes).padStart(2, '0');
}

function checkLevelProgression() {
    // Check if player has caught enough for current level
    if (gameState.game.catchesThisLevel >= gameState.game.catchesNeededPerLevel) {
        gameState.game.level++;
        gameState.game.levelsCompleted = gameState.game.level - 1;
        gameState.game.catchesThisLevel = 0;

        // Send notification for new level
        sendNotification(gameState.game.level);

        // Increase difficulty for next level (gentler progression)
        gameState.game.baseSpeed += 0.2;
        gameState.game.spawnInterval = Math.max(30, gameState.game.spawnInterval - 3);

        // Increase objects per spawn at higher levels
        if (gameState.game.level >= 5 && gameState.game.level % 2 === 0) {
            gameState.game.objectsPerSpawn = Math.min(gameState.game.objectsPerSpawn + 1, 5);
        }

        // Check if player won (completed all 10 levels)
        if (gameState.game.level > gameState.game.maxLevel) {
            gameState.game.levelsCompleted = gameState.game.maxLevel;
            endGame(true); // Victory!
        }
    }
}

function updateGameUI() {
    elements.level.textContent = `${Math.min(gameState.game.level, gameState.game.maxLevel)}/${gameState.game.maxLevel}`;
    elements.score.textContent = gameState.game.score;
    elements.lives.textContent = gameState.game.lives;
}

function calculateCountdownSpeed() {
    // Calculate how fast countdown should decrease per frame
    // Goal: Countdown reaches 0 exactly when player finishes the game (any level)

    // Calculate remaining catches needed to finish
    const currentLevel = gameState.game.level;
    const levelsRemaining = gameState.game.maxLevel - currentLevel + 1;
    const catchesRemainingThisLevel = gameState.game.catchesNeededPerLevel - gameState.game.catchesThisLevel;
    const totalCatchesRemaining = catchesRemainingThisLevel + ((levelsRemaining - 1) * gameState.game.catchesNeededPerLevel);

    // If no catches remaining (game won), return 0
    if (totalCatchesRemaining <= 0) {
        return 0;
    }

    // Calculate actual average frames per catch more accurately
    // Time for object to fall from top to bottom
    const fallTime = gameState.game.canvasHeight / gameState.game.baseSpeed;

    // Average spawn interval (accounts for current level)
    const averageSpawnInterval = gameState.game.spawnInterval;

    // Total frames per catch = spawn wait + fall time
    // Multiply by 1.3 to account for some misses and imperfect play
    const averageFramesPerCatch = (fallTime + averageSpawnInterval) * 1.3;

    // Estimate total frames to finish
    const estimatedFramesToFinish = totalCatchesRemaining * averageFramesPerCatch;

    // Calculate speed so countdown reaches 0 when done
    const speedPerFrame = gameState.game.timeRemaining / estimatedFramesToFinish;

    // Set minimum speed to prevent countdown from stalling (0.5 seconds per frame)
    // Maximum speed capped at 3.0 to prevent racing too fast
    // At 60 FPS, max of 3.0 = 180 seconds/minute of real time = 3 minutes per minute
    return Math.max(0.5, Math.min(speedPerFrame, 3.0));
}

function spawnObject() {
    const x = Math.random() * (gameState.game.canvasWidth - 60) + 30; // 30px from edges
    const speed = gameState.game.baseSpeed + Math.random() * 0.5; // Less variation for predictability

    // Select random icon if icons are loaded
    let icon = null;
    if (gameState.icons.loaded && gameState.icons.dropIcons.length > 0) {
        const randomIndex = Math.floor(Math.random() * gameState.icons.dropIcons.length);
        icon = gameState.icons.dropIcons[randomIndex];
    }

    gameState.game.fallingObjects.push({
        x: x,
        y: 0,
        radius: 24, // Bigger uniform icon size (48px diameter)
        speed: speed,
        color: '#ffd700', // Fallback color if icon doesn't load
        icon: icon
    });
}

function updateObjects() {
    const objects = gameState.game.fallingObjects;
    const player = gameState.game.player;

    for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];

        // Move object down
        obj.y += obj.speed;

        // Check collision with player
        if (checkCollision(obj, player)) {
            // Caught!
            gameState.game.score += 10;
            gameState.game.totalCatches++;
            gameState.game.catchesThisLevel++;
            updateGameUI();
            objects.splice(i, 1);

            // Check for level progression
            checkLevelProgression();
            continue;
        }

        // Check if object hit the bottom
        if (obj.y > gameState.game.canvasHeight) {
            // Missed!
            gameState.game.lives--;
            gameState.game.totalMisses++;
            updateGameUI();
            objects.splice(i, 1);

            // Check game over
            if (gameState.game.lives <= 0) {
                endGame(false);
            }
        }
    }
}

function checkCollision(obj, player) {
    // Circle-rectangle collision detection
    // Find the closest point on the rectangle to the circle
    const closestX = Math.max(player.x, Math.min(obj.x, player.x + player.width));
    const closestY = Math.max(player.y, Math.min(obj.y, player.y + player.height));

    // Calculate distance between circle center and closest point
    const distanceX = obj.x - closestX;
    const distanceY = obj.y - closestY;
    const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

    // Collision if distance is less than circle radius
    return distanceSquared < (obj.radius * obj.radius);
}

function movePlayer(direction) {
    const player = gameState.game.player;

    if (direction === 'left') {
        player.x = Math.max(0, player.x - player.speed);
    } else if (direction === 'right') {
        player.x = Math.min(gameState.game.canvasWidth - player.width, player.x + player.speed);
    }
}

function gameLoop() {
    if (!gameState.game.isRunning || gameState.game.isPaused) {
        if (gameState.game.isRunning) {
            requestAnimationFrame(gameLoop);
        }
        return;
    }

    const ctx = elements.gameCanvas.getContext('2d');
    const player = gameState.game.player;

    // Accelerated countdown - decreases faster than real-time
    const countdownSpeed = calculateCountdownSpeed();
    gameState.game.timeRemaining -= countdownSpeed;

    // Ensure countdown doesn't go negative
    if (gameState.game.timeRemaining < 0) {
        gameState.game.timeRemaining = 0;
    }

    // Update countdown display
    updateGameCountdown();

    // Check if countdown reached zero
    if (gameState.game.timeRemaining <= 0) {
        if (gameState.game.level >= gameState.game.maxLevel) {
            // Victory - reached level 10 at time zero!
            endGame(true);
        } else {
            // Loss - ran out of time before level 10
            endGame(false);
        }
        return;
    }

    // Clear canvas with solid color background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, gameState.game.canvasWidth, gameState.game.canvasHeight);

    // Spawn new objects
    gameState.game.spawnTimer++;
    if (gameState.game.spawnTimer >= gameState.game.spawnInterval) {
        // Spawn multiple objects based on difficulty
        for (let i = 0; i < gameState.game.objectsPerSpawn; i++) {
            spawnObject();
        }
        gameState.game.spawnTimer = 0;
    }

    // Update and draw falling objects
    updateObjects();

    // Draw falling objects (icons or circles as fallback)
    gameState.game.fallingObjects.forEach(obj => {
        if (obj.icon && gameState.icons.loaded && obj.icon.complete && obj.icon.naturalWidth > 0) {
            // Draw icon only if it's fully loaded and valid
            const size = obj.radius * 2;
            ctx.drawImage(obj.icon, obj.x - obj.radius, obj.y - obj.radius, size, size);
        } else {
            // Fallback to circle if icon not loaded or broken
            ctx.fillStyle = obj.color;
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
            ctx.fill();

            // Add a border
            ctx.strokeStyle = '#ff8c00';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    });

    // Draw player (catcher basket)
    ctx.fillStyle = '#8B4513'; // Brown color
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Add basket details
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, player.width, player.height);

    // Draw basket grid pattern
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(player.x + (player.width / 4) * i, player.y);
        ctx.lineTo(player.x + (player.width / 4) * i, player.y + player.height);
        ctx.stroke();
    }

    // Render messages on top of everything
    renderMessages(ctx);

    requestAnimationFrame(gameLoop);
}

// ===================================
// LocalStorage Functions
// ===================================
function saveHighScore() {
    try {
        const highScoreData = {
            score: gameState.game.score,
            date: new Date().toISOString(),
            difficulty: gameState.assessment.difficulty,
            levelsCompleted: gameState.game.levelsCompleted
        };

        const existingHighScore = localStorage.getItem('bfcmHighScore');

        if (existingHighScore) {
            const existing = JSON.parse(existingHighScore);
            if (gameState.game.score > existing.score) {
                localStorage.setItem('bfcmHighScore', JSON.stringify(highScoreData));
                return true; // New high score
            }
            return false; // Not a new high score
        } else {
            localStorage.setItem('bfcmHighScore', JSON.stringify(highScoreData));
            return true; // First time playing
        }
    } catch (error) {
        console.error('Error saving high score:', error);
        return false;
    }
}

function getHighScore() {
    try {
        const highScoreData = localStorage.getItem('bfcmHighScore');
        if (highScoreData) {
            return JSON.parse(highScoreData);
        }
        return null;
    } catch (error) {
        console.error('Error loading high score:', error);
        return null;
    }
}

function endGame(victory = false) {
    gameState.game.isRunning = false;

    elements.startGame.disabled = false;
    elements.pauseGame.disabled = true;

    // Calculate final stats
    const totalAttempts = gameState.game.totalCatches + gameState.game.totalMisses;
    const accuracy = totalAttempts > 0 ? ((gameState.game.totalCatches / totalAttempts) * 100).toFixed(1) : 0;

    // Save high score
    const isNewHighScore = saveHighScore();

    showResults(accuracy, isNewHighScore, victory);
}

function showResults(accuracy, isNewHighScore, victory = false) {
    const score = gameState.game.score;
    const difficulty = gameState.assessment.difficulty;
    const levelsCompleted = gameState.game.levelsCompleted;

    // Get high score
    const highScoreData = getHighScore();
    const highScore = highScoreData ? highScoreData.score : score;

    // Determine result message based on victory status
    let headline = victory ? '🎉 Victory! You Survived Until Black Friday!' : 'Game Over';
    let message = 'Keep practicing! Every BFCM season is a learning opportunity.';

    if (victory) {
        message = '🏆 Incredible! You successfully managed operations all the way to Black Friday 2025! Your store is battle-tested and ready for peak season!';
    } else if (levelsCompleted >= 7) {
        message = 'Almost there! You demonstrated exceptional operational leadership!';
    } else if (score >= 1000 || levelsCompleted >= 5) {
        message = 'Outstanding performance! Your operations team kept things running smoothly!';
    } else if (score >= 500 || levelsCompleted >= 3) {
        message = 'Solid work! You kept the store operational when it mattered most!';
    } else if (score >= 250 || levelsCompleted >= 1) {
        message = 'Good effort! You managed to handle the holiday rush!';
    }

    // Calculate days until Black Friday
    const now = new Date();
    const blackFriday = new Date(2025, 10, 28);
    const daysUntil = Math.ceil((blackFriday - now) / (1000 * 60 * 60 * 24));

    // Update results display
    elements.finalScore.textContent = score;

    const resultHTML = `
        <div class="result-stats">
            <h2 style="font-size: 1.5rem; color: ${isNewHighScore ? '#ffd700' : '#ffffff'}; margin-bottom: 16px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
                ${headline}${isNewHighScore ? ' 🏆 NEW HIGH SCORE!' : ''}
            </h2>
            <p style="margin-bottom: 24px; font-size: 0.8rem; line-height: 1.8; color: #ffffff; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
                ${message}
            </p>
            <div class="stat-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px;">
                <div style="background: #f0e68c; border: 4px solid #2c3e50; padding: 12px; text-align: center;">
                    <div style="font-size: 0.6rem; color: #2c3e50; font-weight: bold;">YOUR SCORE</div>
                    <div style="font-size: 1.2rem; color: #d63031; font-weight: bold;">${score}</div>
                </div>
                <div style="background: #f0e68c; border: 4px solid #2c3e50; padding: 12px; text-align: center;">
                    <div style="font-size: 0.6rem; color: #2c3e50; font-weight: bold;">HIGH SCORE</div>
                    <div style="font-size: 1.2rem; color: #d4af37; font-weight: bold;">${highScore}</div>
                </div>
                <div style="background: #f0e68c; border: 4px solid #2c3e50; padding: 12px; text-align: center;">
                    <div style="font-size: 0.6rem; color: #2c3e50; font-weight: bold;">ACCURACY</div>
                    <div style="font-size: 1.2rem; color: #00a86b; font-weight: bold;">${accuracy}%</div>
                </div>
                <div style="background: #f0e68c; border: 4px solid #2c3e50; padding: 12px; text-align: center;">
                    <div style="font-size: 0.6rem; color: #2c3e50; font-weight: bold;">LEVELS</div>
                    <div style="font-size: 1.2rem; color: #0066cc; font-weight: bold;">${levelsCompleted}/${gameState.game.maxLevel}</div>
                </div>
            </div>
            <div style="text-align: center; margin-bottom: 16px;">
                <span style="font-size: 0.7rem; color: #ffffff; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); font-weight: bold;">Difficulty:</span>
                <span class="difficulty-badge ${difficulty.toLowerCase()}" style="display: inline-block; padding: 4px 12px; margin-left: 8px; font-size: 0.7rem;">
                    ${difficulty}
                </span>
            </div>
            <div style="text-align: center; font-size: 0.7rem; color: #ffffff; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); margin-bottom: 24px; font-weight: bold;">
                ⏰ ${daysUntil} days until Black Friday!
            </div>
        </div>
    `;

    elements.resultsMessage.innerHTML = resultHTML;

    // Show modal with slight delay for animation
    setTimeout(() => {
        elements.resultsModal.classList.remove('hidden');
    }, 100);
}

// ===================================
// Modal Control Functions
// ===================================
function closeResultsModal() {
    elements.resultsModal.classList.add('hidden');
}

// ===================================
// Score Card Image Generator
// ===================================
function generateScoreCardImage() {
    const score = gameState.game.score;
    const difficulty = gameState.assessment.difficulty;
    const levelsCompleted = gameState.game.levelsCompleted;
    const maxLevels = gameState.game.maxLevel;

    // Get high score
    const highScoreData = getHighScore();
    const highScore = highScoreData ? highScoreData.score : score;

    // Calculate accuracy
    const totalAttempts = gameState.game.totalCatches + gameState.game.totalMisses;
    const accuracy = totalAttempts > 0 ? ((gameState.game.totalCatches / totalAttempts) * 100).toFixed(1) : 0;

    // Calculate days until Black Friday
    const now = new Date();
    const blackFriday = new Date(2025, 10, 28);
    const daysUntil = Math.ceil((blackFriday - now) / (1000 * 60 * 60 * 24));

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#98d8c8');
    gradient.addColorStop(1, '#6a9f8a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 600);

    // Border
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 592, 592);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText('BFCM Ready Score 🎮', 300, 70);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Stats boxes
    const boxY = 120;
    const boxHeight = 100;
    const boxGap = 20;

    // Helper function to draw stat box
    function drawStatBox(x, y, label, value, valueColor) {
        // Box background
        ctx.fillStyle = '#f0e68c';
        ctx.fillRect(x, y, 260, boxHeight);

        // Box border
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, 260, boxHeight);

        // Label
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 16px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + 130, y + 35);

        // Value
        ctx.fillStyle = valueColor;
        ctx.font = 'bold 36px Arial, sans-serif';
        ctx.fillText(value, x + 130, y + 75);
    }

    // Draw stat boxes in 2x2 grid
    drawStatBox(40, boxY, 'YOUR SCORE', score.toString(), '#d63031');
    drawStatBox(300, boxY, 'HIGH SCORE', highScore.toString(), '#d4af37');
    drawStatBox(40, boxY + boxHeight + boxGap, 'ACCURACY', accuracy + '%', '#00a86b');
    drawStatBox(300, boxY + boxHeight + boxGap, 'LEVELS', `${levelsCompleted}/${maxLevels}`, '#0066cc');

    // Difficulty badge
    const difficultyY = boxY + (boxHeight + boxGap) * 2 + 40;

    // Difficulty badge background color
    let difficultyBgColor = '#f39c12';
    if (difficulty === 'EASY') difficultyBgColor = '#27ae60';
    if (difficulty === 'HARD') difficultyBgColor = '#e74c3c';
    if (difficulty === 'EXTREME') difficultyBgColor = '#8e44ad';

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Difficulty:', 300, difficultyY);

    // Difficulty badge
    const badgeWidth = 150;
    const badgeHeight = 50;
    const badgeX = (600 - badgeWidth) / 2;
    const badgeY = difficultyY + 10;

    ctx.fillStyle = difficultyBgColor;
    ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);

    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 4;
    ctx.strokeRect(badgeX, badgeY, badgeWidth, badgeHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 2;
    ctx.fillText(difficulty, 300, badgeY + 35);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Days until Black Friday
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText(`⏰ ${daysUntil} days until Black Friday!`, 300, difficultyY + 100);

    // Footer text
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText('countdown.stuffbysean.com', 300, 570);

    // Convert to blob and download
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bfcm-score-${score}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// ===================================
// Event Listeners
// ===================================
elements.readyButton.addEventListener('click', () => {
    elements.countdownSection.classList.add('hidden');
    elements.assessmentSection.classList.remove('hidden');
    elements.assessmentSection.scrollIntoView({ behavior: 'smooth' });
});

elements.launchGameButton.addEventListener('click', launchGame);
elements.startGame.addEventListener('click', startGame);
elements.pauseGame.addEventListener('click', pauseGame);
elements.restartGame.addEventListener('click', restartGame);
elements.homeButton.addEventListener('click', () => {
    // Stop the game if running
    gameState.game.isRunning = false;
    gameState.game.isPaused = false;

    // Hide game section
    elements.gameSection.classList.add('hidden');

    // Show countdown section
    elements.countdownSection.classList.remove('hidden');

    // Reset buttons
    elements.startGame.disabled = false;
    elements.pauseGame.disabled = true;
    elements.pauseGame.textContent = 'Pause';

    // Scroll to top
    elements.countdownSection.scrollIntoView({ behavior: 'smooth' });
});

elements.playAgain.addEventListener('click', () => {
    closeResultsModal();
    restartGame();
});

// Modal close button
elements.modalClose.addEventListener('click', closeResultsModal);

// Close modal when clicking backdrop
elements.modalBackdrop.addEventListener('click', closeResultsModal);

// Close modal with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !elements.resultsModal.classList.contains('hidden')) {
        closeResultsModal();
    }
});

// Download score card button removed - feature not needed

elements.shareScore.addEventListener('click', () => {
    const score = gameState.game.score;
    const difficulty = gameState.assessment.difficulty;
    const levelsCompleted = gameState.game.levelsCompleted;
    const maxLevels = gameState.game.maxLevel;

    // Calculate days until Black Friday
    const now = new Date();
    const blackFriday = new Date(2025, 10, 28);
    const daysUntil = Math.ceil((blackFriday - now) / (1000 * 60 * 60 * 24));

    // Create Wordle-style shareable text
    const shareText = `BFCM Ready Score 🎮

🎯 Score: ${score}
📊 Difficulty: ${difficulty}
❤️ Levels: ${levelsCompleted}/${maxLevels}
⏰ ${daysUntil} days until Black Friday!

Think you can beat me?
countdown.stuffbysean.com`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText)
            .then(() => {
                // Show confirmation
                const originalText = elements.shareScore.textContent;
                elements.shareScore.textContent = 'Copied!';
                elements.shareScore.style.backgroundColor = '#27ae60';

                setTimeout(() => {
                    elements.shareScore.textContent = originalText;
                    elements.shareScore.style.backgroundColor = '';
                }, 2000);
            })
            .catch(err => {
                console.error('Error copying to clipboard:', err);
                alert('Unable to copy to clipboard. Please try again.');
            });
    } else if (navigator.share) {
        // Fallback to Web Share API
        navigator.share({
            title: 'BFCM Operations Challenge',
            text: shareText
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Final fallback - show text in alert
        alert(`Copy this text:\n\n${shareText}`);
    }
});

// Keyboard controls for player movement
document.addEventListener('keydown', (e) => {
    if (!gameState.game.isRunning || gameState.game.isPaused) return;

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        movePlayer('left');
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        movePlayer('right');
    }
});

// Mouse/touch controls for player movement
elements.gameCanvas.addEventListener('mousemove', (e) => {
    if (!gameState.game.isRunning || gameState.game.isPaused) return;

    const rect = elements.gameCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Center the player on the mouse cursor
    gameState.game.player.x = Math.max(0, Math.min(
        gameState.game.canvasWidth - gameState.game.player.width,
        mouseX - gameState.game.player.width / 2
    ));
});

// Touch controls for mobile
elements.gameCanvas.addEventListener('touchmove', (e) => {
    if (!gameState.game.isRunning || gameState.game.isPaused) return;
    e.preventDefault();

    const rect = elements.gameCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = touch.clientX - rect.left;

    // Center the player on the touch position
    gameState.game.player.x = Math.max(0, Math.min(
        gameState.game.canvasWidth - gameState.game.player.width,
        touchX - gameState.game.player.width / 2
    ));
});

// Click handler for START GAME button and dismissing messages
elements.gameCanvas.addEventListener('click', (e) => {
    const rect = elements.gameCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check for START GAME button click (when game is not running)
    if (!gameState.game.isRunning && gameState.game.startButtonBounds) {
        const btn = gameState.game.startButtonBounds;
        if (clickX >= btn.x && clickX <= btn.x + btn.width &&
            clickY >= btn.y && clickY <= btn.y + btn.height) {
            startGame();
            return;
        }
    }

    // Check for message dismiss button click (when game is running)
    if (gameState.game.isRunning && gameState.game.messages.length > 0 && gameState.game.dismissButton) {
        const btn = gameState.game.dismissButton;
        if (clickX >= btn.x && clickX <= btn.x + btn.width &&
            clickY >= btn.y && clickY <= btn.y + btn.height) {
            // Remove the current message (first in queue)
            gameState.game.messages.shift();
            gameState.game.dismissButton = null;
        }
    }
});

// ===================================
// Initialize on Page Load
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initializeCountdown();
    initializeGame();
    initializePlanningAssessment();
    preloadIcons(); // Load drop icons
    preloadBackground(); // Load background image
});
