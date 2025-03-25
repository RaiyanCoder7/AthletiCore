import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error("Error caught in ErrorBoundary:", error, info.componentStack);
        // You can also log the error to an external service here
    }

    render() {
        if (this.state.hasError) {
            return (
                <div>
                    <h1>Something went wrong.</h1>
                    <p>Please try again later.</p>
                </div>
            );
        }

        return this.props.children; 
    }
}

export default ErrorBoundary;