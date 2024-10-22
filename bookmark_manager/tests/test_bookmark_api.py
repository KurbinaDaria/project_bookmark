import pytest
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken
from bookmark_manager.models import Bookmark


@pytest.mark.django_db
def test_create_bookmark_authenticated(api_client, create_user):
    """Test creating a bookmark with an authenticated user."""

    # Generate tokens for the authenticated user
    tokens = RefreshToken.for_user(create_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens.access_token}')

    # Attempt to create a new bookmark
    response = api_client.post(
        reverse('bookmark-list'),
        {
            'title': 'New Bookmark',
            'url': 'http://example.com',
            'category': 'Tech',
        },
        format="json"
    )
    assert response.status_code == 201
    assert response.data['title'] == 'New Bookmark'
    assert response.data['user'] == create_user.id

@pytest.mark.django_db
def test_update_bookmark_authenticated(api_client, create_user):
    """Test updating a bookmark with an authenticated user."""

    # Create a bookmark first
    bookmark = Bookmark.objects.create(
        user=create_user,
        url='http://example.com',
        title='Old Bookmark',
        category='Tech',
    )

    tokens = RefreshToken.for_user(create_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens.access_token}')

    response = api_client.put(
        reverse('bookmark-detail', kwargs={'pk': bookmark.id}),
        {
            'title': 'Updated Bookmark',
            'url': 'http://updatedexample.com',
            'category': 'Tech',
        },
        format="json"
    )

    assert response.status_code == 200
    assert response.data['title'] == 'Updated Bookmark'


@pytest.mark.django_db
def test_update_bookmark_authenticated_invalid_data(api_client, create_user):
    """Test updating a bookmark with invalid data as an authenticated user."""
    bookmark = Bookmark.objects.create(
        user=create_user,
        url='http://example.com',
        title='Old Bookmark',
        category='Tech',
    )

    tokens = RefreshToken.for_user(create_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens.access_token}')

    response = api_client.put(
        reverse('bookmark-detail', kwargs={'pk': bookmark.id}),
        {
            'title': '',
            'url': 'http://updatedexample.com',
            'category': 'Tech',
        },
        format="json"
    )

    assert response.status_code == 400
