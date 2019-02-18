class GameObject {
  /**
   * 
   * @param {PlayState} state 
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

  isDashable() { return false; }

  /**
   * @param {GameObject} damager 
   */
  onDamage(damager) { }

  isDead() { return false; }
}
