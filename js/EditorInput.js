function handleCameraKeyboard(keyboard) {
    if (keyboard.KeyDown("Shift") && app.selector) {
        var selectorPos = app.selector.pos;
        if (keyboard.ResetKeyDown("Left") &&
            selectorPos.x > 0) {
            selectorPos.x -= 1;
        }
        if (keyboard.ResetKeyDown("Right") &&
            selectorPos.x < app.world.getWidth() - 1) {
            selectorPos.x += 1;
        }
        if (keyboard.ResetKeyDown("Up") &&
            selectorPos.y > 0) {
            selectorPos.y -= 1;
        }
        if (keyboard.ResetKeyDown("Down") &&
            selectorPos.y < app.world.getHeight() - 1) {
            selectorPos.y += 1;
        }
        app.selectWorld(selectorPos.x, selectorPos.y);
        brush.position = selectorPos;
        brush.changeCell();
    } else {
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
    }
    if (keyboard.ResetKeyDown("C")) {
        if (brush.position) {
            brush.changeCell();
        }
    }
    if (keyboard.ResetKeyDown("=")) {
        camera.zoomIn();
    }
    if (keyboard.ResetKeyDown("-")) {
        camera.zoomOut();
    }
}

function handleCameraMouse(mouse) {
    if(mouse.currentState == mouseStates.LeftDown) {
        sprites["selector"].resetCurrentFrame();
        var wp = camera.transformToWorldSpace(mouse.x, mouse.y);
        if (app.world.withinWorld(wp.world_x, wp.world_y)) {
            app.selectWorld(wp.world_x, wp.world_y);
            brush.position = {x: wp.world_x, y: wp.world_y};
        }
    }
}

var brush = {
    position: null,
    type: null
}

brush.changeCell = function() {
    var cell = app.world.getCell(this.position.x, this.position.y);
    cell = this.type(this.position.x, this.position.y);
    app.world.setCell(this.position.x, this.position.y, cell);
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
