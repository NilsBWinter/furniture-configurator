<template>
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </div>
  <router-view/>
</template>

<style lang="scss">
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

.box-container {
	display: grid;
	justify-content: center;

	border: solid 1px;
	margin-bottom: 16px;
}

.o-field {
  display: flex;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;

  .o-field-label {
	align-self: center;

	// padding-right: 8px;
	width: 200px;
  }

  .o-control-input {
	display: contents;
  }
}

.icon {
	height: 24px;
}

// Fixes oruga setting disabled attribute to false instead of ommiting it
[disabled='false'] {
	opacity: 1 !important;
}
</style>
