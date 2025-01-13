document.addEventListener('DOMContentLoaded', function() {
    // Initialize photo editing functionality
    const editPhotoBtn = document.getElementById('editPhotoBtn');
    if (editPhotoBtn) {
        editPhotoBtn.addEventListener('click', function() {
            document.getElementById('avatarSelection').classList.toggle('d-none');
        });
    }

    const avatarInputs = document.querySelectorAll('.avatar-option input[type="radio"]');
    avatarInputs.forEach(input => {
        input.addEventListener('change', function() {
            document.getElementById('avatar-form').submit();
        });
    });

    // Initialize edit profile functionality
    const editButton = document.querySelector('.edit-toggle');
    const editableFields = document.querySelectorAll('[data-editable]');
    const editModeButtons = document.querySelector('.edit-mode-buttons');
    const saveModeButtons = document.querySelector('.save-mode-buttons');

    function toggleEditMode(isEditing) {
        editableFields.forEach(field => {
            field.classList.toggle('editing', isEditing);
            const input = field.querySelector('input');
            if (input) {
                input.disabled = !isEditing;
            }
        });
        editModeButtons.classList.toggle('d-none', isEditing);
        saveModeButtons.classList.toggle('d-none', !isEditing);
    }

    if (editButton) {
        editButton.addEventListener('click', () => toggleEditMode(true));
    }

    const cancelButton = document.querySelector('.cancel-edit');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            editableFields.forEach(field => {
                const input = field.querySelector('input');
                const text = field.querySelector('.profile-text');
                if (input && text) {
                    input.value = text.textContent.trim();
                }
            });
            toggleEditMode(false);
        });
    }

    // Initialize form submission
    const profileForm = document.querySelector('form.profile-form');
    if (profileForm) {
        window.initializeFormSubmission(profileForm, () => {
            window.location.reload();
        });
    }
});