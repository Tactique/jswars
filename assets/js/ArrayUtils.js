function arrayContains(array, desired, equality) {
    if (array == null || !(array instanceof Array)) {
        return null;
    }
    if (equality == null) {
        equality = function(a, b) { return a == b; }
    }
    for (var i = array.length - 1; i >= 0; i--) {
        if (equality(array[i], desired)) {
            return array[i];
        }
    };
    return null;
}
