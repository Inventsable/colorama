<template>
  <div id="app">
    <Menus refresh debug :context="contextMenu" />
    <Watcher
      v-if="scanForSelection && list.length"
      v-model="selectionLength"
      property="app.selection.length"
    />
    <Watcher
      v-if="scanForDocument"
      v-model="documentName"
      property="app.activeDocument.name"
    />
    <Panel script-path="./host/[appName]/">
      <Wrapper>
        <Grid>
          <Button
            icon="palette"
            @click="generateMenu"
            tooltip="Generate controllers"
          />
          <!-- @evalScript="reportResult" -->
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
          <div style="padding: 0px 5px;" />
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
    scanForDocument: false,
    scanForSelection: true,
    scanOnMount: false,
    documentName: "",
  }),
  computed: {
    list() {
      let list = [];
      list = [].concat(this.taggedFills, this.fills);
      list = [].concat(list, this.taggedStrokes);
      return [].concat(list, this.strokes);
    },
    hasSelection() {
      return !this.scanForSelection || this.selectionLength > 0;
    },
    prefs() {
      return {
        scanForSelection: this.scanForSelection,
        scanForDocument: this.scanForDocument,
        scanOnMount: this.scanOnMount,
      };
    },
    contextMenu() {
      return [
        {
          label: "Scan user selection",
          checkable: true,
          checked: this.scanForSelection,
          callback: this.assignScanForSelection,
        },
        {
          label: "Launch on mount",
          checkable: true,
          checked: this.scanOnMount,
          callback: this.assignScanOnMount,
        },
        {
          label: "Refresh on document change",
          checkable: true,
          enabled: false,
          checked: this.scanForDocument,
          callback: this.assignScanForDocument,
        },
      ];
    },
  },
  watch: {
    prefs: {
      handler(val) {
        this.setPrefs(val);
      },
      deep: true,
    },
  },
  async mounted() {
    this.getPrefs();
    if (this.scanForDocument)
      this.documentName = await evalScript(
        "(function {return app.activeDocument.name}())"
      );
    if (this.scanOnMount) this.generateMenu();
  },
  methods: {
    async generateMenu() {
      let result = await evalScript("collectAllColors()");
      this.reportResult(result);
    },
    resetUI() {
      this.fills = this.strokes = this.taggedFills = this.taggedStrokes = [];
    },
    async reportResult(evt) {
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
      await evalScript(
        `selectPathItemsByTagName('${item.tagName}', '${
          item.type
        }', ${+event.shiftKey})`
      );
    },
    async selectByColor(item, event) {
      await evalScript(
        `selectPathItemsByColor('${item.color}', '${
          item.type
        }', ${+event.shiftKey})`
      );
    },
    constructItem(type, value) {
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
      await evalScript(
        `updateColorOfTag('${item.tagName}', '${item.type}', '${item.color}')`
      );
    },
    setPrefs(value = null) {
      if (!value) value = this.prefs;
      window.localStorage.setItem("colorama", JSON.stringify(value));
    },
    getPrefs() {
      let data = window.localStorage.getItem("colorama");
      data = !data ? this.prefs : JSON.parse(data);
      Object.keys(data).forEach((key) => {
        this[key] = data[key];
      });
    },
    assignScanForDocument(v, i, a) {
      this.scanForDocument = a;
    },
    assignScanOnMount(v, i, a) {
      this.scanOnMount = a;
    },
    assignScanForSelection(v, i, a) {
      this.scanForSelection = a;
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
