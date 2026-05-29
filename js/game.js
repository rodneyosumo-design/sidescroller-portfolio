/**
 * Main Game Engine - "Slum Runner"
 * Coordinates the game loop, multi-layer parallax scrolling, speeds scaling,
 * UI overlays, and local score storage.
 */

class SlumRunnerGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Internal Logical Resolution (16:9 ratio)
    this.logicalWidth = 960;
    this.logicalHeight = 540;
    
    this.canvas.width = this.logicalWidth;
    this.canvas.height = this.logicalHeight;
    
    // Game Physics & Difficulty Configuration
    this.baseSpeed = 5.5;
    this.gameSpeed = this.baseSpeed;
    this.speedMultiplier = 0.00015; // slow speed scaling over time
    this.maxSpeed = 12.5;
    
    // Entities
    this.player = new Character(this.logicalWidth, this.logicalHeight);
    this.spawner = new ObstacleSpawner(this.logicalWidth, this.logicalHeight);
    
    // Scores
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('slum_high_score')) || 0;
    this.milestoneCount = 1;
    
    // States
    this.state = 'START'; // START, PLAYING, GAME_OVER
    this.lastTime = 0;
    this.bgLoaded = 0;
    
    // Load Parallax Backdrop Assets
    this.parallaxLayers = [
      { src: 'assets/backdrop/layer1.png', speedRatio: 0.04, x: 0, img: new Image() },
      { src: 'assets/backdrop/layer2.png', speedRatio: 0.18, x: 0, img: new Image() },
      { src: 'assets/backdrop/layer3.png', speedRatio: 0.48, x: 0, img: new Image() },
      { src: 'assets/backdrop/layer4.png', speedRatio: 1.00, x: 0, img: new Image() } // Floor dirt path
    ];
    
    this.parallaxLayers.forEach(layer => {
      layer.img.src = layer.src;
      layer.img.onload = () => {
        this.bgLoaded++;
      };
    });
    
    // UI Elements
    this.startOverlay = document.getElementById('start-overlay');
    this.gameOverOverlay = document.getElementById('gameover-overlay');
    this.scoreDisplay = document.getElementById('score-val');
    this.highScoreDisplay = document.getElementById('highscore-val');
    this.finalScoreText = document.getElementById('final-score-text');
    this.hudElement = document.getElementById('game-hud');
    
    // Input Listeners
    this.setupInputs();
    
    // Init display
    this.updateHUD();
  }

  setupInputs() {
    // Keyboard inputs
    window.addEventListener('keydown', (e) => {
      if (this.state === 'PLAYING') {
        if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          this.player.jump();
        }
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          e.preventDefault();
          this.player.startDuck();
        }
      } else if (this.state === 'START' && e.key === 'Enter') {
        this.startGame();
      } else if (this.state === 'GAME_OVER' && e.key === 'Enter') {
        this.restartGame();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (this.state === 'PLAYING') {
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          this.player.stopDuck();
        }
      }
    });

    // Arcade Panel Button Triggers
    const btnJump = document.getElementById('btn-jump');
    const btnSlide = document.getElementById('btn-slide');
    const btnMute = document.getElementById('btn-mute');

    if (btnJump) {
      btnJump.addEventListener('click', () => {
        audioController.playClick();
        if (this.state === 'PLAYING') {
          this.player.jump();
        } else if (this.state === 'START') {
          this.startGame();
        } else if (this.state === 'GAME_OVER') {
          this.restartGame();
        }
      });
    }

    if (btnSlide) {
      // Touch/MouseDown for slide holds
      const startSlide = (e) => {
        e.preventDefault();
        if (this.state === 'PLAYING') {
          this.player.startDuck();
        }
      };
      const stopSlide = (e) => {
        e.preventDefault();
        if (this.state === 'PLAYING') {
          this.player.stopDuck();
        }
      };
      
      btnSlide.addEventListener('mousedown', startSlide);
      btnSlide.addEventListener('mouseup', stopSlide);
      btnSlide.addEventListener('touchstart', startSlide);
      btnSlide.addEventListener('touchend', stopSlide);
    }

    if (btnMute) {
      btnMute.addEventListener('click', () => {
        const isMuted = audioController.toggleMute();
        btnMute.textContent = isMuted ? 'UNMUTE' : 'MUTE';
        btnMute.style.backgroundColor = isMuted ? '#eb4d4b' : '#57606f';
      });
    }
  }

  startGame() {
    this.state = 'PLAYING';
    this.score = 0;
    this.milestoneCount = 1;
    this.gameSpeed = this.baseSpeed;
    this.player.reset();
    this.spawner.reset();
    
    // Hide overlay & show HUD
    if (this.startOverlay) this.startOverlay.classList.add('hidden');
    if (this.gameOverOverlay) this.gameOverOverlay.classList.add('hidden');
    if (this.hudElement) this.hudElement.style.opacity = '1';
    
    audioController.ensureContext();
    audioController.playClick();
    
    // Reset timer and request loop
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  restartGame() {
    this.startGame();
  }

  gameOver() {
    this.state = 'GAME_OVER';
    audioController.playCrash();
    
    // Update and store high score
    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
      localStorage.setItem('slum_high_score', this.highScore);
    }
    
    // Update UI Overlays
    if (this.finalScoreText) {
      this.finalScoreText.textContent = `Score: ${Math.floor(this.score)} | High Score: ${this.highScore}`;
    }
    if (this.gameOverOverlay) this.gameOverOverlay.classList.remove('hidden');
    
    this.updateHUD();
  }

  updateHUD() {
    if (this.scoreDisplay) this.scoreDisplay.textContent = Math.floor(this.score);
    if (this.highScoreDisplay) this.highScoreDisplay.textContent = this.highScore;
  }

  gameLoop(time) {
    if (this.state !== 'PLAYING') return;

    const deltaTime = time - this.lastTime;
    this.lastTime = time;

    // Clear Canvas
    this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);

    // Update Difficulty (Increase Speed gradually)
    this.gameSpeed = Math.min(this.maxSpeed, this.baseSpeed + this.score * this.speedMultiplier);

    // Accumulate Score
    this.score += deltaTime * 0.015;
    this.updateHUD();

    // Check Milestone (every 500 points play a retro sweep)
    if (Math.floor(this.score) >= this.milestoneCount * 500) {
      audioController.playMilestone();
      this.milestoneCount++;
      // flash HUD element briefly
      if (this.hudElement) {
        this.hudElement.style.color = '#f0932b';
        setTimeout(() => {
          this.hudElement.style.color = '#fff';
        }, 300);
      }
    }

    // 1. Update and Render Parallax Layers
    this.renderParallax(this.gameSpeed);

    // 2. Update and Render Spawner
    this.spawner.update(this.gameSpeed, deltaTime);
    this.spawner.draw(this.ctx);

    // 3. Update and Render Character
    this.player.update(this.gameSpeed);
    this.player.draw(this.ctx);

    // 4. Check Collisions
    if (this.spawner.checkCollisions(this.player)) {
      this.gameOver();
      return;
    }

    requestAnimationFrame((time) => this.gameLoop(time));
  }

  renderParallax(speed) {
    this.parallaxLayers.forEach((layer) => {
      // Move layer position
      layer.x -= speed * layer.speedRatio;
      
      // Infinite scroll reset logic
      if (layer.x <= -this.logicalWidth) {
        layer.x = 0;
      }

      // Draw layers seamlessly side-by-side
      if (this.bgLoaded >= 4) {
        this.ctx.drawImage(layer.img, layer.x, 0, this.logicalWidth, this.logicalHeight);
        this.ctx.drawImage(layer.img, layer.x + this.logicalWidth, 0, this.logicalWidth, this.logicalHeight);
      } else {
        // Fallback colors for layers if they aren't loaded yet
        if (layer.speedRatio === 0.04) {
          // sky gradient fallback
          const grad = this.ctx.createLinearGradient(0, 0, 0, this.logicalHeight);
          grad.addColorStop(0, '#1f2230');
          grad.addColorStop(1, '#eb4d4b');
          this.ctx.fillStyle = grad;
          this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);
        } else if (layer.speedRatio === 1.00) {
          // floor fallback dirt road
          this.ctx.fillStyle = '#b36b13';
          this.ctx.fillRect(0, this.logicalHeight - 110, this.logicalWidth, 110);
        }
      }
    });
  }
}
