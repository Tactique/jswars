function SpriteManager() {
    function addSprite(spriteName, url, drawPos, sheetPos, width, height, animations, defaultAnimation, animate) {
        sprites[spriteName] = new Sprite(url, drawPos, sheetPos, width, height, animations, defaultAnimation, animate);
    }

    function cloneSprite(srcSpriteName, newSpriteName, newDrawPos) {
        var srcSprite = sprites[srcSpriteName];
        sprites[newSpriteName] = new Sprite(srcSprite.url,
                                            newDrawPos,
                                            srcSprite.sheetPos,
                                            srcSprite.width,
                                            srcSprite.height,
                                            srcSprite.animations,
                                            srcSprite.currentAnimation.name,
                                            true);
    }

    function getSprite(name) {
        return sprites[name];
    }

    function update(dt) {
        for (var key in sprites) {
            if (sprites.hasOwnProperty(key)) {
                sprites[key].update(dt);
            }
        }
    }

    function clearSprites() {
        for (var sprite in sprites) {
            if (sprites.hasOwnProperty(sprite)) {
                delete sprites[sprite];
            }
        }
    }

    sprites = {};

    this.addSprite = function(spriteName, url, drawPos, sheetPos, width, height, animations, defaultAnimation, animate) {
        return addSprite(spriteName, url, drawPos, sheetPos, width, height, animations, defaultAnimation, animate);
    };

    this.cloneSprite = function(srcSpriteName, newSpriteName, newDrawPos) {
        cloneSprite(srcSpriteName, newSpriteName, newDrawPos);
    };

    this.getSprite = function(name) {
        return getSprite(name);
    };

    this.update = function(dt) {
        update(dt);
    };

    this.clearSprites = function() {
        clearSprites();
    };
}

function Animation(name, rate, sequence) {
    this.name = name;
    this.rate = rate !== null ? rate : 0;
    this.sequence = this.rate > 0 ? sequence : [];
}

function Movement(start, end, rate) {
    this.start = start;
    this.end = end;
    this.rate = rate;
    this.dt = 0;
    this.currentPosition = {x: start.x, y: start.y};
    this.deltaVector = {x: end.x - start.x, y: end.y - start.y};

    this.update = function(dt) {
        this.dt += dt;
        var progress = this.dt / this.rate;
        if (progress >= 1.0) {
            this.currentPosition = this.end;
            return true;
        } else {
            this.currentPosition.x = this.start.x + (this.deltaVector.x * progress);
            this.currentPosition.y = this.start.y + (this.deltaVector.y * progress);
            return false;
        }
    };
}

function translatePathToMoves(path) {
    var moves = [];
    for (var i = 0; i < path.length - 1; i++) {
        var start = jQuery.extend(true, {}, path[i]);
        var end = jQuery.extend(true, {}, path[i + 1]);
        // end.y = start.y;
        moves.push(new Movement(start, end, 1000));
    }
    return moves;
}

function Sprite(url, drawPos, sheetPos, width, height, animations, currentAnimation, animate) {
    this.url = url;
    this.drawPos = drawPos;
    this.sheetPos = sheetPos;
    this.width = width;
    this.height = height;
    this.animate = animate !== null ? animate : false;
    this.animations = {};
    for (var key in animations) {
        if (animations.hasOwnProperty(key)) {
            var curAnim = animations[key];
            this.animations[key] = new Animation(key,
                                                 curAnim.rate,
                                                 curAnim.sequence);
        }
    }
    this.currentAnimation = currentAnimation !== undefined ? this.animations[currentAnimation] : new Animation("none", 0, []);
    this.movements = [];
    this.currentMovement = null;

    this.update = function(dt) {
        // Updates the sprite itself, ie running, standing, shooting
        if (this.animate) {
            this.currentTime -= dt;
            if (this.currentTime <= 0) {
                this.currentTime = this.currentAnimation.rate;
                this.currentFrame = (this.currentFrame + 1) % this.currentAnimation.sequence.length;
            }
        }
        // Physically moves the sprite in the world
        if (this.movements.length > 0 || this.currentMovement !== null) {
            if (this.currentMovement === null) {
                this.currentMovement = this.movements.shift();
            }
            var moveDone = this.currentMovement.update(dt);
            this.drawPos = this.currentMovement.currentPosition;
            if (moveDone) {
                if (this.movements.length > 0) {
                    this.currentMovement = this.movements.shift();
                } else {
                    this.currentMovement = null;
                }
            }
        }
    };

    this.getFramePosition = function() {
        if (this.currentAnimation.rate === 0 || !this.animate) {
            return this.sheetPos;
        }
        return this.currentAnimation.sequence[this.currentFrame];
    };

    this.resetCurrentFrame = function() {
        this.currentFrame = 0;
    };

    this.currentTime = this.currentAnimation.rate;
    this.currentFrame = 0;
}

function testMove() {
    var start = {x: 1, y: 2};
    var end = {x: 1, y: 3};
    var rate = 1000;
    sprites["0wizard0"].movements.push(new Movement(start, end, rate));
    start = {x: 1, y: 3};
    end = {x: 1, y: 4};
    sprites["0wizard0"].movements.push(new Movement(start, end, rate));
    start = {x: 1, y: 4};
    end = {x: 1, y: 5};
    sprites["0wizard0"].movements.push(new Movement(start, end, rate));
    start = {x: 1, y: 5};
    end = {x: 2, y: 5};
    sprites["0wizard0"].movements.push(new Movement(start, end, rate));
    // var secEnd = {x: end.x, y: end.y - 1};
    // sprites["0wizard0"].movements.push(new Movement(end, secEnd, rate));
}
