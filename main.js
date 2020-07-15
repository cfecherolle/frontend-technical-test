/* globals $ */

$(document).ready(() => {
  let countries = [];
  let countriesListElement = $("#country-list-wrapper");
  let selectedCountryCode;

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
    let countriesListElementContent = "";

    countriesData.forEach(country => {
      countriesListElementContent += `
      <div class="country-card">
        <span class="country-card-code">${country.alpha2Code}</span>
        <h3 class="country-card-name">${country.name}</h3>
      </div>`;
    });
    countriesListElement.html(countriesListElementContent);

    $(".country-card").click(event => {
      $(".country-card.selected").removeClass("selected");
      event.currentTarget.className += " selected";

      const selectedCode = $(".country-card.selected > .country-card-code")
        .text()
        .trim();

      fetch(
        `https://restcountries.eu/rest/v2/alpha/${selectedCode}?fields=flag;nativeName;capital;population;languages;timezones;borders`
      )
        .then(response => response.json())
        .then(selectedCountryData => console.log(selectedCountryData));
      // TODO: format and output info to details panel
    });
  }
});
