
window.onload = function () {

  const W = 512;
  const H = 544;
  const S = 1.2;
  var game = new Phaser.Game(W * S, H * S, Phaser.AUTO, '', {
    preload: preload,
    create: create,
    update: update,
    render: render
  });

  /** @type {Phaser.Group} */
  var platforms;

  /** @type {Phaser.Group} */
  var stars;

  var score = 0;

  /** @type {Phaser.Text} */
  var scoreText;

  /** @type {Phaser.Sprite} */
  var player;
  var currPlayerDir = 0;

  /** @type {Phaser.Particles.Arcade.Emitter} */
  var scoreFx;

  function createStars() {
    stars = game.add.group();

    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++) {
      //  Create a star inside of the 'stars' group
      stars.create(i * 70, game.world.height * 0.75, 'star');
    }
  }

  function preload() {
    assetEntries.forEach(asset => asset.preload());
    game.load.image('sky', 'phaser_tutorial_02/assets/sky.png');
    game.load.image('ground', 'phaser_tutorial_02/assets/platform.png');
    game.load.image('star', 'phaser_tutorial_02/assets/star.png');
    game.load.spritesheet('dude', 'phaser_tutorial_02/assets/dude.png', 32, 48);
    game.load.audio('coin', 'wavs/coin.wav');
  }

  const assetEntries = [];

  class PreloadedSprite {
    /**
     * 
     * @param {string} path 
     */
    constructor(path) {
      this.key = `${path}-${assetEntries.length}`;
      this.path = path;
      this.asset = null;
      assetEntries.push(this);
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
      this.key = `${path}-${assetEntries.length}`;
      this.path = path;
      this.asset = null;
      assetEntries.push(this);
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

  const coinAudio = new PreloadedAudio("wavs/coin.wav");

  /**
   * @param {Phaser.Sprite} sprite
   */
  function centerPivot(sprite) {
    const b = sprite.getBounds();
    const L = Math.min(b.width, b.height);
    sprite.pivot.set(b.width / 2, L / 2);
  }

  function create() {
    assetEntries.forEach(asset => asset.create());
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.add.sprite(0, 0, 'sky');
    platforms = game.add.group();
    platforms.enableBody = true;
    const ground = platforms.create(0, game.world.height - 64, 'ground');
    ground.scale.setTo(2, 2);
    ground.body.immovable = true;

    var ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;
    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;

    // Setup player
    player = game.add.sprite(game.world.width / 2, game.world.height / 2, 'dude');
    centerPivot(player);
    game.physics.arcade.enable(player);

    player.body.bounce.y = 0;
    player.body.gravity.y = 0;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
    createStars();

    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    scoreFx = game.add.emitter(0, 0, 100);
    scoreFx.makeParticles('star');
    scoreFx.gravity = 200;

    const keys = game.input.keyboard.addKeys({
      goUp: Phaser.Keyboard.W,
      goDown: Phaser.Keyboard.S,
      goLeft: Phaser.Keyboard.A,
      goRight: Phaser.Keyboard.D,
    });

    const origWidth = player.getBounds().width;
    const origHeight = player.getBounds().height;

    function onDirChange(dir) {
      currPlayerDir = dir;
      player.body.velocity.set(
        [0, -speed, 0, speed][dir],
        [-speed, 0, speed, 0][dir]
      );
      player.rotation = [0, -0.25, 0.5, 0.25][dir] * Math.PI * 2;

      // Update collider
      const ow = origWidth;
      const oh = origHeight;
      player.body.setSize(
        [ow, oh, ow, oh][dir],
        [oh, ow, oh, ow][dir],
        [0, 0, -ow, -oh][dir],
        [0, -ow, -oh, 0][dir]);
    }

    const speed = 200;
    keys.goUp.onDown.add(() => onDirChange(0));
    keys.goLeft.onDown.add(() => onDirChange(1));
    keys.goDown.onDown.add(() => onDirChange(2));
    keys.goRight.onDown.add(() => onDirChange(3));
  }

  function collectStar(player, star) {
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;

    coinAudio.asset.play();
    hitPause(100);
    // triggerSlowMo(3, 500);
  }

  function hitPause(durationMs) {
    triggerSlowMo(100, durationMs);
  }

  function triggerSlowMo(slowFactor, durationMs) {
    game.time.slowMotion = slowFactor;
    game.time.desiredFps = 60 + (slowFactor > 1 ? slowFactor * 60 : 0);
    game.time.events.add(durationMs, () => {
      game.time.slowMotion = 1;
      game.time.desiredFps = 60;
    });

  }

  function onLanded() {
    const b = player.getBounds();

    // scoreFx.position.set((b.left + b.right) * 0.5, b.bottom);
    // scoreFx.start(true, 5000, null, 10);
  }

  var wasTouchingGround = false;

  function update() {
    scoreText.y = 32 + 16 * Math.sin(game.time.time * 6.28 * 2);
    var hitPlatform = game.physics.arcade.collide(player, platforms);

    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    cursors = game.input.keyboard.createCursorKeys();

    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down && hitPlatform) {
      player.body.velocity.y = -350;
    }

    const isTouchingGround = player.body.touching.down && hitPlatform;
    if (isTouchingGround && !wasTouchingGround) {
      onLanded();
    }
    wasTouchingGround = isTouchingGround;
  }

  function render() {
    game.debug.rectangle(player.getBounds(), '#ff0000', false);
    // game.debug.body(player);
  }
};
