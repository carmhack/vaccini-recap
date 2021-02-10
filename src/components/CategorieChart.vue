<script>
import { Bar } from 'vue-chartjs'

export default {
  name: 'CategorieChart',
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
    createData() {
      const toRet = [];
      const filters = [
        'totale',
        'categoria_operatori_sanitari_sociosanitari',
        'categoria_personale_non_sanitario',
        'categoria_ospiti_rsa',
        'categoria_over80'
      ];
      Object.keys(this.data).filter(key => {
        if (filters.includes(key)) {
          toRet.push(this.data[key]);
        }
      })
      return toRet;
    }
  },
  props: {
    data: Object
  }
}
</script>

<style scoped lang="scss">

</style>
