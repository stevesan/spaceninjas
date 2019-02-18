class GameObject {
  /**
   * @param {GameScene} scene
   * @param {Phaser.Sprite} sprite 
   */
  constructor(scene, sprite) {
    this.scene = scene;
    this.sprite = sprite;
    sprite.__gameObject__ = this;
    scene.objects.push(this);
  }
  destroy() {
    if (!this.isDestroyed()) {
      this.sprite.kill();
      this.sprite = null;
    }
  }
  isDestroyed() {
    return this.sprite == null;
  }
  /**
   * 
   * @param {GameScene} state 
   */
  update(state) { }
  /**
   * @param {GameObject} other 
   */
  onCollide(other) { }
  /**
   * @param {GameObject} other 
   * @returns {boolean} False if we should ignore collisions with other this frame.
   */
  onOverlap(other) { return true; }
  /**
   * @return {?Player}
   */
  getPlayer() { return null; }
  /**
   * @return {?Bullet}
   */
  getBullet() { return null; }
  /**
   * @return {?EnvStatic}
   */
  getEnvStatic() { return null; }

  isDamageable() { return false; }

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
