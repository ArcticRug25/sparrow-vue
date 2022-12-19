import {
	h, getCurrentInstance
} from '../../lib/sparrow-vue.esm.js'
import { Foo } from './Foo.js';

export const App = {
	name: 'App',
	render() {

		return h("div", {}, [h("p", {}, "getCurrentInstance demo"), h(Foo)])
	},
	setup() {
		const instance = getCurrentInstance();
		console.log('App:', instance)
	}
};
