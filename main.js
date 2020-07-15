/* globals $ */

$(document).ready(() => {
  const apiBaseUrl = "https://restcountries.eu/rest/v2";

  let allCountriesByAlpha3CodeAndName = {};
  let allCountriesDataCache = [];
  let countriesDataCache = {};

  let countriesListElement = $("#country-list-wrapper");
  let countriesInfoPanelContentElement = $("#global-info-panel-content");

  initApp();

  function initApp() {
    const searchButton = $("#search-button");
    const searchField = $("#search-field");

    $("#search-button").click(() => searchCountries());

    // Trigger search on enter key press in search field
    searchField.keyup(event => {
      if (event.keyCode === 13) {
        event.preventDefault();
        searchButton.click();
      }
    });

    window
      .fetch(`${apiBaseUrl}/all?fields=name;alpha2Code;alpha3Code;`)
      .then(response => {
        return response.json();
      })
      .then(allCountriesData => {
        allCountriesDataCache = allCountriesData;
        if ($.isEmptyObject(allCountriesByAlpha3CodeAndName)) {
          for (const country of allCountriesData) {
            allCountriesByAlpha3CodeAndName[country.alpha3Code] = country.name;
          }
        }
        provisionData(allCountriesData);
      })
      .catch(error =>
        console.error(
          "There was a problem with the request to get countries info.",
          error
        )
      );
  }

  function provisionData(countriesData) {
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
    </div>
    <div class="country-card-info-panel country-details"></div>
    `;
  }

  function initializeClickHandlers() {
    $(".country-card").click(event => {
      $(".selected").removeClass("selected");
      const selectedCard = event.currentTarget;
      selectedCard.className += " selected";
      $(selectedCard)
        .next("div.country-card-info-panel")
        .addClass("selected");

      const selectedCode = $(".country-card.selected > .country-card-code")
        .text()
        .trim();

      $("#detailed-info-message").hide();

      if (countriesDataCache[selectedCode]) {
        provisionCountryDetails(
          countriesDataCache[selectedCode],
          event.currentTarget
        );
      } else {
        fetch(
          `${apiBaseUrl}/alpha/${selectedCode}?fields=flag;nativeName;capital;population;languages;timezones;borders`
        )
          .then(response => response.json())
          .then(selectedCountryData => {
            countriesDataCache[selectedCode] = selectedCountryData;
            provisionCountryDetails(selectedCountryData, event.currentTarget);
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

  function provisionCountryDetails(countryData, cardElement) {
    const detailsContent = generateDetailsContent(countryData);

    $("div.country-card-info-panel").html("");

    countriesInfoPanelContentElement.html(detailsContent);
    $(cardElement)
      .next("div.country-card-info-panel")
      .html(detailsContent);
  }

  function generateDetailsContent(countryData) {
    let content = `
    <img id="flag-image" src="${countryData.flag}" />
      <div id="details-wrapper">
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

    content += `
      </div>`;
    return content;
  }

  function searchCountries() {
    const searchTerm = $("#search-field")
      .val()
      .toLowerCase();

    let searchResults = [];
    if (!searchTerm) {
      searchResults = allCountriesDataCache;
    } else {
      searchResults = allCountriesDataCache.filter(country =>
        country.name.toLowerCase().startsWith(searchTerm)
      );
    }

    provisionData(searchResults);

    if (!searchResults.length) {
      countriesListElement.html(
        `<p>No search results for ${searchTerm}. Please try again.</p>`
      );
    }

    countriesInfoPanelContentElement.html("");
    $("#detailed-info-message").show();
  }
});
