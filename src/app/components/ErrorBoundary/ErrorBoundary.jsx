import { Component } from 'react'

class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded bg-red-950 p-3 text-xs text-red-200">
          <p className="font-semibold">Something went wrong</p>
          <p className="mt-1">{this.state.error.message}</p>
          <button
            type="button"
            className="mt-2 rounded bg-red-800 px-2 py-1 text-xs"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export { ErrorBoundary }
