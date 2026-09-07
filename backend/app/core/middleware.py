import logging
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("backend.access")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Centralized HTTP request logging middleware with request-ID tracking."""

    async def dispatch(self, request: Request, call_next) -> Response:
        # Pass non-HTTP protocols (e.g. WebSockets) through without interception
        if request.scope.get("type") != "http":
            return await call_next(request)

        # Extract or generate unique request ID
        request_id = request.headers.get("X-Request-ID")
        if not request_id:
            request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        start_time = time.perf_counter()

        try:
            response: Response = await call_next(request)
            duration_ms = (time.perf_counter() - start_time) * 1000
            response.headers["X-Request-ID"] = request_id

            logger.info(
                "method=%s path=%s status=%d duration_ms=%.2f request_id=%s",
                request.method,
                request.url.path,
                response.status_code,
                duration_ms,
                request_id,
            )
            return response
        except Exception:
            duration_ms = (time.perf_counter() - start_time) * 1000
            logger.error(
                "method=%s path=%s status=500 duration_ms=%.2f request_id=%s [exception raised]",
                request.method,
                request.url.path,
                duration_ms,
                request_id,
            )
            raise
