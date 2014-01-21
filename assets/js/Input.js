function InputManager() {
    function initInputs(){
        $(document).keydown(function(ev) {
            handleKeyboard(ev);
        });

        $(document).keyup(function(ev) {
            handleKeyboard(ev);
        });

        $(document).mousedown(function(ev) {
            handleMouse(ev);
        });

        $(document).mouseup(function(ev) {
            handleMouse(ev);
        });

        $(document).mousemove(function(ev) {
            handleMouse(ev);
        });
    }

    function handleKeyboard(ev) {
        if (ev.type === "keydown") {
            keyboard[keyCodeToChar[ev.keyCode]] = true;
        } else if(ev.type === "keyup") {
            keyboard[keyCodeToChar[ev.keyCode]] = false;
        }
    }

    function handleMouse(ev) {
        if (ev.type === "mousedown") {
            mouse[buttonCodeToChar[ev.which]] = true;
        } else if (ev.type === "mouseup") {
            mouse[buttonCodeToChar[ev.which]] = false;
        }
        var canvas_off = canvas.offset();
        mouse.UpdatePosition(ev.clientX - canvas_off.left, ev.clientY - canvas_off.top);
        processMouse();
    }

    function processInputs() {
        game.stateMap[game.currentState].keyboard(keyboard);
        game.stateMap[game.currentState].mouse(mouse);
    }

    function processMouse() {
        game.stateMap[game.currentState].mouse(mouse);
    }

    function processKeyboard() {
        game.stateMap[game.currentState].keyboard(keyboard);
    }

    initInputs();

    keyboard = new Keyboard();
    mouse = new Mouse();

    this.processInputs = function() {
        processInputs();
    }

    this.processMouse = function() {
        processMouse();
    }

    this.processKeyboard = function() {
        processKeyboard();
    }
}

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
        if (game.world.withinWorld(wp.world_x, wp.world_y)) {
            game.selectWorld(wp.world_x, wp.world_y);
            var selectedUnit = game.world.findUnit(wp.world_x, wp.world_y);
            var selectedCell = game.world.getCell(wp.world_x, wp.world_y);
            if (selectedUnit) {
                game.currentState = "UNIT_CONTROL";
                unitControlState.unit = selectedUnit;
            } else {
                game.currentState = "CAMERA_CONTROL";
                unitControlState.unit = null;
            }
        }
    }
}

var unitControlState = {
    unit: null,
    moving: false,
    moves: null,
    path: null
}

function handleUnitKeyboard(keyboard) {
    if (keyboard.KeyDown("M")) {
        unitControlState.moving = true;
        unitControlState.moves = game.world.findAvailableMoves(unitControlState.unit);
    } else if (keyboard.KeyDown("Esc")) {
        unitControlState.moving = false;
        specialRenderer.removeLayer("moves");
        specialRenderer.removeLayer("path");
    }
}

function handleUnitMouse(mouse) {
    if (!unitControlState.moving) {
        handleCameraMouse(mouse);
    } else {
        if (mouse.lastState == mouseStates.LeftDown &&
            mouse.currentState == mouseStates.LeftUp) {
            var wp = camera.transformToWorldSpace(mouse.x, mouse.y);
            if (game.world.withinWorld(wp.world_x, wp.world_y)) {
                game.selectWorld(wp.world_x, wp.world_y);
                var goal = game.world.getCell(wp.world_x, wp.world_y);
                var path = routePath(unitControlState.unit, goal.position);
                unitControlState.path = path;
            }
        }
    }
}
