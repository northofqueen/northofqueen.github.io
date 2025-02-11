"use strict"
let dataVariable = `
news-2025 | News 2025                                              | politics |            | pinned | wide  
27        | Sex, gender, & transsexuals                            | politics |            | pinned | wide  
32        | Politics fundamentals                                  | politics |            | pinned | wide  
17        | Why get bottom surgery?                                | culture  | 2025-02-09 |        |       
35        | Show and tell (Lex Fridman)                            | politics | 2025-02-05 |        |       
16        | Milo Yiannopoulos's cancellation                       | politics | 2025-02-03 |        |       
34        | The Nazi salute                                        | politics | 2025-01-24 |        | 
30        | The appearance of intelligence                         | other    | 2025-01-18 |        | 
29        | Date formats                                           | other    | 2025-01-11 |        | narrow
28        | Therapy theory                                         | personal | 2025-01-09 |        |       
31        | Reflections on Justin Trudeau                          | politics | 2025-01-08 |        | 
25        | A beauty holding a bird                                | other    | 2024-12-23 |        | narrow
24        | Enduring falsehoods about Warren, Clinton              | politics | 2024-12-19 |        |       
22        | Dehumanization                                         | politics | 2024-12-15 |        |       
21        | Relationships                                          | personal | 2024-12-14 |        |       
14        | Reasons I'm glad to be Canadian                        | politics | 2024-12-08 |        |       
13        | The military–industrial complex                        | politics | 2024-12-04 |        | 
11        | The Trump appeal                                       | politics | 2024-12-03 |        | 
12        | The order of information                               | politics | 2024-12-03 |        |       
10        | Touchscreens and smartphones                           | culture  | 2024-12-02 |        | 
9         | The default politician                                 | politics | 2024-11-26 |        |       
8         | 10 Dollar                                              | culture  | 2024-11-25 |        | narrow
7         | Fetishism & politics                                   | politics | 2024-11-14 |        |       
6         | Mark Robinson                                          | politics | 2024-11-13 |        | 
5         | Types of masculinity                                   | culture  | 2024-11-08 |        |       
4         | Anime reviews                                          | culture  | 2024-11-02 |        |       
3         | Poor things (2023 film)                                | culture  | 2024-10-31 |        |       
1         | Language                                               | personal | 2024-10-29 |        |       
2         | The trans prison stats argument                        | politics | 2024-10-19 |        |       
19        | Ilham Omar's controversial comments about Somalia      | politics | 2024-01-28 |        |       
37        | Bluesky accounts listing                               | other    |            |        | wide  
18        | Transcripts: context for inflammatory Trump statements | politics |            |        |       
list      | Full page list                                         | personal |            |        |       
index     |                                                        |          |            |        |       
          | People don't really have world views                   | personal |            |        |       
20        | Israel notes                                           | politics |            |        | 
`;

let tableWidth;
function alignTable(dataString, splitChar) {
    let table = dataString.split("\n").map(row => row.split(splitChar).map(cell => cell.trim()));
    tableWidth = Math.max(...table.map(row => row.length));
    for (let column = 0; column < tableWidth; column += 1) {
        let cellWidth = 0;
        for (let i = 0; i < table.length; i += 1) {
            if (table[i].length == 1) { continue; }
            while (table[i].length < tableWidth) { table[i].push(""); }
            if (table[i][column].length > cellWidth) {
                cellWidth = table[i][column].length; } }
        for (let i = 0; i < table.length; i += 1) {
            if (table[i].length < tableWidth) continue;
            table[i][column] += " ".repeat(cellWidth - table[i][column].length); } }
    for (let i = 0; i < table.length; i += 1) {
        table[i] = table[i].join(` ${splitChar} `); }
    dataVariable = table.join("\n");
    // console.log(dataVariable);
}
/* run this to automatically align table above (to console): */
alignTable(dataVariable, "|");

let tocLinks, sectionHeadings, tocUpdateFlag = true, currentHeading = "";
function tocHighlighter() {
    if (!tocUpdateFlag) { return; }
    tocUpdateFlag = false;
    setTimeout(() => { tocUpdateFlag = true; }, 50);
    
    let headingId;
    for (let i = 0; i < sectionHeadings.length; i += 1) {
        if (pageYOffset > sectionHeadings[i].offsetTop - window.innerHeight * 0.5) {
            headingId = sectionHeadings[i].id; }
        else {
            break; } }
    if (headingId != currentHeading) {
    for (let i = 0; i < tocLinks.length; i += 1) {
        tocLinks[i].classList.remove("active-heading");
        if (tocLinks[i].getAttribute("href") == "#" + headingId) {
            tocLinks[i].classList.add("active-heading"); } } }
    currentHeading = headingId; }

