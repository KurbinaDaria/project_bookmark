$(document).ready(function () {
    // Show the add bookmark form when the button is clicked
    $('#add-bookmark').click(function (e) {
        e.preventDefault();
        $('#bookmarks-list').hide();
        $('#add-bookmark-form').show();
    });

    // View bookmarks when the button is clicked
    $('#view-bookmarks').click(function (e) {
        e.preventDefault();
        fetchBookmarks();
        $('#add-bookmark-form').hide();
        $('#bookmarks-list').show();
    });

    // Handle form submission to add a bookmark
    $('#bookmark-form').submit(function (e) {
        e.preventDefault(); // Prevent default form submission

        const url = $('#url').val();
        const title = $('#title').val();
        const category = $('#category').val() || null; // Set to null if empty

        $.ajax({
            type: 'POST',
            url: 'http://127.0.0.1:8000/api/bookmarks/',  // Your API endpoint
            data: JSON.stringify({ url, title, category }),
            contentType: 'application/json',
            success: function () {
                alert('Bookmark added successfully!');
                $('#bookmark-form')[0].reset(); // Clear form inputs
                fetchBookmarks();  // Refresh bookmarks list after adding
            },
            error: handleAjaxError // Use the reusable error handler
        });
    });

    // Fetch all bookmarks
    function fetchBookmarks() {
        $.ajax({
            type: 'GET',
            url: 'http://127.0.0.1:8000/api/bookmarks/',
            success: function (data) {
                $('#bookmarks').empty();
                const favoriteBookmarks = data.filter(bookmark => bookmark.is_favorite);
                const otherBookmarks = data.filter(bookmark => !bookmark.is_favorite);

                if (favoriteBookmarks.length > 0) {
                    $('#bookmarks').append('<h3>Favorites</h3>');
                    appendBookmarkList(favoriteBookmarks);
                }

                const categories = {};
                otherBookmarks.forEach(bookmark => {
                    const category = bookmark.category || 'Без категорії';
                    if (!categories[category]) {
                        categories[category] = [];
                    }
                    categories[category].push(bookmark);
                });

                for (const category in categories) {
                    $('#bookmarks').append(`<h3>${category}</h3>`);
                    appendBookmarkList(categories[category]);
                }

                attachEventHandlers(); // Attach event handlers for new bookmarks
            },
            error: function () {
                alert('Error fetching bookmarks');
            }
        });
    }

    // Append bookmark list to the UI
    function appendBookmarkList(bookmarks) {
        const bookmarkList = $('<ul></ul>');
        bookmarks.forEach(bookmark => {
            bookmarkList.append(`
                <li>
                    ${bookmark.title} - <a href="${bookmark.url}" target="_blank">${bookmark.url}</a>
                    <button class="delete-bookmark" data-id="${bookmark.id}">Delete</button>
                    <button class="favorite-bookmark" data-id="${bookmark.id}" data-favorite="${bookmark.is_favorite}">
                        ${bookmark.is_favorite ? 'Unfavorite' : 'Favorite'}
                    </button>
                    <button class="edit-bookmark" data-id="${bookmark.id}">Edit</button>
                </li>
            `);
        });
        $('#bookmarks').append(bookmarkList);
    }

    // Attach event handlers to dynamically added buttons
    function attachEventHandlers() {
        $('.delete-bookmark').click(function () {
            const id = $(this).data('id');
            deleteBookmark(id);
        });

        $('.favorite-bookmark').click(function () {
            const id = $(this).data('id');
            toggleFavorite(id);
        });

        $('.edit-bookmark').click(function () {
            const id = $(this).data('id');
            fetchBookmark(id);  // Fetch and pre-fill the form with bookmark details
        });
    }

    // Delete a bookmark
    function deleteBookmark(id) {
        $.ajax({
            type: 'DELETE',
            url: `http://127.0.0.1:8000/api/bookmarks/${id}/`,
            success: function () {
                alert('Bookmark deleted successfully!');
                fetchBookmarks();  // Refresh bookmarks list after deletion
            },
            error: handleAjaxError // Use the reusable error handler
        });
    }

    // Toggle the favorite status of a bookmark
    function toggleFavorite(id) {
        $.ajax({
            type: 'PATCH',
            url: `http://127.0.0.1:8000/api/bookmarks/${id}/favorite/`,
            success: function (data) {
                alert(`Bookmark marked as ${data.favorite ? 'favorite' : 'not favorite'}`);
                fetchBookmarks();  // Refresh bookmarks list after toggling
            },
            error: handleAjaxError // Use the reusable error handler
        });
    }

    // Fetch a specific bookmark by ID
    function fetchBookmark(id) {
        $.ajax({
            type: 'GET',
            url: `http://127.0.0.1:8000/api/bookmarks/${id}/`,
            success: function (bookmark) {
                $('#url').val(bookmark.url);
                $('#title').val(bookmark.title);
                $('#category').val(bookmark.category);

                $('#bookmarks-list').hide();
                $('#add-bookmark-form').show();

                $('#bookmark-form').off('submit').submit(function (e) {
                    e.preventDefault();  // Prevent default form submission
                    updateBookmark(id);  // Call update function instead of add
                });
            },
            error: function () {
                alert('Error fetching bookmark details');
            }
        });
    }

    // Update a bookmark
    function updateBookmark(id) {
        const url = $('#url').val();
        const title = $('#title').val();
        const category = $('#category').val() || null;  // Set to null if empty

        $.ajax({
            type: 'PATCH',
            url: `http://127.0.0.1:8000/api/bookmarks/${id}/`,
            data: JSON.stringify({ url, title, category }),
            contentType: 'application/json',
            success: function () {
                alert('Bookmark updated successfully!');
                $('#bookmark-form')[0].reset();  // Clear the form
                fetchBookmarks();  // Refresh bookmarks list after updating
                $('#add-bookmark-form').hide();
                $('#bookmarks-list').show();
            },
            error: handleAjaxError // Use the reusable error handler
        });
    }

    // Handle canceling bookmark addition
    $('#cancel-add').click(function () {
        $('#add-bookmark-form').hide();
        $('#bookmark-form')[0].reset(); // Reset form inputs
    });

    // Handle going back to the main view
    $('#back-to-main').click(function () {
        $('#bookmarks-list').hide();
        $('#add-bookmark-form').hide();
    });

    // Search functionality for bookmark by ID
    $('#search-bookmark-btn').click(function(e) {
        e.preventDefault(); // Stop the page from refreshing
        const bookmarkId = $('#bookmark-id').val(); // Get the ID from the input field

        if (bookmarkId) {
            $.ajax({
                url: `http://127.0.0.1:8000/api/bookmarks/${bookmarkId}/`, // Your API
                type: 'GET',
                success: function(data) {
                    $('#result-content').html(`
                        <p>ID: ${data.id}</p>
                        <p>Title: ${data.title}</p>
                        <p>Category: ${data.category || 'Без категорії'}</p>
                        <p>Is Favorite: ${data.is_favorite ? 'Так' : 'Ні'}</p>
                    `);
                    $('#search-result').show(); // Show the results block
                },
                error: function(xhr) {
                    if (xhr.status === 404) {
                        // Redirect to the custom 404 error page
                        window.location.href = '/404.html'; // Adjust this path as necessary
                    } else {
                        $('#result-content').html(`<p style="color:red;">Сталася помилка: ${xhr.statusText}</p>`);
                    }
                    $('#search-result').show(); // Show the results block
                }
            });
        } else {
            alert("Будь ласка, введіть дійсний ID закладки");
        }
    });

    // Reusable error handling function for AJAX requests
    function handleAjaxError(jqXHR, textStatus, errorThrown) {
        console.error('AJAX Error:', textStatus, errorThrown);
        alert('Error: ' + (jqXHR.responseText || errorThrown));
    }
});
