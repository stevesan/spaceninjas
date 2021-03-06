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

function for2d(start, dims, process) {
  for (let y = 0; y < dims[1]; y++) {
    for (let x = 0; x < dims[0]; x++) {
      process(start[0] + x, start[1] + y);
    }
  }
}