
document.addEventListener('DOMContentLoaded', function() {
    d3.csv("FamilyGuyDataset.csv").then(data => {
        console.log(data); 
        createTable(data);
    }).catch(error => {
        console.error('Error loading the CSV data:', error);
    });
    function createTable(data) {

        d3.select('#buttonContainer').remove();
        const table = d3.select('#episodeOverviewMain').append('table');
        const thead = table.append('thead');
        const tbody = table.append('tbody');

        let seasons = Array.from(new Set(data.map(d => d.Season)));
        let episodes = Array.from(new Set(data.map(d => d["No. of Episode (Season)"])));

        seasons.sort((a, b) => a - b);
        episodes.sort((a, b) => a - b);

        const headerRow = thead.append('tr');
        headerRow.append('th').text('Episode'); 
        seasons.forEach(season => {
            headerRow.append('th').text('Season ' + season);
        });

        const colorScale = d3.scaleDiverging()
            .domain([0, 5, 10])
            .interpolator(d3.interpolateRdYlGn);

        const tooltip = d3.select('#episodeOverviewMain').append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('background-color', 'rgba(0, 0, 0, 0.75)')
            .style('color', '#fff')
            .style('padding', '5px')
            .style('border-radius', '5px')
            .style('display', 'none');

        episodes.forEach(episode => {
            const row = tbody.append('tr');
            row.append('td').text(episode);
            seasons.forEach(season => {
                const cell = row.append('td');

                const rating = data.find(d => d.Season == season && d["No. of Episode (Season)"] == episode);
                if (rating && rating["IMDb Rating"] !== 'N/A') {
                    cell.text(rating["IMDb Rating"]);
                    cell.style('background-color', colorScale(+rating["IMDb Rating"])); 

                    cell.on('mouseover', function(event) {
                        tooltip.style('display', 'block')
                        tooltip.html(
                            `<strong>Title:</strong> ${rating["Title of the Episode"]}<br>
                             <strong>Release Date:</strong> ${rating["Original Air Date"]}<br>
                             <strong>Director:</strong> ${rating["Director"]}`
                        );
                        
                    }).on('mousemove', function(event) {
                        tooltip.style('top', (event.pageY - tooltip.node().offsetHeight - 10) + 'px')
                            .style('left', (event.pageX - tooltip.node().offsetWidth / 2) + 'px'); 
                    }).on('mouseout', function() {
                        tooltip.style('display', 'none');
                    });
                } else {
                    cell.text(''); 
                }
            });
        });

        const buttonContainer = d3.select('#episodeOverviewMain').append('div').attr('id', 'buttonContainer');
        buttonContainer.append('button').attr('id', 'backButton').text('Back to Home');
        buttonContainer.append('button').attr('id', 'nextPageButton').text('Next Page');

        document.getElementById('backButton').addEventListener('click', function() {
            document.getElementById('episodeOverview').style.display = 'none';
            document.getElementById('homepage').style.display = 'block';
        });

        document.getElementById('nextPageButton').addEventListener('click', function() {
            document.getElementById('episodeOverview').style.display = 'none';
            document.getElementById('viewershipOverTime').style.display = 'block';
        });
    }
});
