/**
 * Main Player Character - Stylized male child with exaggerated big head
 * Handles jumping physics, double jumps, sliding, and run particles.
 */

class Character {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    
    // Character Dimensions
    this.width = 75;
    this.height = 75;
    this.groundY = canvasHeight - 110; // offset based on background dirt path
    
    // Physics
    this.x = 80;
    this.y = this.groundY;
    this.vy = 0;
    this.gravity = 0.65;
    this.jumpStrength = -13.5;
    
    // States
    this.isJumping = false;
    this.doubleJumpAvailable = true;
    this.isDucking = false;
    
    // Dynamic Animations (Rotation, Scale)
    this.rotation = 0; // double jump spin
    this.scaleY = 1;   // duck squish
    this.scaleX = 1;
    
    // Multi-Sprite Loading
    this.sprites = {
      run1: new Image(),
      run2: new Image(),
      run3: new Image(),
      jump: new Image(),
      duck: new Image()
    };
    
    this.sprites.run1.src = 'assets/character_run1.png';
    this.sprites.run2.src = 'assets/character_run2.png';
    this.sprites.run3.src = 'assets/character_run3.png';
    this.sprites.jump.src = 'assets/character_jump.png';
    this.sprites.duck.src = 'assets/character_duck.png';
    
    this.loadedSpritesCount = 0;
    const onSpriteLoad = () => {
      this.loadedSpritesCount++;
    };
    
    Object.values(this.sprites).forEach(img => {
      img.onload = onSpriteLoad;
    });

    // Run Cycle Animation State
    this.runFrameTimer = 0;
    this.runFrameSequence = ['run1', 'run2', 'run3', 'run2'];
    this.currentFrameKey = 'run1';
    
    // Dust Particles
    this.particles = [];
  }

  jump() {
    if (!this.isJumping && !this.isDucking) {
      // First Jump
      this.vy = this.jumpStrength;
      this.isJumping = true;
      this.doubleJumpAvailable = true;
      audioController.playJump();
      this.spawnDust(12);
    } else if (this.isJumping && this.doubleJumpAvailable) {
      // Double Jump!
      this.vy = this.jumpStrength * 0.85;
      this.doubleJumpAvailable = false;
      audioController.playJump();
      this.rotation = 0; // trigger spin animation
      this.spawnDust(8);
    }
  }

  startDuck() {
    if (!this.isJumping) {
      this.isDucking = true;
      this.height = 45; // decrease bounding box height
      this.y = this.groundY + 30; // slide lower
      this.scaleY = 0.6; // squish render vertically
      this.scaleX = 1.15; // stretch horizontally
      this.spawnDust(3);
    }
  }

  stopDuck() {
    if (this.isDucking) {
      this.isDucking = false;
      this.height = 75;
      this.y = this.groundY;
      this.scaleY = 1;
      this.scaleX = 1;
    }
  }

  update(gameSpeed) {
    // Apply gravity
    this.vy += this.gravity;
    
    // If sliding/ducking, apply a bit of slide gravity to ensure ground alignment
    if (this.isDucking) {
      this.y = this.groundY + 30;
      this.vy = 0;
      this.isJumping = false;
    } else {
      this.y += this.vy;
    }

    // Ground collision
    if (this.y > this.groundY) {
      this.y = this.groundY;
      this.vy = 0;
      this.isJumping = false;
      this.doubleJumpAvailable = true;
      this.rotation = 0;
    }

    // Double jump 360-spin animation logic
    if (this.isJumping && !this.doubleJumpAvailable) {
      this.rotation += 0.22; // spin
      if (this.rotation > Math.PI * 2) {
        this.rotation = Math.PI * 2;
      }
    }

    // Dynamic Run Stride transitions based on speed
    if (!this.isJumping && !this.isDucking) {
      this.runFrameTimer += gameSpeed * 0.022; // speeds up cycle as player runs faster
      const seqIndex = Math.floor(this.runFrameTimer) % this.runFrameSequence.length;
      this.currentFrameKey = this.runFrameSequence[seqIndex];
    }

    // Particle Updates
    this.particles.forEach((p, idx) => {
      p.x -= gameSpeed + p.vx;
      p.y += p.vy;
      p.size -= 0.18;
      p.opacity -= 0.02;
      if (p.size <= 0 || p.opacity <= 0) {
        this.particles.splice(idx, 1);
      }
    });

    // Spawn running dust particles on floor
    if (!this.isJumping && Math.random() < 0.3) {
      const offsetSlideY = this.isDucking ? 30 : 0;
      this.particles.push({
        x: this.x + 10,
        y: this.groundY + 70 + offsetSlideY,
        vx: Math.random() * 2 + 1,
        vy: -Math.random() * 1.5,
        size: Math.random() * 6 + 4,
        opacity: 0.8,
        color: `rgba(240, 147, 43, ${Math.random() * 0.4 + 0.2})` // sunset dust
      });
    }
  }

  spawnDust(count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.x + this.width / 2 + (Math.random() * 20 - 10),
        y: this.y + this.height - 5,
        vx: Math.random() * 6 - 3,
        vy: Math.random() * -4 - 2,
        size: Math.random() * 8 + 4,
        opacity: 0.9,
        color: `rgba(235, 77, 75, ${Math.random() * 0.4 + 0.3})` // crimson dust bursts
      });
    }
  }

  draw(ctx) {
    // Draw Particles first (behind character)
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.save();

    // Pivot logic for animations (centered on character)
    const drawX = this.x + this.width / 2;
    const drawY = this.y + this.height / 2;

    ctx.translate(drawX, drawY);

    // Apply scaling (e.g. for slide squish)
    ctx.scale(this.scaleX, this.scaleY);

    // Apply rotations
    if (this.isJumping && !this.doubleJumpAvailable) {
      // Double jump spin
      ctx.rotate(this.rotation);
    } else if (this.isDucking) {
      // Ducking slight forward lean
      ctx.rotate(0.05);
    }

    // Determine the active sprite image
    let activeImage = null;
    if (this.isJumping) {
      activeImage = this.sprites.jump;
    } else if (this.isDucking) {
      activeImage = this.sprites.duck;
    } else {
      activeImage = this.sprites[this.currentFrameKey];
    }

    // Check if the required sprite is fully loaded
    if (this.loadedSpritesCount >= 5 && activeImage && activeImage.complete) {
      ctx.drawImage(
        activeImage,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    } else {
      // Fallback elegant avatar representation if images are slow loading
      ctx.fillStyle = '#f0932b';
      ctx.beginPath();
      ctx.arc(0, -10, 22, 0, Math.PI * 2); // exaggerated big head
      ctx.fill();

      ctx.fillStyle = '#eb4d4b';
      ctx.fillRect(-15, 12, 30, 25); // tiny body
    }

    ctx.restore();
  }

  reset() {
    this.y = this.groundY;
    this.vy = 0;
    this.isJumping = false;
    this.doubleJumpAvailable = true;
    this.isDucking = false;
    this.rotation = 0;
    this.scaleY = 1;
    this.scaleX = 1;
    this.particles = [];
    this.runFrameTimer = 0;
    this.currentFrameKey = 'run1';
  }
}
