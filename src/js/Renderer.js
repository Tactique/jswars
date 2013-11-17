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

function drawWorld(world) {

    drawGrid(world);
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

// should probably render the current state, not necessarily the world
function render() {
    clearBack();

    drawWorld(world);
}
