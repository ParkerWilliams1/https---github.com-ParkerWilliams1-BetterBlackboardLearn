const domain = window.location.origin

document.addEventListener('DOMContentLoaded', function() {
    startExtension();
});

function startExtension() {
    presetThemes();
    customThemes();
    customFont();
    loadCustomCourses();
    ToggleDarkMode();
    getUser()
.then(() => {
    return getCoursesId();
})
.then(() => {
    return getShortenedNames();
})

    chrome.storage.sync.get(null, result => {
        options = { ...options, ...result };
    });
}

chrome.storage.onChanged.addListener(applyOptionsChanges);

// Detect user changes in settings
function applyOptionsChanges(changes) {
    let rewrite = {};
    Object.keys(changes).forEach(key => {
        rewrite[key] = changes[key].newValue;
    });
    options = { ...options, ...rewrite };

    Object.keys(changes).forEach(key => {
        console.log(key + " changed");
        switch (key) {
            case ("colorscheme"):
                ToggleDarkMode();
                break;
            case ("coursebannerlink"):
                loadCustomCourses();
                break;
            case ("coursecardname"):
                loadCustomCourses();
                break;
            case ("theme"):
                presetThemes();
                break;
            case ("customprimary"):
                customThemes();
                break;
            case ("customsecondary"):
                customThemes();
                break;
            case ("selectedcourse"):
                loadCustomCourses();
                break;
            case ("customfont"):
                customFont();
                break;
            case ("customsidebar"):
                customThemes();
                break;
            case ("courseImageMap"):
                loadCustomCourses();
                break;
        }
    });
}

// Utilizes Blackboard Learn API to find username
function getUser() {
    return fetch(domain + `/learn/api/v1/users/me?`)
    .then(res => res.json())
    .then(data => {
        chrome.storage.sync.set({'userName': data.userName});
    });
}

// Utilizes Blackboard API & username to find users courses
function getCoursesId() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['userName'], result => {
            options = result;
            let userName = options.userName;
            fetch(domain + `/learn/api/public/v1/users/userName:${userName}/courses`)
            .then(res => res.json())
            .then(data => {
                let courses = data.results;
                let courseId = [];
                for (let i = 0; i < courses.length; i++) {
                    courseId[i] = courses[i].courseId;
                }
                chrome.storage.sync.set({'courselist' : courseId});
                courses.courselist = options.courselist;
                resolve(courseId);
            })
            .catch(error => {
                reject(error);
            });
        });
    });
}

// Utilizes Blackboard API & user courses to find "short" names of courses
function getShortenedNames() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['courselist'], result => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }

            const options = result;
            const courseShortNames = [];
            const courseIdMap = new Map();

            const fetchPromises = options.courselist.map(courseId => {
                return fetch(`https://calbaptist.blackboard.com/learn/api/public/v1/courses/${courseId}`)
                    .then(res => {
                        if (!res.ok) {
                            throw new Error('Failed to fetch course details');
                        }
                        return res.json();
                    })
                    .then(data => {
                        courseShortNames.push(data.courseId);
                        courseIdMap.set(data.courseId, courseId);
                    })
                    .catch(error => {
                        console.error(error);
                    });
            });

            Promise.all(fetchPromises)
                .then(() => {
                    chrome.storage.sync.set({ 'courseshortnames': courseShortNames }, () => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                            return;
                        }
                        chrome.storage.sync.set({ 'courseIdMap': [...courseIdMap] }, () => {
                            if (chrome.runtime.lastError) {
                                reject(chrome.runtime.lastError);
                                return;
                            }
                            resolve({ courseShortNames, courseIdMap });
                        });
                    });
                })
                .catch(error => {
                    reject(error);
                });
        });
    });
}

