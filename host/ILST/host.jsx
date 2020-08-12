function collectAllColors() {
    var taggedFills = get("pathItems")
        .filter(function (pathItem) {
        return (pathItem.tags.length &&
            get("tags", pathItem).filter(function (tag) {
                return /coloramafill/.test(tag.name);
            }).length > 0);
    })
        .map(function (pathItem) {
        var targetTag = get("tags", pathItem).find(function (tag) {
            return /coloramafill/.test(tag.name);
        });
        return {
            uuid: pathItem.uuid,
            tagName: targetTag.value,
            type: "fill",
            color: pathItem.fillColor.toHex()
        };
    });
    var taggedStrokes = get("pathItems")
        .filter(function (pathItem) {
        return (pathItem.tags.length &&
            get("tags", pathItem).filter(function (tag) {
                return /coloramastroke/.test(tag.name);
            }).length > 0);
    })
        .map(function (pathItem) {
        var targetTag = get("tags", pathItem).find(function (tag) {
            return /coloramastroke/.test(tag.name);
        });
        return {
            uuid: pathItem.uuid,
            tagName: targetTag.value,
            type: "stroke",
            color: pathItem.strokeColor.toHex()
        };
    });
    var fills = get("pathItems")
        .filter(function (pathItem) {
        return (pathItem.filled &&
            /rgb/i.test(pathItem.fillColor.typename) &&
            !taggedFills.find(function (item) {
                return item.uuid == pathItem.uuid;
            }));
    })
        .map(function (pathItem) {
        return pathItem.fillColor.toHex();
    });
    var strokes = get("pathItems")
        .filter(function (pathItem) {
        return (pathItem.stroked &&
            /rgb/i.test(pathItem.strokeColor.typename) &&
            !taggedStrokes.find(function (item) {
                return item.uuid == pathItem.uuid;
            }));
    })
        .map(function (pathItem) {
        return pathItem.strokeColor.toHex();
    });
    // This doesn't account for pre-existing tags
    return JSON.stringify({
        fills: fills,
        strokes: strokes,
        taggedFills: taggedFills,
        taggedStrokes: taggedStrokes
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
            if (get("tags", match).filter(function (targetTag) {
                return targetTag.value == item.value;
            }).length < 1) {
                var tag = match.tags.add();
                tag.name = item.name;
                tag.value = item.value;
            }
        });
    });
}
function reassignTagName(previous, updated, type) {
    findTags(previous, type).forEach(function (tag) {
        tag.value = updated;
    });
}
function updateColorOfTag(name, type, color) {
    findPathItemByTag(name, type).forEach(function (pathItem) {
        pathItem[type + "Color"] = new RGBColor().fromHex(color);
    });
}
function findPathItemByTag(name, type) {
    return get("pathItems").filter(function (pathItem) {
        return get("tags", pathItem).find(function (tag) {
            return new RegExp(type).test(tag.name) && tag.value == name;
        });
    });
}
function selectPathItemsByTagName(name, type, additive) {
    if (!additive)
        app.selection = null;
    findPathItemByTag(name, type).forEach(function (pathItem) {
        pathItem.selected = true;
    });
}
function getPathItemsByColor(color, type) {
    return get("pathItems").filter(function (pathItem) {
        return (pathItem[type.replace(/e$/, "") + "ed"] &&
            /rgb/i.test(pathItem[type + "Color"].typename) &&
            pathItem[type + "Color"].toHex() == color);
    });
}
function linkCurrentSelection(name, type) {
    get("selection")
        .filter(function (item) {
        return /pathitem/i.test(item.typename);
    })
        .forEach(function (pathItem) {
        var hasPrexisting = get("tags", pathItem).find(function (tag) {
            return new RegExp(type).test(tag.name);
        });
        if (hasPrexisting)
            hasPrexisting.value = name;
        else {
            var temp = pathItem.tags.add();
            temp.name = "colorama" + type;
            temp.value = name;
        }
    });
}
function selectPathItemsByColor(color, type, additive) {
    if (!additive)
        app.selection = null;
    getPathItemsByColor(color, type).forEach(function (pathItem) {
        pathItem.selected = true;
    });
}
function findTags(name, type) {
    var tags = [];
    findPathItemByTag(name, type).forEach(function (pathItem) {
        get("tags", pathItem)
            .filter(function (tag) {
            return new RegExp(type).test(tag.name) && tag.value == name;
        })
            .forEach(function (tag) {
            tags.push(tag);
        });
    });
    return tags;
}
function findAllColoramas() {
    return get("pathItems").filter(function (pathItem) {
        return (pathItem.tags.length &&
            get("tags", pathItem).filter(function (tag) {
                return new RegExp("colorama").test(tag.name);
            }).length);
    });
}
function scrubAllColors() {
    findAllColoramas().forEach(function (pathItem) {
        get("tags", pathItem)
            .filter(function (tag) {
            return new RegExp("colorama").test(tag.name);
        })
            .forEach(function (tag) {
            tag.remove();
        });
    });
}
console.log("Host is loaded");
