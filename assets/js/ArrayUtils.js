function arrayContains(array, desired, equality) {
    for (var i = array.length - 1; i >= 0; i--) {
        if (equality(array[i], desired)) {
            return array[i];
        }
    };
    return null;
}
