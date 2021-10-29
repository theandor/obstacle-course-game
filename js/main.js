/*
 * Created by theandor
 * Description: A basic game I created in 6 hours!
 */

var gravity = 0.25;
var level = 1;

var config = {
    type: Phaser.AUTO,
    width: 650,
    height: 650,
    fps: 30,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function loadTextureAssets(game)
{
    game.load.image('backdrop', 'assets/background.png'); // Load backdrop
    game.load.image('player', 'assets/player/entity.png'); // Load Player
    game.load.image('player-particle', 'assets/player/particles.png'); // Load Player's particles
    game.load.image('ground', 'assets/world/ground.png'); // Load World Ground
    game.load.image('platform', 'assets/world/platform.png'); // Load World Ground
    game.load.image('door', 'assets/world/door.png'); // Load Next Level Door
}

function preload()
{
    console.debug("Starting game");

    console.debug("Loading assets");

    loadTextureAssets(this); // load assets

    console.debug("Assets have finished loading");

    console.debug("Game has finished loading");
}

function playerKeyboardInput(event)
{
    var jumpSpeed = 540 * 1.25;
    var walkSpeed = 200;

    if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE || event.keyCode === Phaser.Input.Keyboard.KeyCodes.J)
        if (this.player.body.touching.down)
                this.player.setVelocityY(jumpSpeed * -1);
    if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.D || event.keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT)
    {
        if (!this.player.body.touching.down)
        {
            this.player.setVelocityX(walkSpeed * 2.5);
            return;
        }

        this.player.setVelocityX(walkSpeed);
    }
    if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.A || event.keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT)
    {
        if (!this.player.body.touching.down)
        {
            this.player.setVelocityX((walkSpeed * 2.5) * -1);
            return;
        }

        this.player.setVelocityX(walkSpeed * -1);
    }
}

function create()
{
    this.input.keyboard.on('keydown', playerKeyboardInput, this);

    /*
     * Calculate Math
     */

    var bounce_force = gravity * 1.5;

    /*
     * Background
     */

    this.add.sprite(config.width / 2, config.height / 2, 'backdrop');

    /*
     * Player
     */

    this.playerParticles = this.add.particles('player-particle');

    this.playerEmitter = this.playerParticles.createEmitter({
        speed: 45,
        scale: { start: 1, end: 0.5 },
        blendMode: 'MIX'
    });

    this.player = this.physics.add.sprite(50, config.height - (64 + 25), 'player');

    this.player.setBounce(bounce_force, bounce_force);
    this.player.setCollideWorldBounds(true);
    this.player.gravity = 25;

    this.playerEmitter.startFollow(this.player);

    /*
     * Platforms
     */

    this.platformGroup = this.physics.add.group({
        immovable: true,
        allowGravity: false,
        enabeleBody: true,
        enabled: true
    });

    this.platformGroup.create(config.width / 2, config.height - 25, 'ground')

    var platformSide = false;

    for (var platformNumber = 1; platformNumber <= 3; platformNumber++)
    {
        var gap = 56 * 2.25;

        platformSide = !platformSide;

        if (platformSide)
            this.platformGroup.create(217 / 2, config.height - (gap * platformNumber), 'platform');

        if (!platformSide)
            this.platformGroup.create(config.width - (217 / 2), config.height - (gap * platformNumber) , 'platform');
    }

    this.doorGroup = this.physics.add.group({
        immovable: true,
        allowGravity: false,
        enabeleBody: true,
        enabled: true
    });

    this.doorGroup.create(36 / 2, 172, 'door');

    /*
     * Level Text
     */

    this.levelText = this.add.text(0, 0, 'Level: 1', { fontFamily: 'sans-serif', fontSize: 32, color: 'white'});

    this.physics.add.collider(this.player, this.platformGroup);
}

function update()
{
    this.levelText.setText('Level: ' + level);

    this.physics.collide(this.player, this.doorGroup, function (player){
        player.x = 50;
        player.y = config.height - (64 + 25);
        player.setVelocity(0, 0);
        level++;
    });
}
