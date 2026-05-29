/**
 * Game Obstacles Module
 * Handles loading and rendering of Police Barriers and Broken Old Cars.
 */

const OBSTACLE_TYPES = {
  BARRIER: {
    name: 'barrier',
    width: 60,
    height: 65,
    yOffset: 25, // fine-tuned to sit perfectly on dirt floor
    src: 'assets/barrier.png'
  },
  CAR: {
    name: 'car',
    width: 105,
    height: 68,
    yOffset: 22,
    src: 'assets/car.png'
  }
};

class Obstacle {
  constructor(canvasWidth, canvasHeight, typeKey) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    
    // Choose properties based on type
    const typeDef = OBSTACLE_TYPES[typeKey];
    this.type = typeDef.name;
    this.width = typeDef.width;
    this.height = typeDef.height;
    
    // Position
    this.x = canvasWidth + 50; // spawn off-screen
    this.groundY = canvasHeight - 110;
    this.y = this.groundY + typeDef.yOffset - this.height; // ground alignment
    
    // Asset Loading
    this.image = new Image();
    this.image.src = typeDef.src;
    this.imageLoaded = false;
    this.image.onload = () => {
      this.imageLoaded = true;
    };

    // Collision Box adjustment (inset slightly to feel fair to the player)
    this.hitboxOffset = {
      x: 8,
      y: 8,
      w: 16,
      h: 12
    };
  }

  update(gameSpeed) {
    this.x -= gameSpeed;
  }

  draw(ctx) {
    if (this.imageLoaded) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      // Fallback styling if images are slow to load
      ctx.fillStyle = this.type === 'barrier' ? '#eb4d4b' : '#57606f';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      
      // Draw details on fallback boxes
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.strokeRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
    }

    // DEBUG hitbox render (uncomment to visualize hitboxes)
    /*
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      this.x + this.hitboxOffset.x,
      this.y + this.hitboxOffset.y,
      this.width - this.hitboxOffset.w,
      this.height - this.hitboxOffset.h
    );
    */
  }

  isOffscreen() {
    return this.x + this.width < 0;
  }

  // Returns precise bounding rectangle for physics check
  getHitbox() {
    return {
      x: this.x + this.hitboxOffset.x,
      y: this.y + this.hitboxOffset.y,
      width: this.width - this.hitboxOffset.w,
      height: this.height - this.hitboxOffset.h
    };
  }
}

// Spawner Manager helper class
class ObstacleSpawner {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.obstacles = [];
    this.spawnTimer = 0;
    this.minDistance = 380; // guarantees jumpable gaps
    this.lastSpawnX = 0;
  }

  update(gameSpeed, deltaTime) {
    // Move and filter off-screen obstacles
    this.obstacles.forEach(obs => obs.update(gameSpeed));
    this.obstacles = this.obstacles.filter(obs => !obs.isOffscreen());

    // Spawning logic
    this.spawnTimer += deltaTime;

    const currentRightmostX = this.obstacles.length > 0 
      ? Math.max(...this.obstacles.map(o => o.x + o.width))
      : 0;

    // Check if enough space has cleared since the last obstacle
    if (this.canvasWidth - currentRightmostX >= this.minDistance && Math.random() < 0.015) {
      this.spawn();
    }
  }

  spawn() {
    const keys = Object.keys(OBSTACLE_TYPES);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const obstacle = new Obstacle(this.canvasWidth, this.canvasHeight, randomKey);
    this.obstacles.push(obstacle);
  }

  draw(ctx) {
    this.obstacles.forEach(obs => obs.draw(ctx));
  }

  checkCollisions(player) {
    const pX = player.x;
    const pY = player.y;
    const pW = player.width;
    const pH = player.height;

    for (let obs of this.obstacles) {
      const oBox = obs.getHitbox();

      // Check standard AABB intersection
      if (
        pX < oBox.x + oBox.width &&
        pX + pW > oBox.x &&
        pY < oBox.y + oBox.height &&
        pY + pH > oBox.y
      ) {
        return true; // Collision!
      }
    }
    return false;
  }

  reset() {
    this.obstacles = [];
    this.spawnTimer = 0;
  }
}
