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
    this.state = 'playing';
    this.levelIndex = 0;
    this.phaserGame = phaserGame;


    // Sprite arrays
    /** @type {Phaser.Group} */
    this.environment = phaserGame.add.group();
    /** @type {Phaser.Group} */
    this.enemies = phaserGame.add.group();
    /** @type {Phaser.Group} */
    this.bullets = phaserGame.add.group();

    // Use this group to make sure all game objects always render under the HUD (created later)
    this.gameGroup = phaserGame.add.group();
    this.gameGroup.add(this.environment);
    this.gameGroup.add(this.enemies);
    this.gameGroup.add(this.bullets);

    /** @type {NinjaPlayer} */
    this.player = null;

    this.spawnScene(LEVELS[this.levelIndex]);

    this.map = game.add.tilemap('level_base');
    this.map.addTilesetImage('inca_front', 'inca32');
    this.mapLayer = this.map.createLayer('Tile Layer 1');
    this.map.setCollisionByExclusion([], true, this.mapLayer);
    this.mapLayer.resizeWorld();

    this.hudText = game.add.text(game.camera.x, game.camera.y + 15, 'dd',
      {
        font: 'Courier New',
        fontSize: '24px',
        fill: '#fff',
        boundsAlignH: 'center'
      });
    this.hudText.setTextBounds(0, 0, game.camera.width, game.camera.height);
    this.hudText.setShadow(2, 2, 'rgba(0,0,0,0.5)', 2);
    this.hudText.fixedToCamera = true;

    // TEMP
    /** @type {Phaser.Tilemap} */
    const wave = game.add.tilemap('wave0');
    const propMap = createPropertiesByGid(wave);
    wave.objects['objects'].forEach(obj => {
      console.log(propMap.get(obj.gid));
    });

    this.setupKeys();
  }

  setupKeys() {
    const game = this.phaserGame;
    const keys = game.input.keyboard.addKeys({
      goUp: Phaser.Keyboard.W,
      goDown: Phaser.Keyboard.S,
      goLeft: Phaser.Keyboard.A,
      goRight: Phaser.Keyboard.D,
    });

    keys.goUp.onDown.add(() => this.onDirPressed_(0));
    keys.goLeft.onDown.add(() => this.onDirPressed_(1));
    keys.goDown.onDown.add(() => this.onDirPressed_(2));
    keys.goRight.onDown.add(() => this.onDirPressed_(3));
  }

  onDirPressed_(dir) {
    if (this.state == 'playing') {
      this.player.onDirPressed(dir);
    }
  }

  updateHud() {
    if (this.state == 'playing') {
      // this.hudText.text = "HP: ";
      // for (let i = 0; i < scene.player.getHealth(); i++) {
      // this.hudText.text += "O";
      // }
      this.hudText.text = `${scene.enemies.countLiving()} enemies left`;
    }
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

    for (let i = 0; i < levelString.length; i++) {
      const c = levelString.charAt(i);
      const row = Math.floor(i / sideLen);
      const col = i - row * sideLen;
      const x = col * PPT + left;
      const y = row * PPT + top;
      if (c == 'P') {
        new NinjaPlayer(this, x, y);
      }
      else if (c == 'T') {
        new Turret(this, x, y);
      }
      else if (c == 'O') {
        new BreakableWall(this, x, y);
      }
      else if (c == 'X') {
        new StaticEnv(this, x, y);
      }
    }

    if (this.player == null) {
      throw new Error("No player in level!");
    }
    if (this.enemies.countLiving() == 0) {
      throw new Error("No enemies in level!");
    }
  }

  clear() {
    this.player.destroy();
    this.environment.destroy();
    this.enemies.destroy();
    this.bullets.destroy();

    this.environment = this.phaserGame.add.group();
    this.enemies = this.phaserGame.add.group();
    this.bullets = this.phaserGame.add.group();

    this.gameGroup.add(this.environment);
    this.gameGroup.add(this.enemies);
    this.gameGroup.add(this.bullets);

    this.player = null;

  }

  countdownToLevel(ms) {
    wasd.visible = this.levelIndex == 0;
    this.state = 'countdown';
    this.phaserGame.stage.backgroundColor = '#1e0020';
    this.clear();
    this.spawnScene(LEVELS[this.levelIndex]);
    this.hudText.text = 'Get ready..'
    triggerSlowMo(100, ms);
    this.phaserGame.time.events.add(ms, () => {
      this.state = 'playing';
      this.phaserGame.stage.backgroundColor = '#2e0e39';
    });
  }

  update() {
    this.updateHud();

    this.myCollide(this.player, this.environment);
    this.myCollide(this.player, this.enemies);
    this.myCollide(this.player, this.bullets);
    this.myCollide(this.enemies, this.environment);
    this.myCollide(this.bullets, this.environment);

    this.myCollide(this.player, this.mapLayer);

    if (this.state == 'playing') {
      if (this.enemies.countLiving() == 0) {
        this.state = 'intermission';
        this.hudText.text = '!! LEVEL CLEAR !!';
        this.phaserGame.stage.backgroundColor = '#1e4e54';
        addShake(50, 50);
        triggerSlowMo(5, 1500);
        this.levelIndex++;
        this.phaserGame.time.events.add(1500, () => {
          this.countdownToLevel(1500);
        });
      }

      if (this.player.getHealth() <= 0) {
        this.state = 'gameover';
        this.hudText.text = '!! GAME OVER !!';
        this.phaserGame.stage.backgroundColor = '#1e0020';

        addShake(10, 10);
        triggerSlowMo(5, 1500);
        this.phaserGame.time.events.add(1500, () => {
          this.countdownToLevel(500);
        })
      }
    }
  }

  myCollide(aa, bb) {
    const arcadePhysics = this.phaserGame.physics.arcade;
    arcadePhysics.collide(aa, bb,
      (a, b) => {
        if (a.onCollide) a.onCollide(b);
        if (b.onCollide) b.onCollide(a);
      },
      (a, b) => {
        // If either one wants to ignore, then by convention, we ignore.
        if (a.onOverlap && a.onOverlap(b) === false) {
          return false;
        }
        if (b.onOverlap && b.onOverlap(a) === false) {
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

/** @type {Phaser.Particles.Arcade.Emitter} */
var scoreFx;

var shakeX = 0;
var shakeY = 0;

let wasd;

function preload() {
  PRELOAD_CREATE_LIST.forEach(asset => asset.preload());
  // TODO have these preloads be declared in the Object files, like audio.
  game.load.image('ground', 'phaser_tutorial_02/assets/platform.png');
  game.load.image('star', 'phaser_tutorial_02/assets/star.png');
  game.load.image('baddie', 'phaser_tutorial_02/assets/baddie.png');
  game.load.spritesheet('dude', 'phaser_tutorial_02/assets/dude.png', 32, 48);
  game.load.spritesheet('ninja', 'sprites/ninja-sheet.png', 32, 64);
  game.load.spritesheet('inca32', 'sprites/inca_front.png', 32, 32);
  game.load.spritesheet('powerup', 'sprites/Spaceship-shooter-environment/spritesheets/power-up.png', 32, 32);
  game.load.spritesheet('shots', 'sprites/Spaceship-shooter-environment/spritesheets/laser-bolts.png', 16, 16);
  game.load.image('turret', 'sprites/topdown_shooter/guns/cannon/cannon_down.png');
  game.load.image('cannonball', 'sprites/topdown_shooter/other/cannonball.png')

  game.load.tilemap('level_base', 'tilemaps/level_base.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.tilemap('wave0', 'tilemaps/wave0.json', null, Phaser.Tilemap.TILED_JSON);
}

function create() {
  game.stage.backgroundColor = '#2e0e39';
  game.world.setBounds(0, 0, 2000, 2000);
  PRELOAD_CREATE_LIST.forEach(asset => asset.create());
  game.physics.startSystem(Phaser.Physics.ARCADE);

  wasd = game.add.text(game.world.width / 2 - 100, game.world.height / 2 + 100,
    'Tap WASD to fly\nDouble-tap to dash', { font: 'Courier New', fontSize: '24px', fill: '#fff' });
  wasd.setShadow(3, 3, '#000', 2);

  scoreFx = game.add.emitter(0, 0, 100);
  scoreFx.makeParticles('star');
  scoreFx.gravity = 200;

  scene = new GameScene(game);

}

function hitPause(durationMs) {
  triggerSlowMo(100, durationMs);
}

let slowMoEntries = new Set();
function realizeSlowestSlowMoEntry_() {
  let bestFactor = 1;
  slowMoEntries.forEach(e => bestFactor = Math.max(e.factor, bestFactor));
  game.time.slowMotion = bestFactor;
  game.time.desiredFps = 60 + (bestFactor > 1 ? bestFactor * 60 : 0);
  // TODO this doesn't seem to affect animations..
}

function triggerSlowMo(slowFactor, durationMs) {
  const entry = { factor: slowFactor };
  slowMoEntries.add(entry);
  realizeSlowestSlowMoEntry_();
  game.time.events.add(durationMs, () => {
    slowMoEntries.delete(entry);
    realizeSlowestSlowMoEntry_();
  });
}

function update() {
  scene.update();
  updateCamera();
}

function addShake(x, y) {
  shakeX += x;
  shakeY += y;
}

function updateCamera() {
  // Yes, I realize this isn't rate-independent.
  const gamma = 0.93;
  shakeX *= gamma;
  if (shakeX < 0.1) shakeX = 0;
  shakeY *= gamma;
  if (shakeY < 0.1) shakeY = 0;

  // MINOR BUG: camera fidgets in non-pleasing way when you run into a wall..
  // TODO: we should snap this to our retro-pixel size

  const player = scene.player;
  if (player) {
    game.camera.focusOnXY(
      player.x + shakeX * randBetween(-1, 1),
      player.y + shakeY * randBetween(-1, 1));
  }
}

function render() {
  // game.debug.rectangle(player.getBounds(), '#ff0000', false);
  // game.debug.body(scene.player);
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
