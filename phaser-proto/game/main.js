const W = 512;
const H = 544;
const S = 1;

const CANVAS_PIXELS_PER_SPRITE_PIXEL = 2;
const CPPSP = CANVAS_PIXELS_PER_SPRITE_PIXEL;

// Used for run-time mod of debug flags. For example, if you want to debug-draw
// the player and coins, open the Chrome console and run "DEBUG.draws = ['player', 'coins']"
const DEBUG = {
  draws: []
};

const waitBgColor = '#0e0020';

const LEVEL_TILEMAP_KEYS = ['wave0', 'wave1', 'wave2'];
const TILESET_SHEET_KEYS = ['inca_front', 'inca_back', 'inca_back2'];

function preloadTilesets() {
  TILESET_SHEET_KEYS.forEach(key => {
    game.load.spritesheet(key, `sprites/tilesets/${key}.png`, 32, 32);
  })
}

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
  game.load.spritesheet('enemy-medium', 'sprites/Spaceship-shooter-environment/spritesheets/enemy-medium.png', 64, 32);
  game.load.spritesheet('robot-parts', 'sprites/sci fi robot parts.png', 32, 32);
  game.load.image('laser-side', 'sprites/topdown_shooter/guns/laser/laser_side.png');
  game.load.image('turret', 'sprites/topdown_shooter/guns/cannon/cannon_down.png');
  game.load.image('cannonball', 'sprites/topdown_shooter/other/cannonball.png')

  game.load.tilemap('level_base', 'tilemaps/level_base.json', null, Phaser.Tilemap.TILED_JSON);
  LEVEL_TILEMAP_KEYS.forEach(key => {
    game.load.tilemap(key, `tilemaps/${key}.json`, null, Phaser.Tilemap.TILED_JSON);
  });
}

/**
 * 
 * @param {Phaser.Tilemap} map 
 */
function addTilesetImages(map) {
  // TODO only add the sets used in the map
  TILESET_SHEET_KEYS.forEach(key => {
    map.addTilesetImage(key);
  })
}

class GameScene {
  /**
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
    /** @type {Phaser.Group} */
    this.environment = null;

    // Use this group to make sure all physical sprites always render under the HUD (created later)
    /** @type {Phaser.Group} */
    this.physicalGroup = this.phaserGame.add.group(undefined, "pieces");

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

    this.wasd = game.add.text(game.world.width / 2 - 100, game.world.height / 2 + 50,
      'Tap WASD to fly\nDouble-tap to dash', { font: 'Courier New', fontSize: '24px', fill: '#fff' });
    this.wasd.setShadow(2, 2, 'rgba(0,0,0,0.5)', 2);

    this.spawnScene(LEVEL_TILEMAP_KEYS[this.levelIndex]);

