from django.core.management.base import BaseCommand
from accounts.models import User
from menu.models import Category, MenuItem
from tables.models import DiningTable

class Command(BaseCommand):
    help = 'Seeds PostgreSQL database with default admin user, menu categories, dishes, and dining tables'

    def handle(self, *args, **options):
        # 1. Admin user
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'role': 'admin',
                'first_name': 'Admin',
                'last_name': 'Manager',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS('Created initial admin user: admin / admin123'))
        else:
            self.stdout.write(self.style.SUCCESS('Admin user exists. Preserving custom client password.'))

        # 2. Staff user
        staff, s_created = User.objects.get_or_create(
            username='staff',
            defaults={
                'role': 'staff',
                'first_name': 'Cashier',
                'last_name': 'Staff',
                'is_staff': True,
            }
        )
        if s_created:
            staff.set_password('staff123')
            staff.save()

        # 3. Kitchen user
        kitchen, k_created = User.objects.get_or_create(
            username='kitchen',
            defaults={
                'role': 'kitchen',
                'first_name': 'Kitchen',
                'last_name': 'Chef',
                'is_staff': True,
            }
        )
        if k_created:
            kitchen.set_password('kitchen123')
            kitchen.save()

        # 4. Dining Tables
        for i in range(1, 11):
            DiningTable.objects.get_or_create(
                number=f"T{i}",
                defaults={'name': f"Table {i}", 'capacity': 4, 'status': 'available'}
            )

        # 5. Categories & Menu Items
        cats = [
            ('Coffee', '☕', 1),
            ('Non Coffee', '🥤', 2),
            ('Food', '🍛', 3),
            ('Snack', '🥪', 4),
        ]
        for name, icon, order in cats:
            Category.objects.get_or_create(
                name=name,
                defaults={'icon': icon, 'sort_order': order}
            )

        coffee_cat = Category.objects.filter(name='Coffee').first()
        food_cat = Category.objects.filter(name='Food').first()
        snack_cat = Category.objects.filter(name='Snack').first()

        if coffee_cat:
            MenuItem.objects.get_or_create(
                name='Cappuccino',
                defaults={
                    'category': coffee_cat,
                    'price': 150.00,
                    'half_price': 100.00,
                    'quarter_price': 60.00,
                    'is_veg': True,
                    'description': 'Rich espresso with steamed milk foam.',
                    'image': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&auto=format&fit=crop&q=80',
                    'is_available': True,
                }
            )
            MenuItem.objects.get_or_create(
                name='Cappuccino Special',
                defaults={
                    'category': coffee_cat,
                    'price': 150.00,
                    'half_price': 100.00,
                    'quarter_price': 60.00,
                    'is_veg': True,
                    'description': 'Double shot creamy cappuccino with caramel drizzle.',
                    'image': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&auto=format&fit=crop&q=80',
                    'is_available': True,
                }
            )

        if food_cat:
            MenuItem.objects.get_or_create(
                name='Biriyani',
                defaults={
                    'category': food_cat,
                    'price': 350.00,
                    'half_price': 220.00,
                    'quarter_price': 120.00,
                    'is_veg': False,
                    'description': 'Fragrant basmati rice cooked with authentic spices.',
                    'image': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
                    'is_available': True,
                }
            )
            MenuItem.objects.get_or_create(
                name='Arabic Salad',
                defaults={
                    'category': food_cat,
                    'price': 150.00,
                    'half_price': 90.00,
                    'quarter_price': 50.00,
                    'is_veg': True,
                    'description': 'Fresh garden vegetables with feta, olive oil, and herbs.',
                    'image': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80',
                    'is_available': True,
                }
            )

        if snack_cat:
            MenuItem.objects.get_or_create(
                name='Club Sandwich',
                defaults={
                    'category': snack_cat,
                    'price': 180.00,
                    'half_price': 110.00,
                    'quarter_price': 70.00,
                    'is_veg': True,
                    'description': 'Triple-decker toasted sandwich with cheese & veggies.',
                    'image': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&auto=format&fit=crop&q=80',
                    'is_available': True,
                }
            )

        self.stdout.write(self.style.SUCCESS('PostgreSQL Database seeded with reference categories & items!'))
