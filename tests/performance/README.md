# Performance Benchmarks

Performance tests to measure SDK performance and ensure operations complete within acceptable timeframes.

## Overview

These benchmarks test:
- **Authentication** - OAuth token acquisition
- **HTTP Client** - Network request performance
- **CRUD Operations** - Create, Read, Update, Delete timing
- **Concurrent Operations** - Parallel request handling with `Promise.all`
- **Search** - Query performance

## Running Benchmarks

```bash
# Run all performance tests
pnpm test:benchmark

# Run with verbose output
pnpm test:benchmark --reporter=verbose

# Run specific benchmark
pnpm test:benchmark authentication
```

## Performance Thresholds

| Operation | Threshold | Description |
|-----------|-----------|-------------|
| Authentication | 3000ms | OAuth token acquisition |
| GET Single | 1000ms | Single resource fetch |
| GET List | 2000ms | List all resources |
| CREATE | 1500ms | Create single entity |
| UPDATE | 1500ms | Update single entity |
| DELETE | 1500ms | Delete single entity |
| Concurrent Create (5) | 3000ms | Create 5 entities in parallel |
| Concurrent GET (10) | 2000ms | Make 10 GET requests in parallel |
| Search | 2000ms | Search with filters |

## Prerequisites

- PORT_CLIENT_ID and PORT_CLIENT_SECRET in .env.local
- Network connection to Port API
- Test Port workspace (not production!)

## Interpreting Results

### ✅ Passing Tests
All operations complete within thresholds:
```
✓ Authentication completed in 1234ms
✓ GET request completed in 456ms
```

### ❌ Failing Tests
Operations exceed thresholds - may indicate:
- Network latency issues
- API performance degradation
- SDK performance regression

### Performance Report
At the end of the test run, a summary shows:
```
📊 Performance Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Operation         | Threshold | Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Authentication    | 3000ms    | ✓
GET Single        | 1000ms    | ✓
...
```

## Factors Affecting Performance

### Network
- Latency to Port API (EU/US regions)
- Bandwidth
- Network congestion

### SDK
- HTTP client efficiency
- Data transformation overhead
- Type validation

### API
- Port API response times
- Rate limiting
- Server load

## Continuous Monitoring

### CI/CD Integration

Run benchmarks in CI to detect regressions:

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * 1'  # Weekly

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - uses: pnpm/action-setup@v2
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run benchmarks
        env:
          PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
          PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
        run: pnpm test:benchmark
```

### Tracking Trends

Compare results over time:
1. Save benchmark results to file
2. Commit to git or artifact storage
3. Generate performance graphs
4. Alert on significant regressions

## Optimization Tips

### For SDK Developers

If benchmarks fail:

1. **Profile the code**
   ```bash
   node --inspect node_modules/.bin/vitest --run
   ```

2. **Check HTTP requests**
   - Enable verbose logging
   - Use network inspection tools
   - Check for redundant requests

3. **Optimize data transformation**
   - Reduce object spreading
   - Cache computed values
   - Minimize type conversions

4. **Batch operations**
   - Use bulk endpoints when possible
   - Parallelize independent requests
   - Implement request pooling

### For SDK Users

If operations are slow:

1. **Use concurrent operations**
   ```typescript
   // ❌ Slow - sequential requests
   for (const entity of entities) {
     await client.entities.create(entity);
   }
   
   // ✅ Fast - concurrent requests
   await Promise.all(
     entities.map(entity => client.entities.create(entity))
   );
   ```

2. **Choose closest region**
   ```typescript
   const client = new PortClient({
     credentials,
     region: 'us', // or 'eu'
   });
   ```

3. **Enable caching** (if applicable)
   - Cache rarely-changing data (blueprints)
   - Use local caching for repeated queries

## Troubleshooting

### Tests Timeout
- Increase test timeout values
- Check network connectivity
- Verify Port API is accessible

### Inconsistent Results
- Run multiple times for average
- Check system load during tests
- Consider network variability

### All Tests Slow
- Check internet connection
- Try different time of day
- Verify Port API status

## Future Enhancements

- [ ] Add percentile measurements (p50, p95, p99)
- [ ] Generate performance graphs
- [ ] Compare against baseline
- [ ] Stress testing (sustained load)
- [ ] Memory profiling
- [ ] Add batch operations when API supports them

## Resources

- [Vitest Performance Testing](https://vitest.dev/guide/features.html#performance)
- [Node.js Performance](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
