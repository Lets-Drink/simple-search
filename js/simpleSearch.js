// Doc ready
$(function(){
    // Shortcut function that performs search with the correct parameters.
    // Can be called without any arguments inline 
    function simpleSearch() {
        search( $( "input#query" ).val(), $( "#results" ), $( ".template.result" ) );
    };

    $( "button#search" ).click(function() {simpleSearch()} );

    // Performs search when 'enter' key is pressed
    $( "input#query" ).keypress(function( event ) {
        if ( event.which == 13 ) simpleSearch();
    });

    // Performs a search on the key up of the search box
    $("#query").keyup(function() {
        simpleSearch();
    });

    $(".spellchecking").hide();
    $(".template").hide();
})

// Input: query string, results container, result HTML template
// Effect: makes an AJAX call to the server to get the results of the
// query, and then injects results into the DOM
// Output: void
function search(query, $container, $template){
    $.ajax({
        type: 'GET',
        url: 'http://is-info320t5.ischool.uw.edu:8080/solr-example/collection1/select', 
        dataType: 'JSONP',
        data: {
            'q': query,
            'qf': 'content title^3.0',
            'wt': 'json',
            'indent': 'false',
            'defType': 'edismax',
            'spellcheck': 'true',
            'spellcheck.q': query
        },
        jsonp: 'json.wrf',
        success: function (data) {
                // Spellchecking
                var sp = data.spellcheck.suggestions;
                $(".spellchecking").hide();
                if(sp.length != 0) {
                    renderQuerySuggestion(sp[1].suggestion);   
                    $(".spellchecking").fadeIn(500);
                }

                // Search Results
                renderResults(data.response.docs, $container, $template);
        }
    });
}

function renderQuerySuggestion(suggestions) {
    var container = $(".spellcheck-container");
    var template = $(".spellcheck-template");
    var templateClone = template.clone();

    container.empty();

    templateClone.html(suggestions[0]);
    templateClone.removeClass("spellcheck-template");

    templateClone.click(function() {
        $( "input#query" ).val($(this).html());
        search( $( "input#query" ).val(), $( "#results" ), $( ".template.result" ) );
    });

    templateClone.show();
    container.append(templateClone);


    for(var i = 1; i < suggestions.length; i++) {
        templateClone = template.clone();

        templateClone.html(", " + suggestions[i]);
        templateClone.removeClass("spellcheck-template");

        templateClone.click(function() {
            var input = $(this).html();
            input = input.split(" ");
            $( "input#query" ).val(input[1]);
            search( $( "input#query" ).val(), $( "#results" ), $( ".template.result" ) );
        });

        container.append(templateClone);
    }


}

// Input: JSON array of results, results container, result HTML template
// Effect: Replaces results container with new results, and renders
// the appropriate HTML
// Output: void
function renderResults(docs, $container, $template){
    $container.empty(); // If there are any previous results, remove them
    var result;
    $.each(docs, function(index, doc){
        result = $template.clone();
        result.find( ".title > a" )
            .prop( "href", doc.url)
            .find( "h3" )
            .append( doc.title );
        result.find( ".url" ).append( doc.url );
        result.find( ".content" ).append( maxWords(doc.content, 100) );
        result.removeClass( "template" );
        result.fadeIn(500);
        $container.append(result);
    });
}

// Cuts off lengthy content to a given maximum number of words
// Input: string of words, maximum number of words
// Effects: none
// Output: the trimmed words
function maxWords(content, max) {
    var words = content.split(' ', max);
    var idx;
    var cutContent = "";
    for (idx = 0; idx < words.length; idx++) {
	cutContent += words[idx];
	cutContent += (idx + 1 == words.length ? "" : " ");
    }
    return cutContent + "...";
}
