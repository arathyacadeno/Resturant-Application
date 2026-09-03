"""T Clock — accounts app serializers"""

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, CustomRole


class CustomRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomRole
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    custom_role_data = CustomRoleSerializer(source='custom_role', read_only=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'custom_role', 'custom_role_data', 'date_joined', 'is_active', 'raw_password', 'password']
        read_only_fields = ['id', 'date_joined']

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password and str(password).strip():
            pwd_clean = str(password).strip()
            instance.set_password(pwd_clean)
            instance.raw_password = pwd_clean
        instance.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=4)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'phone', 'custom_role']

    def create(self, validated_data):
        password = validated_data['password']
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'staff'),
            phone=validated_data.get('phone', ''),
        )
        user.raw_password = password
        custom_role = validated_data.get('custom_role')
        if custom_role:
            user.custom_role = custom_role
            user.role = custom_role.base_access
        user.save()
        return user


class CustomTokenSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer that includes user role and name in the token response."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'name': self.user.get_full_name() or self.user.username,
            'role': self.user.role,
            'email': self.user.email,
        }
        return data


class RestaurantSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = __import__('accounts.models', fromlist=['RestaurantSettings']).RestaurantSettings
        fields = ['name', 'tagline', 'address', 'phone', 'gstin', 'footer']
