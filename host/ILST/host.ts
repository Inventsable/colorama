function collectAllColors() {
  let taggedFills = get("pathItems")
    .filter((pathItem) => {
      return (
        pathItem.tags.length &&
        get("tags", pathItem).filter((tag) => {
          return /coloramafill/.test(tag.name);
        }).length > 0
      );
    })
    .map((pathItem) => {
      let targetTag = get("tags", pathItem).find((tag) => {
        return /coloramafill/.test(tag.name);
      });
      return {
        uuid: pathItem.uuid,
        tagName: targetTag.value,
        type: "fill",
        color: pathItem.fillColor.toHex(),
      };
    });
  let taggedStrokes = get("pathItems")
    .filter((pathItem) => {
      return (
        pathItem.tags.length &&
        get("tags", pathItem).filter((tag) => {
          return /coloramastroke/.test(tag.name);
        }).length > 0
      );
    })
    .map((pathItem) => {
      let targetTag = get("tags", pathItem).find((tag) => {
        return /coloramastroke/.test(tag.name);
      });
      return {
        uuid: pathItem.uuid,
        tagName: targetTag.value,
        type: "stroke",
        color: pathItem.strokeColor.toHex(),
      };
    });
  let fills = get("pathItems")
    .filter((pathItem) => {
      return (
        pathItem.filled &&
        /rgb/i.test(pathItem.fillColor.typename) &&
        !taggedFills.find((item) => {
          return item.uuid == pathItem.uuid;
        })
      );
    })
    .map((pathItem) => {
      return pathItem.fillColor.toHex();
    });
  let strokes = get("pathItems")
    .filter((pathItem) => {
      return (
        pathItem.stroked &&
        /rgb/i.test(pathItem.strokeColor.typename) &&
        !taggedStrokes.find((item) => {
          return item.uuid == pathItem.uuid;
        })
      );
    })
    .map((pathItem) => {
      return pathItem.strokeColor.toHex();
    });
  // This doesn't account for pre-existing tags
  return JSON.stringify({
    fills: fills,
    strokes: strokes,
    taggedFills: taggedFills,
    taggedStrokes: taggedStrokes,
  });
}

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

function reassignTagName(previous, updated, type) {
  findTags(previous, type).forEach((tag) => {
    tag.value = updated;
  });
}

function updateColorOfTag(name, type, color) {
  findPathItemByTag(name, type).forEach((pathItem) => {
    pathItem[type + "Color"] = new RGBColor().fromHex(color);
  });
}

function findPathItemByTag(name, type) {
  return get("pathItems").filter((pathItem) => {
    return get("tags", pathItem).find((tag) => {
      return new RegExp(type).test(tag.name) && tag.value == name;
    });
  });
}

function selectPathItemsByTagName(name, type) {
  app.selection = null;
  findPathItemByTag(name, type).forEach((pathItem) => {
    pathItem.selected = true;
  });
}

function getPathItemsByColor(color, type) {
  return get("pathItems").filter((pathItem) => {
    return (
      pathItem[type.replace(/e$/, "") + "ed"] &&
      /rgb/i.test(pathItem[type + "Color"].typename) &&
      pathItem[type + "Color"].toHex() == color
    );
  });
}

function selectPathItemsByColor(color, type) {
  app.selection = null;
  getPathItemsByColor(color, type).forEach((pathItem) => {
    pathItem.selected = true;
  });
}

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

console.log("Host is loaded");
