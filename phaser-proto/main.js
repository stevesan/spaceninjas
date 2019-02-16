
window.onload = function () {
  const W = 512;
  const H = 544;
  const S = 1.2;
  var game = new Phaser.Game(W * S, H * S, Phaser.AUTO, '', { preload: preload, create: create, update: update });

  function preload() {
    game.load.image('logo', 'phaser.png');
  }

  function create() {
    var logo = game.add.sprite(game.world.centerX, game.world.centerY, 'logo');
    logo.anchor.setTo(0.5, 0.5);
  }

  function update() {
  }
};
