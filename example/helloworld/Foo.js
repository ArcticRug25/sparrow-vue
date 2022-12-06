import {
	h
} from '../../lib/guide-sparrow-vue.esm.js'

export const Foo = {
  setup(props) {
    console.log('props',props)
  },
  render() {
    return h('div', {}, `foo: ${this.count}`)
  }
}