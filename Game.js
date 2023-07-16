// Game variables
var score = 0;
var lives = 3;
var gameRunning = false;
var gameTime = 0;
var lostLife = false;

// Game objects
var player = {
    x: 400,  // Player's x position
    y: 550,  // Player's y position
    width: 50,  // Width of the player
    height: 50,  // Height of the player
    speed: 10,  // Speed of the player (doubled)
    image: null,  // Image of the player
};

var items = [];

// Load images
var playerImages = {
    'Bard': new Image(),
    'ChatGPT': new Image(),
    'Claude.AI': new Image()
};
playerImages['Bard'].src = 'bard.png';
playerImages['ChatGPT'].src = 'chatgpt.png';
playerImages['Claude.AI'].src = 'claudeai.png';

var goodItemImage = new Image();
goodItemImage.src = 'goodItem.png';

var badItemImage = new Image();
badItemImage.src = 'badItem.png';

// Load audio
var goodItemSound = new Audio('good_item_sound.mp3');
goodItemSound.playbackRate = 2.0;  // Double speed
var badItemSound = new Audio('bad_item_sound.mp3');
var gameOverSound = new Audio('game_over_sound.mp3');
var backgroundMusic = new Audio('background_music.wav');
backgroundMusic.loop = true;  // Loop the music

// High scores
var highScores = [];
var highScoresTable = document.getElementById('highScoresTable');

// Canvas and context
var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

// Score and lives elements
var scoreElement = document.getElementById('score');
var livesElement = document.getElementById('lives');

// Character selection
var characterSelection = document.getElementById('characterSelection');

// Game Over screen
var gameOverScreen = document.getElementById('gameOverScreen');

// Game loop
function gameLoop() {
    if (!gameRunning) {
        return;
    }
    update();  // Update game state
    draw();  // Draw game state
    requestAnimationFrame(gameLoop);  // Schedule next update
}

// Game update function
function update() {
    gameTime++;

    // Move the items
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        item.y += item.speed;
        
        // Check for collision with the player
        if (item.y + item.height > player.y && item.y < player.y + player.height && 
            item.x + item.width > player.x && item.x < player.x + player.width) {
            if (item.bad) {
                // Bad item, lose a life
                lives--;
                badItemSound.play();  // Play bad item sound
                lostLife = true;  // Signal that a life was lost
                if (lives <= 0) {
                    // Game over
                    gameRunning = false;
                    gameOverSound.play();  // Play game over sound
                    backgroundMusic.pause();  // Stop the background music
                    backgroundMusic.currentTime = 0;  // Reset the music track
                    var initials = prompt('Game Over! Your score was: ' + score + '. Enter your initials (3 characters):');
                    while (initials.length != 3) {
                        initials = prompt('Invalid input! Enter your initials (3 characters):');
                    }
                    highScores.push({ initials: initials, score: score });
                    saveHighScores();
                    gameOverScreen.style.display = 'block';  // Show game over screen
                }
            } else {
                // Good item, increase score
                score++;
                goodItemSound.play();  // Play good item sound
            }

            // Remove the item
            items.splice(i, 1);
            i--;
        }
    }

    // Spawn new items
    if (Math.random() < 0.01 + gameTime / 36000) { // Increase drop rate over time
        // Randomly decide if the item is good or bad
        var isBad = Math.random() < Math.min(0.3 + gameTime / 1800, 0.7);  // Increase bad item chance over time, up to a maximum of 70%
        items.push({
            x: Math.random() * (canvas.width - 40),
            y: -40,
            width: 40,  // Doubled size
            height: 40,  // Doubled size
            speed: 2 + gameTime / 600,  // Increase drop speed over time
            bad: isBad,
        });
    }

    // Update score and lives display
    scoreElement.textContent = score;
    livesElement.textContent = lives;
}

// Game draw function
function draw() {
    // If a life was lost, flash red
    if (lostLife) {
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        lostLife = false;  // Reset lostLife flag
    } else {
        // Clear the screen with black color
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw the player
    ctx.drawImage(player.image, player.x, player.y, player.width, player.height);

    // Draw the items
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        ctx.drawImage(item.bad ? badItemImage : goodItemImage, item.x, item.y, item.width, item.height);
    }
}

// Event handlers
window.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        // Move player left, but not off-screen
        if (player.x - player.speed >= 0) {
            player.x -= player.speed;
        }
    } else if (event.key === 'ArrowRight') {
        // Move player right, but not off-screen
        if (player.x + player.width + player.speed <= canvas.width) {
            player.x += player.speed;
        }
    }
});

// High scores functions
function saveHighScores() {
    // Sort the high scores in descending order and keep only the top 5
    highScores.sort(function(a, b) { return b.score - a.score; });
    highScores = highScores.slice(0, 5);

    // Save to local storage
    localStorage.setItem('highScores', JSON.stringify(highScores));

    // Update the high scores display
    updateHighScoresDisplay();
}

function loadHighScores() {
    var savedScores = localStorage.getItem('highScores');
    if (savedScores) {
        highScores = JSON.parse(savedScores);
    }

    // Update the high scores display
    updateHighScoresDisplay();
}

function updateHighScoresDisplay() {
    // Clear the high scores table
    while (highScoresTable.firstChild) {
        highScoresTable.removeChild(highScoresTable.firstChild);
    }

    // Add each high score to the table
    for (var i = 0; i < highScores.length; i++) {
        var row = document.createElement('tr');
        var initialsCell = document.createElement('td');
        var scoreCell = document.createElement('td');
        initialsCell.textContent = highScores[i].initials;
        scoreCell.textContent = highScores[i].score;
        row.appendChild(initialsCell);
        row.appendChild(scoreCell);
        highScoresTable.appendChild(row);
    }
}

function startGame(character) {
    // Set the player image
    player.image = playerImages[character];

    // Hide the character selection
    characterSelection.style.display = 'none';

    // Show the game screen
    document.getElementById('gameScreen').style.display = 'block';

    // Reset game variables
    score = 0;
    lives = 3;
    gameTime = 0;
    items = [];

    // Start the game
    gameRunning = true;
    backgroundMusic.play().catch(function(error) {
        console.error('Failed to play background music:', error);
    });  // Start the background music
    gameLoop();
}


function restartGame() {
    // Reset game variables
    score = 0;
    lives = 3;
    gameTime = 0;
    items = [];

    // Hide game over screen
    gameOverScreen.style.display = 'none';

    // Show character selection
    characterSelection.style.display = 'block';
}

// Start the game
loadHighScores();

