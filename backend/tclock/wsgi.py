"""Django WSGI config for Cedar Hearth project."""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tclock.settings')
application = get_wsgi_application()
