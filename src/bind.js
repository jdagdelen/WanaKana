import { makeOnInput, onComposition, trackListeners } from './utils/dom';
import { addDebugListeners } from './utils/logInputEvents';

const ELEMENTS = ['TEXTAREA', 'INPUT'];

let idCounter = 0;
const newId = () => {
  idCounter += 1;
  return `${Date.now()}${idCounter}`;
};

function bind(element = {}, options = {}, debug = false) {
  if (!ELEMENTS.includes(element.nodeName)) {
    throw new Error(
      `Element provided to Wanakana bind() was not a valid input or textarea element.\n Received: (${JSON.stringify(
        element
      )})`
    );
  }
  if (element.hasAttribute('data-wanakana-id')) {
    return;
  }

  let frontPart = '';
  let backPart = '';

  // Function to update front and back parts based on cursor position
  const updateParts = (element) => {
    const cursorPosition = element.selectionStart;
    frontPart = element.value.substring(0, cursorPosition);
    backPart = element.value.substring(cursorPosition);
  };

  // Modify the onInput function
  const onInput = (event) => {
    const currentValue = event.target.value;
    const cursorPosition = event.target.selectionStart;
    updateParts(event.target);

    // Extract the new text
    const newText = currentValue.substring(frontPart.length, currentValue.length - backPart.length);
    const convertedNewText = makeOnInput(options)(newText);

    // Reconstruct the entire string
    event.target.value = frontPart + convertedNewText + backPart;

    // Update cursor position
    const newCursorPosition = frontPart.length + convertedNewText.length;
    event.target.setSelectionRange(newCursorPosition, newCursorPosition);
  };

  // Event listener for cursor position update
  element.addEventListener('click', () => updateParts(element));
  element.addEventListener('keyup', () => updateParts(element));

  // Rest of the existing code for setting up attributes and listeners
  const id = newId();
  const attributes = [
    { name: 'data-wanakana-id', value: id },
    { name: 'lang', value: 'ja' },
    { name: 'autoCapitalize', value: 'none' },
    { name: 'autoCorrect', value: 'off' },
    { name: 'autoComplete', value: 'off' },
    { name: 'spellCheck', value: 'false' },
  ];
  const previousAttributes = {};
  attributes.forEach((attribute) => {
    previousAttributes[attribute.name] = element.getAttribute(attribute.name);
    element.setAttribute(attribute.name, attribute.value);
  });
  element.dataset.previousAttributes = JSON.stringify(previousAttributes);
  element.addEventListener('input', onInput);
  element.addEventListener('compositionupdate', onComposition);
  element.addEventListener('compositionend', onComposition);
  trackListeners(id, onInput, onComposition);
  if (debug === true) {
    addDebugListeners(element);
  }
}

export default bind;
