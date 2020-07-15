/* globals $ */

$(document).ready(() => {
  let countries = [];
  let countriesListElement = $("#country-list-wrapper");

  window
    .fetch("https://restcountries.eu/rest/v2/all?fields=name;alpha2Code;")
    .then(response => {
      return response.json();
    })
    .then(allCountriesData => {
      provisionData(allCountriesData);
    })
    .catch(error =>
      console.log(
        "There was a problem with the request to get countries info.",
        error
      )
    );

  function provisionData(countriesData) {
    countries = countriesData;
    countriesData.forEach(country => {
      console.log(countriesListElement);
      countriesListElement.innerHTML += `
      <div class="country-card">
      <span class="country-card-code">${country.alpha2Code}</span>
      <h3 class="country-card-name">${country.name}</h3>
    </div>`;
    });
  }
});
