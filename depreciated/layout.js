
"use strict";

var tableOfContentsLinks = [];
var canResizePageWidth = true;
var page;
var article;
var rowsInToc;
var headersInArticle;
var currentHeading = "";
var sidebarOnTop = false;
var tocUpdateFlag = true;
var lbKeyResponsive = false;
var lightboxContainer, lightboxImg;
window.sessionStorage.setItem("pageMode", "normal");
if (window.sessionStorage.getItem("sidebarHidden") === null) { window.sessionStorage.setItem("sidebarHidden", "false"); }

let data = `
39    | Movies                                                 |             |            | narrow | unlisted
37    | Bluesky accounts listing                               | other       |            | wide   |         
36    | People don't really have world views                   |             |            |        | unlisted
35    | Show and tell (Lex Fridman)                            | politics    | 2025-02-05 |        |         
34    | The Nazi salute                                        | politics    | 2025-01-24 |        |         
33    | The Lorax sux                                          | culture     | 2025-02-27 | narrow |         
32    | Conservatism                                           | politics    | 2025-01-05 | wide   |         
31    | Reflections on Justin Trudeau                          | politics    | 2025-01-08 |        |         
30    | The appearance of intelligence                         | other       | 2025-01-18 |        |         
29    | Date formats                                           | other       | 2025-01-11 | narrow |         
28    | Therapy theory                                         | personal    | 2025-01-09 |        |         
27    | Sex, gender, & transsexuals                            | transgender | 2024-12-29 |        |         
26    | News 2025                                              | politics    |            | wide   | pinned  
25    | A beauty holding a bird                                | other       | 2024-12-23 | narrow |         
24    | Enduring falsehoods about Warren, Clinton              | politics    | 2024-12-19 |        |         
23    | Passing                                                | transgender | 2025-02-24 |        |         
22    | Dehumanization                                         | politics    | 2024-12-15 |        |         
21    | Relationships                                          | personal    | 2024-12-14 |        |         
20    | Israel–Palestine notes                                 | politics    | 2025-02-24 |        |         
19    | Ilhan Omar's comments about Somalia                    | politics    | 2025-02-12 |        |         
18    | Transcripts: context for inflammatory Trump statements | politics    |            |        |         
17    | Why get bottom surgery?                                | transgender | 2025-02-09 |        |         
16    | Milo Yiannopoulos's cancellation                       | politics    | 2025-02-03 |        |         
15    | Mark Robinson transcript                               |             | 2024-11-13 |        | unlisted
14    | Reasons I'm glad to be Canadian                        | politics    | 2024-12-08 |        |         
13    | The military–industrial complex                        | politics    | 2024-12-04 |        |         
12    | The order of information                               | politics    | 2024-12-03 |        |         
11    | The Trump appeal                                       | politics    | 2024-12-03 |        |         
10    | Touchscreens and smartphones                           | culture     | 2024-12-02 |        |         
9     | The default politician                                 | politics    | 2024-11-26 |        |         
8     | 10 Dollar                                              | culture     | 2024-11-25 |        |         
7     | Fetishism & politics                                   | transgender | 2024-11-14 |        |         
6     | Mark Robinson                                          | politics    | 2024-11-13 |        |         
5     | Types of masculinity                                   | culture     | 2024-11-08 |        |         
4     | Anime reviews                                          | culture     | 2024-11-02 |        |         
3     | Poor things (2023 film)                                | culture     | 2024-10-31 |        |         
2     | The trans prison stats argument                        | transgender | 2024-10-19 |        |         
1     | Language                                               | personal    | 2024-10-29 |        |         
index |                                                        |             |            |        | unlisted
`;

/*     38    40    */

/* This just helps keep the table above orderly. */
function alignTable(dataString, splitChar) {
    let table = dataString.split("\n").filter(c => c != "").map(row => row.split(splitChar).map(cell => cell.trim()));
    let tableWidth = Math.max(...table.map(row => row.length));
    for (let col = 0; col < tableWidth; col += 1) {
        let cellWidth = 0;
        for (let i = 0; i < table.length; i += 1) {
            while (table[i].length < tableWidth) {
                table[i].push(""); }
            if (table[i][col].length > cellWidth) {
                cellWidth = table[i][col].length; } }
        for (let i = 0; i < table.length; i += 1) {
            if (table[i].length < tableWidth) {
                continue; }
            table[i][col] += " ".repeat(cellWidth - table[i][col].length); } }
    
    /* sort by date */
    table.sort((a, b) => {
        a = a[3].replace(/\D/g, ""); if (a == "") { a = 0; }
        b = b[3].replace(/\D/g, ""); if (b == "") { b = 0; }
        return parseInt(b) - parseInt(a);
    });
    /* but move pinned to top */
    table.sort((a, b) => {
        if (a[4].trim() == "pinned") { return -1; }
        if (b[4].trim() == "pinned") { return 1; }
        return 0;
    });
    
    data = table.map(c => c.join(` ${splitChar} `)).join("\n");
    // console.log(data);
}

