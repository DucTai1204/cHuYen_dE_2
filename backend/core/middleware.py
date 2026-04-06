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
            
            # Ghi log nếu có mã lỗi (mã từ 400 trở lên)
            if response.status_code >= 400:
                self.log_error("HTTP ERROR", request, response=response)
                
            return response
        except Exception as e:
            # Lấy thông tin về traceback cho unhandled exception
            tb = traceback.format_exc()
            self.log_error("UNHANDLED EXCEPTION", request, exception=e, traceback_str=tb)
            raise e

    def log_error(self, error_type, request, response=None, exception=None, traceback_str=None):
        logger.error(f"\n" + "🔥" * 25 + f" [ {error_type} ] " + "🔥" * 25)
        
        # 1. Thông tin Request
        logger.error(f"📍 PATH:    {request.method} {request.path}")
        
        # Lấy tên Hàm / Chức năng (View)
        view_name = "Unknown"
        if hasattr(request, 'resolver_match') and request.resolver_match:
            view_name = request.resolver_match.view_name
            module_name = request.resolver_match._func_path
            logger.error(f"🛠️ FUNCTION: {view_name} (Module: {module_name})")
        else:
            logger.error(f"🛠️ FUNCTION: Could not resolve (Might be early middleware error)")
        
        logger.error(f"👤 USER:    {request.user if hasattr(request, 'user') else 'Unknown'}")
        
        # Lấy parameters/query
        if request.GET:
            logger.error(f"❓ QUERY:   {dict(request.GET)}")
            
        # 2. Thông tin Request Body (Dữ liệu gửi lên)
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                # DRF thường cache lại request body trong request._body hoặc request.data
                # Ta đọc an toàn từ request.body vì tới đây view đã xử lý xong hoặc là lỗi r
                request_body = request.body
                if request_body:
                    body_str = request_body.decode('utf-8')
                    try:
                        parsed_body = json.loads(body_str)
                        logger.error(f"📦 BODY:    {json.dumps(parsed_body, ensure_ascii=False)}")
                    except json.JSONDecodeError:
                        if len(body_str) > 1000:
                            body_str = body_str[:1000] + "... [TRUNCATED]"
                        logger.error(f"📦 BODY:    {body_str}")
            except Exception:
                logger.error("📦 BODY:    [Could not read or decode body]")

        # 3. Thông tin lỗi từ Exception (khi code sập)
        if exception:
            logger.error(f"❌ ERROR:   {type(exception).__name__} - {str(exception)}")
        
        if traceback_str:
            logger.error(f"📜 TRACEBACK:\n{traceback_str}")

        # 4. Thông tin lỗi từ Response (khi view trả về lỗi 4xx, 5xx thông qua DRF)
        if response:
            logger.error(f"📤 STATUS:  {response.status_code}")
            if hasattr(response, 'content'):
                try:
                    # Thử decode content xem DRF báo lỗi gì
                    content_str = response.content.decode('utf-8')
                    try:
                        parsed_error = json.loads(content_str)
                        # In format json đẹp
                        logger.error(f"📄 DETAILS: {json.dumps(parsed_error, ensure_ascii=False, indent=2)}")
                    except json.JSONDecodeError:
                        if len(content_str) > 1000:
                            content_str = content_str[:1000] + "... [TRUNCATED]"
                        logger.error(f"📄 DETAILS: {content_str}")
                except Exception:
                    pass

        logger.error("=" * 65 + "\n")
