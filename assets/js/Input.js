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
        // This may not deal with the possibility of a moving window
        mouse.UpdatePosition(ev.clientX, ev.clientY);
        mouse.events.push(new MouseEvent(buttonCodeToChar[ev.which], ev.type));
    }

    function processInputs() {
        game.stateMap[game.currentState].keyboard(keyboard);
        game.stateMap[game.currentState].mouse(mouse, mouse.events.shift());
    }

    initInputs();

    keyboard = new Keyboard();
    mouse = new Mouse();

    this.processInputs = function() {
        processInputs();
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

function handleCameraMouse(mouse, last_ev) {
    // click and drag can definitely be better controlled via a real state machine
    if (mouse.ButtonDown("Left") && mouse.dx != 0 && mouse.dy != 0) {
        var camMove = {'x': mouse.dx, 'y': mouse.dy};
        mouse.dx = 0;
        mouse.dy = 0;
        camera.processMove(camMove);
    } else if (last_ev != null && last_ev.button == "Left" &&
        last_ev.action == "mouseup" && mouse.dx == 0 && mouse.dy == 0) {
        console.log(camera.transformToWorldSpace(mouse.x, mouse.y));
    }
}

function handleUnitKeyboard(keyboard) {
    
}

function handleUnitMouse(mouse) {

}
