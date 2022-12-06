import {
	h
} from '../../lib/guide-sparrow-vue.esm.js'

window.self = null
export const App = {
	// 必须要写 render
	// .vue
	// <template></template>
	// render
	render() {
		window.self = this
		// ui
		return h("div", {
			id: 'root',
			class: ['red', 'hard'],
			onClick() {
				console.log('sparrow-vue!')
			}
		},
			// "hi, " + this.msg
			// string
			// 'hi, sparrow-vue'
			// Array
			[h('p', { class: 'red' }, 'hi'), h('p', { class: 'blue' }, this.msg)]
		);
	},
	setup() {
		// composition api

		return {
			msg: "sparrow-vue"
		};
	}
};
