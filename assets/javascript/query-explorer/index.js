// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/* global gapi */

var viewSelector;
var metadata = require('javascript-api-utils/lib/metadata');

function setup() {

  viewSelector = new gapi.analytics.ext.ViewSelector2({
    container: 'view-selector-container',
    template:
      '<div class="FormControl">' +
      '  <label class="FormControl-label">Account</label>' +
      '  <select class="FormControl-field"></select>' +
      '</div>' +
      '<div class="FormControl">' +
      '  <label class="FormControl-label">Property</label>' +
      '  <select class="FormControl-field"></select>' +
      '</div>' +
      '<div class="FormControl">' +
      '  <label class="FormControl-label">View</label>' +
      '  <select class="FormControl-field"></select>' +
      '</div>'
  }).execute();

  viewSelector.on('change', function(ids) {
    $('#ids').val(ids);
  });

  var dataChart = new gapi.analytics.googleCharts.DataChart({
    chart: {
      type: 'TABLE',
      container: 'chart-container',
      options: {
        'cssClassNames': {
          'headerRow': 'gapi2-analytics-data-chart-thr',
          'tableRow': 'gapi2-analytics-data-chart-tr',
          'oddTableRow': 'gapi2-analytics-data-chart-tr-odd',
          'selectedTableRow': 'gapi2-analytics-data-chart-tr-selected',
          'hoverTableRow': 'gapi2-analytics-data-chart-tr-hover',
          'headerCell': 'gapi2-analytics-data-chart-th',
          'tableCell': 'gapi2-analytics-data-chart-td'
        },
        // 'cssClassNames': null,
        sort: 'enable',
        width: 'auto'
      }
    }
  });

  gapi.client.analytics.management.segments.list().then(function(response) {

    var segments = response.result.items;
    for (var i = 0, segment; segment = segments[i]; i++) {
      console.log(segment.id, segment.kind, segment.name, segment.definition);
    }
  })
  .then(null, console.error.bind(console));



  metadata.get().then(function(columns) {

    var metrics = columns.allMetrics('public').map(function(metric) {
      return {
        id: metric.id,
        text: metric.id,
        name: metric.attributes.uiName,
        group: metric.attributes.group
      };
    });
    var dimensions = columns.allDimensions('public').map(function(dimension) {
      return {
        id: dimension.id,
        text: dimension.id,
        name: dimension.attributes.uiName,
        group: dimension.attributes.group
      };
    });

    function template(result) {
      if (!result.name) {
        return '<strong>' + result.text + '</strong>';
      }
      return '<div>' +
        result.text + ' <em>(' + result.name + ')</em>' +
      '</div>';
    }

    $('#metrics').select2({
      tags: metrics,
      formatResult: template
    });


    $('#dimensions').select2({
      tags: dimensions,
      formatResult: template
    });

  });


  $('#query-explorer').on('submit', function(e) {
    e.preventDefault();

    var inputValues = $(this).serializeArray();
    var queryValues = {};

    inputValues.forEach(function(item) {
      if (item.value !== '') queryValues[item.name] = item.value;
    });

    dataChart.set({query: queryValues}).execute();
  });

}

module.exports = {
  init: function() {
    gapi.analytics.ready(function() {
      if (gapi.analytics.auth.isAuthorized()) {
        setup();
      }
      else {
        gapi.analytics.auth.once('success', setup);
      }
    });
  }
};
