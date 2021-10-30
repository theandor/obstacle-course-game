/*
 * Created by theandor
 * Description: A basic game I created in 6 hours!
 */



var gravity = 0.25;
var level = 1;

var platformSpeedIncrease = 0.25;
var platformSpeed = 0.25;

const canvas = document.createElement('canvas');

canvas.id = 'game';

document.body.appendChild(canvas);

var mc = new Hammer(canvas);

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
    canvas: document.getElementById('game'),
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

function playerFling(direction, player)
{
    var walkSpeed = 200;

    if (direction)
    {
        if (!player.body.touching.down || isDoubleJumpAllowed)
        {
            player.setVelocityX(walkSpeed * 2.5);
            return;
        }

        player.setVelocityX(walkSpeed);
    }

    if (!direction)
    {
        if (!player.body.touching.down || isDoubleJumpAllowed)
        {
            player.setVelocityX((walkSpeed * 2.5) * -1);
            return;
        }

        player.setVelocityX(walkSpeed * -1);
    }
}

function playerJump(player)
{
    var jumpSpeed = 540 * 1.25;

    if (player.body.touching.down)
        player.setVelocityY(jumpSpeed * -1);

    if (isDoubleJumpAllowed && (score >= 1))
        player.setVelocityY(jumpSpeed * -1);
}

function playerKeyboardInput(event)
{
    if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE || event.keyCode === Phaser.Input.Keyboard.KeyCodes.J)
        playerJump(this.player);
    if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.D || event.keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT)
        playerFling(true, this.player);
    if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.A || event.keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT)
        playerFling(false, this.player);
}

function create()
{
    this.input.keyboard.on('keyup', playerKeyboardInput, this);

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
        speed: 25,
        scale: { start: 1, end: 0 },
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

    var ground = this.platformGroup.create(config.width / 2, config.height - 25, 'ground')

    ground.isGround = true;

    var platformSide = false;

    for (var platformNumber = 1; platformNumber <= 3; platformNumber++)
    {
        var gap = 56 * 2.25;

        platformSide = !platformSide;

        if (platformSide)
        {
            var platform = this.platformGroup.create(217 / 2, config.height - (gap * platformNumber), 'platform');
            platform.side = platformSide;

        }

        if (!platformSide)
        {
            var platform = this.platformGroup.create(config.width - (217 / 2), config.height - (gap * platformNumber) , 'platform');
            platform.side = platformSide;
        }
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

    this.levelText = this.add.text(0, 0, 'Level: ' + level, { fontFamily: 'sans-serif', fontSize: 32, color: 'white'});

    this.physics.add.collider(this.player, this.platformGroup);

    /*
     * Mobile swipe controls
     */

    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )
    {
        var player = this.player;

        mc.on('swipeup swipedown swipeleft swiperight tap', function(ev) {
            if (ev.type == "swiperight")
                playerFling(true, player);
            if (ev.type == "swipeleft")
                playerFling(false, player);
            if (ev.type == "tap")
                playerJump(player);
            });
    }
}

function update()
{
    var frame = this;

    frame.physics.collide(this.player, this.doorGroup, function (player) {
        frame.player.x = 50;
        frame.player.y = config.height - (64 + 25);
        frame.player.setVelocity(0, 0);
        level++;

        platformSpeed += platformSpeedIncrease;

        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )
            mc.off('swipeup swipedown swipeleft swiperight tap');

        frame.scene.restart()
    });

    frame.platformGroup.children.each(function(platform)
    {
        var speed;
        if (level < 13)
            speed = platformSpeed + (platformSpeedIncrease * (level / 2));
        if (level == 12 || level <= 25)
            speed = platformSpeed + (platformSpeedIncrease * (12 / 2));
        if (level > 25)
            speed = platformSpeed + (platformSpeedIncrease * (13 / 2));

        if (platform.side && !platform.isGround)
        {
            if (platform.x + (217 / 2) + speed < config.width)
            {
                platform.x += speed;
                return;
            }
            platform.side = !platform.side;
        }
        if (!platform.side && !platform.isGround)
        {
            if (platform.x - (217 / 2) + speed > 0)
            {
                platform.x -= speed;
                return;
            }

            platform.side = !platform.side;
        }
    }, this)
}
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

function playerFling(direction, player)
{
    var walkSpeed = 200;

    if (direction)
    {
        if (!player.body.touching.down)
        {
            player.setVelocityX(walkSpeed * 2.5);
            return;
        }

        player.setVelocityX(walkSpeed);
    }

    if (!direction)
    {
        if (!player.body.touching.down)
        {
            player.setVelocityX((walkSpeed * 2.5) * -1);
            return;
        }

        player.setVelocityX(walkSpeed * -1);
    }
}

function playerJump(player)
{
    var jumpSpeed = 540 * 1.25;

    if (player.body.touching.down)
        player.setVelocityY(jumpSpeed * -1);
}

function playerKeyboardInput(event)
{
    if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE || event.keyCode === Phaser.Input.Keyboard.KeyCodes.J)
        playerJump(this.player);
    if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.D || event.keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT)
        playerFling(true, this.player);
    if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.A || event.keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT)
        playerFling(false, this.player);
}

function create()
{
    this.input.keyboard.on('keyup', playerKeyboardInput, this);

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
        speed: 25,
        scale: { start: 1, end: 0 },
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

    var ground = this.platformGroup.create(config.width / 2, config.height - 25, 'ground')

    ground.isGround = true;

    var platformSide = false;

    for (var platformNumber = 1; platformNumber <= 3; platformNumber++)
    {
        var gap = 56 * 2.25;

        platformSide = !platformSide;

        if (platformSide)
        {
            var platform = this.platformGroup.create(217 / 2, config.height - (gap * platformNumber), 'platform');
            platform.side = platformSide;

        }

        if (!platformSide)
        {
            var platform = this.platformGroup.create(config.width - (217 / 2), config.height - (gap * platformNumber) , 'platform');
            platform.side = platformSide;
        }
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

    this.levelText = this.add.text(0, 0, 'Level: ' + level, { fontFamily: 'sans-serif', fontSize: 32, color: 'white'});

    this.physics.add.collider(this.player, this.platformGroup);

    /*
     * Mobile swipe controls
     */

    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )
    {
        var player = this.player;

        mc.on('swipeup swipedown swipeleft swiperight tap', function(ev) {
            if (ev.type == "swiperight")
                playerFling(true, player);
            if (ev.type == "swipeleft")
                playerFling(false, player);
            if (ev.type == "tap")
                playerJump(player);
            });
    }
}

function update()
{
    var frame = this;

    frame.physics.collide(this.player, this.doorGroup, function (player) {
        frame.player.x = 50;
        frame.player.y = config.height - (64 + 25);
        frame.player.setVelocity(0, 0);
        level++;

        platformSpeed += platformSpeedIncrease;

        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )
            mc.off('swipeup swipedown swipeleft swiperight tap');

        frame.scene.restart()
    });

    frame.platformGroup.children.each(function(platform)
    {
        var speed = platformSpeed + (platformSpeedIncrease * (level / 2));
        if (platform.side && !platform.isGround)
        {
            if (platform.x + (217 / 2) + speed < config.width)
            {
                platform.x += speed;
                return;
            }
            platform.side = !platform.side;
        }
        if (!platform.side && !platform.isGround)
        {
            if (platform.x - (217 / 2) + speed > 0)
            {
                platform.x -= speed;
                return;
            }

            platform.side = !platform.side;
        }
    }, this)
}
