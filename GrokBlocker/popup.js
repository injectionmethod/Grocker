document.addEventListener('DOMContentLoaded', () => {
  try {
    const runButton = document.getElementById('runGrocker');
    const excludeCheckbox = document.getElementById('excludeFollowers');
    const blockOtherBotsCheckbox = document.getElementById('blockOtherBots');
    const botListTextarea = document.getElementById('botList');

    chrome.storage.sync.get(
      ['excludeFollowers', 'grockerActive', 'blockOtherBots', 'customBotList'],
      (data) => {
        try {
          excludeCheckbox.checked = data.excludeFollowers || false;
          blockOtherBotsCheckbox.checked = data.blockOtherBots || false;
          botListTextarea.value = (data.customBotList || []).join('\n');
          botListTextarea.disabled = !blockOtherBotsCheckbox.checked;
          runButton.textContent = data.grockerActive ? 'Stop Grocker' : 'Run Grocker';
        } catch (innerErr) {
          // suppress inner errors here
          console.warn('Error setting initial popup state:', innerErr);
        }
      }
    );

    excludeCheckbox.addEventListener('change', () => {
      try {
        chrome.storage.sync.set({ excludeFollowers: excludeCheckbox.checked });
      } catch (e) {
        // suppress error
        console.warn('Error saving excludeFollowers:', e);
      }
    });

    blockOtherBotsCheckbox.addEventListener('change', () => {
      try {
        chrome.storage.sync.set({ blockOtherBots: blockOtherBotsCheckbox.checked });
        botListTextarea.disabled = !blockOtherBotsCheckbox.checked;
      } catch (e) {
        console.warn('Error saving blockOtherBots:', e);
      }
    });

    botListTextarea.addEventListener('input', () => {
      try {
        const bots = botListTextarea.value
          .split('\n')
          .map((line) => line.trim().toLowerCase())
          .filter((line) => line.startsWith('@') && line.length > 1);
        chrome.storage.sync.set({ customBotList: bots });
      } catch (e) {
        console.warn('Error saving customBotList:', e);
      }
    });

    runButton.addEventListener('click', () => {
      try {
        chrome.storage.sync.get(['grockerActive'], (data) => {
          try {
            const newState = !data.grockerActive;
            chrome.storage.sync.set({ grockerActive: newState }, () => {
              runButton.textContent = newState ? 'Stop Grocker' : 'Run Grocker';

              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                  action: newState ? 'startGrocker' : 'stopGrocker',
                });
              });
            });
          } catch (innerErr) {
            console.warn('Error toggling Grocker state:', innerErr);
          }
        });
      } catch (e) {
        console.warn('Error handling runButton click:', e);
      }
    });
  } catch (e) {
    console.warn('Error initializing popup:', e);
  }
});
