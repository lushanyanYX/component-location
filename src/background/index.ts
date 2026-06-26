chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle-lock') {
    return;
  }

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = tabs[0]?.id;
  if (!tabId) {
    return;
  }

  await chrome.tabs.sendMessage(tabId, { type: 'CLOC_CLEAR_SELECTION' }).catch(() => undefined);
});
