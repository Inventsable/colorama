<template>
  <div class="icon-container">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="24"
      height="24"
    >
      <path
        class="default-icon"
        :style="{
          fill: color,
        }"
        :d="activePath"
      />
    </svg>
  </div>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      default: "fill",
    },
    color: {
      type: String,
      default: "var(--color-default)",
    },
  },
  data: () => ({
    paths: [
      {
        name: "fill",
        d:
          "M24.75,6H7.25A1.25,1.25,0,0,0,6,7.25v17.5A1.25,1.25,0,0,0,7.25,26h17.5A1.25,1.25,0,0,0,26,24.75V7.25A1.25,1.25,0,0,0,24.75,6ZM22.88,22.88H9.12V9.12H22.88ZM21,11V21H11V11Z",
      },
      {
        name: "stroke",
        d:
          "M6,7.25v17.5A1.25,1.25,0,0,0,7.25,26h17.5A1.25,1.25,0,0,0,26,24.75V7.25A1.25,1.25,0,0,0,24.75,6H7.25A1.25,1.25,0,0,0,6,7.25ZM21.63,21.63H10.38V10.38H21.63Z",
      },
    ],
  }),
  computed: {
    activePath() {
      return this.paths.find((item) => {
        return item.name == this.name;
      }).d;
    },
  },
};
</script>

<style>
.icon-container {
  box-sizing: border-box;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
