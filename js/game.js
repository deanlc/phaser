        var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
            preload: preload
            , create: create
            , update: update
        });
        // Game variables
        var score = 0;
        var size = 1;
        var loopCount = 0;
        var greenTime = 0;
        var health = 100;
        var player;
        var platform;
        var cursors;
        var stars;
        var bombs;
        var diamonds;
        var explosions;
        var button;
        var greenEnabled = false;
        var decaying = false;
        var dead = false;
        //text variables
        var scoreText;
        var greenText;
        var chanceText;
        var healthText;
        var stateText;
        var finalScore;
        var gameOver;
        //sound variables
        var s;
        var music;
        var musicA;
        var ramp;
        var boom;

        function preload() {
            game.load.image('sky', 'assets/stars.png');
            game.load.image('ground', 'assets/platform.png');
            game.load.image('diamond', 'assets/donut.gif');
            game.load.image('instructions', 'assets/instruction.png');
            game.load.image('page1', 'assets/page1.png');
            game.load.image('page2', 'assets/page2.png');
            game.load.image('gameover', 'assets/gameover.png');
//            game.load.spritesheet('dude', 'assets/dude1.png', 32, 48);
            game.load.spritesheet('dude', 'assets/sprite2.png', 29, 47);
            game.load.spritesheet('button', 'assets/start.png', 545, 130);
            game.load.spritesheet('howtoplay', 'assets/instructions.png', 545, 130);
            game.load.spritesheet('arrow', 'assets/arrow.png', 545, 130);
            game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
            game.load.spritesheet('meteor', 'assets/meteor4.png', 78, 109);
            game.load.spritesheet('starsprite', 'assets/starspriteGlow.png', 116, 112);
            game.load.spritesheet('greenstar', 'assets/greenstar.png', 116, 112);
            game.load.audio('music', ['assets/music/music1.mp3']);
            game.load.audio('music2', ['assets/music/music_2.mp3']);
            game.load.audio('ramp', ['assets/music/rampdown.mp3']);
            game.load.audio('boom', 'assets/music/boom.mp3');
        }

        function create() {
            game.world.setBounds(0, 0, 800, 600);
            game.physics.startSystem(Phaser.Physics.ARCADE);
            starfield = game.add.tileSprite(0, 0, 800, 600, 'sky');
            platforms = game.add.group();
            platforms.enableBody = true;
            button = game.add.button(game.world.centerX - 136, 200, 'button', play, this, 2, 1, 0);
            button.scale.setTo(0.5, 0.5);
            howtoplay = game.add.button(game.world.centerX - 136, 300, 'howtoplay', instructions, this, 2, 1, 0);
            howtoplay.scale.setTo(0.5, 0.5);
            resetButton = game.add.button(game.world.centerX - 136, 450, 'button', gameReset, this, 2, 1, 0);
            resetButton.scale.setTo(0.5, 0.5);
            resetButton.visible = false;
            //button action
            function play() {
                game.time.events.repeat(Phaser.Timer.SECOND, 600, rain, this);
                game.time.events.repeat(Phaser.Timer.SECOND, 600, random, this);
                game.time.events.repeat(Phaser.Timer.SECOND, 600, healthDecay, this);
                button.visible = false;
                howtoplay.visible = false;
                music.loopFull();
                music.volume = 1;
                ramp.volume = 1;
                instructions.visible = false;
                insButton.visible = false;
            }
            
            //instructions group
            instructions = game.add.group();
            gameOver = game.add.group();
            gameOver.create(0, 0, 'gameover');
            
            function instructions() {
                button.visible = false;
                howtoplay.visible = false;
                instructions.create(130, 0, 'instructions');
                instructions.scale.setTo(0.4, 0.4);
                //add sprites
                //yellow star
                var insStar = game.add.sprite(285, 65, 'starsprite');
                insStar.animations.add('starsprite');
                insStar.animations.play('starsprite', 8, true);
                insStar.scale.setTo(0.5, 0.5);
                //green star
                var insGreenStar = game.add.sprite(180, 140, 'greenstar');
                insGreenStar.animations.add('greenstar');
                insGreenStar.animations.play('greenstar', 8, true);
                insGreenStar.scale.setTo(0.5, 0.5);
                //donut
                var insDonut = game.add.sprite(125, 205, 'diamond');
                insDonut.scale.setTo(0.2, 0.2);
                //meteor
                var insMeteor = game.add.sprite(250, 422, 'meteor');
                insMeteor.animations.add('meteor');
                insMeteor.animations.play('meteor', 8, true);
                insMeteor.scale.setTo(0.8, 0.8);
                insMeteor.angle -= 90;
                insButton = game.add.button(game.world.centerX - 136, 450, 'button', insPlay, this, 2, 1, 0);
                insButton.scale.setTo(0.5, 0.5);

                function insPlay() {
                    game.time.events.repeat(Phaser.Timer.SECOND, 600, rain, this);
                    game.time.events.repeat(Phaser.Timer.SECOND, 600, random, this);
                    game.time.events.repeat(Phaser.Timer.SECOND, 600, healthDecay, this);
                    button.visible = false;
                    howtoplay.visible = false;
                    music.loopFull();
                    insButton.visible = false;
                    instructions.visible = false;
                    insStar.kill();
                    insGreenStar.kill();
                    insMeteor.kill();
                    insDonut.kill();
                }
            }
            //game over reset button
            function gameReset() {
                //reset the game
                dead = false;
                platforms.visible = true;
                health = 100;
                resetButton.visible = false;
                stateText.visible = false;
                finalScore.visible = false;
                //re-add the player
                player.alive = true;
                player.exists = true;
                player.visible = true;
                //reset score
                scoreText.visible = true;
                score = 0;
                scoreText.text = score;
            }
            // Create the platforms
            var ground = platforms.create(0, game.world.height - 60, 'ground');
            ground.scale.setTo(2, 2);
            ground.body.immovable = true;
            ground.alpha = 0.5;
            // The player & its settings
            player = game.add.sprite(game.world.centerX - 16, game.world.height - 150, 'dude');
            game.camera.follow(player);
            game.physics.arcade.enable(player);
            // Player physics
            player.body.bounce.y = 0.2;
            player.body.gravity.y = 500;
            player.body.collideWorldBounds = true;
            player.animations.add('left', [0, 1, 2], 5, true);
            player.animations.add('right', [5, 6, 7, 8], 5, true);
            cursors = game.input.keyboard.createCursorKeys();
            //  An explosion pool
            explosions = game.add.group();
            explosions.createMultiple(30, 'kaboom');
            explosions.forEach(setupStar, this);
            // Some stars
            stars = game.add.group();
            diamonds = game.add.group();
            bombs = game.add.group();
            greenStars = game.add.group();
            // We will enable physics for any star that is created in this group
            stars.enableBody = true;
            bombs.enableBody = true;
            greenStars.enableBody = true;
            diamonds.enableBody = true;
            //audio
            boom = game.add.audio('boom');
            music = game.add.audio('music');
            musicA = game.add.audio('music2');
            ramp = game.add.audio('ramp');

            function rain() {
                for (var i = 0; i < 10; i++) {
                    if (greenEnabled == false) {
                        // Create a star inside of the 'stars' group
                        var star = stars.create(Math.random() * 600, -100, 'starsprite');
                        // Let gravity do its thing
                        star.body.gravity.y = 100 + Math.random() * 400;
                        star.animations.add('starsprite');
                        star.animations.play('starsprite', 3, true);
                        star.outOfBoundsKill = true;
                        var starScale = 0.3 + Math.random() * 0.2;
                        star.scale.setTo(starScale, starScale);
                    }
                    if (greenEnabled == true) {
                        //green stars
                        // Create a star inside of the 'stars' group
                        var star = stars.create(Math.random() * 600, -100, 'greenstar');
                        // Let gravity do its thing
                        star.body.gravity.y = 100 + Math.random() * 400;
                        star.animations.add('greenstar');
                        star.animations.play('greenstar', 8, true);
                        var starScale = 0.3 + Math.random() * 0.2;
                        star.scale.setTo(starScale, starScale);
                    }
                }
            }

            function greenRain() {
                for (var i = 0; i < 10; i++) {
                    // Create a star inside of the 'stars' group
                    var greenStar = greenStars.create(Math.random() * 600, -100, 'greenstar');
                    // Let gravity do its thing
                    greenStar.body.gravity.y = 100 + Math.random() * 400;
                    greenStar.animations.add('greenstar');
                    greenStar.animations.play('greenstar', 8, true);
                    var greenScale = 0.3 + Math.random() * 0.2;
                    greenStar.scale.setTo(starScale, starScale);
                }
            }

            function healthDecay() {
                health -= 5;
            }

            function greenSpawn() {
                // Create a star inside of the 'stars' group
                var greenStar = greenStars.create(Math.random() * 600, -100, 'greenstar');
                // Let gravity do its thing
                greenStar.body.gravity.y = 100 + Math.random() * 400;
                greenStar.animations.add('greenstar');
                greenStar.animations.play('greenstar', 8, true);
            }

            function random() {
                var chance = Math.random() * 100;
                //                chanceText.text = 'Chance: ' + chance;
                if (chance < 7) {
                    for (var i = 0; i < 1; i++) {
                        var diamond = diamonds.create(Math.random() * 600, -100, 'diamond');
                        // Let gravity do its thing
                        diamond.body.gravity.y = 100 + Math.random() * 400;
                        // This just gives each star a slightly random bounce value
                        diamond.body.bounce.y = 0.7 + Math.random() * 0.2;
                        diamond.scale.setTo(0.3, 0.3);
                    }
                }
                // meteors if chance > 60 
                if (chance > 60) {
                    for (var i = 0; i < 4; i++) {
                        // Create a star inside of the 'stars' group
                        var bomb = bombs.create(100 + Math.random() * 600, -100, 'meteor');
                        bomb.animations.add('meteor');
                        bomb.animations.play('meteor', 7, true);
                        // Let gravity do its thing
                        bomb.body.gravity.y = 600 + Math.random() * 400;
                        //random size
                        var bombScale = 0.8 + Math.random() * 0.5;
                        bomb.scale.setTo(bombScale, bombScale);
                    }
                }
                // sideways meteors
                if (chance > 60 && chance < 70) {
                    for (var i = 0; i < 1; i++) {
                        // Create a star inside of the 'stars' group
                        var bomb = bombs.create(-100, 100 + Math.random() * 120, 'meteor');
                        bomb.animations.add('meteor');
                        bomb.animations.play('meteor', 7, true);
                        // Let gravity do its thing
                        bomb.body.velocity.x = 600 + Math.random() * 400;
                        bomb.angle -= 90;
                        //random size
                        var bombScale = 0.8 + Math.random() * 0.5;
                        bomb.scale.setTo(bombScale, bombScale);
                    }
                }
                if (chance > 70 && chance < 80) {
                    for (var i = 0; i < 1; i++) {
                        // Create a star inside of the 'stars' group
                        var bomb = bombs.create(900, 100 + Math.random() * 120, 'meteor');
                        bomb.animations.add('meteor');
                        bomb.animations.play('meteor', 7, true);
                        // Let gravity do its thing
                        bomb.body.velocity.x = -600 + Math.random() * 400;
                        bomb.angle += 90;
                        //random size
                        var bombScale = 0.8 + Math.random() * 0.5;
                        bomb.scale.setTo(bombScale, bombScale);
                    }
                }
                if (chance > 81 && chance < 85) {
                    if (greenEnabled == false) {
                        greenSpawn();
                    }
                }
            }

            function diamondrain() {
                for (var i = 0; i < 1; i++) {
                    var diamond = diamonds.create(Math.random() * 600, -100, 'diamond');
                    // Let gravity do its thing
                    diamond.body.gravity.y = 100 + Math.random() * 400;
                    // This just gives each star a slightly random bounce value
                    diamond.body.bounce.y = 0.7 + Math.random() * 0.2;
                    diamond.scale.setTo(2, 2);
                }
            }
            // The score
            scoreText = game.add.text(100, 555, '0', {
                fontSize: '32px'
                , fill: '#fff'
            });
            //Game Over screen
            stateText = game.add.text(game.world.centerX - 140, 180, 'Game Over!', {
                fontSize: '50px'
                , fill: '#fff'
            });
            finalScore = game.add.text(game.world.centerX - 30, 290, score, {
                fontSize: '100px'
                , fill: '#fff'
            });
            stateText.visible = false;
            finalScore.visible = false;

            function setupStar(star) {
                star.anchor.x = 0.5;
                star.anchor.y = 0.5;
                star.animations.add('kaboom');
            }

            function setupBomb(bomb) {
                bomb.anchor.x = 0.5;
                bomb.anchor.y = 0.5;
                bomb.animations.add('meteor');
            }
            var barConfig = {
                x: game.world.centerX
                , y: 570
            };
            this.myHealthBar = new HealthBar(this.game, barConfig);
        }

        function update() {
            this.myHealthBar.setPercent(health);
            if (health <= 0) {
                player.kill();
                dead = true;
                stars.callAll('kill');
                bombs.callAll('kill');
                greenTime = 0;
                gameOver.visible = true;
                scoreText.visible = false;
                finalScore.visible = true;
                finalScore.text = score;
                resetButton.visible = true;
                platforms.visible = false;
            } if (dead == false) {
                gameOver.visible = false;
            }
            starfield.tilePosition.y += 10;
            starfield.tilePosition.x += 5;
            // Collide the player and the stars with the platforms
            game.physics.arcade.collide(player, platforms);
            // Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
            game.physics.arcade.overlap(player, stars, collectStar, null, this);
            game.physics.arcade.overlap(player, greenStars, collectGreen, null, this);
            game.physics.arcade.overlap(platforms, stars, killStar, null, this);
            game.physics.arcade.overlap(platforms, bombs, bombKill, null, this);
            game.physics.arcade.overlap(player, diamonds, collectDiamond, null, this);
            game.physics.arcade.overlap(player, bombs, touchBomb, null, this);

            function killStar(platforms, star) {
                star.kill();
            }
            if (player.position.y > 494) {
                player.body.velocity.y = -350;
            }

            function bombKill(platforms, bomb) {
                bomb.kill();
                bomb.volume = 0.1;
                bomb.play();
                var explosion = explosions.getFirstExists(false);
                explosion.reset(bomb.body.x + 55, bomb.body.y + 55);
                explosion.play('kaboom', 30, false, true);
            }

            function collectStar(player, star) {
                // Removes the star from the screen
                star.kill();
                // Add and update the score
                score += 1;
                if (health < 100 && health > 1) {
                    health += (star.scale.x * 3);
                }
                scoreText.text = score;
            }

            function collectGreen(player, greenStars) {
                // Removes the star from the screen
                greenStars.kill();
                // Add and update the score
                score += 2;
                health += 3;
                scoreText.text = score;
                game.camera.flash(0x00ff44, 500);
                greenEnabled = true;
                greenTime += 10;
                greenText = game.add.text(700, 550, '0', {
                    fontSize: '32px'
                    , fill: 'rgba(0, 255, 147, 0.66)'
                });
                greenText.text = greenTime;
                greenText.visible = true;
                game.time.events.repeat(Phaser.Timer.SECOND, 10, greenTimer, this);
                //green star timer
                var greenSpriteTimer = game.add.sprite(740, 545, 'greenstar');
                greenSpriteTimer.animations.add('greenstar');
                greenSpriteTimer.animations.play('greenstar', 8, true);
                greenSpriteTimer.scale.setTo(0.45, 0.45);

                function greenTimer() {
                    if (greenTime != 0) {
                        greenSpriteTimer.visible = true;
                        greenTime -= 1;
                        greenText.text = greenTime;
                    }
                    if (greenTime == 0) {
                        greenText.text = greenTime;
                        game.camera.flash(0xfff500, 500);
                        greenEnabled = false;
                        greenText.visible = false;
                        greenSpriteTimer.visible = false;
                    }
                }
            } 

            function touchBomb(player, bomb) {
                bomb.kill();
                boom.play();
                //camera & flash
                function flash() {
                    //  You can set your own flash color and duration
                    game.camera.flash(0xff8400, 500);
                }
                var explosion = explosions.getFirstExists(false);
                explosion.reset(bomb.body.x + 55, bomb.body.y + 55);
                explosion.play('kaboom', 30, false, true);
                if (size == 1) {
                    health -= 35;
                    flash();
                    for (var i = 0; i < 4; i++) {
                        // Create a star inside of the 'stars' group
                        var bomb = bombs.create(100 + Math.random() * 600, -100, 'meteor');
                        bomb.animations.add('meteor');
                        bomb.animations.play('meteor', 7, true);
                        // Let gravity do its thing
                        bomb.body.gravity.y = 600 + Math.random() * 400;
                        //random size
                        var bombScale = 0.8 + Math.random() * 0.5;
                        bomb.scale.setTo(bombScale, bombScale);
                    }
                }
            }

            function collectDiamond(player, diamond) {
                //change music
                music.volume = 0;
                musicA.play();
                // Removes the diamond from the screen
                diamond.kill();
                // Add and update the score
                score += 10;
                scoreText.text = score;
                player.tint = 0x00a9ff;
                if (size < 8) {
                    size += 5;
                }
                if (size > 8) {
                    score += 10;
                }
                player.scale.setTo(size, size);
                //fix this
                var decayTimer = game.time.events.repeat(Phaser.Timer.SECOND, 10, diamondDecay, this);
                game.camera.flash(0x5ee3ff, 500);

                function diamondDecay() {
                    if (size != 1) {
                        size -= 0.5;
                        player.scale.setTo(size, size);
                        decay = true;
                    }
                    if (size == 1) {
                        musicA.pause;
                        music.volume = 1;
                        decaying = false;
                        player.tint = 0xffffff;
                    }
                }
            }
            // Reset the players velocity (movement)
            player.body.velocity.x = 0;
            if (cursors.left.isDown) {
                // Move to the left
                player.body.velocity.x = -500;
                player.animations.play('left');
            }
            else if (cursors.right.isDown) {
                // Move to the right
                player.body.velocity.x = 500;
                player.animations.play('right');
            }
            else {
                // Stand still
                player.animations.stop();
                player.frame = 3;
            }
            // Allow the player to jump ifthey are touching the ground.
            if (cursors.up.isDown && player.body.touching.down) {
                player.body.velocity.y = -350;
            }
            if (cursors.up.isDown && size != 1) {
                player.body.velocity.y = -350;
            }
        }