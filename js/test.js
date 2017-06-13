 game.time.events.repeat(Phaser.Timer.SECOND, 5, sizeDecay, this);

            function sizeDecay() {
                if (size != 1) {
                    size -= 1;
                    player.scale.setTo(size, size);
                }
            }