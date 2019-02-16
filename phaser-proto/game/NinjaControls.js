const NORMAL_SPEED = 200;
const DASHING_SPEED = 500;
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
    this.currentDir = 0;
    this.lastDirPressTime = 0;
  }

  getDirection() {
    return this.currentDir;
  }

  continueDashing() {
    this.setVelocity_(this.currentDir, DASHING_SPEED);
  }

  setVelocity_(dir, speed) {
    const player = this.playerSprite;
    player.body.velocity.set(
      [0, -speed, 0, speed][dir],
      [-speed, 0, speed, 0][dir]
    );
    player.rotation = [0, -0.25, 0.5, 0.25][dir] * Math.PI * 2;
    this.currentDir = dir;
    if (this.onDirChanged) this.onDirChanged();
  }

  /**
   * @returns {boolean}
   */
  isDashing() {
    return this.state == "dashing";
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
        if (dir == this.currentDir && (Date.now() - this.lastDirPressTime) < DOUBLE_TAP_MS) {
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
        if (dir != this.currentDir) {
          this.setVelocity_(dir, NORMAL_SPEED);
          this.state = "flying";
        }
        break;
    }
    this.lastDirPressTime = Date.now()
  }

  onHitWall() {
    this.state = "wall";
    this.currentDir = -1;
  }
}

