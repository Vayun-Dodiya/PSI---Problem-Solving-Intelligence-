// PSI Analyze Page
console.log("PSI Analyze Page Loaded");


// Start New Analysis button
const newAnalysisBtn = document.getElementById("newAnalysisBtn");

if (newAnalysisBtn) {

    newAnalysisBtn.addEventListener("click", function () {

        window.location.href = "/";

    });

}