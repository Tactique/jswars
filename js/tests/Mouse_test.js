module("Mouse tests");
test("Mouse", function() {
    var mouse = new Mouse();

    equal(mouse.dx, 0);
    equal(mouse.dy, 0);
    equal(mouse.x, -1);
    equal(mouse.y, -1);

    mouse.UpdatePosition(15, 15);

    equal(mouse.dx, 0);
    equal(mouse.dy, 0);
    equal(mouse.x, 15);
    equal(mouse.y, 15);

    mouse.UpdatePosition(20, 20);

    equal(mouse.dx, 5);
    equal(mouse.dy, 5);
    equal(mouse.x, 20);
    equal(mouse.y, 20);    
});

test("Mouse state machine", function() {
    // passing true disables the StoppedMoving timeout
    var mouse = new Mouse(true);

    equal(mouseStates.currentState, mouse.Idle);

    mouse.UpdatePosition(15, 15);
    // The mouse's first move is a bit of a hack, and does not update the
    // state machine
    equal(mouseStates.currentState, mouse.Idle);
    mouse.UpdatePosition(20, 20);
    equal(mouseStates.currentState, mouse.Moving);
    mouse.StoppedMoving();
    equal(mouseStates.currentState, mouse.Idle);

    mouse["Left"] = true;
    mouse.UpdatePosition(20, 20);
    equal(mouseStates.currentState, mouse.LeftDown);
    mouse.UpdatePosition(50, 50);
    equal(mouseStates.currentState, mouse.LeftDrag);
    mouse.StoppedMoving();
    equal(mouseStates.currentState, mouse.LeftDrag);
    mouse["Left"] = false;
    equal(mouseStates.currentState, mouse.LeftUp);

    mouse["Left"] = true;
    mouse.UpdatePosition(50, 50);
    equal(mouseStates.currentState, mouse.LeftDown);
    mouse["Left"] = false;
    equal(mouseStates.currentState, mouse.LeftUp);  
});
