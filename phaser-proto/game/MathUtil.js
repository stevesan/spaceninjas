function snap(x, unit) {
  return unit * Math.floor(x / unit);
}

function randBetween(a, b) {
  return a + (b - a) * Math.random();
}

function fromTo(spriteA, spriteB) {
  const aPos = spriteA.position;
  const bPos = spriteB.position;
  return Phaser.Point.subtract(bPos, aPos);
}