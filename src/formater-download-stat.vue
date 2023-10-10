<template>
  <span>
  <fmt-stat-form :params="params"  @change="search"></fmt-stat-form>
  
   <div v-if="total" style="margin-left:10px;margin-bottom:20px;">
      <h3 style="font-family: Helvetica, Arial, sans-serif;">Total</h3>
      <div style="margin-left:10px;">
	      <div v-for="color, key in colors" v-if="!(key === 'unknown' && !params.histogram[groupBy].options[key])">
	         <div><div style="width:20px;height:20px;display:inline-block;" :style="{backgroundColor: color}"></div> 
	           {{params.histogram[groupBy].options[key]}}: <span v-if="total.groups[key]">{{total.groups[key].toLocaleString('fr-FR')}}</span>
	           <span v-else>0</span></div>
	      </div>
     
	      <div style="width:200px;border-top:1px solid darkgrey;font-weight:700;">
	      Total: {{total.total.toLocaleString('fr-FR')}}
	      </div>
   </div>
   </div>

   <div id="download"></div>
   <div id="user"></div>
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
  computed: {
    colors () {
      var cls = {}
      cls['unknown'] = this.defaultColors[0]
      var i = 1
      for (var key in this.params.histogram[this.groupBy].options) {
        cls[key] = this.defaultColors[i]
        i++
      }
      
      return cls
    }
  },
  components: {FmtStatForm},
  data () {
    return {
      params: null,
      total: null,
      groupBy: 'series',
      defaultColors: ['#2f7ed8', '#910000', '#8bbc21',   '#1aadce',
        '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a', '#0d233a']
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
        if (this.params.histogram.groupBy) {
          this.groupBy = this.params.histogram.groupBy.default
        }
//        console.log(index)-
//        for (var key in this.params.histogram[index].options) {
//          this.colors[key] = this.defaultColors[i]-->
//           i++
//         }-
      }, resp => {alert('pb serveur : ' + resp.status)})
    },
    initSeriesOptions () {
      if (this.params.groupBy) {
        this.series = this.params[this.params.groupBy.default].options
        console.log(this.series)
      }
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
       this.total = resp.body.total
       this.draw('download', values, resp.body.values)}, resp => {console.log(resp.status)})
     
     var url = this.url + '/user?'
     url += props.join('&')
     this.$http.get(url, {credentials:true})
     .then(resp => {
       this.draw('user', values, resp.body)}, resp => {console.log(resp.status)})
    },
   
    draw (id, values, data) {
      var count = 'nb'
      if (values.count) {
        count = values.count
      }
      var series = []
      var index = 'series'
      if (values.groupBy) {
        this.groupBy = values.groupBy
      }
      if (id === 'download') {
	      for (var key in data) {
	        
	        if (values.by === 'day')  {
	          var categories = null
	          
	          var serie = {
	              name: this.params.histogram[this.groupBy].options[key] || 'unknown',
	              color: this.colors[key],
	              data: data[key].map(x => [Date.parse(x.date), x[count]])
	          }
	          
	        } else {
	          var categories = data[key].map(x => x.date)
		        var serie = {
		          name: this.params.histogram[this.groupBy].options[key] || 'unknown',
		          color: this.colors[key],
		          data: data[key].map(x => x[count])
		        }
	        }
	        series.push(serie)
	      }
	      this.drawHistogram(id, 'Téléchargements par date', categories, series, null)
      } else if (id === 'user') {
         for (var key in data) {
          
            var categories = data[key].map(x => x.user)
            console.log(categories[0]);
            if (categories[0] === null) {
              categories[0] = 'iconnu'
            }
            var serie = {
              name: this.params.histogram[this.groupBy].options[key] || 'unknown',
              color: this.colors[key],
              data: data[key].map(x => x[count])
            }
            series.push(serie)
          }
          
         this.drawHistogram(id, 'Téléchargements par utilisateur', categories, series, null)
      }
      
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
            if (id === 'download' && typeof x !== 'string') {
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