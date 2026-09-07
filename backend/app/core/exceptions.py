import logging
from typing import Any

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("backend.exceptions")


class AppException(Exception):
    """Base application exception for all domain errors."""

    def __init__(
        self,
        message: str = "An internal application error occurred",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code: str = "INTERNAL_SERVER_ERROR",
        details: Any = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details


class NotFoundError(AppException):
    """Resource not found error."""

    def __init__(
        self,
        message: str = "Requested resource was not found",
        error_code: str = "NOT_FOUND",
        details: Any = None,
    ) -> None:
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            error_code=error_code,
            details=details,
        )


class SessionNotFoundError(NotFoundError):
    """Session not found error."""

    def __init__(self, session_id: str) -> None:
        super().__init__(
            message=f"Session {session_id} was not found",
            error_code="SESSION_NOT_FOUND",
            details={"session_id": session_id},
        )


class ValidationError(AppException):
    """Application-level validation error."""

    def __init__(
        self,
        message: str = "Validation failed for request parameters",
        details: Any = None,
    ) -> None:
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code="VALIDATION_ERROR",
            details=details,
        )


class UnauthorizedError(AppException):
    """Authentication failure error."""

    def __init__(
        self,
        message: str = "Invalid or missing authentication credentials",
        details: Any = None,
    ) -> None:
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="UNAUTHORIZED",
            details=details,
        )


class InternalAppError(AppException):
    """Internal server error."""

    def __init__(
        self,
        message: str = "An internal server error occurred",
        details: Any = None,
    ) -> None:
        super().__init__(
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="INTERNAL_SERVER_ERROR",
            details=details,
        )


def session_not_found(session_id: str) -> HTTPException:
    """Backward compatibility helper returning a standard 404 HTTPException."""
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Session {session_id} was not found")


def register_exception_handlers(app: FastAPI) -> None:
    """Register centralized exception handlers on the FastAPI application instance."""

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)
        logger.warning(
            "AppException: code=%s message=%s path=%s request_id=%s",
            exc.error_code,
            exc.message,
            request.url.path,
            request_id,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": exc.error_code,
                    "message": exc.message,
                    "details": exc.details,
                }
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)
        sanitized_errors = [
            {
                "field": ".".join(str(loc) for loc in err.get("loc", []) if loc != "body"),
                "message": err.get("msg", ""),
                "type": err.get("type", ""),
            }
            for err in exc.errors()
        ]
        logger.warning(
            "Validation error on path=%s request_id=%s errors=%s",
            request.url.path,
            request_id,
            sanitized_errors,
        )
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Request validation failed",
                    "details": sanitized_errors,
                }
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)
        logger.info(
            "HTTPException: status=%d detail=%s path=%s request_id=%s",
            exc.status_code,
            exc.detail,
            request.url.path,
            request_id,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": "HTTP_ERROR",
                    "message": str(exc.detail),
                    "details": None,
                }
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)
        logger.exception(
            "Unhandled server error on path=%s request_id=%s: %s",
            request.url.path,
            request_id,
            exc,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected internal server error occurred",
                    "details": None,
                }
            },
        )
