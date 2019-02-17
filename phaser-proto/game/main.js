const W = 512;
const H = 544;
const S = 1;

const CANVAS_PIXELS_PER_SPRITE_PIXEL = 2;
const CPPSP = CANVAS_PIXELS_PER_SPRITE_PIXEL;

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
var helpTest;

/** @type {Phaser.Sprite} */
var player;

/** @type {Phaser.Particles.Arcade.Emitter} */
var scoreFx;

/** @type {NinjaControls} */
var ninja;

var shakeX = 0;
var shakeY = 0;

function createStars() {
  stars = game.add.group();

  stars.enableBody = true;

  for (var i = 0; i < 100; i++) {
    stars.create(snap(game.world.randomX, 32), snap(game.world.randomY, 32), 'star');
  }
}

function preload() {
  PRELOAD_CREATE_LIST.forEach(asset => asset.preload());
  game.stage.backgroundColor = '#2e0e39';
  game.load.image('ground', 'phaser_tutorial_02/assets/platform.png');
  game.load.image('star', 'phaser_tutorial_02/assets/star.png');
  game.load.image('baddie', 'phaser_tutorial_02/assets/baddie.png');
  game.load.spritesheet('dude', 'phaser_tutorial_02/assets/dude.png', 32, 48);
  game.load.spritesheet('ninja', 'sprites/ninja-sheet.png', 16, 32);
  game.load.spritesheet('inca32', 'sprites/inca_front.png', 32, 32);
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
    const wall = walls.create(snap(game.world.randomX, 32), snap(game.world.randomY, 32), 'inca32');
    wall.frame = 4;
    wall.body.immovable = true;
  }

  breakables = game.add.group();
  breakables.enableBody = true;
  for (let i = 0; i < 50; i++) {
    /** @type {Phaser.Sprite} */
    const wall = breakables.create(snap(game.world.randomX, 32), snap(game.world.randomY, 32), 'inca32');
    wall.frame = 6;
    wall.tint = 0x8888ff;
    wall.body.immovable = true;
  }

  createStars();

  helpTest = game.add.text(game.world.width / 2 - 100, game.world.height / 2 - 100,
    'WASD to move\nDouble-tap to dash', { font: 'Courier New', fontSize: '24px', fill: '#fff' });
  // helpTest.fixedToCamera = true;

  scoreFx = game.add.emitter(0, 0, 100);
  scoreFx.makeParticles('star');
  scoreFx.gravity = 200;

  // Setup player
  player = game.add.sprite(game.world.width / 2, game.world.height / 2, 'ninja');
  player.scale.setTo(CPPSP, CPPSP);
  console.log(`player is ${player.width} x ${player.height}`);
  centerPivot(player);
  game.physics.arcade.enable(player);
  player.body.bounce.y = 0;
  player.body.gravity.y = 0;

  //  Our two animations, walking left and right.
  player.animations.add('idle', [2, 10], 4, true);
  player.animations.add('dashing', [0, 8], 16, true);
  player.animations.add('flying', [1, 9], 12, true);

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
  var hitWall = game.physics.arcade.collide(player, walls);

  game.physics.arcade.overlap(player, stars, collectStar, null, this);

  let brokeSoftWall = false;
  var hitSoftWall = game.physics.arcade.collide(player, breakables, (player, wall) => {
    if (ninja.isDashing()) {
      brokeSoftWall = true;
      wall.kill();
      // The collision does stop the player, but we want to break through!
      ninja.continueDashing();
      hitPause(110);
      addShake(8, 8);
      explodeAudio.get().play();
    }
  }, null, null);

  if (((hitSoftWall && !brokeSoftWall) || hitWall) && startedTouchingInAnyDir(player.body)) {
    onPlayerHitWall();
  }

  updateCamShake();

  // MINOR BUG: camera fidgets in non-pleasing way when you run into a wall..
  // TODO: we should snap this to our retro-pixel size
  const shakeWave = Math.sin(Date.now() / 1000 * 2 * Math.PI * 10);
  game.camera.focusOnXY(
    player.x + shakeX * shakeWave,
    player.y + shakeY * shakeWave);

  player.animations.play(ninja.getState());
}

function addShake(x, y) {
  shakeX += x;
  shakeY += y;
}

function updateCamShake() {
  // Yes, I realize this isn't rate-independent.
  const gamma = 0.9;
  shakeX *= gamma;
  if (shakeX < 0.1) shakeX = 0;
  shakeY *= gamma;
  if (shakeY < 0.1) shakeY = 0;
}

function render() {
  // game.debug.rectangle(player.getBounds(), '#ff0000', false);
  // game.debug.body(player);
}

window.onload = function () {
  game = new Phaser.Game(W * S, H * S, Phaser.AUTO, 'phaserOutput', {
    preload: preload,
    create: create,
    update: update,
    render: render
  },
     /* transparent */ false,
     /* antialias */ false
  );
  // Antialias: false makes scaled sprites use NN-filter
};
