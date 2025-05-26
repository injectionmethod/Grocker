document.addEventListener('DOMContentLoaded', () => {
  // Load saved settings
  chrome.storage.sync.get([
    'grockerActive',
    'excludeFollowers',
    'blockOtherBots',
    'customBotList'
  ], (data) => {
    document.getElementById('runGrocker').textContent = data.grockerActive ? 'Stop Grocker' : 'Run Grocker';
    document.getElementById('excludeFollowers').checked = data.excludeFollowers || false;
    document.getElementById('blockOtherBots').checked = data.blockOtherBots || false;
    document.getElementById('customBotList').value = (data.customBotList || []).join('\n');
  });


  document.getElementById('runGrocker').addEventListener('click', () => {
    chrome.storage.sync.get(['grockerActive'], (data) => {
      const newState = !data.grockerActive;
      chrome.storage.sync.set({ grockerActive: newState }, () => {
        chrome.runtime.sendMessage({ action: newState ? 'startGrocker' : 'stopGrocker' });
        document.getElementById('runGrocker').textContent = newState ? 'Stop Grocker' : 'Run Grocker';
      });
    });
  });

  document.getElementById('excludeFollowers').addEventListener('change', (e) => {
    chrome.storage.sync.set({ excludeFollowers: e.target.checked });
  });


  document.getElementById('blockOtherBots').addEventListener('change', (e) => {
    chrome.storage.sync.set({ blockOtherBots: e.target.checked });
  });


  document.getElementById('customBotList').addEventListener('input', (e) => {
    const list = e.target.value
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
    chrome.storage.sync.set({ customBotList: list });
  });


  document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const importedBots = text
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

      chrome.storage.sync.get(['customBotList'], (data) => {
        const currentList = data.customBotList || [];
        const combinedList = Array.from(new Set([...currentList, ...importedBots]));
        chrome.storage.sync.set({ customBotList: combinedList }, () => {
          document.getElementById('customBotList').value = combinedList.join('\n');
        });
      });
    };
    reader.readAsText(file);

    event.target.value = '';
  });
});
