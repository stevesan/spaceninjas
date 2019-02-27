/**
 * 
 * @param {Phaser.Tilemap} map 
 */
function addTilemapExtensions(map) {
  map.__propDict = createPropertiesByGid(map);
  // So we can easily go from a Phaser.Tile to its map (and thus property
  // dictionary). Phaser gives each Tile a reference to one of these layer
  // objects (which btw are not TilemapLayer's...).
  map.layers.forEach(layer => layer.__map = map);
}

/**
 * 
 * @param {Phaser.Tile} tile 
 */
function getTileProps(tile) {
  return tile.layer.__map.__propDict.get(tile.index);
}

function getTilePropOr(tile, prop, ifDNE) {
  const props = getTileProps(tile);
  if (props && prop in props) {
    return props[prop];
  }
  else {
    return ifDNE;
  }
}

/**
 * 
 * @param {Phaser.Tile} tile 
 */
function removeTileFromMap(tile) {
  tile.layer.__map.removeTile(tile.x, tile.y, tile.layer.name);
}

/**
 * 
 * @param {Phaser.Tilemap} map 
 * @param {string} prop
 * @param {number} objectGid 
 * @param {object} ifDNE 
 */
function getObjectPropOr(map, objectGid, prop, ifDNE) {
  const props = map.__propDict.get(objectGid);
  if (props && prop in props) {
    return props[prop];
  }
  else {
    return ifDNE;
  }
}

/**
 * 
 * @param {Phaser.Line} line 
 * @param {Phaser.TilemapLayer} layer
 * @param {object} process
 */
function overlapLine(line, layer, process) {
  var tiles = layer.getTiles(line.x, line.y, line.width, line.height, true);
  const intxPt = new Phaser.Point(0, 0);
  tiles.forEach(tile => {
    const rect = new Phaser.Rectangle(tile.worldX, tile.worldY,
      tile.width, tile.height);
    if (Phaser.Line.intersectionWithRectangle(line, rect, intxPt)) {
      process(tile, intxPt);
    }
  });
}