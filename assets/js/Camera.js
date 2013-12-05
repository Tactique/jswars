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

    function zoom(factor) {
        zoomLevel += factor;
    }

    function zoomIn() {
        zoom(10);
    }

    function zoomOut() {
        zoom(-10);
    }

    function processMove(move) {
        _move(move['x'], move['y']);
    }

    function multZoomFactor(w, h) {
        return {
            cam_w : w * zoomLevel,
            cam_h : h * zoomLevel
        }
    }

    function transformToCameraSpace(w_x, w_y) {
        return {
            cam_x : (w_x * zoomLevel) - x,
            cam_y : (w_y * zoomLevel) - y
        }
    }

    function transformToWorldSpace(c_x, c_y) {
        return {
            world_x : Math.floor((c_x + x) / zoomLevel),
            world_y : Math.floor((c_y + y) / zoomLevel)
        }
    }

    var x = 0;
    var y = 0;
    var width = gfx.width;
    var height = gfx.height;
    var zoomLevel = 100;
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

    this.zoomIn = function() {
        return zoomIn();
    }

    this.zoomOut = function() {
        return zoomOut();
    }

    this.processMove = function(move) {
        processMove(move);
    }

    this.multZoomFactor = function(w, h) {
        return multZoomFactor(w, h);
    }

    this.transformToCameraSpace = function(w_x, w_y) {
        return transformToCameraSpace(w_x, w_y);
    }

    this.transformToWorldSpace = function(c_x, c_y) {
        return transformToWorldSpace(c_x, c_y);
    }
}
