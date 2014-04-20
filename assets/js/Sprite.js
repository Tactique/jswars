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
    }

    this.cloneSprite = function(srcSpriteName, newSpriteName, newDrawPos) {
        cloneSprite(srcSpriteName, newSpriteName, newDrawPos);
    }

    this.getSprite = function(name) {
        return getSprite(name);
    }

    this.update = function(dt) {
        update(dt);
    }

    this.clearSprites = function() {
        clearSprites();
    }
}

function Animation(name, rate, sequence) {
    this.name = name;
    this.rate = rate != null ? rate : 0;
    this.sequence = this.rate > 0 ? sequence : [];
}

function Sprite(url, drawPos, sheetPos, width, height, animations, currentAnimation, animate) {
    this.url = url;
    this.drawPos = drawPos;
    this.sheetPos = sheetPos;
    this.width = width;
    this.height = height;
    this.animate = animate != null ? animate : false;
    this.animations = {};
    for (var key in animations) {
        if (animations.hasOwnProperty(key)) {
            var curAnim = animations[key];
            this.animations[key] = new Animation(key,
                                                 curAnim.rate,
                                                 curAnim.sequence);
        }
    }
    this.currentAnimation = currentAnimation != null ? this.animations[currentAnimation] : new Animation("none", 0, []);

    this.update = function(dt) {
        if (this.animate) {
            this.currentTime -= dt;
            if (this.currentTime <= 0) {
                this.currentTime = this.currentAnimation.rate;
                this.currentFrame = (this.currentFrame + 1) % this.currentAnimation.sequence.length;
            }
        }
    }

    this.getFramePosition = function() {
        if (this.currentAnimation.rate == 0 || !this.animate) {
            return this.sheetPos;
        }
        return this.currentAnimation.sequence[this.currentFrame];
    }

    this.resetCurrentFrame = function() {
        this.currentFrame = 0;
    }

    this.currentTime = this.currentAnimation.rate;
    this.currentFrame = 0;
}