/* function that enables the table of contents */
function tocHighlighter() {
    if (!tocUpdateFlag) { return; }
    tocUpdateFlag = false;
    setTimeout(() => { tocUpdateFlag = true; }, 50);

    let headingId;
    for (let i = 0; i < headersInArticle.length; i += 1) {
        if (pageYOffset > headersInArticle[i].offsetTop - window.innerHeight * 0.5) {
            headingId = headersInArticle[i].id; }
        else {
            break; } }
    if (headingId != currentHeading) {
    for (let i = 0; i < rowsInToc.length; i += 1) {
        rowsInToc[i].classList.remove("active-heading");
        if (rowsInToc[i].getAttribute("href") == "#" + headingId) {
            rowsInToc[i].classList.add("active-heading"); } } }
    currentHeading = headingId;
}

function pageLoad() {
    document.head.innerHTML += `<link rel="icon" type="image/x-icon" href="assets/favicon.ico"><link rel="stylesheet" href="assets/main.css">`;
    page = document.getElementById("page"); if (page == null) { console.error("{can't find #page}"); return; }
    const header = document.body.insertBefore(document.createElement("header"), page);
    header.id = "header";
    header.innerHTML = `<a href="index.html"><img height="67" width="252" alt="North of Queen logo" src="assets/header-image.png"></a>`;
    const nav = document.body.insertBefore(document.createElement("nav"), page);
    nav.id = "nav";
    nav.innerHTML = "";

    let temp = location.href.split("/").filter(item => item.length != 0).pop();
    if (temp.indexOf("#") != -1) { temp = q.substring(0,temp.indexOf("#")); }
    temp = temp.replace(/\.html$/, "");
    const fileName = temp;

    alignTable(data,"|");
    const sidebarNavContent = { pins: [], recent: [], full: [] };
    const dataRows = data.split("\n");
    for (let i = 0; i < dataRows.length; i += 1) {
        let cells = dataRows[i].split("|").map(cell => cell.trim());
        if (cells.length >= 6) {
            let rowFile = cells[0], rowTitle = cells[1], rowCategory = cells[2], rowDate = cells[3], rowType = cells[4], rowFlag = cells[5];
            let entryClass = "nav-row";
            if (rowFile == fileName) {
                entryClass += " current-page";
                if (rowType == "narrow" || rowType == "wide") {
                    page.classList.add(rowType);
                    window.sessionStorage.pageMode = rowType; }}
            if (rowFlag == "unlisted") { continue; }
            let icon = "";
            const isPinned = (rowFlag == "pinned");
            if (isPinned) {
                entryClass += " pinned";
                icon = `<img class="icon" src="assets/pin2.png" height="17" width="17">`; }
            let entryElement = `<a href="${rowFile}.html" class="${entryClass}">${rowTitle}${icon}</a>`;
            if (isPinned) { sidebarNavContent.pins.push(entryElement); }
            else if (sidebarNavContent.recent.length < 10) { sidebarNavContent.recent.push(entryElement); }
            if (rowDate == "") { rowDate = "---"; }
            let fullEntry = `<tr><td><a href="${rowFile}.html">${rowTitle}${icon}</a></td> <td>${rowCategory}</td><td>${rowDate}</td></tr>`;
            if (isPinned) { sidebarNavContent.full.unshift(fullEntry); }
            else { sidebarNavContent.full.push(fullEntry); }
        }
    }

    page.innerHTML = `
        <div class="c3">
            <div class="c2">
                <div class="c1">
                    <div id="article">${document.getElementById("main").innerHTML}</div>
                        <footer id="article-footer"><div>I&rsquo;m Iris. You can find me on: <a target="_blank" href="https://bsky.app/profile/irispol.bsky.social">Bluesky</a> | <a target="_blank" href="https://northofqueen.substack.com">Substack</a> | <a target="_blank" href="https://forthoseinterested.tumblr.com">Tumblr</a> | <a target="_blank" href="https://discord.com/invite/puJEP8HKk3">Discord</a></div></footer>
                </div>
            </div>
            <div id="sidebar">
                <nav class="page-links">${sidebarNavContent.pins.join("")}<hr><div class="label">Recently added:</div>${sidebarNavContent.recent.join("")}<div class="nav-row index-link"><a href="index.html">Full page list</a></div></nav>
            </div>
        </div>
        <div id="page-edge"><button id="sidebar-button" class="toggle-button-1" type="button" onclick="toggleSidebarVisibility()"><img src="assets/chevron-right.png"></button></div>`
    const footer = document.body.appendChild(document.createElement("footer"));
    footer.id = "footer";
    footer.innerHTML = `<div class="f1"><div class="f2"><a target="_blank" href="https://github.com/northofqueen">North of Queen</a> is my personal repo. I have no association with any other person or organization. Code uploaded to this repo (northofqueen) can be interpreted as fully public domain (<a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank">CC0</a>). I also give broad permission for my writing to be used, reposted, etc. for non-commercial purposes provided no other person claims authorship (<a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank">CC BY-NC 4.0</a>).</div></div>
    <div id="lightbox-container" onclick="closeLightbox()"><img id="lightbox"></div>`;
    lightboxContainer = document.getElementById("lightbox-container");
    lightboxImg = document.getElementById("lightbox");
    window.addEventListener("keydown", function(event) {if (lbKeyResponsive && event.key === 'Escape') {closeLightbox(); } })
    article = document.getElementById("article");
    interpreter(article);

    const frontPageList = document.getElementById("front-page-list");
    if (frontPageList) {
        frontPageList.innerHTML = `<tr><th>Post title</th><th>Topic</th><th>Date posted</th></tr>${sidebarNavContent.full.join("")}`;
    }
    else {
        window.addEventListener("resize", pageWidthCheck); setTimeout(() => { pageWidthCheck(); }, 100);
        if (tableOfContentsLinks.length > 5) {
            document.getElementById("sidebar").innerHTML +=
            `<nav id="toc">
                <div class="toc-title">Content</div><a class="toc-row h1" href="#top">(Top of page)</a>
                <div class="scroller">${tableOfContentsLinks.slice(1).join("")}</div>
            </nav>`;
            rowsInToc = Array.from(document.getElementById("toc").getElementsByClassName("toc-row"));
            headersInArticle = Array.from(document.getElementsByClassName("noq-header"));
            document.getElementById("sidebar-button").style.position = "sticky";
            window.addEventListener("scroll", tocHighlighter);
            setTimeout(() => { tocHighlighter(); }, 100);
        } else {
            // document.getElementById("sidebar").firstElementChild.style.position = "sticky";
            // document.getElementById("sidebar").firstElementChild.style.top = "0";
        }
    }
    updateSidebar();
    document.title = (document.title === "") ? "North of Queen" : document.title + " – North of Queen";
    const cover = document.getElementById("cover"); if (cover) { cover.classList.add("fade-out"); cover.addEventListener("animationend", () => { cover.remove(); }); }
}

