import _ from 'lodash'

import React, { Component } from 'react'
import { mount as Mount } from 'react-mounter'
import { composeWithTracker as track } from 'react-komposer'

import { List } from 'react-virtualized'

import A from '/collections/a'
import B from '/collections/b'

window.reload = new ReactiveDict('reload')

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

const subsCache = new SubsCache()

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

const NavTracker = (props, onData) => {
  console.log(FlowRouter.current())
  const path = FlowRouter.current().route.path
  onData(null, { path })
}

const NavComponent = ({ path }) => <nav>
  <a href='/' className={path == '/' ? 'active' : null}>Page A</a>
  <span> | </span>
  <a href='/b' className={path == '/b' ? 'active' : null}>Page B</a>
  <span> | </span>
  <a href='/c' className={path == '/c' ? 'active' : null}>Page C</a>
</nav>

const NavContainer = track(NavTracker)(NavComponent)

const Layout = ({ template }) => <div>
  <NavContainer />
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

  // const sub = subsCache.subscribe('pagea', selector)
  const sub = Meteor.subscribe('pagea', selector)
  if (sub.ready()) {
    Meteor.defer(function() {
      const list = A.find(selector, { sort: { createdAt: -1 } }).fetch()
      console.log('trigger a ready')
      console.timeEnd()
      onData(null, { list, selector })
    })
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
  window.reload.get('pageb')
  let isFirstTime = true


  // const sub = Meteor.subscribe('pageb')
  const sub = subsCache.subscribe('pageb')
  props.time.get()
  if (sub.ready()) {
    const TestOB = B.find().observe({
      added() {
        if (isFirstTime) return
        console.log(123)
        props.time.set(new Date())
      }
    })
    Meteor.defer(function () {
      const _list = B.find({}, { sort: { createdAt: -1 } })
      const list = _list.fetch()
      console.log('trigger b ready')
      console.timeEnd()
      isFirstTime = false
      onData(null, { list })
    })

  } else {
    onData(null, null)
  }
})(({ list }) => <div>
  <h3>b</h3>
  {list.map(({ _id, title }) => <div key={_id}>
    {title}
  </div>)}
</div>)

//

const PageCFilter = props => {
  const selector = _.mapValues(props.queryParams.selector, mapper) || {}
  return <div>
    <div><button className={selector.alt !== true && 'active'} onClick={() => {
      FlowRouter.go('/c', {}, {
        selector: {},
      })
    }}>filter 1</button></div>

    <div><button className={selector.alt && 'active'} onClick={() => {
      FlowRouter.go('/c', {
        selector: { alt: true }
      }, {
        selector: { alt: true }
      })
    }}>filter 2</button></div>
  </div>
}

const PageCList = track((props, onData) => {
  console.log('trigger c container')
  console.time()
  const selector = _.mapValues(props.queryParams.selector, mapper) || {}

  const sub = subsCache.subscribe('pagea', selector)
  // const sub = Meteor.subscribe('pagec', selector)
  if (sub.ready()) {
    Meteor.setTimeout(function () {
      const list = A.find(selector, { sort: { createdAt: -1 } }).fetch()
      console.log(list)
      console.log('trigger c ready')
      console.timeEnd()
      onData(null, { list, selector })
    }, 0)
  } else {
    onData(null, null)
  }
})(({ list, selector }, index) => {
  return <div>
    <List
      width={640}
      height={500}
      rowCount={list.length}
      rowHeight={50}
      rowRenderer={({ key, index, isScrolling, isVisible, style }) => {
        return (
          <div key={key} style={style}>
            {list[index].title}
          </div>
        )
      }}
    />
  </div>
})

const PageC = ({ queryParams }) => <div>
  <h3>c</h3>
  <PageCFilter queryParams={queryParams} />
  <PageCList queryParams= {queryParams} />
</div>



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
    const time = new ReactiveVar()
    Mount(Layout, {
      template: () => <PageB time={time} />
    })
  }
})

FlowRouter.route('/c', {
  action(params, queryParams) {
    Mount(Layout, {
      template: () => <PageC queryParams={queryParams} />
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
