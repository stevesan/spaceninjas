const PRELOAD_CREATE_LIST = [];

class PreloadedSprite {
  /**
   * 
   * @param {string} path 
   */
  constructor(path) {
    this.key = `${path}-${PRELOAD_CREATE_LIST.length}`;
    this.path = path;
    this.asset = null;
    PRELOAD_CREATE_LIST.push(this);
  }

  preload() {
    game.load.image(this.key, this.path);
  }

  create() {
    this.asset = game.add.sprite(0, 0, this.key);
  }

  /**
   * @return {Phaser.Sound}
   */
  get() { return this.asset; }
}

class PreloadedAudio {
  /**
   * 
   * @param {string} path 
   */
  constructor(path) {
    this.key = `${path}-${PRELOAD_CREATE_LIST.length}`;
    this.path = path;
    this.asset = null;
    PRELOAD_CREATE_LIST.push(this);
  }

  preload() {
    game.load.audio(this.key, this.path);
  }

  create() {
    this.asset = game.add.audio(this.key);
  }

  /**
   * @return {Phaser.Sound}
   */
  get() { return this.asset; }
}

/**
 * 
 * @param {Phaser.Tilemap} map 
 */
function createPropertiesByGid(map) {
  const rv = new Map();
  map.tilesets.forEach(set => {
    if (!set.tileProperties) {
      return;
    }
    set.tileProperties.forEach(props => {
      const gid = set.firstgid + props.id;
      rv.set(gid, props);
    });
  });
  return rv;
}

/**
 * 
 * @param {Phaser.Tilemap} map 
 */
function applyTilemapHacks(map) {
  console.log(map);
  map.__propDict = createPropertiesByGid(map);
  // So we can easily go from a collided Phaser.Tile to its property map..heh. Each Tile gets a reference to this layer field.
  map.layers.forEach(layer => layer.__map = map);
}

/**
 * 
 * @param {Phaser.Tile} tile 
 */
function getTileProps(tile) {
  return tile.layer.__map.__propDict.get(tile.index);
}

/**
 * 
 * @param {Phaser.Tile} tile 
 */
function removeTileFromMap(tile) {
  tile.layer.__map.removeTile(tile.x, tile.y);
}