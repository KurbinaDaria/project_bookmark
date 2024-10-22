import pytest
from rest_framework.test import APIClient
from bookmark_manager.models import Bookmark
from django.contrib.auth import get_user_model


User = get_user_model()

@pytest.fixture
def create_user(db):
    user = User.objects.create_user(
        username='testuser',
        first_name='Test',
        last_name='User',
        email='testuser@example.com',
        password='Password123!'
    )
    return user


@pytest.fixture
def api_client():
    """
    Fixture to provide an API client for making requests in tests.
    """
    return APIClient()

@pytest.fixture
def create_bookmark():
    """
    Fixture to create a sample bookmark object in the database.
    """
    bookmark = Bookmark.objects.create(
        url='https://example.com',
        title='Example Bookmark',
        category='Study'
    )
    return bookmark
