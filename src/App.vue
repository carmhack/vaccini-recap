<template>
  <section class="section">
    <section class="hero is-info">
      <div class="hero-body">
        <div class="content is-vcentered">
          <img src="/images/logo.png" alt="Primula">
          <p class="title">
            Vaccini Recap
            <br/>
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
        :data="vacciniSummary"
        :loading="isLoading"
        detailed
        :opened-detailed="[1]"
        :striped="true"
        detail-key="nome_area"
        default-sort="nome_area"
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
                <img :src="`/images/${props.row.area}.png`" alt="Stemma regione">
              </p>
            </figure>
            <div class="content">
              <b-taglist attached>
                <b-tag type="is-medium is-white">Prima dose</b-tag>
                <b-tag type="is-medium is-info">{{ data[props.row.nome_area].prima_dose.toLocaleString() }}</b-tag>
                <b-tag type="is-medium is-white">Seconda dose</b-tag>
                <b-tag type="is-medium is-info">{{ data[props.row.nome_area].seconda_dose.toLocaleString() }}</b-tag>
              </b-taglist>
            </div>
          </article>
          <div style="margin-top: 20px">
            <div class="is-hidden-mobile">
              <category-chart :detail="data[props.row.nome_area]" />
            </div>
            <div class="block is-hidden-desktop">
              Le dosi totali di vaccino somministrate sono {{ data[props.row.nome_area].totale.toLocaleString() }} 
              ({{ data[props.row.nome_area].sesso_maschile.toLocaleString() }} soggetti di sesso maschile, 
              {{ data[props.row.nome_area].sesso_femminile.toLocaleString() }} soggetti di sesso femminile). 
              Di queste dosi, 
              {{ data[props.row.nome_area].categoria_operatori_sanitari_sociosanitari.toLocaleString() }} sono andate agli operatori sanitari / socio-sanitari,
              {{ data[props.row.nome_area].categoria_personale_non_sanitario.toLocaleString() }} al personale non sanitario,
              {{ data[props.row.nome_area].categoria_ospiti_rsa.toLocaleString() }} agli ospiti delle RSA,
              {{ data[props.row.nome_area].categoria_over80.toLocaleString() }} agli over 80.
            </div>
          </div>
        </template>
      </b-table>
    </section>
  </section>
</template>

<script>
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
      return this.vacciniSummary.reduce((acc, area) => acc + area.dosi_consegnate, 0).toLocaleString();
    },
    totaleVacciniSomministrati() {
      return this.vacciniSummary.reduce((acc, area) => acc + area.dosi_somministrate, 0).toLocaleString();
    }
  },
  data() {
    return {
      vacciniSummary: [],
      somministrazioniSummary: [],
      data: {},
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
    }
  },
  methods: {
    async loadData() {
      this.isLoading = true;

      const responseVaccini = await fetch(API_URL+VACCINI_SUMMARY_PATH);
      const resultVaccini = await responseVaccini.json();
      this.vacciniSummary = JSON.parse(atob(resultVaccini.content)).data;

      const responseSomministrazioni = await fetch(API_URL+SOMMINISTRAZIONI_SUMMARY_PATH);
      const resultSomministrazioni = await responseSomministrazioni.json();
      this.somministrazioniSummary = JSON.parse(atob(resultSomministrazioni.content)).data;
      
      this.isLoading = false;

      this.elaborateData(this.data, this.vacciniSummary, this.somministrazioniSummary);
    },
    elaborateData(data, vaccini, somministrazioni) {
      vaccini.map(summary => {
        const nomeArea = summary.nome_area;
        data[nomeArea] = {
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

        somministrazioni
          .filter(item => item.area == summary.area)
          .map(item => {
            const dataObj = data[nomeArea];

            dataObj.totale += item.totale;
            dataObj.sesso_maschile += item.sesso_maschile;
            dataObj.sesso_femminile += item.sesso_femminile;
            dataObj.categoria_operatori_sanitari_sociosanitari += item.categoria_operatori_sanitari_sociosanitari;
            dataObj.categoria_personale_non_sanitario += item.categoria_personale_non_sanitario;
            dataObj.categoria_ospiti_rsa += item.categoria_ospiti_rsa;
            dataObj.categoria_over80 += item.categoria_over80;
            dataObj.prima_dose += item.prima_dose;
            dataObj.seconda_dose += item.seconda_dose;
          });
      })
    }
  }
}
</script>
