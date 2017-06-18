'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = withDynamicModules;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @param requiredModules # {name: load}
 * @param [options]
 * @param [options.status] # {ready, error, modules}
 * @param [options.cache] # default true
 * @returns {Function}
 */
function withDynamicModules(requiredModules, options) {
  options = _extends({}, options || {}, {
    cache: true
  });

  var modulesCache = {};
  var modulesStatusCache = {};

  return function (Component) {
    return function (_React$Component) {
      _inherits(WithDynamicModules, _React$Component);

      function WithDynamicModules(props) {
        _classCallCheck(this, WithDynamicModules);

        var _this = _possibleConstructorReturn(this, (WithDynamicModules.__proto__ || Object.getPrototypeOf(WithDynamicModules)).call(this, props));

        var state = {};
        if (options.cache) {
          for (var name in requiredModules) {
            if (requiredModules.hasOwnProperty(name)) {
              state['module:' + name] = modulesCache[name] || null;
              state['status:' + name] = modulesStatusCache[name] || { ready: false, error: null };
            }
          }
        } else {
          for (var _name in requiredModules) {
            if (requiredModules.hasOwnProperty(_name)) {
              state['module:' + _name] = null;
              state['status:' + _name] = { ready: false, error: null };
            }
          }
        }
        _this.state = state;
        return _this;
      }

      _createClass(WithDynamicModules, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
          var _this2 = this;

          var _loop = function _loop(name) {
            if (requiredModules.hasOwnProperty(name)) {
              var moduleStatus = _this2.state['status:' + name];
              if (!options.cache || !moduleStatus.error && !moduleStatus.ready) {
                var load = requiredModules[name];
                load().then(function (mod) {
                  _this2.updateModuleAndStatus(name, mod, {
                    ready: true,
                    error: null
                  });
                }).catch(function (err) {
                  _this2.updateModuleAndStatus(name, null, {
                    ready: false,
                    error: err
                  });
                });
              }
            }
          };

          for (var name in requiredModules) {
            _loop(name);
          }
        }
      }, {
        key: 'render',
        value: function render() {
          return _react2.default.createElement(Component, _extends({}, this.getStatusProp(), this.getModules(), this.props));
        }
      }, {
        key: 'updateModuleAndStatus',
        value: function updateModuleAndStatus(name, module, status) {
          var _setState;

          this.setState((_setState = {}, _defineProperty(_setState, 'module:' + name, module), _defineProperty(_setState, 'status:' + name, status), _setState));
          modulesCache[name] = module;
          modulesStatusCache[name] = status;
        }
      }, {
        key: 'getStateOfPrefix',
        value: function getStateOfPrefix(prefix) {
          var result = {};
          for (var name in this.state) {
            if (this.state.hasOwnProperty(name)) {
              if (name.startsWith(prefix + ':')) {
                result[name.substr(name.indexOf(':') + 1)] = this.state[name];
              }
            }
          }
          return result;
        }
      }, {
        key: 'getStatus',
        value: function getStatus() {
          var modulesStatus = this.getModulesStatus();
          for (var name in modulesStatus) {
            if (modulesStatus.hasOwnProperty(name)) {
              var moduleStatus = modulesStatus[name];
              if (moduleStatus.error) return {
                ready: false,
                error: moduleStatus.error
              };
            }
          }
          for (var _name2 in modulesStatus) {
            if (modulesStatus.hasOwnProperty(_name2)) {
              var _moduleStatus = modulesStatus[_name2];
              if (!_moduleStatus.ready) return {
                ready: false,
                error: null
              };
            }
          }
          return {
            ready: true,
            error: null
          };
        }
      }, {
        key: 'getModulesStatus',
        value: function getModulesStatus() {
          return this.getStateOfPrefix('status');
        }
      }, {
        key: 'getModules',
        value: function getModules() {
          return this.getStateOfPrefix('module');
        }
      }, {
        key: 'getStatusProp',
        value: function getStatusProp() {
          var statusProp = {};
          if (options.status) {
            statusProp[options.status] = _extends({}, this.getStatus(), {
              modules: this.getModulesStatus()
            });
          }
          return statusProp;
        }
      }]);

      return WithDynamicModules;
    }(_react2.default.Component);
  };
}