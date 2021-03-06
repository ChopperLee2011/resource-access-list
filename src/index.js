import createError from 'http-errors'
import _ from 'lodash'

let acl = null

class ACL {
  constructor (opts = {}) {
    if (!acl) {
      this.rules = {}
      this.prefix = opts.prefix || ''
      this.superRoles = opts.superRoles || ['admin']
      this.memberField = opts.memberField || 'teamId'
      this.notAllowStatusCode = opts.notAllowStatusCode || 401
      acl = this
    }
    return acl
  }

  isSuperRole (roles) {
    return acl.superRoles.includes(...roles)
  }

  reqParser (req) {
    let url
    if (!acl.prefix) {
      url = req.path
    } else {
      url = _.trimStart(req.path, acl.prefix)
    }
    const urlArr = url.split('/')
    return {
      roles: req.user.roles,
      method: _.toLower(req.method) || 'get',
      resource: _.toLower(_.trim(urlArr[1])),
      resourceId: _.toLower(_.trim(urlArr[2]))
    }
  }

  resourceToModelName (modelNameList, resource) {
    const nameRe = new RegExp(resource + '?$', 'i')
    return modelNameList.find(name => nameRe.test(name))
  }

  getDynamicRole ({models, resource, resourceId, userId, memberId}) {
    return new Promise((resolve, reject) => {
      const lbModle = this.resourceToModelName(Object.keys(models), resource)
      if (lbModle == null) {
        return resolve()
      }
      models[lbModle].findById(resourceId)
        .then(ModelInst => {
          let checkRolePromises = []
          // make user owner relationship is setting and type is belongsTo
          if (ModelInst && ModelInst.owner) {
            const checkOwnerPormise = new Promise((resolve, reject) => {
              ModelInst.owner((err, owner) => {
                if (err) {
                  return reject(err)
                } else if (!!owner && Number(owner.id) === Number(userId)) {
                  return resolve('$owner')
                }
                return resolve()
              })
            })
            checkRolePromises.push(checkOwnerPormise)
          }
          if (ModelInst && ModelInst.member) {
            const checkMemberPromsie = new Promise((resolve, reject) => {
              ModelInst.member((err, member) => {
                if (err) {
                  return reject(err)
                } else if (!!member && Number(member.id) === Number(memberId)) {
                  return resolve('$member')
                }
                return resolve()
              })
            })
            checkRolePromises.push(checkMemberPromsie)
          }
          return Promise.all(checkRolePromises)
            .then(resolve)
            .catch(reject)
        })
        .catch(err => reject(err))
    })
  }

  check (req, res, next) {
    if (Object.keys(acl.rules).length === 0) {
      return next(createError(acl.notAllowStatusCode))
    }
    if (req && req.user && req.user.roles) {
      let roles = req.user.roles
      let access = false
      if (acl.isSuperRole(roles)) {
        return next()
      }
      const parsedRequest = acl.reqParser(req)
      let dynamicRolePromise
      if (parsedRequest.resourceId) {
        dynamicRolePromise = acl.getDynamicRole({
          resource: parsedRequest.resource,
          resourceId: parsedRequest.resourceId,
          models: req.app.models,
          userId: req.user.id,
          memberId: req.user[acl.memberField] || ''
        })
          .then(dynamicRole => {
            roles = roles.concat(dynamicRole)
            return roles
          })
      } else {
        dynamicRolePromise = Promise.resolve()
      }
      dynamicRolePromise
        .then(() => {
          const matchRule = acl.rules.find(rule => rule.resource === parsedRequest.resource)
          if (matchRule) {
            for (let role of roles) {
              const matchPermission = matchRule.permissions.find(permission => {
                return permission.role === role
              })
              if (matchPermission && matchPermission.methods.indexOf(parsedRequest.method) !== -1) {
                access = true
                break
              }
            }
          }
          if (access) {
            return next()
          } else {
            return next(createError(acl.notAllowStatusCode))
          }
        })
        .catch(err => {
          return next(err)
        })
    } else {
      return next(createError(acl.notAllowStatusCode))
    }
  }

  setRules (rules) {
    if (typeof rules === 'string') {
      acl.rules = require(rules)
    }
  }
}

export default ACL
module.exports = exports.default
