// ==UserScript==
// @name          Profanity Filter
// @author        adisib
// @namespace     namespace_adisib
// @description   Simple filtering for profanity from website text. Not limited to static text, while avoiding performance impact.
// @version       2020.12.26
// @include       http://*
// @include       https://*
// @grant         none
// @updateURL     https://github.com/rabbiveesh/Profanity-Filter/raw/master/profanity_filter.user.js
// @downloadURL   https://github.com/rabbiveesh/Profanity-Filter/raw/master/profanity_filter.user.js
// ==/UserScript==


(function() {

    "use strict";


    // --- SETTINGS --------


    // The string that replaces offending words.
    const replaceString = "*CABBAGE*";
    const replacePorn = "*חס ושלום*";

    // If useCustomWords is true, then customWords is used as the word list and the default list will not be used. Otherwise, it uses a pre-compiled version of the default list for performance.
    // The words list does not have to include endings like plurals or "ing", as they will always be handled.
    // The default list is: ['fuck','shit','ass','damn','asshole','bullshit','bitch','piss','goddamn','crap','sh!t','bastard','dumbass','fag','motherfuck','nigger','cunt','douche','douchebag','jackass','mothafuck','pissoff','shitfull','fuk','fuckme','fvck','fcuk','b!tch','phuq','phuk','phuck','fatass','faggot','dipshit','fagot','faggit','fagget','assfuck','buttfuck','asswipe','asskiss','assclown']
    // This should be ordered by most common first for performance, and must only contain alpha-numeric (unless you sanitize for regex)
    const useCustomWords = false;
    const customWords = [];

    // Display performance and debugging information to the console.
    const DEBUG = false;


    // --------------------


    let wordString = useCustomWords ? "\\b(?:" + customWords.join("|") + ")[tgkp]??(?=(?:ing?(?:ess)??|ed|i??er|a)??(?:e??[syz])??\\b)" :
    "\\b(?:(?:f(?:u(?:c?k.*?\\b)|a(?:g(?:(?:g[eio]|o)t)??|tass)|(?:cu|vc)k)|b(?:u(?:llshit|ttfuck)|[!i]tch|astard)|ass(?:(?:hol|wip)e|clown|fuck|kiss)??|d(?:amn|umbass|ouche(?:bag)??|ipshit)|p(?:hu(?:c?k|q)|iss(?:off)??)|s(?:h(?:it(?:full)??|!t)|lut)|moth(?:er|a)fuck|c(?:rap|unt)|goddamn|jackass|nigg))[tgkp]??(?=(?:ing?(?:ess)??|ed|i??er|a)??(?:e??[syz])??\\b)";
    const wordsFilter = new RegExp(wordString, "gi");
    wordString = null;

  // we need to get a bit more picky about this, and not block out
  // pronounce or pronate
    let pornString = "p(?:(?:o|0)rn.*?\\b|r(?:on(?:\\b|o\\b|(?:star|ography).*?\\b)|0n.*?\\b))";
    const pornFilter = new RegExp(pornString, "gi");

    let secondString = "\\b(?:cum(?:shot)??|dick(?:head)??|cock|pussy)[m]??(?=(?:ing?(?:ess)??|ed|i??er|a)??(?:e??[syz])??\\b)";
    const secondaryFilter = new RegExp(secondString, "gi");

    const findText = document.createExpression(".//text()[string-length() > 2 and not(parent::script or parent::code)]", null);


    // Initial slow filter pass that handles static text
    function filterStaticText()
    {
        let startTime, endTime;
        if (DEBUG)
        {
            startTime = performance.now();
        }

        // Do title first because it is always visible
        if (wordsFilter.test(document.title) || pornFilter.test(document.title))
        {
            document.title = document.title.replace(pornFilter, replacePorn);
            document.title = document.title.replace(wordsFilter, replaceString);
            document.title = document.title.replace(secondaryFilter, replaceString);
        }

        filterNodeTree(document.body);

        if (DEBUG)
        {
            endTime = performance.now();
            console.log("PF | Static Text Run-Time (ms): " + (endTime - startTime).toString());
        }
    }


    // --------------------


    // filters dynamic text, and handles things such as AJAX Youtube comments
    function filterDynamicText()
    {
        let textMutationObserver = new MutationObserver(filterMutations);
        let TxMOInitOps = { characterData: true, childList: true, subtree: true };
        textMutationObserver.observe(document.body, TxMOInitOps);

        let title = document.getElementsByTagName("title")[0];
        if (title)
        {
            let titleMutationObserver = new MutationObserver( function(mutations) { filterNode(title); } );
            let TiMOInitOps = { characterData: true, subtree: true };
            titleMutationObserver.observe(title, TiMOInitOps);
        }
    }


    // --------------------


    // Handler for mutation observer from filterDynamicText()
    function filterMutations(mutations)
    {
        let startTime, endTime;
        if (DEBUG)
        {
            startTime = performance.now();
        }

        for (let i = 0; i < mutations.length; ++i)
        {
            let mutation = mutations[i];

            if (mutation.type === "childList")
            {
                let nodes = mutation.addedNodes;
                for (let j = 0; j < nodes.length; ++j)
                {
                    filterNodeTree(nodes[j]);
                }
            }
            else if (mutation.type === "characterData")
            {
                filterNode(mutation.target);
            }
        }

        if (DEBUG)
        {
            endTime = performance.now();
            console.log("PF | Dynamic Text Run-Time (ms): " + (endTime - startTime).toString());
        }
    }


    // --------------------


    // Filters a textNode
    function filterNode(node)
    {
        if ((wordsFilter.test(node.data) || pornFilter.test(node.data))  && !node.parentNode.isContentEditable)
        {
            node.data = node.data.replace(pornFilter, replacePorn);
            node.data = node.data.replace(wordsFilter, replaceString);
            node.data = node.data.replace(secondaryFilter, replaceString);
        }
    }


    // --------------------


    // Filters all of the text from a node and its decendants
    function filterNodeTree(node)
    {
        if (!node || (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.TEXT_NODE))
        {
            return;
        }

        if (node.nodeType === Node.TEXT_NODE)
        {
            filterNode(node);
            return; // text nodes don't have children
        }

        let textNodes = findText.evaluate(node, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

        const l = textNodes.snapshotLength;
        for (let i = 0; i < l; ++i)
        {
            filterNode(textNodes.snapshotItem(i));
        }
    }


    // --------------------


    // Runs the different filter types
    function filterPage()
    {
        filterStaticText();
        filterDynamicText();
    }


    // --- MAIN -----------

    filterPage();

})();
