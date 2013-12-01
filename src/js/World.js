// This will eventually have much more information, including movement costs and such
function Cell(spriteName) {
    this.spriteName = spriteName;
}

// Units may deserve their own file eventually, as they will have to track
// attack and defense information for the various weapon types
function Unit(player, spriteName) {
    this.player = player;
    this.spriteName = spriteName;
}

function World(width, height) {

    function getWidth() {
        return w;
    }

    function getHeight() {
        return h;
    }

    function getCell(x, y) {
        return cells[x][y];
    }

    function initialize(entryCells) {
        if (entryCells.length == w && entryCells[0].length == h)
        {
            for (var x = 0; x < w; x++) {
                for (var y = 0; y < h; y++) {
                    cells[x][y] = entryCells[x][y];
                }
            }
        } else {
            console.log("World.initialize called with incorrect size");
        }
    }

    var w = width;
    var h = height;

    var cells = new Array(width);

    for (var x = 0; x < width; x++) {
        cells[x] = new Array(height);
    }

    this.getWidth = function() {
        return getWidth();
    }

    this.getHeight = function() {
        return getHeight();
    }

    this.getCell = function(x, y) {
        return getCell(x, y);
    }

    this.initialize = function(entryCells) {
        initialize(entryCells);
    }
}
