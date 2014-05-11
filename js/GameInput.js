function handleCameraKeyboard(keyboard) {
    var camMove = {'x': 0, 'y': 0};
    if (keyboard.KeyDown("Left")) {
        camMove.x -= 5;
    }
    if (keyboard.KeyDown("Right")) {
        camMove.x += 5;
    }
    if (keyboard.KeyDown("Up")) {
        camMove.y -= 5;
    }
    if (keyboard.KeyDown("Down")) {
        camMove.y += 5;
    }
    camera.processMove(camMove);
    if (keyboard.ResetKeyDown("R")) {
        network.sendViewWorld();
    }
    if (keyboard.ResetKeyDown("E")) {
        network.sendTurn();
    }
}

function handleCameraMouse(mouse) {
    if (mouse.currentState == mouseStates.LeftDrag) {
        var camMove = {'x': -1*mouse.dx, 'y': -1*mouse.dy};
        mouse.dx = 0;
        mouse.dy = 0;
        camera.processMove(camMove);
    } else if(mouse.lastState == mouseStates.LeftDown &&
              mouse.currentState == mouseStates.LeftUp) {
        assets.spriteManager.getSprite("selector").resetCurrentFrame();
        var wp = camera.transformToWorldSpace(mouse.x, mouse.y);
        if (game.world.withinWorld(wp.world_x, wp.world_y)) {
            game.selectWorld(wp.world_x, wp.world_y);
            var selectedUnit = game.world.findUnit(wp.world_x, wp.world_y);
            var selectedCell = game.world.getCell(wp.world_x, wp.world_y);
            if (selectedUnit) {
                game.currentState = "UNIT_CONTROL";
                unitControlState.unit = selectedUnit;
                game.inputs.callbacks.unitSelected({x: mouse.x, y: mouse.y},
                                                   selectedUnit);
            } else {
                game.currentState = "CAMERA_CONTROL";
                game.inputs.callbacks.cellSelected({x: mouse.x, y: mouse.y},
                                                    selectedCell);
                unitControlState.unit = null;
            }
        }
    }
}

var unitControlState = {
    unit: null,
    targetUnit: null,
    moving: false,
    moves: null,
    attacking: null,
    path: null
};

unitControlState.reset = function() {
    unitControlState.moving = false;
    unitControlState.moves = null;
    unitControlState.attacking = null;
    unitControlState.path = null;
    specialRenderer.removeLayer("moves");
    specialRenderer.removeLayer("path");
    specialRenderer.removeLayer("attacks");
};

function handleUnitKeyboard(keyboard) {
    if (keyboard.ResetKeyDown("M")) {
        unitControlState.moving = true;
        unitControlState.moves = game.world.findAvailableMoves(unitControlState.unit);
        if (unitControlState.moving && unitControlState.path !== null) {
            network.sendUnitMove(unitControlState.unit, unitControlState.path);
        }
    } else if (keyboard.ResetKeyDown("A")) {
        if (unitControlState.targetUnit) {
            console.log("Press the id of the attack you would like to use");
        } else {
            console.log("Select a unit to trigger an attack, then press A again");
            unitControlState.attacking = true;
        }
    } else if (keyboard.ResetKeyDown("Esc")) {
        unitControlState.reset();
    } else if (keyboard.ResetKeyDown("E")) {
        network.sendTurn();
    } else if (keyboard.ResetKeyDown("0")) {
        if (unitControlState.targetUnit) {
            network.sendAttack(unitControlState.unit, unitControlState.targetUnit, 0);
        }
    }
}

function handleUnitMouse(mouse) {
    if (!unitControlState.moving && !unitControlState.attacking) {
        handleCameraMouse(mouse);
    } else {
        if (mouse.lastState == mouseStates.LeftDown &&
            mouse.currentState == mouseStates.LeftUp) {
            var wp = camera.transformToWorldSpace(mouse.x, mouse.y);
            if (game.world.withinWorld(wp.world_x, wp.world_y)) {
                game.selectWorld(wp.world_x, wp.world_y);
                var selectedUnit = game.world.findUnit(wp.world_x, wp.world_y);
                var selectedCell = game.world.getCell(wp.world_x, wp.world_y);
                if (selectedUnit) {
                    // probably need to verify you can actually attack the unit here
                    unitControlState.targetUnit = selectedUnit;
                } else if (selectedCell) {
                    var path = routePath(unitControlState.unit, selectedCell.position);
                    unitControlState.path = path;
                }
            }
        }
    }
}
