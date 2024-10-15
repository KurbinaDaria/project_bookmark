$(document).ready(function () {
    // Function to get the CSRF token from the cookie
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const csrftoken = getCookie('csrftoken');

    // Set up global AJAX settings to include CSRF token in request headers
    $.ajaxSetup({
        headers: { "X-CSRFToken": csrftoken }
    });

    // Show the registration form when the button is clicked
    $('#show-register').click(function () {
        $('#login-form').hide();
        $('#registration-form').show();
        $('#message').empty(); // Clear any previous messages
    });

    // Show the login form when the button is clicked
    $('#show-login').click(function () {
        $('#registration-form').hide();
        $('#login-form').show();
        $('#message').empty(); // Clear any previous messages
    });

    // Handle registration form submission
    // Handle registration form submission
$('#register-form').submit(function (e) {
    e.preventDefault(); // Prevent default form submission

    const username = $('#reg-username').val();
    const firstName = $('#reg-first-name').val();
    const lastName = $('#reg-last-name').val();
    const email = $('#reg-email').val();
    const password = $('#reg-password').val();
    const passwordCheck = $('#reg-password-check').val();

    if (password !== passwordCheck) {
        $('#message').html('<p style="color:red;">Passwords do not match!</p>');
        return;
    }

    $.ajax({
        type: 'POST',
        url: '/api/accounts/register/', // Ensure this matches your Django path
        data: JSON.stringify({
            username: username,
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password
        }),
        contentType: 'application/json',
        success: function () {
            $('#message').html('<p>Registration successful! Please log in.</p>');
            $('#registration-form').hide(); // Hide registration form after success
            $('#login-form').show(); // Show login form
        },
        error: function (error) {
            let errorMessage = 'Registration failed: ';
            if (error.responseJSON) {
                const errors = error.responseJSON;

                // Loop through errors and append them to the message
                for (const field in errors) {
                    if (errors.hasOwnProperty(field)) {
                        errorMessage += `<br>${field}: ${errors[field].join(', ')}`;
                    }
                }
            } else {
                errorMessage += error.statusText;
            }
            $('#message').html(`<p style="color:red;">${errorMessage}</p>`);
        }
    });
});


    // Handle login form submission
    $('#login-form-id').submit(function (e) {
        e.preventDefault(); // Prevent default form submission

        const username = $('#login-username').val();
        const password = $('#login-password').val();

        $.ajax({
            type: 'POST',
            url: '/api/accounts/login/', // Ensure this matches your Django path
            data: JSON.stringify({
                username: username,
                password: password
            }),
            contentType: 'application/json',
            success: function (response) {
                // Store tokens in local storage
                localStorage.setItem('access_token', response.access);
                localStorage.setItem('refresh_token', response.refresh);
                $('#message').html('<p>Login successful!</p>');
                // Redirect to bookmarks or dashboard page
                window.location.href = '/api/bookmarks/'; // Change this path as necessary
            },
            error: function (error) {
                let errorMessage = 'Login failed: ';
                if (error.responseJSON) {
                    const errors = error.responseJSON;
                    if (errors.non_field_errors) {
                        errorMessage += errors.non_field_errors.join(', ');
                    } else {
                        for (const field in errors) {
                            if (errors.hasOwnProperty(field)) {
                                errorMessage += `<br>${field}: ${errors[field].join(', ')}`;
                            }
                        }
                    }
                } else {
                    errorMessage += error.statusText;
                }
                $('#message').html(`<p style="color:red;">${errorMessage}</p>`);
            }
        });
    });
});
