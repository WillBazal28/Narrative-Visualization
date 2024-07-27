document.addEventListener('DOMContentLoaded', function() {
    var homepageButton = document.getElementById('homepageOverviewButton');
    var backButton = document.getElementById('backButton');

    homepageButton.addEventListener('click', function() {
        document.getElementById('homepage').style.display = 'none';
        document.getElementById('episodeOverview').style.display = 'block';
        document.getElementById('episodeOverviewMain').style.display = 'block';
    });

    backButton.addEventListener('click', function() {
        document.getElementById('episodeOverview').style.display = 'none';
        document.getElementById('episodeOverviewMain').style.display = 'none';
        document.getElementById('homepage').style.display = 'block';
    });
});