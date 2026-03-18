import logging
import traceback
from django.conf import settings

logger = logging.getLogger(__name__)

class ErrorLoggingMiddleware:
    """
    Middleware ghi log lỗi xuống terminal (console) khi có exception xảy ra trong request.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as e:
            # Lấy thông tin về traceback
            tb = traceback.format_exc()
            
            # Ghi log lỗi vào terminal
            logger.error(f"\n--- ERROR DETECTED IN MIDDLEWARE ---")
            logger.error(f"Path: {request.path}")
            logger.error(f"Method: {request.method}")
            logger.error(f"User: {request.user}")
            logger.error(f"Error: {str(e)}")
            logger.error(f"Traceback:\n{tb}")
            logger.error(f"-----------------------------------\n")
            
            # Re-raise exception để Django xử lý tiếp (ví dụ: trả về 500 error page nếu DEBUG=False, 
            # hoặc hiển thị error page mặc định của Django nếu DEBUG=True)
            raise e
