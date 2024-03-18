var title = document.getElementById('title');
var mainoptions = document.getElementById('main-options');
var cardoptions = document.getElementById('card-options');
var customthemeoptions = document.getElementById('custom-theme-options');
var presetthemeoptions = document.getElementById('preset-theme-options');
var fontoptions = document.getElementById('font-options');
var reportissueoptions = document.getElementById('report-issue-options');
var colorscheme = 'default';

var courseImageMap = new Map();
var courseNameMap = new Map();

/* Traversing Menus */
document.getElementById('custom-fonts-button').onclick = function() {
  title.style.display = 'none';
  mainoptions.style.display = 'none';
  fontoptions.style.display = 'block';
}
document.getElementById("preset-themes-button").onclick = function() {
  title.style.display = 'none';
  mainoptions.style.display = 'none';
  presetthemeoptions.style.display = 'block';
}
document.getElementById("custom-themes-button").onclick = function() {
  title.style.display = 'none';
  mainoptions.style.display = 'none';
  customthemeoptions.style.display = 'block';
}

document.getElementById("report-issue-button").onclick = function() {
  document.body.style.height = '240px';
  title.style.display = 'none';
  mainoptions.style.display = 'none';
  reportissueoptions.style.display = 'block';
}

document.getElementById("custom-cards-button").onclick = function() {
  title.style.display = 'none';
  mainoptions.style.display = 'none';
  cardoptions.style.display = 'block';

// Function to fill courses dropdown button
function insertCoursesDropdown(courseshortnames, courseIdMap) {
  var select = document.getElementById("card-options-select");
  
  for (let i = 0; i < courseshortnames.length; i++) {
      var option = document.createElement('option');
      option.textContent = courseshortnames[i];
      option.value = courseIdMap.get(courseshortnames[i]);
      select.appendChild(option);
  }
}

chrome.storage.sync.get(['courseshortnames', 'courseIdMap'], result => {
  if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
  }

  var options = result;
  if (options && options.courseshortnames && options.courseIdMap) {
      insertCoursesDropdown(options.courseshortnames, new Map(options.courseIdMap));
  } else {
      console.error('Failed to retrieve data from storage.');
  }
});
}

/* Custom Banner & Course Names */
chrome.storage.sync.get('courseImageMap', result => {
  if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
  }
  if (result && result.courseImageMap) {
      courseImageMap = new Map(result.courseImageMap);
  }
});
chrome.storage.sync.get('courseNameMap', result => {
  if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
  }
  if (result && result.courseNameMap) {
      courseNameMap = new Map(result.courseNameMap);
  }
});

/* Confirm Image Validity and Apply */
document.getElementById('save-banner-options').onclick = function() {
  var linkInput = document.getElementById('card-options-link').value;
  var nameInput = document.getElementById('card-options-name').value;
  var dropdownInput = document.getElementById('card-options-select').value;

  if (nameInput !== "") {
    courseNameMap.set(dropdownInput, nameInput);
  }

  if (linkInput !== "" && linkInput !== "none") {
    let loadImagePromise = new Promise((resolve, reject) => {
      let testImage = new Image();
      testImage.src = linkInput;
      testImage.onload = function() {
        resolve();
      };
      testImage.onerror = function() {
        reject(new Error("Oops! The image link seems to be broken. Please right-click on the image and select 'Copy image address' to get the correct link."));
      };
    });

    loadImagePromise.then(() => {
      courseImageMap.set(dropdownInput, linkInput);
      chrome.storage.sync.set({'courseImageMap': [...courseImageMap]});
    }).catch(error => {
      alert(error.message);
    });
  }

      chrome.storage.sync.set({'selectedcourse': dropdownInput});
      chrome.storage.sync.set({'coursebannerlink': linkInput});
      chrome.storage.sync.set({'coursecardname' : nameInput});
      chrome.storage.sync.set({'courseNameMap': [...courseNameMap]});

      title.style.display = 'block';
      mainoptions.style.display = 'block';
      cardoptions.style.display = 'none';
}

/* Reset Images back to default blackboard values */
document.getElementById('reset-banner-options').onclick = function() {
  chrome.storage.sync.set({'coursebannerlink': 'default'});
  chrome.storage.sync.set({'coursecardname': 'default'});

  title.style.display = 'block';
  mainoptions.style.display = 'block';
  cardoptions.style.display = 'none';
}

