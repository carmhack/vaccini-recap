<script>
import { Pie } from 'vue-chartjs'

export default {
  name: 'AnagraficaChart',
  extends: Pie,
  mounted() {
    this.renderChart(this.chartdata, this.options);
  },
  data() {
    return {
      chartdata: {
        labels: this.getLabels(),
        datasets: [
          {
            label: 'Fasce Anarafiche',
            backgroundColor: ['#845EC2', '#4FFBDF', '#00D2FC', '#2F4858', '#1FB0BB', '#00BEFD', '#C0F196', '#FFC47F', '#55906F'],
            data: this.createData(),
          }
        ]
      },
      options: {
        responsive: true, 
        maintainAspectRatio: false, 
        animation: {
          animateRotate: false
        }
      }
    }
  },
  methods: {
    getLabels() {
      return this.data.map(item => item.fascia_anagrafica);
    },
    createData() {
      return this.data.map(item => item.totale.toLocaleString());
    }
  },
  props: {
    data: Array
  }
}
</script>

<style scoped lang="scss">

</style>