function pageLoad() {
    document.head.innerHTML += `<link rel="stylesheet" href="assets/main.css"><link rel="icon" type="image/x-icon" href="assets/favicon.ico">`;
    const footer = document.body.appendChild(document.createElement("footer"));
    footer.id = "footer";
    footer.innerHTML += `<div id="image-viewer-wrapper" onclick="closeImageViewer()"><img id="image-viewer"></div>`;
    
    const pageTop = document.getElementById("top");
    if (pageTop) {
        pageTop.innerHTML =
        `<header id="header">
            <a href="index.html">
                <img height="67" width="252" alt="North of Queen logo" src="assets/header-image.png">
            </a>
        </header>
        <div id="nav">
        </div>`; }
    else console.error("layout.js: can't find #top");
    
    const main = document.getElementById("main");
    if (main) {
        interpreter(main); }
    else console.error("layout.js: can't find #main");
    
    const content = document.getElementById("content");
    if (content) {
        let contentFooter = content.appendChild(document.createElement("div"));
        contentFooter.id = "content-footer";
        contentFooter.innerHTML = `
            <div>
                <img src="assets/favicon.ico">
                <div>
                    <p><span style="color:var(--accent)">North of Queen</span> is my personal repo for things I write. I work alone and have no association with any other person or organization.</p><p>For more info about me, see <a href="index.html">here</a>.</p>
                </div>
            </div>`;
        
        if (citationArray.length > 0) {
            for (let i = 0; i < citationArray.length; i += 1) {
                citationArray[i] = `<li><a href="${citationArray[i]}">${citationArray[i]}</a></li>`; }
            let citations = content.appendChild(document.createElement("div"));
            citations.id = "citations";
            citations.innerHTML = `<div>things linked to on this page:</div><ol>${citationArray.join("")}</ol>`; } }
    else console.error("layout.js: can't find #content-wrapper");
    
    let gettingFileName = location.href.split("/");
    while (gettingFileName[gettingFileName.length - 1] === "") { gettingFileName.pop(); }
    gettingFileName = gettingFileName.pop();
    if (gettingFileName.indexOf("#") != -1) { gettingFileName = gettingFileName.substring(0, gettingFileName.indexOf("#")); }
    
    const fileName = gettingFileName.replace(/\.html$/, "");
    
    const navPageLinks = { pins: [], recent: [], full: [] };
    const dataRows = dataVariable.split("\n");
    const page = document.getElementById("page");
    if (page) {
        for (let i = 0; i < dataRows.length; i += 1) {
            let cells = dataRows[i].split("|").map(cell => cell.trim());
            if (cells.length >= 5) {
                let row_fileName = cells[0],
                    row_name     = cells[1],
                    row_category = cells[2],
                    row_date     = cells[3],
                    row_flags    = cells[4],
                    row_options  = cells[5];
                
                const isPinned = (row_flags == "pinned");
                let pinIcon = (isPinned) ? `<img class="icon" src="assets/pin2.png" height="17" width="17">` : "";
                
                let row_class = "nav-row";
                let isCurrentPage = (row_fileName == fileName);
                if (isCurrentPage) {
                    row_class += " current-page";
                    if (row_options != "") {
                        page.classList.add(...row_options.split(" "));
                        if (pageTop) {
                            pageTop.classList.add(...row_options.split(" "));
                        }
                    }
                }
                
                if (row_fileName == "") { continue; }
                if (row_fileName == "index") { continue; }
                if (row_fileName == "list") { continue; }
                
                let sidebarLink = `<a href="${row_fileName}.html" class="${row_class}">${row_name}${pinIcon}</a>`;
                if (isPinned) {
                    navPageLinks.pins.push(sidebarLink); }
                else {
                    if (isCurrentPage || navPageLinks.recent.length < 12 ) {
                        navPageLinks.recent.push(sidebarLink); }
                }
                
                if (row_date == "") { row_date = "---"; }
                navPageLinks.full.push(`
                <tr>
                    <td><a href="${row_fileName}.html">${row_name}${pinIcon}</a></td>
                    <td>${row_category}</td>
                    <td>${row_date}</td>
                </tr>`);
            }
        }
        const left = document.getElementById("left");
        left.innerHTML = 
            `<nav id="page-links">
                ${navPageLinks.pins.join("")}
                ${navPageLinks.recent.join("")}
                <div class="more-posts"><a href="list.html">Full page list</a></div>
            </nav>`;
        if (tocArray.length > 1) {
            tocArray[0] = `<a class="toc-row h1" href="#top">(Top of page)</a>`;
            left.innerHTML +=
            `<nav id="toc">
                <h3>This page, table of contents</h3>
                <div id="toc-links">${tocArray.join("")}</div>
            </nav>`;
            if (!tocLinks) { tocLinks = Array.from(document.getElementById("toc").getElementsByClassName("toc-row")); }
            if (!sectionHeadings) { sectionHeadings = Array.from(document.getElementsByClassName("noq-header")); }
            window.addEventListener("scroll", tocHighlighter); }
        // else { document.getElementById("page-links").classList.add("is-sticky"); }
    }
    else console.error("layout.js: can't find #page");
    
    if (document.title == "Full page list") {
        let table = document.getElementsByClassName("noq-table");
        console.log(table);
        if (table.length > 0)
        table[0].innerHTML = `<tr><th>Title</th><th>Category</th><th>Date</th></tr>${navPageLinks.full.join("")}`; }
    
    if (document.title === "") {
        document.title = "North of Queen"; }
    else {
        document.title += " – North of Queen"; }
    
    const cover = document.getElementById("cover");
    if (cover) {
        cover.classList.add("fade-out");
        cover.addEventListener("animationend", () => { cover.remove(); });
    }
    else console.error("layout.js: can't find #cover");
}

window.addEventListener("load", pageLoad);



