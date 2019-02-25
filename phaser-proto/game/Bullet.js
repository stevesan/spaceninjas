class Bullet extends GameObject {
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
    if (other.isPlayer && other.isPlayer() && other.isDamageable()) {
      other.onDamage(this, 1);
      this.destroy();
    }
    // Bullets always go through everything
    return false;
  }
}