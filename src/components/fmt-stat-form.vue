<template>
<span>
  <div class="fmt-stat-form" >
  <div class="user-search">
    <label>Du</label> <input v-model="startDate" type="date" @change="change()">
    <label>au</label> <input v-model="endDate" type="date" @change="change()">
    <span v-if="histogram" v-for="param, key in histogram" style="margin-left:10px;display:inline-block;" @change="change()">
       <label>{{param.title}}</label>
       <select v-model="values[key]" >
           <option v-if="param.empty" value="">---</option>
           <option v-for="value, key in param.options" :value="key">{{value}}</option>
       </select>
    </span>
    
   
  </div>
</div>
 
</span>
</template>
<script>
import moment from 'moment'
export default {
  name: 'GdmStatForm',
  props: {
    mode: {
      type: String,
      default: 'connection'
    },
    params: {
      type: Object,
      default: null
    }
  },
  watch: {
    params (newvalue) {
      console.log(newvalue)
      if (!newvalue) {
        return
      }
      this.histogram = newvalue.histogram
      for (var key in this.histogram) {
        this.values[key] = this.histogram[key].default
      } 
      this.change()
    }
  },
  computed: {
  },
  data () {
    return {
      startDate: null,
      endDate: null,
      histogram: null,
      values: {
        
      }
    }
  },
  created () {
    
    this.startDate = moment().startOf('month').format('YYYY-MM-DD')
    this.endDate = moment().endOf('month').format('YYYY-MM-DD')
    this.change()
  },
  methods: {
    details () {
      var details = {}
      if (this.startDate) {
        details.startDate = this.startDate
      }
      if (this.endDate) {
        details.endDate = this.endDate
      }
      for (var key in this.values) {
        if (this.values[key] !== '') {
          details[key] = this.values[key]
        }
      }
      return details
    },
    change () {
      if (!this.params) {
        return
      }
      this.$emit('change', this.details())
    }
  }
}
</script>
<style scoped>
.fmt-stat-form {
}
.fmt-stat-form label {
  display: inline;
  width:auto;
  
}
</style>
