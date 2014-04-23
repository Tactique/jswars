module("ArrayUtils test");
test("arrayContains", function() {
    var testArr = [1, 2, 3, 4, 5];
    var equality = function(a, b) { return a == b; }
    ok(arrayContains(testArr, 2, equality));
    ok(!arrayContains(testArr, 6, equality));
    ok(arrayContains(testArr, 2));
    ok(!arrayContains(testArr, 6));
    equal(null, arrayContains());
    equal(null, arrayContains(6));
});
