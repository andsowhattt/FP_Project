const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 480,
    height: 640,
    scene: [ startScreen, fluppyBird ],
    scale: {
        mode: Phaser.Scale.FIT,
    },
    physics:{
        default:'arcade',
        arcade:{debug:false}
    }
};

const game = new Phaser.Game(config);