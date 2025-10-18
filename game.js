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
        pausedByMessage: false, // Track if paused due to message (mobile only)
        score: 0,
        lives: 3,
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
            y: 517,
            width: 80,
            height: 83,
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
        dismissButton: null,
        touchFeedback: [] // Array to store touch feedback circles
    },
    icons: {
        loaded: false,
        dropIcons: []
    },
    background: {
        loaded: false,
        image: null
    },
    playerCharacter: {
        loaded: false,
        image: null
    }
};

// ===================================
// DOM Elements
// ===================================
const elements = {
    // Countdown elements (main page)
    countdownSection: document.getElementById('countdownSection'),
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    readyButton: document.getElementById('readyButton'),

    // Sticky header countdown elements
    stickyDays: document.getElementById('stickyDays'),
    stickyHours: document.getElementById('stickyHours'),
    stickyMinutes: document.getElementById('stickyMinutes'),
    stickySeconds: document.getElementById('stickySeconds'),

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
        { sender: 'Sarah (CMO)', avatar: '👩‍💼', text: 'Morning team! Just checking in - are we all set for launch day?', urgent: false },
        { sender: 'Mike (Marketing)', avatar: '📢', text: 'Email campaigns are scheduled and ready to go!', urgent: false },
        { sender: 'Alex (Operations)', avatar: '⚙️', text: 'Server capacity looks good. Monitoring dashboards are up.', urgent: false }
    ],
    level2: [
        { sender: 'Jen (Customer Success)', avatar: '💬', text: 'Customer support team is briefed and standing by!', urgent: false },
        { sender: 'David (Logistics)', avatar: '📦', text: 'Warehouse is prepped. Shipping carriers confirmed.', urgent: false },
        { sender: 'Sarah (CMO)', avatar: '👩‍💼', text: 'Traffic is starting to pick up. Keep an eye on things.', urgent: false }
    ],
    level3: [
        { sender: 'Mike (Marketing)', avatar: '📢', text: 'First email blast just went out. Expecting traffic spike in 10 mins.', urgent: false },
        { sender: 'Alex (Operations)', avatar: '⚙️', text: 'Seeing increased load. All systems nominal so far.', urgent: false },
        { sender: 'CEO', avatar: '👔', text: 'Great start everyone. Let\'s keep this momentum going!', urgent: false }
    ],
    level4: [
        { sender: 'Sarah (CMO)', avatar: '👩‍💼', text: 'Traffic is 2x our projections! This is incredible!', urgent: false },
        { sender: 'Alex (Operations)', avatar: '⚙️', text: 'Scaling up additional servers. Response times still good.', urgent: false },
        { sender: 'Jen (Customer Success)', avatar: '💬', text: 'Support tickets coming in faster. We\'re handling it!', urgent: false },
        { sender: 'CEO', avatar: '👔', text: 'Amazing numbers! Keep me posted on any issues.', urgent: false }
    ],
    level5: [
        { sender: 'Alex (Operations)', avatar: '⚙️', text: 'Database queries slowing down. Investigating now.', urgent: true },
        { sender: 'Mike (Marketing)', avatar: '📢', text: 'Why did our conversion rate just drop??', urgent: true },
        { sender: 'Sarah (CMO)', avatar: '👩‍💼', text: 'Are customers able to check out? Getting some complaints on social.', urgent: true },
        { sender: 'CEO', avatar: '👔', text: 'I need a status update ASAP. What\'s happening?', urgent: true }
    ],
    level6: [
        { sender: 'Alex (Operations)', avatar: '⚙️', text: '🔥 Payment gateway is timing out! Working on it!', urgent: true },
        { sender: 'Jen (Customer Success)', avatar: '💬', text: 'Support queue is EXPLODING. Customers can\'t complete purchases!', urgent: true },
        { sender: 'Sarah (CMO)', avatar: '👩‍💼', text: 'We\'re losing sales every second this is down!', urgent: true },
        { sender: 'CEO', avatar: '👔', text: 'THIS IS NOT ACCEPTABLE. Fix it NOW.', urgent: true },
        { sender: 'David (Logistics)', avatar: '📦', text: 'Orders stopped flowing to warehouse. What\'s going on??', urgent: true }
    ],
    level7: [
        { sender: 'Alex (Operations)', avatar: '⚙️', text: '🔥🔥 CDN is failing! Images not loading!', urgent: true },
        { sender: 'Mike (Marketing)', avatar: '📢', text: 'Our ads are driving traffic to a broken site! STOP THE BLEEDING!', urgent: true },
        { sender: 'Jen (Customer Success)', avatar: '💬', text: '200+ support tickets in the last 5 minutes!!!', urgent: true },
        { sender: 'Sarah (CMO)', avatar: '👩‍💼', text: 'Social media is ROASTING us. This is a disaster!', urgent: true },
        { sender: 'CEO', avatar: '👔', text: '🚨 All hands on deck. I want every engineer in the war room NOW.', urgent: true }
    ],
    level8: [
        { sender: 'Alex (Operations)', avatar: '⚙️', text: '💀 Cart abandonment is at 80%! Everything is on fire!', urgent: true },
        { sender: 'Board Member', avatar: '💼', text: 'CEO just called me. What the hell is going on over there?!', urgent: true },
        { sender: 'Mike (Marketing)', avatar: '📢', text: 'I\'m pausing ALL ad spend. We can\'t drive traffic to this mess!', urgent: true },
        { sender: 'Jen (Customer Success)', avatar: '💬', text: 'I\'m getting death threats from customers! THIS IS INSANE!', urgent: true },
        { sender: 'CEO', avatar: '👔', text: '🔥 We\'re losing MILLIONS per hour! Someone better have answers!', urgent: true }
    ],
    level9: [
        { sender: 'Alex (Operations)', avatar: '⚙️', text: '🆘 Multiple cascading failures! Trying emergency rollback!', urgent: true },
        { sender: 'Sarah (CMO)', avatar: '👩‍💼', text: 'Press is calling. Do we have a statement??', urgent: true },
        { sender: 'CFO', avatar: '💰', text: 'Revenue down 90% in last hour. This will affect quarterly earnings.', urgent: true },
        { sender: 'Jen (Customer Success)', avatar: '💬', text: 'Customer retention team says we\'ll lose 30% of customers over this!', urgent: true },
        { sender: 'CEO', avatar: '👔', text: '💀 Board wants my head. Fix this or we\'re ALL getting fired!', urgent: true },
        { sender: 'Board Member', avatar: '💼', text: 'Emergency board meeting in 1 hour. You better have this fixed.', urgent: true }
    ],
    level10: [
        { sender: 'Alex (Operations)', avatar: '⚙️', text: '🔥🔥🔥 TOTAL SYSTEM COLLAPSE! MAYDAY MAYDAY!', urgent: true },
        { sender: 'CEO', avatar: '👔', text: '💀💀💀 THIS IS A COMPLETE DISASTER! EVERYTHING IS BROKEN!', urgent: true },
        { sender: 'Mike (Marketing)', avatar: '📢', text: 'Competitors are tweeting about our meltdown! We\'re trending for all the wrong reasons!', urgent: true },
        { sender: 'Sarah (CMO)', avatar: '👩‍💼', text: 'Reuters, Bloomberg, TechCrunch all covering our failure! WHAT DO I TELL THEM?!', urgent: true },
        { sender: 'CFO', avatar: '💰', text: '💸 Stock dropped 40% in after-hours trading!', urgent: true },
        { sender: 'Jen (Customer Success)', avatar: '💬', text: '1000+ support tickets! Team is crying! Someone bring coffee and tissues!', urgent: true },
        { sender: 'Board Member', avatar: '💼', text: 'Start preparing resignation letters. This is unacceptable.', urgent: true }
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

    // Auto-pause on mobile when message appears
    const isMobile = window.innerWidth <= 768;
    if (isMobile && gameState.game.isRunning && !gameState.game.isPaused) {
        gameState.game.isPaused = true;
        gameState.game.pausedByMessage = true;
    }
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

    // Detect mobile screen size for responsive message sizing
    const isMobile = gameState.game.canvasWidth <= 480;
    const isTablet = gameState.game.canvasWidth > 480 && gameState.game.canvasWidth <= 768;

    // Calculate message dimensions - responsive sizing
    const messageWidth = isMobile ? 320 : (isTablet ? 400 : 500);
    const messagePadding = isMobile ? 16 : (isTablet ? 20 : 30);
    const messageHeaderHeight = isMobile ? 35 : (isTablet ? 40 : 50);

    // Measure text to determine height - responsive font sizes
    const baseFontSize = isMobile ? 14 : (isTablet ? 16 : 18);
    const lineHeight = isMobile ? 20 : (isTablet ? 22 : 26);
    ctx.font = `${baseFontSize}px Arial`;
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

    const textHeight = lineCount * lineHeight;
    const buttonSpace = isMobile ? 50 : (isTablet ? 60 : 80);
    const messageHeight = messageHeaderHeight + textHeight + buttonSpace;

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

    // Avatar emoji - responsive sizing
    const avatarSize = isMobile ? 20 : (isTablet ? 24 : 28);
    const avatarY = isMobile ? 24 : (isTablet ? 28 : 36);
    ctx.font = `${avatarSize}px Arial`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(msg.avatar, x + messagePadding, y + avatarY);

    // Sender name - responsive sizing
    const senderFontSize = isMobile ? 12 : (isTablet ? 14 : 16);
    const senderY = isMobile ? 22 : (isTablet ? 26 : 32);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${senderFontSize}px Arial`;
    ctx.fillText(msg.sender, x + messagePadding + (isMobile ? 30 : 45), y + senderY);

    // Message text (wrapped) - higher contrast with responsive sizing
    ctx.font = `${baseFontSize}px Arial`;
    ctx.fillStyle = msg.urgent ? '#ffffff' : '#000000';
    ctx.textAlign = 'left';
    const textY = isMobile ? 20 : (isTablet ? 25 : 30);
    wrapText(ctx, msg.text, x + messagePadding, y + messageHeaderHeight + textY, textMaxWidth, lineHeight);

    // Close button - responsive sizing
    const buttonWidth = isMobile ? 100 : (isTablet ? 120 : 140);
    const buttonHeight = isMobile ? 32 : (isTablet ? 36 : 40);
    const buttonX = x + (messageWidth - buttonWidth) / 2;
    const buttonY = y + messageHeight - buttonHeight - (isMobile ? 12 : 20);

    ctx.fillStyle = '#27ae60';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = isMobile ? 3 : 4;
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    ctx.fillStyle = '#ffffff';
    const buttonFontSize = isMobile ? 11 : (isTablet ? 12 : 14);
    ctx.font = `bold ${buttonFontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const buttonText = isMobile ? 'TAP' : 'REPLY';
    ctx.fillText(buttonText, buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);

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

function preloadPlayerCharacter() {
    const playerImg = new Image();
    playerImg.onload = () => {
        gameState.playerCharacter.loaded = true;
        gameState.playerCharacter.image = playerImg;
        console.log('Player character loaded successfully!');
    };
    playerImg.onerror = (error) => {
        console.error('Failed to load player character:', error);
        gameState.playerCharacter.loaded = false;
    };
    playerImg.src = 'assets/player-character.png';
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
        elements.stickyDays.textContent = '00';
        elements.stickyHours.textContent = '00';
        elements.stickyMinutes.textContent = '00';
        elements.stickySeconds.textContent = '00';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Update main countdown section
    elements.days.textContent = String(days).padStart(2, '0');
    elements.hours.textContent = String(hours).padStart(2, '0');
    elements.minutes.textContent = String(minutes).padStart(2, '0');
    elements.seconds.textContent = String(seconds).padStart(2, '0');

    // Update sticky header countdown
    elements.stickyDays.textContent = String(days).padStart(2, '0');
    elements.stickyHours.textContent = String(hours).padStart(2, '0');
    elements.stickyMinutes.textContent = String(minutes).padStart(2, '0');
    elements.stickySeconds.textContent = String(seconds).padStart(2, '0');
}

// ===================================
// Planning Assessment Functions
// ===================================
function initializePlanningAssessment() {
    // Calculate actual weeks from Jan 1 of current year to today
    const today = new Date();
    const startDate = new Date(today.getFullYear(), 0, 1); // January 1 of current year
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(daysSinceStart / 7);

    // Update the date slider labels to show current year
    const dateLabels = document.querySelector('.date-labels');
    if (dateLabels) {
        const firstLabel = dateLabels.querySelector('span:first-child');
        if (firstLabel) {
            firstLabel.textContent = `Jan ${today.getFullYear()}`;
        }
    }

    // Set slider max value to actual weeks since start
    elements.planningDateSlider.max = totalWeeks;
    elements.planningDateSlider.value = totalWeeks; // Default to today

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

    // Calculate actual weeks from Jan 1 of current year to today
    const today = new Date();
    const startDate = new Date(today.getFullYear(), 0, 1); // January 1 of current year
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(daysSinceStart / 7);

    const weeksAgo = totalWeeks - weeksFromStart;

    // Calculate the selected date based on weeks from January 1 of current year
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

    // Calculate actual weeks from Jan 1 of current year to today
    const today = new Date();
    const startDate = new Date(today.getFullYear(), 0, 1); // January 1 of current year
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(daysSinceStart / 7);

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

    // Re-initialize game with the correct difficulty settings from assessment
    initializeGame();

    elements.assessmentSection.classList.add('hidden');
    elements.gameSection.classList.remove('hidden');
    elements.gameSection.scrollIntoView({ behavior: 'smooth' });
}

// ===================================
// Game Functions
// ===================================
function initializeGame() {
    const ctx = elements.gameCanvas.getContext('2d');

    gameState.game.score = 0;
    gameState.game.lives = 3;
    gameState.game.level = 1;
    gameState.game.isRunning = false;
    gameState.game.isPaused = false;
    gameState.game.totalCatches = 0;
    gameState.game.totalMisses = 0;
    gameState.game.levelsCompleted = 0;
    gameState.game.catchesThisLevel = 0;
    gameState.game.fallingObjects = [];
    gameState.game.spawnTimer = 0;

    // Detect mobile for responsive sizing
    const isMobile = window.innerWidth <= 480;
    const isTablet = window.innerWidth > 480 && window.innerWidth <= 768;

    // Adjust player size for mobile (larger for better touch control)
    if (isMobile) {
        gameState.game.player.width = 100;
        gameState.game.player.height = 104;
    } else if (isTablet) {
        gameState.game.player.width = 90;
        gameState.game.player.height = 94;
    } else {
        gameState.game.player.width = 80;
        gameState.game.player.height = 83;
    }

    // Reset player position (centered at bottom)
    gameState.game.player.x = (gameState.game.canvasWidth - gameState.game.player.width) / 2;
    gameState.game.player.y = gameState.game.canvasHeight - gameState.game.player.height;

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
        gameState.game.baseSpeed = 1.8;
        gameState.game.spawnInterval = 95; // ~1.6 seconds
        gameState.game.objectsPerSpawn = 1; // Start with 1 object, but ramps up faster through progression
    }

    // Clear messages on restart
    gameState.game.messages = [];

    updateGameUI();

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


function spawnObject() {
    const x = Math.random() * (gameState.game.canvasWidth - 60) + 30; // 30px from edges
    const speed = gameState.game.baseSpeed + Math.random() * 0.5; // Less variation for predictability

    // Select random icon if icons are loaded
    let icon = null;
    if (gameState.icons.loaded && gameState.icons.dropIcons.length > 0) {
        const randomIndex = Math.floor(Math.random() * gameState.icons.dropIcons.length);
        icon = gameState.icons.dropIcons[randomIndex];
    }

    // Detect mobile for responsive sizing
    const isMobile = window.innerWidth <= 480;
    const isTablet = window.innerWidth > 480 && window.innerWidth <= 768;

    // Larger objects on mobile for better visibility and touch accuracy
    const radius = isMobile ? 30 : (isTablet ? 27 : 24);

    gameState.game.fallingObjects.push({
        x: x,
        y: 0,
        radius: radius,
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
    if (!gameState.game.isRunning) {
        return;
    }

    const ctx = elements.gameCanvas.getContext('2d');
    const player = gameState.game.player;

    // If paused, still render the current frame but don't update game state
    if (gameState.game.isPaused) {
        // Render current game state without updates
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, gameState.game.canvasWidth, gameState.game.canvasHeight);

        // Draw falling objects (frozen in place)
        gameState.game.fallingObjects.forEach(obj => {
            if (obj.icon && gameState.icons.loaded && obj.icon.complete && obj.icon.naturalWidth > 0) {
                const size = obj.radius * 2;
                ctx.drawImage(obj.icon, obj.x - obj.radius, obj.y - obj.radius, size, size);
            } else {
                ctx.fillStyle = obj.color;
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ff8c00';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        });

        // Draw player character
        if (gameState.playerCharacter.loaded && gameState.playerCharacter.image.complete) {
            ctx.drawImage(gameState.playerCharacter.image, player.x, player.y, player.width, player.height);
        } else {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(player.x, player.y, player.width, player.height);
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            ctx.strokeRect(player.x, player.y, player.width, player.height);
        }

        // Render messages on top (this is why we paused!)
        renderMessages(ctx);

        requestAnimationFrame(gameLoop);
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

    // Draw player character
    if (gameState.playerCharacter.loaded && gameState.playerCharacter.image.complete) {
        ctx.drawImage(gameState.playerCharacter.image, player.x, player.y, player.width, player.height);
    } else {
        // Fallback to simple rectangle if character not loaded
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(player.x, player.y, player.width, player.height);
    }

    // Draw touch feedback circles
    for (let i = gameState.game.touchFeedback.length - 1; i >= 0; i--) {
        const feedback = gameState.game.touchFeedback[i];

        // Animate the feedback
        feedback.radius += 3;
        feedback.alpha -= 0.05;

        // Remove if fully faded
        if (feedback.alpha <= 0) {
            gameState.game.touchFeedback.splice(i, 1);
            continue;
        }

        // Draw the ripple effect
        ctx.save();
        ctx.globalAlpha = feedback.alpha;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(feedback.x, feedback.y, feedback.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
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
    // Recalculate slider range with current real-time date
    const today = new Date();
    const startDate = new Date(today.getFullYear(), 0, 1);
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(daysSinceStart / 7);

    // Update slider max and default value to current date
    elements.planningDateSlider.max = totalWeeks;
    elements.planningDateSlider.value = totalWeeks;

    // Update date display with current data
    updateDateDisplay();

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

// Helper function to scale coordinates from displayed canvas to internal canvas
function scaleCanvasCoordinates(clientX, clientY) {
    const rect = elements.gameCanvas.getBoundingClientRect();

    // Calculate the scale ratio between internal canvas size and displayed size
    const scaleX = gameState.game.canvasWidth / rect.width;
    const scaleY = gameState.game.canvasHeight / rect.height;

    // Get position relative to canvas
    const displayX = clientX - rect.left;
    const displayY = clientY - rect.top;

    // Scale to internal canvas coordinates
    const canvasX = displayX * scaleX;
    const canvasY = displayY * scaleY;

    return { x: canvasX, y: canvasY };
}

// Mouse/touch controls for player movement
elements.gameCanvas.addEventListener('mousemove', (e) => {
    if (!gameState.game.isRunning || gameState.game.isPaused) return;

    const coords = scaleCanvasCoordinates(e.clientX, e.clientY);

    // Center the player on the mouse cursor
    gameState.game.player.x = Math.max(0, Math.min(
        gameState.game.canvasWidth - gameState.game.player.width,
        coords.x - gameState.game.player.width / 2
    ));
});

// Touch controls for mobile - tap to move player
let touchStartX = null;
let touchStartTime = null;
let isTouchMoving = false;

elements.gameCanvas.addEventListener('touchstart', (e) => {
    if (!gameState.game.isRunning || gameState.game.isPaused) return;
    e.preventDefault();

    const touch = e.touches[0];
    const coords = scaleCanvasCoordinates(touch.clientX, touch.clientY);
    touchStartX = coords.x;
    touchStartTime = Date.now();
    isTouchMoving = false;

    // Add visual touch feedback (using canvas coordinates)
    gameState.game.touchFeedback.push({
        x: coords.x,
        y: coords.y,
        alpha: 1.0,
        radius: 0
    });

    // If there's a message displayed, don't start touch tracking for player movement
    if (gameState.game.messages.length > 0) {
        touchStartX = null;
    }
});

elements.gameCanvas.addEventListener('touchmove', (e) => {
    if (!gameState.game.isRunning || gameState.game.isPaused) return;
    e.preventDefault();

    const touch = e.touches[0];
    const coords = scaleCanvasCoordinates(touch.clientX, touch.clientY);

    // Mark as moving if touch has moved significantly (scaled threshold)
    if (touchStartX !== null && Math.abs(coords.x - touchStartX) > 5) {
        isTouchMoving = true;

        // Drag to position (smooth follow)
        gameState.game.player.x = Math.max(0, Math.min(
            gameState.game.canvasWidth - gameState.game.player.width,
            coords.x - gameState.game.player.width / 2
        ));
    }
});

elements.gameCanvas.addEventListener('touchend', (e) => {
    if (!gameState.game.isRunning || gameState.game.isPaused) return;
    e.preventDefault();

    const touch = e.changedTouches[0];
    const touchDuration = Date.now() - touchStartTime;

    // Check if this is a tap on a message or button
    const wasHandled = handleCanvasInteraction(touch.clientX, touch.clientY);

    // If not handled and it was a quick tap (not a drag), treat as tap-to-move
    if (!wasHandled && !isTouchMoving && touchDuration < 200 && touchStartX !== null) {
        const tapX = touchStartX;

        // Move player toward tap position
        const targetX = Math.max(0, Math.min(
            gameState.game.canvasWidth - gameState.game.player.width,
            tapX - gameState.game.player.width / 2
        ));

        gameState.game.player.x = targetX;
    }

    touchStartX = null;
    touchStartTime = null;
    isTouchMoving = false;
});

// Click handler for START GAME button and dismissing messages
function handleCanvasInteraction(clientX, clientY) {
    const coords = scaleCanvasCoordinates(clientX, clientY);

    // Check for START GAME button click (when game is not running)
    if (!gameState.game.isRunning && gameState.game.startButtonBounds) {
        const btn = gameState.game.startButtonBounds;
        if (coords.x >= btn.x && coords.x <= btn.x + btn.width &&
            coords.y >= btn.y && coords.y <= btn.y + btn.height) {
            startGame();
            return true;
        }
    }

    // Check if message is displayed and tap anywhere on message overlay to dismiss
    if (gameState.game.isRunning && gameState.game.messages.length > 0) {
        // Message takes up most of the screen, so any tap dismisses it
        gameState.game.messages.shift();
        gameState.game.dismissButton = null;

        // Auto-resume on mobile when message is dismissed (if paused by message)
        const isMobile = window.innerWidth <= 768;
        if (isMobile && gameState.game.pausedByMessage) {
            gameState.game.isPaused = false;
            gameState.game.pausedByMessage = false;
        }

        return true;
    }

    return false;
}

elements.gameCanvas.addEventListener('click', (e) => {
    handleCanvasInteraction(e.clientX, e.clientY);
});

// ===================================
// Prevent pull-to-refresh on mobile during gameplay
// ===================================
let lastTouchY = 0;

document.body.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        lastTouchY = e.touches[0].clientY;
    }
}, { passive: false });

document.body.addEventListener('touchmove', (e) => {
    const touchY = e.touches[0].clientY;
    const touchYDelta = touchY - lastTouchY;
    lastTouchY = touchY;

    // If user is pulling down at the top of the page, prevent default
    // This stops pull-to-refresh on iOS Safari
    if (window.scrollY === 0 && touchYDelta > 0) {
        e.preventDefault();
    }
}, { passive: false });

// ===================================
// Initialize on Page Load
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initializeCountdown();
    initializeGame();
    initializePlanningAssessment();
    preloadIcons(); // Load drop icons
    preloadBackground(); // Load background image
    preloadPlayerCharacter(); // Load player character sprite
});
