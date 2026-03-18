from rest_framework import permissions

class IsQuanTri(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.vai_tro == 'QuanTri')

class IsGiangVien(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.vai_tro == 'GiangVien')

class IsHocVien(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.vai_tro == 'HocVien')

class IsNguoiXacThucOrDoanhNghiep(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.vai_tro == 'NguoiXacThuc' or request.user.id_to_chuc))
