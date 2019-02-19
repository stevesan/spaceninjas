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
    this.levelIndex = 0;
    this.phaserGame = phaserGame;

    // Sprite arrays
    /** @type {Phaser.Group} */
    this.environment = phaserGame.add.group();
    /** @type {Phaser.Group} */
    this.enemies = phaserGame.add.group();
    /** @type {Phaser.Group} */
    this.bullets = phaserGame.add.group();

    /** @type {NinjaPlayer} */
    this.player = null;

    this.spawnScene(LEVEL1);
  }

  /**
   * 
   * @param {string} levelString 
   */
  spawnScene(levelString) {
    // Create walls
    const sideLen = Math.floor(Math.sqrt(levelString.length));
    if (sideLen * sideLen != levelString.length) {
      throw new Error("level string length must be a perfect square.")
    }
    const PPT = 32;
    const left = snap(game.world.width / 2 - sideLen / 2 * PPT, 32);
    const top = snap(game.world.height / 2 - sideLen / 2 * PPT, 32);
    const bot = top + sideLen * PPT;
    const right = left + sideLen * PPT;
    const plop = (x, y) => {
      const wall = new StaticEnv(this, x, y, 'inca32', 4);
    }
    for (let i = 0; i < sideLen; i++) {
      plop(left + i * PPT, top - PPT);
      plop(left + i * PPT, bot);
      plop(left - PPT, top + i * PPT);
      plop(right, top + i * PPT);
    }

    for (let i = 0; i < levelString.length; i++) {
      const c = levelString.charAt(i);
      const row = Math.floor(i / sideLen);
      const col = i - row * sideLen;
      const x = col * PPT + left;
      const y = row * PPT + top;
      if (c == 'P') {
        this.player = new NinjaPlayer(this, x, y);
      }
      else if (c == 'T') {
        const T = new Turret(this, x, y);
      }
      else if (c == 'O') {
        const o = new BreakableWall(this, x, y);
      }
      else if (c == 'X') {
        new StaticEnv(this, x, y);
      }
    }
  }

  update() {
    this.myCollide(this.player, this.environment);
    this.myCollide(this.player, this.enemies);
    this.myCollide(this.player, this.bullets);
    this.myCollide(this.enemies, this.environment);
    this.myCollide(this.bullets, this.environment);
  }

  myCollide(aa, bb) {
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

/** @type {GameScene} */
let scene;

/** @type {Phaser.Text} */
var hudText;

function updateHud() {

  hudText.text = "HP: ";
  for (let i = 0; i < scene.player.getHealth(); i++) {
    hudText.text += "O";
  }
}

/** @type {Phaser.Particles.Arcade.Emitter} */
var scoreFx;

var shakeX = 0;
var shakeY = 0;

function preload() {
  PRELOAD_CREATE_LIST.forEach(asset => asset.preload());
  // TODO have these preloads be declared in the Object files, like audio.
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
  game.stage.backgroundColor = '#2e0e39';
  game.world.setBounds(0, 0, 2000, 2000);
  PRELOAD_CREATE_LIST.forEach(asset => asset.create());
  game.physics.startSystem(Phaser.Physics.ARCADE);

  game.add.text(game.world.width / 2 - 100, game.world.height / 2 - 140,
    'Tap WASD to fly\nDouble-tap to dash', { font: 'Courier New', fontSize: '24px', fill: '#fff' });

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
  updateHud();
  updateCamera();
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

  const player = scene.player;
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
