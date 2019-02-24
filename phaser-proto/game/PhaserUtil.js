
/**
 * 
 * @param {Phaser.Sprite} sprite 
 */
function safeDestroy(sprite) {
  if (sprite) {
    sprite.destroy();
  }
}