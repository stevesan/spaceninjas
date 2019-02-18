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
  constructor(scene) {
    const game = scene.phaserGame;
    const sprite = game.add.sprite(game.world.width / 2, game.world.height / 2, 'ninja');
    super(scene, sprite);
    sprite.scale.setTo(CPPSP, CPPSP);

    sprite.animations.add('idle', [2, 10], 4, true);
    sprite.animations.add('dashing', [0, 8], 16, true);
    sprite.animations.add('flying', [1, 9], 12, true);

    // Center pivot
    const spriteBounds = sprite.getBounds();
    const L = Math.min(spriteBounds.width, spriteBounds.height);
    sprite.pivot.set(spriteBounds.width / 2, L / 2);

    // This is probably right..but messes up our physics right now.
    // player.anchor.set(0.5, 0.5);
    game.physics.arcade.enable(sprite);
    sprite.body.bounce.y = 0;
    sprite.body.gravity.y = 0;

    const keys = game.input.keyboard.addKeys({
      goUp: Phaser.Keyboard.W,
      goDown: Phaser.Keyboard.S,
      goLeft: Phaser.Keyboard.A,
      goRight: Phaser.Keyboard.D,
    });

    keys.goUp.onDown.add(() => this.onDirPressed(0));
    keys.goLeft.onDown.add(() => this.onDirPressed(1));
    keys.goDown.onDown.add(() => this.onDirPressed(2));
    keys.goRight.onDown.add(() => this.onDirPressed(3));

    this.health = 3;
    this.game = game;
    this.sprite = sprite;
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
    if (startedTouchingInAnyDir(this.sprite.body)) {
      this.onHitWall(getTouchingDir(this.sprite.body));
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
    if (!this.isDamageable()) {
      return;
    }
    this.health -= dp;
    HURT_AUDIO.get().play();
    other.onDamageSuccess(this, dp);
  }

  continueDashing() {
    this.setVelocity_(this.currentDir, DASHING_SPEED);
  }

  getState() {
    return this.state;
  }

  isIdle() {
    return this.state == 'idle';
  }

  setDirection_(dir) {
    const sprite = this.sprite;
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
    const player = this.sprite;
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
    this.lastPressedDir = dir;
    this.lastDirPressTime = Date.now()

    // TODO somehow check if we can even move in this dir!

    this.state = isDash ? "dashing" : "flying";

    this.setVelocity_(dir, isDash ? DASHING_SPEED : NORMAL_SPEED);
    if (isDash) {
      DASH_AUDIO.get().play();
    }
    else {
      CHANGE_DIR_AUDIO.get().play();
    }
  }

  onHitWall(dir) {
    this.state = 'idle';
    this.sprite.body.velocity.set(0, 0);
    this.setDirection_(opposite(dir));
    PLAYER_LAND_AUDIO.get().play();
    // DASH_AUDIO.get().stop();
  }
}

