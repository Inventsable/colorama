function collectAllColors() {
  let fills = get("pathItems")
    .filter((item) => {
      return item.filled && /rgb/i.test(item.fillColor.typename);
    })
    .map((item) => {
      return item.fillColor.toHex();
    });
  let strokes = get("pathItems")
    .filter((item) => {
      return item.stroked && /rgb/i.test(item.strokeColor.typename);
    })
    .map((item) => {
      return item.strokeColor.toHex();
    });
  // This doesn't account for pre-existing tags
  return JSON.stringify({
    fills: fills,
    strokes: strokes,
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
      let tag = match.tags.add();
      tag.name = item.name;
      tag.value = item.value;
    });
  });
}

function reassignTagName(previous, updated, type) {
  get("pathItems").forEach((pathItem) => {
    get("tags", pathItem)
      .filter((tag) => {
        return new RegExp(type).test(tag.name) && tag.value == previous;
      })
      .forEach((tag) => {
        tag.value = updated;
      });
  });
}

function updateColorOfTag(name, type, color) {
  get("pathItems")
    .filter((pathItem) => {
      return get("tags", pathItem).find((tag) => {
        return new RegExp(type).test(tag.name) && tag.value == name;
      });
    })
    .forEach((pathItem) => {
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
