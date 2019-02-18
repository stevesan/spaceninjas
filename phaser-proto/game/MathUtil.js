function snap(x, unit) {
  return unit * Math.floor(x / unit);
}

function fromTo(spriteA, spriteB) {
  const aPos = spriteA.position;
  const bPos = spriteB.position;
  return Phaser.Point.subtract(bPos, aPos);
}