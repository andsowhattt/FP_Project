'use strict';


// оголошення змінних
const GRAVITY = 500;
const SPEED_UP = -250;
let player;
let distance = 150;
let pipes = [];
let pipesSpeed = -100;
let newPipes = [];
let key = true;
let pause = true;
let flySound;
let playAgainBtn;
let score = 0;
let scoreText;
let lastScoredPipe;
let highScore = parseInt(localStorage.getItem("flappyHighScore")) || 0;

class startScreen extends Phaser.Scene {
	constructor() {
		super('startScreen');
	}

	preload() {
		this.load.image('bg', '/images/bg.png'),
			this.load.image('ground', '/images/ground.png'),
			this.load.image('bird', '/images/bird.png')
	}

	create() {
		const bg = this.add.image(0, 0, 'bg').setOrigin(0);
		bg.displayWidth = this.game.config.width;
		bg.displayHeight = this.game.config.height;

		const ground1 = this.physics.add.sprite(0, game.config.height - 100, 'ground').setOrigin(0);
		ground1.displayWidth = this.game.config.width;
		ground1.displayHeight = 100;
		ground1.setDepth(3);
		ground1.setImmovable();
		ground1.body.setVelocityX(pipesSpeed / 2); // зміна швидкості землі

		const ground2 = this.physics.add.sprite(game.config.width, game.config.height - 100, 'ground').setOrigin(0); // додано новий спрайт землі
		ground2.displayWidth = this.game.config.width;
		ground2.displayHeight = 100;
		ground2.setDepth(3);
		ground2.setImmovable();
		ground2.body.setVelocityX(pipesSpeed / 2); // зміна швидкості землі

		this.tweens.add({
			targets: [ground1, ground2],
			x: '-=336', // відстань на яку потрібно змістити землю
			duration: 1800,
			repeat: -1
		});

		// додати анімацію пташки на місці
		const bird = this.physics.add.sprite(this.game.config.width / 2, this.game.config.height / 2 + 20, 'bird').setOrigin(0.5);

		bird.setScale(2);

		// анімація пташки
		this.tweens.add({
			targets: bird,
			y: bird.y + 20,
			duration: 500,
			ease: 'Power2',
			yoyo: true,
			repeat: -1
		});

		// додати інструкції гри
		const instructions = this.add.text(this.game.config.width / 2, 250, 'CLICK TO START', { font: "18px Courier New", fill: "#ffffff" });
		instructions.setOrigin(0.5);

		// перейти на сцену гри після кліку
		this.input.on('pointerdown', function () {
			this.scene.start('fluppybird');
		}, this);
	}
}

class fluppyBird extends Phaser.Scene {
	constructor() {
		super('fluppybird')
	}

	preload() {
		this.load.image('bg', '/images/bg.png'),
			this.load.image('ground', '/images/ground.png'),
			this.load.image('bird', '/images/bird.png'),
			this.load.image('topPipe', '/images/topwall.png'),
			this.load.image('bottomPipe', '/images/bottomwall.png'),
			this.load.image('gameOver', '/images/gameover.png'),
			this.load.image('playAgain', '/images/again.png'),
			this.load.audio('fly', '/sounds/wing.mp3'),
			this.load.audio('faced', '/sounds/hit.mp3'),
			this.load.audio('point', '/sounds/point.mp3')
	}

