"""T Clock — Menu serializers"""

from rest_framework import serializers
from .models import Category, MenuItem


class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            'id', 'category', 'category_name', 'name', 'description',
            'price', 'half_price', 'quarter_price', 'image', 'is_veg',
            'is_available', 'is_featured', 'prep_time', 'calories', 'sort_order',
        ]
        extra_kwargs = {
            'half_price': {'required': False, 'allow_null': True},
            'quarter_price': {'required': False, 'allow_null': True},
            'description': {'required': False, 'allow_blank': True},
            'image': {'required': False, 'allow_null': True},
        }

    def to_internal_value(self, data):
        if hasattr(data, '_mutable'):
            data = data.copy()
        elif isinstance(data, dict):
            data = data.copy()

        for field in ['half_price', 'quarter_price', 'calories', 'image', 'description']:
            if field in data and (data[field] == '' or data[field] == 'null' or data[field] == 'undefined'):
                data[field] = None

        return super().to_internal_value(data)

    def create(self, validated_data):
        try:
            return super().create(validated_data)
        except Exception as e:
            if 'image' in validated_data and validated_data['image']:
                validated_data.pop('image', None)
                try:
                    return super().create(validated_data)
                except Exception:
                    pass
            raise serializers.ValidationError({'detail': f'Error creating menu item: {str(e)}'})

    def update(self, instance, validated_data):
        try:
            return super().update(instance, validated_data)
        except Exception as e:
            if 'image' in validated_data and validated_data['image']:
                validated_data.pop('image', None)
                try:
                    return super().update(instance, validated_data)
                except Exception:
                    pass
            raise serializers.ValidationError({'detail': f'Error updating menu item: {str(e)}'})



class CategorySerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'description', 'is_active', 'sort_order', 'items', 'item_count']

    def get_item_count(self, obj):
        return obj.items.filter(is_available=True).count()


class CategoryLightSerializer(serializers.ModelSerializer):
    """Category without nested items — for dropdown lists."""
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'is_active', 'sort_order']