/* Dark Theme Toggle */
chrome.storage.sync.get('colorscheme', function(data) {
  const colorscheme = data.colorscheme || 'default';
  if (colorscheme === 'dark') {
      document.getElementById('dark-theme-button').style.backgroundColor = '#4CAF50';
  } else {
      document.getElementById('dark-theme-button').style.backgroundColor = '#474646';
  }
});
document.getElementById('dark-theme-button').onclick = function() {
  chrome.storage.sync.get('colorscheme', function(data) {
      let colorscheme = data.colorscheme || 'default';
      if (colorscheme === 'default') {
          chrome.storage.sync.set({'colorscheme': 'dark'});
          document.getElementById('dark-theme-button').style.backgroundColor = '#4CAF50';
      } else if (colorscheme === 'dark') {
          chrome.storage.sync.set({'colorscheme': 'default'});
          document.getElementById('dark-theme-button').style.backgroundColor = '#474646';
      }
  });
};



/* Preset Custom Themes */
document.getElementById('luna-button').onclick = function() {
  chrome.storage.sync.set({'theme' : 'luna'});
}
document.getElementById('nightfall-button').onclick = function() {
  chrome.storage.sync.set({'theme' : 'nightfall'});
}
document.getElementById('midnight-button').onclick = function() {
  chrome.storage.sync.set({'theme' : 'midnight'});
}
document.getElementById('cyberspace-button').onclick = function() {
  chrome.storage.sync.set({'theme' : 'cyberspace'});
}
document.getElementById('joker-button').onclick = function() {
  chrome.storage.sync.set({'theme' : 'joker'});
}
document.getElementById('horizon-button').onclick = function() {
  chrome.storage.sync.set({'theme' : 'horizon'});
}
document.getElementById('melon-button').onclick = function() {
  chrome.storage.sync.set({'theme' : 'melon'});
}
document.getElementById('botanical-button').onclick = function() {
  chrome.storage.sync.set({'theme' : 'botanical'});
}
document.getElementById('remove-preset-theme-button').onclick = function() {
  chrome.storage.sync.set({'theme' : 'default'});
  title.style.display = 'block';
  mainoptions.style.display = 'block';
  presetthemeoptions.style.display = 'none';
}
document.getElementById('save-preset-theme-button').onclick = function() {
  title.style.display = 'block';
  mainoptions.style.display = 'block';
  presetthemeoptions.style.display = 'none';
}



/* Color Pickers */
var primarycolorPicker = document.getElementById('primary-color-input');
var primaryText = document.getElementById('primary-color-text');
primarycolorPicker.addEventListener('input', function() {
  primaryText.value = primarycolorPicker.value.toUpperCase();
});
primaryText.addEventListener('input', function() {
  primarycolorPicker.value = primaryText.value;
});

var secondarycolorPicker = document.getElementById('secondary-color-input');
var secondaryText = document.getElementById('secondary-color-text');
secondarycolorPicker.addEventListener('input', function() {
  secondaryText.value = secondarycolorPicker.value.toUpperCase();
});
secondaryText.addEventListener('input', function() {
  secondarycolorPicker.value = secondaryText.value;
});

var sidebarcolorPicker = document.getElementById('sidebar-color-input');
var sidebarText = document.getElementById('sidebar-color-text');
sidebarcolorPicker.addEventListener('input', function() {
  sidebarText.value = sidebarcolorPicker.value.toUpperCase();
});
sidebarText.addEventListener('input', function() {
  sidebarcolorPicker.value = sidebarText.value;
});


/* User-Made Custom Theme */
document.getElementById('primary-color-button').onclick = function() {
  chrome.storage.sync.set({'customprimary' : primarycolorPicker.value});
}
document.getElementById('secondary-color-button').onclick = function() {
  chrome.storage.sync.set({'customsecondary' : secondarycolorPicker.value});
} 
document.getElementById('sidebar-color-button').onclick = function() {
  chrome.storage.sync.set({'customsidebar' : sidebarcolorPicker.value});
} 

document.getElementById('remove-custom-theme-button').onclick = function() {
  chrome.storage.sync.get(['defaultPrimary', 'defaultSecondary', 'defaultSidebar'], function(result) {
    var defaultPrimary = result.defaultPrimary || '#1F1F1F';
    var defaultSecondary = result.defaultSecondary || '#FFFFFF';
    var defaultSidebar = result.defaultSidebar || '#102D70';

    primarycolorPicker.value = defaultPrimary;
    document.getElementById('primary-color-text').value = defaultPrimary;

    secondarycolorPicker.value = defaultSecondary;
    document.getElementById('secondary-color-text').value = defaultSecondary;

    sidebarcolorPicker.value = defaultSidebar;
    document.getElementById('sidebar-color-text').value = defaultSidebar;

    // Save 'default' values to Chrome storage
    chrome.storage.sync.set({'customprimary': 'default'});
    chrome.storage.sync.set({'customsecondary': 'default'});
    chrome.storage.sync.set({'customsidebar': 'default'});
  });

  // Display relevant elements
  title.style.display = 'block';
  mainoptions.style.display = 'block';
  customthemeoptions.style.display = 'none';
}

