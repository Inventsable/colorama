<template>
  <div id="app">
    <Menus refresh debug />
    <Watcher v-model="selectionLength" property="app.selection.length" />
    <Panel script-path="./host/[appName]/">
      <Wrapper>
        <Grid>
          <Button
            icon="palette"
            evalScript="collectAllColors()"
            tooltip="Generate controllers"
            @evalScript="reportResult"
          />
          <Button
            icon="trash-can-outline"
            :disabled="list.length < 1"
            evalScript="scrubAllColors()"
            tooltip="Delete all colors"
            @evalScript="resetUI"
          />
        </Grid>
        <div class="list-item" v-for="(item, i) in list" :key="i">
          <Button flat disabled>
            <Icons :name="item.type" />
          </Button>
          <Color-Picker
            v-model="item.color"
            @update="updateColor(item, $event)"
          />
          <Input
            flat
            v-model="item.tagName"
            placeholder="Tag title"
            auto-select
            @update="updateTag(item, $event)"
          />
          <div style="padding: 5px;" />

          <Button
            icon="tag-plus"
            flat
            tooltip="Select by tag"
            @clickevt="selectByTagName(item, $event)"
          />
          <Button
            icon="select-all"
            flat
            tooltip="Select by color"
            @clickevt="selectByColor(item, $event)"
          />
          <Button
            icon="link"
            :disabled="!hasSelection"
            flat
            tooltip="Link current selection"
            :evalScript="
              `linkCurrentSelection('${item.tagName}', '${item.type}')`
            "
          />
        </div>
      </Wrapper>
    </Panel>
  </div>
</template>

<script>
import { evalScript } from "brutalism";
export default {
  components: {
    Icons: require("@/components/Icons.vue").default,
  },
  data: () => ({
    hex: "#ff0000",
    tagName: "test",
    selectionLength: 0,
    fills: [],
    taggedFills: [],
    strokes: [],
    taggedStrokes: [],
  }),
  computed: {
    list() {
      let list = [];
      list = [].concat(this.taggedFills, this.fills);
      list = [].concat(list, this.taggedStrokes);
      return [].concat(list, this.strokes);
    },
    hasSelection() {
      return this.selectionLength > 0;
    },
  },
  methods: {
    resetUI() {
      this.fills = this.strokes = this.taggedFills = this.taggedStrokes = [];
    },
    async reportResult(evt) {
      // console.log(evt);

      this.taggedFills = this.removeObjectDuplicates(
        evt.taggedFills,
        "tagName"
      ).map((item) => {
        return this.constructItem("fill", item);
      });
      this.taggedStrokes = this.removeObjectDuplicates(
        evt.taggedStrokes,
        "tagName"
      ).map((item) => {
        return this.constructItem("stroke", item);
      });
      this.fills = this.removePrimitiveDuplicates(evt.fills)
        .map((val) => {
          let alreadyExists = this.taggedFills.find((item) => {
            return item.tagName == val;
          });
          return alreadyExists ? val + " copy" : val;
        })
        .map((val) => this.constructItem("fill", val));
      this.strokes = this.removePrimitiveDuplicates(evt.strokes).map((val) =>
        this.constructItem("stroke", val)
      );
      await this.assignTags();
      // Assign!
    },
    removePrimitiveDuplicates(items) {
      return !items.length ? [] : [...new Set(items)];
    },
    removeObjectDuplicates(a, param) {
      return a.filter((item, pos, array) => {
        return (
          array
            .map((mapItem) => {
              return mapItem[param];
            })
            .indexOf(item[param]) === pos
        );
      });
    },
    async selectByTagName(item, event) {
      console.log(event);
      await evalScript(
        `selectPathItemsByTagName('${item.tagName}', '${
          item.type
        }', ${+event.shiftKey})`
      );
    },
    async selectByColor(item, event) {
      console.log(event.shiftKey);
      await evalScript(
        `selectPathItemsByColor('${item.color}', '${
          item.type
        }', ${+event.shiftKey})`
      );
    },
    constructItem(type, value) {
      console.log(value);
      if (/string/i.test(typeof value))
        return {
          type: type,
          tagName: value,
          previousName: value,
          dirty: false,
          color: value.replace(" copy", ""),
        };
      else
        return {
          type: value.type,
          tagName: value.tagName,
          previousName: value.tagName,
          dirty: false,
          color: value.color,
        };
    },
    async assignTags() {
      let msg = this.list.map((item) => {
        return {
          name: `colorama${item.type}`,
          value: item.tagName,
          color: item.color,
          type: item.type,
        };
      });
      await evalScript(`assignTags('${JSON.stringify(msg)}')`);
    },
    async updateTag(item, evt) {
      item.dirty = true;
      await evalScript(
        `reassignTagName('${item.previousName}', '${evt}', '${item.type}')`
      );
      item.previousName = evt;
      item.dirty = false;
    },
    async updateColor(item) {
      console.log(
        `updateColorOfTag('${item.tagName}', '${item.type}', '${item.color}')`
      );
      await evalScript(
        `updateColorOfTag('${item.tagName}', '${item.type}', '${item.color}')`
      );
    },
  },
};
</script>

<style>
.list-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 0;
}

.color-picker-label {
  display: none;
}
</style>