// Function to simply toggle Dark Mode on and off
function ToggleDarkMode() {
    chrome.storage.sync.get(['colorscheme'], result => {
        options = result;
        if (options.colorscheme === 'dark') {
            let darkthemecss = `.inner-wrap, li.stream-item-container.notification-default:hover, .element-details.summary, .element-image, .link-list-component.link-list-image-left, .fc-time-grid-event {background: #1f1f1f !important;} .MuiSvgIconfrontSizeLarge-0-2-66, svg.MuiSvgIconroot-0-2-58.makeStylesdirectionalIcon-0-2-57.makeStylesstrokeIcon-0-2-56.MuiSvgIconcolorPrimary-0-2-59.MuiSvgIconfontSizeLarge-0-2-66, .base-courses-header-container.base-header.themed-background-primary-medium-down.color-selection-live-mode, nav.term-navigator, svg.MuiSvgIconroot-0-2-58.makeStylesstrokeIcon-0-2-56.MuiSvgIconcolorPrimary-0-2-59.MuiSvgIconfontSizeLarge-0-2-66, .element-card.bar, li.data-row.can-edit, li.data-row, .element-card.tile.course-color-classic.base-grades-course-tile.active-course, .messages-header.js-course-skip-link-target.flex-container, .element-card.due-item.element-card-deadline.course-color-2, .element-card.element-card-deadline, .calendar-wrapper .element-card-container {background: #1f1f1f !important} .MuiSvgIconcolorPrimary-0-2-59, .base-recent-activity .activity-stream .activity-group .stream-item .element-details .context a, .base-recent-activity .activity-stream .activity-group .stream-item .element-details .content, span.date, h2.activity-group-title, span.heading-date, span.time, h2, .js-course-title-element, .multi-column-course-id, span.banner__title-text, h3.subheader.module-wrapper__title, span.link-text, bdi.makeStylesbaseText-0-2-68, .makeStylesbaseText-0-2-138, a.link-list-component__link.-black, .MuiSvgIconcolorPrimary-0-2-81, svg:not(:root), .calendar-wrapper .calendar-head-container .month-container .month a, .calendar-wrapper .calendar-week .week-letter, .calendar-wrapper .calendar-week .week-day button, .base-grades-wrapper .base-grades-term-wrapper .row.grades-header a, .base-grades-wrapper .base-grades-term-wrapper, .base-grades .grades-list .element-card .element-details .name a, h4.section-title, .messages-container-summary .messages-header .title a, .element-card .element-details .name a {color:white !important;} a.js-title-link, h1#main-heading, bdi, span, bb-translate, .filter-wrapper, label.MuiFormLabelroot-0-2-117.MuiInputLabelroot-0-2-105.makeStylesinputLabel-0-2-67.MuiInputLabelanimated-0-2-114, .js-course-skip-link-target, .calendar-wrapper .fc-event-container .element-card .fc-title a, .calendar-wrapper .fc-event-container .element-card .course-link a {color: white !important} span.grade-input-display.ready, span.points-text bdi, .points-text, span#filter-courses-value, .MuiButtonlabel-0-2-73 {color: black !important;} .base-recent-activity .activity-stream .activity-group .stream-item:hover:before {opacity: 0; background-color: transparent;} .grade-ellipsis {filter: brightness(0);} span.ellipse, span#filter-stream-value {color: gray !important;} a.link-list-component__link.-black, .MuiSvgIconcolorPrimary-0-2-58 {background: #1f1f1f !important; color: white !important;} [bb-click-to-invoke-child].child-is-invokable {background: transparent !important;}`;
            createSheet('darkthemeinject', darkthemecss);
        } else if (options.colorscheme === 'default') {
            const darkthemeinject = document.querySelectorAll('.darkthemeinject');
            darkthemeinject[0].parentNode.removeChild(darkthemeinject[0]);
        }
    }
)}

// Function which applies user selected preset theme
function presetThemes() {
    chrome.storage.sync.get(['theme'], result => {
        options = result;
        switch(options.theme) {
            case 'luna':
                createTheme('#5a3a7e', '#f67599');
                break;
            case 'nightfall':
                createTheme('#232323', '#d82934');
                break;
            case 'midnight':
                createTheme('#030f28', 'orange');
                break;
            case 'cyberspace':
                createTheme('#181c18', '#00ce7c');
                break;
            case 'joker':
                createTheme('#321a47', '#99de1e');
                break;
            case 'horizon':
                createTheme('#1f1f1f', '#f2c17b');
                break;
            case 'melon':
                createTheme('#1f4437', '#d6686f');
                break;
            case 'botanical':
                createTheme('#7b9c98', '#101e1c');
                break;
            case 'default':
                removeThemes();
                break;
            default:
                break;
        }
    });
}

