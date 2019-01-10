/**
 * Identificativo dello spreadsheet
 *
 * https://docs.google.com/spreadsheets/d/1g_iyG-1Xc1eY5-zFwjLkE64QbRrsie9wlA6jY1uZJeI/edit#gid=0
 *
 * Per invocare il menu con un altro foglio invocarlo con il parametro in get NomeFoglio. Esempio
 *
 *  http://localhost:63342/frame-menu/menu.html?NomeFoglio=foglio2
 *
 * @type {string}
 */
var SPREADSHEET_ID = '1g_iyG-1Xc1eY5-zFwjLkE64QbRrsie9wlA6jY1uZJeI';


/**
 * Questa costante rappresenta il nome del foglio da utilizzare. NON SERVE MODIFICARE
 * @type {string}
 */
const NOME_FOGLIO_PARAM = 'NomeFoglio';


let menuInfo = null;
let menuItems = [];
let menuSheetList = [];
let menuSheet = null;

/**
 * Gestisce i parametri queryParams.
 *
 * @param name
 * @returns {*}
 */
$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null) {
        return null;
    }
    return decodeURIComponent(decodeURI(results[1]) || 0);
}

/**
 * A partire dal nome, recupera l'id del foglio, necessario.
 *
 * @param name
 * @param worksheetList
 * @returns {*}
 */
$.convertWorksheetNameToId = function convertWorksheetNameToId(name, worksheetList) {
    for (let item of worksheetList) {
        if (item.title.toLocaleLowerCase() === name.toLocaleLowerCase()) {
            return item.id;
        }
    }

    return undefined;
}

// https://stackoverflow.com/questions/819416/adjust-width-and-height-of-iframe-to-fit-with-content-in-it
// guarda https://css-tricks.com/dynamic-page-replacing-content/
/**
 * <p>Costruisce il menu.</p>
 *
 * @param menuInfo
 * @param menuItems
 */
$.buildMenu = function buildMenu(menuInfo, menuItems) {
    var uiDescrizione = $("#app-descrizione");
    uiDescrizione.text(''+menuInfo.descrizione+'');

    var uiLink = $("#app-link");
    uiLink.attr("href", menuInfo.link);

    var uiImage = $("#app-image");
    uiImage.attr("src", menuInfo.immagine);

    const uiMenu=$('#app-menu');

    // controllo esistenza componenti menu
    if (menuItems.length>0) {
        menuItems.forEach(item => {
            uiMenu.append('<li class="nav-item"><a class="nav-link app-menu" target="app-frame" href="'+item.url+'">'+item.chiave+'</a></li>');
        });

        $('.app-menu').on('click', function() {
            // rimuove tutte le altre classi active e la imposta su quella appena inserita
            $('.app-menu').removeClass('active');
            $(this).addClass('active');
        });

        $('.app-menu')[0].click();
    } else {
        uiMenu.append('<li class="nav-item">Menu non presente</li>');
    }

}

$(document).ready(function () {
    // prepariamo i toooltip
    $(document).ready(function(){
        $('[data-toggle="tooltip"]').tooltip();
    });

    // impostiamo handler dell'evento click per il pulsante refresh
    $('#app-refresh').click(function() {
        location.reload();
    });


    $.googleWorkSheetListToJSON(SPREADSHEET_ID).done(function (worksheetList) {


        let menuChoosed = $.urlParam(NOME_FOGLIO_PARAM);
        console.log('Foglio selezionato (con query param "'+NOME_FOGLIO_PARAM+'")=',menuChoosed);

        // impostiamo l'elenco <nome foglio, id>
        menuSheetList = worksheetList;
        console.log('Elenco foglio presenti nel gsheet: ',worksheetList);

        if (menuChoosed !== null) {
            menuSheet = $.convertWorksheetNameToId(menuChoosed, worksheetList);
            if (menuSheet===undefined) {
                console.error('Il query param "'+NOME_FOGLIO_PARAM+'" contiene un foglio inesistente. Viene utilizzato il primo foglio');
            }
        } else {
            menuSheet = undefined;
        }



        $.googleSheetToJSON(SPREADSHEET_ID, menuSheet)
            .done(function (rows) {
                    // each row is a row of data from the spreadsheet
                    //console.log(rows);

                    for (const item of rows) {
                        // console.log(item);
                        if (item.hasOwnProperty("descrizione")) {
                            menuInfo = {
                                descrizione: item["descrizione"],
                                immagine: item["immagine"],
                                link: item["link"]
                            }
                        }

                        if (item.hasOwnProperty("nascosta")) {
                            continue;
                        }

                        menuItems.push(item);
                    }

                    $.buildMenu(menuInfo, menuItems);
                }
            )
            .fail(function (err) {
                console.log('error!', err);
            });
    }).fail(function (err) {
        console.log('error!', err);
    });
});
