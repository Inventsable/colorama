console.log("Host is online");
function collectAllColors() {
    var fills = get("pathItems")
        .filter(function (item) {
        return item.filled && /rgb/i.test(item.fillColor.typename);
    })
        .map(function (item) {
        return item.fillColor.toHex();
    });
    var strokes = get("pathItems")
        .filter(function (item) {
        return item.stroked && /rgb/i.test(item.strokeColor.typename);
    })
        .map(function (item) {
        return item.strokeColor.toHex();
    });
    // This doesn't account for pre-existing tags
    return JSON.stringify({
        fills: fills,
        strokes: strokes
    });
}
function assignTags(items) {
    alert("Hello?");
    items = JSON.parse(items);
    items.forEach(function (item) {
        var matches = get("pathItems").filter(function (pathItem) {
            return (pathItem[item.type.replace(/e$/, "") + "ed"] &&
                /rgb/i.test(pathItem[item.type + "Color"].typename) &&
                pathItem[item.type + "Color"].toHex() == item.color);
        });
        matches.forEach(function (match) {
            var tag = match.tags.add();
            tag.name = item.name;
            tag.value = item.value;
        });
    });
}
