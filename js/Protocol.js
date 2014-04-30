function verifyStructure(template, struct) {
    for (var key in template) {
        if (!keyExists(key, struct)) {
            console.log("Could not find expected key:", key, "in provided structure");
            return false;
        } else {
            if (!compareType(template[key], struct[key])) {
                console.log("Unexpected type in struct.", "Template." + key, getType(template[key]), "!=", "struct." + key, getType(struct[key]));
                return false;
            }
            if (compareType(template[key], {})) {
                if (!verifyStructure(template[key], struct[key])) {
                    console.log("Failed to verify sub-object with key:", key);
                    return false;
                }
            } else if (compareType(template[key], [])) {
                var templateElement = template[key][0];
                var structElement = struct[key][0];
                if (!compareType(templateElement, structElement)) {
                    console.log("Unexpected type in array.", "Template." + key, getType(templateElement), "!=", "struct." + key, getType(structElement));
                    return false;
                }
                if (compareType(templateElement, {})) {
                    if (!verifyStructure(templateElement, structElement)) {
                        console.log("Failed to verify sub-object with key:", key);
                        return false;
                    }
                }
            }
        }
    }
    return true;
}

function compareType(struct1, struct2) {
    return getType(struct1) == getType(struct2);
}

function keyExists(key, struct) {
    return getType(struct[key]) != "[object Undefined]";
}

function getType(struct) {
    return Object.prototype.toString.call(struct);
}
