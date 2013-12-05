buttonCodeToChar = {1: "Left", 2: "Middle", 3: "Right"};
buttonCharToCode = {"Left": 1, "Middle": 2, "Right": 3};

function Mouse() {
    // It'd be good to get this info on construction
    this.x = -1;
    this.y = -1;
    this.dx = 0;
    this.dy = 0;

    this.UpdatePosition = function(nx, ny) {
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
        }
    }

    this.ButtonDown = function(button) {
        if (button instanceof Number) {
            button = buttonCodeToChar(button);
        }
        if (this[button] == false || this[button] == null) {
            return false;
        }
        return true;
    }
}
