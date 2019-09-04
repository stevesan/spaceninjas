class ChasingModule {
  /**
   * @param {GameScene} scene
   * @param {GameObject} object
   */
  constructor(scene, object) {
    this.scene = scene;
    this.state = 'chase';
    this.backupTime = 0;
    this.slideTime = 0;
    this.object = object;
    this.body = object.body;
    this.speed = 210;
  }

  moveTowardsPlayer_() {
    const player = this.scene.player;
    const velocity = fromTo(this.object, player);
    velocity.setMagnitude(this.speed);
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
        this.body.velocity.setMagnitude(250);
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