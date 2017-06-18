import React from 'react'

/**
 * @param requiredModules # {name: load}
 * @param [options]
 * @param [options.status] # {ready, error, modules}
 * @param [options.cache] # default true
 * @returns {Function}
 */
export default function withDynamicModules (requiredModules, options) {
  options = {
    ...options || {},
    cache: true
  }

  const modulesCache = {}
  const modulesStatusCache = {}

  return function (Component) {
    return class WithDynamicModules extends React.Component {
      constructor (props) {
        super(props)

        const state = {}
        if (options.cache) {
          for (let name in requiredModules) {
            if (requiredModules.hasOwnProperty(name)) {
              state[`module:${name}`] = modulesCache[name] || null
              state[`status:${name}`] = modulesStatusCache[name] || {ready: false, error: null}
            }
          }
        }
        else {
          for (let name in requiredModules) {
            if (requiredModules.hasOwnProperty(name)) {
              state[`module:${name}`] = null
              state[`status:${name}`] = {ready: false, error: null}
            }
          }
        }
        this.state = state
      }

      componentWillMount () {
        for (let name in requiredModules) {
          if (requiredModules.hasOwnProperty(name)) {
            const moduleStatus = this.state[`status:${name}`]
            if (!options.cache || (!moduleStatus.error && !moduleStatus.ready)) {
              const load = requiredModules[name]
              load().then(mod => {
                this.updateModuleAndStatus(name, mod, {
                    ready: true,
                    error: null,
                  }
                )
              }).catch(err => {
                this.updateModuleAndStatus(name, null, {
                    ready: false,
                    error: err
                  }
                )
              })
            }
          }
        }
      }

      render () {
        return <Component {...this.getStatusProp()} {...this.getModules()} {...this.props}/>
      }

      updateModuleAndStatus (name, module, status) {
        this.setState({
          [`module:${name}`]: module,
          [`status:${name}`]: status
        })
        modulesCache[name] = module
        modulesStatusCache[name] = status
      }

      getStateOfPrefix (prefix) {
        const result = {}
        for (let name in this.state) {
          if (this.state.hasOwnProperty(name)) {
            if (name.startsWith(`${prefix}:`)) {
              result[name.substr(name.indexOf(':') + 1)] = this.state[name]
            }
          }
        }
        return result
      }

      getStatus () {
        const modulesStatus = this.getModulesStatus()
        for (let name in modulesStatus) {
          if (modulesStatus.hasOwnProperty(name)) {
            const moduleStatus = modulesStatus[name]
            if (moduleStatus.error) return {
              ready: false,
              error: moduleStatus.error
            }
          }
        }
        for (let name in modulesStatus) {
          if (modulesStatus.hasOwnProperty(name)) {
            const moduleStatus = modulesStatus[name]
            if (!moduleStatus.ready) return {
              ready: false,
              error: null
            }
          }
        }
        return {
          ready: true,
          error: null
        }
      }

      getModulesStatus () {
        return this.getStateOfPrefix('status')
      }

      getModules () {
        return this.getStateOfPrefix('module')
      }

      getStatusProp () {
        const statusProp = {}
        if (options.status) {
          statusProp[options.status] = {
            ...this.getStatus(),
            modules: this.getModulesStatus()
          }
        }
        return statusProp
      }
    }
  }
}
