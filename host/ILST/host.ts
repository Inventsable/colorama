// Used for initial collection of colors by Panel.
//
// Collects all previous tagged items first, then all fills
// and strokes which have yet to be tagged.
function collectAllColors() {
  let taggedFills = getTaggedColor("fill");
  let taggedStrokes = getTaggedColor("stroke");
  return JSON.stringify({
    fills: getUntaggedColor("fill", taggedFills),
    strokes: getUntaggedColor("stroke", taggedStrokes),
    taggedFills: taggedFills,
    taggedStrokes: taggedStrokes,
  });
}

// Check if tagged items existed from prior session
// Return a slottable Object parallel to CEP UI's format
function getTaggedColor(type) {
  return get("pathItems")
    .filter((pathItem) => {
      return (
        pathItem.tags.length &&
        get("tags", pathItem).filter((tag) => {
          return new RegExp("colorama" + type).test(tag.name);
        }).length > 0
      );
    })
    .map((pathItem) => {
      let targetTag = get("tags", pathItem).find((tag) => {
        return new RegExp("colorama" + type).test(tag.name);
      });
      return {
        uuid: pathItem.uuid,
        tagName: targetTag.value,
        type: type,
        color: pathItem[type + "Color"].toHex(),
      };
    });
}

// Collect any unaccounted for fill or stroke
// Return hex color
function getUntaggedColor(type, parentArray) {
  return get("pathItems")
    .filter((pathItem) => {
      return (
        pathItem[type.replace(/e$/, "") + "ed"] &&
        /rgb/i.test(pathItem[type + "Color"].typename) &&
        !parentArray.find((item) => {
          return item.uuid == pathItem.uuid;
        })
      );
    })
    .map((pathItem) => {
      return pathItem[type + "Color"].toHex();
    });
}

// Immediately after the UI list mounts, the panel sends an array
// here so untagged items become tagged
function assignTags(items) {
  items = JSON.parse(items);
  items.forEach((item) => {
    let matches = get("pathItems").filter((pathItem) => {
      return (
        pathItem[item.type.replace(/e$/, "") + "ed"] &&
        /rgb/i.test(pathItem[item.type + "Color"].typename) &&
        pathItem[item.type + "Color"].toHex() == item.color
      );
    });
    matches.forEach((match) => {
      if (
        get("tags", match).filter((targetTag) => {
          return targetTag.value == item.value;
        }).length < 1
      ) {
        let tag = match.tags.add();
        tag.name = item.name;
        tag.value = item.value;
      }
    });
  });
}

// When a blur event is triggered on a controller input and the user
// has changed the name of the tag, the panel combs through and updates this name
function reassignTagName(previous, updated, type) {
  findTags(previous, type).forEach((tag) => {
    tag.value = updated;
  });
}

// When a user closes the Color Picker dialog, the associated tag will ripple
// through and update the color of each tagged item
function updateColorOfTag(name, type, color) {
  findPathItemByTag(name, type).forEach((pathItem) => {
    pathItem[type + "Color"] = new RGBColor().fromHex(color);
  });
}

// Shorthand to find associated items by tag
function findPathItemByTag(name, type) {
  return get("pathItems").filter((pathItem) => {
    return get("tags", pathItem).find((tag) => {
      return new RegExp(type).test(tag.name) && tag.value == name;
    });
  });
}

// Add tags of a particular item to selection
function selectPathItemsByTagName(name, type, additive) {
  if (!additive) app.selection = null;
  findPathItemByTag(name, type).forEach((pathItem) => {
    pathItem.selected = true;
  });
}

// Shorthand to find same color pathItems
function getPathItemsByColor(color, type) {
  return get("pathItems").filter((pathItem) => {
    return (
      pathItem[type.replace(/e$/, "") + "ed"] &&
      /rgb/i.test(pathItem[type + "Color"].typename) &&
      pathItem[type + "Color"].toHex() == color
    );
  });
}

// Add pathItems of same color to selection
function selectPathItemsByColor(color, type, additive) {
  if (!additive) app.selection = null;
  getPathItemsByColor(color, type).forEach((pathItem) => {
    pathItem.selected = true;
  });
}

// When the user clicks the link button, the selection is rewritten as current tag
function linkCurrentSelection(name, type) {
  get("selection")
    .filter((item) => {
      return /pathitem/i.test(item.typename);
    })
    .forEach((pathItem) => {
      let hasPrexisting = get("tags", pathItem).find((tag) => {
        return new RegExp(type).test(tag.name);
      });
      if (hasPrexisting) hasPrexisting.value = name;
      else {
        let temp = pathItem.tags.add();
        temp.name = "colorama" + type;
        temp.value = name;
      }
    });
}

// Shorthand to find all instances of a given tag within document
function findTags(name, type) {
  let tags = [];
  findPathItemByTag(name, type).forEach((pathItem) => {
    get("tags", pathItem)
      .filter((tag) => {
        return new RegExp(type).test(tag.name) && tag.value == name;
      })
      .forEach((tag) => {
        tags.push(tag);
      });
  });
  return tags;
}

// Shorthand to find any tag from this panel within document
function findAllColoramas() {
  return get("pathItems").filter((pathItem) => {
    return (
      pathItem.tags.length &&
      get("tags", pathItem).filter((tag) => {
        return new RegExp("colorama").test(tag.name);
      }).length
    );
  });
}

// Removes all tags from panel and reverts a document to original state
function scrubAllColors() {
  findAllColoramas().forEach((pathItem) => {
    get("tags", pathItem)
      .filter((tag) => {
        return new RegExp("colorama").test(tag.name);
      })
      .forEach((tag) => {
        tag.remove();
      });
  });
}

// Adding a console statement at the end ensures the script didn't silently fail
console.log("Host is loaded");
