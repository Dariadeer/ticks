import './lib/jquery.js';
import './lib/leaflet.js';
import './lib/jquery.form.js';


const UK_CENTER = [52.802761, -1.516113];

const CHART_OPTIONS = {
    scales: {
        y: {
            responsive: true,
            beginAtZero: true,
            maintainAspectRatio: false
        }
    }
};

const chartModes = {
    0: 'week',
    1: 'month',
    2: 'year'
}

let map;
let markers;
let resultList;
let tagList;
let locations;
let chart;
let chartElement;

const severities = {
    0: 'low',
    1: 'medium',
    2: 'high'
}

$(main);

function main() {
    initElements();

    chartElement = $('#chart');
    
    map = L.map('map').setView(UK_CENTER, 7);

    map.createPane('background');
    map.getPane('background').style.zIndex = 100;
    L.tileLayer('https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png', {
        maxZoom: 10,
	    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        pane: 'background'
    }).addTo(map);

    markers = L.layerGroup().addTo(map);
    map.createPane('markers');
    map.getPane('markers').style.zIndex = 200; // lower than labels
    // map.getPane('markers').style.pointerEvents = 'none'; // optional

    map.createPane('labels');
    map.getPane('labels').style.zIndex = 300;
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        minZoom: 0,
        maxZoom: 10,
	    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        ext: 'png',
        pane: 'labels'
    }).addTo(map);

    resultList = $('#result-list');
    tagList = $('#tag-list');

    $('#search-form').ajaxForm(res => showSightings(res.data)); 

    $('#report-form').ajaxForm({
        success: res => showResultMessage(res),
        error: error => showResultMessage({ error })
    });

    $('#back').click(() => {
        $('#map').removeClass('hidden');
        $('#chart-container').addClass('hidden');
    })

}

function showSightings(data) {
    markers.clearLayers();
    resultList.empty();
    $('#chart-container').addClass('hidden');
    $('#map').removeClass('hidden');
    const max = data.max;
    let i = 1;
    const allResultElement = createResultElement(data.total, 'All Locations', 3, {
            tickId: data.tick ? data.tick.id : null,
            locationId: -1,
            after: data.after,
            before: data.before
        });
    resultList.append(allResultElement);
    for(let sighting of data.sightings) {
        let { location, count, severity } = sighting;
        let { color, fillColor } = getMarkerColor(severity)
        let marker = L.circleMarker([ location.latitude, location.longtitude ], {
            color: color,
            fillColor: fillColor,
            fillOpacity: 0.5,
            radius: 10 + (count / max) * 5,
            pane: 'markers'
        }).addTo(markers);
        marker.text = location.name + '<br>Sightings: ' + count;
        marker.on('mouseover', showMarkerTip);
        const statOptions = {
            tickId: data.tick ? data.tick.id : null,
            locationId: location.id,
            location: location.name,
            after: data.after,
            before: data.before
        }
        const resultElement = createResultElement(count, location.name + ` (${location.admin_name})`, severity, statOptions);
        
        resultList.append(resultElement);

        marker.position = i;
        marker.resultElement = resultElement;
        marker.on('click', navigateToResult);
        i++;
    }

    if(data.tick) {
        $('#result-title').text(`Results (${data.sum})`);
        tagList.empty();
        tagList.append(createTag(data.tick.species.toLowerCase()));
        tagList.append(createTag(data.tick.latinName.toLowerCase()));
        if(data.severity >= 0) tagList.append(createTag('severity: ' + severities[data.severity]));
    } else {
        $('#result-title').text(`Results (${data.sum})`);
    }    
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

async function showChart(statOptions, mode) {
    const raw = await fetch(`/api/ticks/trends?id=${statOptions.tickId}&mode=${mode}&locationId=${statOptions.locationId}&after=${statOptions.after}&before=${statOptions.before}`);
    const json = await raw.json();
    $('#chart-container').removeClass('hidden');
    $('#map').addClass('hidden');

    const trends = json.data.trends;
    const labels = [];
    const values = [];
    switch(mode) {
        case 0:
            const firstWeek = trends[0];
            labels.push(firstWeek.week);
            values.push(firstWeek.count);
            let nextWeekDate = new Date(firstWeek.week), nextWeekDateString;
            for(let i = 1; i < trends.length; i++) {
                nextWeekDate = new Date(nextWeekDate.getTime() + WEEK_MS);
                nextWeekDateString = nextWeekDate.toISOString().split('T')[0];
                if(trends[i].week !== nextWeekDateString) {
                    labels.push(nextWeekDateString);
                    values.push(0);
                    i--;
                } else {
                    labels.push(trends[i].week);
                    values.push(trends[i].count);
                }
            }
            break;
        case 1:
            const firstMonth = trends[0];
            labels.push(firstMonth.month);
            values.push(firstMonth.count);
            let [ year, month ] = firstMonth.month.split('-');
            let nextMonthString
            for(let i = 1; i < trends.length; i++) {
                month++;
                if(month > 12) {
                    year++;
                    month = 1;
                }
                nextMonthString = year + '-' + String(month).padStart(2, '0');
                console.log(nextMonthString, trends[i].month)
                if(trends[i].month !== nextMonthString) {
                    labels.push(nextMonthString);
                    values.push(0);
                    i--;
                } else {
                    labels.push(trends[i].month);
                    values.push(trends[i].count);
                }
            }
            break;
        default:
            for(let d of json.data.trends) {
                labels.push(d[chartModes[json.data.mode]]);
                values.push(d.count);
            }
    }
    

    if(chart) chart.destroy();
    chart = new Chart(document.getElementById('chart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                fill: true,
                backgroundColor: '#00f6',
                label: '# of Sightings ' + (statOptions.location ? `in ${statOptions.location} ` : '') + (mode === 2 ? '(Yearly)' : (mode === 1 ? '(Monthly)' : '(Weekly)')),
                data: values,
                borderWidth: 1
            }]
        }, options: CHART_OPTIONS
    });
}

