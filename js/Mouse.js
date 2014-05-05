buttonCodeToChar = {1: "Left", 2: "Middle", 3: "Right"};
buttonCharToCode = {"Left": 1, "Middle": 2, "Right": 3};
mouseStates = Object.freeze({Idle: "Idle", Moving: "Moving",
                             LeftDown: "LeftDown",
                             LeftUp: "LeftUp",
                             LeftDrag: "LeftDrag"});

function Mouse(testing) {
    // It'd be good to get this info on construction
    this.x = -1;
    this.y = -1;
    this.dx = 0;
    this.dy = 0;
    this.timeout = null;
    if (testing) {
        this.StoppedMoving = null;
    }


    this.currentState = mouseStates.Idle;
    this.lastState = mouseStates.Idle;

    this.UpdatePosition = function(nx, ny) {
        clearTimeout(this.timeout);
        // It's impossible to know where the mouse is when it's first created,
        // before a mousemove event is fired. If we do nothing the initial
        // dx and dy are incorrect, so we hack this to not update the dx and dy
        // till we've gotten one mousemove
        if (this.x == -1 && this.y == -1) {
            this.x = nx;
            this.y = ny;
        } else {
            this.dx = nx - this.x;
            this.dy = ny - this.y;
            this.x = nx;
            this.y = ny;
            this.UpdateState();
        }
        this.timeout = setTimeout(this.StoppedMoving, 100);
    };

    this.UpdateState = function() {
        this.lastState = this.currentState;
        switch (this.currentState) {
        case mouseStates.Idle:
            if (this.dx !== 0 || this.dy !== 0) {
                if (this.ButtonDown("Left")) {
                    this.currentState = mouseStates.LeftDrag;
                } else {
                    this.currentState = mouseStates.Moving;
                }
            } else {
                if (this.ButtonDown("Left")) {
                    this.currentState = mouseStates.LeftDown;
                }
            }
            break;
        case mouseStates.Moving:
            if (this.dx === 0 && this.dy === 0) {
                this.currentState = mouseStates.Idle;
            } else {
                if (this.ButtonDown("Left")) {
                    this.currentState = mouseStates.LeftDrag;
                }
            }
            break;
        case mouseStates.LeftDown:
            if ((Math.abs(this.dx) >= 10 || Math.abs(this.dy)) >= 10 &&
                this.ButtonDown("Left")) {
                this.currentState = mouseStates.LeftDrag;
            } else if (!this.ButtonDown("Left")) {
                this.currentState = mouseStates.LeftUp;
            }
            break;
        case mouseStates.LeftUp:
            if (this.dx !== 0 || this.dy !== 0) {
                this.currentState = mouseStates.Moving;
            } else {
                this.currentState = mouseStates.Idle;
            }
            break;
        case mouseStates.LeftDrag:
            if (this.dx === 0 && this.dy === 0) {
                if (!this.ButtonDown("Left")) {
                    this.currentState = mouseStates.LeftUp;
                }
            }
            break;
        }
    };

    this.ButtonDown = function(button) {
        if (typeof(button) == "number") {
            button = buttonCodeToChar(button);
        }
        if (this[button] === false || this[button] === undefined) {
            return false;
        }
        return true;
    };

    function StoppedMoving() {
        this.dx = 0;
        this.dy = 0;
        this.UpdateState();
    }

    this.StoppedMoving = StoppedMoving.bind(this);
}

