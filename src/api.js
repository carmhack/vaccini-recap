const API_URL = 'https://api.github.com/repos/italia/covid19-opendata-vaccini/contents/';
const VACCINI_SUMMARY_PATH = 'dati/vaccini-summary-latest.json';
const SOMMINISTRAZIONI_SUMMARY_PATH = 'dati/somministrazioni-vaccini-summary-latest.json';
const ANAGRAFICA_SUMMARY_PATH = 'dati/anagrafica-vaccini-summary-latest.json';
const CONSEGNE_VACCINI_PATH = 'dati/consegne-vaccini-latest.json';

const readDatasetFile = async (url) => {
  const response = await fetch(url);
  const result = await response.json();
  return JSON.parse(atob(result.content)).data;
};

export default {
  API_URL,
  VACCINI_SUMMARY_PATH,
  SOMMINISTRAZIONI_SUMMARY_PATH,
  ANAGRAFICA_SUMMARY_PATH,
  CONSEGNE_VACCINI_PATH,
  readDatasetFile,
}