<template>
  <router-view/>
  <div id="nav">
    <!-- <router-link to="/about">About</router-link> -->
  </div>
</template>

<style lang="scss">

@import '~@oruga-ui/oruga-next/dist/oruga-full-vars.css';

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

.o-btn,
.o-input,
.o-sel,
option,
.o-chk__check,
.o-chk__check--checked {
  background-color: var(--color-primary-light) !important;
  color: var(--color-primary-dark) !important;
  border-color: var(--color-primary-dark) !important;
}

.o-input {
  margin-right: 8px;
}

.o-ctrl-sel {
  right: 32px;
}

.o-btn {
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

  .o-field__label {
    align-self: center;
    text-align: left;

    padding-right: 16px;
    width: 150px;
  }

  // .o-input {
  //   max-width: 200px;
  // }

  .o-ctrl-input {
	// display: contents;
  width: 300px;
  }

  .o-ctrl-sel {
    right: 0;
  width: 300px;

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
