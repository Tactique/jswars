function initInputs(){
    // Low level input functions pass their events to the state handlers
    $(document).keydown(function(ev) {
        game.stateMap[game.currentState].keyboard(ev);
    });

    $(document).keyup(function(ev) {
        game.stateMap[game.currentState].keyboard(ev);
    });

    $(document).mousedown(function(ev) {
        game.stateMap[game.currentState].mouse(ev);
    });

    $(document).mouseup(function(ev) {
        game.stateMap[game.currentState].mouse(ev);
    });

    $(document).mousemove(function(ev) {
        game.stateMap[game.currentState].mouse(ev);
    });
}

function handleCameraKeyboard(ev) {
    if (keyCodeToChar[ev.keyCode] === "Left") {
        camera.move(-5, 0);
    }
    if (keyCodeToChar[ev.keyCode] === "Right") {
        camera.move(5, 0);
    }
    if (keyCodeToChar[ev.keyCode] === "Up") {
        camera.move(0, -5);
    }
    if (keyCodeToChar[ev.keyCode] === "Down") {
        camera.move(0, 5);
    }
}

function handleCameraMouse(ev) {
    console.log("camera");
    console.log(ev);
}

function handleUnitKeyboard(ev) {
    console.log("unit");
    console.log(ev);
}

function handleUnitMouse(ev) {
    console.log("unit");
    console.log(ev);
}
