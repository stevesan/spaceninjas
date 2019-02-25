class Chaser extends GameObject {
  /**
   * @param {GameScene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    const game = scene.phaserGame;
    super(scene, x, y, 'powerup', 2);
    scene.enemies.add(this);
    this.anchor.set(0.5, 0.5);

    game.physics.arcade.enable(this);
    this.body.immovable = true;

    this.chasing = new ChasingModule(scene, this);
  }

  isDamageable() { return true; }

  onOverlap(other) {
    if (other.isPlayer && other.isPlayer() && other.isDamageable()) {
      other.onDamage(this, 1);
      this.destroy();
    }
    // Respect collision
    return true;
  }

  onDamage(damager) {
    this.destroy();
    this.scene.onEnemyDeath(this);
    WALL_BREAK_AUDIO.get().play();
    hitPause(180);
    addShake(8, 8);
  }

  isDead() { return !this.alive; }

  update() {
    this.chasing.update();
  }
}