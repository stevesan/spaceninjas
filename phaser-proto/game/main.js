const W = 512;
const H = 544;
const S = 1.2;


/** @type {Phaser.Game} */
let game;

/** @type {Phaser.Group} */
var walls;

/** @type {Phaser.Group} */
var breakables;

/** @type {Phaser.Group} */
var stars;

var score = 0;

/** @type {Phaser.Text} */
var scoreText;

/** @type {Phaser.Sprite} */
var player;

/** @type {Phaser.Particles.Arcade.Emitter} */
var scoreFx;

/** @type {NinjaControls} */
var ninja;

function createStars() {
  stars = game.add.group();

  stars.enableBody = true;

  for (var i = 0; i < 200; i++) {
    stars.create(game.world.randomX, game.world.randomY, 'star');
  }
}

function preload() {
  PRELOAD_CREATE_LIST.forEach(asset => asset.preload());
  game.stage.backgroundColor = '#88aaff';
  game.load.image('ground', 'phaser_tutorial_02/assets/platform.png');
  game.load.image('star', 'phaser_tutorial_02/assets/star.png');
  game.load.image('baddie', 'phaser_tutorial_02/assets/baddie.png');
  game.load.spritesheet('dude', 'phaser_tutorial_02/assets/dude.png', 32, 48);
}

const coinAudio = new PreloadedAudio("wavs/coin.wav");
const boopAudio = new PreloadedAudio("wavs/boop.wav");
const scratchAudio = new PreloadedAudio("wavs/landscratch.wav");
const dashAudio = new PreloadedAudio("wavs/dash.wav");
const explodeAudio = new PreloadedAudio("wavs/explode.wav");

/**
 * @param {Phaser.Sprite} sprite
 */
function centerPivot(sprite) {
  const b = sprite.getBounds();
  const L = Math.min(b.width, b.height);
  sprite.pivot.set(b.width / 2, L / 2);
}

function create() {
  game.world.setBounds(0, 0, 2000, 2000);
  PRELOAD_CREATE_LIST.forEach(asset => asset.create());
  game.physics.startSystem(Phaser.Physics.ARCADE);

  walls = game.add.group();
  walls.enableBody = true;
  for (let i = 0; i < 50; i++) {
    const wall = walls.create(game.world.randomX, game.world.randomY, 'ground');
    wall.body.immovable = true;
  }

  breakables = game.add.group();
  breakables.enableBody = true;
  for (let i = 0; i < 50; i++) {
    /** @type {Phaser.Sprite} */
    const wall = breakables.create(game.world.randomX, game.world.randomY, 'ground');
    wall.tint = 0xff0000;
    wall.body.immovable = true;
  }

  createStars();

  scoreText = game.add.text(16, 16, 'WASD to move\nDouble-tap to dash', { fontSize: '32px', fill: '#000' });
  scoreText.fixedToCamera = true;

  scoreFx = game.add.emitter(0, 0, 100);
  scoreFx.makeParticles('star');
  scoreFx.gravity = 200;

  // Setup player
  player = game.add.sprite(game.world.width / 2, game.world.height / 2, 'dude');
  console.log(`player is ${player.width} x ${player.height}`);
  centerPivot(player);
  game.physics.arcade.enable(player);
  player.body.bounce.y = 0;
  player.body.gravity.y = 0;

  //  Our two animations, walking left and right.
  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);

  const keys = game.input.keyboard.addKeys({
    goUp: Phaser.Keyboard.W,
    goDown: Phaser.Keyboard.S,
    goLeft: Phaser.Keyboard.A,
    goRight: Phaser.Keyboard.D,
  });

  ninja = new NinjaControls(game, player);

  function onDirPressed(dir) {
    ninja.onDirPressed(dir);
    boopAudio.get().play();
  }

  keys.goUp.onDown.add(() => onDirPressed(0));
  keys.goLeft.onDown.add(() => onDirPressed(1));
  keys.goDown.onDown.add(() => onDirPressed(2));
  keys.goRight.onDown.add(() => onDirPressed(3));

  ninja.onDash = () => dashAudio.get().play();

  const origWidth = player.getBounds().width;
  const origHeight = player.getBounds().height;

  ninja.onDirChanged = () => {
    const dir = ninja.getDirection();

    // Update collider
    const ow = origWidth;
    const oh = origHeight;
    player.body.setSize(
      [ow, oh, ow, oh][dir],
      [oh, ow, oh, ow][dir],
      [0, 0, -ow, -oh][dir],
      [0, -ow, -oh, 0][dir]);
  }

  // game.camera.follow(player);
}

function collectStar(player, star) {
  star.kill();


  coinAudio.asset.play();
  // hitPause(100);
  // triggerSlowMo(3, 500);
}

function hitPause(durationMs) {
  triggerSlowMo(100, durationMs);
}

function triggerSlowMo(slowFactor, durationMs) {
  game.time.slowMotion = slowFactor;
  game.time.desiredFps = 60 + (slowFactor > 1 ? slowFactor * 60 : 0);
  game.time.events.add(durationMs, () => {
    game.time.slowMotion = 1;
    game.time.desiredFps = 60;
  });
}

function onPlayerHitWall() {
  scratchAudio.get().play();
  ninja.onHitWall();
}

function update() {
  // NOTE: this doesn't work because of fixedToCamera...
  scoreText.y = 100 + 16 * Math.sin(game.time.time * 6.28 * 2);

  var hitWall = game.physics.arcade.collide(player, walls);

  if (hitWall && startedTouchingInAnyDir(player.body)) {
    onPlayerHitWall();
  }

  game.physics.arcade.overlap(player, stars, collectStar, null, this);

  game.physics.arcade.collide(player, breakables, (player, wall) => {
    if (ninja.isDashing()) {
      wall.kill();
      // The collision does stop the player, but we want to break through!
      ninja.continueDashing();
      hitPause(100);
      explodeAudio.get().play();
    }
  }, null, null);

  // MINOR BUG: camera fidgets in non-pleasing way when you run into a wall..
  game.camera.focusOnXY(player.x, player.y);

}

function render() {
  // game.debug.rectangle(player.getBounds(), '#ff0000', false);
  // game.debug.body(player);
}

window.onload = function () {
  game = new Phaser.Game(W * S, H * S, Phaser.AUTO, '', {
    preload: preload,
    create: create,
    update: update,
    render: render
  });
};
