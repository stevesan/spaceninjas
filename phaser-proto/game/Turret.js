const COOLDOWN_S = 3;

class Bullet extends Phaser.Sprite {
  /**
   * @param {Phaser.Game} game 
   */
  constructor(game, x, y, key, frame) {
    super(game, x, y, key, frame);
    game.add.existing(this);
    game.physics.arcade.enable(this);
  }

  /**
   * 
   * @param {NinjaControls} player 
   */
  onHitPlayer(player) {
    player.takeDamage(1);
    this.kill();
  }

}

class Turret {
  /**
   * @param {Phaser.Game} game 
   * @param {Phaser.Sprite} sprite 
   * @param {Phaser.Group} shotGroup
   */
  constructor(game, sprite, shotGroup) {
    this.game = game;
    this.sprite = sprite;
    this.cooldown = COOLDOWN_S;
    this.shotGroup = shotGroup;

    game.physics.arcade.enable(sprite);
    sprite.body.immovable = true;
  }

  isDashable() {
    return true;
  }

  /**
   * 
   */
  update() {
    this.cooldown -= this.game.time.physicsElapsed;
    if (this.cooldown < 0) {
      const shot = new Bullet(this.game, this.sprite.x, this.sprite.y, 'cannonball', 0);
      this.shotGroup.add(shot);
      shot.anchor.set(0.5, 0.5);
      shot.body.velocity.set(50, 50);
      this.cooldown = COOLDOWN_S;
    }
  }
}