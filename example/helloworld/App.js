import {
	h
} from '../../lib/sparrow-vue.esm.js'
import { Foo } from './Foo.js';

window.self = null
export const App = {
	name: 'App',
	// 必须要写 render
	// .vue
	// <template></template>
	// render
	render() {
		window.self = this
		// ui
		return h(
			"div",
			{
				id: 'root',
				class: ['red', 'hard'],
				onClick() {
					console.log('sparrow-vue!')
				}
			},
			[h('div', {}, `hi, ${this.msg}`), h(Foo, { count: 1, onAdd(a, b) { console.log('onAdd', a, b) }, onAddFoo(){console.log(11)} })]
			// "hi, " + this.msg
			// string
			// 'hi, sparrow-vue'
			// Array
			// [h('p', { class: 'red' }, 'hi'), h('p', { class: 'blue' }, this.msg)]
		);
	},
	setup() {
		// composition api

		return {
			msg: "sparrow-vue"
		};
	}
};
