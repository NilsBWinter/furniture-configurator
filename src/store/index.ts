import { Box } from '@/logic/calculator';
import { createStore } from 'vuex'

export default createStore({
  state: {
    activeBox: undefined,
  },
  mutations: {
    setActiveBox (state, newBox) {
      state.activeBox = newBox;
    }
  },
  actions: {
  },
  modules: {
  }
})
