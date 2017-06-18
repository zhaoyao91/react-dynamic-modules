# React Dynamic Modules
Provide React component with dynamic modules.

## Introduction
Nowadays dynamic import becomes more and more popular.
This package introduces dynamic import to React world using the same popular HOC pattern
and make it easy to coordinate with other libs in React eco.
  
## Installation

```
npm install --save react-dynamic-modules
```

## Usage

### Import a lib

```jsx harmony
import withDynamicModules from 'react-dynamic-modules'

const MyComponent = withDynamicModules({
  moment: () => import('moment')
})(
  function ({moment}) {
    let date
    if (moment) date = moment()
    else date = new Date()
    
    return <div>{date.toString()}</div>
  }
)
```

### Import a component

```jsx harmony
import withDynamicModules from 'react-dynamic-modules'

const MyComponent = withDynamicModules({
  DynamicComponent: () => import('./DynamicComponent').then(mod => mod.default)
})(
  function ({DynamicComponent}) {    
    return <div>
      {
        DynamicComponent && <DynamicComponent/>
      }
    </div>
  }
)
```

### Get status

```jsx harmony
import withDynamicModules from 'react-dynamic-modules'

const MyComponent = withDynamicModules({
  DynamicComponent: () => import('./DynamicComponent').then(mod => mod.default),
  moment: () => import('moment'),
  invalidModule: () => import('???')
}, {status: 'loadingStatus'})(
  function ({loadingStatus}) {    
    return <div>
      // true if all modules loaded successfully, else false
      <p>{loadingStatus.ready}</p>
      
      // null if no error, else the any of the error
      <p>{loadingStatus.error.stack}</p>
      
      // true if this module loaded successfully, else false
      <p>{loadingStatus.invalidModule.ready}</p>
      
      // null if no error, else the error
      <p>{loadingStatus.invalidModule.error}</p>
    </div>
  }
)
```

### Sophisticated usage with `recompose`

```jsx harmony
import withDynamicModules from 'react-dynamic-modules'
import {compose, branch, renderComponent} from 'recompose'

import MyErrorComp from './MyErrorComp'
import MyLoadingComp from './MyLoadingComp'

const MyComponent = compose(
  withDynamicModules({
    DynamicComponent: () => import('./DynamicComponent').then(mod => mod.default),
    moment: () => import('moment'),
  }, {status: 'loadingStatus'}),
  branch(({loadingStatus}) => !!loadingStatus.error, () => <MyErrorComp/>),
  branch(({loadingStatus}) => !loadingStatus.ready, () => <MyLoadingComp/>),
)(
  function ({moment, DynamicComponent}) {
    // now we can use these modules with confidence
    return <div>
       <DynamicComponent now={moment()}/>
    </div>   
  }
)
```

## License
MIT