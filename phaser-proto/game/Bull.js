class Bull extends GameObject {
  /**
   * @param {GameScene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    const game = scene.phaserGame;
    super(scene, x, y, 'enemy-medium', 1);
    scene.enemies.add(this);
    this.anchor.set(0.5, 0.5);

    game.physics.arcade.enable(this);
    this.body.immovable = true;

    this.chasing = new ChasingModule(scene, this);
  }

  isDamageable() { return false; }

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
    // this.phaser.debug.geom(new Phaser.Line().fromPoints(this.position, this.scene.player.position), '#ff0000', true);
    if (this.scene.hasClearLineOfSight(this.position, this.scene.player.position)) {
      this.body.velocity.setTo(0, 0);
    }
    else {
      this.chasing.update();
    }
  }
}