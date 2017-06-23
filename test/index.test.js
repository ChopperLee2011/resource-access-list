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
      ral.userModleName = 'employees'
      const models = {
        employees: {
          findById: () => {
            return Promise.resolve({
              id: 1,
              owner: () => {
                return {id: 1}
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
      ral.userModleName = 'employees'
      const models = {
        employees: {
          findById: (n) => {
            return Promise.resolve({
              id: n,
              owner: () => {
                return {id: 1}
              },
              member: () => {
                return {id: 1}
              }
            })
          }
        },
        teams: {
          findById: (n) => {
            return Promise.resolve({
              id: n,
              member: () => {
                return {id: n}
              }
            })
          }
        }
      }
      const fakeReq = {user: {id: 1, roles: ['employee']}, path: '/teams/1', method: 'get', app: {models}}
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
      ral.userModleName = 'employees'
      const models = {
        employees: {
          findById: () => {
            return Promise.resolve({
              id: 2,
              owner: () => {
                return {id: 2}
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
      ral.userModleName = 'employees'
      const models = {
        employees: {
          findById: (n) => {
            return Promise.resolve({
              id: n,
              owner: () => {
                return {id: 1}
              },
              member: () => {
                return {id: 1}
              }
            })
          }
        },
        teams: {
          findById: (n) => {
            return Promise.resolve({
              id: n,
              member: () => {
                return {id: 2}
              }
            })
          }
        }
      }
      const fakeReq = {user: {id: 1, roles: ['employee']}, path: '/teams/1', method: 'get', app: {models}}
      ral.check(fakeReq, null, (err) => {
        expect(err).to.be.an('error')
        expect(err.statusCode).to.equal(401)
        done()
      })
    })
  })
})
