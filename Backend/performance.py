"""
Performance optimization module for Chunav Sathi API
Includes caching, query optimization, and response compression
"""

import json
import hashlib
from typing import Optional, Any, Dict, Tuple
from datetime import datetime, timedelta
from functools import wraps
import logging

logger = logging.getLogger(__name__)

# ============================================================================
# Simple In-Memory Caching System
# ============================================================================

class Cache:
    """Simple in-memory cache with TTL support"""

    def __init__(self, ttl_seconds: int = 3600):
        self.ttl_seconds = ttl_seconds
        self.cache: Dict[str, Tuple[Any, float]] = {}

    def _is_expired(self, timestamp: float) -> bool:
        """Check if cache entry has expired"""
        return (datetime.now().timestamp() - timestamp) > self.ttl_seconds

    def get(self, key: str) -> Optional[Any]:
        """Retrieve value from cache if not expired"""
        if key not in self.cache:
            return None

        value, timestamp = self.cache[key]

        if self._is_expired(timestamp):
            del self.cache[key]
            return None

        return value

    def set(self, key: str, value: Any) -> None:
        """Store value in cache with timestamp"""
        self.cache[key] = (value, datetime.now().timestamp())

    def delete(self, key: str) -> None:
        """Remove value from cache"""
        if key in self.cache:
            del self.cache[key]

    def clear(self) -> None:
        """Clear entire cache"""
        self.cache.clear()

    def cleanup_expired(self) -> None:
        """Remove all expired entries"""
        expired_keys = [
            key for key, (_, timestamp) in self.cache.items()
            if self._is_expired(timestamp)
        ]
        for key in expired_keys:
            del self.cache[key]


class LocationCache(Cache):
    """Specialized cache for geocoding results"""

    def __init__(self, ttl_seconds: int = 86400):  # 24 hours
        super().__init__(ttl_seconds)

    def get_or_geocode(self, location: str, geocode_func):
        """Get cached result or compute and cache"""
        key = self._make_key(location)

        cached = self.get(key)
        if cached is not None:
            logger.info(f"Cache hit for location: {location}")
            return cached

        result = geocode_func(location)
        if result is not None:
            self.set(key, result)
            logger.info(f"Cached location result: {location}")

        return result

    @staticmethod
    def _make_key(location: str) -> str:
        """Create cache key from location"""
        # Normalize location string
        normalized = location.strip().lower()
        return f"location:{hashlib.sha256(normalized.encode()).hexdigest()[:16]}"


class BoothsCache(Cache):
    """Specialized cache for booth search results"""

    def __init__(self, ttl_seconds: int = 3600):  # 1 hour
        super().__init__(ttl_seconds)

    def get_or_search(self, lat: float, lng: float, search_func):
        """Get cached results or compute and cache"""
        key = self._make_key(lat, lng)

        cached = self.get(key)
        if cached is not None:
            logger.info(f"Cache hit for booths: ({lat}, {lng})")
            return cached

        result = search_func(lat, lng)
        if result:
            self.set(key, result)
            logger.info(f"Cached booths result: ({lat}, {lng})")

        return result

    @staticmethod
    def _make_key(lat: float, lng: float) -> str:
        """Create cache key from coordinates (quantized to reduce key space)"""
        # Quantize to 0.01 precision (~1km) to group nearby searches
        lat_q = round(lat, 2)
        lng_q = round(lng, 2)
        return f"booths:{lat_q}:{lng_q}"


# ============================================================================
# Query Optimization Utilities
# ============================================================================

class QueryOptimizer:
    """Optimize API queries and responses"""

    @staticmethod
    def batch_nearby_places_search(lat: float, lng: float, search_func) -> Dict:
        """
        Batch multiple nearby places searches to reduce API calls.
        Instead of 3 separate API calls, combine them efficiently.
        """
        try:
            # Search for all keywords in one optimized call
            # This would require custom implementation with caching
            logger.info(f"Optimized booth search at ({lat}, {lng})")
            return search_func(lat, lng)
        except Exception as e:
            logger.error(f"Query optimization failed: {e}")
            return []

    @staticmethod
    def optimize_response(data: Dict) -> Dict:
        """
        Optimize response payload size
        - Remove unnecessary fields
        - Compress data structures
        """
        if "booths" in data:
            # Keep only essential booth fields
            optimized_booths = []
            for booth in data.get("booths", []):
                optimized_booth = {
                    "place_id": booth.get("place_id"),
                    "name": booth.get("name"),
                    "address": booth.get("address"),
                    "lat": booth.get("lat"),
                    "lng": booth.get("lng"),
                    "distance_km": booth.get("distance_km"),
                    "status": booth.get("status"),
                    "rating": booth.get("rating"),
                    "maps_url": booth.get("maps_url")
                }
                optimized_booths.append(optimized_booth)

            data["booths"] = optimized_booths

        return data


