const PLAYER_NORMAL_SPEED = 200;
const PLAYER_DASHING_SPEED = 500;
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

    this.animations.add('idle', [2, 10], 4, true);
    this.animations.add('dashing', [0, 8], 16, true);
    this.animations.add('flying', [1, 9], 12, true);
    this.frame = 10;

    game.physics.arcade.enable(this);
    this.body.bounce.y = 0;
    this.body.gravity.y = 0;

    // Position sprite and collider so they're offset and rotate correctly.
    const spriteBounds = this.getBounds();
    const L = Math.min(spriteBounds.width, spriteBounds.height);
    // Better to set anchor instead of pivot, to keep collider in sync.
    this.anchor.set(0.5, 0.25);
    this.body.setSize(L, L, 0, 0);

    this.health = 1;
    this.state = 'idle';
    this.currentDir = 0;
    this.lastDirPressTime = 0;
    this.origWidth = spriteBounds.width;
    this.origHeight = spriteBounds.height;

    this.wasBlocked = new WasBlockedTracker(this.body);
  }

  isDashableWallTile_(sprite) {
    if (!(sprite instanceof Phaser.Tile)) {
      return false;
    }

    const props = getTileProps(sprite);
    if (!props) {
      return false;
    }

    return props.type == 'softWall';
  }

  /**
  * @param {GameObject} other 
  * @return {boolean}
  */
  onOverlap(other) {
    if (this.isDashableWallTile_(other) && this.isDashing()) {
      // Dash through and break tile.
      removeTileFromMap(other);
      WALL_BREAK_AUDIO.get().play();
      hitPause(200);
      addShake(8, 8);
      return false;
    }
    if (this.isDead()) {
      return true;
    }
    if (other.isDamageable && other.isDamageable() && this.isDashing()) {
      other.onDamage(this, 1);
      if (other.isDead()) {
        return false; // Don't let something we just killed block us.
      }
    }
    return true;
  }

  onHitWall_(dir) {
    if (this.isDead()) {
      return;
    }
    this.state = 'idle';
    this.body.velocity.set(0, 0);
    this.setDirection_(opposite(dir));
    PLAYER_LAND_AUDIO.get().play();
  }

  /**
   * @param {GameObject} other 
   */
  onCollide(other) {
    if (startedTouchingInAnyDir(this.body)) {
      const dir = getTouchingDir(this.body);
      this.onHitWall_(dir);
    }

    if (this.wasBlocked.wasJustBlockedInAnyDir()) {
      const dir = getBlockedDir(this.body);
      this.onHitWall_(dir);
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
    this.setVelocity_(this.currentDir, PLAYER_DASHING_SPEED);
  }

  isDead() {
    return this.getHealth() <= 0;
  }

  update() {
    if (this.isDead() || this.scene.state == 'countdown') {
      this.tint = 0x888888;
      this.animations.stop(this.getState());
    }
    else {
      this.tint = 0xffffff;
      this.animations.play(this.getState());
    }

    this.wasBlocked.update();
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

    this.state = isDash ? "dashing" : "flying";

    this.setVelocity_(dir, isDash ? PLAYER_DASHING_SPEED : PLAYER_NORMAL_SPEED);
    if (isDash) {
      DASH_AUDIO.get().play();
      addShake(2, 2);
    }
    else {
      CHANGE_DIR_AUDIO.get().play();
    }

  }

}

