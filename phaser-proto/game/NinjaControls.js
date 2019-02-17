const NORMAL_SPEED = 200;
const DASHING_SPEED = 500;
const DOUBLE_TAP_MS = 300;

class NinjaControls {
  /**
   * @param {Phaser.Game} game
   * @param {Phaser.Sprite} player
   */
  constructor(game, player) {
    this.game = game;
    this.player = player;
    this.state = 'idle';
    this.currentDir = 0;
    this.lastDirPressTime = 0;
    this.origWidth = player.getBounds().width;
    this.origHeight = player.getBounds().height;
  }

  continueDashing() {
    this.setVelocity_(this.currentDir, DASHING_SPEED);
  }

  getState() {
    return this.state;
  }

  setDirection_(dir) {
    console.log(`setting dir to ${DIR_STRINGS[dir]}`);
    player.rotation = [0, -0.25, 0.5, 0.25][dir] * Math.PI * 2;
    this.currentDir = dir;

    // Update collider
    const ow = this.origWidth;
    const oh = this.origHeight;
    player.body.setSize(
      [ow, oh, ow, oh][dir],
      [oh, ow, oh, ow][dir],
      [0, 0, -ow, -oh][dir],
      [0, -ow, -oh, 0][dir]);
  }

  setVelocity_(dir, speed) {
    const player = this.player;
    player.body.velocity.set(
      [0, -speed, 0, speed][dir],
      [-speed, 0, speed, 0][dir]
    );
    this.setDirection_(dir);
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

  onHitWall(dir) {
    console.log(`hit wall dir ${DIR_STRINGS[dir]}`);

    this.state = 'idle';
    this.player.body.velocity.set(0, 0);
    this.setDirection_(opposite(dir));
  }
}

