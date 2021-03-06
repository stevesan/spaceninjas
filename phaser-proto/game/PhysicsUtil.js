const DIR_STRINGS = ['up', 'left', 'down', 'right'];

const DIR_VECTORS = [
  new Phaser.Point(0, -1),
  new Phaser.Point(-1, 0),
  new Phaser.Point(0, 1),
  new Phaser.Point(1, 0)
];

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

function getBlockedDir(body) {
  if (body.blocked['up']) return 0;
  if (body.blocked['left']) return 1;
  if (body.blocked['down']) return 2;
  if (body.blocked['right']) return 3;
  return null;
}

class WasBlockedTracker {
  /**
   * 
   * @param {Phaser.Physics.Arcade.Body} body 
   */
  constructor(body) {
    this.body = body;
    this.wasBlocked = [false, false, false, false];
  }

  /**
   * 
   * @param {number} dir 
   */
  wasJustBlocked(dir) {
    return !this.wasBlocked[dir] && this.body.blocked[DIR_STRINGS[dir]];
  }

  wasJustBlockedInAnyDir() {
    return this.wasJustBlocked(0)
      || this.wasJustBlocked(1)
      || this.wasJustBlocked(2)
      || this.wasJustBlocked(3);
  }

  update() {
    for (let i = 0; i < 4; i++) {
      this.wasBlocked[i] = this.body.blocked[DIR_STRINGS[i]];
    }
  }
}