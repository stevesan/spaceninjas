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
    this.state = 'idle';
    this.currentDir = 0;
    this.lastDirPressTime = 0;
  }

  getDirection() {
    return this.currentDir;
  }

  continueDashing() {
    this.setVelocity_(this.currentDir, DASHING_SPEED);
  }

  getState() {
    return this.state;
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

  isFlying() {
    return this.state == 'flying';
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
    const isDash = dir == this.lastPressedDir
      && (Date.now() - this.lastDirPressTime) < DOUBLE_TAP_MS;
    this.setVelocity_(dir, isDash ? DASHING_SPEED : NORMAL_SPEED);
    this.state = isDash ? "dashing" : "flying";
    if (isDash && this.onDash) {
      this.onDash();
    }
    this.lastPressedDir = dir;
    this.lastDirPressTime = Date.now()
  }

  onHitWall() {
    this.state = 'idle';
    this.currentDir = -1;
  }
}

