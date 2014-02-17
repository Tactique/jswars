function handleCameraKeyboard(keyboard) {
    var camMove = {'x': 0, 'y': 0};
    if (keyboard.KeyDown("Left")) {
        camMove['x'] -= 5;
    }
    if (keyboard.KeyDown("Right")) {
        camMove['x'] += 5;
    }
    if (keyboard.KeyDown("Up")) {
        camMove['y'] -= 5;
    }
    if (keyboard.KeyDown("Down")) {
        camMove['y'] += 5;
    }
    camera.processMove(camMove);
    if (keyboard.KeyDown("C")) {
        if (brush.position) {
            var cell = app.world.getCell(brush.position.x, brush.position.y);
            cell = brush.type(brush.position.x, brush.position.y);
            keyboard["C"] = false;
        }
    }
}

function handleCameraMouse(mouse) {
    if (mouse.currentState == mouseStates.LeftDrag) {
        var camMove = {'x': mouse.dx, 'y': mouse.dy};
        mouse.dx = 0;
        mouse.dy = 0;
        camera.processMove(camMove);
    } else if(mouse.lastState == mouseStates.LeftDown &&
              mouse.currentState == mouseStates.LeftUp) {
        sprites["selector"].resetCurrentFrame();
        var wp = camera.transformToWorldSpace(mouse.x, mouse.y);
        if (app.world.withinWorld(wp.world_x, wp.world_y)) {
            app.selectWorld(wp.world_x, wp.world_y);
            var selectedCell = app.world.getCell(wp.world_x, wp.world_y);
            brush.position = {x: wp.world_x, y: wp.world_y};
        }
    }
}

var brush = {
    position: null,
    type: terrainTable[terrainTypes.Plains]
}

// functions for handling the menu input go here:
// it might be nice to isolate this so we're not making the direct jQuery calls
// here
$(document).ready(function() {
    $("#cellType").change(function() {
        var newBrush = $("#cellType").find(":selected").text();
        brush.type = terrainTable[terrainTypes[newBrush]];
    });
});
