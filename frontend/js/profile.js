document.addEventListener("DOMContentLoaded", function () {

    const saveButton = document.querySelector(".save-btn");

    saveButton.addEventListener("click", function () {

        const name = document.querySelector(
            'input[type="text"]'
        ).value;

        if (name.trim() === "") {
            alert("Please enter your name.");
            return;
        }

        alert("Profile saved successfully!");

    });

});