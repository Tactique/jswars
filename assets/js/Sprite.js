function SpriteManager() {
    function addSprite(spriteName, url, srcPos, width, height, animRate, animSeq, animate) {
        sprites[spriteName] = new Sprite(url, srcPos, width, height, animRate, animSeq, animate);
    }

    function cloneSprite(srcSpriteName, newSpriteName) {
        var srcSprite = sprites[srcSpriteName];
        sprites[newSpriteName] = new Sprite(srcSprite.url,
                                            srcSprite.srcPos,
                                            srcSprite.width,
                                            srcSprite.height,
                                            srcSprite.animRate,
                                            srcSprite.animSeq,
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

    sprites = {};

    this.addSprite = function(spriteName, url, srcPos, width, height, animRate, animSeq) {
        return addSprite(spriteName, url, srcPos, width, height, animRate, animSeq);
    }

    this.cloneSprite = function(srcSpriteName, newSpriteName) {
        cloneSprite(srcSpriteName, newSpriteName);
    }

    this.getSprite = function(name) {
        return getSprite(name);
    }

    this.update = function(dt) {
        update(dt);
    }
}

function Sprite(url, srcPos, width, height, animRate, animSeq, animate) {
    this.url = url;
    this.srcPos = srcPos;
    this.width = width;
    this.height = height;
    this.animRate = animRate != null ? animRate : 0;
    this.animSeq = this.animRate > 0 ? animSeq : [];
    this.animate = animate != null ? animate : false;

    this.update = function(dt) {
        if (this.animate) {
            this.currentTime -= dt;
            if (this.currentTime <= 0) {
                this.currentTime = this.animRate;
                this.currentFrame = (this.currentFrame + 1) % this.animSeq.length;
            }
        }
    }

    this.getFramePosition = function() {
        if (this.animRate == 0 || !this.animate) {
            return this.srcPos;
        }
        return this.animSeq[this.currentFrame];
    }

    this.currentTime = this.animRate;
    this.currentFrame = 0;
}
