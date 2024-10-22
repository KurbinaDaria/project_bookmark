import pytest
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.fixture
def user_data():
    """Fixture to provide user registration data."""
    return {
        'username': 'testuser',
        'first_name': 'Test',
        'last_name': 'User',
        'email': 'testuser@example.com',
        'password': 'Password123!',
        # Remove confirm_password from here
    }

@pytest.fixture
def create_user(user_data):
    """Fixture to create a user in the database."""
    user = User(**user_data)
    user.set_password(user_data['password'])
    user.save()
    return user

@pytest.fixture
def client_with_auth(client, create_user):
    """Fixture to provide an authenticated client."""
    refresh = RefreshToken.for_user(create_user)
    access_token = str(refresh.access_token)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    return client

@pytest.fixture
def api_urls():
    """Fixture to provide URLs for the API endpoints."""
    return {
        'register': reverse('register'),
        'login': reverse('login'),
        'logout': reverse('logout'),
        'token_refresh': reverse('token_refresh'),
    }
