<template>
  <div>
    <section class="hero is-info has-text-centered">
      <div class="hero-body">
        <div class="content is-vcentered">
          <img src="/images/logo.png" alt="Primula">
          <p class="title is-3">Dashboard Vaccini</p>
          <p class="subtitle is-4">
            Creato da <a href="https://www.docety.com/coachs/27619/dettagli/Grimaldi+Adriano" style="text-decoration: underline;">Adriano Grimaldi</a>
          </p>
        </div>
      </div>
    </section>

    <section class="section is-centered">
      <div class="box">
        <h1 class="title is-3">Report generale</h1>

        <b-taglist attached>
          <b-tag type="is-large is-info">Vaccini consegnati</b-tag>
          <b-tag type="is-large is-light">{{ totaleVacciniConsegnati }}</b-tag>
          
          <b-tag type="is-large is-info">Vaccini somministrati</b-tag>
          <b-tag type="is-large is-light">{{ totaleVacciniSomministrati }}</b-tag>
        </b-taglist>

        <b-taglist attached>
          <div v-for="fornitura in totaleForniture" :key="fornitura.nome">
            <b-tag type="is-medium is-info">{{ fornitura.nome }}</b-tag>
            <b-tag type="is-medium is-light">{{ fornitura.totale.toLocaleString() }}</b-tag>
          </div>
        </b-taglist>

        <b-collapse class="card" animation="slide" aria-id="contentIdForA11y3">
          <template #trigger="props">
            <div
              class="card-header"
              role="button"
              aria-controls="contentIdForA11y3">
              <p class="card-header-title">
                Fasce anagrafiche
              </p>
              <a class="card-header-icon">
                <b-icon
                  :icon="props.open ? 'menu-down' : 'menu-up'">
                </b-icon>
              </a>
            </div>
          </template>
          <div class="card-content">
            <div class="content">
              <anagrafica-chart v-if="!isLoading" :data="anagraficaSummary" />
            </div>
          </div>
        </b-collapse>
      </div>

      <div style="margin-top: 20px">
        <h1 class="title is-3">Situazione Regioni</h1>

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
            <span v-if="props.row.percentuale_somministrazione < 70" class="tag is-medium is-danger">
              {{ props.row.percentuale_somministrazione }}
            </span>
            <span v-if="props.row.percentuale_somministrazione >= 70 && props.row.percentuale_somministrazione < 85" class="tag is-medium is-warning">
              {{ props.row.percentuale_somministrazione }}
            </span>
            <span v-if="props.row.percentuale_somministrazione >= 85" class="tag is-medium is-success">
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
                  <b-tag type="is-medium is-info">{{ info[props.row.nome_area].prima_dose.toLocaleString() }}</b-tag>
                  <b-tag type="is-medium is-white">Seconda dose</b-tag>
                  <b-tag type="is-medium is-info">{{ info[props.row.nome_area].seconda_dose.toLocaleString() }}</b-tag>
                </b-taglist>
              </div>
            </article>
            <div style="margin-top: 50px">
              <div class="block">
                Le dosi totali di vaccino somministrate sono {{ info[props.row.nome_area].totale.toLocaleString() }} 
                ({{ info[props.row.nome_area].sesso_maschile.toLocaleString() }} soggetti di sesso maschile, 
                {{ info[props.row.nome_area].sesso_femminile.toLocaleString() }} soggetti di sesso femminile).<br/>
                Di queste dosi, 
                {{ info[props.row.nome_area].categoria_operatori_sanitari_sociosanitari.toLocaleString() }} sono andate agli operatori sanitari / socio-sanitari,
                {{ info[props.row.nome_area].categoria_personale_non_sanitario.toLocaleString() }} al personale non sanitario,
                {{ info[props.row.nome_area].categoria_ospiti_rsa.toLocaleString() }} agli ospiti delle RSA,
                {{ info[props.row.nome_area].categoria_over80.toLocaleString() }} agli over 80. <br/>
                <strong>Forniture:</strong>
                <ul>
                  <li v-for="fornitura in info[props.row.nome_area].forniture" :key="fornitura.nome">
                    {{ fornitura.nome }}: {{fornitura.totale.toLocaleString()}}
                  </li>
                </ul>
              </div>
              <div class="is-hidden-mobile">
                <forniture-chart v-if="!isLoading" :data="info[props.row.nome_area].forniture" />
              </div>
            </div>
          </template>
        </b-table>
      </div>
    </section>
  </div>
</template>

<script>
import api from './api';
import AnagraficaChart from './components/AnagraficaChart.vue';
import FornitureChart from './components/FornitureChart.vue';

export default {
  components: {
    AnagraficaChart,
    FornitureChart
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
    },
    totaleForniture() {
      const toRet = [];
      this.consegneSummary.map(consegna => {
        const fornitore = consegna.fornitore;
        const itemIndex = toRet.findIndex(elem => elem.nome === fornitore);
        if (itemIndex !== -1) {
          toRet[itemIndex].totale += consegna.numero_dosi;
        } else {
          toRet.push({ nome: consegna.fornitore, totale: consegna.numero_dosi });
        }
      })
      return toRet;
    }
  },
  data() {
    return {
      vacciniSummary: [],
      somministrazioniSummary: [],
      anagraficaSummary: [],
      consegneSummary: [],
      info: {},
      isLoading: false,
    }
  },
  methods: {
    async loadData() {
      this.isLoading = true;

      this.vacciniSummary = await api.readDatasetFile(`${api.API_URL}${api.VACCINI_SUMMARY_PATH}`);
      this.somministrazioniSummary = await api.readDatasetFile(`${api.API_URL}${api.SOMMINISTRAZIONI_SUMMARY_PATH}`);
      this.anagraficaSummary = await api.readDatasetFile(`${api.API_URL}${api.ANAGRAFICA_SUMMARY_PATH}`);
      this.consegneSummary = await api.readDatasetFile(`${api.API_URL}${api.CONSEGNE_VACCINI_PATH}`);
      
      this.isLoading = false;

      this.elaborateData();
    },
    elaborateData() {
      const vaccini = this.vacciniSummary;
      const somministrazioni = this.somministrazioniSummary;
      const consegne = this.consegneSummary;
      const info = this.info;

      vaccini.map(summary => {
        const nomeArea = summary.nome_area;
        info[nomeArea] = {
          totale: 0,
          sesso_maschile: 0,
          sesso_femminile: 0,
          categoria_operatori_sanitari_sociosanitari: 0,
          categoria_personale_non_sanitario: 0,
          categoria_ospiti_rsa: 0,
          categoria_over80: 0,
          prima_dose: 0,
          seconda_dose: 0,
          forniture: [],
        }

        somministrazioni
          .filter(item => item.area == summary.area)
          .map(item => {
            const dataObj = info[nomeArea];

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

        consegne
          .filter(item => item.area === summary.area)
          .map(item => {
            const elencoForniture = info[nomeArea].forniture;

            const fornitore = item.fornitore;
            const itemIndex = elencoForniture.findIndex(elem => elem.nome === fornitore);
            if (itemIndex !== -1) {
              elencoForniture[itemIndex].totale += item.numero_dosi;
            } else {
              elencoForniture.push({ nome: item.fornitore, totale: item.numero_dosi });
            }
          })
      })
    }
  }
}
</script>

<style lang="scss">
body {
  font-family: 'Open Sans', sans-serif !important;
}
</style>