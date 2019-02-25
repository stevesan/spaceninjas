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

    this.state = 'chase';
    this.backupTime = 0;
    this.slideTime = 0;
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

  moveTowardsPlayer_() {
    const player = this.scene.player;
    const velocity = fromTo(this, player);
    velocity.setMagnitude(100);
    this.body.velocity.copyFrom(velocity);
  }

  update() {
    const blockedDir = getBlockedDir(this.body);
    const blocked = blockedDir != null;
    if (this.state == 'chase') {
      this.moveTowardsPlayer_();
      if (blocked) {
        // Go into slide state, so we don't just backup upon any touch
        this.state = 'slide';
        this.slideTime = 0.5;
      }
    }
    else if (this.state == 'slide') {
      this.moveTowardsPlayer_();
      this.slideTime -= this.scene.getDeltaTime();
      if (!blocked) {
        // We're free of whatever
        this.state = 'chase';
      }
      else if (this.slideTime < 0) {
        // OK time to back it up
        this.backupTime = 0.25 + Math.random() * 0.5;
        this.state = 'backup';
        const backupDir = opposite(blockedDir);
        this.body.velocity.copyFrom(DIR_VECTORS[backupDir]);
        this.body.velocity.setMagnitude(150);
        // Rotate it by some random amount, for fun
        Phaser.Point.rotate(this.body.velocity, 0, 0, (Math.random() * 2 - 1) * Math.PI * 0.5);
      }
    }
    if (this.state == 'backup') {
      // just keep moving in whatever state
      this.backupTime -= this.scene.getDeltaTime();
      if (this.backupTime < 0) {
        this.state = 'chase';
      }
    }
  }
}