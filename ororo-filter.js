// ==UserScript==
// @name         Add rating sorting for ororo.tv
// @namespace    http://tampermonkey.net/
// @version      1.0
// @author       Artem Gorokhov
// @match        https://ororo.tv/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hibbard.eu
// @run-at      document-start
// @grant   GM_getValue
// @grant   GM_setValue
// ==/UserScript==

let addRatingForm = function(strMinRating) {
    // Create a new text area element
    var textArea = document.createElement('input');
    textArea.type = 'text'; // Set the number of visible rows
    textArea.style = 'width:70px;height:32px'
    textArea.value = strMinRating;

    // Create a form element
    var form = document.createElement('form');
    form.className = 'sorter-rating';
    form.style = 'width:70px;height:32px'
    form.appendChild(textArea);

    // Get the sorters element by ID
    var sortersElement = document.getElementsByClassName('sorters')[0];

    // Add the form to the sorters element
    sortersElement.insertBefore(form, sortersElement.firstChild);

    // Submit event listener
    form.addEventListener('submit', function(event) {
        //event.preventDefault();
        GM_setValue('minRatingOfMovies', textArea.value.trim());
    });
}

let processMainPage = function() {
    const strMinRating = GM_getValue('minRatingOfMovies', '6.4');
    const minRating = parseFloat(strMinRating);

    gon.cards.items = gon.cards.items.filter(film => film.imdb_rating > minRating);
    if (document.readyState === "interactive") {
        var modif2 = document.createElement("script");
        modif2.type = "text/javascript";
        modif2.src = 'https://unpkg.com/xhook@1.4.9/dist/xhook.min.js';
        document.getElementsByTagName('head')[0].appendChild(modif2);
    } else if (document.readyState === "complete") {
        var modif = document.createElement("script");
        modif.type = "text/javascript";
        modif.innerHTML =
            `xhook.after(function(request, response) {
                console.log('got request to ' + request.url);
                if (request.url.indexOf('/en/shows') !== -1 || request.url.indexOf('/en/movies') !== -1) {
                    console.log('intersepting request to ' + request.url);
                    const responseJson = JSON.parse(response.text);
                    responseJson.items = responseJson.items.filter(film => film.imdb_rating > ` + strMinRating + `);
                    response.text = JSON.stringify(responseJson)
                }
        });`;
        document.getElementsByTagName('head')[0].appendChild(modif);
        addRatingForm(strMinRating);
    }
}

document.onreadystatechange = function () {
    if (gon.cards) {
        processMainPage();
    }
}