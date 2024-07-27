
document.addEventListener('DOMContentLoaded', function() {
    var viewershipBackButton = document.getElementById('viewershipBackButton');
    var viewershipNextButton = document.getElementById('viewershipNextButton');

    viewershipBackButton.addEventListener('click', function() {
        document.getElementById('viewershipOverTime').style.display = 'none';
        document.getElementById('episodeOverview').style.display = 'block';
    });

    viewershipNextButton.addEventListener('click', function() {
        document.getElementById('viewershipOverTime').style.display = 'none';
        document.getElementById('directorAnalysis').style.display = 'block';
    });

    d3.csv("FamilyGuyDataset.csv").then(data => {
        createSeasonBarChart(data);
    }).catch(error => {
        console.error('Error loading the CSV data:', error);
    });
    function createSeasonBarChart(data) {
        const viewershipChart = d3.select('#viewershipChart');
        viewershipChart.selectAll("*").remove();

        const margin = { top: 20, right: 20, bottom: 50, left: 120 },
              width = 800 - margin.left - margin.right,
              height = 400 - margin.top - margin.bottom;

        const svg = viewershipChart.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear()
            .range([0, width]);
        const y = d3.scaleBand()
            .range([height, 0])
            .padding(0.1);

        let seasonViewers = {};
        data.forEach(d => {
            let season = d.Season;
            let viewers = parseFloat(d['U.S. Viewers (Millions)']);
            if (!isNaN(viewers)) {
                if (seasonViewers[season]) {
                    seasonViewers[season] += viewers;
                } else {
                    seasonViewers[season] = viewers;
                }
            }
        });
        console.log("Season Viewers Totals:", seasonViewers);

        let seasons = Object.keys(seasonViewers);

        seasons.sort((a, b) => a - b);

        const dataForChart = seasons.map(season => ({
            season: season,
            viewers: seasonViewers[season]
        })).sort((a, b) => a.viewers - b.viewers); 

        x.domain([0, d3.max(dataForChart, d => d.viewers)]);
        y.domain(dataForChart.map(d => d.season));

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append('text')
            .attr('class', 'axis-label')
            .attr('x', width / 2)
            .attr('y', height + margin.bottom - 2)
            .attr('text-anchor', 'middle')
            .text('Total Viewers (Millions)');

        svg.append('g')
            .attr('class', 'y axis')
            .call(d3.axisLeft(y));

        svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -margin.left + 80)
            .attr('text-anchor', 'middle')
            .text('Season');

        svg.selectAll('.bar')
            .data(dataForChart)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', 0)
            .attr('y', d => y(d.season))
            .attr('width', d => x(d.viewers))
            .attr('height', y.bandwidth())
            .attr('fill', 'steelblue');

        svg.selectAll('.label')
            .data(dataForChart)
            .enter().append('text')
            .attr('class', 'label')
            .attr('x', d => x(d.viewers) - 3)
            .attr('y', d => y(d.season) + y.bandwidth() / 2)
            .attr('dy', '.35em')
            .attr('text-anchor', 'end')
            .text(d => d.viewers.toFixed(2));
    }
});
