const COOLDOWN_S = 3;

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
    this.scene.onEnemyDeath(this);
    WALL_BREAK_AUDIO.get().play();
  }

  isDead() { return !this.alive; }

  update() {
    this.rotation += this.scene.phaserGame.time.physicsElapsed * Math.PI;

    // TODO effectively disable ourselves if player is not visible
    this.cooldown -= this.game.time.physicsElapsed;
    if (this.cooldown < 0) {
      if (this.inCamera) {
        const bullet = new Bullet(this.scene, this.x, this.y);
        const player = this.scene.player;
        const velocity = fromTo(this, player);
        velocity.setMagnitude(100);
        bullet.body.velocity.copyFrom(velocity);
      }
      this.cooldown = COOLDOWN_S;
    }
    else {
      if (this.cooldown < 0.5) {
        this.tint = this.scene.squareWave(10) ? 0xff0000 : 0xffffff;
      }
      else {
        this.tint = 0xffffff;
      }
    }
  }
}