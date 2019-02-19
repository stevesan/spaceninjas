const NORMAL_SPEED = 200;
const DASHING_SPEED = 500;
const DOUBLE_TAP_MS = 300;

const PLAYER_LAND_AUDIO = new PreloadedAudio("wavs/landscratch.wav");
const CHANGE_DIR_AUDIO = new PreloadedAudio("wavs/boop.wav");
const DASH_AUDIO = new PreloadedAudio("wavs/dash.wav");
const HURT_AUDIO = new PreloadedAudio('wavs/hurt2.wav');


class NinjaPlayer extends GameObject {
  /**
   * @param {GameScene} scene
   */
  constructor(scene, x, y) {
    const game = scene.phaserGame;
    super(scene, x, y, 'ninja', 0);
    scene.player = this;
    game.add.existing(this);
    this.scale.setTo(CPPSP, CPPSP);

    this.animations.add('idle', [2, 10], 4, true);
    this.animations.add('dashing', [0, 8], 16, true);
    this.animations.add('flying', [1, 9], 12, true);

    // Center pivot
    const spriteBounds = this.getBounds();
    const L = Math.min(spriteBounds.width, spriteBounds.height);
    this.pivot.set(spriteBounds.width / 2, L / 2);

    // This is probably right..but messes up our physics right now.
    // player.anchor.set(0.5, 0.5);
    game.physics.arcade.enable(this);
    this.body.bounce.y = 0;
    this.body.gravity.y = 0;

    this.health = 1;
    this.game = game;
    this.state = 'idle';
    this.currentDir = 0;
    this.lastDirPressTime = 0;
    this.origWidth = spriteBounds.width;
    this.origHeight = spriteBounds.height;
  }

  /**
  * @param {GameObject} other 
  */
  onOverlap(other) {
    if (this.isDead()) {
      return;
    }
    if (other.isDamageable() && this.isDashing()) {
      other.onDamage(this, 1);
      if (other.isDead()) {
        return false; // Don't let something we just killed block us.
      }
    }
  }

  /**
   * @param {GameObject} other 
   */
  onCollide(other) {
    if (startedTouchingInAnyDir(this.body)) {
      this.onHitWall(getTouchingDir(this.body));
    }
  }

  isPlayer() { return true; }

  getHealth() {
    return this.health;
  }

  isDamageable() {
    // TODO enforce grace period
    return true;
  }

  onDamage(other, dp) {
    if (!this.isDamageable() || this.isDead()) {
      return;
    }
    this.health -= dp;
    HURT_AUDIO.get().play();
    other.onDamageSuccess(this, dp);
  }

  continueDashing() {
    this.setVelocity_(this.currentDir, DASHING_SPEED);
  }

  isDead() {
    return this.getHealth() <= 0;
  }

  update() {
    if (this.isDead()) {
      this.tint = 0x444;
      this.animations.stop(this.getState());
    }
    else {
      this.animations.play(this.getState());
    }
  }

  getState() {
    return this.state;
  }

  isIdle() {
    return this.state == 'idle';
  }

  setDirection_(dir) {
    const sprite = this;
    sprite.rotation = [0, -0.25, 0.5, 0.25][dir] * Math.PI * 2;
    this.currentDir = dir;

    // Update collider
    const ow = 16;
    const oh = this.isIdle() ? 16 : 32;
    sprite.body.setSize(
      [ow, oh, ow, oh][dir],
      [oh, ow, oh, ow][dir],
      [0, 0, -ow, -oh][dir],
      [0, -ow, -oh, 0][dir]);
  }

  setVelocity_(dir, speed) {
    const player = this;
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
    if (this.isDead()) {
      return;
    }
    const isDash = dir == this.lastPressedDir
      && (Date.now() - this.lastDirPressTime) < DOUBLE_TAP_MS;
    this.lastPressedDir = dir;
    this.lastDirPressTime = Date.now()

    // TODO somehow check if we can even move in this dir!

    this.state = isDash ? "dashing" : "flying";

    console.log(`body: ${this.body}`);

    this.setVelocity_(dir, isDash ? DASHING_SPEED : NORMAL_SPEED);
    if (isDash) {
      DASH_AUDIO.get().play();
    }
    else {
      CHANGE_DIR_AUDIO.get().play();
    }
  }

  onHitWall(dir) {
    if (this.isDead()) {
      return;
    }
    this.state = 'idle';
    this.body.velocity.set(0, 0);
    this.setDirection_(opposite(dir));
    PLAYER_LAND_AUDIO.get().play();
    // DASH_AUDIO.get().stop();
  }
}

