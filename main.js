/* globals $ */

$(document).ready(() => {
  let allCountriesByAlpha3CodeAndName = {};
  let countriesDataCache = {};

  let countriesListElement = $("#country-list-wrapper");
  let countriesInfoPanelElement = $("#country-global-info-panel");

  window
    .fetch(
      "https://restcountries.eu/rest/v2/all?fields=name;alpha2Code;alpha3Code;"
    )
    .then(response => {
      return response.json();
    })
    .then(allCountriesData => {
      provisionData(allCountriesData);
    })
    .catch(error =>
      console.error(
        "There was a problem with the request to get countries info.",
        error
      )
    );

  function provisionData(countriesData) {
    for (const country of countriesData) {
      allCountriesByAlpha3CodeAndName[country.alpha3Code] = country.name;
    }
    let countriesListElementContent = "";

    countriesData.forEach(country => {
      countriesListElementContent += generateCountryCard(country);
    });

    countriesListElement.html(countriesListElementContent);
    initializeClickHandlers();
  }

  function generateCountryCard(country) {
    return `
    <div class="country-card">
      <span class="country-card-code">${country.alpha2Code}</span>
      <h3 class="country-card-name">${country.name}</h3>
    </div>`;
  }

  function initializeClickHandlers() {
    $(".country-card").click(event => {
      $(".country-card.selected").removeClass("selected");
      event.currentTarget.className += " selected";
      const selectedCode = $(".country-card.selected > .country-card-code")
        .text()
        .trim();

      $("#detailed-info-message").hide();

      if (countriesDataCache[selectedCode]) {
        provisionCountryDetails(countriesDataCache[selectedCode]);
      } else {
        fetch(
          `https://restcountries.eu/rest/v2/alpha/${selectedCode}?fields=flag;nativeName;capital;population;languages;timezones;borders`
        )
          .then(response => response.json())
          .then(selectedCountryData => {
            countriesDataCache[selectedCode] = selectedCountryData;
            provisionCountryDetails(selectedCountryData);
          })
          .catch(error =>
            console.error(
              `There was a problem with the request to get info for country ${selectedCode}`,
              error
            )
          );
      }
    });
  }

  function provisionCountryDetails(countryData) {
    console.log(countryData);
    const detailsContent = generateDetailsContent(countryData);
    countriesInfoPanelElement.html(detailsContent);
  }

  function generateDetailsContent(countryData) {
    let content = `
    <img id="flag-image" src="${countryData.flag}" />
        <p>
          <span class="details-field-label">Native name:</span>
          <span class="details-field-value">${countryData.nativeName}</span>
        </p>
        <p>
          <span class="details-field-label">Capital city:</span>
          <span class="details-field-value">${countryData.capital}</span>
        </p>
        <p>
          <span class="details-field-label">Population:</span>
          <span class="details-field-value">${
            countryData.population
          } inhabitants</span>
        </p>`;

    if (countryData.languages && countryData.languages.length) {
      content += `<p>
          <span class="details-field-label">Languages:</span>
          <span class="details-field-value">`;
      countryData.languages.forEach((language, index) => {
        content += `${language.nativeName} (${language.name})`;
        if (index !== countryData.languages.length - 1) {
          content += ", ";
        }
      });
      content += `</span>
          </p>`;
    }

    if (countryData.timezones && countryData.timezones.length) {
      content += `<p>
          <span class="details-field-label">Timezones:</span>
          <span class="details-field-value">`;
      countryData.timezones.forEach((timezone, index) => {
        content += `${timezone}`;
        if (index !== countryData.timezones.length - 1) {
          content += ", ";
        }
      });
      content += `</span>
          </p>`;
    }

    if (countryData.borders && countryData.borders.length) {
      content += `<p>
          <span class="details-field-label">Borders with:</span>
          <span class="details-field-value">`;
      countryData.borders.forEach((border, index) => {
        content += `${allCountriesByAlpha3CodeAndName[border]}`;
        if (index !== countryData.borders.length - 1) {
          content += ", ";
        }
      });
      content += `</span>
          </p>`;
    }
    return content;
  }
});
