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

    }

    function processInputs() {
        game.stateMap[game.currentState].keyboard(keyboard);
        game.stateMap[game.currentState].mouse();
    }

    initInputs();

    keyboard = new Keyboard();
    // this.mouse = new Mouse();

    this.processInputs = function() {
        processInputs();
    }
}

function handleCameraKeyboard(keyboard) {
    var camMove = {'x': 0, 'y': 0};
    if (keyCodeToChar[ev.keyCode] === "Left") {
        camMove['x'] -= 5;
    }
    if (keyCodeToChar[ev.keyCode] === "Right") {
        camMove['x'] += 5;
    }
    if (keyCodeToChar[ev.keyCode] === "Up") {
        camMove['y'] -= 5;
    }
    if (keyCodeToChar[ev.keyCode] === "Down") {
        camMove['y'] += 5;
    }
    camera.processMove(camMove);
}

function handleCameraMouse(mouse) {
    
}

function handleUnitKeyboard(keyboard) {
    
}

function handleUnitMouse(mouse) {

}
