function arrayContains(array, desired, equality) {
    if (array === null || !(array instanceof Array)) {
        return null;
    }
    if (equality === null) {
        equality = function(a, b) { return a == b; };
    }
    for (var i = array.length - 1; i >= 0; i--) {
        if (equality(array[i], desired)) {
            return array[i];
        }
    }
    return null;
}

function set2DCorners(array, size, value) {
    size = size - 1;
    array[0][0] = value;
    array[0][size] = value;
    array[size][0] = value;
    array[size][size] = value;
}

function objectifyUndefined(array) {
    for (var y = 0; y < array.length; y++) {
        for (var x = 0; x < array[y].length; x++) {
            if (array[x][y] === undefined) {
                array[x][y] = {};
            }
        }
    }
}

