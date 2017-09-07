import _ from 'lodash'

import React, { Component } from 'react'
import { mount as Mount } from 'react-mounter'
import { composeWithTracker as track } from 'react-komposer'

let createClass = React.createClass

Object.defineProperty(React, 'createClass', {
  set: nextCreateClass => {
    createClass = nextCreateClass
  }
})

import { whyDidYouUpdate } from 'why-did-you-update'
whyDidYouUpdate(React)

import A from '/collections/a'
import B from '/collections/b'

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

const PageAFilter = props => {
  const selector = _.mapValues(props.queryParams.selector, mapper) || {}
  return <div>
    <div><button className={selector.alt !== true && 'active'} onClick={() => {
      FlowRouter.go('/', {}, {
        selector: {},
      })
    }}>filter 1</button></div>

    <div><button className={selector.alt && 'active'} onClick={() => {
      FlowRouter.go('/', {
        selector: { alt: true }
      }, {
        selector: { alt: true }
      })
    }}>filter 2</button></div>
  </div>
}

const Layout = ({ template }) => <div>
  <nav>
    <a href='/'>Page A</a>
    <span> | </span>
    <a href='/b'>Page B</a>
  </nav>
  {template()}
</div>

const PageA = ({ queryParams }) => <div>
  <h3>a</h3>
  <PageAFilter queryParams={queryParams} />
  <PageAList queryParams= {queryParams} />
</div>

const PageAList = track((props, onData) => {
  console.log('trigger a container')
  console.time()
  const selector = _.mapValues(props.queryParams.selector, mapper) || {}

  const sub = Meteor.subscribe('pagea', selector)
  if (sub.ready()) {
    const list = A.find(selector, { limit: 20 }).fetch()
    console.log('trigger a ready')
    console.timeEnd()
    onData(null, { list, selector })
  } else {
    onData(null, null)
  }
})(({ list, selector }) => <div>
  <div className='remove'>
    {list.map(({ _id, title }) => <div key={_id}>
      {title}
    </div>)}
  </div>
</div>)

const PageB = track((props, onData) => {
  console.log('trigger b container')
  console.time()
  const sub = Meteor.subscribe('pageb')
  if (sub.ready()) {
    const list = B.find().fetch()
    console.log('trigger b ready')
    console.timeEnd()
    TestRV.set({})
    onData(null, { list })
  } else {
    onData(null, null)
  }
})(({ list }) => <div>
  <h3>b</h3>
  {list.map(({ _id, title }) => <div key={_id}>
    {title}
  </div>)}
</div>)

FlowRouter.route('/', {
  name: 'home',
  action(params, queryParams) {
    Mount(Layout, {
      template: () => <PageA queryParams={queryParams} />
    })
  }
})

FlowRouter.route('/b', {
  action() {
    Mount(Layout, {
      template: () => <PageB />
    })
  }
})

//

function mapper (v) {
  if (v == 'true')
    return true
  else if (v == 'false')
    return false
  else
    return v
}
