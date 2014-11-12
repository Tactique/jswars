function handleCameraKeyboard(keyboard) {
    // if (game.selector !== null) {
    //     game.selectWorld(Math.floor(game.world.getWidth() / 2), Math.floor(game.world.getHeight() / 2));
    // }
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
    if (camMove.x != 0 || camMove.y != 0) {
        activeRenderer.invalidateAllLayers();
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
    if(mouse.lastState == mouseStates.LeftDown &&
       mouse.currentState == mouseStates.LeftUp) {
        assets.spriteManager.getSprite("selector").resetCurrentFrame();
        console.log("alleged mouse position", mouse.x, mouse.y);
        var wp = camera.transformToWorldSpace(mouse.x, mouse.y);
        console.log("alleged world position", wp);
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
    } else if (mouse.currentState == mouseStates.LeftDrag) {
        var camMove = {'x': -1*mouse.dx, 'y': -1*mouse.dy};
        mouse.dx = 0;
        mouse.dy = 0;
        camera.processMove(camMove);
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

// This is still hard coded to specific numbers, but that's hopefully temporary
Unit.prototype.checkInputs = function(keyboard) {
    for (var aid = 0; aid < this.attacks.length; aid++) {
        if (keyboard.ResetKeyDown(aid.toString())) {
            return aid;
        }
    }
    return undefined;
};

function handleUnitKeyboard(keyboard) {
    if (keyboard.ResetKeyDown("M")) {
        if (unitControlState.unit.player === myPlayer.id) {
            unitControlState.moving = true;
            unitControlState.moves = game.world.findAvailableMoves(unitControlState.unit);
            if (unitControlState.moving && unitControlState.path !== null) {
                network.sendUnitMove(unitControlState.unit, unitControlState.path);
            }
        } else {
            console.log("That's not your unit!");
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
    } else {
        if (unitControlState.unit) {
            var pressed = unitControlState.unit.checkInputs(keyboard);
            if (pressed !== undefined) {
                network.sendAttack(unitControlState.unit,
                                   unitControlState.targetUnit,
                                   pressed);
            }
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
