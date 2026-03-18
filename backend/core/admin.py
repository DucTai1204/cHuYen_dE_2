from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import NguoiDung, ToChuc

admin.site.register(ToChuc)

@admin.register(NguoiDung)
class NguoiDungAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Thông tin bổ sung', {'fields': ('id_to_chuc', 'ho_va_ten', 'vai_tro', 'trang_thai')}),
    )
    list_display = ('username', 'email', 'ho_va_ten', 'vai_tro', 'is_staff', 'is_active')