// Function for applying user selected Custom Themes
function customThemes() {
    chrome.storage.sync.get(['customprimary', 'customsecondary', 'customsidebar'], result => {
        options = result;
        if (options.customprimary != "default") {
            let primaryColor = options.customprimary;
            let customthemecss = `.inner-wrap, li.stream-item-container.notification-default:hover, .element-details.summary, .element-image, .element-card.tile.course-color-classic.base-grades-course-tile.active-course, .messages-header.js-course-skip-link-target.flex-container, .element-card.due-item.element-card-deadline.course-color-2, .element-card.element-card-deadline, .calendar-wrapper .element-card-container, .fc-time-grid-event {background: ${primaryColor} !important;} .MuiSvgIconfrontSizeLarge-0-2-66, svg.MuiSvgIconroot-0-2-58.makeStylesdirectionalIcon-0-2-57.makeStylesstrokeIcon-0-2-56.MuiSvgIconcolorPrimary-0-2-59.MuiSvgIconfontSizeLarge-0-2-66, .base-courses-header-container.base-header.themed-background-primary-medium-down.color-selection-live-mode, nav.term-navigator, svg.MuiSvgIconroot-0-2-58.makeStylesstrokeIcon-0-2-56.MuiSvgIconcolorPrimary-0-2-59.MuiSvgIconfontSizeLarge-0-2-66, .element-card.bar, .base-profile .profile-content .user-settings section ul .data-row, .base-profile .profile-content .user-information section ul .data-row, a.link-list-component__link.-black, .link-list-component.link-list-image-left {background: ${primaryColor} !important} .MuiSvgIconcolorPrimary-0-2-59, .base-recent-activity .activity-stream .activity-group .stream-item .element-details .context a, .base-recent-activity .activity-stream .activity-group .stream-item .element-details .content, span.date, h2.activity-group-title, span.heading-date, span.time, h2, .js-course-title-element, .multi-column-course-id, span.banner__title-text, h3.subheader.module-wrapper__title, span.link-text, bdi.makeStylesbaseText-0-2-68, .makeStylesbaseText-0-2-138, bdi.makeStylesbaseText-0-2-149, bdi.makeStylesbaseText-0-2-90, .MuiSvgIconcolorPrimary-0-2-81, svg:not(:root), .base-grades .grades-list .element-card .element-details .name a, h4.section-title, .messages-container-summary .messages-header .title a, .calendar-wrapper .fc-event-container .element-card .fc-title a, .calendar-wrapper .fc-event-container .element-card .course-link a {color:white !important;} bdi.makeStylesbaseText-0-2-45, .calendar-wrapper .calendar-head-container .month-container .month a, .calendar-wrapper .calendar-week .week-letter, .calendar-wrapper .calendar-week .week-day button, .base-grades-wrapper .base-grades-term-wrapper .row.grades-header a, .base-grades-wrapper .base-grades-term-wrapper {color: white !important;} .base-recent-activity .activity-stream .activity-group .stream-item:hover:before {opacity: 0 !important; background-color: transparent !important;} [bb-click-to-invoke-child].child-is-invokable {background: transparent !important;}`;
            createSheet('customprimary', customthemecss);
        } else {
            const primary = document.querySelectorAll('.customprimary');
            primary.forEach(element => {
                element.parentNode.removeChild(element);
            });
        }
        if (options.customsecondary != "default") {
            let secondaryColor = options.customsecondary;
            let customthemecss = `a.js-title-link, h1#main-heading, bdi, span, bb-translate, .filter-wrapper, label.MuiFormLabelroot-0-2-117.MuiInputLabelroot-0-2-105.makeStylesinputLabel-0-2-67.MuiInputLabelanimated-0-2-114, a.link-list-component__link.-black, .element-card .element-details .name a {color: ${secondaryColor} !important} span.grade-input-display.ready, span.points-text bdi, .points-text, span#filter-courses-value, .MuiButtonlabel-0-2-73 {color: black !important;} .base-recent-activity .activity-stream .activity-group .stream-item:hover:before {opacity: 0; background-color: transparent;} .grade-ellipsis {filter: brightness(0);} span.link-text, bdi.makeStylesbaseText-0-2-90, .makeStylesbaseText-0-2-79, bdi.makeStylesbaseText-0-2-149 {color: white !important;}`;
            createSheet('customsecondary', customthemecss);
        } else {
            const secondary = document.querySelectorAll('.customsecondary');
            secondary.forEach(element => {
                element.parentNode.removeChild(element);
            });
        }
        if (options.customsidebar != "default") {
            let sidebarColor = options.customsidebar;
            let customthemecss = `aside#side-menu, span.branding.themed-logo-background-primary-fill {background: ${sidebarColor} !important;} .base #side-menu .off-canvas-list .base-navigation-button .base-navigation-button-content:hover,  .color-selection-live-mode .active .base-navigation-button-content.themed-background-primary-alt-fill-only, .color-selection-live-mode .themed-background-primary-alt-fill-only:hover, .color-selection-live-mode .themed-background-primary-alt-fill-only:hover, .color-selection-live-mode .base-navigation-button.active .base-navigation-button-content.themed-background-primary-alt-fill-only, .color-selection-live-mode .base-navigation-button:focus .base-navigation-button-content.themed-background-primary-alt-fill-only, .color-selection-live-mode .base-navigation-button:focus-visible .base-navigation-button-content.themed-background-primary-alt-fill-only {background: ${sidebarColor} !important; filter: brightness(150%) !important;} .color-selection-live-mode .active .base-navigation-button-content.themed-background-primary-alt-fill-only {color: #1f1f1f !important;}`;
            createSheet('customsidebar', customthemecss);
        } else {
            const sidebar = document.querySelectorAll('.customsidebar');
            sidebar.forEach(element => {
                element.parentNode.removeChild(element);
            });
        }
    });
}

