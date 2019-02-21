
class AdHocUpdaters {
  /**
   * 
   * @param {Phaser.Game} game 
   */
  constructor(game) {
    this.game = game;
    this.updaters = new Set();
  }

  add(lifetimeMs, updateFunc, onEndFunc) {
    this.updaters.add({
      updateFunc: updateFunc,
      onEndFunc: onEndFunc,
      endTime: this.game.time.time + lifetimeMs
    });
  }

  update() {
    const toRemove = [];
    this.updaters.forEach(entry => {
      if (this.game.time.time > entry.endTime) {
        toRemove.push(entry);
        entry.onEndFunc();
      }
      else {
        entry.updateFunc();
      }
    });

    toRemove.forEach(e => this.updaters.delete(e));
  }
}