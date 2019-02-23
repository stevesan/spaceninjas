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
  tile.layer.__map.removeTile(tile.x, tile.y);
}