function SpriteManager() {
    function addSprite(spriteName, url, srcPos, width, height, animRate, animSeq) {
        sprites[spriteName] = new Sprite(url, srcPos, width, height, animRate, animSeq);
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

    this.update = function(dt) {
        update(dt);
    }
}

function Sprite(url, srcPos, width, height, animRate, animSeq) {
    this.url = url;
    this.srcPos = srcPos;
    this.width = width;
    this.height = height;
    this.animRate = animRate != null ? animRate : 0;
    this.animSeq = this.animRate > 0 ? animSeq : [];

    this.update = function(dt) {
        currentTime -= dt;
        if (currentTime <= 0) {
            currentTime = this.animRate;
            currentFrame = (currentFrame + 1) % this.animSeq.length;
        }
    }

    this.getFramePosition = function() {
        if (this.animRate == 0) {
            return this.srcPos;
        }
        return this.animSeq[currentFrame];
    }

    currentTime = this.animRate;
    currentFrame = 0;
}
