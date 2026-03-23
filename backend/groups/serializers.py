from rest_framework import serializers
from .models import Group, GroupMember
from accounts.serializers import UserSerializer

class GroupMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = GroupMember
        fields = ('user', 'user_id', 'role', 'joined_at', 'nickname_in_group')
        read_only_fields = ('joined_at',)

class GroupSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    memberships = GroupMemberSerializer(many=True, read_only=True)
    settlements = serializers.SerializerMethodField()
    members_count = serializers.IntegerField(source='memberships.count', read_only=True)

    class Meta:
        model = Group
        fields = ('id', 'name', 'description', 'avatar', 'currency', 'created_by', 'created_at', 'is_private', 'invite_code', 'otp_required', 'category', 'is_archived', 'members_count', 'memberships', 'settlements')
        read_only_fields = ('id', 'invite_code', 'created_at', 'created_by', 'memberships')

    def get_settlements(self, obj):
        settlements = obj.settlements.all().order_by('-settled_at')
        return [{
            "id": s.id,
            "paid_by": s.paid_by.username,
            "paid_to": s.paid_to.username,
            "amount": str(s.amount),
            "settled_at": s.settled_at,
            "is_confirmed": s.is_confirmed
        } for s in settlements]


