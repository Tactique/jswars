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
        if (zoomLevel < 10) {
            zoomLevel = 10;
        }
        if (zoomLevel > 500) {
            zoomLevel = 500;
        }
    }

    function zoomIn() {
        zoom(10);
    }

    function zoomOut() {
        zoom(-10);
    }

    function processMove(move) {
        _move(move.x, move.y);
    }

    function multZoomFactor(w, h) {
        return {
            cam_w : w * zoomLevel,
            cam_h : h * zoomLevel
        };
    }

    function transformToCameraSpace(w_x, w_y) {
        return {
            cam_x : Math.floor((w_x * zoomLevel) - x),
            cam_y : Math.floor((w_y * zoomLevel) - y)
        };
    }

    function transformToWorldSpace(c_x, c_y) {
        return {
            world_x : Math.floor((c_x + x) / zoomLevel),
            world_y : Math.floor((c_y + y) / zoomLevel)
        };
    }

    // This function does not account for the camera's x and y, because
    // it is assumed the coordinates passed in have already been transformed
    // to camera space
    function positionVisible(c_x, c_y) {
        return (c_x + zoomLevel >= 0 && c_x <= width) &&
               (c_y + zoomLevel >= 0 && c_y <= height);
    }

    function resizeViewport(w, h) {
        width = w;
        height = h;
    }

    // This function sets a destination for the camera to slide to over time
    function slideToPosition(sX, sY) {
        slideX = sX;
        slideY = sY;
        startX = x;
        startY = y;

        slideDt = 0;
    }

    // update slides the camera appropriately if a slide destination exists and
    // clears the slide destination if it's arrived
    function update(dt) {
        slideDt += dt;

        var dx = slideX - startX;
        var dy = slideY - startY;
        slideProgress = slideDt / slideRate;
        // if there's something to do, conveyed horribly
        if (!(dx == 0 && dy == 0)) {
            // I'm probably going to want to bezier this
            if (slideProgress >= 1.0) {
                x = slideX;
                y = slideY;
                startX = x;
                startY = y;
            } else {
                x = startX + (dx * slideProgress);
                y = startY + (dy * slideProgress);
                // don't do this for real, this should happen in whatever moves the camera
                // or maybe not? something will have to check if the camera is still moving
                if (activeRenderer) {
                    activeRenderer.invalidateAllLayers();
                }
            }
        }
    }

    var x = 0;
    var y = 0;
    var slideX = x;
    var slideY = y;
    var startX = x;
    var startY = y;
    var slideRate = 100;
    var slideDt = 0;
    var slideProgress = 0;
    var width = gfx.width;
    var height = gfx.height;
    var zoomLevel = 100;

    this.print = function() {
        return _print();
    };

    this.move = function(x, y) {
        return _move(x, y);
    };

    this.getWidth = function() {
        return getWidth();
    };

    this.getHeight = function() {
        return getHeight();
    };

    this.zoomIn = function() {
        return zoomIn();
    };

    this.zoomOut = function() {
        return zoomOut();
    };

    this.processMove = function(move) {
        processMove(move);
    };

    this.multZoomFactor = function(w, h) {
        return multZoomFactor(w, h);
    };

    this.transformToCameraSpace = function(w_x, w_y) {
        return transformToCameraSpace(w_x, w_y);
    };

    this.transformToWorldSpace = function(c_x, c_y) {
        return transformToWorldSpace(c_x, c_y);
    };

    this.positionVisible = function(c_x, c_y) {
        return positionVisible(c_x, c_y);
    };

    this.resizeViewport = function(width, height) {
        resizeViewport(width, height);
    }

    this.slideToPosition = function(x, y) {
        slideToPosition(x, y);
    }

    this.update = function(dt) {
        update(dt);
    }
}
