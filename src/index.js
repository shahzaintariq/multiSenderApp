import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

setTimeout(() => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  )
}, 1000)