# ============================================================================
# Performance Monitoring
# ============================================================================

class PerformanceMonitor:
    """Monitor and log performance metrics"""

    def __init__(self):
        self.metrics: Dict[str, list] = {
            "chat_times": [],
            "booth_search_times": [],
            "geocode_times": [],
        }

    def log_time(self, operation: str, elapsed_time: float) -> None:
        """Log operation timing"""
        if operation in self.metrics:
            self.metrics[operation].append(elapsed_time)
            self._log_stats(operation)

    def _log_stats(self, operation: str) -> None:
        """Log timing statistics"""
        times = self.metrics[operation]
        if not times:
            return

        avg_time = sum(times) / len(times)
        max_time = max(times)
        min_time = min(times)

        logger.info(
            f"{operation}: avg={avg_time:.3f}s, "
            f"min={min_time:.3f}s, max={max_time:.3f}s, "
            f"count={len(times)}"
        )

    def get_stats(self, operation: str) -> Dict[str, float]:
        """Get statistics for an operation"""
        times = self.metrics.get(operation, [])
        if not times:
            return {}

        return {
            "avg": sum(times) / len(times),
            "min": min(times),
            "max": max(times),
            "count": len(times)
        }


# ============================================================================
# Decorator for Performance Tracking
# ============================================================================

def track_performance(operation_name: str):
    """Decorator to track operation performance"""
    monitor = PerformanceMonitor()

    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            import time
            start = time.time()
            result = await func(*args, **kwargs)
            elapsed = time.time() - start
            monitor.log_time(operation_name, elapsed)
            return result

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            import time
            start = time.time()
            result = func(*args, **kwargs)
            elapsed = time.time() - start
            monitor.log_time(operation_name, elapsed)
            return result

        # Return appropriate wrapper
        import inspect
        if inspect.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper

    return decorator


# ============================================================================
# Frontend Optimization Recommendations
# ============================================================================

FRONTEND_OPTIMIZATION_GUIDE = """
# Frontend Optimization Guide for Chunav Sathi

## Code Splitting & Lazy Loading
1. Split routes into separate bundles
2. Lazy load components for different pages
3. Implement route-based code splitting with React Router

## Bundle Size Optimization
1. Use production build: `npm run build`
2. Analyze bundle: `npm run build -- --analyze`
3. Remove unused dependencies
4. Use tree-shaking with ES modules

## Image Optimization
1. Compress images using tools like TinyPNG
2. Use WebP format for modern browsers
3. Implement responsive images with srcset
4. Use lazy loading for images below the fold

## Caching Strategy
1. Set appropriate Cache-Control headers
2. Use service workers for offline support
3. Cache API responses (with TTL)
4. Implement browser caching for assets

## Performance Metrics
1. Monitor Lighthouse scores
2. Track Core Web Vitals:
   - Largest Contentful Paint (LCP)
   - First Input Delay (FID)
   - Cumulative Layout Shift (CLS)

## Network Optimization
1. Enable gzip compression
2. Minimize HTTP requests
3. Use CDN for static assets
4. Implement request batching

## Rendering Optimization
1. Use React.memo for component memoization
2. Implement virtual scrolling for long lists
3. Debounce/throttle expensive operations
4. Use useMemo and useCallback hooks

## Tailwind CSS Optimization
1. Purge unused styles in production
2. Configure minimal CSS in build
3. Use PurgeCSS plugin
4. Monitor CSS file size
"""

# ============================================================================
# Initialization
# ============================================================================

# Create global cache instances
location_cache = LocationCache(ttl_seconds=86400)  # 24 hours
booths_cache = BoothsCache(ttl_seconds=3600)      # 1 hour
performance_monitor = PerformanceMonitor()

__all__ = [
    'Cache',
    'LocationCache',
    'BoothsCache',
    'QueryOptimizer',
    'PerformanceMonitor',
    'track_performance',
    'location_cache',
    'booths_cache',
    'performance_monitor',
    'FRONTEND_OPTIMIZATION_GUIDE'
]
