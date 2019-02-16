
window.onload = function () {

  const W = 512;
  const H = 544;
  const S = 1.2;
  var game = new Phaser.Game(W * S, H * S, Phaser.AUTO, '', { preload: preload, create: create, update: update });

  /** @type {Phaser.Group} */
  var platforms;

  /** @type {Phaser.Group} */
  var stars;

  var score = 0;

  /** @type {Phaser.Text} */
  var scoreText;

  /** @type {Phaser.Sprite} */
  var player;

  /** @type {Phaser.Particles.Arcade.Emitter} */
  var scoreFx;

  function createStars() {
    stars = game.add.group();

    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++) {
      //  Create a star inside of the 'stars' group
      var star = stars.create(i * 70, 0, 'star');

      //  Let gravity do its thing
      star.body.gravity.y = 60;

      //  This just gives each star a slightly random bounce value
      star.body.bounce.y = 0.7 + Math.random() * 0.2;
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
    player = game.add.sprite(32, game.world.height - 150, 'dude');
    game.physics.arcade.enable(player);
    player.body.bounce.y = 0;
    player.body.gravity.y = 2000;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
    createStars();

    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    scoreFx = game.add.emitter(0, 0, 100);
    scoreFx.makeParticles('star');
    scoreFx.gravity = 200;
  }

  function collectStar(player, star) {
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;

    scoreFx.position.set(player.position.x, player.position.y);
    scoreFx.start(true, 400, null, 10);

    coinAudio.asset.play();
  }

  function onLanded() {
    const b = player.getBounds();

    scoreFx.position.set((b.left + b.right) * 0.5, b.bottom);
    scoreFx.start(true, 400, null, 10);
  }

  var wasTouchingGround = false;

  function update() {
    var hitPlatform = game.physics.arcade.collide(player, platforms);

    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    cursors = game.input.keyboard.createCursorKeys();

    player.body.velocity.x = 0; // Autorun?

    if (cursors.left.isDown) {
      //  Move to the left
      player.body.velocity.x = -150;
      player.animations.play('left');
    }
    else if (cursors.right.isDown) {
      //  Move to the right
      player.body.velocity.x = 150;
      player.animations.play('right');
    }

    // "pull down" hack
    if (player.body.velocity.y > 0) {
      player.body.gravity.y = 2000;
    }
    else {
      player.body.gravity.y = 1000;
    }

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
};
