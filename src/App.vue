<template>
  <section class="section">
    <section class="hero is-info">
      <div class="hero-body">
        <div class="content is-vcentered">
          <img src="/images/logo.png" alt="Primula">
          <p class="title">
            Vaccini Tracker
            
            <span class="subtitle">
              Creato da <a href="https://www.docety.com/coachs/27619/dettagli/Grimaldi+Adriano" style="text-decoration: underline;">Adriano Grimaldi</a>
            </span>
          </p>
        </div>
         <b-taglist attached>
            <b-tag type="is-large is-white">Totale vaccini consegnati</b-tag>
            <b-tag type="is-large is-primary">{{ totaleVacciniConsegnati }}</b-tag>
            <b-tag type="is-large is-white">Totale vaccini somministrati</b-tag>
            <b-tag type="is-large is-primary">{{ totaleVacciniSomministrati }}</b-tag>
          </b-taglist>
      </div>
    </section>

    <section class="section">
      <b-table
        :data="data"
        :loading="isLoading"
        detailed
        :opened-detailed="[1]"
        detail-key="nome_area"
        :show-detail-icon="true"
        :striped="true"
        default-sort-direction="asc"
        sort-icon="arrow-up"
        sort-icon-size="is-small"
        default-sort="nome_area"
        :has-mobile-cards="true"
      >
        <b-table-column field="nome_area" label="Regione" sortable v-slot="props">
          {{ props.row.nome_area }}
        </b-table-column>

        <b-table-column field="dosi_consegnate" label="Dosi Consegnate" sortable centered v-slot="props">
          {{ props.row.dosi_consegnate.toLocaleString() }}
        </b-table-column>

        <b-table-column field="dosi_somministrate" label="Dosi Somministrate" sortable centered v-slot="props">
          {{ props.row.dosi_somministrate.toLocaleString() }}
        </b-table-column>

        <b-table-column field="percentuale_somministrazione" label="% Somministrazione" sortable centered v-slot="props">
          <span v-if="props.row.percentuale_somministrazione < 50" class="tag is-medium is-danger">
            {{ props.row.percentuale_somministrazione }}
          </span>
          <span v-if="props.row.percentuale_somministrazione >= 50 && props.row.percentuale_somministrazione < 80" class="tag is-medium is-warning">
            {{ props.row.percentuale_somministrazione }}
          </span>
          <span v-else class="tag is-medium is-success">
            {{ props.row.percentuale_somministrazione }}
          </span>
        </b-table-column>

        <b-table-column field="ultimo_aggiornamento" label="Ultimo Aggiornamento" v-slot="props">
          {{ new Date(props.row.ultimo_aggiornamento).toLocaleString() }}
        </b-table-column>

        <template #detail="props">
          <article class="media">
            <figure class="media-left">
              <p class="image is-64x64">
                <img :src="`/images/${props.row.area}.png`">
              </p>
            </figure>
            <div class="media-content">
              <div class="content">
                <b-taglist attached>
                  <b-tag type="is-medium is-white">Prima dose</b-tag>
                  <b-tag type="is-medium is-info">{{ somministrazioni[props.row.nome_area].prima_dose.toLocaleString() }}</b-tag>
                  <b-tag type="is-medium is-white">Seconda dose</b-tag>
                  <b-tag type="is-medium is-info">{{ somministrazioni[props.row.nome_area].seconda_dose.toLocaleString() }}</b-tag>
                </b-taglist>
                <div class="column is-8">
                  <category-chart :detail="somministrazioni[props.row.nome_area]" />
                </div>
              </div>
            </div>
          </article>
        </template>
      </b-table>
    </section>
  </section>
</template>

<script>
// import * as schemaSomministrazioni from './data/somministrazioni-vaccini-summary-latest.json';
import CategoryChart from './components/CategoryChart.vue';

const API_URL = 'https://api.github.com/repos/italia/covid19-opendata-vaccini/contents/';
const VACCINI_SUMMARY_PATH = 'dati/vaccini-summary-latest.json';
const SOMMINISTRAZIONI_SUMMARY_PATH = 'dati/somministrazioni-vaccini-summary-latest.json';

export default {
  components: {
    CategoryChart
  },
  mounted() {
    this.loadData();
  },
  computed: {
    totaleVacciniConsegnati() {
      return this.data.reduce((acc, area) => acc + area.dosi_consegnate, 0).toLocaleString();
    },
    totaleVacciniSomministrati() {
      return this.data.reduce((acc, area) => acc + area.dosi_somministrate, 0).toLocaleString();
    }
  },
  data() {
    return {
      data: [],
      isLoading: false,
      columns: [
        {
          field: 'nome_area',
          label: 'Regione',
          searchable: true,
          sortable: true,
        },
        {
          field: 'dosi_somministrate',
          label: 'Dosi Somministrate',
          centered: true,
          sortable: true,
        },
        {
          field: 'dosi_consegnate',
          label: 'Dosi Consegnate',
          centered: true,
          sortable: true,
        },
        {
          field: 'percentuale_somministrazione',
          label: '% Somministrazione',
          centered: true,
          sortable: true,
        },
        {
          field: 'ultimo_aggiornamento',
          label: 'Ultimo Aggiornamento',
        }
      ],
      somministrazioniSummary: [],
      somministrazioni: {},
    }
  },
  methods: {
    async loadData() {
      this.isLoading = true;
      const responseVaccini = await fetch(API_URL+VACCINI_SUMMARY_PATH);
      const resultVaccini = await responseVaccini.json();
      this.data = JSON.parse(atob(resultVaccini.content)).data;

      const responseSomministrazioni = await fetch(API_URL+SOMMINISTRAZIONI_SUMMARY_PATH);
      const resultSomministrazioni = await responseSomministrazioni.json();
      this.somministrazioniSummary = JSON.parse(atob(resultSomministrazioni.content)).data;
      
      this.isLoading = false;

      this.elaborateData();
    },
    elaborateData() {
      const somministrazioni = this.somministrazioni;

      this.data.map(summary => {
        const nomeArea = summary.nome_area;
        somministrazioni[nomeArea] = {
          totale: 0,
          sesso_maschile: 0,
          sesso_femminile: 0,
          categoria_operatori_sanitari_sociosanitari: 0,
          categoria_personale_non_sanitario: 0,
          categoria_ospiti_rsa: 0,
          categoria_over80: 0,
          prima_dose: 0,
          seconda_dose: 0,
        }

        this.somministrazioniSummary
          .filter(elem => elem.area == summary.area)
          .map(elem => {
            somministrazioni[nomeArea].totale += elem.totale;
            somministrazioni[nomeArea].sesso_maschile += elem.sesso_maschile;
            somministrazioni[nomeArea].sesso_femminile += elem.sesso_femminfile;
            somministrazioni[nomeArea].categoria_operatori_sanitari_sociosanitari += elem.categoria_operatori_sanitari_sociosanitari;
            somministrazioni[nomeArea].categoria_personale_non_sanitario += elem.categoria_personale_non_sanitario;
            somministrazioni[nomeArea].categoria_ospiti_rsa += elem.categoria_ospiti_rsa;
            somministrazioni[nomeArea].categoria_over80 += elem.categoria_over80;
            somministrazioni[nomeArea].prima_dose += elem.prima_dose;
            somministrazioni[nomeArea].seconda_dose += elem.seconda_dose;
          });
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.content.is-vcentered {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
</style>
