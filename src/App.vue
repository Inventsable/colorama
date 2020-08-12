<template>
  <div id="app">
    <Menus refresh debug />
    <Watcher v-model="selectionLength" property="app.selection.length" />
    <Panel script-path="./host/[appName]/">
      <Wrapper>
        <Button
          label="Collect All Colors"
          evalScript="collectAllColors()"
          @evalScript="reportResult"
        />
        <div class="list-item" v-for="(item, i) in list" :key="i">
          <Button flat disabled>
            <Icons :name="item.type" />
          </Button>
          <Color-Picker v-model="item.color" />
          <Input
            flat
            v-model="item.tagName"
            placeholder="Tag title"
            @update="updateTag(item, $event)"
          />
          <div style="padding: 5px;" />

          <Button icon="select-all" flat tooltip="Select all" />
          <Button
            icon="link"
            :disabled="!hasSelection"
            flat
            tooltip="Link selection"
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
    strokes: [],
  }),
  computed: {
    list() {
      return [].concat(this.fills, this.strokes);
    },
    hasSelection() {
      return this.selectionLength > 0;
    },
  },
  methods: {
    async reportResult(evt) {
      this.fills = this.removeDuplicates(evt.fills).map((val) =>
        this.constructItem("fill", val)
      );
      this.strokes = this.removeDuplicates(evt.strokes).map((val) =>
        this.constructItem("stroke", val)
      );
      console.log(this.list);
      await this.assignTags();
    },
    removeDuplicates(items) {
      return !items.length ? [] : [...new Set(items)];
    },
    constructItem(type, value) {
      return {
        type: type,
        tagName: value,
        previousName: value,
        dirty: false,
        color: value,
      };
    },
    async assignTags() {
      console.log("ASSIGNING...");
      let msg = this.list.map((item) => {
        return {
          name: `colorama-${item.type}`,
          value: item.tagName,
          color: item.color,
          type: item.type,
        };
      });
      console.log(msg);
      await evalScript(`assignTags('${JSON.stringify(msg)}')`);
    },
    updateTag(item, evt) {
      console.log(item);
      console.log(evt);
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
