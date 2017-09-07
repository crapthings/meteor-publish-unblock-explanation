import _ from 'lodash'
import faker from 'faker'

import A from '/collections/a'
import B from '/collections/b'

Meteor.publish('pagea', function (selector) {
  this.unblock()
  selector = selector || {}
  return A.find(selector)
})

Meteor.publish('pageb', function () {
  this.unblock()
  Meteor._sleepForMs(10000)
  return B.find()
})

Meteor.startup(function () {
  A.remove({})
  B.remove({})

  const a = _.times(1000, n => ({
    title: faker.lorem.sentence(),
  }))

  const alt = _.times(1000, n => ({
    title: faker.lorem.sentence(),
    alt: true,
  }))

  const b = _.times(1000, n => ({
    title: faker.lorem.sentence(),
  }))

  A.batchInsert(a)
  A.batchInsert(alt)
  B.batchInsert(b)

})
