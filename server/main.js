import _ from 'lodash'
import moment from 'moment'
import faker from 'faker'

import A from '/collections/a'
import B from '/collections/b'

Meteor.methods({
  addb() {
    this.unblock()
    return B.insert({
      title: faker.lorem.sentence() + 'method' + moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      createdAt: new Date(),
    })
  }
})

Meteor.publish('pagea', function (selector) {
  this.unblock()
  selector = selector || {}
  return A.find(selector, { sort: { createdAt: -1 } })
})

Meteor.publish('pageb', function () {
  this.unblock()
  Meteor._sleepForMs(5000)
  return B.find({}, { sort: { createdAt: -1 } })
})

Meteor.publish('pagec', function (selector) {
  this.unblock()
  selector = selector || {}
  return A.find(selector, { sort: { createdAt: -1 } })
})

Meteor.startup(function () {
  Meteor.users.remove({})
  A.remove({})
  B.remove({})

  const a = _.times(3000, n => ({
    title: faker.lorem.sentence(),
    createdAt: faker.date.past(),
  }))

  const alt = _.times(3000, n => ({
    title: faker.lorem.sentence(),
    createdAt: faker.date.past(),
    alt: true,
  }))

  const b = _.times(3000, n => ({
    title: faker.lorem.sentence(),
    createdAt: faker.date.past(),
  }))

  A.batchInsert(a)
  A.batchInsert(alt)
  B.batchInsert(b)

  Accounts.createUser({
    username: 'demo',
    password: 'demo',
    profile: {
      text: _.times(20000, n => faker.lorem.sentences()).join()
    }
  })

})

//
