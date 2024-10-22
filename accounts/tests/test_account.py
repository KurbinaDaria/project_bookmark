# tests/test_api.py
import pytest
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken


@pytest.mark.django_db
class TestUserAPI:

    def test_user_registration(self, client, user_data, api_urls):
        """Test user registration endpoint."""
        user_data['confirm_password'] = user_data['password']
        response = client.post(api_urls['register'], user_data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['message'] == 'User registered successfully'

    def test_user_registration_password_mismatch(self, client, user_data, api_urls):
        """Test registration with password mismatch."""
        invalid_data = user_data.copy()
        invalid_data['confirm_password'] = 'DifferentPassword!'
        response = client.post(api_urls['register'], invalid_data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'confirm_password' in response.data

    def test_user_registration_email_validation(self, client, api_urls):
        """Test registration with invalid email."""
        invalid_data = {
            'username': 'testuser',
            'first_name': 'Test',
            'last_name': 'User',
            'email': 'invalid-email',
            'password': 'Password123!',
            'confirm_password': 'Password123!'
        }
        response = client.post(api_urls['register'], invalid_data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.data

    def test_user_login(self, client, create_user, api_urls):
        """Test user login endpoint."""
        response = client.post(api_urls['login'], {
            'username': create_user.username,
            'password': 'Password123!'
        })
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data

    def test_user_login_invalid_credentials(self, client, api_urls):
        """Test login with invalid credentials."""
        response = client.post(api_urls['login'], {
            'username': 'wronguser',
            'password': 'wrongpassword'
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'detail' in response.data

    def test_token_refresh(self, client, create_user, api_urls):
        """Test token refresh functionality."""
        refresh = RefreshToken.for_user(create_user)
        response = client.post(api_urls['token_refresh'], {'refresh': str(refresh)})
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data

    def test_token_refresh_invalid(self, client, api_urls):
        """Test token refresh with an invalid token."""
        response = client.post(api_urls['token_refresh'], {'refresh': 'invalidtoken'})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'detail' in response.data

    def test_user_logout(self, client, create_user, api_urls):
        """Test user logout functionality."""
        refresh = RefreshToken.for_user(create_user)
        access_token = str(refresh.access_token)
        response = client.post(api_urls['logout'], {'refresh': str(refresh)},
                               HTTP_AUTHORIZATION=f'Bearer {access_token}')
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_user_logout_invalid_token(self, client, api_urls):
        """Test logout with an invalid refresh token."""
        response = client.post(
            api_urls['logout'],
            {'refresh': 'invalidtoken'},
            HTTP_AUTHORIZATION='Bearer invalidtoken'
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'detail' in response.data