function createResultElement(count, location, severity, statOptions) {
    const result = $('<div />').addClass('result ui-element flex column');
    const firstRow = $('<div />').addClass('flex row w-100')
    .append($('<div />').addClass('count-highlight s-' + severity).text(count))
    .append($('<div />').text(location));
    const secondRow = $('<div />').addClass('flex row w-100')
    .append($('<div />').addClass('trend-title').text('Trends: '));
    const w = $('<button />').addClass('trend-button').text('Weekly');
    const m = $('<button />').addClass('trend-button').text('Monthly');
    const y = $('<button />').addClass('trend-button').text('Yearly');
    w.click(() => showChart(statOptions, 0));
    m.click(() => showChart(statOptions, 1));
    y.click(() => showChart(statOptions, 2));
    return result.append(firstRow, secondRow.append(w, m, y));
}

function createTag(text) {
    return $('<div />').addClass('tag').text(text);
}

function showMarkerTip() {
    this.unbindTooltip();
    if(!this.isPopupOpen()) this.bindTooltip(this.text).openTooltip();
}

function navigateToResult() {
    resultList.stop(true, true);
    resultList.animate({
        scrollTop: this.position * this.resultElement.height()
    });
    this.resultElement.addClass("dimmed");
    setTimeout(() => {
        this.resultElement.removeClass("dimmed");
    }, 1000);
}

function getMarkerColor(severity) {
    switch (severity) {
        case 1:
            return {
                color: 'orange',
                fillColor: '#fa3',
            }
        case 2:
            return {
                color: 'red',
                fillColor: '#f03',
            }
        default:
            return {
                color: 'green',
                fillColor: '#0a3',
            }
    }
}

function showResultMessage(res) {

    const closeElement = $('<div />').addClass('close-message').html('<i class="fa-solid fa-xmark"></i>');
    let message;

    if(res.success) {
        const sighting = res.data.sighting;
        message = $('<div />').addClass('message success-message').text(
            'Success!\n'
            + '\nSighting ID: ' + sighting.id
            + ',\nDate: ' + new Date(sighting.date).toDateString()
            + ',\nTick: ' + sighting.tick.species + ' (' + sighting.tick.latinName + ')'
            + ',\nLocation: ' + sighting.location.name + ' (' + sighting.location.admin_name + ')')
    } else {
        message = $('<div />').addClass('message error-message').text(
            'Error!\n\n' + res.error.responseJSON.error
        )
    }

    message.append(closeElement);
    closeElement.click(() => {
        message.remove();
    })

    $('#report-form').append(message);
}

function initElements() {
    const options = [
        $('#report-option'),
        $('#search-option'),
        $('#info-option')
    ];

    const contexts = [
        $('#report-context'),
        $('#search-context'),
        $('#info-context')
    ]
    
    for(let i = 0; i < options.length; i++) {
        options[i].click(() => {
            options.forEach((_, j) => {
                if(i !== j) {
                    options[j].removeClass('selected');
                    contexts[j].addClass('hidden');
                } else {
                    options[j].addClass('selected');
                    contexts[j].removeClass('hidden');
                }
            })
        })
    }

    const $filterTitle = $('#filter-title');
    const filterElement = $('#search-form');
    $filterTitle.click(() => {
        filterElement.toggle();
    })

    const $filterSpecies = $('#filter-species');
    const $reportSpecies = $('#report-species');
    const $reportLocations = $('#report-locations');
    
    $.get('/api/ticks', data => {
        for(let tick of data.data) {
            $filterSpecies.append($('<option />').val(tick.id).text(tick.species).attr('title', tick.latinName));
        }
        for(let tick of data.data) {
            $filterSpecies.append($('<option />').val(tick.id).text(tick.latinName).attr('title', tick.species));
        }
        for(let tick of data.data) {
            $reportSpecies.append($('<option />').val(tick.id).text(tick.species).attr('title', tick.latinName));
        }
        for(let tick of data.data) {
            $reportSpecies.append($('<option />').val(tick.id).text(tick.latinName).attr('title', tick.species));
        }
    });

    $.get('/api/data/locations', data => {
        locations = data.data;
        for(let location of locations) {
            $reportLocations.append($('<option />').val(location.name + ' (' + location.admin_name + ')'));
        }
    });

    const locationInput = $('#location');
    const locationIdInput = $('#location-id');


    locationInput.on('input', () => {
        const value = locationInput.val();
        const match = value.match(/^(?<name>[\w ]+) \((?<admin>[\w, ]+)\)/);
        if(!match) {
            locationInput[0].setCustomValidity("Incorrect format. Please select one of the options presented");
            locationIdInput.val(null);
            return;
        }
        const name = match.groups['name'];
        const admin = match.groups['admin'];

        const location = locations.find(l => l.name === name && l.admin_name === admin);
        if(!location) {
            locationInput[0].setCustomValidity("Unrecognised location")
            locationIdInput.val(null);
        } else {
            locationInput[0].setCustomValidity("")
            console.log(location);
            locationIdInput.val(location.id);
            console.log(locationIdInput.val());
        }
    });
}