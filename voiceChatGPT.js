class voiceChat {
  // Constructor function for the SpeechRecognition class
  constructor(textarea) {
    // Initialize the WebkitSpeechRecognition API
    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    // Set interimResults to true to get results even if the user is still speaking
    this.recognition.interimResults = true;
    // Initialize the speech synthesis API
    this.speechSynthesis = window.speechSynthesis;
    // Initialize a new MutationObserver to watch for changes in the DOM
    this.observer = new MutationObserver(this.onMutation.bind(this));

    // Initialize some variables to track the last spoken text and the number of utterances started and completed
    this.utterance = null;
    this.lastSpoken = "";
    this.utterancesStarted = 0;
    this.utterancesCompleted = 0;

    // Bind the other methods to the correct scope
    this.onResult = this.onResult.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.onMutation = this.onMutation.bind(this);
    this.onBoundary = this.onBoundary.bind(this);
    this.onSpeechEnd = this.onSpeechEnd.bind(this);

    // Store a reference to the textarea element
    this.textarea = textarea;

    this.start();
  }

  // This method is called whenever the speech recognition API receives a result
  onResult(event) {
    // Extract the transcript of the result and store it in the textarea
    const transcript = Array.from(event.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('');

    this.textarea.value = transcript;
  }

  // This method is called when the speech recognition API is finished listening
  onEnd(event) {
    // Get a reference to the submit button and click it
    const submitButton = this.textarea.nextElementSibling;
    this.lastSpoken = "";
    submitButton.click();
  }

  // This method is called whenever the mutation observer detects a change in the DOM
  onMutation(mutations) {
    // Loop through each mutation
    mutations.forEach(mutation => {
      // If a new node has been added to the DOM
      if (mutation.type === 'childList') {
        // Get the chatbot's response
        const chatbotResponse = mutation.addedNodes[0];
        // If the response exists, start observing it for changes
        if (chatbotResponse) {
          this.observer.observe(chatbotResponse, { childList: true, subtree: true, characterData: true, characterDataOldValue: true });
        }
      }
      // If the value of a node in the DOM has changed
      else if (mutation.type === 'characterData') {
        // Get the changed text
        const text = mutation.oldValue;
        // If the text exists and is different from the last spoken text
        if (text && text !== this.lastSpoken) {
		  // Get the changed text and remove the last spoken text from it
		  let t = text.replace(this.lastSpoken, '');
		  // If no utterance has been created yet, create a new one
		  if (!this.utterance) {
			this.utterance = new SpeechSynthesisUtterance();
			// Set the rate of the utterance to 2
			this.utterance.rate= 2;
			// Add an event listener for the boundary event, which is triggered when the utterance reaches a word boundary
			this.speechSynthesis.addEventListener('boundary', this.onBoundary);
			// Add an event listener for the end event, which is triggered when the utterance has finished being spoken
			this.utterance.addEventListener('end', this.onSpeechEnd);
		  }
		  // Add the new text to the utterance
		  this.utterance.text += t;
		  // Store the current text as the last spoken text
		  this.lastSpoken = text;
		  // If the speech synthesis API is not currently busy, start speaking the utterance
		  if (!this.speechSynthesis.pending) {
			this.utterance.text = t;
			// Increment the count of utterances started
			this.utterancesStarted += 1;
			// Start speaking the utterance
			this.speechSynthesis.speak(this.utterance);
		  }
		}
	  }
    });
  }

  onBoundary(event) {
	  // If the boundary event was triggered at a word boundary
	  if (event.name === 'word') {
		// Get the text of the utterance
		let t = event.utterance.text;
		// If the text contains a space, truncate it at the first space and add ellipses
		if (t.includes(' ')) {
		  t = t.substring(0, t.indexOf(' ')) + '...';
		}
		// Otherwise, just add ellipses to the end of the text
		else {
		  t += '...';
		}
		// Update the text of the utterance
		event.utterance.text = t;
		// Log the modified text of the utterance
		console.log('Modified utterance text:', event.utterance);
	  }
	}

	onSpeechEnd() {
	  console.warn("speech end");
	  // Increment the count of utterances completed
	  this.utterancesCompleted += 1;
	  // Get a reference to the count of utterances completed
	  let u = this.utterancesCompleted;
	  // Start listening again once all of the speech synthesis utterances are complete
	  setTimeout((() => {
		console.warn(u, this.utterancesStarted);
		if (this.utterancesStarted === u) {
		  // Restart the speech recognition API
		  this.recognition.start();
		}
	  }).bind(this), 1000);
	}

	start() {
	  // Add event listeners for the 'result' and 'end' events on the speech recognition API
	  this.recognition.addEventListener('result', this.onResult);
	  this.recognition.addEventListener('end', this.onEnd);
	  // Start listening for speech
	  this.recognition.start();

	  // Start observing the document body for changes in the DOM
	  this.observer.observe(document.body, { childList: true, subtree: true });
	}

	cancel(){
	    speechSynthesis.cancel();
	}
}

function listen(){
	const textarea = document.getElementsByTagName('textarea')[0];
	const recognition = new voiceChat(textarea);
}

listen();
