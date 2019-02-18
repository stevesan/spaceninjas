const W = 512;
const H = 544;
const S = 1;

const CANVAS_PIXELS_PER_SPRITE_PIXEL = 2;
const CPPSP = CANVAS_PIXELS_PER_SPRITE_PIXEL;

class EnvStatic extends GameObject {
  constructor() {
    this.breakable = false;
  }
  isBreakable() {
    return this.breakable;
  }
}

class BreakableWall extends GameObject {
  constructor(sprite) {
    this.sprite = sprite;
  }
  isDashable() { return true; }
  onDamage(damager) {
    this.sprite.kill();
    this.sprite = null;
  }
  isDead() { return this.sprite == null; }
}

class PlayState {
  /**
   * 
   * @param {Phaser.Game} phaserGame 
   */
  constructor(phaserGame) {
    this.phaserGame = phaserGame;

    // Entity lists
    this.environment = [];
    this.enemies = [];
    this.bullets = [];

    /** @type {NinjaPlayer} */
    this.player = new NinjaPlayer(phaserGame);
  }

  update() {
    this.myCollider_(this.player, this.environment);
    this.myCollider_(this.player, this.enemies);
    this.myCollider_(this.player, this.bullets);
  }

  myCollider_(aa, bb) {
    const arcadePhysics = this.phaserGame.physics.arcade;
    arcadePhysics.collide(aa, bb,
      (a, b) => {
        a.onCollide(b);
        b.onCollide(a);
      },
      (a, b) => {
        // If either one wants to ignore, then by convention, we ignore.
        if (a.onOverlap(b) === false) {
          return false;
        }
        if (b.onOverlap(a) === false) {
          return false;
        }
        return true;
      });
  }
}

/** @type {Phaser.Game} */
let game;

/** @type {PlayState} */
let state;

/** @type {Phaser.Group} */
var walls;

/** @type {Phaser.Group} */
var breakables;

/** @type {Phaser.Group} */
var stars;

/** @type {Phaser.Text} */
var hudText;

function updateHud() {
  hudText.text = `HP ${state.player.getHealth()}`;
}

/** @type {Phaser.Particles.Arcade.Emitter} */
var scoreFx;

/** @type {Phaser.Group} */
var dashables;

/** @type {Phaser.Group} */
var enemies;

const gameObjects = [];

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
  game.load.spritesheet('powerup', 'sprites/Spaceship-shooter-environment/spritesheets/power-up.png', 16, 16);
  game.load.spritesheet('shots', 'sprites/Spaceship-shooter-environment/spritesheets/laser-bolts.png', 16, 16);
  game.load.image('turret', 'sprites/topdown_shooter/guns/cannon/cannon_down.png');
  game.load.image('cannonball', 'sprites/topdown_shooter/other/cannonball.png')
}

const coinAudio = new PreloadedAudio("wavs/coin.wav");
const boopAudio = new PreloadedAudio("wavs/boop.wav");
const scratchAudio = new PreloadedAudio("wavs/landscratch.wav");
const dashAudio = new PreloadedAudio("wavs/dash.wav");
const explodeAudio = new PreloadedAudio("wavs/explode.wav");
const hurtAudio = new PreloadedAudio('wavs/hurt2.wav');

function createEnemies() {
  enemies = game.add.group();
  const turret = enemies.create(game.world.width / 2 + 100, game.world.height / 2, 'powerup', 1);
  turret.anchor.set(0.5, 0.5);
  turret.scale.setTo(CPPSP, CPPSP);
  gameObjects.push(new Turret(game, turret, enemies));
}

class MySprite extends Phaser.Sprite {
  /**
   * @param {Phaser.Game} game 
   */
  constructor(game) {
    super(game, game.world.width / 2, game.world.height / 2, 'dude');
    game.add.existing(this);
    game.physics.arcade.enable(this);
  }
}

const arrayTest = [];
const playersArray = [];

function create() {
  game.world.setBounds(0, 0, 2000, 2000);
  PRELOAD_CREATE_LIST.forEach(asset => asset.create());
  game.physics.startSystem(Phaser.Physics.ARCADE);

  new MySprite(game);

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
  createEnemies();

  game.add.text(game.world.width / 2 - 100, game.world.height / 2 - 100,
    'WASD to move\nDouble-tap to dash', { font: 'Courier New', fontSize: '24px', fill: '#fff' });

  hudText = game.add.text(game.camera.x + 10, game.camera.y + 10, 'dd', { font: 'Courier New', fontSize: '24px', fill: '#fff' });
  hudText.fixedToCamera = true;

  scoreFx = game.add.emitter(0, 0, 100);
  scoreFx.makeParticles('star');
  scoreFx.gravity = 200;

  state = new PlayState(game);
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

function update() {
  const player = state.player.sprite;
  const ninja = state.player;
  updateHud();
  gameObjects.forEach(go => go.update());

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

  // NOTE: can probably fix some "sticky" bugs by only checking in the direction that we're flying in.
  if (((hitSoftWall && !brokeSoftWall) || hitWall) && startedTouchingInAnyDir(player.body)) {
    scratchAudio.get().play();
    // ninja.onHitWall(getTouchingDir(player.body));
  }

  game.physics.arcade.overlap(player, enemies, (player, enemy) => {
    if (enemy.onHitPlayer) {
      enemy.onHitPlayer(ninja);
    }
  });

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
  // const t = player.body.touching;
  // game.debug.text(`body touch: ${t['up'] ? 'u' : ' '}${t['left'] ? 'l' : ' '}${t['down'] ? 'd' : ' '}${t['right'] ? 'r' : ' '}`, 0, 50);
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
