<template>
<span>
  <div style="margin-left:20px;">
  <div class="user-search">
    <label>Du</label> <input v-model="startDate" type="date" @change="change()">
    <label>au</label> <input v-model="endDate" type="date" @change="change()">
    <span v-for="param, key in params" style="margin-left:10px;" @change="change()">
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
      default: () => {}
    }
  },
  watch: {
    mode (newvalue) {
      this.change()
    }
  },
  computed: {
//     selectedServices () {
//       if (this.selectedGroup !== '') {
//         return this.groups[this.selectedGroup]
//       } else {
//         return this.services
//       }
//     },
    
  },
  data () {
    return {
      startDate: null,
      endDate: null,
      values: {
        
      }
    }
  },
  created () {
    for (var key in this.params) {
      this.values[key] = this.params[key].default
    } 
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
      this.$emit('change', this.details())
    }
  }
}
</script>
