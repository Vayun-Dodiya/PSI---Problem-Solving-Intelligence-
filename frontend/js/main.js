console.log("PSI Home Page Loaded");

const problemInput = document.querySelector(".problem-input");

problemInput.addEventListener("input", () => {
    problemInput.style.height = "auto";
    problemInput.style.height =
        Math.min(problemInput.scrollHeight, 180) + "px";
});

