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


