const COOLDOWN_S = 3;

class TurretBullet extends GameObject {
  /**
   * @param {GameScene} scene 
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    const game = scene.phaserGame;
    super(scene, x, y, 'cannonball', 0);
    scene.bullets.add(this);
    this.anchor.set(0.5, 0.5);
    game.physics.arcade.enable(this);
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
    super(scene, x, y, 'powerup', 1);
    scene.enemies.add(this);
    this.anchor.set(0.5, 0.5);
    this.cooldown = Math.random() * COOLDOWN_S;

    game.physics.arcade.enable(this);
    this.body.immovable = true;
  }

  isDamageable() { return true; }

  onDamage(damager) {
    this.destroy();
    WALL_BREAK_AUDIO.get().play();
    hitPause(110);
    addShake(8, 8);
  }

  isDead() { return !this.alive; }

  update() {
    // TODO effectively disable ourselves if player is not visible
    this.cooldown -= this.game.time.physicsElapsed;
    if (this.cooldown < 0) {
      if (this.inCamera) {
        const bullet = new TurretBullet(this.scene, this.x, this.y);
        const player = this.scene.player;
        const velocity = fromTo(this, player);
        velocity.setMagnitude(100);
        bullet.body.velocity.copyFrom(velocity);
      }
      this.cooldown = COOLDOWN_S;
    }
  }
}