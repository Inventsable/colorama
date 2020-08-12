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
function reassignTagName(previous, updated, type) {
    get("pathItems").forEach(function (pathItem) {
        get("tags", pathItem)
            .filter(function (tag) {
            return new RegExp(type).test(tag.name) && tag.value == previous;
        })
            .forEach(function (tag) {
            tag.value = updated;
        });
    });
}
function updateColorOfTag(name, type, color) {
    get("pathItems")
        .filter(function (pathItem) {
        return get("tags", pathItem).find(function (tag) {
            return new RegExp(type).test(tag.name) && tag.value == name;
        });
    })
        .forEach(function (pathItem) {
        pathItem[type + "Color"] = new RGBColor().fromHex(color);
    });
}
// function findPathItemsOfGivenTypeAndTag(type, name) {
//   return get("pathItems").filter((pathItem) => {
//     return (
//       get("tags", pathItem).length &&
//       get("tags", pathItem).filter((tag) => {
//         return new RegExp(type).test(tag.name) && tag.value == name;
//       })
//     );
//   });
// }
// function findAllTagsOfGivenName(type, name) {
//   return get("pathItems")
//     .filter((pathItem) => {
//       return (
//         get("tags", pathItem).length &&
//         get("tags", pathItem).filter((tag) => {
//           return new RegExp(type).test(tag.name) && tag.value == name;
//         })
//       );
//     })
//     .map((item) => {
//       return get("tags", pathItem).filter((tag) => {
//         return new RegExp(type).test(tag.name) && tag.value == name;
//       });
//     });
// }
console.log("Host is loaded");
