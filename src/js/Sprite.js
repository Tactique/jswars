function Sprite(url, srcPos, width, height, animRate, animSeq) {
    this.url = url;
    this.srcPos = srcPos;
    this.width = width;
    this.height = height;
    this.animRate = animRate !== null ? animRate : 0;
    this.animSeq = this.animRate > 0 ? animSeq : [];

    this.update = function(dt) {
        currentTime -= dt;
        if (currentTime <= 0) {
            currentTime = this.animRate;
            currentFrame = (currentFrame + 1) % this.animSeq.length;
            console.log("flipped", this.animSeq[currentFrame]);
        }
    }

    currentTime = this.animRate;
    currentFrame = 0;
}
