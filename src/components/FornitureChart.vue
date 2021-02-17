<script>
import { Bar } from 'vue-chartjs'

export default {
  name: 'FornitureChart',
  extends: Bar,
  mounted() {
    this.renderChart(this.chartdata, this.options);
  },
  data() {
    return {
      chartdata: {
        labels: this.getLabels(),
        datasets: [
          {
            label: 'Forniture',
            backgroundColor: ['#2F4858', '#1FB0BB'],
            data: this.createData(),
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    }
  },
  methods: {
    getLabels() {
      return this.data.map(fornitore => fornitore.nome);
    },
    createData() {
      return this.data.map(fornitore => fornitore.totale);
    }
  },
  props: {
    data: Array
  }
}
</script>

<style scoped lang="scss">

</style>
