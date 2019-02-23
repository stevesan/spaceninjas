const W = 512;
const H = 544;
const S = 1;

const CANVAS_PIXELS_PER_SPRITE_PIXEL = 2;
const CPPSP = CANVAS_PIXELS_PER_SPRITE_PIXEL;

const TILESET_SHEET_KEYS = ['inca_front', 'inca_back'];

function preloadTilesets() {
  TILESET_SHEET_KEYS.forEach(key => {
    game.load.spritesheet(key, `sprites/tilesets/${key}.png`, 32, 32);
  })
}

/**
 * 
 * @param {Phaser.Tilemap} map 
 */
function addTilesets(map) {
  TILESET_SHEET_KEYS.forEach(key => {
    map.addTilesetImage(key);
  })
}

class GameScene {
  /**
   * 
   * @param {Phaser.Game} phaserGame 
   */
  constructor(phaserGame) {
    this.state = 'playing';
    this.levelIndex = 0;
    this.phaserGame = phaserGame;
    this.hudFlashEnd = 0;
    this.adHocUpdaters = new AdHocUpdaters(phaserGame);

    // Sprite arrays
    /** @type {Phaser.Group} */
    this.enemies = null;
    /** @type {Phaser.Group} */
    this.bullets = null;

    // Use this group to make sure all physical sprites always render under the HUD (created later)
    /** @type {Phaser.Group} */
    this.physicalGroup = this.phaserGame.add.group(undefined, "physical");

    /** @type {NinjaPlayer} */
    this.player = null;

    /** @type {Array<Phaser.Tilemap} */
    this.tilemaps = [];

    /** @type {Array<Phaser.TilemapLayer} */
    this.tilemapLayers = [];

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

    this.resetPhysical();
    this.spawnScene(LEVELS[this.levelIndex]);

    // TEMP
    /** @type {Phaser.Tilemap} */
    const wave = game.add.tilemap('wave0');
    const propMap = createPropertiesByGid(wave);
    wave.objects['objects'].forEach(obj => {
      console.log(propMap.get(obj.gid));
    });

    this.setupKeys();
  }

  spawnTilemap_(assetKey) {
    const collidingTileTypes = new Set(['softWall']);

    const map = game.add.tilemap(assetKey);
    this.tilemaps.push(map);
    addTilesets(map);
    addTilemapExtensions(map);
    map.layers.forEach(layer => {
      const layerInst = map.createLayer(layer.name);
      this.tilemapLayers.push(layerInst);
      this.physicalGroup.add(layerInst);
      map.setCollisionByExclusion([], true, layerInst);

      // Set collision for tiles that should collide.
      const collidingTileIds = [];
      for2d([layer.x, layer.y], [layer.width, layer.height],
        (x, y) => {
          const tile = map.getTile(x, y);
          if (tile) {
            const type = getTilePropOr(tile, 'type', null);
            if (type && collidingTileTypes.has(type)) {
              collidingTileIds.push(tile.index);
            }
          }
        });

      map.setCollision(collidingTileIds, true, layerInst);
    });
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
    this.spawnTilemap_('level_base');

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
      // else if (c == 'O') {
      // new BreakableWall(this, x, y);
      // }
      // else if (c == 'X') {
      // new StaticEnv(this, x, y);
      // }
    }

    if (this.player == null) {
      throw new Error("No player in level!");
    }
    if (this.enemies.countLiving() == 0) {
      throw new Error("No enemies in level!");
    }

    const count = this.logSprites_(this.phaserGame.world, '--');
    console.log(`${count} objects`);
  }

  logSprites_(obj, prefix = '') {
    if (obj === undefined) {
      obj = this.phaserGame.world;
    }
    let count = 1;
    console.log(`${prefix}${obj.constructor.name},${obj.name || obj.key}`, obj);
    if (obj instanceof Phaser.Group) {
      obj.forEach(c => {
        count += this.logSprites_(c, prefix + '--');
      });
    }
    return count;
  }

  resetPhysical() {
    // Recreate children, but don't recreate the physical group itself - to preserve order under HUD.
    // NOTE: for some reason, just destroy children of physical group didn't work..
    if (this.enemies) this.enemies.destroy();
    if (this.bullets) this.bullets.destroy();

    this.enemies = this.phaserGame.add.group(this.physicalGroup, "enemies");
    this.bullets = this.phaserGame.add.group(this.physicalGroup, "bullets");

    this.tilemapLayers.forEach(l => l.destroy());
    this.tilemapLayers = [];

    this.tilemaps.forEach(m => m.destroy());
    this.tilemaps = [];

    if (this.player) this.player.destroy();
    this.player = null;
  }

  countdownToLevel(ms) {
    wasd.visible = this.levelIndex == 0;
    this.state = 'countdown';
    this.phaserGame.stage.backgroundColor = '#1e0020';
    this.resetPhysical();
    this.spawnScene(LEVELS[this.levelIndex]);
    this.hudText.text = 'Get ready..'
    triggerSlowMo(100, ms);
    this.phaserGame.time.events.add(ms, () => {
      this.state = 'playing';
      this.phaserGame.stage.backgroundColor = '#2e0e39';
    });
  }

  onEnemyDeath(enemy) {
    this.adHocUpdaters.add(1000,
      () => {
        this.hudText.tint = Math.floor(this.phaserGame.time.time / 60) % 2 == 0 ? 0x88ff00 : 0xffffff;
      },
      () => { this.hudText.tint = 0xffffff });
  }

  update() {
    this.adHocUpdaters.update();
    this.updateHud();

    this.myCollide(this.player, this.enemies);
    this.myCollide(this.player, this.bullets);

    this.tilemapLayers.forEach(layer => this.myCollide(this.player, layer));
    this.tilemapLayers.forEach(layer => this.myCollide(this.enemies, layer));
    this.tilemapLayers.forEach(layer => this.myCollide(this.bullets, layer));

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
      else if (this.player.getHealth() <= 0) {
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
  preloadTilesets();
  // TODO have these preloads be declared in the Object files, like audio.
  game.load.image('ground', 'phaser_tutorial_02/assets/platform.png');
  game.load.image('star', 'phaser_tutorial_02/assets/star.png');
  game.load.image('baddie', 'phaser_tutorial_02/assets/baddie.png');
  game.load.spritesheet('dude', 'phaser_tutorial_02/assets/dude.png', 32, 48);
  game.load.spritesheet('ninja', 'sprites/ninja-sheet.png', 32, 64);
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

  wasd = game.add.text(game.world.width / 2 - 100, game.world.height / 2 + 50,
    'Tap WASD to fly\nDouble-tap to dash', { font: 'Courier New', fontSize: '24px', fill: '#fff' });
  wasd.setShadow(3, 3, '#000', 2);

  // scoreFx = game.add.emitter(0, 0, 100);
  // scoreFx.makeParticles('star');
  // scoreFx.gravity = 200;

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
