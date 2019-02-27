class GameObject extends Phaser.Sprite {
  /**
   * @param {GameScene} scene
   */
  constructor(scene, x, y, key, frame) {
    super(scene.phaserGame, x, y, key, frame);
    this.scene = scene;
  }
  /**
   * @param {GameObject} other 
   */
  onCollide(other) { }
  /**
   * @param {GameObject} other 
   * @returns {boolean} False if we should ignore collisions with other this frame.
   */
  onOverlap(other) { return true; }

  isDamageable() { return false; }

  /**
   * @returns {Phaser.Game}
   */
  get phaser() {
    return this.scene.phaserGame;
  }

  /**
   * @param {GameObject} damager 
   * @param {number} dp
   */
  onDamage(damager, dp) { }

  // If A damages B (by calling B.onDamage), and B gets some damage done,
  // B should call A.onDamageSuccess to acknowledge it.
  onDamageSuccess(victim, dp) { }

  isDead() { return false; }

  isPlayer() { return false; }
}
