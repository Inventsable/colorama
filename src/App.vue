<template>
  <div id="app">
    <Menus refresh debug />
    <Panel script-path="./host/[appName]/">
      <Wrapper>
        <Button
          label="test"
          evalScript="collectAllColors()"
          @evalScript="reportResult"
        />
        <div class="list-item">
          <Button flat disabled>
            <Icons name="fill" />
          </Button>
          <Color-Picker v-model="hex" />
          <Input flat v-model="tagName" placeholder="Tag title" />
          <div style="padding: 5px;" />

          <Button icon="select-all" flat tooltip="Select all" />
          <Button icon="link" flat tooltip="Link selection" />
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
  }),
  methods: {
    reportResult(evt) {
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
}

.color-picker-label {
  display: none;
}
</style>
