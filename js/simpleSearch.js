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
            'spellcheck.build': 'true',
            'spellcheck.reload': 'true'
        },
        jsonp: 'json.wrf',
        success: function (data) {
            // renderQuerySuggestion(data.spellcheck.suggestions);
            renderQuerySuggestion();
            
            renderResults(data.response.docs, $container, $template);
        }
    });
}

function renderQuerySuggestion(suggestions) {
    suggestions = spellchecktest.spellcheck.suggestions;
    
    var container = $(".suggestions");
    var template = $(".suggestion-template");
    var templateClone;

    container.empty();

    for(var i = 0; i < 5; i++) {
        templateClone = template.clone();

        var index = Math.floor(Math.random() * (suggestions.length - 0 + 1) + 0);

        templateClone.html(suggestions[index]);
        templateClone.removeClass("suggestion-template");

        templateClone.click(function() {
            $( "input#query" ).val($(this).html());
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