document.getElementById('save-custom-theme-button').onclick = function() {
  title.style.display = 'block';
  mainoptions.style.display = 'block';
  customthemeoptions.style.display = 'none';
}

/* Custom Font Buttons */
document.getElementById('pixelify-font').onclick = function() {
  chrome.storage.sync.set({'customfont' : 'Pixelify Sans'});
}
document.getElementById('kanit-font').onclick = function() {
  chrome.storage.sync.set({'customfont' : 'Kanit'});
}
document.getElementById('madimi-font').onclick = function() {
  chrome.storage.sync.set({'customfont' : 'Madimi One'});
}
document.getElementById('anta-font').onclick = function() {
  chrome.storage.sync.set({'customfont' : 'Anta'});
}
document.getElementById('comfortaa-font').onclick = function() {
  chrome.storage.sync.set({'customfont' : 'Comfortaa'});
}
document.getElementById('oswald-font').onclick = function() {
  chrome.storage.sync.set({'customfont' : 'Oswald'});
}
document.getElementById('rubik-font').onclick = function() {
  chrome.storage.sync.set({'customfont' : 'Rubik'});
}
document.getElementById('bebas-font').onclick = function() {
  chrome.storage.sync.set({'customfont' : 'Bebas Neue'});
}
document.getElementById('pacifico-font').onclick = function() {
  chrome.storage.sync.set({'customfont' : 'Pacifico'});
}
document.getElementById('lobster-font').onclick = function() {
  chrome.storage.sync.set({'customfont' : 'Lobster'});
}

// Menu Traversal for Font Options
document.getElementById('remove-font').onclick = function() {
  chrome.storage.sync.set({'customfont' : 'default'});
  title.style.display = 'block';
  mainoptions.style.display = 'block';
  fontoptions.style.display = 'none';
}
document.getElementById('save-font-options').onclick = function() {
  title.style.display = 'block';
  mainoptions.style.display = 'block';
  fontoptions.style.display = 'none';
}

/* Give Feeback Button */
document.getElementById("return-to-menu-options").onclick = function() {
  document.body.style.height = '370px';
  reportissueoptions.style.display = 'none';
  title.style.display = 'block';
  mainoptions.style.display = 'block';
}

// Function to apply custom theme to popup
function applyCustomThemeToPopup() {
  chrome.storage.sync.get(['sidebarColor', 'secondaryColor', 'primaryColor'], function(result) {
    var sidebarColor = result.sidebarColor;
    var secondaryColor = result.secondaryColor;
    var primaryColor = result.primaryColor;

    if (sidebarColor) {
      sidebarcolorPicker.value = sidebarColor;
      document.getElementById('sidebar-color-text').value = sidebarColor;
    } else {
      console.error("No sidebar color found in storage.");
      sidebarcolorPicker.value = "#102D70"; // Fallback color
      document.getElementById('sidebar-color-text').value = "#102D70"; // Fallback color
    }

    if (secondaryColor) {
      secondarycolorPicker.value = secondaryColor;
      document.getElementById('secondary-color-text').value = secondaryColor;
    } else {
      console.error("No secondary color found in storage.");
      secondarycolorPicker.value = "#FFFFFF"; // Fallback color
      document.getElementById('secondary-color-text').value = "#FFFFFF"; // Fallback color
    }

    if (primaryColor) {
      primarycolorPicker.value = primaryColor;
      document.getElementById('primary-color-text').value = primaryColor;
    } else {
      console.error("No primary color found in storage.");
      primarycolorPicker.value = "#1F1F1F"; // Fallback color
      document.getElementById('primary-color-text').value = "#1F1F1F"; // Fallback color
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  applyCustomThemeToPopup();
});

document.getElementById('primary-color-button').addEventListener('click', function() {
  var primaryColor = primarycolorPicker.value;
  chrome.storage.sync.set({'primaryColor': primaryColor}, function() {
    applyCustomThemeToPopup();
  });
});

document.getElementById('secondary-color-button').addEventListener('click', function() {
  var secondaryColor = secondarycolorPicker.value;
  chrome.storage.sync.set({'secondaryColor': secondaryColor}, function() {
    applyCustomThemeToPopup();
  });
});

document.getElementById('sidebar-color-button').addEventListener('click', function() {
  var sidebarColor = sidebarcolorPicker.value;
  chrome.storage.sync.set({'sidebarColor': sidebarColor}, function() {
    applyCustomThemeToPopup();
  });
});

function updateColor(input) {
  var color = input.value;
  var colorTextId = input.id.replace("-input", "-text");
  document.getElementById(colorTextId).value = color;
}
