buttonCodeToChar = {1: "Left", 2: "Middle", 3: "Right"};
buttonCharToCode = {"Left": 1, "Middle": 2, "Right": 3};

function Mouse() {
    // It'd be good to get this info on construction
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;

    this.UpdatePosition = function(nx, ny) {
        this.dx = nx - this.x;
        this.dy = ny - this.y;
        this.x = nx;
        this.y = ny;
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
