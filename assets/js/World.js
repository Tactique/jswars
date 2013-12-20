// This will eventually have much more information, including movement costs and such
function Cell(spriteName) {
    this.spriteName = spriteName;
}

// Units may deserve their own file eventually, as they will have to track
// attack and defense information for the various weapon types
function Unit(spriteName, pos) {
    this.spriteName = spriteName;
    this.pos = pos;
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
                    cells[x][y] = entryCells[y][x];
                }
            }
        } else {
            console.log("World.initialize called with incorrect size");
        }
    }

    // unit sprite's have to be cloned, so we have to wrap their creation
    function addUnit(player, srcSpriteName, pos) {
        if (units[player] == null) {
            units[player] = [];
        }
        var newSpriteName = player + srcSpriteName + units[player].length;
        assets.sprites.cloneSprite(srcSpriteName, newSpriteName);
        var newUnit = new Unit(newSpriteName, pos);
        units[player].push(newUnit);
    }

    // If player is null, this will return all units as a list
    function getUnits(player) {
        var output = [];
        for (var key in units) {
            if (units.hasOwnProperty(key)) {
                if (player == null || key == player) {
                    for (var i in units[key]) {
                        output.push(units[key][i]);
                    }
                }
            }
        }
        return output;
    }

    var w = width;
    var h = height;

    var cells = new Array(width);

    var units = {};

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

    this.addUnit = function(player, srcSpriteName, pos) {
        addUnit(player, srcSpriteName, pos);
    }

    this.getUnits = function(player) {
        return getUnits(player);
    }
}

function Plains() {
    return new Cell("plains");
}

var terrainTable = [
    Plains,
]

function terrainLookup(id) {
    // TODO This data should come from some JSON source on the server
    return new terrainTable[id];
}
