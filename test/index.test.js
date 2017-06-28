import { expect } from 'chai'
import Ral from '../src'
import path from 'path'

describe('resourceAccessList', () => {
  describe('#Allow ', () => {
    it('super role:admin', done => {
      const ral = new Ral()
      ral.setRules(path.join(__dirname, './rules'))
      const fakeReq = {user: {id: 1, roles: ['admin']}}
      ral.check(fakeReq, null, (err) => {
        expect(err).to.be.an('undefined')
        done()
      })
    })

    it('super role:[super-admin,manager]', done => {
      const ral = new Ral()
      ral.superRoles = ['super-admin', 'manager']
      ral.setRules(path.join(__dirname, './rules'))
      const fakeReq = {user: {id: 1, roles: ['manager']}}
      ral.check(fakeReq, null, (err) => {
        expect(err).to.be.an('undefined')
        done()
      })
    })

    it('role: team-leader', done => {
      const ral = new Ral()
      ral.setRules(path.join(__dirname, './rules'))
      const fakeReq = {user: {id: 1, roles: ['team-leader']}, path: '/teams', method: 'post'}
      ral.check(fakeReq, null, (err) => {
        expect(err).to.be.an('undefined')
        done()
      })
    })

    it('role: $owner', done => {
      const ral = new Ral()
      ral.setRules(path.join(__dirname, './rules'))
      ral.userModleName = 'Employee'
      const models = {
        Employee: {
          findById: () => {
            return Promise.resolve({
              id: 1,
              owner: (cb) => {
                return cb(null, {id: 1})
              }
            })
          }
        }
      }
      const fakeReq = {user: {id: 1, roles: ['team-leader']}, path: '/employees/1', method: 'get', app: {models}}
      ral.check(fakeReq, null, (err) => {
        expect(err).to.be.an('undefined')
        done()
      })
    })

    it('role: $member', done => {
      const ral = new Ral()
      ral.setRules(path.join(__dirname, './rules'))
      ral.memberField = 'teamId'
      ral.userModleName = 'Employee'
      const models = {
        Employee: {
          findById: (n) => {
            return Promise.resolve({
              id: n,
              owner: (cb) => {
                return cb(null, {id: 1})
              },
              member: (cb) => {
                return cb(null, {id: 1})
              }
            })
          }
        },
        Team: {
          findById: (n) => {
            return Promise.resolve({
              id: n,
              member: (cb) => {
                return cb(null, {id: n})
              }
            })
          }
        }
      }
      const fakeReq = {user: {id: 1, teamId: 1, roles: ['employee']}, path: '/teams/1', method: 'get', app: {models}}
      ral.check(fakeReq, null, (err) => {
        expect(err).to.be.an('undefined')
        done()
      })
    })
  })

  describe('#Deny ', () => {
    it('throw 401 when resource rule is not defined', done => {
      const ral = new Ral()
      ral.setRules(path.join(__dirname, './rules'))
      const fakeReq = {user: {id: 1, roles: ['team-leader']}, path: '/employees'}
      ral.check(fakeReq, null, (err) => {
        expect(err).to.be.an('error')
        expect(err.statusCode).to.equal(401)
        done()
      })
    })
    it('throw 401 when user rule is not allow this resources by method', done => {
      const ral = new Ral()
      ral.setRules(path.join(__dirname, './rules'))
      const fakeReq = {user: {id: 1, roles: ['team-leader']}, path: '/teams', method: 'GET'}
      ral.check(fakeReq, null, (err) => {
        expect(err).to.be.an('error')
        expect(err.statusCode).to.equal(401)
        done()
      })
    })

    it('throw 401 user is not the $owner ', done => {
      const ral = new Ral()
      ral.setRules(path.join(__dirname, './rules'))
      ral.userModleName = 'Employee'
      const models = {
        Employee: {
          findById: () => {
            return Promise.resolve({
              id: 2,
              owner: (cb) => {
                return cb(null, {id: 2})
              }
            })
          }
        }
      }
      const fakeReq = {user: {id: 1, roles: ['team-leader']}, path: '/employees/1', method: 'get', app: {models}}
      ral.check(fakeReq, null, (err) => {
        expect(err).to.be.an('error')
        expect(err.statusCode).to.equal(401)
        done()
      })
    })

    it('throw 401 user is not the $member', done => {
      const ral = new Ral()
      ral.setRules(path.join(__dirname, './rules'))
      ral.userModleName = 'Employee'
      const models = {
        Employee: {
          findById: (n) => {
            return Promise.resolve({
              id: n
            })
          }
        },
        Team: {
          findById: (n) => {
            return Promise.resolve({
              id: n,
              member: (cb) => {
                return cb(null, {id: 2})
              }
            })
          }
        }
      }
      const fakeReq = {user: {id: 1, teamId: 1, roles: ['employee']}, path: '/teams/1', method: 'get', app: {models}}
      ral.check(fakeReq, null, (err) => {
        expect(err).to.be.an('error')
        expect(err.statusCode).to.equal(401)
        done()
      })
    })

    it('throw 403 when update instance not allow status code to 403', done => {
      const ral = new Ral()
      ral.notAllowStatusCode = 403
      ral.setRules(path.join(__dirname, './rules'))
      const fakeReq = {user: {id: 1, roles: ['team-leader']}, path: '/teams', method: 'GET'}
      ral.check(fakeReq, null, (err) => {
        expect(err).to.be.an('error')
        expect(err.statusCode).to.equal(403)
        done()
      })
    })
  })
})
