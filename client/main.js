import React, { Component } from 'react'
import { mount as Mount } from 'react-mounter'
import { composeWithTracker as track } from 'react-komposer'

import A from '/collections/a'
import B from '/collections/b'

let lastSub = null

class Hook extends Component {
  constructor({ willMount, didMount, willUnmount }) {
    super()
    this.componentWillMount = willMount
    this.componentDidMount = didMount
    this.componentWillUnmount = willUnmount
  }

  render() {
    return null
  }
}

const Layout = ({ template }) => <div>
  <nav>
    <a href='/'>Page A</a>
    <span> | </span>
    <a href='/b'>Page B</a>
  </nav>
  {template()}
</div>

const List = ({ a }) => <div>
  {console.log(a.title)}
  <div>{a.title}</div>
</div>

const PageA = track((props, onData) => {
  console.log('trigger a container')
  console.time()
  const sub = Meteor.subscribe('pagea')
  lastSub = sub
  if (sub.ready()) {
    const list = A.find().fetch()
    console.log('trigger a ready')
    console.timeEnd()
    onData(null, { list, sub })
  } else {
    onData(null, null)
  }
})(({ list, sub }) => <div>
  <h3>a</h3>
  {list.map(({ _id, title }) => <div key={_id}>
    {title}
  </div>)}
  <Hook willUnmount={() => sub.stop()} />
</div>)

const PageB = track((props, onData) => {
  console.log('trigger b container')
  console.time()
  const sub = Meteor.subscribe('pageb')
  lastSub = sub
  if (sub.ready()) {
    const list = B.find().fetch()
    console.log('trigger b ready')
    console.timeEnd()
    onData(null, { list, sub })
  } else {
    onData(null, null)
  }
})(({ list, sub }) => <div>
  <h3>b</h3>
  {list.map(({ _id, title }) => <div key={_id}>
    {title}
  </div>)}
  <Hook willUnmount={() => {
    sub.stop()
  }} />
</div>)

FlowRouter.route('/', {
  action() {
    Mount(Layout, {
      template: () => <PageA />
    })
  },
  triggerEnter: [() => {
    lastSub && lastSub.stop()
  }]
})

FlowRouter.route('/b', {
  action() {
    Mount(Layout, {
      template: () => <PageB />
    })
  }
})

//
