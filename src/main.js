import Phaser from "phaser";
import "./style.css"
import cielo from "./assets/sky.png"
import plataforma from "./assets/platform.png"
import estrella from "./assets/star.png"
import bomba from "./assets/bomb.png"
import duda from "./assets/dude.png"

// Decalarmos las variables que necesitaremos...
var platforms, player, cursors, stars, score = 0, scoreText, bombs, gameOver;

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload() {
    this.load.image('sky', cielo);
    this.load.image('ground', plataforma);
    this.load.image('star', estrella);
    this.load.image('bomb', bomba);
    this.load.spritesheet('dude',
        duda,
        { frameWidth: 32, frameHeight: 48 }
    );
}


function create() {
    /** fondo */
    this.add.image(400, 300, 'sky');
    /** plataformas */

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    /*
    jugador
    */
    player = this.physics.add.sprite(100, 450, 'dude');

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
    player.body.setGravityY(300);

    /*objeto collider*/
    this.physics.add.collider(player, platforms);
    // habilitamos cursor
    cursors = this.input.keyboard.createCursorKeys();

    //estrellas
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });
    //colisión de estrellas y plataformas

    this.physics.add.collider(stars, platforms);
    // comprobamos si se superponen jugador y estresllas
    this.physics.add.overlap(player, stars, collectStar, null, this);
    // lnazamos collectstar si se superponen
    function collectStar(player, star) {
        // desactivamos el cuerpo de la estrella
        star.disableBody(true, true);
        // añadimos unos puntos
        score += 10;
        //los mostramos por pantalla
        scoreText.setText('Puntos: ' + score);
        // comprobamos que no quedan estreallas 
        if (stars.countActive(true) === 0) {
            // relanzamos las estrellas
            stars.children.iterate(function (child) {
                

                child.enableBody(true, child.x, 0, true, true);

            });

            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
 // lanzamos una bommba
            var bomb = bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

        }

    }
    //texto del score
    scoreText = this.add.text(16, 16, 'PUNTOS: 0', { fontSize: '32px', fill: '#000' });
    // Bombas
    bombs = this.physics.add.group();

    this.physics.add.collider(bombs, platforms);

    this.physics.add.collider(player, bombs, hitBomb, null, this);
    function hitBomb(player, bomb) {
        this.physics.pause();

        player.setTint(0xff0000);

        player.anims.play('turn');

        gameOver = true;
    }




}

function update() {
    // asociamos cursor y jugador
    if (cursors.left.isDown) {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        // controla la potencia de salto: con 530 va de sobra
        player.setVelocityY(-530);
    }
}