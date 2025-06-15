# Performance Testing and Monitoring

This document outlines the comprehensive performance testing infrastructure built into qoreCSS for measuring CDN response times, validating deployment performance, and ensuring optimal user experience.

## Performance Testing Infrastructure

The framework includes sophisticated performance measurement tools that validate CDN response times, test deployment reliability, and monitor system performance under various load conditions.

### Automated Performance Testing

1. **Dependencies**: All testing dependencies are included in the framework
   ```bash
   npm install  # Installs all required dependencies
   ```

2. **Execute Performance Tests**: 
   ```bash
   # Run with default concurrency (5 requests)
   node scripts/performance.js
   
   # Run with custom concurrency (1-1000 requests)
   node scripts/performance.js 25
   
   # Generate JSON output for CI/CD integration
   node scripts/performance.js 25 --json
   ```

### Advanced Features

- **Hash-based Testing**: Automatically tests current build version from `build.hash`
- **Fallback Strategy**: Falls back to `core.min.css` when hash file unavailable
- **Dual CDN Testing**: Tests both jsDelivr and GitHub Pages endpoints
- **Environment Configuration**: Comprehensive configuration via environment variables
- **Offline Testing**: Mock network calls when `CODEX=true` for development

### Environment Configuration

Configure performance testing behavior through environment variables:

```bash
# CDN Configuration
export CDN_BASE_URL=https://cdn.jsdelivr.net    # Primary CDN endpoint (trailing slash removed automatically; defaults to jsDelivr when empty)
export MAX_CONCURRENCY=50                        # Maximum concurrent requests (1-1000)  
export SOCKET_LIMIT=100                          # HTTP connection pool size (1-1000)

# Testing Parameters
export QUEUE_LIMIT=10                            # Request queue size (1-100)
export CODEX=true                                # Enable offline testing mode

# Run tests with custom configuration
node scripts/performance.js 25 --json
```

## Comprehensive Test Suite

The framework includes extensive testing beyond performance measurements:

### Unit Testing
```bash
npm test  # Runs complete test suite including:
```

- **Build System Tests**: Validates CSS processing, minification, and hash generation
- **Performance Measurement Tests**: Validates timing calculations and statistical analysis
- **CDN Integration Tests**: Tests deployment and cache purging functionality
- **Error Handling Tests**: Validates graceful failure and recovery mechanisms
- **Environment Configuration Tests**: Validates all configuration options
- **Concurrent Operations Tests**: Tests race condition handling and resource management

### Manual Performance Validation

For custom performance testing scenarios:

1. **Determine Test Parameters**: Choose request count (1-1000) based on testing needs
2. **Test Current Version**: Use hash from `build.hash` when available:
   - `https://cdn.jsdelivr.net/gh/Bijikyu/qoreCSS/core.<hash>.min.css`
   - `https://bijikyu.github.io/qoreCSS/core.<hash>.min.css`
3. **Fallback Testing**: Use `core.min.css` when hash unavailable
4. **Load Testing**: Test during peak hours for realistic performance data
5. **Comparative Analysis**: Compare results across CDN providers and time periods

### Performance Metrics

The testing system measures and reports:
- **Average Response Time**: Mean response time across all requests
- **Statistical Analysis**: Includes zero-count protection and range validation
- **CDN Comparison**: Side-by-side performance comparison between providers
- **Historical Tracking**: JSON output enables trend analysis over time
