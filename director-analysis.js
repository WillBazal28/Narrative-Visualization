document.addEventListener('DOMContentLoaded', function() {
    d3.csv("FamilyGuyDataset.csv").then(data => {
        createDirectorPage(data);
    }).catch(error => {
        console.error('Error loading the CSV data:', error);
    });

    function createDirectorPage(data) {
        const directorTable = d3.select('#directorTable');
        directorTable.selectAll("*").remove(); 

        const directorStats = {};

        data.forEach(d => {
            const director = d.Director;
            const rating = parseFloat(d['IMDb Rating']);
            const viewers = parseFloat(d['U.S. Viewers (Millions)']);
            const episodeCount = d['No. of Episode (Overall)'];
            const runtime = parseFloat(d['Running Time (Minutes)']);

            if (director) {
                if (!directorStats[director]) {
                    directorStats[director] = { count: 0, totalRating: 0, totalViewers: 0, totalRuntime: 0 };
                }
                directorStats[director].count++;
                directorStats[director].totalRating += rating;
                directorStats[director].totalViewers += viewers;
                directorStats[director].totalRuntime += runtime;
            }
        });

        const directorArray = Object.keys(directorStats).map(director => {
            const stats = directorStats[director];
            return {
                director: director,
                episodeCount: stats.count,
                avgRating: stats.totalRating / stats.count,
                avgRuntime: stats.totalRuntime / stats.count,
                totalViewers: stats.totalViewers
            };
        });

        directorArray.sort((a, b) => b.episodeCount - a.episodeCount);


        const topDirectors = directorArray.slice(0, 15);


        const table = directorTable.append('table');
        const thead = table.append('thead');
        const tbody = table.append('tbody');


        const headerRow = thead.append('tr');
        headerRow.append('th').text('Director').style('text-align', 'center');
        headerRow.append('th').text('Number of Episodes').style('text-align', 'center');
        headerRow.append('th').text('Average Runtime (Minutes)').style('text-align', 'center');
        headerRow.append('th').text('Average IMDb Rating').style('text-align', 'center');


        const colorScale = d3.scaleDiverging()
            .domain([0, 5, 10])
            .interpolator(d3.interpolateRdYlGn);


        topDirectors.forEach(director => {
            const row = tbody.append('tr');
            row.append('td').text(director.director);
            row.append('td').text(director.episodeCount);
            row.append('td').text(director.avgRuntime.toFixed(2));
            row.append('td')
                .text(director.avgRating.toFixed(2))
                .style('background-color', colorScale(director.avgRating)); 

            row.on('mouseover', function(event) {

                tooltip.style('visibility', 'visible');
                tooltip.style('top', `${event.pageY + 10}px`).style('left', `${event.pageX + 10}px`);
                tooltipContent.html(`
                    <strong>Most Viewed Episode:</strong><br>
                    <strong>Title:</strong> ${director.mostViewedEpisode.title}<br>
                    <strong>Viewers:</strong> ${director.mostViewedEpisode.viewers.toFixed(2)}
                `);
            })
            .on('mousemove', function(event) {
                tooltip.style('top', `${event.pageY + 10}px`).style('left', `${event.pageX + 10}px`);
            })
            .on('mouseout', function() {
                tooltip.style('visibility', 'hidden');
                tooltipContent.html(""); 
            });
        });

        createBarChart(topDirectors);
    }

    function createBarChart(directors) {
        const directorChart = d3.select('#directorChart');
        directorChart.selectAll("*").remove(); 

        const margin = { top: 20, right: 20, bottom: 100, left: 100 },
              width = 800 - margin.left - margin.right,
              height = 600 - margin.top - margin.bottom; 

        const svg = directorChart.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear()
            .range([0, width]);

        const y = d3.scaleBand()
            .range([height, 0])
            .padding(0.1);

        const dataForChart = directors.map(director => ({
            director: director.director,
            viewers: director.totalViewers
        })).filter(d => !isNaN(d.viewers)) 
        .sort((a, b) => a.viewers - b.viewers); 

        x.domain([0, d3.max(dataForChart, d => d.viewers)]);
        y.domain(dataForChart.map(d => d.director));

        // Append x-axis
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        // Add x-axis label
        svg.append('text')
            .attr('class', 'axis-label')
            .attr('x', width / 2)
            .attr('y', height + margin.bottom - 50)
            .attr('text-anchor', 'middle')
            .text('Total Viewers (Millions)');

        // Append y-axis
        svg.append('g')
            .attr('class', 'y axis')
            .call(d3.axisLeft(y));

        // Add y-axis label
        svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -margin.left + 15)
            .attr('text-anchor', 'middle')
            .text('Director');

        // Create bars
        svg.selectAll('.bar')
            .data(dataForChart)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', 0)
            .attr('y', d => y(d.director))
            .attr('width', d => x(d.viewers))
            .attr('height', y.bandwidth())
            .attr('fill', 'steelblue');

        // Add labels
        svg.selectAll('.label')
            .data(dataForChart)
            .enter().append('text')
            .attr('class', 'label')
            .attr('x', d => x(d.viewers) - 3)
            .attr('y', d => y(d.director) + y.bandwidth() / 2)
            .attr('dy', '.35em')
            .attr('text-anchor', 'end')
            .text(d => d.viewers.toFixed(2));
    }

    document.getElementById('directorBackButton').addEventListener('click', function() {
        document.getElementById('directorAnalysis').style.display = 'none';
        document.getElementById('viewershipOverTime').style.display = 'block';
    });

    document.getElementById('homeButton').addEventListener('click', function() {
        document.getElementById('directorAnalysis').style.display = 'none';
        document.getElementById('homepage').style.display = 'block';
    });
});
