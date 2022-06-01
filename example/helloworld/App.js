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
		return h("div", {
			id: 'root',
			class: ['red', 'hard']
		},
			// "hi, " + this.msg
			// string
			// 'hi, sparrow-vue'
			// Array
			[h('p', { class: 'red' }, 'hi'), h('p', { class: 'blue' }, 'sparrow-vue')]
		);
	},
	setup() {
		// composition api

		return {
			msg: "sparrow-vue"
		};
	}
};