// Function which applies user selected custom font
function customFont() {
    chrome.storage.sync.get(['customfont'], result => {
        let fontName = result.customfont;

        if (fontName !== 'default' && fontName !== '') {
            const importFont = `@import url('https://fonts.googleapis.com/css2?family=${fontName.replace(" ", "+")}'); * {font-family: '${fontName}', sans-serif !important}`;
            createSheet('customfont', importFont);
        } else {
            const customfonts = document.querySelectorAll('.customfont');
            customfonts.forEach(element => {
                element.parentNode.removeChild(element);
            });
        }
    });
}

// Function to read through Map which pairs courseId & imageURL's then calls function to append
function loadCustomCourses() {
    chrome.storage.sync.get(['courseImageMap', 'courseNameMap'], result => {
        const options = result;
        for (let i = 0; i < options.courseImageMap.length; i++) {
            customCourseBanners(options.courseImageMap[i][0], options.courseImageMap[i][1]);
        }
        for (let i = 0; i < options.courseNameMap.length; i++) {
            customCourseNames(options.courseNameMap[i][0], options.courseNameMap[i][1]);
        }
    });
}

// Takes input courseId & imageURL, to Append stylesheet specifically for selected course
function customCourseBanners(courseId, imageURL) {
    chrome.storage.sync.get(['coursebannerlink'], result => {
        options = result;
    })

    if (imageURL !== '' && imageURL !== 'default') {
        let cssbanner = `.element-card[data-course-id="${courseId}"] .course-banner {background-image: url("${imageURL}") !important;}`;
        createSheet('custombanner', cssbanner);
    } else if (imageURL === 'undefined') {
        return;
    }
    
    if (options.coursebannerlink === 'default') {
        chrome.storage.sync.set({'courseImageMap': new Map()});
        const coursebanners = document.querySelectorAll('.custombanner');
        coursebanners.forEach(element => {
            element.parentNode.removeChild(element);
        });
    }
}

// Takes input courseId & customName, to Append stylesheet specifically for selected course
function customCourseNames(courseId, customName) {
    chrome.storage.sync.get(['coursecardname'], result => {
        options = result;
    })

    if (!courseId || !customName) {return;}
        if (customName !== "default" && customName != "") {
            let namecss = `h4#course-name-${courseId} {visibility: hidden !important; position: relative !important;} h4#course-name-${courseId}::after {content: "${customName}" !important; visibility: visible !important; position: absolute; left: 0px; top: 0px; flex-wrap: wrap}`;
            createSheet('customname', namecss);
        } else if (customName === 'undefined' || "") {
            return;
        }

    if (options.coursecardname === 'default') {
        chrome.storage.sync.set({'courseNameMap': new Map()});
        const coursenames = document.querySelectorAll('.customname');
        coursenames.forEach(element => {
            element.parentNode.removeChild(element);
        });
    }
}

