class StaticEnv extends GameObject {
  /**
   * 
   * @param {GameScene} scene 
   * @param {number} x 
   * @param {number} y 
   * @param {string} key 
   * @param {number} frame 
   */
  constructor(scene, x, y, key, frame) {
    key = key || 'inca32';
    frame = frame || 4;
    const game = scene.phaserGame;
    super(scene, x, y, key, frame);
    scene.environment.add(this);
    this.anchor.set(0.5, 0.5);
    game.physics.arcade.enable(this);
    this.body.immovable = true;
  }
}

const WALL_BREAK_AUDIO = new PreloadedAudio("wavs/explode.wav");

class BreakableWall extends GameObject {
  constructor(scene, x, y) {
    const game = scene.phaserGame;
    super(scene, x, y, 'inca32', 6);
    scene.environment.add(this);
    this.anchor.set(0.5, 0.5);
    game.physics.arcade.enable(this);
    this.body.immovable = true;
    this.tint = 0x8888ff;
  }

  isDamageable() { return true; }

  onDamage(damager) {
    this.destroy();
    WALL_BREAK_AUDIO.get().play();
    hitPause(110);
    addShake(8, 8);
  }

  isDead() { return !this.alive; }
}

