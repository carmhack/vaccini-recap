<script>
import { Bar } from 'vue-chartjs'

export default {
  name: 'CategoryChart',
  extends: Bar,
  mounted() {
    this.renderChart(this.chartdata, this.options);
  },
  data() {
    return {
      chartdata: {
        labels: ['Totale', 'Operatori Sanitari', 'Personali Non Sanitario', 'Ospiti RSA', 'Over 80'],
        datasets: [
          {
            label: 'Data',
            backgroundColor: '#167df0',
            data: this.getData(),
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
    getData() {
      const toRet = [];
      const filters = [
        'totale',
        'categoria_operatori_sanitari_sociosanitari',
        'categoria_personale_non_sanitario',
        'categoria_ospiti_rsa',
        'categoria_over80'
      ];
      Object.keys(this.detail).filter(key => {
        if (filters.includes(key)) {
          toRet.push(this.detail[key]);
        }
      })
      return toRet;
    }
  },
  props: {
    detail: Object
  }
}
</script>

<style scoped lang="scss">

</style>