// Function to Create Basic Style Sheet
function createSheet(className, css) {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = css;
    styleElement.classList.add(className);
    document.head.appendChild(styleElement);
}

// Function to make Preset Theme w/ Two Colors
function createTheme(primaryColor, secondaryColor) {
    let css = `.inner-wrap, li.stream-item-container.notification-default:hover, .element-details.summary, .shadow, .base-profile .profile-content .user-information section ul .data-row, .base-profile .profile-content .user-settings section ul .data-row, .element-image, .element-card.tile.course-color-classic.base-grades-course-tile.active-course, .messages-header.js-course-skip-link-target.flex-container, .element-card.due-item.element-card-deadline.course-color-2, .element-card.element-card-deadline, .calendar-wrapper .element-card-container, .fc-time-grid-event {background: ${primaryColor} !important;} .MuiSvgIconfrontSizeLarge-0-2-66, svg.MuiSvgIconroot-0-2-58.makeStylesdirectionalIcon-0-2-57.makeStylesstrokeIcon-0-2-56.MuiSvgIconcolorPrimary-0-2-59.MuiSvgIconfontSizeLarge-0-2-66, .base-courses-header-container.base-header.themed-background-primary-medium-down.color-selection-live-mode, nav.term-navigator, svg.MuiSvgIconroot-0-2-58.makeStylesstrokeIcon-0-2-56.MuiSvgIconcolorPrimary-0-2-59.MuiSvgIconfontSizeLarge-0-2-66, .element-card.bar {background: ${primaryColor} !important} .MuiSvgIconcolorPrimary-0-2-59, .base-recent-activity .activity-stream .activity-group .stream-item .element-details .context a, .base-recent-activity .activity-stream .activity-group .stream-item .element-details .content, span.date, h2.activity-group-title, span.heading-date, span.time, h2, .js-course-title-element, .multi-column-course-id, span.banner__title-text, h3.subheader.module-wrapper__title, span.link-text, bdi.makeStylesbaseText-0-2-68, .makeStylesbaseText-0-2-138, bdi.makeStylesbaseText-0-2-149, .MuiSvgIconcolorPrimary-0-2-81, svg:not(:root), .calendar-wrapper .calendar-head-container .month-container .month a, .calendar-wrapper .calendar-week .week-letter, .calendar-wrapper .calendar-week .week-day button, .base-grades-wrapper .base-grades-term-wrapper .row.grades-header a, .base-grades-wrapper .base-grades-term-wrapper, .base-grades .grades-list .element-card .element-details .name a, h4.section-title, .messages-container-summary .messages-header .title a, .calendar-wrapper .fc-event-container .element-card .fc-title a, .calendar-wrapper .fc-event-container .element-card .course-link a {color:white !important;} a.js-title-link, h1#main-heading, bdi, span, bb-translate, .filter-wrapper, .element-card .element-details .name a {color: ${secondaryColor} !important} span.grade-input-display.ready, span.points-text bdi, .points-text, span#filter-courses-value, .MuiButtonlabel-0-2-73 {color: black !important;} .base-recent-activity .activity-stream .activity-group .stream-item:hover:before {opacity: 0; background-color: transparent;} .grade-ellipsis {filter: brightness(0);} a.link-list-component__link.-black, .bb-ui-content-icon, .MuiSvgIconcolorPrimary-0-2-58, .link-list-component.link-list-image-left {background: ${primaryColor} !important; color: ${secondaryColor} !important} bdi.makeStylesbaseText-0-2-45, bdi.makeStylesbaseText-0-2-79, bdi.makeStylesbaseText-0-2-90 {color: white !important;} [bb-click-to-invoke-child].child-is-invokable, svg:not(:root) {background: transparent !important;}`;
    createSheet('theme', css);
}

// Function to Remove Preset Theme
function removeThemes() {
    const themes = document.querySelectorAll('.theme');
        themes.forEach(element => {
            element.parentNode.removeChild(element);
        });
}