	create() {

		this.setPipes()

		scoreText = this.add.text(10, 10, "SCORE: 0\nHIGH SCORE: " + highScore, { font: "18px Courier New", fill: "#ffffff" }).setDepth(3);

		flySound = this.sound;
		flySound.setVolume(0.3);

		const bg = this.add.image(0, 0, 'bg').setOrigin(0)
		bg.displayWidth = this.game.config.width
		bg.displayHeight = this.game.config.height

		playAgainBtn = this.add.image(this.game.config.width / 2, this.game.config.height / 2 + 100, 'playAgain').setDepth(3).setScale(2).setInteractive();
		playAgainBtn.on('pointerdown', () => {
			pipesSpeed = -100;
			distance = 150;
			score = 0;
			pipes = [];
			newPipes = [];
			key = true;
			pause = true;
			playAgainBtn.setVisible(false);
			this.scene.start('startScreen');
		});

		playAgainBtn.setVisible(false); // Початково ховаємо кнопку

		const ground1 = this.physics.add.sprite(0, game.config.height - 100, 'ground').setOrigin(0);
		ground1.displayWidth = this.game.config.width;
		ground1.displayHeight = 100;
		ground1.setDepth(3);
		ground1.setImmovable();
		ground1.body.setVelocityX(pipesSpeed / 2); // зміна швидкості землі

		const ground2 = this.physics.add.sprite(game.config.width, game.config.height - 100, 'ground').setOrigin(0); // додано новий спрайт землі
		ground2.displayWidth = this.game.config.width;
		ground2.displayHeight = 100;
		ground2.setDepth(3);
		ground2.setImmovable();
		ground2.body.setVelocityX(pipesSpeed / 2); // зміна швидкості землі

		this.tweens.add({
			targets: [ground1, ground2],
			x: '-=336', // відстань на яку потрібно змістити землю
			duration: 1800,
			repeat: -1
		});


		player = this.physics.add.sprite(this.game.config.width / 2, this.game.config.height / 2, 'bird').setOrigin(0.5);
		// розмір пташки
		player.setScale(2)
		// гравітація пташки
		player.setGravityY(GRAVITY)

		// послідновність дій
		this.physics.add.collider(player, [ground1, ground2], function (e) {
			key = false;
		});

		// клік - стрибок вгору
		this.input.on('pointerdown', function () {
			// звук на клік 
			flySound.play('fly');
			// rotate зображення пташки на клік
			player.angle = -30;
			player.setVelocityY(SPEED_UP);
			// повернення в звичайний стан зобрaження пташки
			setTimeout(() => {
				player.angle = 0
			}, 700);
		})

	}

	update() {

		for (let i = 0; i < pipes.length; i++) {
			// коли контакт з трубою - гейм овер
			this.physics.add.collider(pipes[i], player, function (e) {
				key = false;
			});
			if (pipes[i].x < 0) {

				newPipes.push(pipes[i])
				if (newPipes.length === 2) {
					setInterval(() => {
						this.setPipes()
					}, 1000)
				}
			}
		}

		let currentPipe;

		// якщо труба вже вийшла за межі екрану
		for (let i = pipes.length - 1; i >= 0; i--) {
			if (pipes[i].x < -pipes[i].width) {
				pipes.splice(i, 1);
			}
		}


		for (let i = 0; i < pipes.length; i++) {
			if (pipes[i].x < player.x && !pipes[i].scored) {
				pipes[i].scored = true;
				currentPipe = pipes[i];
			}
		}

		if (currentPipe && currentPipe !== lastScoredPipe) {
			this.sound.play('point');
			score++;
			scoreText.setText("SCORE: " + score);
			lastScoredPipe = currentPipe;

		}

		if (score > highScore) {
			highScore = score;
			localStorage.setItem("flappyHighScore", highScore);
			scoreText.setText("SCORE: " + score + "\nHIGH SCORE: " + highScore);
		}


		if (!key) {
			this.gameOver()
		}

	}

	setPipes() {
		// z-index: 2 для труб 
		let topPipe = this.physics.add.sprite(200, 200, 'bottomPipe').setDepth(2).setScale(1.5)
		let bottomPipe = this.physics.add.sprite(200, 200, 'topPipe').setDepth(2).setScale(1.5)
		this.positionPipes(topPipe, bottomPipe)
	}
	// позиціонування труб
	positionPipes(topPipe, bottomPipe) {
		distance += 200
		// random висоти відстані для прольоту
		let randomY = Phaser.Math.Between(-150, 150);
		topPipe.x = distance + 120;
		topPipe.y = randomY;

		bottomPipe.x = topPipe.x;
		bottomPipe.y = topPipe.y + 630;
		// рух труб вліво
		topPipe.setVelocityX(-100)
		bottomPipe.setVelocityX(-100)
		pipes.push(topPipe, bottomPipe)
	}

	gameOver() {
		player.angle = 30;
		if (score > highScore) {
			highScore = score;
		}
		if (pause) {
			pause = false;
			this.physics.pause();
			player.setTint(0xff0080);
			this.sound.play('faced');
			this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'gameOver').setDepth(3).setScale(2);
			scoreText.setText("SCORE: " + score + "\nHIGH SCORE: " + highScore);
			this.tweens.killAll(); // зупинити всі твіни в сцені
			playAgainBtn.setVisible(true);
		}
	}

}