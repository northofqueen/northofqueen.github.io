
/*  I want a list at the bottom of each page that shows all the addresses linked
    to throughout the article. Instead of doing this manually, I have the
    code that parses links also push them to this array, which is then used to
    populate a citations list at the end automatically (see layout.js) */
let citationArray = [];
let tocArray = [];

/*  These are the replacements run over all inputs, separated into its
    own function because I needed to call it multiple times. */
function stdReplacements(inputString) {
    if (inputString == "") { return ""; }
    let output = inputString
        .replaceAll("\\*", "&ast;")
        .replaceAll("---", "&mdash;")
        .replaceAll("--", "&ndash;")
        .replaceAll("\\^", "&Hat;")
        .replaceAll("\\_", "&lowbar;")
        .replaceAll("\\(", "&lpar;")
        .replaceAll("\\)", "&rpar;")
        .replaceAll("\\[", "&lbrack;")
        .replaceAll("\\]", "&rbrack;")
        .replaceAll("\\", "&#92;")
        /*
            It took many versions, but I think I finally got to a point
            where this always works the way I want it to.
        */
        /* curly " replacement */
        .replace(/(\S\*{1,3})" /g, "$1&rdquo; ")
        .replace(/^" /g, "&rdquo; ")
        .replace(/^"(\.|,)/g, "&rdquo;$1")
        .replace(/ "$/g, " &ldquo;")
        .replace(/"$/g, "&rdquo;")
        .replace(/(\s|^|;|\*|\[|\()"/g, "$1&ldquo;")
        .replace(/"/g, "&rdquo;")
        
        /* curly ' replacement */
        .replace(/'(\d{2}) /, "&rsquo;$1 ") // for saying '95 or '27 etc.
        .replace(/(\S\*{1,3})'(\s)/g, "$1&rsquo;$2")
        .replace(/^' /g, "&rsquo; ")
        .replace(/^'(\.|,)/g, "&rsquo;$1")
        .replace(/ '$/g, " &lsquo;")
        .replace(/'$/g, "&rsquo;")
        .replace(/(\s|^|;|\*|\[|\()'/g, "$1&lsquo;")
        .replace(/'/g, "&rsquo;")
        
        .replace(/__(.+?)__/g, "<u>$1</u>")
        .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
        .replace(/\*(.+?)\*/g, "<i>$1</i>")
        .replaceAll("...", "&hellip;")
    return output;
}

/* nested list parser */
function listParser(inputString) {
    const items = inputString.split("\n");
    const end_tags = [];
    const indent_diff = [];
    for (let j = 0; j < items.length; j += 1) {
        let k = 0;
        while (items[j].charAt(k) === " ") {
            k += 1; }
        items[j] = `${" ".repeat(k)}<li>${items[j].slice(k).replace(/^[\*\-]\s+/, "- ").trimEnd()}</li>`; }
    for (let j = 0; j < items.length; j += 1) {
        let indent = items[j].indexOf("<");
        const prev_indent = (j > 0) ? items[j - 1].indexOf("<") : -1;
        const li = items[j].slice(indent + 4);
        
        if (indent > prev_indent) {
            if (li.startsWith("- ")) {
                end_tags.push("</ul>");
                items[j] = "<ul><li>" + li.slice(2); }
            else {
                if (/^\d+\./.test(li)) {
                    end_tags.push("</ol>");
                    items[j] = `<ol start="${li.substring(0, li.indexOf("."))}"><li>${li.slice(li.indexOf(".") + 1).trimStart()}`; }
                else {
                    items[j] = "<br>" + " ".repeat(indent - prev_indent) + li;
                    items[j - 1] = items[j - 1].slice(0, -5);
                    indent = prev_indent; }
            indent_diff.push(indent - prev_indent); } }
        else {
            let br = false;
            if (li.startsWith("- ")) {
                items[j] = "<li>" + li.slice(2); }
            else {
                if (/^\d+\./.test(li)) {
                    items[j] = "<li>" + li.slice(li.indexOf(".") + 1).trimStart(); }
                else {
                    br = true; } }
            if (indent < prev_indent) {
                let diff = prev_indent - indent;
                while (diff > 0) {
                    if (diff < indent_diff[indent_diff.length - 1]) {
                        indent_diff[indent_diff.length - 1] -= diff;
                        diff = 0;
                    } else {
                        diff -= indent_diff.pop();
                        items[j - 1] += end_tags.pop(); } } }
            if (br) {
                let k;
                for (k = j - 1; k > -1; k -= 1) {
                    if (items[k].indexOf("<") == indent) {
                        break; }
                    if (items[k].indexOf("<") < indent) {
                        k += 1; break; } }
                items[k] = items[k].slice(0, -5);
                items[j] = "<br>" + li; } }
        items[j] = " ".repeat(indent) + items[j]; }
    while (end_tags.length > 0) {
        items[items.length - 1] += end_tags.pop(); }
    return items.join('\n');
}

/* This is a general parser I run all input through. It safely ignores
   anything <inside> of tags, with the same logic as wrapDigits */
function safeConvert(input_string) {
    let input = input_string, output = "";
    while (true) {
        let openTag = input.indexOf("<"), closeTag = input.indexOf(">");
        if (openTag == -1 || closeTag == -1) break;
        output += stdReplacements(input.substring(0, openTag)) + input.substring(openTag, closeTag + 1);
        input = input.substring(closeTag + 1);
    }
    output += stdReplacements(input);
    return output;
}
function wrapDigits(targetElement) {
    let input = targetElement.innerHTML, output = "";
    while (true) {
        const openTag = input.indexOf("<"), closeTag = input.indexOf(">");
        if (openTag == -1 || closeTag == -1) { break; }
        output += input.substring(0, openTag).replace(/(\d+)/g, "<span class='rendered_digit'>$1</span>");
        output += input.substring(openTag, closeTag + 1);
        input = input.substring(closeTag + 1);
    }
    output += input.replace(/(\d+)/g, "<span class='rendered_digit'>$1</span>");
    targetElement.innerHTML = output;
}

/*  This one is for <code> and <div class="codeblock"> elements, where you
    don't want any formatting to apply. Run this before safeConvert */
function cleanForCode(input_string) {
    return input_string
        .replaceAll("=\"\"", "")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&apos;")
        .replaceAll("-", "&hyphen;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("(", "&lpar;")
        .replaceAll(")", "&rpar;")
        .replaceAll("[", "&lbrack;")
        .replaceAll("]", "&rbrack;")
        .replaceAll("*", "&ast;")
        .replaceAll("\n", "<br>");
}

/*  .replaceAll is preferred over .replace when you don't need to regex
    functionality because it simply results in more readable code */

/*  ![description](path/to/image.png)
    ![nice](path/to/other_image.png)
 ->
    <div class="image-box">
        <div><img alt="description" title="description" src="path/to/image.png"></div>
        <div><img alt="nice" title="nice" src="path/to/other_image.png"></div>
    </div>                                                                     */
function imageViewer(img) {
    let ivw = document.getElementById("image-viewer-wrapper");
    let iv = document.getElementById("image-viewer");
    if (ivw && iv) {
        ivw.style.display = "flex";
        iv.src = img.src;
        iv.alt = img.alt; } }
function closeImageViewer(img) {
    let ivw = document.getElementById("image-viewer-wrapper");
    let iv = document.getElementById("image-viewer");
    if (ivw && iv) {
        ivw.style.display = "none";
        iv.src = "";
        iv.alt = ""; } }

/* The main interpreter loop. Pass the main element to start. */
function interpreter(targetElement) {
    let input = targetElement.innerHTML
        .replace(/\n\n+/g, "\n\n")
        .replace(/\r/g, "") /* safety */
        .trim()
        .split("\n\n");
    
    let beforeTitle = false;
    let tableNum = 1;
    for (let i = 0; i < input.length; i += 1) {
        
        if (input[i].startsWith("\\")) {
            input[i] = input[i].substring(1);
            continue; }
        
        let dropCap = false;
        let finePrint = false;
        if (input[i].startsWith("^")) {
            finePrint = true;
            input[i] = input[i].substring(1);
        }
        else if (input[i].startsWith("$")) {
            dropCap = true;
            input[i] = input[i].substring(1);
        }
        
        if (input[i] == "***" || input[i] == "---") {
            input[i] = "<hr>";
            continue; }
        
        if (input[i] == "**" || input[i] == "--") {
            input[i] = "<p></p>";
            continue; }
        
        if (input[i].startsWith("||image-box")) {
            let lines = input[i].split("\n").slice(1);
            for (let j = 0; j < lines.length; j += 1) {
                lines[j] = lines[j].replace(/\[(.*)\]\((.+)\)/g, (match, altText, filePath) => {
                    let maxHeight = 320;
                    altText = altText.replace(/"/, "&quot;");
                    let j = filePath.indexOf("|");
                    if (j != -1) {
                        maxHeight = filePath.substring(j + 1);
                        filePath = filePath.substring(0, j);
                    }
                    let imgAttributes = `onclick="imageViewer(this)" style="max-height:${maxHeight}px" src="${filePath}"`;
                    if (altText != "") imgAttributes += ` title="${altText}" alt="${altText}"`;
                    let temp = `<div><img ${imgAttributes}></div>`;
                    return temp
                }); }
            input[i] = `<div class="image-box">${lines.join("")}</div>`;
            continue; }
        
        if (input[i].startsWith("||image-right")) {
            input[i] = input[i].split("\n")[1].replace(/\[(.+)\]\[(.+)\]\((.+)\)/g, (match, caption, altText, filePath) => {
            return `<div class="image-float right"><img onclick="imageViewer(this)" src="${filePath}" title="${altText}" alt="${altText}"><div>${caption}</div></div>`; });
            continue;
        }
        
        if (input[i].startsWith("||image-left")) {
            input[i] = input[i].split("\n")[1].replace(/\[(.+)\]\[(.+)\]\((.+)\)/g, (match, caption, altText, filePath) => {
            return `<div class="image-float left"><img onclick="imageViewer(this)" src="${filePath}" title="${altText}" alt="${altText}"><div>${caption}</div></div>`; });
            continue;
        }
        
        /* before looking for code, fix any \` instances: */
        input[i] = input[i].replace(/\\`/g, "&#96;");
        /* div.codeblock: */
        if (input[i].startsWith("```")) {
            input[i] = input[i].replace(/\s*```\n*/g, "");
            input[i] = "<div class=\"codeblock\">" + cleanForCode(input[i]) + "</div>";
            continue; }
        /* <code></code>: */
        input[i] = input[i].replace(/`(.+?)`/g, (match, captureGroup) => {
            return "<code>" + cleanForCode(captureGroup) + "</code>"; });
        
        /* ------------------------ links ------------------------- */
        /* \[(  [^\]]*  )[^\\]?\]\((  [^\s]+?[^\\]  )\) */
        input[i] = input[i].replace(/\[([^\]]*)[^\\]?\]\(([^\s]+?[^\\])\)/g, (match, displayText, address) => {
            let index = citationArray.indexOf(address);
            address = address.replaceAll("\\)", ")");
            if (index == -1) index = citationArray.push(address);
            let result = (displayText === "")
                ? `<a class="citeref" target="_blank" href="${address}">[${index}]</a>`
                : `<a target="_blank" href="${address}">${displayText}</a>`;
            return result; });
        
        /* ------------------------ table ------------------------- */
        if (input[i].startsWith("||table")) {
            let rows = input[i].split("\n");
            rows.shift();
            for (let j = 0; j < rows.length; j += 1) {
                let cells = rows[j].split("|");
                for (let k = 0; k < cells.length; k += 1) {
                    cells[k] = "<td>" + safeConvert(cells[k].trim()) + "</td>"; }
                rows[j] = "<tr>" + cells.join("") + "</tr>"; }
            input[i] = `<table id="${"table" + tableNum++}" class="noq-table">${rows.join("")}</table>`;
            continue; }
        
        /* ---------------------- transcript ---------------------- */
        if (input[i].startsWith("||transcript")) {
            let rows = input[i].split("\n");
            rows.shift();
            for (let j = 0; j < rows.length; j += 1) {
                let cells = rows[j].split("|");
                if (cells.length > 2) { console.error("{interpreter.js: jyvthqblfs}"); }
                if (cells[0].charAt(0) == "^") {
                    cells[0] = `<span class="fine">${cells[0].substring(1)}</span>`; }
                cells[0] = safeConvert(cells[0].trim());
                cells[1] = safeConvert(cells[1].trim());
                cells[1] = cells[1].replace(/(\[.+?\])/g, `<span class="transcript-note">$1</span>`);
                if (cells[1].charAt(0) == "^") {
                    cells[1] = `<span class="fine">${cells[1].substring(1)}</span>`; }
                
                rows[j] = "<tr><td>"+cells[0]+"</td><td>"+cells[1]+"</td></tr>";
                }
            input[i] = `<table id="${"table" + tableNum++}" class="transcript">${rows.join("")}</table>`;
            continue; }
        
        /* -------------- other places I posted this -------------- */
        if (input[i].startsWith("||see-also")) {
            input[i] = `<br><p class="other-locations"><i>This was also posted here:</i><br>${input[i].split("\n").splice(1).map(c => `<a style="color:var(--grey-50)" href="${c}" target="_blank">${c}</a>`).join("<br>")}</div>`;
            continue; }
        
        /* -------------------------------------------------------- */
        input[i] = safeConvert(input[i]);
        
        /* ------------------------ headers ----------------------- */
        /* ------ h1 ------ */
        if (input[i].startsWith("# ")) {
            const temp = input[i].substring(2).split("|");
            const title = temp[0].trim();
            const titleId = title.replace(/<\/?(i|b)>/g, "").replace(/&amp;/g, "&").replace(/’/g, "'").replace(/&rsquo;/g, "'").replace(/&ndash;/g, "–").replace(/&mdash;/g, "—");
            if (temp.length == 2) {
                const date = temp[1].trim();
                input[i] = `<div class="title-box"><h1 class="noq-header" id="${titleId}">${title}</h1><div class="date-box">${date}</div></div>`; }
            else {
                input[i] = `<h1 class="title-box" id="${titleId}">${title}</h1>`;
            }
            if (document.title == "") { document.title = titleId; }
            tocArray.push(`<a class="toc-row h1" href="#${titleId}">${titleId}</a>`);
            continue; }
        /* ------ h2 ------ */
        if (input[i].startsWith("## ")) {
            let title = input[i].slice(3);
            let titleId = title.replace(/<\/?(i|b)>/g, "");
            input[i] = `<h2 class="noq-header" id="${titleId}">${title}</h2>`;
            tocArray.push(`<a class="toc-row h2" href="#${titleId}">${titleId}</a>`);
            continue; }
        /* ------ h3 ------ */
        if (input[i].startsWith("### ")) {
            let title = input[i].slice(4);
            let titleId = title.replace(/<\/?(i|b)>/g, "");
            input[i] = `<h3 class="noq-header" id="${titleId}">${title}</h2>`;
            tocArray.push(`<a class="toc-row h3" href="#${titleId}">${titleId}</a>`);
            continue; }
        /* toc-row class is useful for selecting the elements later */
        /* ------ h4 ------ */
        if (input[i].startsWith("#### ")) {
            let title = input[i].slice(5);
            input[i] = `<h4>${title}</h4>`;
            /* don't put these in toc */
            continue; }
        /* ---------------------- blockquote ---------------------- */
        if (input[i].startsWith("&gt;")) {
            let lines = input[i].split("\n");
            for (let j = 0; j < lines.length; j += 1) {
                lines[j] = lines[j].replace(/^&gt;/, "").trim();
                if (lines[j].startsWith("&mdash;")) {
                    lines[j] = `<div class="attribution">${lines[j]}</div>`; }
                else {
                    if (lines[j].startsWith("^")) {
                        lines[j] = `<div class="fine">${lines[j].substring(1)}</div>`; }
                    else {
                        lines[j] += "\n"; } } }
            input[i] = lines.join("")
                .replace(/\n\n/g, "<br class=\"bq-br\">")
                .replace(/\n/g, "<br>");
            input[i] = "<blockquote>" + input[i] + "</blockquote>";
            continue; }
        
        /* ------------------------ lists ------------------------- */
        if (input[i].startsWith("* ") || input[i].startsWith("- ") || /^\d+\./.test(input[i])) {
            input[i] = listParser(input[i]);
            if (finePrint) {
                if (input[i].substring(0, 3) != "<ol" && input[i].substring(0, 3) != "<ul") console.error("{interpreter.js: b}")
                input[i] = input[i].substring(0, 3) + " class=\"fine\"" + input[i].substring(3); }
            continue; }
        input[i] = input[i].replace(/\n/g, "<br>");
        if (input[i] == "") { continue; }
        
        if (finePrint) {
            input[i] = `<p class="fine">${input[i]}</p>`;
        } else if (dropCap) {
            input[i] = `<p class="drop-cap">${input[i]}</p>`;
        } else {
            input[i] = `<p>${input[i]}</p>`; }
    }
    targetElement.innerHTML = input.join("");
    
    function wrapElements(x) { let temp = document.getElementsByTagName(x); for (let i = 0; i < temp.length; i += 1) { wrapDigits(temp[i]); } } wrapElements("p"); wrapElements("li"); wrapElements("blockquote");
}




