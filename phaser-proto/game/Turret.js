const COOLDOWN_S = 3;

class TurretBullet extends GameObject {
  /**
   * @param {GameScene} scene 
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    const game = scene.phaserGame;
    super(scene, game.add.sprite(x, y, 'cannonball', 0));
    this.sprite.anchor.set(0.5, 0.5);
    game.physics.arcade.enable(this.sprite);
    this.lifetime = 3;
  }

  update() {
    this.lifetime -= this.scene.phaserGame.time.physicsElapsed;
    if (this.lifetime < 0) {
      this.destroy();
    }
  }

  /**
   * 
   * @param {GameObject} other 
   */
  onOverlap(other) {
    if (other.isPlayer() && other.isDamageable()) {
      other.onDamage(this, 1);
      this.destroy();
    }
    // Bullets always go through everything
    return false;
  }
}

class Turret extends GameObject {
  /**
   * @param {GameScene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    const game = scene.phaserGame;
    super(scene, game.add.sprite(x, y, 'powerup', 1));
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.scale.setTo(2, 2);
    this.game = game;
    this.cooldown = Math.random() * COOLDOWN_S;

    game.physics.arcade.enable(this.sprite);
    this.sprite.body.immovable = true;
  }

  isDamageable() { return true; }

  onDamage(damager) {
    this.destroy();
    WALL_BREAK_AUDIO.get().play();
    hitPause(110);
    addShake(8, 8);
  }

  isDead() { return this.isDestroyed(); }

  update() {
    // TODO effectively disable ourselves if player is not visible
    this.cooldown -= this.game.time.physicsElapsed;
    if (this.cooldown < 0) {
      const bullet = new TurretBullet(this.scene, this.sprite.x, this.sprite.y);
      this.scene.addBullet(bullet);

      const player = this.scene.player.sprite;
      const velocity = fromTo(this.sprite, player);
      velocity.setMagnitude(100);
      bullet.sprite.body.velocity.copyFrom(velocity);
      this.cooldown = COOLDOWN_S;
    }
  }
}