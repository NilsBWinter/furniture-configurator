<template>
  <router-view/>
  <div id="nav">
    <!-- <router-link to="/about">About</router-link> -->
  </div>
</template>

<style lang="scss">

:root {
    --color-primary:#A60D0D;
    --color-primary-dark:#400101;
    --color-primary-light1: #F20505;
    --color-secondary:#F21D2F;
    --color-primary-light:#FF620F;
    --color-background: #D9D5D2;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

.o-button,
.o-input,
.o-select,
option {
  background-color: var(--color-primary-light) !important;
  color: var(--color-primary-dark) !important;
}

.o-control-select {
  right: 32px;
}

.o-button {
  margin-left: 8px !important;
  margin-right: 8px !important;
}

.o-icon {
  color: var(--color-primary-dark) !important;
}

.o-field {
  display: flex;

  // justify-content: space-between;

  align-items: center;

  // margin-left: auto;
  // margin-right: auto;

  max-width: 540px;

  .o-field-label {
    align-self: center;
    text-align: left;

    padding-right: 16px;
    width: 150px;
  }

  // .o-input {
  //   max-width: 200px;
  // }

  .o-control-input {
	display: contents;
  }
}

.icon {
	height: 24px;
}

html {
  background-color: grey;

  h1 {
    font-size: 4em;
  }
}

// Fixes oruga setting disabled attribute to false instead of ommiting it
[disabled='false'] {
	opacity: 1 !important;
}
</style>
