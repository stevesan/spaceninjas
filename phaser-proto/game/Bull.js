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
    const spriteBounds = this.getBounds();
    const L = Math.min(spriteBounds.width, spriteBounds.height);
    this.body.setSize(L, L, 0, 0);

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
  }

  isDead() { return !this.alive; }

  update() {
    const toPlayer = fromTo(this, this.scene.player);
    this.rotation = Math.atan2(toPlayer.y, toPlayer.x) - Math.PI / 2;

    // this.phaser.debug.geom(new Phaser.Line().fromPoints(this.position, this.scene.player.position), '#ff0000', true);
    if (this.scene.hasClearLineOfSight(this.position, this.scene.player.position)) {
      // this.body.velocity.setTo(0, 0);
      this.tint = this.scene.squareWave(10) ? 0xff0000 : 0xffffff;
      this.chasing.speed = 30;

    }
    else {
      this.chasing.speed = 200;
    }
    // else {
    this.chasing.update();
    // }
  }
}