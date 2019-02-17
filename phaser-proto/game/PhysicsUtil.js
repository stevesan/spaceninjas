const DIR_STRINGS = ['up', 'left', 'down', 'right'];

/**
 * @param {Phaser.Physics.Arcade.Body} body
 * @param {number} dir
 * @return {boolean}
 */
function startedTouching(body, dir) {
  return !body.wasTouching[DIR_STRINGS[dir]] && body.touching[DIR_STRINGS[dir]];
}

function opposite(dir) {
  if (dir == 0) return 2;
  if (dir == 1) return 3;
  if (dir == 2) return 0;
  else return 1;
}

/**
 * @param {Phaser.Physics.Arcade.Body} body
 * @return {boolean}
 */
function startedTouchingInAnyDir(body) {
  return startedTouching(body, 0)
    || startedTouching(body, 1)
    || startedTouching(body, 2)
    || startedTouching(body, 3);
}

function getTouchingDir(body) {
  if (body.touching['up']) return 0;
  if (body.touching['left']) return 1;
  if (body.touching['down']) return 2;
  if (body.touching['right']) return 3;
  return null;
}
