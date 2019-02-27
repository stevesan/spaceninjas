class SpinLaser extends GameObject {
  /**
   * @param {GameScene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    const game = scene.phaserGame;
    super(scene, x, y, 'robot-parts', 18);
    scene.enemies.add(this);
    this.anchor.set(0.5, 0.5);

    game.physics.arcade.enable(this);
    this.body.immovable = true;
  }

  isDamageable() { return true; }

  onDamage(damager) {
    this.destroy();
    this.scene.onEnemyDeath(this);
    WALL_BREAK_AUDIO.get().play();
    hitPause(180);
    addShake(8, 8);
  }

  isDead() { return !this.alive; }

  update() {
    this.rotation += this.scene.getDeltaTime() * Math.PI / 5;
    const delta = new Phaser.Point(0, -1);
    delta.rotate(0, 0, this.rotation);
    delta.setMagnitude(128);
    const endPt = Phaser.Point.add(this.position, delta);
    const laserLine = new Phaser.Line().fromPoints(this.position, endPt);
    const cast = this.scene.raycastTiles(laserLine);
    if (cast.tile != null) {
      laserLine.end.copyFrom(cast.intx);
    }
    this.phaser.debug.geom(laserLine, '#ff0000', true);
  }
}