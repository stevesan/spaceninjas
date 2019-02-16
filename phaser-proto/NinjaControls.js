const NORMAL_SPEED = 200;
const DASHING_SPEED = 600;
const DOUBLE_TAP_MS = 300;

class NinjaControls {
  /**
   * @param {Phaser.Game} game
   * @param {Phaser.Sprite} playerSprite
   */
  constructor(game, playerSprite) {
    this.game = game;
    this.playerSprite = playerSprite;
    this.state = "still";
    this.lastDir = 0;
    this.lastDirTime = 0;
  }

  setVelocity_(dir, speed) {
    const player = this.playerSprite;
    player.body.velocity.set(
      [0, -speed, 0, speed][dir],
      [-speed, 0, speed, 0][dir]
    );
    player.rotation = [0, -0.25, 0.5, 0.25][dir] * Math.PI * 2;
  }

  /**
   * 
   * @param {number} dir 
   */
  onDirPressed(dir) {
    switch (this.state) {
      case "still":
      case "wall":
        this.setVelocity_(dir, NORMAL_SPEED);
        this.state = "flying";
        break;
      case "flying":
        if (dir == this.lastDir && (Date.now() - this.lastDirTime) < DOUBLE_TAP_MS) {
          // DASH!
          this.setVelocity_(dir, DASHING_SPEED);
          this.state = "dashing";
          if (this.onDash) {
            this.onDash();
          }
        }
        else {
          this.setVelocity_(dir, NORMAL_SPEED);
          this.state = "flying";
        }
        break;
      case "dashing":
        if (dir != this.lastDir) {
          this.setVelocity_(dir, NORMAL_SPEED);
          this.state = "flying";
        }
        break;
    }
    this.lastDir = dir;
    this.lastDirTime = Date.now()
  }

  onHitWall() {
    this.state = "wall";
    this.lastDir = -1;
  }
}

