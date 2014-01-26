module("Keyboard tests");
test("Keyboard", function() {
    var keyboard = new Keyboard();

    ok(!keyboard.KeyDown("A"));
    ok(!keyboard.KeyDown("M"));
    ok(!keyboard.KeyDown(65));
    ok(!keyboard.KeyDown(77));

    keyboard["A"] = true;
    keyboard["M"] = true;

    ok(keyboard.KeyDown("A"));
    ok(keyboard.KeyDown("M"));
    ok(keyboard.KeyDown(65));
    ok(keyboard.KeyDown(77));    
});
