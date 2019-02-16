const DIR_STRINGS = ['up', 'left', 'down', 'right'];

/**
 * @param {Phaser.Physics.Arcade.Body} body
 * @param {string} dir 
 * @return {boolean}
 */
function startedTouching(body, dir) {
  return !body.wasTouching[dir] && body.touching[dir];
}

/**
 * @param {Phaser.Physics.Arcade.Body} body
 * @return {boolean}
 */
function startedTouchingInAnyDir(body) {
  return startedTouching(body, DIR_STRINGS[0])
    || startedTouching(body, DIR_STRINGS[1])
    || startedTouching(body, DIR_STRINGS[2])
    || startedTouching(body, DIR_STRINGS[3]);
}
