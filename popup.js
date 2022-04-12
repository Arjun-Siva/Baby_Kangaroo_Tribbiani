const thesButton = document.getElementById("thesaurus");
const pigButton = document.getElementById("pigLatin");
const meanButton = document.getElementById("meaning");


thesButton.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: changeWords,
  });
});

pigButton.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: pigLatinize,
  });
});

meanButton.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: findMeaning,
  });  
});


async function changeWords() {

  const url = chrome.runtime.getURL('data/thesaurus.json');
  const thes = await fetch(url).then(file => file.json());

  function replaceRec(element) {
    if (!(element instanceof HTMLScriptElement || element instanceof HTMLStyleElement)) {
      for (let node of element.childNodes) {
        switch (node.nodeType) {
          case Node.ELEMENT_NODE:
            replaceRec(node);
            break;
          case Node.TEXT_NODE:
            node.textContent = node.textContent.replace(/[A-Z]{0,1}[a-z]{4,}/g, (w) => {
              const meaning = thes[w.toLowerCase()];

              if (meaning) {
                var mean = meaning[Math.floor(Math.random() * meaning.length)];
                console.log(`${w} - ${mean}`)
                return mean;
              }
              else
                return w;
            });
            break;
          case Node.DOCUMENT_NODE:
            replaceRec(node);
        }
      }
    }
  }

  replaceRec(document.body);

}

function pigLatinize() {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  function replaceRec(element) {
    if (!(element instanceof HTMLScriptElement || element instanceof HTMLStyleElement)) {
      for (let node of element.childNodes) {
        switch (node.nodeType) {
          case Node.ELEMENT_NODE:
            replaceRec(node);
            break;
          case Node.TEXT_NODE:
            node.textContent = node.textContent.replace(/[A-Z]{0,1}[a-z]{1,}/g, (w) => {
              w = w.toLowerCase();

              if (w.length == 1) {
                if (vowels.includes(w[0]))
                  return w + "way";
                else
                  return w + "ay";
              }

              else if (!vowels.includes(w[0]) && vowels.includes(w[1])) {
                return w.substr(1,) + w[0] + "ay";
              }

              else if (!vowels.includes(w[0]) && !vowels.includes(w[1])) {
                return w.substr(2,) + w.substr(0, 2) + "ay";
              }

              else if (vowels.includes(w[0])) {
                return w + "way";
              }

            });
            break;
          case Node.DOCUMENT_NODE:
            replaceRec(node);
        }
      }
    }
  }

  replaceRec(document.body);
}


function findMeaning() {
  var words = window.getSelection().toString();
  const word = words.split(" ")[0];
  if (word){
    window.open("https://www.dictionary.com/browse/"+word);
  }
}