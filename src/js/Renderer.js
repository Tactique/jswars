var drawLine = function(sx, sy, dx, dy) {
    gfx.ctx.beginPath();
    gfx.ctx.moveTo(sx, sy);
    gfx.ctx.lineTo(dx, dy);
    gfx.ctx.stroke();
}

var drawWorld = function(world) {

    drawGrid(world);
}

var drawGrid = function(world) {

    for (var x = 0; x <= world.getWidth(); x++) {
        var cell_x = (camera.getWidth() / world.getWidth()) * x;
        drawLine(cell_x, 0, cell_x, camera.getHeight());
    }

    for (var y = 0; y <= world.getHeight(); y++) {
        var cell_y = (camera.getHeight() / world.getHeight()) * y;
        drawLine(0, cell_y, camera.getWidth(), cell_y);
    }
}
