class StaticEnv extends GameObject {
  constructor(scene, x, y, key, frame) {
    const game = scene.phaserGame;
    super(scene, game.add.sprite(x, y, key, frame));
    game.physics.arcade.enable(this.sprite);
    this.sprite.body.immovable = true;
  }
}

const WALL_BREAK_AUDIO = new PreloadedAudio("wavs/explode.wav");

class BreakableWall extends GameObject {
  constructor(scene, x, y, key, frame) {
    const game = scene.phaserGame;
    super(scene, game.add.sprite(x, y, key, frame));
    game.physics.arcade.enable(this.sprite);
    this.sprite.body.immovable = true;
    this.sprite.tint = 0x8888ff;
  }

  isDamageable() { return true; }

  onDamage(damager) {
    this.destroy();
    WALL_BREAK_AUDIO.get().play();
    hitPause(110);
    addShake(8, 8);
  }

  isDead() { return this.isDestroyed(); }
}

