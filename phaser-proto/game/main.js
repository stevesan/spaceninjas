const W = 512;
const H = 544;
const S = 1;

const CANVAS_PIXELS_PER_SPRITE_PIXEL = 2;
const CPPSP = CANVAS_PIXELS_PER_SPRITE_PIXEL;

class StaticEnv extends GameObject {
  constructor(game, x, y, key, frame) {
    super(game.add.sprite(x, y, key, frame));
    game.physics.arcade.enable(this.sprite);
    this.sprite.body.immovable = true;
  }
}

const WALL_BREAK_AUDIO = new PreloadedAudio("wavs/explode.wav");

class BreakableWall extends GameObject {
  constructor(game, x, y, key, frame) {
    super(game.add.sprite(x, y, key, frame));
    game.physics.arcade.enable(this.sprite);
    this.sprite.body.immovable = true;
    this.sprite.tint = 0x8888ff;
  }

  isDashable() { return true; }

  onDamage(damager) {
    this.sprite.kill();
    this.sprite = null;
    WALL_BREAK_AUDIO.get().play();
    hitPause(110);
    addShake(8, 8);
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

    // Sprite arrays
    this.environment = [];
    this.enemies = [];
    this.bullets = [];

    /** @type {Array<GameObject>} */
    this.objects = [];

    /** @type {NinjaPlayer} */
    this.player = new NinjaPlayer(phaserGame);
    this.objects.push(this.player);

    // Create walls
    for (let i = 0; i < 100; i++) {
      const wall = new StaticEnv(
        phaserGame,
        snap(game.world.randomX, 32),
        snap(game.world.randomY, 32),
        'inca32', 4);
      this.objects.push(wall);
      this.environment.push(wall.sprite);
    }

    for (let i = 0; i < 50; i++) {
      const wall = new BreakableWall(
        phaserGame,
        snap(game.world.randomX, 32),
        snap(game.world.randomY, 32),
        'inca32', 6);
      this.objects.push(wall);
      this.environment.push(wall.sprite);
    }
  }

  update() {
    this.objects.forEach(go => go.update(this));
    this.myCollide(this.player.sprite, this.environment);
    this.myCollide(this.player.sprite, this.enemies);
    this.myCollide(this.player.sprite, this.bullets);
  }

  getObj(sprite) {
    return sprite.__gameObject__;
  }

  myCollide(aa, bb) {
    const arcadePhysics = this.phaserGame.physics.arcade;
    arcadePhysics.collide(aa, bb,
      (a, b) => {
        this.getObj(a).onCollide(this.getObj(b));
        this.getObj(b).onCollide(this.getObj(a));
      },
      (a, b) => {
        // If either one wants to ignore, then by convention, we ignore.
        if (this.getObj(a).onOverlap(this.getObj(b)) === false) {
          return false;
        }
        if (this.getObj(b).onOverlap(this.getObj(a)) === false) {
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

/** @type {Phaser.Text} */
var hudText;

function updateHud() {
  hudText.text = `HP ${state.player.getHealth()}`;
}

/** @type {Phaser.Particles.Arcade.Emitter} */
var scoreFx;

/** @type {Phaser.Group} */
var enemies;

const gameObjects = [];

var shakeX = 0;
var shakeY = 0;

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
const dashAudio = new PreloadedAudio("wavs/dash.wav");
const hurtAudio = new PreloadedAudio('wavs/hurt2.wav');

function createEnemies() {
  enemies = game.add.group();
  const turret = enemies.create(game.world.width / 2 + 100, game.world.height / 2, 'powerup', 1);
  turret.anchor.set(0.5, 0.5);
  turret.scale.setTo(CPPSP, CPPSP);
  gameObjects.push(new Turret(game, turret, enemies));
}

function create() {
  game.world.setBounds(0, 0, 2000, 2000);
  PRELOAD_CREATE_LIST.forEach(asset => asset.create());
  game.physics.startSystem(Phaser.Physics.ARCADE);

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
  state.update();
  const player = state.player.sprite;
  const ninja = state.player;
  updateHud();
  gameObjects.forEach(go => go.update());

  game.physics.arcade.overlap(player, enemies, (player, enemy) => {
    if (enemy.onHitPlayer) {
      enemy.onHitPlayer(ninja);
    }
  });

  updateCamera();


  player.animations.play(ninja.getState());
}

function addShake(x, y) {
  shakeX += x;
  shakeY += y;
}

function updateCamera() {
  // Yes, I realize this isn't rate-independent.
  const gamma = 0.9;
  shakeX *= gamma;
  if (shakeX < 0.1) shakeX = 0;
  shakeY *= gamma;
  if (shakeY < 0.1) shakeY = 0;

  // MINOR BUG: camera fidgets in non-pleasing way when you run into a wall..
  // TODO: we should snap this to our retro-pixel size
  const shakeWave = Math.sin(Date.now() / 1000 * 2 * Math.PI * 10);

  const player = state.player.sprite;
  game.camera.focusOnXY(
    player.x + shakeX * shakeWave,
    player.y + shakeY * shakeWave);
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
