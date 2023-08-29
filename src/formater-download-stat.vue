<template>
  <span>DOWNLOAD
  <fmt-stat-form :params="params"  @change="search"></fmt-stat-form>
  <div id="download"></div>
  </span>
</template>
<script>
import * as Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import ExportData from 'highcharts/modules/export-data'
import Accessibility from 'highcharts/modules/accessibility'
if (typeof Highcharts === 'object') {
  HighchartsExporting(Highcharts)
  Accessibility(Highcharts)
  ExportData(Highcharts)
}

import FmtStatForm from './components/fmt-stat-form.vue'
export default {
  name: 'FmtDownloadStat',
  props: {
    url: {
      type: String,
      default: 'http://127.0.0.1:8083/admin/downloads'
    }
  },
  components: {FmtStatForm},
  data () {
    return {
      params: null,
      defaultColors: ['#2f7ed8', '#910000', '#8bbc21',   '#1aadce',
        '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a', '#0d233a'],
      colors: {}
    }
  },
  created () {
    this.initParams()
  },
  methods: {
    initParams () {
      this.$http.get(this.url + '/params', {credentials: true})
      .then(resp => {
        this.params = resp.body
        var i = 0
        for (var key in this.params.histogram.series.options) {
          this.colors[key] = this.defaultColors[i]
          i++
        }
      }, resp => {alert('pb serveur : ' + resp.status)})
    },
    initSeriesOptions () {
      if (this.params.series) {
       this.series = this.params.series.options
      }
    },
    search(values) {
      console.log(values)
      var url = this.url + '/count?'
      var props = []
      for (var prop in values) {
        props.push(prop + '=' + values[prop])
      }
      url += props.join('&')
      this.$http.get(url, {credentials:true})
     .then(resp => {
       this.draw(values, resp.body)}, resp => {console.log(resp.status)})
    },
   
    draw (values, data) {
      if (values.by === 'day') {
        
      }
      var series = []
      for (var key in data) {
        console.log(data[key])
        
        if (values.by === 'day')  {
          var categories = null
          var serie = {
              name: this.params.histogram.series.options[key],
              color: this.colors[key],
              data: data[key].map(x => [Date.parse(x.date), x[values.count]])
          }
          
        } else {
          var categories = data[key].map(x => x.date)
	        var serie = {
	          name: this.params.histogram.series.options[key],
	          data: data[key].map(x => x[values.count])
	        }
        }
        series.push(serie)
      }
      console.log(series)
      this.drawHistogram('download', 'Téléchargements', categories, series, null)
    },
    drawHistogram (id, title, categories, series, options ) {
      var colors = this.colors
      if (options && options.colors) {
        colors = options.colors
      }
      Highcharts.chart(id, {
        chart: {
          type: 'column'
        },
        title: {
          text: title,
          align: 'left',
          style: {'color': '#000000', 'fontSize': '20px', 'fontWeight': 700}
        },
        credits: {
          enabled:false
        },
//        colors: colors,
//         legend: {
//           labelFormatter: function() {
//             return this.name
//           }
//         },
        subtitle: {
          text: ''
        },
        xAxis: {
          categories: categories,
          type: 'datetime'
        },
        yAxis: {
          min: 0,
          allowDecimals: false,
          title: {
            text: ''
          }
        },
       tooltip: {
          formatter: function(e) {
            var currentPoint = this
            var tot = 0
            var x = this.x
            if (typeof x !== 'string') {
              x = Highcharts.dateFormat('%e %b. %Y', new Date(this.x))
            }

            var stackValues = '<b>' + x + '</b><br />'
              currentPoint.points.forEach(function(point, i) {
                  stackValues += '<span style="color: ' + point.color + '">\u25CF</span> ' + series[i].name + ': ' + point.y + '<br/>'
                  tot += point.y
              })
            if (series.length <= 1) {
              return stackValues
            }
            return stackValues +
              '<span style="margin-left:10px;font-weight:700">Total: </span>' + tot;
          },
          shared: true,
          useHTML: true
        },
        plotOptions: {
          column: {
            stacking: 'normal',
            pointPadding: 0,
            borderWidth: 1,
            groupPadding: 0,
            shadow: false
          }
        },
        series: series
      });
    }
  }
}
</script>