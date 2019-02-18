const W = 512;
const H = 544;
const S = 1;

const CANVAS_PIXELS_PER_SPRITE_PIXEL = 2;
const CPPSP = CANVAS_PIXELS_PER_SPRITE_PIXEL;

class GameScene {
  /**
   * 
   * @param {Phaser.Game} phaserGame 
   */
  constructor(phaserGame) {
    this.phaserGame = phaserGame;

    // Sprite arrays
    /** @type {Array<Phaser.Sprite>} */
    this.environment = [];
    /** @type {Array<Phaser.Sprite>} */
    this.enemies = [];
    /** @type {Array<Phaser.Sprite>} */
    this.bullets = [];

    /** @type {Array<GameObject>} */
    this.objects = [];

    /** @type {NinjaPlayer} */
    this.player = null;

    this.createRandomScene();
  }

  createRandomScene() {
    this.player = new NinjaPlayer(this);
    this.objects.push(this.player);

    // Create walls
    for (let i = 0; i < 100; i++) {
      const wall = new StaticEnv(
        this,
        snap(game.world.randomX, 32),
        snap(game.world.randomY, 32),
        'inca32', 4);
      this.objects.push(wall);
      this.environment.push(wall.sprite);
    }

    // Breakable walls
    for (let i = 0; i < 50; i++) {
      const wall = new BreakableWall(
        this,
        snap(game.world.randomX, 32),
        snap(game.world.randomY, 32),
        'inca32', 6);
      this.objects.push(wall);
      this.environment.push(wall.sprite);
    }

    for (let i = 0; i < 50; i++) {
      const obj = new Turret(
        this,
        snap(game.world.randomX, 32),
        snap(game.world.randomY, 32));
      this.objects.push(obj);
      this.enemies.push(obj.sprite);
    }
  }

  clear() {
    this.objects.forEach(o => o.destroy());
    this.objects.length = 0;
    this.environment.length = 0;
    this.enemies.length = 0;
    this.bullets.length = 0;
    this.player = null;
  }

  /**
   * 
   * @param {GameObject} bullet 
   */
  addBullet(bullet) {
    this.objects.push(bullet);
    this.bullets.push(bullet.sprite);
  }

  update() {
    this.objects.forEach(go => {
      if (!go.isDestroyed()) {
        go.update(this);
      }
    });
    this.myCollide(this.player.sprite, this.environment);
    this.myCollide(this.player.sprite, this.enemies);
    this.myCollide(this.player.sprite, this.bullets);
    this.myCollide(this.enemies, this.environment);
    this.myCollide(this.bullets, this.environment);
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

/** @type {GameScene} */
let scene;

/** @type {Phaser.Text} */
var hudText;

function updateHud() {
  hudText.text = `HP ${scene.player.getHealth()}`;
}

/** @type {Phaser.Particles.Arcade.Emitter} */
var scoreFx;

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

function create() {
  game.world.setBounds(0, 0, 2000, 2000);
  PRELOAD_CREATE_LIST.forEach(asset => asset.create());
  game.physics.startSystem(Phaser.Physics.ARCADE);

  game.add.text(game.world.width / 2 - 100, game.world.height / 2 - 100,
    'WASD to move\nDouble-tap to dash', { font: 'Courier New', fontSize: '24px', fill: '#fff' });

  hudText = game.add.text(game.camera.x + 10, game.camera.y + 10, 'dd', { font: 'Courier New', fontSize: '24px', fill: '#fff' });
  hudText.fixedToCamera = true;

  scoreFx = game.add.emitter(0, 0, 100);
  scoreFx.makeParticles('star');
  scoreFx.gravity = 200;

  scene = new GameScene(game);
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
  scene.update();
  const player = scene.player.sprite;
  const ninja = scene.player;
  updateHud();
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

  const player = scene.player.sprite;
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