    this.setupKeys();
  }

  /**
   * @returns {number} In seconds
   */
  getDeltaTime() {
    return this.phaserGame.time.physicsElapsed;
  }

  /**
   * @returns {number} Absolute game time in seconds;
   */
  getTime() {
    return this.phaserGame.time.time / 1e3;
  }

  squareWave(freqHz, offsetSecs = 0) {
    return Math.floor((offsetSecs + this.getTime()) * 2 * freqHz) % 2 == 0;
  }

  /**
   * Only considers tiles to be vis-blocking, not entities.
   * @param {Phaser.Point} a 
   * @param {Phaser.Point} b 
   */
  hasClearLineOfSight(a, b) {
    let hitAny = false;
    this.overlapLineWithTileLayers(new Phaser.Line(a.x, a.y, b.x, b.y), tile => {
      hitAny = true;
    });
    return !hitAny;
  }

  /**
   * Returns the closest intersecting tile and point of intersection. Not very
   * efficient right now.
   * @param {Phaser.Line} line 
   */
  raycastTiles(line) {
    let bestTile = null;
    let bestIntx = new Phaser.Point();
    let bestDist = 0;
    this.tilemapLayers.forEach(layer => {
      overlapLineWithLayer(line, layer, (tile, intx) => {
        const dist = Phaser.Point.distance(line.start, intx);
        if (bestTile == null || dist < bestDist) {
          bestTile = tile;
          bestIntx.copyFrom(intx);
          bestDist = dist;
        }
      });
    });

    return { tile: bestTile, intx: bestIntx };
  }

  overlapLineWithTileLayers(line, process) {
    this.tilemapLayers.forEach(layer => {
      overlapLineWithLayer(line, layer, process);
    })
  }

  spawnTilemap_(assetKey) {
    const collidingTileTypes = new Set(['softWall', 'wall']);

    const map = game.add.tilemap(assetKey);
    this.tilemaps.push(map);
    addTilesetImages(map);
    addTilemapExtensions(map);
    map.layers.forEach(layer => {
      const layerInst = map.createLayer(layer.name);
      this.tilemapLayers.push(layerInst);
      // Make sure they render under HUD, etc.
      this.environment.add(layerInst);

      // Set collision for tiles that should collide.
      const collidingTileIds = [];
      for2d([layer.x, layer.y], [layer.width, layer.height],
        (x, y) => {
          const tile = map.getTile(x, y, layerInst);
          if (tile) {
            const type = getTilePropOr(tile, 'type', null);
            if (collidingTileTypes.has(type)) {
              collidingTileIds.push(tile.index);
            }
          }
        });

      map.setCollision(collidingTileIds, true, layerInst);
    });

    // Objects
    for (var layerName in map.objects) {
      map.objects[layerName].forEach(obj => {
        const type = getObjectPropOr(map, obj.gid, 'type', undefined);

        switch (type) {
          case 'playerStart':
            console.log(obj);
            new NinjaPlayer(this, obj.x + 16, obj.y - 16);
            break;
          case 'turret':
            new Turret(this, obj.x + 16, obj.y - 16);
            break;
          case 'chaser':
            new Chaser(this, obj.x + 16, obj.y - 16);
            break;
          case 'bull':
            new Bull(this, obj.x + 16, obj.y - 16);
            break;
          case 'laser':
            new SpinLaser(this, obj.x + 16, obj.y - 16);
            break;
        }
      });
    }
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
   * @param {string} tilemapKey 
   */
  spawnScene(tilemapKey) {
    // Recreate children, but don't recreate the physical group itself - to
    // preserve order under HUD.

    this.tilemapLayers.forEach(l => l.destroy());
    this.tilemapLayers = [];

    safeDestroy(this.environment);
    this.environment = this.phaserGame.add.group(this.physicalGroup, "environment");

    safeDestroy(this.enemies);
    this.enemies = this.phaserGame.add.group(this.physicalGroup, "enemies");

    safeDestroy(this.bullets);
    this.bullets = this.phaserGame.add.group(this.physicalGroup, "bullets");

    this.tilemaps.forEach(m => m.destroy());
    this.tilemaps = [];

    if (this.player) this.player.destroy();
    this.player = null;

    this.spawnTilemap_('level_base');
    this.spawnTilemap_(tilemapKey);

    if (this.player == null) {
      throw new Error("No player in level!");
    }

    if (this.enemies.countLiving() == 0) {
      throw new Error("No enemies in level!");
    }

    const count = this.logSprites_();
    console.log(`${count} objects`);
  }

  logSprites_(obj, prefix = '| ') {
    if (obj === undefined) {
      obj = this.phaserGame.world;
    }
    let count = 1;
    console.log(`${prefix}${obj.constructor.name || obj.name || obj.key}`);
    if (obj instanceof Phaser.Group) {
      obj.forEach(c => {
        count += this.logSprites_(c, prefix + '| ');
      });
    }
    return count;
  }

  countdownToLevel(ms) {
    this.wasd.visible = this.levelIndex == 0;
    this.state = 'countdown';
    this.phaserGame.stage.backgroundColor = waitBgColor;
    this.spawnScene(LEVEL_TILEMAP_KEYS[this.levelIndex]);
    this.hudText.text = 'Get ready..'
    triggerSlowMo(100, ms);
    this.phaserGame.time.events.add(ms, () => {
      this.state = 'playing';
      this.phaserGame.stage.backgroundColor = '#2e0e39';
    });
  }

  onEnemyDeath(enemy) {
    hitPause(180);
    addShake(8, 8);
    this.adHocUpdaters.add(1000,
      () => {
        this.hudText.tint = Math.floor(this.phaserGame.time.time / 60) % 2 == 0 ? 0x88ff00 : 0xffffff;
      },
      () => this.hudText.tint = 0xffffff);
  }

  isPlaying() {
    return this.state == 'playing';
  }

  update() {

    if (DEBUG.draws.includes('overlaptest')) {
      this.debugTiles = [];
      this.overlapLineWithTileLayers(
        new Phaser.Line(1000, 1000, this.player.x, this.player.y),
        tile => {
          this.debugTiles.push(tile);
        });
    }

    this.adHocUpdaters.update();
    this.updateHud();

    this.myCollide(this.player, this.enemies);
    this.myCollide(this.player, this.bullets);

    [this.player, this.enemies, this.bullets].forEach(group => {
      this.tilemapLayers.forEach(layer => this.myCollide(group, layer));
    });

    if (this.state == 'playing') {
      if (this.enemies.countLiving() == 0) {
        this.state = 'intermission';
        this.hudText.text = '!! LEVEL CLEAR !!';
        this.phaserGame.stage.backgroundColor = '#1e4e54';
        addShake(50, 50);
        const ms = 1500;
        triggerSlowMo(5, ms);
        this.levelIndex++;
        this.phaserGame.time.events.add(ms, () => {
          this.countdownToLevel(1500);
        });
      }
      else if (this.player.getHealth() <= 0) {
        this.state = 'gameover';
        this.hudText.text = '!! GAME OVER !!';
        this.phaserGame.stage.backgroundColor = waitBgColor;

        const ms = 1000;
        addShake(10, 10);
        triggerSlowMo(5, ms);
        this.phaserGame.time.events.add(ms, () => {
          this.countdownToLevel(0);
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

function create() {
  game.stage.backgroundColor = '#2e0e39';
  game.world.setBounds(0, 0, 2000, 2000);
  PRELOAD_CREATE_LIST.forEach(asset => asset.create());
  game.physics.startSystem(Phaser.Physics.ARCADE);

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

function debugDrawPlayer() {
  const player = scene.player;
  game.debug.rectangle(player.getBounds(), '#ff0000', false);
  game.debug.body(player);
  const t = player.body.touching;
  game.debug.text(`body touch: ${t['up'] ? 'u' : ' '}${t['left'] ? 'l' : ' '}${t['down'] ? 'd' : ' '}${t['right'] ? 'r' : ' '}`, 0, 50);
}

function render() {
  if (scene.debugTiles) {
    scene.debugTiles.forEach(t => {
      const r = new Phaser.Rectangle(t.worldX, t.worldY, t.width, t.height);
      game.debug.rectangle(r, '#ffffff', true);
      game.debug.rectangle(r, '#00ff00', true);
    });

    game.debug.geom(new Phaser.Line(1000, 1000, scene.player.x, scene.player.y), '#ff0000', true);
    game.debug.text(`${scene.debugTiles.length}`, 100, 100, '#ffffff');
  }

  if (DEBUG.draws.includes('player')) {
    debugDrawPlayer();
  }

  if (DEBUG.draws.includes('tilecast')) {
    // debug raycast
    const line = new Phaser.Line(scene.player.x, scene.player.y, 1000, 1000);
    game.debug.geom(line, '#ff0000', true);
    const cast = scene.raycastTiles(line);
    if (cast.tile != null) {
      const t = cast.tile;
      const r = new Phaser.Rectangle(t.worldX, t.worldY, t.width, t.height);
      game.debug.rectangle(r, '#00ff00', true);
      game.debug.geom(cast.intx, '#ff0000', true);
    }
  }

  scene.enemies.forEach(e => game.debug.body(e));
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
