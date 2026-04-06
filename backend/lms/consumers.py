import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import TinNhan
from core.models import NguoiDung

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Lấy user_id từ URL
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'chat_{self.user_id}'

        # Tham gia vào group chat riêng của user này
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Rời khỏi group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Nhận tin nhắn từ WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get('type', 'chat_message') # mặc định là gửi tin
        receiver_id = data.get('receiver_id')
        sender_id = data.get('sender_id')

        if not receiver_id or not sender_id:
            return

        receiver_group = f'chat_{receiver_id}'

        # 1. Xử lý gửi tin nhắn thực sự
        if msg_type == 'chat_message':
            message = data.get('message')
            if not message: return
            
            # Lưu tin nhắn vào Database
            saved_msg = await self.save_message(sender_id, receiver_id, message)

            msg_payload = {
                'type': 'chat_message',
                'id_tin_nhan': saved_msg['id_tin_nhan'],
                'message': message,
                'sender_id': sender_id,
                'sender_name': saved_msg['sender_name'],
                'receiver_id': receiver_id,
                'ngay_gui': saved_msg['ngay_gui'],
            }

            # Gửi tới người nhận và chính người gửi
            await self.channel_layer.group_send(receiver_group, msg_payload)
            await self.channel_layer.group_send(self.room_group_name, msg_payload)

        # 2. Xử lý thu hồi tin nhắn
        elif msg_type == 'recall_message':
            message_id = data.get('message_id')
            if not message_id: return
            
            # Cập nhật DB
            success = await self.recall_message_in_db(message_id, sender_id)
            if success:
                recall_payload = {
                    'type': 'recall_message',
                    'message_id': message_id,
                    'sender_id': sender_id,
                    'receiver_id': receiver_id,
                }
                # Gửi tới cả 2 bên
                await self.channel_layer.group_send(receiver_group, recall_payload)
                await self.channel_layer.group_send(self.room_group_name, recall_payload)

        # 3. Xử lý trạng thái đang soạn tin (Typing)
        elif msg_type in ['typing', 'stop_typing']:
            await self.channel_layer.group_send(
                receiver_group,
                {
                    'type': 'user_typing',
                    'action': msg_type,
                    'sender_id': sender_id,
                }
            )

    # Handler cho tin nhắn chat
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'id_tin_nhan': event.get('id_tin_nhan'),
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'receiver_id': event['receiver_id'],
            'ngay_gui': event['ngay_gui'],
        }))

    # Handler cho thu hồi tin nhắn
    async def recall_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'recall_message',
            'message_id': event['message_id'],
            'sender_id': event['sender_id'],
        }))

    # Handler cho sự kiện "Đã xem" - gửi tới người gửi tin để họ thấy tick xanh
    async def message_seen(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_seen',
            'viewer_id': event['viewer_id'],   # người đã xem (receiver cũ)
            'sender_id': event['sender_id'],   # người đã gửi tin (sẽ thấy "Đã xem")
        }))

    # Handler cho trạng thái typing
    async def user_typing(self, event):
        await self.send(text_data=json.dumps({
            'type': event['action'],
            'sender_id': event['sender_id'],
        }))

    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, content):
        sender = NguoiDung.objects.get(id_nguoi_dung=sender_id)
        receiver = NguoiDung.objects.get(id_nguoi_dung=receiver_id)
        msg = TinNhan.objects.create(
            id_nguoi_gui=sender,
            id_nguoi_nhan=receiver,
            noi_dung=content
        )
        return {
            'id_tin_nhan': msg.id_tin_nhan,
            'sender_name': sender.ho_va_ten or sender.username,
            'ngay_gui': msg.ngay_gui.isoformat()
        }

    @database_sync_to_async
    def recall_message_in_db(self, message_id, sender_id):
        try:
            msg = TinNhan.objects.get(id_tin_nhan=message_id, id_nguoi_gui=sender_id)
            msg.is_recalled = True
            msg.save()
            return True
        except TinNhan.DoesNotExist:
            return False
