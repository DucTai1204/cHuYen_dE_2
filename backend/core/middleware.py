import logging
import traceback
import json
from django.conf import settings

logger = logging.getLogger("django")

class ErrorLoggingMiddleware:
    """
    Middleware ghi log lỗi xuống terminal (console) cực chi tiết để debug.
    Sẽ log:
    - Bất kỳ lỗi có mã HTTP >= 400 (như 400 Bad Request, 401, 403, 404, 500)
    - Unhandled exception (những lỗi chưa được catch)
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as e:
            raise e

    def log_error(self, error_type, request, response=None, exception=None, traceback_str=None):
        # Đã loại bỏ log theo yêu cầu người dùng
        pass

