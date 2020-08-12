console.log("Host is online");

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
  alert("Hello?");
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
