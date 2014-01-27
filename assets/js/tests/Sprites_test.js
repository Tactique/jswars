module("Sprites and SpriteManager tests");
test("SpriteManager test", function() {
    // this suffers from the same potential problem as the Camera, with closures,
    // and shit
    var spriteManager = new SpriteManager();
    var animations = {
        test: {
            rate: 10,
            sequence: [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 2, y: 0},
                {x: 3, y: 0}
            ]
        }
    }
    spriteManager.addSprite("test", "test.png", {x: 0, y: 0}, 10, 10,
                            animations, "test", true);
    var sprite = spriteManager.getSprite("test");
    equal(sprite.url, "test.png");
    deepEqual(sprite.srcPos, {x: 0, y: 0});
    deepEqual(sprite.getFramePosition(), {x: 0, y: 0});
    spriteManager.update(10);
    deepEqual(sprite.getFramePosition(), {x: 1, y: 0});
    spriteManager.update(10);
    deepEqual(sprite.getFramePosition(), {x: 2, y: 0});
    spriteManager.update(10);
    deepEqual(sprite.getFramePosition(), {x: 3, y: 0});
    spriteManager.update(10);
    deepEqual(sprite.getFramePosition(), {x: 0, y: 0});

    // cloneSprite is a deep copy, so changes to the new sprite should not
    // affect the old sprite
    spriteManager.cloneSprite("test", "testclone");
    var cloneSprite = spriteManager.getSprite("testclone");
    equal(sprite.url, cloneSprite.url);

    // with animate on the source sprite disabled, the updates which affect the
    // cloned sprite should not affect the source sprite
    sprite.animate = false;
    deepEqual(cloneSprite.srcPos, {x: 0, y: 0});
    deepEqual(cloneSprite.getFramePosition(), {x: 0, y: 0});
    spriteManager.update(10);
    deepEqual(cloneSprite.getFramePosition(), {x: 1, y: 0});
    deepEqual(sprite.getFramePosition(), {x: 0, y: 0});
    spriteManager.update(10);
    deepEqual(cloneSprite.getFramePosition(), {x: 2, y: 0});
    deepEqual(sprite.getFramePosition(), {x: 0, y: 0});
    spriteManager.update(10);
    deepEqual(cloneSprite.getFramePosition(), {x: 3, y: 0});
    deepEqual(sprite.getFramePosition(), {x: 0, y: 0});
    spriteManager.update(10);
    deepEqual(cloneSprite.getFramePosition(), {x: 0, y: 0});
    deepEqual(sprite.getFramePosition(), {x: 0, y: 0});

    // re-enabling animations for both sprites should cause them both to update
    sprite.animate = true;
    deepEqual(cloneSprite.srcPos, {x: 0, y: 0});
    deepEqual(cloneSprite.getFramePosition(), {x: 0, y: 0});
    spriteManager.update(10);
    deepEqual(cloneSprite.getFramePosition(), {x: 1, y: 0});
    deepEqual(sprite.getFramePosition(), {x: 1, y: 0});
    spriteManager.update(10);
    deepEqual(cloneSprite.getFramePosition(), {x: 2, y: 0});
    deepEqual(sprite.getFramePosition(), {x: 2, y: 0});
    spriteManager.update(10);
    deepEqual(cloneSprite.getFramePosition(), {x: 3, y: 0});
    deepEqual(sprite.getFramePosition(), {x: 3, y: 0});
    spriteManager.update(10);
    deepEqual(cloneSprite.getFramePosition(), {x: 0, y: 0});
    deepEqual(sprite.getFramePosition(), {x: 0, y: 0});

    // cleaning up after ourselves in the guise of a test...
    spriteManager.clearSprites();
    equal(spriteManager.getSprite("test"), null, "Cleaning up");
});
