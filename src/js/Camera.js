function Camera() {

    function _print() {
        console.log(x, y);
    }

    function _move(_x, _y) {
        x += _x;
        y += _y;
    }

    function getWidth() {
        return width;
    }

    function getHeight() {
        return height;
    }

    var x = 0;
    var y = 0;
    var width = gfx.width;
    var height = gfx.height;
    // var that = this;

    this.print = function() {
        return _print();
    }

    this.move = function(x, y) {
        return _move(x, y);
    }

    this.getWidth = function() {
        return getWidth();
    }

    this.getHeight = function() {
        return getHeight();
    }
}