function updateSidebar() {
    if (window.sessionStorage.sidebarHidden === "true") {
        page.classList.add("hide-sidebar");
        document.getElementById("sidebar-button").title = "show sidebar"; }
    else {
        page.classList.remove("hide-sidebar");
        document.getElementById("sidebar-button").title = "hide sidebar"; }

    if (sidebarOnTop) {
        page.classList.add("vertical-sidebar"); }
    else {
        page.classList.remove("vertical-sidebar"); }
    
    pageWidthCheck();
}

function toggleSidebarVisibility() {
    window.sessionStorage.sidebarHidden = (window.sessionStorage.sidebarHidden === "true") ? "false" : "true";
    updateSidebar();
}

function pageWidthCheck() {
    if (canResizePageWidth) {
        let limit = sidebarOnTop ? 884 : 880;
        if (window.sessionStorage.pageMode === "narrow") { limit -= 160; }
        if (window.sessionStorage.pageMode === "wide") { limit += 190; }
        if (window.innerWidth < limit) {
            page.classList.add("vertical-sidebar");
            canResizePageWidth = false;
            sidebarOnTop = "true";
            setTimeout(() => {
                canResizePageWidth = true;
                pageWidthCheck();
            }, 200);
        } else {
            page.classList.remove("vertical-sidebar");
            sidebarOnTop = "false";
        }
    }
}

window.addEventListener("load", pageLoad);



