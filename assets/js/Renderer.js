var renderers = {
    "CAMERA_CONTROL": drawWorld,
    "UNIT_CONTROL": drawWorld,
    "MENU_CONTROL" : drawMenu
}

function clearBack() {
    gfx.ctx.fillStyle = "#FFFFFF";
    gfx.ctx.fillRect(0, 0, gfx.width, gfx.height);
}

function drawLine(sx, sy, dx, dy) {
    gfx.ctx.beginPath();
    gfx.ctx.moveTo(sx, sy);
    gfx.ctx.lineTo(dx, dy);
    gfx.ctx.stroke();
}

function drawMenu() {
    // TODO actually render something for the menu
}

function drawWorld() {
    drawEnvironment(game.world);

    drawUnits(game.world);

    drawGrid(game.world);

    drawSelector(game.selector);
}

function drawEnvironment(world) {
    for (var x = 0; x < world.getWidth(); x++) {
        for (var y = 0; y < world.getHeight(); y++) {
            var current_cell = world.getCell(x, y);
            drawSprite(x, y, current_cell.spriteName)
        }
    }
}

function drawUnits(world) {
    var units = world.getUnits();
    for (var i in units) {
        var position = units[i].pos;
        drawSprite(position['x'], position['y'], units[i].spriteName);
    }
}

function drawSelector(selector) {
    if (selector) {
        var position = selector.pos;
        drawSprite(position['x'], position['y'], selector.spriteName);
    }
}

function drawSprite(x, y, spriteName) {
    var cam_pos = camera.transformToCameraSpace(x, y);
    if (camera.positionVisible(cam_pos.cam_x, cam_pos.cam_y)) {
        var sprite = assets.spriteManager.getSprite(spriteName)
        var img = assets.get(sprite.url);
        var pos = sprite.getFramePosition();

        var rel_width = sprite.width / assets.spriteManager.minWidth;
        var rel_height = sprite.height / assets.spriteManager.minHeight;
        var cam_size = camera.multZoomFactor(rel_width, rel_height);
        var centered_offset = camera.multZoomFactor(rel_width - 1.0,
                                                    rel_height - 1.0);
        centered_offset.cam_w = centered_offset.cam_w / 2;
        centered_offset.cam_h = centered_offset.cam_h / 2;

        gfx.ctx.drawImage(img,
                          pos['x'], pos['y'],
                          sprite.width, sprite.height,
                          cam_pos.cam_x - centered_offset.cam_w,
                          cam_pos.cam_y - centered_offset.cam_h,
                          cam_size.cam_w, cam_size.cam_h);
    }
}

function drawGrid(world) {
    gfx.ctx.strokeStyle = "#000000";
    for (var x = 0; x <= world.getWidth(); x++) {
        var draw_x = camera.transformToCameraSpace(x, 0).cam_x;
        var top = camera.transformToCameraSpace(x, 0).cam_y;
        var bot = camera.transformToCameraSpace(x, world.getHeight()).cam_y;
        drawLine(draw_x, top, draw_x, bot);
    }

    for (var y = 0; y <= world.getHeight(); y++) {
        var draw_y = camera.transformToCameraSpace(0, y).cam_y;
        var left = camera.transformToCameraSpace(0, y).cam_x;
        var right = camera.transformToCameraSpace(world.getWidth(), y).cam_x;
        drawLine(left, draw_y, right, draw_y);
    }
}

function render() {
    clearBack();

    renderers[game.currentState]()
}
