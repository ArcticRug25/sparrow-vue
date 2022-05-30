import {
	h
} from '../../lib/guide-sparrow-vue.esm.js'

export const App = {
	// 必须要写 render
	// .vue
	// <template></template>
	// render
	render() {
		// ui
		return h("div", "hi, " + this.msg);
	},
	setup() {
		// composition api

		return {
			msg: "sparrow-vue"
		};
	}
};
