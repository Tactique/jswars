function InputManager() {
    function initInputs(){
        $(document).keydown(function(ev) {
            handleKeyboard(ev);
        });

        $(document).keyup(function(ev) {
            handleKeyboard(ev);
        });

        $("#canvas_land").mousedown(function(ev) {
            handleMouse(ev);
        });

        $("#canvas_land").mouseup(function(ev) {
            handleMouse(ev);
        });

        $("#canvas_land").mousemove(function(ev) {
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
        app.stateMap[app.currentState].keyboard(keyboard);
        app.stateMap[app.currentState].mouse(mouse);
    }

    function processMouse() {
        app.stateMap[app.currentState].mouse(mouse);
    }

    function processKeyboard() {
        app.stateMap[app.currentState].keyboard(keyboard);
    }

    initInputs();

    var keyboard = new Keyboard();
    var mouse = new Mouse(gfx.width, gfx.height);

    this.processInputs = function() {
        processInputs();
    };

    this.processMouse = function() {
        processMouse();
    };

    this.processKeyboard = function() {
        processKeyboard();
    };

    function nop() {};

    this.callbacks = {
        unitSelected: nop,
        cellSelected: nop
    };
}


